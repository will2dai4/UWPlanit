"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courses_1 = __importDefault(require("./courses"));
const graph_1 = __importDefault(require("./graph"));
const plans_1 = __importDefault(require("./plans"));
const checklist_1 = __importDefault(require("./checklist"));
const admin_1 = __importDefault(require("./admin"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// Mount route modules
router.use('/courses', courses_1.default);
router.use('/graph', graph_1.default);
router.use('/plans', plans_1.default);
// Checklist routes are nested under plans
// but we also support them at the top level for convenience
router.use('/plans', checklist_1.default);
// Admin routes (ETL, maintenance, etc.)
router.use('/admin', admin_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map