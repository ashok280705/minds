# Data Agent (Agent 1)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Run Server

```bash
python run.py
```

Server will start on `http://localhost:8001`
API documentation available at `http://localhost:8001/docs`

## API Endpoints

- **POST /ingest**: Accepts patient data and normalizes into PatientBundle
- **GET /health**: Health check

## Testing

### Using curl

**Basic test:**
```bash
curl -X POST "http://localhost:8001/ingest" \
  -F "patient_note=Patient complains of chest pain and shortness of breath"
```

**With JSON data:**
```bash
curl -X POST "http://localhost:8001/ingest" \
  -F "patient_note=Patient complains of chest pain" \
  -F "patient_json_text={\"age\": 45, \"gender\": \"M\", \"blood_pressure\": \"140/90\"}"
```

**With images:**
```bash
curl -X POST "http://localhost:8001/ingest" \
  -F "patient_note=Patient complains of chest pain" \
  -F "patient_json_text={\"age\": 45, \"gender\": \"M\"}" \
  -F "images=@xray.jpg" \
  -F "images=@mri.png"
```

### Using Postman

1. Set method to **POST**
2. URL: `http://localhost:8001/ingest`
3. Body type: **form-data**
4. Add fields:
   - `patient_note` (Text): "Patient complains of chest pain"
   - `patient_json_text` (Text): `{"age": 45, "gender": "M"}`
   - `images` (File): Select image files (jpg/png)

### Expected Response

```json
{
  "request_id": "uuid-string",
  "created_at": "2024-01-01T12:00:00",
  "content_types": ["text_note", "structured_data", "images"],
  "patient_note": "Patient complains of chest pain",
  "patient_structured": {"age": 45, "gender": "M"},
  "images": [
    {
      "filename": "xray.jpg",
      "uri": "/storage/uuid-string/xray.jpg",
      "mime_type": "image/jpeg"
    }
  ]
}
```