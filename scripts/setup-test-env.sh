#!/bin/bash

# Setup script for ReAct Agent integration tests
# This script helps set up environment variables for testing with real APIs

echo "🔧 Setting up environment variables for ReAct Agent integration tests"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📁 Found .env file, loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found. You'll need to set environment variables manually."
fi

# Check required environment variables
echo ""
echo "🔍 Checking required environment variables:"

REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
)

OPTIONAL_VARS=(
    "TAVILY_API_KEY"
    "BING_API_KEY"
    "SERPAPI_API_KEY"
    "ANTHROPIC_API_KEY"
    "COHERE_API_KEY"
    "MICROLINK_API_KEY"
    "JINA_API_KEY"
)

# Check required variables
echo "Required variables:"
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "  ❌ $var (missing)"
    else
        echo "  ✅ $var (set)"
    fi
done

echo ""
echo "Optional variables:"
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "  ⚪ $var (not set)"
    else
        echo "  ✅ $var (set)"
    fi
done

echo ""
echo "🚀 To run the integration test:"
echo "   npm test -- tests/features/chat/ReActLoop.integration.test.ts"
echo ""
echo "📝 To set missing variables manually:"
echo "   export SUPABASE_URL=\"your-supabase-url\""
echo "   export SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key\""
echo "   export OPENAI_API_KEY=\"your-openai-key\""
echo ""
echo "💡 Tip: Create a .env file with your API keys for easier testing"
