from fastapi import WebSocket
from typing import Dict, List, Optional
import asyncio
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_info: Dict[str, dict] = {}  # Store user info for connected users

    async def connect(self, user_id: str, websocket: WebSocket, user_info: Optional[dict] = None):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        
        # Store user info if provided
        if user_info:
            self.user_info[user_id] = {
                **user_info,
                "connected_at": datetime.utcnow().isoformat(),
                "status": "online"
            }
        
        # Broadcast user connected event
        await self.broadcast_json({
            "event": "user_connected",
            "user_id": user_id,
            "user_info": self.user_info.get(user_id, {}),
            "connected_users": self.get_connected_users()
        })

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        self.user_info.pop(user_id, None)

    async def send_personal_message(self, message: str, user_id: str):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_text(message)
            except Exception:
                # Remove disconnected user
                self.disconnect(user_id)

    async def broadcast_json(self, data: dict):
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(data))
            except Exception:
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    def get_connected_users(self) -> List[dict]:
        """Return list of connected users with their info"""
        return [
            {
                "user_id": user_id,
                **user_info
            }
            for user_id, user_info in self.user_info.items()
            if user_id in self.active_connections
        ]

    def is_user_connected(self, user_id: str) -> bool:
        """Check if a specific user is connected"""
        return user_id in self.active_connections

    def get_connected_users_count(self) -> int:
        """Get the number of connected users"""
        return len(self.active_connections)

    async def update_user_info(self, user_id: str, user_info: dict):
        """Update user information for a connected user"""
        if user_id in self.active_connections:
            self.user_info[user_id] = {
                **self.user_info.get(user_id, {}),
                **user_info,
                "last_updated": datetime.utcnow().isoformat()
            }
            
            # Broadcast updated user list
            await self.broadcast_json({
                "event": "users_updated",
                "connected_users": self.get_connected_users()
            })

manager = ConnectionManager()
