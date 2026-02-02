# ProductLogs - Audit Trail Implementation

## Overview

Triển khai hệ thống ghi lại lịch sử thao tác (Audit Logs) cho các sản phẩm trong ứng dụng.

## Table Structure

| Thuộc tính | Kiểu   | Mô tả                                |
| ---------- | ------ | ------------------------------------ |
| logId (PK) | String | ID duy nhất của log                  |
| productId  | String | ID của sản phẩm                      |
| action     | String | Loại thao tác (CREATE/UPDATE/DELETE) |
| userId     | String | ID của user thực hiện thao tác       |
| time       | String | Thời gian thao tác (ISO 8601 format) |

## Files Created/Modified

### New Files

1. **src/repositories/productLogRepository.js**
   - Xử lý các truy vấn đến bảng ProductLogs
   - Methods: `create()`, `findLogsByProductId()`, `findLogsByUserId()`, `findLogsByAction()`, `getAllLogs()`

2. **src/services/productLogService.js**
   - Business logic cho logging
   - Methods:
     - `logCreateProduct(productId, userId)` - Ghi log khi thêm sản phẩm
     - `logUpdateProduct(productId, userId)` - Ghi log khi cập nhật sản phẩm
     - `logDeleteProduct(productId, userId)` - Ghi log khi xóa sản phẩm
     - `getAllLogs()` - Lấy tất cả logs
     - `getLogsByProductId(productId)` - Lấy logs theo productId
     - `getLogsByUserId(userId)` - Lấy logs theo userId
     - `getLogsByAction(action)` - Lấy logs theo action

3. **src/controllers/productLogController.js**
   - Xử lý HTTP requests cho logs
   - Endpoints: getAllLogs, getProductLogs, getUserLogs, getActionLogs

4. **src/routes/productLogRoutes.js**
   - Định nghĩa các routes để truy cập logs
   - Tất cả endpoints yêu cầu quyền admin

### Modified Files

1. **src/services/productService.js**
   - Cập nhật `addProduct()` để nhận userId
   - Cập nhật `updateProduct()` để nhận userId
   - Cập nhật `deleteProduct()` để nhận userId
   - Thêm logic gọi `productLogService` để ghi logs

2. **src/controllers/productController.js**
   - Cập nhật `handleSoftDelete()` để truyền userId

3. **src/routes/productRoutes.js**
   - Cập nhật route `/add` để truyền userId từ session
   - Cập nhật route `/edit/:id` để truyền userId từ session

4. **src/index.js**
   - Import ProductLogRepository và ProductLogService
   - Khởi tạo productLogRepo và productLogService
   - Khởi tạo ProductLogController
   - Mount route `/logs` cho product logs

## Usage

### API Endpoints

#### 1. Xem tất cả logs

```
GET /logs
```

Requires: Admin role

Response:

```json
{
  "success": true,
  "data": [
    {
      "logId": "uuid",
      "productId": "product-id",
      "action": "CREATE",
      "userId": "user-id",
      "time": "2026-01-29T10:30:00.000Z"
    }
  ]
}
```

#### 2. Xem logs của một sản phẩm

```
GET /logs/product/:productId
```

Requires: Admin role

#### 3. Xem logs của một user

```
GET /logs/user/:userId
```

Requires: Admin role

#### 4. Xem logs theo action

```
GET /logs/action?action=CREATE
```

Supported actions: CREATE, UPDATE, DELETE
Requires: Admin role

## Logging Flow

### 1. Create Product

```
POST /add
  ↓
ProductController → ProductService.addProduct(data, userId)
  ↓
ProductRepository.create(product)
  ↓
ProductLogService.logCreateProduct(productId, userId)
  ↓
ProductLogRepository.create(log)
```

### 2. Update Product

```
POST /edit/:id
  ↓
ProductController → ProductService.updateProduct(id, data, userId)
  ↓
ProductRepository.updateProduct(...)
  ↓
ProductLogService.logUpdateProduct(productId, userId)
  ↓
ProductLogRepository.create(log)
```

### 3. Delete Product

```
POST /delete/:id
  ↓
ProductController.handleSoftDelete(id, userId)
  ↓
ProductService.deleteProduct(productId, userId)
  ↓
ProductRepository.softDelete(...)
  ↓
ProductLogService.logDeleteProduct(productId, userId)
  ↓
ProductLogRepository.create(log)
```

## Features

✅ **Automatic Logging**: Logs được ghi tự động khi:

- Thêm sản phẩm (CREATE)
- Cập nhật sản phẩm (UPDATE)
- Xóa sản phẩm (DELETE)

✅ **User Tracking**: Ghi lại user ID thực hiện thao tác

✅ **Timestamp**: Lưu thời gian chính xác của mỗi thao tác

✅ **Query Logs**: Có thể truy vấn logs theo:

- Product ID
- User ID
- Action type
- Tất cả logs

✅ **Security**: Chỉ admin mới có quyền xem logs

## DynamoDB Setup

Đảm bảo bảng `ProductLogs` đã được tạo trong DynamoDB với:

- **Table Name**: `ProductLogs` (theo .env: `DYNAMODB_LOG_TABLE`)
- **Primary Key**: `logId` (String)
- **Global Secondary Indexes** (optional):
  - GSI 1: productId (for querying by product)
  - GSI 2: userId (for querying by user)
  - GSI 3: action (for querying by action type)

## Example Usage

### Get all logs

```bash
curl -X GET http://localhost:3000/logs \
  -H "Cookie: sessionId=..."
```

### Get logs for a specific product

```bash
curl -X GET http://localhost:3000/logs/product/product-123 \
  -H "Cookie: sessionId=..."
```

### Get CREATE actions only

```bash
curl -X GET "http://localhost:3000/logs/action?action=CREATE" \
  -H "Cookie: sessionId=..."
```

### Get all actions by a user

```bash
curl -X GET http://localhost:3000/logs/user/user-456 \
  -H "Cookie: sessionId=..."
```

## Error Handling

Tất cả endpoints đều có error handling:

- Returns 500 status code với error message nếu có lỗi
- Logs lỗi ra console cho debugging

## Future Enhancements

- [ ] Thêm view page để hiển thị logs dạng table/charts
- [ ] Thêm pagination cho danh sách logs
- [ ] Thêm export logs (CSV, Excel)
- [ ] Thêm filtering theo date range
- [ ] Thêm real-time monitoring dashboard
- [ ] Thêm database backup automated
