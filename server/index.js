const express = require('express');
require('dotenv').config();
const connectDB = require('./dbConfig');
const productRouter = require('./routers/productRouters');
const cartRouter = require('./routers/cartRouter');
const reviewRouter = require('./routers/reviewRouter');
// const userRouter = require('./routers/userRouter');
const imgRouter = require('./routers/imgRouter');
const cors = require('cors');
const authRouter = require('./routers/authRouter');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors())
app.use('/api', productRouter);
app.use('/api', imgRouter);
// app.use('/api', userRouter);
app.use('/api', cartRouter);
app.use('/api', reviewRouter);
app.use('/api', authRouter);

const startServer = async () => {
  try {
    await connectDB(); 
    console.log('✅ MongoDB connected');

   
   // await insertProducts();


    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};


app.get('/', (req, res) => {
  res.send('Hello, World!');
});



startServer();