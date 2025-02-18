const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  appliedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: [],
    }
  ],
  savedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      default: [],
    }
  ],
  salaryRange: { 
    min: { type: Number },
    max: { type: Number }
  },
  category: { type: String },  
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
