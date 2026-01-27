const path = require("path"); // Đưa lên đầu để dùng cho dotenv
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log(
  "Check Key:",
  process.env.AWS_ACCESS_KEY_ID ? "Đã nhận Key" : "Chưa nhận được Key",
);
console.log("Region:", process.env.AWS_REGION);
const express = require("express");
const { v4: uuidv4 } = require("uuid"); // Đảm bảo đã npm install uuid@9.0.1
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const multer = require("multer");

const app = express();

// Cấu hình để tìm đúng thư mục views khi chạy từ src/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Khởi tạo AWS Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

const upload = multer({ storage: multer.memoryStorage() });

// Chức năng READ
app.get("/", async (req, res) => {
  try {
    const params = { TableName: process.env.DYNAMODB_TABLE_NAME };
    const data = await docClient.send(new ScanCommand(params));
    res.render("index", { products: data.Items });
  } catch (err) {
    console.error(err);
    res.send("Lỗi khi tải danh sách sản phẩm");
  }
});

// Chức năng CREATE
app.get("/add", (req, res) => res.render("add"));

app.post("/add", upload.single("image"), async (req, res) => {
  const { name, price, quantity } = req.body;
  const file = req.file;
  const id = uuidv4();
  let url_image = "";

  try {
    // Validate input
    if (!name || !price || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng điền đầy đủ thông tin (tên, giá, số lượng)",
      });
    }

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

    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
          id,
          name,
          price: Number(price),
          quantity: Number(quantity),
          url_image,
          createdAt: new Date().toISOString(),
        },
      }),
    );
    res.json({
      success: true,
      message: "Thêm sản phẩm thành công!",
      productId: id,
    });
  } catch (err) {
    console.error("Lỗi thêm sản phẩm:", err);
    res.status(500).json({
      success: false,
      error:
        err.message ||
        "Lỗi khi thêm sản phẩm. Vui lòng kiểm tra AWS credentials và bảng DynamoDB",
    });
  }
});

// Chức năng EDIT - Hiển thị form
app.get("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { id },
    };
    const { Item } = await docClient.send(new GetCommand(params));
    if (!Item) {
      return res.status(404).send("Sản phẩm không tìm thấy");
    }
    res.render("edit", { product: Item });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi tải sản phẩm");
  }
});

// Chức năng EDIT - Cập nhật sản phẩm
app.post("/edit/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;
  const file = req.file;

  try {
    // Validate input
    if (!name || !price || !quantity) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng điền đầy đủ thông tin (tên, giá, số lượng)",
      });
    }

    // Lấy sản phẩm cũ để biết ảnh cũ
    const getParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { id },
    };
    const { Item: oldProduct } = await docClient.send(
      new GetCommand(getParams),
    );

    if (!oldProduct) {
      return res
        .status(404)
        .json({ success: false, error: "Sản phẩm không tìm thấy" });
    }

    let url_image = oldProduct.url_image || "";

    // Nếu có ảnh mới, upload lên S3 và xóa ảnh cũ
    if (file) {
      // Xóa ảnh cũ nếu có
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
          console.warn("Cảnh báo: Không thể xóa ảnh cũ", err);
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

    // Cập nhật sản phẩm
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { id },
        UpdateExpression:
          "SET #name = :name, #price = :price, #quantity = :quantity, #url_image = :url_image, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#name": "name",
          "#price": "price",
          "#quantity": "quantity",
          "#url_image": "url_image",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":name": name,
          ":price": Number(price),
          ":quantity": Number(quantity),
          ":url_image": url_image,
          ":updatedAt": new Date().toISOString(),
        },
      }),
    );

    res.json({ success: true, message: "Cập nhật sản phẩm thành công!" });
  } catch (err) {
    console.error("Lỗi cập nhật sản phẩm:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Lỗi khi cập nhật sản phẩm",
    });
  }
});

// Chức năng DELETE
app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // 1. Lấy thông tin sản phẩm để biết tên file ảnh trên S3
    const product = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { id },
      }),
    );

    if (product.Item && product.Item.url_image) {
      // Tách tên file từ URL (lấy phần sau dấu / cuối cùng)
      const fileName = product.Item.url_image.split("/").pop();

      // 2. Xóa ảnh trên S3
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
        }),
      );
    }

    // 3. Xóa dữ liệu trong DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { id },
      }),
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Lỗi khi xóa sản phẩm");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
