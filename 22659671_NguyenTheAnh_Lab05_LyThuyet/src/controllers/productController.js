require("dotenv").config();
const docClient = require("../models/productModel");
const {
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const tableName = process.env.DYNAMODB_TABLE_NAME || "Products";

exports.getAllProducts = async (req, res) => {
  try {
    const data = await docClient.send(
      new ScanCommand({ TableName: tableName }),
    );
    res.render("index", { products: data.Items || [], searchQuery: "" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi: " + err.message);
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.redirect("/");
    }

    const data = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "contains(#name, :query)",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":query": q.trim(),
        },
      }),
    );

    res.render("index", { products: data.Items || [], searchQuery: q });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi tìm kiếm: " + err.message);
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    const file = req.file;

    if (!name || !price) {
      return res.status(400).send("Vui lòng điền đầy đủ thông tin");
    }

    // Lưu đường dẫn tương đối để hiển thị trên web
    const url_image = file
      ? `/images/${file.filename}`
      : "/images/placeholder.png";

    const item = {
      id: uuidv4(),
      name,
      price: Number(price),
      url_image,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi lưu DB: " + err.message);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id },
      }),
    );
    if (!data.Item) {
      return res.status(404).send("Không tìm thấy sản phẩm");
    }
    res.render("edit", { product: data.Item });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi: " + err.message);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const file = req.file;

    if (!name || !price) {
      return res.status(400).send("Vui lòng điền đầy đủ thông tin");
    }

    // Lấy sản phẩm cũ để giữ ảnh nếu không upload ảnh mới
    const oldData = await docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id },
      }),
    );

    const url_image = file
      ? `/images/${file.filename}`
      : oldData.Item.url_image;

    const item = {
      id,
      name,
      price: Number(price),
      url_image,
    };

    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cập nhật: " + err.message);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id },
      }),
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi xóa: " + err.message);
  }
};
