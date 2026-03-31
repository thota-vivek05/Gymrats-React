const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // e.g., "14:00"
    required: true
  },
  endTime: {
    type: String, // e.g., "15:00"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  meetLink: {
    type: String, // Populated from TrainerAvailability upon approval
    default: ""
  },
  notes: {
    type: String, // E.g., User saying: "I want to discuss my deadlift form"
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);