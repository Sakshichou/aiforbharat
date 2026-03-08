from fastapi import APIRouter, Depends, HTTPException
from app.schemas.ai import AnalyzeReportRequest, AnalyzeReportResponse
from app.services.bedrock_service import BedrockService
from app.core.auth import get_current_user

router = APIRouter()
bedrock_service = BedrockService()

@router.post("/analyze-report", response_model=AnalyzeReportResponse)
def analyze_report(
    request: AnalyzeReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Receives text/transcription, calls Amazon Bedrock (Claude Sonnet 4.5) 
    to classify the issue into categories.
    """
    result = bedrock_service.classify_issue(request.text)
    
    if "Failed" in result.get("reasoning", "") and result.get("confidence") == 0.0:
        raise HTTPException(status_code=500, detail="Failed to analyze report with AI.")
        
    return AnalyzeReportResponse(
        category=result["category"],
        confidence=result.get("confidence", 1.0),
        reasoning=result.get("reasoning", "")
    )
