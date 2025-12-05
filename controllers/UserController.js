const User = require("../models/User");
const { hashPassword } = require("../utils/bcrypt");

// --------------------------------------------------
// affichage mte3 users eli mawjoudin lkol 
// --------------------------------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-motDePasse"); // <-- corriger
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// affichage users bil  ID mte3hom 
// --------------------------------------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-motDePasse"); // <-- corriger

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}; 

// --------------------------------------------------
// modification mte3 les informations mte3 users  
// --------------------------------------------------
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    // Si mot de passe → hash avant update
    if (updates.motDePasse) {
      updates.motDePasse = await hashPassword(updates.motDePasse); // <-- corriger
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-motDePasse"); // <-- corriger

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// t5asa5 users 
// --------------------------------------------------
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
