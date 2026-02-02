const {
  DynamoDBClient,
  CreateTableCommand,
} = require("@aws-sdk/client-dynamodb");
require("dotenv").config();

const client = new DynamoDBClient({
  region: "us-west-2",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

const params = {
  TableName: process.env.DYNAMODB_TABLE_NAME,
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH", // Partition key
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S", // String
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

const createTable = async () => {
  try {
    console.log(`📋 Tạo bảng ${process.env.DYNAMODB_TABLE_NAME}...`);
    const data = await client.send(new CreateTableCommand(params));
    console.log("✅ Bảng đã được tạo thành công!");
    console.log("📊 Chi tiết bảng:", data.TableDescription);
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("✅ Bảng đã tồn tại!");
    } else {
      console.error("❌ Lỗi:", err.message);
    }
  }
};

createTable();
