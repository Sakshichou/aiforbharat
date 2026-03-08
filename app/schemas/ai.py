from pydantic import BaseModel

class AnalyzeReportRequest(BaseModel):
    text: str

class AnalyzeReportResponse(BaseModel):
    category: str
    confidence: float
    reasoning: str
