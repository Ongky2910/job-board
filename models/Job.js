const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  externalId: { type: String, unique: true, sparse: true }, 
  contractType: { type: String, enum: ["Full-Time", "Part-Time", "Contract", "Internship", "Temporary"], default: "Full-Time" },
  workType: { type: String, enum: ["Onsite", "Hybrid", "Remote"], default: "Onsite" },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return !this.externalId; 
    },
  },
  appliedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  savedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],   
  saveCount: { type: Number, default: 0 },  
  applyCount: { type: Number, default: 0 }, 
  deleted: { type: Boolean, default: false },                               
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;