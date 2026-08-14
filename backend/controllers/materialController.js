const fs = require("fs");
const path = require("path");

const Material = require("../models/material");
const Rating = require("../models/Rating");
const Download = require("../models/download");


// GET all materials (public - only approved materials are visible)
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ status: "approved" })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(materials);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch materials"
        });
    }
};


// GET materials uploaded by the logged-in user (any status)
const getMyMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ uploadedBy: req.user.id })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(materials);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch your materials"
        });
    }
};


// GET material by ID
const getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate("uploadedBy", "name email");

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        res.status(200).json(material);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch material"
        });
    }
};


// SEARCH materials
const searchMaterials = async (req, res) => {
    try {
        const { q } = req.query;

        const materials = await Material.find({
            status: "approved",
            $or: [
                { title: { $regex: q, $options: "i" } },
                { subject: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        })
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });

        res.status(200).json(materials);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Search failed"
        });
    }
};

const createMaterial = async (req, res) => {
    try {
        const { title, subject, description } = req.body;

        if (!title || !subject || !description) {
            return res.status(400).json({
                message: "Title, subject and description are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        const material = new Material({
            title,
            subject,
            description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            uploadedBy: req.user.id
        });

        await material.save();

        res.status(201).json({
            message: "Material uploaded successfully",
            material
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to upload material"
        });
    }
};
// DELETE a material (owner or admin only)
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        const isOwner = material.uploadedBy.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "You are not allowed to delete this material"
            });
        }

        if (material.fileUrl) {
            const filePath = path.join(__dirname, "..", material.fileUrl);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Material.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Material deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete material"
        });
    }
};


const downloadMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        // Increase download count
        material.downloads += 1;
        await material.save();

        // Save who downloaded what
        await Download.create({
            user: req.user.id,
            material: material._id
        });

        res.status(200).json({
            message: "Download recorded successfully",
            downloads: material.downloads,
            fileUrl: material.fileUrl
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to download material"
        });
    }
};
const rateMaterial = async (req, res) => {

    try {

        const { rating } = req.body;

        const materialId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });
        }

        const material =
            await Material.findById(materialId);

        if (!material) {

            return res.status(404).json({
                message: "Material not found."
            });
        }

        /*
           Check whether this user has
           already rated this material.
        */

       const existingRating =
    await Rating.findOne({
        material: materialId,
        user: req.user.id
    });

        if (existingRating) {

            /*
               Update existing rating
            */

            existingRating.rating = rating;

            await existingRating.save();

        } else {

            /*
               Create new rating
            */

          await Rating.create({
    material: materialId,
    user: req.user.id,
    rating: rating
});
        }

        /*
           Recalculate average
           
        */

        const ratings =
            await Rating.find({
                material: materialId
            });

        const total =
            ratings.reduce(
                (sum, item) => sum + item.rating,
                0
            );

        const average =
            ratings.length
                ? total / ratings.length
                : 0;

        material.rating =
            Number(average.toFixed(1));

        material.ratingCount =
            ratings.length;

        await material.save();

        res.json({
            message: "Rating submitted successfully.",
            rating: material.rating,
            ratingCount: material.ratingCount
        });

    } catch (error) {

        console.error(
            "Rating error:",
            error
        );

        res.status(500).json({
            message: "Failed to submit rating."
        });
    }
};

module.exports = {
    getMaterials,
    getMyMaterials,
    getMaterialById,
    searchMaterials,
    createMaterial,
    deleteMaterial,
    downloadMaterial,
    rateMaterial
};