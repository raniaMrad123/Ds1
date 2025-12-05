const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

// afficher laa3bed lkol ama ken manager ynajem ya3milha 
router.get("/", auth, isManager, getAllUsers);

// GET user by ID (ay  user 3amil login ynajem ya3milha ) 
router.get("/:id", auth, getUserById);
// ta3mil modification l user  (manager only)
router.put("/:id", auth, isManager, updateUser);

// fasakh  user (ken manager ynajem yfasakh)
router.delete("/:id", auth, isManager, deleteUser);
module.exports = router;
