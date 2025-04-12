import mongoose from 'mongoose';
import { env } from '../env';

// MongoDB connection URI
const MONGODB_URI = env.MONGODB_URI as string;

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Define file upload schema and model
const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    type: { 
        type: String,
        enum: ['pdf', 'html'],
        required: true
    },
    path: { type: String, required: true },
    size: { type: Number, required: true }
});

// Create model
export const FileModel = mongoose.model('File', fileSchema); 