const { v4: uuidv4 } = require("uuid");
const { GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

class ProductService {
  constructor(productRepo, productLogService) {
    this.productRepo = productRepo;
    this.productLogService = productLogService;
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
  async addProduct(data, userId) {
    const product = {
      ...data,
      id: uuidv4(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    await this.productRepo.create(product);

    // Ghi log
    if (this.productLogService && userId) {
      try {
        await this.productLogService.logCreateProduct(product.id, userId);
        console.log(`✓ Log CREATE: productId=${product.id}, userId=${userId}`);
      } catch (err) {
        console.error(`✗ Lỗi ghi log CREATE: ${err.message}`);
      }
    }

    return product;
  }

  // Cập nhật sản phẩm
  async updateProduct(id, data, userId) {
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
    const result = await this.productRepo.docClient.send(command);

    // Ghi log
    if (this.productLogService && userId) {
      try {
        await this.productLogService.logUpdateProduct(id, userId);
        console.log(`✓ Log UPDATE: productId=${id}, userId=${userId}`);
      } catch (err) {
        console.error(`✗ Lỗi ghi log UPDATE: ${err.message}`);
      }
    }

    return result;
  }

  // Xóa mềm sản phẩm
  async deleteProduct(productId, userId) {
    await this.productRepo.softDelete(productId);

    // Ghi log
    if (this.productLogService && userId) {
      try {
        await this.productLogService.logDeleteProduct(productId, userId);
        console.log(`✓ Log DELETE: productId=${productId}, userId=${userId}`);
      } catch (err) {
        console.error(`✗ Lỗi ghi log DELETE: ${err.message}`);
      }
    }
  }
}
module.exports = ProductService;
