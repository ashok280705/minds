#!/bin/bash
# Start script for Risk Analyzer service

echo "Starting Risk Analyzer service..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the Flask service
echo "Starting Flask service on port 5000..."
python app.py