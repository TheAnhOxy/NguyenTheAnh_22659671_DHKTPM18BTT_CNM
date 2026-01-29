class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async renderUsers(req, res) {
    const users = await this.userService.getAllUsers();
    res.render("users", { users });
  }
}

module.exports = UserController;
