const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// route bich tjibli kol users
router.get("/", getAllUsers);

// route bich tjibli user b id mte3ou
router.get("/:id", getUserById);

// route bich tbadel user (update)
router.put("/:id", updateUser);

// route bich tfasa5 user
router.delete("/:id", deleteUser);

module.exports = router;
