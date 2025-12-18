module.exports = {
  apps: [
    {
      name: "agano-prod",
      script: "npm",
      args: "run start",
      env: {
        PORT: 1952,
      },
      autorestart: true,
    },
  ],
};
