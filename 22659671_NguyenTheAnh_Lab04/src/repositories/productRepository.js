const BaseRepository = require("./baseRepository");
const { UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

class ProductRepository extends BaseRepository {
  async findAllActive() {
    const params = {
      FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :false",
      ExpressionAttributeValues: { ":false": false },
    };
    return await this.findAll(params);
  }
  async softDelete(id) {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: "SET isDeleted = :true, updatedAt = :date",
      ExpressionAttributeValues: {
        ":true": true,
        ":date": new Date().toISOString(),
      },
    });
    return await this.docClient.send(command);
  }
}
module.exports = ProductRepository;
