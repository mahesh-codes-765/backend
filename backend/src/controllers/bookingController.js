const Booking = require('../models/Booking');
const Class = require('../models/Class');
const sendEmail = require('../utils/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Booking and get Payment Intent
const createBooking = async (req, res) => {
  try {
    const { classId } = req.body;
    
    const fitnessClass = await Class.findById(classId);
    if (!fitnessClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (fitnessClass.enrolledUsers.length >= fitnessClass.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      class: classId,
      trainer: fitnessClass.trainer,
      status: 'reserved',
      paymentStatus: 'paid'
    });

    // Add user to class enrolledUsers
    if (!fitnessClass.enrolledUsers.includes(req.user._id)) {
      fitnessClass.enrolledUsers.push(req.user._id);
      await fitnessClass.save();
    }

    // Send booking confirmation email
    await sendEmail({
      email: req.user.email,
      subject: 'Booking Confirmation',
      message: `Your booking for ${fitnessClass.title} is confirmed.`
    });

    res.status(201).json({
      booking,
      message: 'Booking successful! Payment completed.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm Payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    
    // In production, this should ideally be handled via Stripe Webhooks
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const booking = await Booking.findById(bookingId).populate('class').populate('trainer');
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      booking.paymentStatus = 'paid';
      booking.transactionId = paymentIntentId;
      await booking.save();
      
      const fitnessClass = await Class.findById(booking.class._id);
      if(!fitnessClass.enrolledUsers.includes(req.user._id)){
         fitnessClass.enrolledUsers.push(req.user._id);
         await fitnessClass.save();
      }

      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmation',
        message: `Your booking for ${fitnessClass.title} is confirmed.`
      });

      res.json({ message: 'Payment confirmed and booking completed successfully', booking });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('class').populate('trainer', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Trainer Bookings
const getTrainerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trainer: req.user._id }).populate('class').populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update all pending bookings to paid
const updatePendingBookings = async (req, res) => {
  try {
    const result = await Booking.updateMany(
      { paymentStatus: 'pending' },
      { $set: { paymentStatus: 'paid' } }
    );
    res.json({ message: `Updated ${result.modifiedCount} bookings to paid status` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, confirmPayment, getMyBookings, getTrainerBookings, updatePendingBookings };
