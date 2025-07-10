import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from app.chat.manager import manager
from app.db.database import get_db
from app.models.message import Message
from app.models.user import User
from datetime import datetime, timedelta

chat_router = APIRouter()


@chat_router.websocket("/ws/chat/{user_id}")
async def chat(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    # Get user info from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        await websocket.close(code=4004, reason="User not found")
        return
    
    user_info = {
        "id": user.id,
        "name": user.name,
        "avatar_url": user.avatar_url,
        "google_id": user.google_id
    }
    
    await manager.connect(user_id, websocket, user_info)
    
    # Deliver pending messages when user connects
    pending_messages = db.query(Message).filter(
        Message.to_id == int(user_id),
        Message.delivered_at.is_(None)
    ).all()
    
    print(f"[PENDING] User {user_id} connected, found {len(pending_messages)} pending messages")
    
    if pending_messages:
        # Mark all as delivered with unique timestamps
        base_time = datetime.utcnow()
        for i, msg in enumerate(pending_messages):
            msg.delivered_at = base_time + timedelta(microseconds=i)
        
        # Commit all changes at once
        db.commit()
        print(f"[PENDING] Marked {len(pending_messages)} messages as delivered at {base_time}")
    
    for msg in pending_messages:
        print(f"[PENDING] Delivering pending message {msg.id} from {msg.from_id} to {user_id}")
        
        # Send the pending message
        await manager.send_personal_message(
            json.dumps(
                {
                    "event": "new_message",
                    "from": str(msg.from_id),
                    "message_id": msg.id,
                    "message": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                }
            ),
            user_id,
        )
        
        # Notify sender that message was delivered
        if manager.is_user_connected(str(msg.from_id)):
            print(f"[PENDING] Notifying sender {msg.from_id} that message {msg.id} was delivered")
            await manager.send_personal_message(
                json.dumps(
                    {
                        "event": "message_delivered",
                        "message_id": msg.id,
                        "timestamp": msg.timestamp.isoformat(),
                        "delivered_at": msg.delivered_at.isoformat(),
                    }
                ),
                str(msg.from_id),
            )
    
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)
            event = data_json.get("event", "message")

            if event == "message":
                to_id = data_json["to"]
                content = data_json["message"]

                new_msg = Message(
                    from_id=int(user_id), to_id=int(to_id), content=content
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                print(f"[MESSAGE] User {user_id} sent message {new_msg.id} to {to_id} at {new_msg.timestamp}")

                # Send confirmation to sender with server timestamp
                await manager.send_personal_message(
                    json.dumps(
                        {
                            "event": "message_sent",
                            "message_id": new_msg.id,
                            "to": to_id,
                            "message": content,
                            "timestamp": new_msg.timestamp.isoformat(),
                        }
                    ),
                    user_id,
                )

                # Check if receiver is connected
                is_connected = manager.is_user_connected(to_id)
                print(f"[DELIVERY_CHECK] User {to_id} is connected: {is_connected}")
                
                if is_connected:
                    print(f"[DELIVERY] Delivering message {new_msg.id} immediately to {to_id}")
                    
                    # Notify the receiver
                    await manager.send_personal_message(
                        json.dumps(
                            {
                                "event": "new_message",
                                "from": user_id,
                                "message_id": new_msg.id,
                                "message": content,
                                "timestamp": new_msg.timestamp.isoformat(),
                            }
                        ),
                        to_id,
                    )

                    # Mark as delivered only if receiver is connected
                    new_msg.delivered_at = datetime.utcnow()
                    db.commit()

                    print(f"[DELIVERY] Message {new_msg.id} marked as delivered at {new_msg.delivered_at}")

                    # Notify sender that message was delivered
                    await manager.send_personal_message(
                        json.dumps(
                            {
                                "event": "message_delivered",
                                "message_id": new_msg.id,
                                "timestamp": new_msg.timestamp.isoformat(),
                                "delivered_at": new_msg.delivered_at.isoformat(),
                            }
                        ),
                        user_id,
                    )
                else:
                    print(f"[DELIVERY] User {to_id} not connected, message {new_msg.id} will be delivered later")
                    # Receiver is not connected, message will be delivered when they connect
                    pass

            elif event == "message_seen":
                message_id = data_json["message_id"]
                message = db.query(Message).get(message_id)
                if message and message.to_id == int(user_id):
                    message.seen_at = datetime.utcnow()
                    db.commit()

                    # Notify sender that message was seen
                    if manager.is_user_connected(str(message.from_id)):
                        await manager.send_personal_message(
                            json.dumps(
                                {
                                    "event": "message_seen",
                                    "message_id": message.id,
                                    "seen_at": message.seen_at.isoformat(),
                                }
                            ),
                            str(message.from_id),
                        )
                        
            elif event == "mark_messages_seen":
                # Mark all messages from a specific user as seen
                from_user_id = data_json["from_user_id"]
                messages = db.query(Message).filter(
                    Message.from_id == int(from_user_id),
                    Message.to_id == int(user_id),
                    Message.seen_at.is_(None)
                ).all()
                
                # Mark each message with its own timestamp (with small increments to ensure uniqueness)
                base_time = datetime.utcnow()
                for i, message in enumerate(messages):
                    # Add microseconds to ensure each message has a unique timestamp
                    message.seen_at = base_time + timedelta(microseconds=i)
                
                # Commit all changes at once
                db.commit()
                
                # Notify sender for each message that was seen
                for message in messages:
                    if manager.is_user_connected(str(message.from_id)):
                        await manager.send_personal_message(
                            json.dumps(
                                {
                                    "event": "message_seen",
                                    "message_id": message.id,
                                    "seen_at": message.seen_at.isoformat(),
                                }
                            ),
                            str(message.from_id),
                        )

            elif event == "typing":
                to_id = data_json["to"]
                is_typing = data_json["is_typing"]
                await manager.send_personal_message(
                    json.dumps(
                        {"event": "typing", "from": user_id, "is_typing": is_typing}
                    ),
                    to_id,
                )

            elif event == "get_connected_users":
                # Send current connected users to the requesting user
                await manager.send_personal_message(
                    json.dumps({
                        "event": "connected_users",
                        "users": manager.get_connected_users()
                    }),
                    user_id
                )

    except WebSocketDisconnect:
        manager.disconnect(user_id)
        await manager.broadcast_json(
            {"event": "user_disconnected", "user_id": user_id, "connected_users": manager.get_connected_users()}
        )


@chat_router.get("/connected-users")
def get_connected_users():
    """Get list of currently connected users"""
    return {
        "connected_users": manager.get_connected_users(),
        "total_count": manager.get_connected_users_count()
    }


@chat_router.get("/connected-users/{user_id}")
def is_user_connected(user_id: str):
    """Check if a specific user is connected"""
    return {
        "user_id": user_id,
        "is_connected": manager.is_user_connected(user_id)
    }


@chat_router.get("/history/{user1_id}/{user2_id}")
def get_chat_history(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(
            ((Message.from_id == user1_id) & (Message.to_id == user2_id))
            | ((Message.from_id == user2_id) & (Message.to_id == user1_id))
        )
        .order_by(Message.timestamp.asc())
        .all()
    )

    return [
        {
            "id": m.id,
            "from": m.from_id,
            "to": m.to_id,
            "message": m.content,
            "timestamp": m.timestamp.isoformat(),
            "delivered_at": m.delivered_at.isoformat() if m.delivered_at else None,
            "seen_at": m.seen_at.isoformat() if m.seen_at else None,
        }
        for m in messages
    ]
