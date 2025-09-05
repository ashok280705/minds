#!/bin/bash

echo "🚀 Starting Clarity Care 3.0 - Complete Healthcare Platform"
echo "============================================================"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Clearing port $port..."
    
    # Kill processes using the port
    if command -v lsof &> /dev/null; then
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null
            echo "✅ Killed processes on port $port"
        else
            echo "ℹ️  Port $port is already free"
        fi
    fi
    
    # Alternative method using netstat (for compatibility)
    if command -v netstat &> /dev/null; then
        local pid=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        if [ ! -z "$pid" ] && [ "$pid" != "-" ]; then
            kill -9 $pid 2>/dev/null
            echo "✅ Killed process $pid on port $port"
        fi
    fi
}

# Function to check if port is free
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is free
    fi
}

# Clear all required ports
echo "🧹 Clearing all ports..."
kill_port 3000  # Next.js app
kill_port 5001  # Risk analyzer
kill_port 27017 # MongoDB (if running locally)
kill_port 8080  # Alternative port
kill_port 3001  # Backend services

# Wait for ports to be freed
sleep 2

echo ""
echo "🔧 Installing and updating dependencies..."

# Install Node.js dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install --silent
    if [ $? -ne 0 ]; then
        echo "⚠️  npm install failed, trying with --legacy-peer-deps..."
        npm install --legacy-peer-deps --silent
    fi
fi

# Install Python dependencies for risk analyzer
if [ -d "risk-analyzer" ] && [ -f "risk-analyzer/requirements.txt" ]; then
    echo "🐍 Installing Python dependencies for risk analyzer..."
    cd risk-analyzer
    python3 -m pip install -r requirements.txt --quiet --user
    cd ..
fi

echo ""
echo "🗄️  Setting up database..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "🍃 Starting MongoDB..."
    # Try to start MongoDB (different methods for different systems)
    if command -v brew &> /dev/null && brew services list | grep mongodb &> /dev/null; then
        brew services start mongodb-community 2>/dev/null || echo "⚠️  MongoDB brew service not available"
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start mongod 2>/dev/null || echo "⚠️  MongoDB systemctl not available"
    elif command -v mongod &> /dev/null; then
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null || echo "⚠️  MongoDB manual start failed"
    else
        echo "⚠️  MongoDB not found - some features may not work"
    fi
else
    echo "✅ MongoDB is already running"
fi

echo ""
echo "🚀 Starting all services..."

# Create logs directory
mkdir -p logs

# Start Risk Analyzer in background
echo "🧠 Starting Risk Analyzer (AI Mental Health Analysis)..."
cd risk-analyzer
python3 app.py > ../logs/risk-analyzer.log 2>&1 &
RISK_ANALYZER_PID=$!
cd ..
echo "✅ Risk Analyzer started (PID: $RISK_ANALYZER_PID) - Port 5001"

# Start Scans Analyzer in background
echo "🔬 Starting Medical Scans Analyzer with AI Models..."
cd scans-analyzer
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
echo "  📦 Installing dependencies..."
pip install -r requirements.txt > ../logs/scans-setup.log 2>&1
echo "  🤖 Loading AI models (this may take a moment)..."
python app.py > ../logs/scans-analyzer.log 2>&1 &
SCANS_ANALYZER_PID=$!
cd ..
echo "✅ Scans Analyzer started (PID: $SCANS_ANALYZER_PID) - Port 5003"
echo "  📊 AI Models: Chest X-Ray, Skin Lesion, Brain MRI + Advanced CV"
echo "  🔍 Supported: MRI, X-Ray, Chest, Kidney, Heart, Skin, Liver"

# Wait for risk analyzer to start
sleep 3

# Verify risk analyzer is running
if check_port 5001; then
    echo "⚠️  Risk Analyzer may not have started properly"
else
    echo "✅ Risk Analyzer is running on port 5001"
fi

echo ""
echo "🌐 Starting Next.js Application..."
echo ""
echo "📱 CLARITY CARE 3.0 - FEATURE OVERVIEW:"
echo "============================================"
echo "🧠 Mental Health Services:"
echo "   • AI Mental Counselor with crisis detection"
echo "   • Chat History and session tracking"
echo "   • Period Tracker (for female users)"
echo "   • Mood-based music therapy"
echo ""
echo "🏥 Medical Services:"
echo "   • Health Report Advisor (PDF analysis)"
echo "   • Doctor Consultation system"
echo "   • Real-time video/chat rooms"
echo "   • Emergency escalation system"
echo ""
echo "🔧 Technical Features:"
echo "   • Socket.IO real-time communication"
echo "   • MongoDB database integration"
echo "   • Twilio WhatsApp notifications"
echo "   • Google Gemini AI integration"
echo "   • BioClinicalBERT risk analysis"
echo "   • Multi-language support"
echo ""
echo "🌍 Access Points:"
echo "   • Main Application: http://localhost:3000"
echo "   • Risk Analyzer API: http://localhost:5001"
echo "   • Scans Analyzer API: http://localhost:5003"
echo "   • Health Check: http://localhost:5001/health"
echo ""
echo "🎉 All services are starting..."
echo "============================================"
echo "Press Ctrl+C to stop all services"
echo ""

# Start Next.js (this will keep the script running)
npm run dev

# Cleanup function when script exits
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Kill risk analyzer
    if [ ! -z "$RISK_ANALYZER_PID" ]; then
        kill $RISK_ANALYZER_PID 2>/dev/null
        echo "✅ Risk Analyzer stopped"
    fi
    
    # Kill scans analyzer
    if [ ! -z "$SCANS_ANALYZER_PID" ]; then
        kill $SCANS_ANALYZER_PID 2>/dev/null
        echo "✅ Scans Analyzer stopped"
    fi
    
    # Kill any remaining processes on our ports
    kill_port 3000
    kill_port 5001
    kill_port 5003
    kill_port 3001
    
    # Clean up log files
    rm -f logs/*.log 2>/dev/null
    
    echo "🏁 All Clarity Care 3.0 services stopped"
    echo "Thank you for using Clarity Care 3.0! 💙"
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT