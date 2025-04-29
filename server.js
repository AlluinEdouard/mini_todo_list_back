const express = require('express');
const fs = require('fs'); // lire et écrire dans tasks
const app = express();
const PORT = 3000;

// Middleware pour lire le body JSON
app.use(express.json());

// Middleware pour permettre les requêtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gestion des requêtes préflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Chemin du fichier txt
const FILE_PATH = './tasks.txt';

// Fonction pour lire les tâches
function readTasks() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; // Si fichier vide ou non existant
    }
}

// Fonction pour écrire les tâches
function writeTasks(tasks) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
}

// === ROUTES ===

// GET : récupérer toutes les tâches
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// POST : ajouter une nouvelle tâche
app.post('/tasks', (req, res) => {
    const tasks = readTasks();
    const newTask = req.body; // { id: 1, title: "faire les courses" }
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json({ message: 'Tâche ajoutée.' });
});

// PUT : modifier une tâche
app.put('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;

    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedTask };
        writeTasks(tasks);
        res.json({ message: 'Tâche mise à jour.' });
    } else {
        res.status(404).json({ message: 'Tâche non trouvée.' });
    }
});

// DELETE : supprimer une tâche
app.delete('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const newTasks = tasks.filter(task => task.id !== taskId);

    if (tasks.length === newTasks.length) {
        res.status(404).json({ message: 'Tâche non trouvée.' });
    } else {
        writeTasks(newTasks);
        res.json({ message: 'Tâche supprimée.' });
    }
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
