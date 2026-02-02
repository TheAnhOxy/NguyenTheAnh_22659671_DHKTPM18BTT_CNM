const BaseRepository = require("./baseRepository");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

class ProductLogRepository extends BaseRepository {
  async findLogsByProductId(productId) {
    const params = {
      FilterExpression: "productId = :productId",
      ExpressionAttributeValues: { ":productId": productId },
    };
    return await this.findAll(params);
  }

  async findLogsByUserId(userId) {
    const params = {
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    };
    return await this.findAll(params);
  }

  async findLogsByAction(action) {
    const params = {
      FilterExpression: "action = :action",
      ExpressionAttributeValues: { ":action": action },
    };
    return await this.findAll(params);
  }

  async getAllLogs() {
    return await this.findAll();
  }
}
module.exports = ProductLogRepository;
