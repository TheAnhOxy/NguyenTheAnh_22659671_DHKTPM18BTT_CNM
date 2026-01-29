module.exports = {
  // Kiểm tra đã đăng nhập chưa
  isLoggedIn: (req, res, next) => {
    if (req.session.user) return next();
    res.redirect("/login");
  },
  // Kiểm tra quyền Admin mới cho CRUD
  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") return next();
    res.status(403).send("Quyền truy cập bị từ chối: Chỉ dành cho Admin!");
  },
};
