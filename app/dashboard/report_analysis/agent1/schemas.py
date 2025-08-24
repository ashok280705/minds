from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ImageInfo(BaseModel):
    filename: str
    uri: str
    mime_type: str

class PatientBundle(BaseModel):
    request_id: str
    created_at: datetime
    content_types: List[str]
    patient_note: Optional[str] = None
    patient_structured: Optional[dict] = None
    images: List[ImageInfo] = []
    patient_embeddings: Optional[dict] = None
    patient_summary: Optional[str] = None