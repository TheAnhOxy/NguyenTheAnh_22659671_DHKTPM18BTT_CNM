class ProductLogController {
  constructor(productLogService) {
    this.productLogService = productLogService;
  }

  /**
   * Xem tất cả logs
   */
  async getAllLogs(req, res) {
    try {
      const logs = await this.productLogService.getAllLogs();
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Xem logs của 1 sản phẩm
   */
  async getProductLogs(req, res) {
    try {
      const { productId } = req.params;
      const logs = await this.productLogService.getLogsByProductId(productId);
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Xem logs của 1 user
   */
  async getUserLogs(req, res) {
    try {
      const { userId } = req.params;
      const logs = await this.productLogService.getLogsByUserId(userId);
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Xem logs theo action
   */
  async getActionLogs(req, res) {
    try {
      const { action } = req.query;
      const logs = await this.productLogService.getLogsByAction(action);
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
module.exports = ProductLogController;
