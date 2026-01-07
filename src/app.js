const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');



dotenv.config();


const app = express();

/* ------------------ Global Middlewares ------------------ */

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: {policy: 'cross-origin'}
}));

// Logging (dev = colorful, prod = concise)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ------------------ Routes ------------------ */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


const { requireAdmin, requireAuth } = require('./middleware/middleware');
const adminRoutes = require('./routes/adminroutes');
const userRoutes = require('./routes/userRoutes');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);


/* ------------------ Server ------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
