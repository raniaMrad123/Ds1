const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// Inscription
const register = async (req, res) => {
  try {
    const { nom, login, motDePasse, role } = req.body;

    // nchoufo ken l'utilisateur mawjoud déjà
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return res.status(400).json({ message: 'Ce login est déjà utilisé' });
    }

    // Crypte le mtp
    const hashedPassword = await hashPassword(motDePasse);

    // création mtaa user jdid
    const user = new User({
      nom,
      login,
      motDePasse: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    // Génère le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    const { login, motDePasse } = req.body;

    // el user mawjoud wala le 
    const user = await User.findOne({ login });
    if (!user) {
      return res.status(400).json({ message: 'Login ou mot de passe incorrect' });
    }

    // Compare el mtp
    const isMatch = await comparePassword(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Login ou mot de passe incorrect' });
    }

    // Génère le token
    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nom: user.nom,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


module.exports = { register, login  };