const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], 
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }], 
});

const User = mongoose.model("User", userSchema);

module.exports = User;
