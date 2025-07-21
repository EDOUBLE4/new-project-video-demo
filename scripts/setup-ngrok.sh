#!/bin/bash

# IntelliCOI ngrok setup helper script

echo "🚀 Setting up ngrok for IntelliCOI local testing..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   brew install ngrok"
    echo "   or download from: https://ngrok.com/download"
    exit 1
fi

# Start ngrok
echo "📡 Starting ngrok tunnel on port 3001..."
ngrok http 3001 &

# Wait for ngrok to start
sleep 3

# Get ngrok URL from API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Make sure ngrok is running."
    exit 1
fi

echo "✅ ngrok is running at: $NGROK_URL"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.local file:"
echo "   NEXT_PUBLIC_APP_URL=$NGROK_URL"
echo ""
echo "2. Configure Vectorize.io webhook:"
echo "   Webhook URL: $NGROK_URL/api/webhooks/vectorize"
echo ""
echo "3. Restart your Next.js server (Ctrl+C and npm run dev)"
echo ""
echo "4. Monitor webhooks at: http://127.0.0.1:4040"
echo ""
echo "Press Ctrl+C to stop ngrok when done testing."

# Keep script running
wait