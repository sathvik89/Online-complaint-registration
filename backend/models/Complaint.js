const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Technical', 'Billing', 'General', 'Feedback'] 
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Pending',
    index: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  attachmentUrl: { type: String },
  messages: [messageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
