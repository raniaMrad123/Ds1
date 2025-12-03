const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Middleware bich nchoufo el user authentifié wala le 
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-motDePasse');
    
    if (!user) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.user = user; // Stocke les infos mta3  lutilisateur fil requête
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware bich nchoufou l'utilisateur est un manager
const isManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Accès refusé, droits manager requis' });
  }
  next();
};

module.exports = { auth, isManager };