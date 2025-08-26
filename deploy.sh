#!/bin/bash

# Einstein Essay Tutors Frontend Deployment Script
# This script handles the server-side deployment operations

set -e

PROJECT_DIR="/home/ubuntu/einstein-essay-tutors-frontend"
APP_NAME="einstein-essay-tutors-frontend"

echo "🚀 Starting frontend deployment..."

# Navigate to project directory
cd "$PROJECT_DIR"

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️  Building application..."
npm run build

# Stop the current PM2 process
echo "🛑 Stopping current application..."
pm2 stop "$APP_NAME" 2>/dev/null || echo "Process not currently running"

# Copy static files from standalone build to nginx directory
echo "📂 Copying static files..."
if [ -d ".next/standalone" ]; then
    # Copy public assets to standalone directory
    cp -r public/* .next/standalone/public/ 2>/dev/null || echo "No public files to copy"
    
    # Copy static assets to standalone directory
    if [ -d ".next/static" ]; then
        mkdir -p .next/standalone/.next/static
        cp -r .next/static/* .next/standalone/.next/static/
    fi
fi

# Create logs directory if it doesn't exist
sudo mkdir -p /home/ubuntu/logs
sudo chown ubuntu:ubuntu /home/ubuntu/logs

# Start the application with PM2
echo "▶️  Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Show PM2 status
echo "📊 PM2 Process Status:"
pm2 list

# Wait for application to start
sleep 5

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is responding!"
else
    echo "❌ Frontend health check failed!"
    # Show PM2 logs for debugging
    pm2 logs "$APP_NAME" --lines 20
    exit 1
fi

# Restart nginx to ensure proper routing
echo "🔄 Reloading nginx configuration..."
sudo systemctl reload nginx

# Final status check
echo "📊 Final system status:"
pm2 list
sudo systemctl status nginx --no-pager -l

echo "🎉 Frontend deployment completed successfully!"