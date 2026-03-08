from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.db.models import ReportStatus

class ReportCreate(BaseModel):
    ward_area: str
    description: str
    lat: float
    lng: float
    evidence_url: Optional[str] = None
    ai_category: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: UUID
    user_id: str
    ward_area: str
    description: str
    lat: float
    lng: float
    confirmations: int
    ai_category: Optional[str]
    status: ReportStatus
    evidence_url: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
