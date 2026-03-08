import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.s3_service import S3Service
from app.core.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()
s3_service = S3Service()

class PresignedUrlResponse(BaseModel):
    url: str
    object_key: str

@router.get("/generate-presigned-url", response_model=PresignedUrlResponse)
def generate_presigned_url(
    filename: str = Query(..., description="Name of the file to be uploaded"),
    file_type: str = Query(..., description="MIME type of the file (e.g., video/mp4)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a presigned URL to upload evidence files directly to S3.
    """
    # Construct a unique object key using user_id and a UUID
    object_key = f"evidence/{current_user['user_id']}/{uuid.uuid4()}_{filename}"
    
    url = s3_service.generate_presigned_upload_url(
        object_name=object_key,
        file_type=file_type
    )
    
    if not url:
        raise HTTPException(status_code=500, detail="Could not generate presigned URL")
        
    return PresignedUrlResponse(url=url, object_key=object_key)
