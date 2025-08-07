#!/bin/sh
set -e  # Exit immediately if any command fails

echo "🔄 Running database migrations..."
npm run db:migrate
echo "✅ Database migrations completed successfully"

echo "🚀 Starting server..."
exec node dist/index.js