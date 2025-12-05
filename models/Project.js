const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  nom: { type: String, required: true },       // nom du projet
  description: { type: String },               // description optionnelle
  proprietaire: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ID du créateur
  statut: { type: String, enum: ["en cours", "terminé", "en pause"], default: "en cours" },
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", projectSchema);
