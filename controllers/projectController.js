const Project = require("../models/Project");
const mongoose = require("mongoose");

// --------------------------------------------------
// na3mil project jdid 
// --------------------------------------------------
exports.createProject = async (req, res) => {
  try {
    const { nom, description, statut } = req.body;

    if (!nom?.trim()) {
      return res.status(400).json({ message: "Le nom du projet est obligatoire" });
    }

    const project = new Project({
      nom: nom.trim(),
      description: description?.trim() || "",
      statut: statut || "en_attente",
      proprietaire: req.user._id,
    });

    await project.save();
    await project.populate("proprietaire", "nom login role");

    res.status(201).json(project);
  } catch (error) {
    console.error("Erreur création projet:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du projet" });
  }
};

// --------------------------------------------------
// Affichage mte3 les projets lkol  projects → recherche, filtre statut, tri, pagination
// --------------------------------------------------
exports.getAllProjects = async (req, res) => {
  try {
    const {
      search,
      statut,                 // filtre par statut
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    // user 3adi eli mouch manager just ynajem ychouf lprojects mte3ou 
    if (req.user.role !== "manager") {
      filter.proprietaire = req.user._id;
    }

    if (statut) filter.statut = statut;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ nom: regex }, { description: regex }];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate("proprietaire", "nom login role")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      projects,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Erreur récupération projets:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des projets" });
  }
};

// --------------------------------------------------
// GET project by ID 
// --------------------------------------------------
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID de projet invalide" });
    }

    const project = await Project.findById(id).populate("proprietaire", "nom login role");

    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Erreur getProjectById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --------------------------------------------------
// modification projet
// --------------------------------------------------
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID de projet invalide" });
    }

    const allowedFields = ["nom", "description", "statut"];
    const updates = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((acc, key) => {
        acc[key] = req.body[key];
        return acc;
      }, {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Aucune donnée valide à mettre à jour" });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    Object.assign(project, updates);
    await project.save();
    await project.populate("proprietaire", "nom login role");

    res.status(200).json(project);
  } catch (error) {
    console.error("Erreur mise à jour projet:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour" });
  }
};

// --------------------------------------------------
// nfaskhouu  projet 
// --------------------------------------------------
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID de projet invalide" });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    await Project.deleteOne({ _id: id });
    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression projet:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};

module.exports = exports;
