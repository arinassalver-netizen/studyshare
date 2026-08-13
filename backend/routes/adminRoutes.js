const express = require("express");

const {
    getUsers,
    getMaterials,
    toggleUserSuspension,
    deleteUser,
    updateMaterialStatus,
    deleteMaterial,
    getStatistics
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// All admin routes require login + admin role
router.use(protect);
router.use(adminOnly);

// Statistics
router.get("/stats", getStatistics);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/suspend", toggleUserSuspension);
router.delete("/users/:id", deleteUser);

// Materials
router.get("/materials", getMaterials);
router.patch("/materials/:id/status", updateMaterialStatus);
router.delete("/materials/:id", deleteMaterial);

module.exports = router;