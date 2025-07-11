const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Helpdesk Backend is running....');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

