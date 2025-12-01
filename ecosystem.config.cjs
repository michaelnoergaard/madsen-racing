module.exports = {
  apps: [{
    name: 'madsen-racing-dev',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/michael/projects/madsen-racing',
    env: {
      NODE_ENV: 'development'
    },
    watch: false,
    max_memory_restart: '500M',
    autorestart: true,
    restart_delay: 5000
  }]
};