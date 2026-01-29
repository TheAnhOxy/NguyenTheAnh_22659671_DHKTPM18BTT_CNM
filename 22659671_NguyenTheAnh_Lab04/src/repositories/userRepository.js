const BaseRepository = require("./baseRepository");
const { ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

class UserRepository extends BaseRepository {
  // Lấy tất cả user
  async findAll() {
    const command = new ScanCommand({ TableName: this.tableName });
    return await this.docClient.send(command);
  }

  // Tìm user theo username
  async findByUsername(username) {
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    });
    const result = await this.docClient.send(command);
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  // Lấy user theo ID
  async findById(id) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });
    const result = await this.docClient.send(command);
    return result.Item;
  }
}

module.exports = UserRepository;
