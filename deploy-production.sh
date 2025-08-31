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

# Check if deployment directory exists, if not try to clone
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}📁 Deployment directory $DEPLOY_DIR does not exist, attempting to clone...${NC}"
    PARENT_DIR=$(dirname "$DEPLOY_DIR")
    mkdir -p "$PARENT_DIR"
    cd "$PARENT_DIR"
    
    # Try to clone the repository (requires SSH key to be set up)
    if ! git clone git@github.com:Einstein-Essay-Tutors/einstein-essay-tutors-frontend.git $(basename "$DEPLOY_DIR"); then
        echo -e "${RED}❌ Failed to clone repository. Please ensure SSH keys are set up or create the directory manually${NC}"
        exit 1
    fi
fi

cd $DEPLOY_DIR

# Ensure we're running as newton user (ownership should already be correct)
echo -e "${YELLOW}🔧 Verifying user and permissions...${NC}"
echo "Running as user: $(whoami)"
echo "Current directory: $(pwd)"

echo -e "${YELLOW}📦 Pulling latest code...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📚 Installing dependencies...${NC}"
npm ci --omit=dev --ignore-scripts

# Handle build process based on SKIP_BUILD environment variable
if [ "$SKIP_BUILD" = "true" ]; then
    echo -e "${YELLOW}ℹ️  Build was completed on GitHub to save server resources${NC}"
    echo -e "${YELLOW}📦 Build files should be extracted from uploaded archive${NC}"
else
    echo -e "${YELLOW}🔨 Building application on server...${NC}"
    npm run build:production
fi

echo -e "${YELLOW}🔧 Ensuring PM2 ecosystem.config.js is updated with correct paths...${NC}"
# Update ecosystem.config.js with fixed configuration if it doesn't exist or is outdated
if [ ! -f "ecosystem.config.js" ] || ! grep -q "/home/newton/apps/essay-writing-tutors/frontend" ecosystem.config.js; then
    echo -e "${YELLOW}⚙️ Creating/updating PM2 ecosystem configuration...${NC}"
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "einstein-essay-tutors-frontend",
      script: "server.js",
      // FIXED: Use correct deployment path
      cwd: "/home/newton/apps/essay-writing-tutors/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      // Memory-optimized settings for 2GB droplet
      max_memory_restart: "512M",
      node_args: "--max-old-space-size=384",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        // Reduce memory usage
        NODE_OPTIONS: "--max-old-space-size=384",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        NODE_OPTIONS: "--max-old-space-size=384",
      },
      // FIXED: Use correct logs directory path
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/home/newton/apps/logs/frontend-error.log",
      out_file: "/home/newton/apps/logs/frontend-out.log",
      log_file: "/home/newton/apps/logs/frontend-combined.log",
      time: true,

      // Performance settings for limited resources
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Graceful shutdown
      shutdown_with_message: true,
    },
  ],
};
EOF
fi

echo -e "${YELLOW}🔄 Restarting frontend service with PM2...${NC}"
# Stop existing process if running, then start fresh
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js

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
if ! pm2 save; then
    echo -e "${RED}❌ Failed to save PM2 process list${NC}"
    exit 1
fi

echo -e "${YELLOW}🌐 Reloading nginx...${NC}"
if ! sudo systemctl reload nginx; then
    echo -e "${RED}❌ Failed to reload nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo -e "${YELLOW}📊 PM2 logs: pm2 logs $APP_NAME${NC}"
echo -e "${YELLOW}📊 PM2 monitor: pm2 monit${NC}"