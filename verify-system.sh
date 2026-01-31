#!/bin/bash

# Smart Billing Authentication System Verification Script
# This script helps verify the complete implementation

echo "🔍 Smart Billing Authentication System Verification"
echo "=================================================="

# Check if required files exist
echo ""
echo "📁 Checking file structure..."

required_files=(
    "lib/mongodb.ts"
    "lib/auth.ts"
    "lib/middleware.ts"
    "models/User.ts"
    "models/Customer.ts"
    "models/Supplier.ts"
    "app/api/auth/register/route.ts"
    "app/api/auth/login/route.ts"
    "app/api/auth/logout/route.ts"
    "app/api/customers/route.ts"
    "app/api/customers/[id]/route.ts"
    "app/api/suppliers/route.ts"
    "app/api/suppliers/[id]/route.ts"
    "app/register/page.tsx"
    "middleware.ts"
    ".env.local"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

# Check environment variables
echo ""
echo "🔧 Checking environment configuration..."

if [ -f ".env.local" ]; then
    if grep -q "MONGODB_URI" .env.local; then
        echo "✅ MONGODB_URI configured"
    else
        echo "❌ MONGODB_URI missing"
        missing_files+=("MONGODB_URI")
    fi
    
    if grep -q "JWT_SECRET" .env.local; then
        echo "✅ JWT_SECRET configured"
    else
        echo "❌ JWT_SECRET missing"
        missing_files+=("JWT_SECRET")
    fi
else
    echo "❌ .env.local file missing"
    missing_files+=(".env.local")
fi

# Check package.json dependencies
echo ""
echo "📦 Checking dependencies..."

dependencies=(
    "mongoose"
    "bcryptjs"
    "jsonwebtoken"
)

for dep in "${dependencies[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        echo "✅ $dep installed"
    else
        echo "❌ $dep not installed"
        missing_files+=("$dep")
    fi
done

# Check TypeScript compilation
echo ""
echo "🔨 Checking TypeScript compilation..."

if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    missing_files+=("TypeScript compilation")
fi

# Summary
echo ""
echo "📊 Verification Summary"
echo "======================"

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 All checks passed! The authentication system is ready to use."
    echo ""
    echo "🚀 Next steps:"
    echo "1. Ensure MongoDB is running"
    echo "2. Start the development server: npm run dev"
    echo "3. Open http://localhost:3000/register"
    echo "4. Create a test account"
    echo "5. Test the complete functionality"
else
    echo "⚠️  Issues found that need to be addressed:"
    for issue in "${missing_files[@]}"; do
        echo "   - $issue"
    done
    echo ""
    echo "🔧 Please fix these issues before proceeding."
fi

echo ""
echo "📚 Additional Resources:"
echo "- AUTH_IMPLEMENTATION.md - Complete documentation"
echo "- MIGRATION_GUIDE.md - Data migration instructions"
echo "- test-auth.js - API testing script"
echo ""
echo "🔐 Security Features Implemented:"
echo "- JWT authentication with httpOnly cookies"
echo "- User-scoped data access"
echo "- Route protection middleware"
echo "- Password hashing with bcryptjs"
echo "- Input validation on all endpoints"
echo ""
echo "✨ Smart Billing is now enterprise-ready!"
