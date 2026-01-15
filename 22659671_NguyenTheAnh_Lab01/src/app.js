const express = require("express");
const path = require("path");
const session = require("express-session");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const checkLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

const productController = require("./controllers/product.controller");

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
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

app.use("/", checkLogin, productRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
