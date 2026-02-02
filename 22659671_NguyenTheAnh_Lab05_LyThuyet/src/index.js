const express = require("express");
const path = require("path");
const productController = require("./controllers/productController");
const multer = require("multer");
require("dotenv").config();

const app = express();

// Cấu hình Multer để lưu ảnh vào thư mục public/images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình phục vụ file tĩnh để hiển thị ảnh trên giao diện
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", productController.getAllProducts);
app.get("/search", productController.searchProducts);
app.get("/add", (req, res) => res.render("add"));
app.get("/edit/:id", productController.getProductById);

// Route thêm sản phẩm có xử lý upload ảnh
app.post("/add", upload.single("image"), productController.addProduct);
app.post("/edit/:id", upload.single("image"), productController.updateProduct);
app.post("/delete/:id", productController.deleteProduct);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
