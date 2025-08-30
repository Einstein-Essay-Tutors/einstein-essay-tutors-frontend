module.exports = {
  apps: [{
    name: 'einstein-essay-tutors-frontend',
    script: 'server.js',
    cwd: '/var/www/essay-writing-tutors/einstein-essay-tutors-frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    // Memory-optimized settings for 2GB droplet
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=384',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      // Reduce memory usage
      NODE_OPTIONS: '--max-old-space-size=384'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      NODE_OPTIONS: '--max-old-space-size=384'
    },
    // Log configuration
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/frontend-error.log',
    out_file: '/var/log/frontend-out.log',
    log_file: '/var/log/frontend-combined.log',
    time: true,
    
    // Performance settings for limited resources
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Graceful shutdown
    shutdown_with_message: true
  }]
}