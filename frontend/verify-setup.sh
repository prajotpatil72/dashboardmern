#!/bin/bash

# Theme Configuration Verification Script
# Tasks 91-100 Verification

echo "========================================="
echo "🎨 Theme Configuration Test (Tasks 91-100)"
echo "========================================="
echo ""

PASSED=0
FAILED=0

# Test 1: Check Typography plugin
echo "📝 Test 1: Typography Plugin (Task 96)"
if npm list @tailwindcss/typography > /dev/null 2>&1; then
    echo "✅ @tailwindcss/typography is installed"
    ((PASSED++))
else
    echo "❌ @tailwindcss/typography is NOT installed"
    ((FAILED++))
fi
echo ""

# Test 2: Check if tailwind.config.js has darkMode
echo "📝 Test 2: Dark Mode Configuration (Task 92)"
if grep -q "darkMode.*'class'" tailwind.config.js; then
    echo "✅ Dark mode with 'class' strategy configured"
    ((PASSED++))
else
    echo "❌ Dark mode not configured correctly"
    ((FAILED++))
fi
echo ""

# Test 3: Check for custom colors
echo "📝 Test 3: Custom Color Palette (Task 91)"
if grep -q "primary:" tailwind.config.js && grep -q "youtube:" tailwind.config.js; then
    echo "✅ Custom colors (primary, youtube) configured"
    ((PASSED++))
else
    echo "❌ Custom colors not found"
    ((FAILED++))
fi
echo ""

# Test 4: Check for engagement colors
echo "📝 Test 4: Engagement Colors (Task 93)"
if grep -q "engagement:" tailwind.config.js; then
    echo "✅ Engagement rate colors configured"
    ((PASSED++))
else
    echo "❌ Engagement colors not found"
    ((FAILED++))
fi
echo ""

# Test 5: Check for chart colors
echo "📝 Test 5: Chart Colors (Task 93)"
if grep -q "chart:" tailwind.config.js; then
    echo "✅ Chart colors configured"
    ((PASSED++))
else
    echo "❌ Chart colors not found"
    ((FAILED++))
fi
echo ""

# Test 6: Check for custom spacing
echo "📝 Test 6: Custom Spacing (Task 94)"
if grep -q "'88':" tailwind.config.js && grep -q "'112':" tailwind.config.js; then
    echo "✅ Custom spacing configured"
    ((PASSED++))
else
    echo "❌ Custom spacing not found"
    ((FAILED++))
fi
echo ""

# Test 7: Check for custom border radius
echo "📝 Test 7: Border Radius (Task 95)"
if grep -q "'2xl':" tailwind.config.js && grep -q "'3xl':" tailwind.config.js; then
    echo "✅ Custom border radius configured"
    ((PASSED++))
else
    echo "❌ Custom border radius not found"
    ((FAILED++))
fi
echo ""

# Test 8: Check for desktop-only breakpoints
echo "📝 Test 8: Desktop-Only Breakpoints (Task 97)"
if grep -q "screens:" tailwind.config.js && grep -q "'desktop':" tailwind.config.js; then
    echo "✅ Desktop-only breakpoints configured"
    ((PASSED++))
else
    echo "❌ Desktop breakpoints not found"
    ((FAILED++))
fi
echo ""

# Test 9: Check for animations
echo "📝 Test 9: Custom Animations (Task 98)"
if grep -q "animation:" tailwind.config.js && grep -q "fadeIn" tailwind.config.js; then
    echo "✅ Custom animations configured"
    ((PASSED++))
else
    echo "❌ Custom animations not found"
    ((FAILED++))
fi
echo ""

# Test 10: Check for gradients
echo "📝 Test 10: Gradient Utilities (Task 99)"
if grep -q "backgroundImage:" tailwind.config.js && grep -q "gradient-dark" tailwind.config.js; then
    echo "✅ Gradient utilities configured"
    ((PASSED++))
else
    echo "❌ Gradient utilities not found"
    ((FAILED++))
fi
echo ""

# Test 11: Check for ThemeTest page
echo "📝 Test 11: Theme Test Page (Task 100)"
if [ -f "src/pages/ThemeTest.jsx" ]; then
    echo "✅ ThemeTest.jsx exists"
    ((PASSED++))
else
    echo "❌ ThemeTest.jsx NOT found"
    ((FAILED++))
fi
echo ""

# Test 12: Check if typography plugin is in config
echo "📝 Test 12: Typography Plugin in Config (Task 96)"
if grep -q "@tailwindcss/typography" tailwind.config.js || grep -q "require('@tailwindcss/typography')" tailwind.config.js; then
    echo "✅ Typography plugin added to config"
    ((PASSED++))
else
    echo "❌ Typography plugin not in config"
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
    echo "🎉 All theme tests passed! Tasks 91-100 complete!"
    echo ""
    echo "📝 MANUAL TESTING REQUIRED:"
    echo "   1. Start dev server: npm run dev"
    echo "   2. Visit: http://localhost:5173/theme-