#!/bin/bash

# Authentication Context Verification Script
# Tasks 101-110 Verification (Improved)

echo "========================================="
echo "🔐 Authentication Context Test (Tasks 101-110)"
echo "========================================="
echo ""

PASSED=0
FAILED=0

# Test 1: Check if AuthContext file exists
echo "📝 Test 1: AuthContext File (Task 101)"
if [ -f "src/contexts/AuthContext.jsx" ]; then
    echo "✅ AuthContext.jsx exists"
    ((PASSED++))
else
    echo "❌ AuthContext.jsx NOT found"
    ((FAILED++))
fi
echo ""

# Test 2: Check if createContext is used
echo "📝 Test 2: createContext Usage (Task 102)"
if grep -q "createContext" src/contexts/AuthContext.jsx; then
    echo "✅ createContext() found in AuthContext"
    ((PASSED++))
else
    echo "❌ createContext() not found"
    ((FAILED++))
fi
echo ""

# Test 3: Check if AuthProvider exists
echo "📝 Test 3: AuthProvider Component (Task 103)"
if grep -q "export.*AuthProvider" src/contexts/AuthContext.jsx; then
    echo "✅ AuthProvider component exists"
    ((PASSED++))
else
    echo "❌ AuthProvider not found"
    ((FAILED++))
fi
echo ""

# Test 4: Check if state includes required fields (FIXED)
echo "📝 Test 4: State Setup (Task 104)"
HAS_USER=$(grep -c "user:" src/contexts/AuthContext.jsx)
HAS_TOKEN=$(grep -c "token:" src/contexts/AuthContext.jsx)
HAS_LOADING=$(grep -c "loading:" src/contexts/AuthContext.jsx)
HAS_ERROR=$(grep -c "error:" src/contexts/AuthContext.jsx)
HAS_QUOTA=$(grep -c "quotaRemaining:" src/contexts/AuthContext.jsx)

if [ $HAS_USER -gt 0 ] && [ $HAS_TOKEN -gt 0 ] && [ $HAS_LOADING -gt 0 ] && [ $HAS_ERROR -gt 0 ] && [ $HAS_QUOTA -gt 0 ]; then
    echo "✅ State includes all required fields"
    echo "   Found: user, token, loading, error, quotaRemaining"
    ((PASSED++))
else
    echo "❌ Some required state fields missing"
    echo "   user: $HAS_USER, token: $HAS_TOKEN, loading: $HAS_LOADING, error: $HAS_ERROR, quota: $HAS_QUOTA"
    ((FAILED++))
fi
echo ""

# Test 5: Check if loginAsGuest function exists
echo "📝 Test 5: loginAsGuest Function (Task 105)"
if grep -q "loginAsGuest" src/contexts/AuthContext.jsx; then
    echo "✅ loginAsGuest() function found"
    ((PASSED++))
else
    echo "❌ loginAsGuest() not found"
    ((FAILED++))
fi
echo ""

# Test 6: Check if logout function exists
echo "📝 Test 6: logout Function (Task 106)"
if grep -q "logout" src/contexts/AuthContext.jsx; then
    echo "✅ logout() function found"
    ((PASSED++))
else
    echo "❌ logout() not found"
    ((FAILED++))
fi
echo ""

# Test 7: Check if checkAuthStatus function exists
echo "📝 Test 7: checkAuthStatus Function (Task 107)"
if grep -q "checkAuthStatus" src/contexts/AuthContext.jsx; then
    echo "✅ checkAuthStatus() function found"
    ((PASSED++))
else
    echo "❌ checkAuthStatus() not found"
    ((FAILED++))
fi
echo ""

# Test 8: Check if refreshGuestSession function exists
echo "📝 Test 8: refreshGuestSession Function (Task 108)"
if grep -q "refreshGuestSession" src/contexts/AuthContext.jsx; then
    echo "✅ refreshGuestSession() function found"
    ((PASSED++))
else
    echo "❌ refreshGuestSession() not found"
    ((FAILED++))
fi
echo ""

# Test 9: Check if useAuth hook exists
echo "📝 Test 9: useAuth Hook (Task 109)"
if grep -q "export.*useAuth" src/contexts/AuthContext.jsx && \
   grep -q "useContext" src/contexts/AuthContext.jsx; then
    echo "✅ useAuth() hook with useContext found"
    ((PASSED++))
else
    echo "❌ useAuth() hook not properly implemented"
    ((FAILED++))
fi
echo ""

# Test 10: Check if App is wrapped with AuthProvider
echo "📝 Test 10: AuthProvider Wrapper (Task 110)"
if grep -q "AuthProvider" src/main.jsx && \
   grep -q "import.*AuthProvider" src/main.jsx; then
    echo "✅ App is wrapped with AuthProvider in main.jsx"
    ((PASSED++))
else
    echo "❌ AuthProvider not wrapping App"
    ((FAILED++))
fi
echo ""

# Test 11: Check if AuthTest page exists
echo "📝 Test 11: Auth Test Page"
if [ -f "src/pages/AuthTest.jsx" ]; then
    echo "✅ AuthTest.jsx exists"
    ((PASSED++))
else
    echo "❌ AuthTest.jsx NOT found"
    ((FAILED++))
fi
echo ""

# Test 12: Check if axios is imported
echo "📝 Test 12: Axios Import"
if grep -q "import.*axios" src/contexts/AuthContext.jsx; then
    echo "✅ Axios is imported for API calls"
    ((PASSED++))
else
    echo "❌ Axios import not found"
    ((FAILED++))
fi
echo ""

# Test 13: Check .env file
echo "📝 Test 13: Environment Configuration"
if [ -f ".env" ]; then
    if grep -q "VITE_API_BASE_URL" .env; then
        echo "✅ .env file exists with VITE_API_BASE_URL"
        echo "   Value: $(grep VITE_API_BASE_URL .env)"
        ((PASSED++))
    else
        echo "❌ VITE_API_BASE_URL not found in .env"
        ((FAILED++))
    fi
else
    echo "❌ .env file NOT found"
    ((FAILED++))
fi
echo ""

# Summary
echo "========================================="
echo "📊 TEST SUMMARY"
echo "========================================="
TOTAL=$((PASSED + FAILED))
echo "✅ Passed: $PASSED/$TOTAL"
echo "❌ Failed: $FAILED/$TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All authentication tests passed! Tasks 101-110 complete!"
    echo ""
    echo "📝 NEXT STEPS:"
    echo "   1. Make sure backend is running: cd ../backend && npm start"
    echo "   2. Start frontend: npm run dev"
    echo "   3. Visit: http://localhost:5173/auth-test"
    echo "   4. Click 'Test Login as Guest' button"
    echo ""
    exit 0
else
    echo "⚠️  Some tests failed. Please fix the issues above."
    exit 1
fi