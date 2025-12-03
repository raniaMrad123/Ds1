const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true 
  },
  login: {
    type: String,
    required: true,
    unique: true 
  },
  motDePasse: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'manager'], // yaani el role ma ynajem ykoun ken user wala manager 
    default: 'user' 
  },
  dateCreation: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);