import express from 'express';
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
} from '../controllers/bookingController';

const router = express.Router();

// Routes
router.post('/', createBooking);
router.get('/', getAllBookings);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);
router.delete('/:id', deleteBooking);

export default router;
