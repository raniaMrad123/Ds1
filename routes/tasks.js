const express = require("express");
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  getMyTasks,
  assignTaskToUser
} = require("../controllers/taskController");

const { auth, isManager } = require("../middleware/auth");

const router = express.Router();


router.post("/", auth, createTask);
router.get("/my-tasks", auth, getMyTasks);
router.get("/project/:projectId", auth, getTasksByProject);
router.get("/:id", auth, getTaskById);
router.get("/", auth, searchTasks);
router.put("/:id", auth, updateTask);
router.put("/:taskId/assign", auth, isManager, assignTaskToUser);
router.delete("/:id", auth, deleteTask);

module.exports = router;