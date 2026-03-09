module.exports = {
  apps: [
    {
      name: "sandbox-backend",
      script: "./server.js",

      instances: "max",
      exec_mode: "cluster",

      watch: false,
      autorestart: true,
      max_memory_restart: "500M",

      env_file: "/etc/node-env/SandBox/.env",


      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};