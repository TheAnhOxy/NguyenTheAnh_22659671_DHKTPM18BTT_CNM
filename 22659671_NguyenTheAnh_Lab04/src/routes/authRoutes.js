const express = require("express");
const router = express.Router();

module.exports = (userService) => {
  // Login page
  router.get("/login", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đăng nhập</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { background-color: #f5f5f5; min-height: 100vh; display: flex; align-items: center; font-family: Arial, sans-serif; }
          .login-card { max-width: 400px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="login-card">
            <div class="card">
              <div class="card-body p-4">
                <h4 class="text-center mb-4">Đăng nhập hệ thống</h4>
                <form id="loginForm">
                  <div class="mb-3">
                    <label class="form-label">Tên đăng nhập</label>
                    <input type="text" id="username" class="form-control" placeholder="Nhập username" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Mật khẩu</label>
                    <input type="password" id="password" class="form-control" placeholder="Nhập mật khẩu" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
                </form>
                <div id="error" class="alert alert-danger mt-3 d-none"></div>
              </div>
            </div>
          </div>
        </div>
        <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            
            try {
              const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
              });
              
              const data = await response.json();
              
              if (data.success) {
                window.location.href = '/';
              } else {
                errorDiv.textContent = data.error || 'Đăng nhập thất bại';
                errorDiv.classList.remove('d-none');
              }
            } catch (err) {
              errorDiv.textContent = 'Lỗi kết nối server';
              errorDiv.classList.remove('d-none');
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  // Login handler
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await userService.authenticate(username, password);

      if (user) {
        req.session.user = user;
        res.json({ success: true });
      } else {
        res.json({
          success: false,
          error: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Lỗi server" });
    }
  });

  // Logout
  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect("/login");
    });
  });

  // Test routes (optional)
  router.get("/login-test-admin", (req, res) => {
    req.session.user = { userId: "1", username: "admin_test", role: "admin" };
    res.redirect("/");
  });

  router.get("/login-test-staff", (req, res) => {
    req.session.user = { userId: "2", username: "staff_test", role: "staff" };
    res.redirect("/");
  });

  return router;
};
