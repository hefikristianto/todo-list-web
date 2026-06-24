const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

function renderTask(task) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const span = document.createElement('span');
    const button = document.createElement('button');

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    span.textContent = task.text;
    button.textContent = 'Hapus';

    button.addEventListener('click', function() {
        fetch(`/tasks/${task.id}`, {
            method: 'DELETE'
        })
        .then(function(response) {
            return response.json();
        })
        .then(function() {
            li.remove();
        });
    });

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            fetch(`/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: true
                })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function() {
                checkbox.remove();
                button.remove();
                completedList.appendChild(li);
            });
        }
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(button);

    if (task.completed) {
        checkbox.remove();
        button.remove();
        completedList.appendChild(li);
    } else {
        todoList.appendChild(li);
    }
}

fetch('/tasks')
    .then(function(response) {
        return response.json();
    })
    .then(function(tasks) {
        tasks.forEach(function(task) {
            renderTask(task);
        });
    });

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const todoText = input.value.trim();

    if (todoText === '') {
        return;
    }

    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: todoText
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(newTask) {
        renderTask(newTask);
        input.value = '';
    });
});