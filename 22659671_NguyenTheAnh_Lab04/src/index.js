const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Config
const { docClient } = require("./config/database");
const s3Client = require("./config/s3");

// Repositories
const ProductRepository = require("./repositories/productRepository");
const CategoryRepository = require("./repositories/categoryRepository");
const UserRepository = require("./repositories/userRepository");
const ProductLogRepository = require("./repositories/productLogRepository");

// Services
const ProductService = require("./services/productService");
const CategoryService = require("./services/categoryService");
const UserService = require("./services/userService");
const ProductLogService = require("./services/productLogService");

// Controllers
const ProductController = require("./controllers/productController");
const CategoryController = require("./controllers/categoryController");
const UserController = require("./controllers/userController");
const ProductLogController = require("./controllers/productLogController");

// Initialize repositories
const productRepo = new ProductRepository(
  docClient,
  process.env.DYNAMODB_TABLE_NAME,
);
const categoryRepo = new CategoryRepository(
  docClient,
  process.env.DYNAMODB_CATEGORY_TABLE,
);
const userRepo = new UserRepository(docClient, process.env.DYNAMODB_USER_TABLE);
const productLogRepo = new ProductLogRepository(
  docClient,
  process.env.DYNAMODB_LOG_TABLE,
);

// Initialize services
const productService = new ProductService(
  productRepo,
  new ProductLogService(productLogRepo),
);
const categoryService = new CategoryService(categoryRepo);
const userService = new UserService(userRepo);

// Initialize controllers
const productCtrl = new ProductController(productService);
const categoryCtrl = new CategoryController(categoryService);
const userCtrl = new UserController(userService);
const productLogCtrl = new ProductLogController(
  new ProductLogService(productLogRepo),
);

// Express app setup
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: "iuh_key_secret",
    resave: false,
    saveUninitialized: true,
  }),
);

// Routes
const authRoutes = require("./routes/authRoutes")(userService);
const productRoutes = require("./routes/productRoutes")(
  productCtrl,
  productService,
  categoryService,
  s3Client,
);
const categoryRoutes = require("./routes/categoryRoutes")(
  categoryCtrl,
  categoryService,
);
const userRoutes = require("./routes/userRoutes")(userCtrl, userService);
const productLogRoutes = require("./routes/productLogRoutes")(productLogCtrl);

// Mount routes
app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/users", userRoutes);
app.use("/logs", productLogRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Lab3 Server running on http://localhost:${PORT}`),
);
