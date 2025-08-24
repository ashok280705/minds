from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
import uuid
import os
from datetime import datetime
from schemas import PatientBundle, ImageInfo
from transformers import AutoTokenizer, AutoModel
import torch

app = FastAPI(title="Data Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Bio_ClinicalBERT model
tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")

def process_clinical_text(text: str) -> dict:
    """Process clinical text using Bio_ClinicalBERT to generate embeddings and summary."""
    if not text or not text.strip():
        return {"embeddings": None, "summary": "No text provided"}
    
    # Tokenize and get embeddings
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        # Use mean pooling of last hidden states as text embedding
        embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
    
    # Generate simple summary (first 100 chars)
    summary = text[:100] + "..." if len(text) > 100 else text
    
    return {
        "embeddings": embeddings,
        "summary": summary,
        "embedding_dim": len(embeddings)
    }

def generate_clinical_summary(patient_note: str, patient_structured: dict) -> str:
    """Generate clinical summary from patient note and structured data."""
    summary_parts = []
    
    if patient_structured:
        # Extract key demographics
        age = patient_structured.get('age')
        gender = patient_structured.get('gender')
        if age or gender:
            demo = f"{age}yo {gender}" if age and gender else f"{age}yo" if age else f"{gender}"
            summary_parts.append(demo)
    
    if patient_note and patient_note.strip():
        # Extract key clinical info (simplified)
        note_lower = patient_note.lower()
        if 'chest pain' in note_lower:
            summary_parts.append('chest pain')
        if 'shortness of breath' in note_lower or 'dyspnea' in note_lower:
            summary_parts.append('dyspnea')
        if 'hypertension' in note_lower or 'high blood pressure' in note_lower:
            summary_parts.append('HTN')
        if 'diabetes' in note_lower:
            summary_parts.append('DM')
        
        # If no specific conditions found, use first sentence
        if len(summary_parts) <= 1:
            first_sentence = patient_note.split('.')[0][:50]
            summary_parts.append(first_sentence)
    
    return ' - '.join(summary_parts) if summary_parts else 'Clinical data provided'

# Mount storage directory as static files
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

STORAGE_DIR = "storage"

@app.post("/ingest", response_model=PatientBundle)
async def ingest_patient_data(
    patient_note: Optional[str] = Form(None),
    patient_json_text: Optional[str] = Form(None),
    images: List[UploadFile] = File([])
):
    # Validate at least one input is provided
    if not patient_note and not patient_json_text and not images:
        raise HTTPException(
            status_code=400, 
            detail={"error": "At least one of patient_note, patient_json_text, or images must be provided"}
        )
    
    # Validate patient_note is not empty
    if patient_note is not None and patient_note.strip() == "":
        raise HTTPException(
            status_code=400,
            detail={"error": "patient_note cannot be empty"}
        )
    
    request_id = str(uuid.uuid4())
    content_types = []
    
    # Validate and parse patient JSON
    patient_structured = None
    if patient_json_text:
        if patient_json_text.strip() == "":
            raise HTTPException(
                status_code=400,
                detail={"error": "patient_json_text cannot be empty"}
            )
        try:
            patient_structured = json.loads(patient_json_text)
            content_types.append("structured_data")
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400, 
                detail={"error": f"Invalid JSON in patient_json_text: {str(e)}"}
            )
    
    # Add content types
    if patient_note and patient_note.strip():
        content_types.append("text_note")
    
    # Process patient note with Bio_ClinicalBERT
    patient_embeddings = None
    if patient_note and patient_note.strip():
        patient_embeddings = process_clinical_text(patient_note)
    
    # Generate clinical summary
    patient_summary = generate_clinical_summary(patient_note, patient_structured)
    
    # Process images
    image_infos = []
    if images:
        # Filter out empty uploads
        valid_images = [img for img in images if img.filename]
        if not valid_images:
            raise HTTPException(
                status_code=400,
                detail={"error": "No valid images provided"}
            )
        
        content_types.append("images")
        request_dir = os.path.join(STORAGE_DIR, request_id)
        os.makedirs(request_dir, exist_ok=True)
        
        for image in valid_images:
            if not image.content_type or image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
                raise HTTPException(
                    status_code=400, 
                    detail={"error": f"Unsupported image format '{image.content_type}'. Only JPEG and PNG are supported"}
                )
            
            file_path = os.path.join(request_dir, image.filename)
            with open(file_path, "wb") as f:
                content = await image.read()
                f.write(content)
            
            image_infos.append(ImageInfo(
                filename=image.filename,
                uri=f"/storage/{request_id}/{image.filename}",
                mime_type=image.content_type
            ))
    
    return PatientBundle(
        request_id=request_id,
        created_at=datetime.now(),
        content_types=content_types,
        patient_note=patient_note,
        patient_structured=patient_structured,
        images=image_infos,
        patient_embeddings=patient_embeddings,
        patient_summary=patient_summary
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)