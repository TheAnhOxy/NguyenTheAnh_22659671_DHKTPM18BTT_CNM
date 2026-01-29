const { v4: uuidv4 } = require("uuid");

class UserService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  // Lấy tất cả user
  async getAllUsers() {
    const result = await this.userRepo.findAll();
    return result.Items || [];
  }

  async createUser(data) {
    const user = {
      id: uuidv4(),
      username: data.username,
      password: data.password,
      role: data.role || "staff",
      createdAt: new Date().toISOString(),
    };
    await this.userRepo.create(user);
    return user;
  }

  // Xác thực đăng nhập
  async authenticate(username, password) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      return null;
    }

    // So sánh password trực tiếp (trong thực tế nên so sánh hash)
    if (user.password === password) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
    }

    return null;
  }
}

module.exports = UserService;
