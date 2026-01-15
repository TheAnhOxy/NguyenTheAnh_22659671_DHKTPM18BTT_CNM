const express = require('express');
const path = require('path');
const productRoutes = require('./routes/product.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Sử dụng router đã định nghĩa
app.use('/', productRoutes);

app.listen(3000, () => console.log('🚀 Server: http://localhost:3000'));