#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Pull latest changes
echo "Pulling latest changes from repository..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Restart server (adjust based on your deployment environment)
echo "Restarting server..."
pm2 restart healthcare-app

echo "Deployment completed successfully!" 