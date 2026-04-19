const mongoose = require('mongoose');

const trainerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qualifications: {
    type: [String],
    required: true,
  },
  expertise: {
    type: [String],
    required: true,
  },
  specialization: {
    type: [String],
    required: true,
  },
  photoUrl: {
    type: String, // URL from cloud storage or local path
    default: '',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  introductoryMessage: {
    type: String,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const TrainerProfile = mongoose.model('TrainerProfile', trainerProfileSchema);
module.exports = TrainerProfile;
