#!/bin/bash

# Check if UW_API_KEY is set
if [ -z "$UW_API_KEY" ]; then
  echo "Error: UW_API_KEY environment variable is not set"
  echo "Please set it with: export UW_API_KEY=your_api_key"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the TypeScript script
echo "Fetching course data..."
npx ts-node scripts/fetch-courses.ts 