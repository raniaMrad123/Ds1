const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// creation mta3 task
exports.createTask = async (req, res) => {
  try {
    const { titre, description, deadline, projetId, utilisateurAssigné } = req.body;
    
    // nchouf est ce que el projet mawjoud
    const project = await Project.findById(projetId);
    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    // nchouf ken lutilisateur aando accès lel projet
    // (propriétaire wala manager)
    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé au projet" });
    }

    let assignedUser = null;
    
    
    if (utilisateurAssigné) {
      // ken el MANAGER ynajem yaffecti user lel task
      if (req.user.role !== "manager") {
        return res.status(403).json({ 
          message: "Seul le manager peut affecter une tâche à un utilisateur" 
        });
      }
      
      // Nchoufou ken l’utilisateur elli 3ayeneh mawjud
      const userExists = await User.findById(utilisateurAssigné);
      if (!userExists) {
        return res.status(404).json({ message: "Utilisateur assigné introuvable" });
      }
      
      assignedUser = utilisateurAssigné;
    }

    const task = new Task({
      titre,
      description,
      deadline,
      projet: projetId,
      createur: req.user._id,  // Utilisateur eli sna3 el tache 
      utilisateurAssigné: assignedUser  
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// GET all tasks for a project

exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // nchoufo ken l user mawjoud 
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Projet introuvable" });
    }

    // Nchoufou el permissions
    // Manager ynajem ychouf les task lkol, sinon ken moula el projet 
    if (req.user.role !== "manager" && !project.proprietaire.equals(req.user._id)) {
      return res.status(403).json({ message: "Accès refusé au projet" });
    }

    const tasks = await Task.find({ projet: projectId })
      .populate("createur", "nom login")
      .populate("utilisateurAssigné", "nom login")
      .populate("projet", "nom");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// GET task by ID

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createur", "nom login")
      .populate("utilisateurAssigné", "nom login")
      .populate("projet", "nom proprietaire");

    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    // Nchoufou el permissions
    const project = task.projet;
    if (req.user.role !== "manager" && 
        !project.proprietaire.equals(req.user._id) &&
        !task.createur._id.equals(req.user._id) &&
        (!task.utilisateurAssigné || !task.utilisateurAssigné._id.equals(req.user._id))) {
      return res.status(403).json({ message: "Accès refusé à la tâche" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// UPDATE task

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("projet");
    
    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    // chkoun ynajem ybadel :
    // 1. el manager (ynajem ybadel kol chay)
    // 2. Le créateur de la tâche (ynajem ybadel ken l'assignation)
    // 3. L'utilisateur assigné (ynajem ybadel ken statut)

    const isManager = req.user.role === "manager";
    const isCreator = task.createur.equals(req.user._id);
    const isAssignedUser = task.utilisateurAssigné && task.utilisateurAssigné.equals(req.user._id);

    // Nchoufou el permissions
    if (!isManager && !isCreator && !isAssignedUser) {
      return res.status(403).json({ message: "Accès refusé à la tâche" });
    }

    // Restrictions selon le rôle
    const updates = { ...req.body };
    
    // 1. ken el manager ynajem ybadel l'utilisateur assigné
    if (updates.utilisateurAssigné && !isManager) {
      return res.status(403).json({ 
        message: "Seul le manager peut affecter une tâche à un utilisateur" 
      });
    }

    // 2. ken el manager ynajem ybadel le projet
    if (updates.projet && !isManager) {
      return res.status(403).json({ 
        message: "Seul le manager peut changer le projet d'une tâche" 
      });
    }

    // 3. L'utilisateur assigné ynajem ybadel ken le statut
    if (isAssignedUser && !isManager && !isCreator) {
      const allowedFields = ["statut"];
      const updateKeys = Object.keys(updates);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          return res.status(403).json({ 
            message: "Vous ne pouvez modifier que le statut de la tâche" 
          });
        }
      }
    }

    // Mettre à jour el tâche
    Object.assign(task, updates);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("createur", "nom login")
      .populate("utilisateurAssigné", "nom login")
      .populate("projet", "nom");

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// DELETE task

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("projet");
    
    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    // Qui peut supprimer?
    // 1. Le manager
    // 2. Le créateur de la tâche
    // 3. Le propriétaire du projet
    
    const isManager = req.user.role === "manager";
    const isCreator = task.createur.equals(req.user._id);
    const isProjectOwner = task.projet.proprietaire.equals(req.user._id);

    if (!isManager && !isCreator && !isProjectOwner) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// SEARCH tasks bil filters ou el tri

exports.searchTasks = async (req, res) => {
  try {
    const { 
      statut, 
      projet, 
      utilisateurAssigné, 
      createur,
      sortBy = "dateCreation", 
      order = "desc" 
    } = req.query;

    let filter = {};

    // Appliquer les filtres
    if (statut) filter.statut = statut;
    if (projet) filter.projet = projet;
    if (utilisateurAssigné) filter.utilisateurAssigné = utilisateurAssigné;
    if (createur) filter.createur = createur;

    // Gérer les permissions selon le rôle
    if (req.user.role !== "manager") {
      // el users el normaux ychoufou ken:
      // 1. Les tâches eli san3ouhom
      // 2. Les tâches qui leur sont assignées
      // 3. Les tâches mta3 les projets eli yemlkouhom
      
      // D'abord, trouver tous les projets dont l'utilisateur est propriétaire
      const userProjects = await Project.find({ proprietaire: req.user._id });
      const userProjectIds = userProjects.map(p => p._id);
      
      filter.$or = [
        { createur: req.user._id },
        { utilisateurAssigné: req.user._id },
        { projet: { $in: userProjectIds } }
      ];
    }

    // Gérer le tri
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = {};
    
    // Valider le champ de tri
    const allowedSortFields = ["titre", "statut", "deadline", "dateCreation"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "dateCreation";
    sortOptions[sortField] = sortOrder;

    // Exécuter la recherche
    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .populate("projet", "nom proprietaire")
      .populate("createur", "nom login")
      .populate("utilisateurAssigné", "nom login");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// GET my tasks 

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ utilisateurAssigné: req.user._id })
      .populate("projet", "nom")
      .populate("createur", "nom login")
      .sort({ dateCreation: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// ASSIGN task to user (manager only)

exports.assignTaskToUser = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body;

    // Vérifier ken el user manager
    if (req.user.role !== "manager") {
      return res.status(403).json({ 
        message: "Seul le manager peut affecter une tâche à un utilisateur" 
      });
    }

    // Vérifier ken tache mawjouda 
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    // Vérifier ken el user mawjoud
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Assigner la tâche
    task.utilisateurAssigné = userId;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("utilisateurAssigné", "nom login")
      .populate("projet", "nom");

    res.status(200).json({
      message: "Tâche assignée avec succès",
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};