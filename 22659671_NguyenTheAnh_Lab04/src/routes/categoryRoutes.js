const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

module.exports = (categoryCtrl, categoryService) => {
  // List categories
  router.get("/", isLoggedIn, isAdmin, (req, res) =>
    categoryCtrl.renderCategories(req, res),
  );

  // Add category
  router.post("/", isLoggedIn, isAdmin, async (req, res) => {
    try {
      const { name, description } = req.body;
      await categoryService.addCategory({ name, description });
      res.json({ success: true, message: "Thêm danh mục thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
