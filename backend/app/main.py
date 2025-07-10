import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from app.db.database import Base, engine
from app.auth import routes as auth_routes
from fastapi.middleware.cors import CORSMiddleware
from app.chat import routes as chat_routes
from sqlalchemy.exc import OperationalError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

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

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
@limiter.limit("10/minute")
def health_check(request: Request):
    return {"status": "ok"}