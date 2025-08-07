#!/bin/sh
set -e  # Exit immediately if any command fails

echo "🚀 Starting server..."
exec node dist/index.js