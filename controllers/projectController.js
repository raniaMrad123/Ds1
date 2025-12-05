const Project = require("../models/Project");

// --------------------------------------------------
// CREATE project
// --------------------------------------------------
exports.createProject = async (req, res) => {
  try {
    const { nom, description, statut } = req.body;
    const project = new Project({
      nom,
      description,
      statut,
      proprietaire: req.user._id   // user connecté
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// GET all projects
// --------------------------------------------------
exports.getAllProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "manager") {
      projects = await Project.find().populate("proprietaire", "nom login role");
    } else {
      projects = await Project.find({ proprietaire: req.user._id });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// GET project by ID
// --------------------------------------------------
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("proprietaire", "nom login role");
    if (!project) return res.status(404).json({ message: "Projet introuvable" });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// UPDATE project
// --------------------------------------------------
exports.updateProject = async (req, res) => {
  try {
    const updates = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Seul le manager ou le propriétaire peut modifier
    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    Object.assign(project, updates);
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// --------------------------------------------------
// DELETE project
// --------------------------------------------------
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Seul le manager ou le propriétaire peut supprimer
    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await project.deleteOne();
    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
