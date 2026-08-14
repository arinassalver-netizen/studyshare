const express = require("express");

const {
    getMaterials,
    getMyMaterials,
    getMaterialById,
    searchMaterials,
    createMaterial,
    deleteMaterial,
    downloadMaterial,
    rateMaterial
} = require("../controllers/materialController");

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// NOTE: specific routes ("/search", "/mine") must be declared
// before the generic "/:id" route, otherwise Express will try
// to match "search"/"mine" as an :id value.

router.get("/", getMaterials);

router.get("/search", searchMaterials);

router.get("/mine", protect, getMyMaterials);

router.post("/:id/rate", protect, rateMaterial);

router.get("/:id", getMaterialById);

router.post(
    "/",
    protect,
    upload.single("file"),
    createMaterial
);

router.post("/:id/download", protect, downloadMaterial);

router.delete("/:id", protect, deleteMaterial);

module.exports = router;