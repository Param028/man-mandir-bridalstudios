import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

import adminRoutes from './routes/adminRoutes';
import productRoutes from './routes/productRoutes';
import heroVideoRoutes from './routes/heroVideoRoutes';
import galleryRoutes from './routes/galleryRoutes';
import photoOfWeekRoutes from './routes/photoOfWeekRoutes';
import bookingRoutes from './routes/bookingRoutes';

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/hero-video', heroVideoRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/photos-of-week', photoOfWeekRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error', error: err });
});

// Server listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
