import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String, // pdf, jpg, png, etc.
    required: true,
  },
  fileSize: {
    type: Number, // in bytes
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

export default HealthRecord;
