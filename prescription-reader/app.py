from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import torch
from PIL import Image
from transformers import VisionEncoderDecoderModel, DonutProcessor, pipeline
import io
import base64
import json

app = Flask(__name__)
CORS(app)

# Global variables for models
processor = None
donut_model = None
classifier = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def initialize_models():
    """Initialize the OCR and classification models"""
    global processor, donut_model, classifier
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    donut_model_path = os.path.join(current_dir, "model")
    
    try:
        if os.path.exists(donut_model_path):
            print("Loading Donut OCR model...")
            processor = DonutProcessor.from_pretrained(donut_model_path)
            donut_model = VisionEncoderDecoderModel.from_pretrained(donut_model_path)
            donut_model.to(device)
            donut_model.eval()
            print("✅ Donut model loaded successfully")
        else:
            print("❌ Model not found. Please run: python model_download.py")
            return False
            
        print("Loading classification model...")
        classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=0 if device == "cuda" else -1)
        print("✅ Classification model loaded successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False

def extract_text_from_image(image):
    """Extract text from image using Donut OCR model"""
    if processor is None or donut_model is None:
        return "Models not loaded"
        
    try:
        image = image.convert("RGB")
        encoding = processor(images=image, return_tensors="pt").to(device)
        
        with torch.no_grad():
            generated_ids = donut_model.generate(
                encoding.pixel_values, 
                max_length=512, 
                num_beams=1,
                early_stopping=True,
                decoder_start_token_id=processor.tokenizer.convert_tokens_to_ids("<s_ocr>")
            )
        
        generated_text = processor.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        return generated_text
        
    except Exception as e:
        print(f"OCR Error: {e}")
        return f"Error extracting text: {str(e)}"

def extract_medicine_info(text):
    """Extract medicine name, dosage, and frequency from prescription text"""
    import re
    
    medicines = []
    
    # Clean the text first
    text = re.sub(r'Ph\.[+]\d+.*|Web:.*|Email:.*', '', text)  # Remove contact info
    text = re.sub(r'[−-]', '-', text)  # Normalize dashes
    
    # Split by common separators and process each potential medicine
    parts = re.split(r'[.,;]|(?=\b[A-Z][a-z]+)', text)
    
    for part in parts:
        part = part.strip()
        if len(part) < 3:  # Skip very short parts
            continue
            
        # Skip non-medicine text
        if any(skip in part.lower() for skip in ['web:', 'email:', 'ph.', 'www.', '.com', 'massage']):
            continue
            
        # Look for medicine patterns
        # Pattern 1: Medicine name followed by dosage and frequency
        pattern1 = r'([A-Za-z][A-Za-z0-9]*(?:[A-Za-z]+)?)\s*([0-9]+\s*mg|[0-9]+mg)\s*(.*)'
        match1 = re.search(pattern1, part, re.IGNORECASE)
        
        if match1:
            name = match1.group(1).strip()
            dosage = match1.group(2).strip()
            freq_part = match1.group(3).strip()
            
            # Clean medicine name
            name = re.sub(r'^(Tat\.|Tab\.)', '', name).strip()
            
            # Extract frequency pattern (like "1-0-1 x5days" or "before meals")
            frequency = 'As directed'
            if re.search(r'\d+\s*-\s*\d+\s*-\s*\d+', freq_part):
                freq_match = re.search(r'(\d+\s*-\s*\d+\s*-\s*\d+.*?)(?=\s|$)', freq_part)
                if freq_match:
                    frequency = freq_match.group(1).strip()
            elif 'before' in freq_part.lower():
                frequency = 'Before meals'
            elif 'after' in freq_part.lower():
                frequency = 'After meals'
            elif 'daily' in freq_part.lower():
                frequency = 'Daily'
            elif freq_part:
                frequency = freq_part[:30]  # Limit length
                
            medicines.append({
                'name': name,
                'dosage': dosage,
                'frequency': frequency
            })
            
        else:
            # Pattern 2: Look for standalone medicine names
            medicine_match = re.search(r'\b([A-Z][a-z]+(?:[A-Z][a-z]*)*(?:\d+)?)\b', part)
            if medicine_match:
                name = medicine_match.group(1)
                
                # Skip common non-medicine words
                if name.lower() in ['before', 'after', 'meals', 'days', 'week', 'paint', 'massage', 'gum']:
                    continue
                    
                # Look for dosage in the same part
                dosage_match = re.search(r'(\d+\s*mg|\d+mg)', part, re.IGNORECASE)
                dosage = dosage_match.group(1) if dosage_match else 'Not specified'
                
                # Look for frequency
                frequency = 'As directed'
                if re.search(r'\d+\s*-\s*\d+\s*-\s*\d+', part):
                    freq_match = re.search(r'(\d+\s*-\s*\d+\s*-\s*\d+.*?)(?=\s|$)', part)
                    if freq_match:
                        frequency = freq_match.group(1).strip()
                elif 'before' in part.lower():
                    frequency = 'Before meals'
                elif 'after' in part.lower():
                    frequency = 'After meals'
                    
                medicines.append({
                    'name': name,
                    'dosage': dosage,
                    'frequency': frequency
                })
    
    # Remove duplicates and clean up
    seen = set()
    unique_medicines = []
    for med in medicines:
        key = med['name'].lower()
        if key not in seen and len(med['name']) > 2:
            seen.add(key)
            unique_medicines.append(med)
    
    return unique_medicines if unique_medicines else [{'name': 'No medicines found', 'dosage': '-', 'frequency': '-'}]

def classify_prescription(text):
    """Classify if text is from a medical prescription"""
    if not text or classifier is None:
        return "unknown", 0.0
    
    try:
        candidate_labels = ["medical prescription", "not medical prescription"]
        result = classifier(text, candidate_labels)
        
        predicted_label = result["labels"][0]
        confidence = result["scores"][0]
        
        # Medical keywords for heuristic check
        medical_keywords = [
            "prescribed", "take", "mg", "ml", "capsules", "dosage",
            "dr.", "doctor", "patient", "medications", "apply", "signature",
            "clinic", "pharmacy", "rx", "dose", "medicine", "drug", "tablet"
        ]
        
        text_lower = text.lower()
        has_medical_keywords = any(keyword in text_lower for keyword in medical_keywords)
        
        # Adjust prediction based on heuristics
        if predicted_label == "not medical prescription" and has_medical_keywords:
            predicted_label = "medical prescription"
            confidence = max(confidence, 0.75)
        elif predicted_label == "medical prescription" and not has_medical_keywords:
            predicted_label = "not medical prescription"
            confidence = max(confidence, 0.75)
        
        return predicted_label, confidence
        
    except Exception as e:
        print(f"Classification Error: {e}")
        return "error", 0.0

@app.route('/')
def home():
    """Simple web interface for testing"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prescription Reader OCR</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
            .result { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🔍 Prescription Reader OCR</h1>
        <p>Upload a prescription image to extract text and analyze it.</p>
        
        <div class="upload-area">
            <input type="file" id="imageInput" accept="image/*" style="display: none;">
            <button onclick="document.getElementById('imageInput').click()">Choose Image</button>
            <p>Or drag and drop an image here</p>
        </div>
        
        <button onclick="analyzeImage()" id="analyzeBtn" style="display: none;">Analyze Prescription</button>
        
        <div id="results" class="result" style="display: none;">
            <h3>Results:</h3>
            <div id="resultContent"></div>
        </div>
        
        <script>
            let selectedFile = null;
            
            document.getElementById('imageInput').addEventListener('change', function(e) {
                selectedFile = e.target.files[0];
                if (selectedFile) {
                    document.getElementById('analyzeBtn').style.display = 'block';
                }
            });
            
            function analyzeImage() {
                if (!selectedFile) return;
                
                const formData = new FormData();
                formData.append('image', selectedFile);
                
                document.getElementById('resultContent').innerHTML = 'Analyzing...';
                document.getElementById('results').style.display = 'block';
                
                fetch('/analyze-prescription', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('resultContent').innerHTML = `
                            <h4>Extracted Text:</h4>
                            <p>${data.extracted_text}</p>
                            <h4>Classification:</h4>
                            <p><strong>${data.classification}</strong> (Confidence: ${(data.confidence * 100).toFixed(1)}%)</p>
                        `;
                    } else {
                        document.getElementById('resultContent').innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    }
                })
                .catch(error => {
                    document.getElementById('resultContent').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                });
            }
        </script>
    </body>
    </html>
    """
    return html

@app.route('/analyze-prescription', methods=['POST'])
def analyze_prescription():
    """API endpoint to analyze prescription images"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No image selected'}), 400
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Extract text using OCR
        extracted_text = extract_text_from_image(image)
        
        # Extract structured medicine information
        medicines = extract_medicine_info(extracted_text)
        
        # Classify the text
        classification, confidence = classify_prescription(extracted_text)
        
        return jsonify({
            'success': True,
            'medicines': medicines,
            'classification': classification,
            'confidence': confidence,
            'is_prescription': classification == "medical prescription"
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    model_status = "loaded" if (processor is not None and donut_model is not None and classifier is not None) else "not loaded"
    return jsonify({
        'status': 'healthy',
        'service': 'prescription-reader',
        'models': model_status,
        'device': device
    })

if __name__ == '__main__':
    print("🔍 Starting Prescription Reader OCR Service...")
    
    # Initialize models
    if initialize_models():
        print("✅ All models loaded successfully!")
        print("🚀 Starting Flask server on port 5003...")
        app.run(host='0.0.0.0', port=5003, debug=True)
    else:
        print("❌ Failed to load models. Please run: python model_download.py")
        print("💡 Or check if the model files exist in the 'model' directory")