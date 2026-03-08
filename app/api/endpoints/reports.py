from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Report
from app.schemas.report import ReportCreate, ReportResponse
from app.core.auth import get_current_user
from app.api.endpoints.ws import manager

router = APIRouter()

@router.post("/", response_model=ReportResponse)
async def create_report(
    report: ReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new report under the logged in user's profile.
    """
    new_report = Report(
        user_id=current_user["user_id"],
        ward_area=report.ward_area,
        description=report.description,
        lat=report.lat,
        lng=report.lng,
        evidence_url=report.evidence_url,
        ai_category=report.ai_category
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Broadcast new report asynchronously
    report_dict = {
        "id": str(new_report.report_id),
        "description": new_report.description,
        "location": {"lat": new_report.lat, "lng": new_report.lng},
        "language": "en",
        "timestamp": int(new_report.timestamp.timestamp() * 1000) if new_report.timestamp else 0,
        "status": new_report.status,
        "confirmations": new_report.confirmations,
    }
    background_tasks.add_task(manager.broadcast, {"type": "NEW_REPORT", "payload": report_dict})
    
    return new_report

@router.get("/my", response_model=list[ReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve reports created by the current user.
    """
    reports = db.query(Report).filter(Report.user_id == current_user["user_id"]).order_by(Report.timestamp.desc()).all()
    return reports

@router.get("/all", response_model=list[ReportResponse])
def get_all_reports(db: Session = Depends(get_db)):
    """
    Retrieve all reports for the global integrity feed.
    """
    reports = db.query(Report).order_by(Report.timestamp.desc()).limit(100).all()
    return reports

@router.post("/{report_id}/confirm")
async def confirm_report(
    report_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Simulate verifying/confirming a report by incrementing its confirmation count.
    Broadcasts the update so the UI updates instantly.
    """
    report = db.query(Report).filter(Report.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.confirmations += 1
    db.commit()
    
    # Broadcast confirmation event
    background_tasks.add_task(manager.broadcast, {
        "type": "REPORT_CONFIRMED", 
        "reportId": report_id, 
        "confirmations": report.confirmations
    })
    
    return {"success": True, "confirmations": report.confirmations}
