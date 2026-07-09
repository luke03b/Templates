function buildHealthResponse() {
  return {
    status: 'UP',
    message: 'Node.js backend template is running',
  };
}

module.exports = { buildHealthResponse };
