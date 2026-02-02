const { v4: uuidv4 } = require("uuid");

class ProductLogService {
  constructor(productLogRepo) {
    this.productLogRepo = productLogRepo;
  }

  /**
   * Ghi log khi thêm sản phẩm
   */
  async logCreateProduct(productId, userId) {
    const log = {
      logId: uuidv4(),
      productId,
      action: "CREATE",
      userId,
      time: new Date().toISOString(),
    };
    await this.productLogRepo.create(log);
    return log;
  }

  /**
   * Ghi log khi cập nhật sản phẩm
   */
  async logUpdateProduct(productId, userId) {
    const log = {
      logId: uuidv4(),
      productId,
      action: "UPDATE",
      userId,
      time: new Date().toISOString(),
    };
    await this.productLogRepo.create(log);
    return log;
  }

  /**
   * Ghi log khi xóa sản phẩm
   */
  async logDeleteProduct(productId, userId) {
    const log = {
      logId: uuidv4(),
      productId,
      action: "DELETE",
      userId,
      time: new Date().toISOString(),
    };
    await this.productLogRepo.create(log);
    return log;
  }

  /**
   * Lấy tất cả log
   */
  async getAllLogs() {
    const result = await this.productLogRepo.getAllLogs();
    return result.Items || [];
  }

  /**
   * Lấy log theo productId
   */
  async getLogsByProductId(productId) {
    const result = await this.productLogRepo.findLogsByProductId(productId);
    return result.Items || [];
  }

  /**
   * Lấy log theo userId
   */
  async getLogsByUserId(userId) {
    const result = await this.productLogRepo.findLogsByUserId(userId);
    return result.Items || [];
  }

  /**
   * Lấy log theo action
   */
  async getLogsByAction(action) {
    const result = await this.productLogRepo.findLogsByAction(action);
    return result.Items || [];
  }
}
module.exports = ProductLogService;
