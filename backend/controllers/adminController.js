const fs = require("fs");
const path = require("path");

const User = require("../models/user");
const Material = require("../models/material");

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json(users);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// Get all materials
const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find()
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


// Suspend / unsuspend a user
const toggleUserSuspension = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isSuspended = !user.isSuspended;
        await user.save();

        res.status(200).json({
            message: user.isSuspended
                ? "User suspended"
                : "User reactivated",
            isSuspended: user.isSuspended
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update user status"
        });
    }
};


// Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};


// Approve / reject a material
const updateMaterialStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be pending, approved or rejected"
            });
        }

        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        material.status = status;
        await material.save();

        res.status(200).json({
            message: `Material marked as ${status}`,
            material
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update material status"
        });
    }
};


// Delete a material
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        // Delete the physical file
        if (material.fileUrl) {
            const filePath = path.join(
                __dirname,
                "..",
                material.fileUrl
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete the database record
        await Material.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Material and file deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete material"
        });
    }
};


// Get statistics
const getStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMaterials = await Material.countDocuments();
        const pendingApprovals = await Material.countDocuments({
            status: "pending"
        });

        const downloadData = await Material.aggregate([
            {
                $group: {
                    _id: null,
                    totalDownloads: {
                        $sum: "$downloads"
                    }
                }
            }
        ]);

        const totalDownloads =
            downloadData.length > 0
                ? downloadData[0].totalDownloads
                : 0;

        res.status(200).json({
            totalUsers,
            totalMaterials,
            totalDownloads,
            pendingApprovals
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch statistics"
        });
    }
};


module.exports = {
    getUsers,
    getMaterials,
    toggleUserSuspension,
    deleteUser,
    updateMaterialStatus,
    deleteMaterial,
    getStatistics
};