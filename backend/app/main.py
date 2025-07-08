from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.database import Base, engine
from app.auth import routes as auth_routes
from fastapi.middleware.cors import CORSMiddleware
from app.chat import routes as chat_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown (if needed)

app = FastAPI(lifespan=lifespan)

app.include_router(auth_routes.router)
app.include_router(chat_routes.chat_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}