const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

module.exports = (userCtrl, userService) => {
  // List users
  router.get("/", isLoggedIn, isAdmin, (req, res) =>
    userCtrl.renderUsers(req, res),
  );

  // Add user
  router.post("/", isLoggedIn, isAdmin, async (req, res) => {
    try {
      const { username, password, role } = req.body;

      // Kiểm tra username đã tồn tại
      const existingUser = await userService.userRepo.findByUsername(username);
      if (existingUser) {
        return res.json({
          success: false,
          error: "Tên đăng nhập đã tồn tại",
        });
      }

      await userService.createUser({ username, password, role });
      res.json({ success: true, message: "Tạo tài khoản thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
