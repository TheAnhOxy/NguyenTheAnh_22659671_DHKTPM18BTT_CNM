class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  async renderIndex(req, res) {
    const products = await this.productService.getAllProducts();
    res.render("index", {
      products,
      user: req.session.user, // Truyền user để hiển thị UI khác nhau
    });
  }

  async handleSoftDelete(req, res) {
    const { id } = req.params;
    await this.productService.deleteProduct(id, req.session.user.id);
    res.redirect("/");
  }
}
module.exports = ProductController;
