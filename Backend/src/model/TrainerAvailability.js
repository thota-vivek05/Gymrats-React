const mongoose = require('mongoose');

const trainerAvailabilitySchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true,
    unique: true // A trainer should only have one availability document
  },
  workingHours: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      startTime: {
        type: String, // e.g., "09:00"
        required: true
      },
      endTime: {
        type: String, // e.g., "17:00"
        required: true
      }
    }
  ],
  personalMeetLink: {
    type: String, 
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainerAvailability', trainerAvailabilitySchema);