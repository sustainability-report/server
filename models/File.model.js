const { Schema, model } = require("mongoose");

const fileSchema = new Schema (
  {
    nameOfFile: {
      type: String,
      required: true
    },
    file: {
      type: String,
      required: true
    },
    ownerFile: { type: String, required: true },
    ownerDetails: {
      firstName: String,
      lastName: String,
      email: String,
      image: String
    },
    members: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

module.exports = model("File", fileSchema);