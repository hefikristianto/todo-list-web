const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/tasks', function(req, res) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
});

app.post('/tasks', function(req, res) {
    const tasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

    const newTask = {
        id: Date.now(),
        text: req.body.text,
        completed: false
    };

    tasks.push(newTask);
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));

    res.json(newTask);
});

app.delete('/tasks/:id', function(req, res) {
    const tasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const id = Number(req.params.id);

    const filteredTasks = tasks.filter(function(item) {
        return item.id !== id;
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(filteredTasks, null, 2));

    res.json({ message: 'Task deleted' });
});

app.patch('/tasks/:id', function(req, res) {
    const tasks = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const id = Number(req.params.id);

    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = req.body.completed;

    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));

    res.json(task);
});

app.listen(PORT, function() {
    console.log(`Server jalan di http://localhost:${PORT}`);
});