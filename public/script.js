const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

const dueDateInput = document.getElementById('due-date');
const categoryInput = document.getElementById('category');
const priorityInput = document.getElementById('priority');

function renderTask(task) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const span = document.createElement('span');
    const info = document.createElement('small');
    const button = document.createElement('button');

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    span.textContent = task.text;
    button.textContent = 'Hapus';

    let deadlineText = '-';

if (task.due_date) {
    deadlineText = new Date(task.due_date).toLocaleString('id-ID');
}

info.textContent =
    ` | Category: ${task.category || '-'} | Priority: ${task.priority || 1} | Deadline: ${deadlineText}`;

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
    li.appendChild(info);
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
        if (!Array.isArray(tasks)) {
            console.log(tasks);
            return;
        }

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
            text: todoText,
            due_date: dueDateInput.value || null,
            category: categoryInput.value || null,
            priority: Number(priorityInput.value) || 1
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(newTask) {
        renderTask(newTask);

        input.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        priorityInput.value = '1';
    });
});