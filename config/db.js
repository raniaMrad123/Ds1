const mongoose = require('mongoose');
require('dotenv').config(); // bich najmou na9raw les variables men .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;