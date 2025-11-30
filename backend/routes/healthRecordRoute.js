import express from 'express';
import { authUser } from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';
import { v2 as cloudinary } from 'cloudinary';
import HealthRecord from '../models/healthRecordModel.js';

const healthRecordRouter = express.Router();

// Upload health record
healthRecordRouter.post('/upload', authUser, upload.single('file'), async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: 'No file uploaded' });
    }

    // Upload to cloudinary
    const fileUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'health_records',
    });

    const healthRecord = new HealthRecord({
      userId,
      fileName: file.originalname,
      fileUrl: fileUpload.secure_url,
      fileType: file.mimetype,
      fileSize: file.size,
      description: description || '',
    });

    await healthRecord.save();

    res.json({
      success: true,
      message: 'Health record uploaded successfully',
      record: healthRecord,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
});

// Get user's health records
healthRecordRouter.get('/list', authUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await HealthRecord.find({ userId }).sort({ uploadDate: -1 });

    res.json({ success: true, records });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
});

// Delete health record
healthRecordRouter.delete('/delete/:recordId', authUser, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await HealthRecord.findOne({ _id: recordId, userId });

    if (!record) {
      return res.json({ success: false, message: 'Record not found' });
    }

    // Delete from cloudinary
    const publicId = record.fileUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    await HealthRecord.findByIdAndDelete(recordId);

    res.json({ success: true, message: 'Health record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
});

// Get patient health records (for doctors)
healthRecordRouter.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching health records for patient:', patientId);
    const records = await HealthRecord.find({ userId: patientId }).sort({ uploadDate: -1 });
    console.log('Found records:', records.length);

    res.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.json({ success: false, message: error.message });
  }
});

export default healthRecordRouter;
