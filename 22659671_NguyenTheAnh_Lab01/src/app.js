const express = require("express");
const path = require("path");
const session = require("express-session");
const productRoutes = require("./routes/product.routes");

const app = express();

// 1. Cấu hình Session
app.use(
  session({
    secret: "mysecretkey", // Chuỗi bí mật để mã hóa session
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // Session tồn tại trong 1 giờ
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Để dùng CSS/Image nếu cần

// 2. Middleware kiểm tra Login (Auth Guard)
const checkLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// 3. Định nghĩa các Route đặc biệt cho Login
const productController = require("./controllers/product.controller");

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Gắn cứng tài khoản theo yêu cầu
  if (username === "theanh123" && password === "123456") {
    req.session.user = username;
    res.redirect("/");
  } else {
    res.render("login", { error: "Sai tài khoản hoặc mật khẩu!" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// 4. Bảo vệ các route sản phẩm bằng checkLogin
app.use("/", checkLogin, productRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
