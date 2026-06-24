require('dotenv').config();

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/tasks', async function(req, res) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

app.post('/tasks', async function(req, res) {
    const { text, due_date, category, priority } = req.body;

    const newTask = {
        text: text,
        completed: false,
        due_date: due_date || null,
        category: category || null,
        priority: priority || 1
    };

    const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

app.patch('/tasks/:id', async function(req, res) {
    const id = Number(req.params.id);

    const updateData = {
        completed: req.body.completed
    };

    if (req.body.completed === true) {
        updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json(data);
});

app.delete('/tasks/:id', async function(req, res) {
    const id = Number(req.params.id);

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        return res.status(500).json({ message: error.message });
    }

    res.json({ message: 'Task deleted' });
});

app.listen(PORT, function() {
    console.log(`Server jalan di http://localhost:${PORT}`);
});