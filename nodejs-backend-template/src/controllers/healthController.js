const { buildHealthResponse } = require('../services/healthService');

function getHealth(_request, response) {
  response.status(200).json(buildHealthResponse());
}

module.exports = { getHealth };
