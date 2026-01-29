const { v4: uuidv4 } = require("uuid");
const { GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

class ProductService {
  constructor(productRepo) {
    this.productRepo = productRepo;
  }

  // Lấy tất cả sản phẩm chưa xóa mềm
  async getAllProducts() {
    const result = await this.productRepo.findAllActive();
    return result.Items || [];
  }

  // Lấy 1 sản phẩm theo ID
  async getProductById(id) {
    const command = new GetCommand({
      TableName: this.productRepo.tableName,
      Key: { id },
    });
    const result = await this.productRepo.docClient.send(command);
    return result.Item;
  }

  // Thêm sản phẩm
  async addProduct(data) {
    const product = {
      ...data,
      id: uuidv4(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    await this.productRepo.create(product);
    return product;
  }

  // Cập nhật sản phẩm
  async updateProduct(id, data) {
    const command = new UpdateCommand({
      TableName: this.productRepo.tableName,
      Key: { id },
      UpdateExpression:
        "SET #name = :name, #price = :price, #quantity = :quantity, #categoryId = :categoryId, #url_image = :url_image, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#name": "name",
        "#price": "price",
        "#quantity": "quantity",
        "#categoryId": "categoryId",
        "#url_image": "url_image",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":name": data.name,
        ":price": data.price,
        ":quantity": data.quantity,
        ":categoryId": data.categoryId,
        ":url_image": data.url_image,
        ":updatedAt": new Date().toISOString(),
      },
    });
    return await this.productRepo.docClient.send(command);
  }

  // Xóa mềm sản phẩm
  async deleteProduct(productId) {
    await this.productRepo.softDelete(productId);
  }
}
module.exports = ProductService;
