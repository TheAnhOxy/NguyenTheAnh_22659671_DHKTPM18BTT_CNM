const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

module.exports = (productLogCtrl) => {
  /**
   * Xem tất cả logs (chỉ admin)
   */
  router.get("/", isLoggedIn, isAdmin, (req, res) =>
    productLogCtrl.getAllLogs(req, res),
  );

  /**
   * Xem logs của 1 sản phẩm (chỉ admin)
   */
  router.get("/product/:productId", isLoggedIn, isAdmin, (req, res) =>
    productLogCtrl.getProductLogs(req, res),
  );

  /**
   * Xem logs của 1 user (chỉ admin)
   */
  router.get("/user/:userId", isLoggedIn, isAdmin, (req, res) =>
    productLogCtrl.getUserLogs(req, res),
  );

  /**
   * Xem logs theo action (chỉ admin)
   * Sử dụng: /logs/action?action=CREATE hoặc UPDATE hoặc DELETE
   */
  router.get("/action", isLoggedIn, isAdmin, (req, res) =>
    productLogCtrl.getActionLogs(req, res),
  );

  return router;
};
