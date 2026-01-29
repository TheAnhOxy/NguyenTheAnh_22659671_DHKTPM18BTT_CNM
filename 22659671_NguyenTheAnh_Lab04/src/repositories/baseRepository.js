const {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

class BaseRepository {
  constructor(docClient, tableName) {
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async findAll(params = {}) {
    const command = new ScanCommand({ TableName: this.tableName, ...params });
    return await this.docClient.send(command);
  }

  async create(item) {
    const command = new PutCommand({ TableName: this.tableName, Item: item });
    return await this.docClient.send(command);
  }
}
module.exports = BaseRepository;
