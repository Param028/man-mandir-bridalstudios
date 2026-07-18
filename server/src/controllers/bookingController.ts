import { Request, Response } from 'express';
import Booking from '../models/Booking';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, date, time, notes, amount } = req.body;

    // Generate booking ID
    const bookingId = `BKG-${Date.now().toString().slice(-6)}`;

    const booking = await Booking.create({
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      notes,
      amount: amount || 100,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    res.status(201).json({
      _id: booking._id,
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      createdAt: booking.createdAt,
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: error.message || 'Failed to create booking' });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings.map((booking) => ({
      id: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      createdAt: booking.createdAt,
    })));
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch bookings' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      id: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      createdAt: booking.createdAt,
    });
  } catch (error: any) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: error.message || 'Failed to update booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { status: 'cancelled', paymentStatus: 'refunded' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      id: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount,
      createdAt: booking.createdAt,
    });
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete({ bookingId: id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete booking' });
  }
};
