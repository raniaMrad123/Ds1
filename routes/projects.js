const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { auth, isManager } = require("../middleware/auth");

const router = express.Router();

// CREATE project (any authenticated user)
router.post("/", auth, createProject);

// GET all projects
router.get("/", auth, getAllProjects);

// GET project by ID
router.get("/:id", auth, getProjectById);

// UPDATE project
router.put("/:id", auth, updateProject);

// DELETE project
router.delete("/:id", auth, deleteProject);

module.exports = router;
