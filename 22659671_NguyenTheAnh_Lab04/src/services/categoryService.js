const { v4: uuidv4 } = require("uuid");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

class CategoryService {
  constructor(categoryRepo) {
    this.categoryRepo = categoryRepo;
  }

  // Lấy tất cả danh mục
  async getAllCategories() {
    const result = await this.categoryRepo.findAll();
    return result.Items || [];
  }

  // Lấy 1 danh mục theo ID
  async getCategoryById(categoryId) {
    const command = new GetCommand({
      TableName: this.categoryRepo.tableName,
      Key: { categoryId },
    });
    const result = await this.categoryRepo.docClient.send(command);
    return result.Item;
  }

  // Thêm danh mục
  async addCategory(data) {
    const id = uuidv4();
    const category = {
      id,
      categoryId: id,
      name: data.name,
      description: data.description || "",
      createdAt: new Date().toISOString(),
    };
    await this.categoryRepo.create(category);
    return category;
  }
}

module.exports = CategoryService;
