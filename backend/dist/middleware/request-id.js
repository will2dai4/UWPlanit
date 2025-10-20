"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const crypto_1 = require("crypto");
/**
 * Middleware to add a unique request ID to each request
 */
const requestId = (req, res, next) => {
    const id = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
};
exports.requestId = requestId;
//# sourceMappingURL=request-id.js.map