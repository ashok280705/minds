from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import cv2
import numpy as np
import pytesseract
import re
import json
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

class PrescriptionReader:
    def __init__(self):
        self.medicine_patterns = [
            r'([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+(?:\.\d+)?)\s*(mg|g|ml|tablet|cap)',
            r'([A-Za-z]+)\s+(\d+)\s*(mg|g|ml)',
            r'Tab\.\s*([A-Za-z]+)\s+(\d+)\s*(mg|g)'
        ]
        
    def preprocess_image(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        kernel = np.ones((1,1), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        return thresh
    
    def extract_text(self, image):
        processed = self.preprocess_image(image)
        text = pytesseract.image_to_string(processed, config='--psm 6')
        return text
    
    def extract_medicines(self, text):
        medicines = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            for pattern in self.medicine_patterns:
                matches = re.findall(pattern, line, re.IGNORECASE)
                for match in matches:
                    medicine = {
                        'name': match[0].strip(),
                        'dosage': f"{match[1]}{match[2]}",
                        'frequency': self.extract_frequency(line),
                        'duration': self.extract_duration(line)
                    }
                    medicines.append(medicine)
        
        return medicines
    
    def extract_frequency(self, text):
        freq_patterns = [
            r'(\d+-\d+-\d+)',
            r'(once daily|twice daily|thrice daily)',
            r'(bid|tid|qid)',
            r'(\d+\s*times?\s*(?:a\s*)?day)'
        ]
        
        for pattern in freq_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return "As directed"
    
    def extract_duration(self, text):
        duration_patterns = [
            r'(?:for\s+)?(\d+\s*days?)',
            r'(?:for\s+)?(\d+\s*weeks?)',
            r'(?:x\s+)?(\d+\s*days?)',
            r'(\d+\s*days?)'
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return "As needed"
    
    def extract_patient_info(self, text):
        patient_name = ""
        doctor_name = ""
        date = ""
        
        # Extract patient name
        name_patterns = [
            r'(?:patient|name):\s*([A-Za-z\s]+)',
            r'Mr\.?\s+([A-Za-z\s]+)',
            r'Mrs\.?\s+([A-Za-z\s]+)',
            r'Ms\.?\s+([A-Za-z\s]+)'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                patient_name = match.group(1).strip()
                break
        
        # Extract doctor name
        doc_patterns = [
            r'Dr\.?\s+([A-Za-z\s]+)',
            r'Doctor:\s*([A-Za-z\s]+)'
        ]
        
        for pattern in doc_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                doctor_name = match.group(1).strip()
                break
        
        # Extract date
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}\s+[A-Za-z]+\s+\d{2,4})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                date = match.group(1)
                break
        
        return {
            'patient_name': patient_name,
            'doctor_name': doctor_name,
            'date': date
        }
    
    def process_prescription(self, image):
        text = self.extract_text(image)
        medicines = self.extract_medicines(text)
        patient_info = self.extract_patient_info(text)
        
        return {
            'raw_text': text,
            'patient_info': patient_info,
            'medications': medicines,
            'extracted_fields': len(medicines)
        }

reader = PrescriptionReader()

@app.route('/')
def index():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prescription Reader</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
            .result { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .medicine { background: white; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🏥 Prescription Reader</h1>
        <div class="upload-area">
            <input type="file" id="fileInput" accept="image/*" style="display: none;">
            <button onclick="document.getElementById('fileInput').click()">Upload Prescription Image</button>
            <p>Supports: JPG, PNG, PDF images</p>
        </div>
        <div id="result"></div>
        
        <script>
            document.getElementById('fileInput').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('file', file);
                
                document.getElementById('result').innerHTML = '<p>Processing...</p>';
                
                fetch('/analyze', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + data.error + '</p>';
                        return;
                    }
                    
                    let html = '<div class="result">';
                    html += '<h3>📋 Extracted Information</h3>';
                    
                    // Patient Info
                    if (data.patient_info.patient_name || data.patient_info.doctor_name || data.patient_info.date) {
                        html += '<h4>Patient Details:</h4>';
                        if (data.patient_info.patient_name) html += '<p><strong>Patient:</strong> ' + data.patient_info.patient_name + '</p>';
                        if (data.patient_info.doctor_name) html += '<p><strong>Doctor:</strong> ' + data.patient_info.doctor_name + '</p>';
                        if (data.patient_info.date) html += '<p><strong>Date:</strong> ' + data.patient_info.date + '</p>';
                    }
                    
                    // Medications
                    if (data.medications.length > 0) {
                        html += '<h4>💊 Medications (' + data.medications.length + '):</h4>';
                        data.medications.forEach(med => {
                            html += '<div class="medicine">';
                            html += '<strong>' + med.name + '</strong> - ' + med.dosage + '<br>';
                            html += 'Frequency: ' + med.frequency + '<br>';
                            html += 'Duration: ' + med.duration;
                            html += '</div>';
                        });
                    }
                    
                    // Raw text
                    html += '<h4>📝 Raw Extracted Text:</h4>';
                    html += '<pre style="background: white; padding: 10px; border-radius: 5px; white-space: pre-wrap;">' + data.raw_text + '</pre>';
                    
                    html += '</div>';
                    document.getElementById('result').innerHTML = html;
                })
                .catch(error => {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
                });
            });
        </script>
    </body>
    </html>
    ''')

@app.route('/analyze', methods=['POST'])
def analyze_prescription():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Process prescription
        result = reader.process_prescription(image)
        
        return jsonify({
            'success': True,
            'filename': file.filename,
            **result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'prescription-reader'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)