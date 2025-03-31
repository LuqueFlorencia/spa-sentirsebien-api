const express = require("express");
const UserController = require("../controllers/userController");

const router = express.Router();

router.get("/", UserController.getUsers);
router.post("/", UserController.addUser);
router.get("/:id", UserController.getUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
