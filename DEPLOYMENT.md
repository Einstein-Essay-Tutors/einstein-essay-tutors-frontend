# Frontend Production Deployment Guide

This guide covers deploying the Einstein Essay Tutors Next.js frontend to a DigitalOcean droplet with HTTPS, performance optimization, and PM2 process management.

## 🏗️ Frontend Architecture

- **Frontend**: https://einsteinessaytutors.com (Next.js via PM2)
- **API Connection**: https://api.einsteinessaytutors.com
- **Process Manager**: PM2 with memory limits
- **Build Strategy**: GitHub Actions (saves server resources)

## 🔐 Required GitHub Secrets

Set these in your frontend repository settings:

### Infrastructure Secrets

- `DROPLET_HOST` - Your DigitalOcean droplet IP address
- `DROPLET_USERNAME` - SSH username (usually 'ubuntu')
- `DROPLET_SSH_KEY` - Private SSH key for droplet access

### Frontend Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - https://api.einsteinessaytutors.com
- `NEXT_PUBLIC_APP_URL` - https://einsteinessaytutors.com

## 🚀 Initial Server Setup

**Note**: The server setup is handled by the backend repository's setup script.

1. **Server Setup** - Run from backend repository:

   ```bash
   # This script sets up both backend and frontend services
   curl -O https://raw.githubusercontent.com/Einstein-Essay-Tutors/einstein-essay-tutors-backend/main/setup-production-server.sh
   chmod +x setup-production-server.sh
   sudo ./setup-production-server.sh
   ```

2. **Frontend Environment** - Create production environment:

   ```bash
   # SSH into your droplet
   ssh ubuntu@YOUR_DROPLET_IP

   # Create frontend environment file
   cd /var/www/essay-writing-tutors/frontend
   cat > .env.production << EOF
   NEXT_PUBLIC_API_BASE_URL=https://api.einsteinessaytutors.com
   NEXT_PUBLIC_APP_URL=https://einsteinessaytutors.com
   EOF
   ```

## 🔄 Automated Frontend Deployment

Deployments are triggered automatically:

### Frontend Deployment Process

- **Trigger**: Push to `main` or `develop` branch
- **Process**:
  1. Builds Next.js application on GitHub Actions
  2. Creates optimized production build artifact
  3. Transfers build to server via SSH
  4. Installs only production dependencies
  5. Restarts PM2 process with memory limits

### Build Optimization

- **GitHub Builds**: Complete builds happen on GitHub to save server resources
- **Server Resources**: Only runtime dependencies installed on server
- **Artifact Transfer**: Optimized .next directory transferred to server

## 🛡️ Frontend Security Features

### Next.js Security

- ✅ HTTPS-only cookies and secure headers
- ✅ CSP (Content Security Policy) configured for API subdomain
- ✅ Environment variables properly scoped (NEXT*PUBLIC* prefix)
- ✅ API calls restricted to trusted API subdomain

### Resource Optimization (2GB RAM)

- ✅ **PM2**: Single process with memory monitoring
- ✅ **Build Strategy**: GitHub-based builds reduce server load
- ✅ **Memory Limits**: PM2 enforces memory limits per process
- ✅ **Production Dependencies**: Only runtime packages installed

## 📊 Monitoring & Logs

### Service Status

```bash
# Frontend service
pm2 status einstein-essay-tutors-frontend

# PM2 monitoring dashboard
pm2 monit

# Process list
pm2 list
```

### Logs

```bash
# Frontend logs
pm2 logs einstein-essay-tutors-frontend

# Real-time logs
pm2 logs einstein-essay-tutors-frontend -f

# Error logs only
pm2 logs einstein-essay-tutors-frontend --err
```

## 🔧 Manual Deployment

If you need to deploy manually:

```bash
cd /var/www/essay-writing-tutors/frontend
./deploy-production.sh
```

## 📂 Repository Structure

```
einstein-essay-tutors-frontend/
├── .github/workflows/
│   └── frontend-ci-cd.yml        # CI/CD pipeline
├── components/                   # React components
├── pages/                        # Next.js pages
├── styles/                       # CSS/styling
├── public/                       # Static assets
├── ecosystem.config.js           # PM2 configuration
├── deploy-production.sh          # Deployment script
├── package.json                  # Dependencies
├── next.config.js               # Next.js configuration
└── DEPLOYMENT.md                # This file
```

## 🔧 PM2 Configuration

The frontend uses PM2 for process management:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'einstein-essay-tutors-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/essay-writing-tutors/frontend',
      instances: 1,
      max_memory_restart: '400M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

## 🚨 Troubleshooting

### Frontend Issues

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs einstein-essay-tutors-frontend -f

# Restart frontend
pm2 restart einstein-essay-tutors-frontend

# Check memory usage
pm2 show einstein-essay-tutors-frontend
```

### Build Issues

```bash
# Check if .next directory exists
ls -la /var/www/essay-writing-tutors/frontend/.next

# Verify environment variables
cat /var/www/essay-writing-tutors/frontend/.env.production

# Check Node.js version
node --version
npm --version
```

### Performance Issues

```bash
# Monitor PM2 processes
pm2 monit

# Check system resources
htop
free -h
```

## 🔄 Rollback Procedure

If deployment fails:

```bash
cd /var/www/essay-writing-tutors/frontend
git checkout HEAD~1
./deploy-production.sh
```

## 📈 Performance Optimization

### Next.js Optimizations

- Image optimization enabled
- Automatic static optimization
- Code splitting and lazy loading
- Gzip compression via nginx

### Server Optimizations

- PM2 memory limits prevent memory leaks
- GitHub builds reduce server CPU usage
- Production dependencies only
- Nginx serves static assets directly

## 🌐 Domain Configuration

Frontend is accessible via:

- https://einsteinessaytutors.com (primary)
- https://www.einsteinessaytutors.com (redirect to primary)

API calls are made to:

- https://api.einsteinessaytutors.com

## 📋 Deployment Checklist

Before deploying:

- [ ] Server setup completed (via backend repo)
- [ ] DNS configured for domain and API subdomain
- [ ] GitHub secrets configured
- [ ] Environment variables set in repository
- [ ] SSL certificates obtained (handled by setup script)
- [ ] PM2 ecosystem configuration verified

## 🔑 Environment Variables

Required for production:

```bash
# Frontend environment (.env.production)
NEXT_PUBLIC_API_BASE_URL=https://api.einsteinessaytutors.com
NEXT_PUBLIC_APP_URL=https://einsteinessaytutors.com
```
