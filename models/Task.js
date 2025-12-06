const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  titre: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  statut: { 
    type: String, 
    enum: ["todo", "doing", "done"], 
    default: "todo" 
  },
  deadline: { 
    type: Date 
  },
  projet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
  },
  utilisateurAssigné: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  createur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Task", taskSchema);