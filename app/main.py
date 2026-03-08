from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.db.database import Base, engine
from app.api.endpoints import reports, ai, s3, ws
from app.core.config import settings

# Create database tables directly (for production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Integration"])
app.include_router(s3.router, prefix="/api/s3", tags=["S3 Storage"])
app.include_router(ws.router, prefix="/api/ws", tags=["WebSockets"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} API is running."}

# Mangum wrapper for AWS Lambda integration
handler = Mangum(app)
