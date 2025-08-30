#!/bin/bash
# Production deployment script for frontend
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Frontend Production Deployment${NC}"
echo -e "${YELLOW}📍 Using deployment directory: $DEPLOY_DIR${NC}"
echo -e "${YELLOW}🔧 Using app name: $APP_NAME${NC}"

# Check if running as correct user
if [ "$USER" != "newton" ]; then
    echo -e "${RED}❌ This script should be run as newton user${NC}"
    exit 1
fi

# Use environment variables with secure defaults
DEPLOY_DIR="${FRONTEND_DEPLOY_PATH:-/home/newton/apps/essay-writing-tutors/frontend}"
APP_NAME="${FRONTEND_SERVICE_NAME:-einstein-essay-tutors-frontend}"

# Check if deployment directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}❌ Deployment directory $DEPLOY_DIR does not exist${NC}"
    exit 1
fi

cd $DEPLOY_DIR

echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📚 Installing dependencies...${NC}"
npm ci --only=production --ignore-scripts

# Handle build process based on SKIP_BUILD environment variable
if [ "$SKIP_BUILD" = "true" ]; then
    echo -e "${YELLOW}ℹ️  Build was completed on GitHub to save server resources${NC}"
    echo -e "${YELLOW}📦 Build files should be extracted from uploaded archive${NC}"
else
    echo -e "${YELLOW}🔨 Building application on server...${NC}"
    npm run build:production
fi

echo -e "${YELLOW}🔄 Restarting frontend service with PM2...${NC}"
pm2 restart $APP_NAME || pm2 start ecosystem.config.js

# Wait a moment for service to start
sleep 3

# Enhanced PM2 service status checking
echo -e "${YELLOW}🩺 Checking PM2 service status...${NC}"
check_pm2_service() {
    local service_name="$1"
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}📋 Attempt $attempt/$max_attempts: Checking PM2 status...${NC}"
        
        # Get PM2 status with fallback
        pm2_status=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name=="'$service_name'") | .pm2_env.status' 2>/dev/null || echo "stopped")
        
        if [ "$pm2_status" = "online" ]; then
            echo -e "${GREEN}✅ Frontend service is running${NC}"
            
            # Show detailed PM2 information
            echo -e "${YELLOW}📊 PM2 Service Details:${NC}"
            pm2 show $service_name --no-colors | grep -E "(status|uptime|restarts|memory|cpu)"
            
            # Show recent logs (last 10 lines)
            echo -e "${YELLOW}📝 Recent PM2 logs:${NC}"
            pm2 logs $service_name --lines 10 --no-colors | tail -20
            
            return 0
        else
            echo -e "${RED}⚠️  Service status: $pm2_status${NC}"
            if [ $attempt -lt $max_attempts ]; then
                echo -e "${YELLOW}⏳ Waiting 3 seconds before retry...${NC}"
                sleep 3
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    # If we get here, service failed to start
    echo -e "${RED}❌ Frontend service failed to start after $max_attempts attempts${NC}"
    echo -e "${RED}📋 PM2 Process List:${NC}"
    pm2 list --no-colors
    echo -e "${RED}📝 Last 30 lines of logs:${NC}"
    pm2 logs $service_name --lines 30 --no-colors
    return 1
}

# Run the enhanced status check
if ! check_pm2_service "$APP_NAME"; then
    exit 1
fi

echo -e "${YELLOW}💾 Saving PM2 process list...${NC}"
pm2 save

echo -e "${YELLOW}🌐 Reloading nginx...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 PM2 logs: pm2 logs $APP_NAME${NC}"
echo -e "${YELLOW}📊 PM2 monitor: pm2 monit${NC}"