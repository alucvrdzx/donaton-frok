const axios = require('axios');
const { GATEWAY_URL } = require('../config');

const getAuthHeaders = (req) => {
    return req.headers.authorization ? { Authorization: req.headers.authorization } : {};
};

/**
 * Creates a generic proxy handler that forwards requests to the Spring Gateway.
 * Eliminates the repetitive try/catch + axios pattern across all routes.
 *
 * @param {string} method - HTTP method (get, post, put, patch, delete)
 * @param {string} gatewayPath - Path pattern on the gateway (use :param for URL params)
 * @param {object} options - { statusCode, passAuth, passQuery }
 */
const createProxy = (method, gatewayPath, options = {}) => {
    const { statusCode = 200, passAuth = true, passQuery = false } = options;

    return async (req, res) => {
        try {
            // Replace :param placeholders with actual request params
            let resolvedPath = gatewayPath;
            for (const [key, value] of Object.entries(req.params || {})) {
                resolvedPath = resolvedPath.replace(`:${key}`, value);
            }

            const url = `${GATEWAY_URL}${resolvedPath}`;
            const config = {
                method,
                url,
                headers: passAuth ? getAuthHeaders(req) : {},
            };

            // Attach body for methods that support it
            if (['post', 'put', 'patch'].includes(method) && req.body) {
                config.data = req.body;
            }

            // Forward query params if needed
            if (passQuery && req.query) {
                config.params = req.query;
            }

            const response = await axios(config);

            if (statusCode === 204) {
                return res.status(204).send();
            }

            res.status(statusCode).json(response.data);
        } catch (error) {
            const status = error.response?.status || 500;
            const data = error.response?.data || { error: 'Error del servidor' };
            res.status(status).json(data);
        }
    };
};

module.exports = { createProxy, getAuthHeaders };
