const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

// GET all users (manager only)
router.get("/", auth, isManager, getAllUsers);

// GET user by ID (any authenticated user)
router.get("/:id", auth, getUserById);
// PUT update user (manager only)
router.put("/:id", auth, isManager, updateUser);

// DELETE user (manager only)
router.delete("/:id", auth, isManager, deleteUser);
module.exports = router;
