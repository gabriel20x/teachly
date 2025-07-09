import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from app.chat.manager import manager
from app.db.database import get_db
from app.models.message import Message
from app.models.user import User
from datetime import datetime

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

                # Mark as delivered
                new_msg.delivered_at = datetime.utcnow()
                db.commit()

                await manager.send_personal_message(
                    json.dumps(
                        {
                            "event": "message_delivered",
                            "message_id": new_msg.id,
                            "delivered_at": new_msg.delivered_at.isoformat(),
                        }
                    ),
                    user_id,
                )

            elif event == "message_seen":
                message_id = data_json["message_id"]
                message = db.query(Message).get(message_id)
                if message and message.to_id == int(user_id):
                    message.seen_at = datetime.utcnow()
                    db.commit()

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
        }
        for m in messages
    ]
