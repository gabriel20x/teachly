import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.database import Base, engine
from app.auth import routes as auth_routes
from fastapi.middleware.cors import CORSMiddleware
from app.chat import routes as chat_routes
from sqlalchemy.exc import OperationalError

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully")
            break
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"Database connection failed (attempt {attempt + 1}/{max_retries}). Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print("Failed to connect to database after all retries")
                raise e
    
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