from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
import os
import httpx 

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
async def login_with_google(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    id_token = body.get("credential")  # what Google sends from frontend

    if not id_token:
        raise HTTPException(status_code=400, detail="Missing ID token")

    try:
        # Verify token with Google
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            payload = response.json()

        if payload["aud"] != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=403, detail="Invalid audience")

        # Save or update user
        user = db.query(User).filter_by(google_id=payload["sub"]).first()
        if not user:
            user = User(
                google_id=payload["sub"],
                name=payload["name"],
                avatar_url=payload.get("picture"),
            )
            db.add(user)
        else:
            user.name = payload["name"]
            user.avatar_url = payload.get("picture")
        db.commit()

        return {
            "id": user.id,
            "name": user.name,
            "avatar_url": user.avatar_url,
            "google_id": user.google_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
