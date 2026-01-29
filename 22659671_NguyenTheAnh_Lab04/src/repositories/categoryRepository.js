const BaseRepository = require("./baseRepository");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

class CategoryRepository extends BaseRepository {
  // Lấy tất cả category
  async findAll() {
    const command = new ScanCommand({ TableName: this.tableName });
    return await this.docClient.send(command);
  }
}

module.exports = CategoryRepository;
