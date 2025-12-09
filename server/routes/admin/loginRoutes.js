const express = require("express");

const { Login, Logout } = require("../../controllers/admin/loginControllers");
const {checkAuth} = require("../../utils/authController");

const router = express.Router();

router.post("/login", Login);

router.get("/check-auth", checkAuth);

router.post("/logout", Logout);


module.exports = router;
