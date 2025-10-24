#!/bin/bash

echo "========================================"
echo "YouTube Analytics Search Diagnostics"
echo "========================================"
echo ""

# Check if we're in the project directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

echo "1️⃣  Checking Backend Status..."
echo "================================"

# Check if backend .env exists
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
    
    # Check for required variables (without showing values)
    if grep -q "YOUTUBE_API_KEY=" backend/.env; then
        echo "✅ YOUTUBE_API_KEY is set"
    else
        echo "❌ YOUTUBE_API_KEY is missing!"
    fi
    
    if grep -q "MONGODB_URI=" backend/.env; then
        echo "✅ MONGODB_URI is set"
    else
        echo "❌ MONGODB_URI is missing!"
    fi
    
    if grep -q "JWT_SECRET=" backend/.env; then
        echo "✅ JWT_SECRET is set"
    else
        echo "❌ JWT_SECRET is missing!"
    fi
else
    echo "❌ Backend .env file not found!"
fi

echo ""

# Check backend dependencies
echo "2️⃣  Checking Backend Dependencies..."
echo "================================"
cd backend

if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    
    # Check critical packages
    if [ -d "node_modules/googleapis" ]; then
        echo "✅ googleapis installed"
    else
        echo "❌ googleapis NOT installed"
    fi
    
    if [ -d "node_modules/express" ]; then
        echo "✅ express installed"
    else
        echo "❌ express NOT installed"
    fi
    
    if [ -d "node_modules/mongoose" ]; then
        echo "✅ mongoose installed"
    else
        echo "❌ mongoose NOT installed"
    fi
else
    echo "❌ node_modules not found! Run: npm install"
fi

cd ..
echo ""

# Check backend file structure
echo "3️⃣  Checking Backend Files..."
echo "================================"

FILES_TO_CHECK=(
    "backend/config/youtube.js"
    "backend/routes/youtube.js"
    "backend/controllers/guestController.js"
    "backend/middleware/optionalAuth.js"
    "backend/middleware/quotaTracker.js"
    "backend/utils/parseYouTubeData.js"
    "backend/server.js"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done

echo ""

# Check frontend
echo "4️⃣  Checking Frontend Status..."
echo "================================"

if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env exists"
else
    echo "⚠️  Frontend .env not found (may use defaults)"
fi

cd frontend

if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    
    # Check critical packages
    if [ -d "node_modules/axios" ]; then
        echo "✅ axios installed"
    else
        echo "❌ axios NOT installed"
    fi
    
    if [ -d "node_modules/@tanstack/react-query" ]; then
        echo "✅ @tanstack/react-query installed"
    else
        echo "❌ @tanstack/react-query NOT installed"
    fi
    
    if [ -d "node_modules/react-router-dom" ]; then
        echo "✅ react-router-dom installed"
    else
        echo "❌ react-router-dom NOT installed"
    fi
else
    echo "❌ node_modules not found! Run: npm install"
fi

cd ..
echo ""

# Check frontend file structure
echo "5️⃣  Checking Frontend Files..."
echo "================================"

FRONTEND_FILES=(
    "frontend/src/pages/Search.jsx"
    "frontend/src/hooks/useSearchVideos.js"
    "frontend/src/services/api.js"
    "frontend/src/contexts/AuthContext.jsx"
    "frontend/src/lib/queryClient.js"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done

echo ""

# Check if servers are running
echo "6️⃣  Checking Running Processes..."
echo "================================"

if lsof -i :5000 > /dev/null 2>&1; then
    echo "✅ Backend server is running on port 5000"
else
    echo "❌ Backend server is NOT running on port 5000"
    echo "   Run: cd backend && npm start"
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo "✅ Frontend server is running on port 5173"
else
    echo "❌ Frontend server is NOT running on port 5173"
    echo "   Run: cd frontend && npm run dev"
fi

echo ""

# Test backend API
echo "7️⃣  Testing Backend API..."
echo "================================"

if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend health endpoint responding"
    
    # Try to get a guest token
    TOKEN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/guest 2>&1)
    if [ $? -eq 0 ]; then
        echo "✅ Guest token endpoint responding"
    else
        echo "❌ Guest token endpoint not responding"
    fi
else
    echo "❌ Backend not responding at http://localhost:5000"
fi

echo ""
echo "========================================"
echo "Diagnostics Complete!"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "   - Check all ❌ items above"
echo "   - Read DEBUG_SEARCH_ISSUE.md for detailed fixes"
echo "   - Check browser console for frontend errors"
echo "   - Check backend terminal for server errors"
echo ""