const express = require('express');

const { healthRouter } = require('./routes/healthRoutes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', healthRouter);

  return app;
}

module.exports = { createApp };
