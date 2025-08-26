module.exports = {
  apps: [{
    name: 'einstein-essay-tutors-frontend',
    script: 'node',
    args: 'server.js',
    cwd: '/home/ubuntu/einstein-essay-tutors-frontend/.next/standalone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/home/ubuntu/logs/frontend-error.log',
    out_file: '/home/ubuntu/logs/frontend-out.log',
    log_file: '/home/ubuntu/logs/frontend-combined.log',
    time: true
  }]
}