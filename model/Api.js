const mongoose = require("../node_modules/mongoose");

const ApiSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    required: true,
  },
  category: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Api = mongoose.model("api", ApiSchema);

module.exports = Api;
