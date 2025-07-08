import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.chat.manager import manager
from app.db.database import get_db
from app.models.message import Message

chat_router = APIRouter()

@chat_router.websocket("/ws/chat/{user_id}")
async def chat(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)

            # Estructura esperada del mensaje: {"to": "2", "message": "Hola"}
            to_id = data_json["to"]
            content = data_json["message"]

            # Guardar en la base de datos
            new_msg = Message(from_id=int(user_id), to_id=int(to_id), content=content)
            db.add(new_msg)
            db.commit()

            # Enviar al destinatario si está conectado
            await manager.send_personal_message(json.dumps({
                "from": user_id,
                "message": content
            }), to_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)

@chat_router.get("/history/{user1_id}/{user2_id}")
def get_chat_history(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        ((Message.from_id == user1_id) & (Message.to_id == user2_id)) |
        ((Message.from_id == user2_id) & (Message.to_id == user1_id))
    ).order_by(Message.timestamp.asc()).all()

    return [
        {
            "id": m.id,
            "from": m.from_id,
            "to": m.to_id,
            "message": m.content,
            "timestamp": m.timestamp.isoformat()
        } for m in messages
    ]
