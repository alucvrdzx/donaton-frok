const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080';
const PORT = process.env.BFF_PORT || 3001;

module.exports = { GATEWAY_URL, PORT };
