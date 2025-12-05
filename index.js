const express = require('express');
const helmet = require('helmet');
const connectDB = require('./config/db');
require('dotenv').config();


connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet()); // Sécurité générale
app.use(express.json()); // ta9ra el body mta3 les requêtes (JSON)

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users',require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});