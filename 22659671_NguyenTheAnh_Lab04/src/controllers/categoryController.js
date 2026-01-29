class CategoryController {
  constructor(categoryService) {
    this.categoryService = categoryService;
  }

  async renderCategories(req, res) {
    const categories = await this.categoryService.getAllCategories();
    res.render("categories", { categories });
  }
}

module.exports = CategoryController;
