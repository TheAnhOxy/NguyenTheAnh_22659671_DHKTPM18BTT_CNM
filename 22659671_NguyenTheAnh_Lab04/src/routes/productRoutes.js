const express = require("express");
const router = express.Router();
const multer = require("multer");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { isLoggedIn, isAdmin } = require("../middlewares/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

module.exports = (productCtrl, productService, categoryService, s3Client) => {
  // List products
  router.get("/", isLoggedIn, (req, res) => productCtrl.renderIndex(req, res));

  // Add product - GET
  router.get("/add", isLoggedIn, isAdmin, async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.render("add", { categories });
  });

  // Add product - POST
  router.post(
    "/add",
    isLoggedIn,
    isAdmin,
    upload.single("image"),
    async (req, res) => {
      const { name, price, quantity, categoryId } = req.body;
      const file = req.file;
      let url_image = "";

      try {
        if (file) {
          const fileName = `${Date.now()}-${file.originalname}`;
          await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: fileName,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );
          url_image = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        }

        await productService.addProduct({
          name,
          price: Number(price),
          quantity: Number(quantity),
          categoryId,
          url_image,
        });
        res.json({ success: true, message: "Thêm sản phẩm thành công!" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
    },
  );

  // Edit product - GET
  router.get("/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
      const product = await productService.getProductById(req.params.id);
      const categories = await categoryService.getAllCategories();
      res.render("edit", { product, categories });
    } catch (err) {
      res.status(500).send("Lỗi tải sản phẩm");
    }
  });

  // Edit product - POST
  router.post(
    "/edit/:id",
    isLoggedIn,
    isAdmin,
    upload.single("image"),
    async (req, res) => {
      const { id } = req.params;
      const { name, price, quantity, categoryId } = req.body;
      const file = req.file;

      try {
        const oldProduct = await productService.getProductById(id);
        let url_image = oldProduct.url_image || "";

        if (file) {
          // Xóa ảnh cũ
          if (oldProduct.url_image) {
            const oldFileName = oldProduct.url_image.split("/").pop();
            try {
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME,
                  Key: oldFileName,
                }),
              );
            } catch (err) {
              console.warn("Không xóa được ảnh cũ", err);
            }
          }

          // Upload ảnh mới
          const fileName = `${Date.now()}-${file.originalname}`;
          await s3Client.send(
            new PutObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: fileName,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );
          url_image = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        }

        await productService.updateProduct(id, {
          name,
          price: Number(price),
          quantity: Number(quantity),
          categoryId,
          url_image,
        });
        res.json({ success: true, message: "Cập nhật thành công!" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
    },
  );

  // Delete product
  router.post("/delete/:id", isLoggedIn, isAdmin, (req, res) =>
    productCtrl.handleSoftDelete(req, res),
  );

  return router;
};
