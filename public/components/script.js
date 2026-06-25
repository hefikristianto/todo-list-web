const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const completedList = document.getElementById('completed-list');

const dueDateInput = document.getElementById('due-date');
const categoryInput = document.getElementById('category');
const priorityInput = document.getElementById('priority');

const totalCount = document.getElementById('total-count');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');
const taskCount = document.getElementById('task-count');

const sortActive = document.getElementById('sort-active');
const completedSearch = document.getElementById('completed-search');

const typingText = document.getElementById('typing-text');

const pageLoader = document.getElementById('page-loader');
const loaderText = document.getElementById('loader-text');

let allTasks = [];

const typingTexts = ['Organize.', 'Track.', 'Finish.'];
let typingTextIndex = 0;
let typingCharIndex = 0;
let typingIsDeleting = false;

function showLoader(message) {
    if (loaderText) {
        loaderText.textContent = message || 'Processing...';
    }

    if (pageLoader) {
        pageLoader.classList.remove('hide');
    }
}

function hideLoader() {
    if (pageLoader) {
        pageLoader.classList.add('hide');
    }
}

function typeEffect() {
    if (!typingText) return;

    const currentText = typingTexts[typingTextIndex];

    if (typingIsDeleting) {
        typingText.textContent = currentText.substring(0, typingCharIndex - 1);
        typingCharIndex--;
    } else {
        typingText.textContent = currentText.substring(0, typingCharIndex + 1);
        typingCharIndex++;
    }

    let speed = typingIsDeleting ? 40 : 75;

    if (!typingIsDeleting && typingCharIndex === currentText.length) {
        speed = 1200;
        typingIsDeleting = true;
    } else if (typingIsDeleting && typingCharIndex === 0) {
        typingIsDeleting = false;
        typingTextIndex = (typingTextIndex + 1) % typingTexts.length;
        speed = 350;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

function formatDeadline(value) {
    if (!value) return '-';

    return value.replace('T', ' ').substring(0, 16);
}

function formatCompletedAt(value) {
    if (!value) return '';

    const completedDate = new Date(value);

    return (
        completedDate.getFullYear() + '-' +
        String(completedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(completedDate.getDate()).padStart(2, '0') + ' ' +
        String(completedDate.getHours()).padStart(2, '0') + ':' +
        String(completedDate.getMinutes()).padStart(2, '0')
    );
}

function getPriorityText(priority) {
    if (Number(priority) === 3) return 'High';
    if (Number(priority) === 2) return 'Medium';
    return 'Low';
}

function getPriorityClass(priority) {
    if (Number(priority) === 3) return 'priority-high';
    if (Number(priority) === 2) return 'priority-medium';
    return 'priority-low';
}

function getPriorityColor(priority) {
    if (Number(priority) === 3) return '#fb7185';
    if (Number(priority) === 2) return '#facc15';
    return '#4ade80';
}

function updateStats() {
    const activeTasks = allTasks.filter(task => !task.completed).length;
    const completedTasks = allTasks.filter(task => task.completed).length;
    const totalTasks = allTasks.length;

    if (totalCount) totalCount.textContent = totalTasks;
    if (activeCount) activeCount.textContent = activeTasks;
    if (completedCount) completedCount.textContent = completedTasks;
    if (taskCount) taskCount.textContent = totalTasks;
}

function clearLists() {
    todoList.innerHTML = '';
    completedList.innerHTML = '';
}

function getSmartScore(task) {
    const priority = Number(task.priority) || 1;
    let deadlineScore = 0;

    if (task.due_date) {
        const now = new Date();
        const due = new Date(task.due_date);
        const diff = due - now;

        deadlineScore = diff > 0 ? 1000000000 / diff : 9999;
    }

    return priority * 1000 + deadlineScore;
}

function sortActiveTasks(tasks) {
    const sortValue = sortActive ? sortActive.value : 'default';

    const activeTasks = tasks.filter(task => !task.completed);

    if (sortValue === 'priority-desc') {
        activeTasks.sort((a, b) => Number(b.priority) - Number(a.priority));
    }

    if (sortValue === 'priority-asc') {
        activeTasks.sort((a, b) => Number(a.priority) - Number(b.priority));
    }

    if (sortValue === 'deadline-asc') {
        activeTasks.sort((a, b) => {
            return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
        });
    }

    if (sortValue === 'smart') {
        activeTasks.sort((a, b) => getSmartScore(b) - getSmartScore(a));
    }

    return activeTasks;
}

function filterCompletedTasks(tasks) {
    const keyword = completedSearch ? completedSearch.value.toLowerCase() : '';

    return tasks.filter(task => {
        if (!task.completed) return false;

        const searchableText = `
            ${task.text || ''}
            ${task.category || ''}
            ${task.priority || ''}
            ${task.due_date || ''}
            ${task.completed_at || ''}
        `.toLowerCase();

        return searchableText.includes(keyword);
    });
}

function renderTask(task) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const content = document.createElement('div');
    const title = document.createElement('p');
    const meta = document.createElement('div');
    const actions = document.createElement('div');
    const button = document.createElement('button');

    li.className = 'task-card';
    li.style.setProperty('--priority-color', getPriorityColor(task.priority));

    if (task.completed) {
        li.classList.add('completed');
    }

    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;

    content.className = 'task-content';

    title.className = 'task-title';
    title.textContent = task.text;

    meta.className = 'task-meta';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge';
    categoryBadge.textContent = `📁 ${task.category || '-'}`;

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge ${getPriorityClass(task.priority)}`;
    priorityBadge.textContent = `⚑ ${getPriorityText(task.priority)}`;

    const deadlineBadge = document.createElement('span');
    deadlineBadge.className = 'badge';
    deadlineBadge.textContent = `📅 ${formatDeadline(task.due_date)}`;

    meta.appendChild(categoryBadge);
    meta.appendChild(priorityBadge);
    meta.appendChild(deadlineBadge);

    if (task.completed_at) {
        const completedBadge = document.createElement('span');
        completedBadge.className = 'badge priority-low';
        completedBadge.textContent = `✅ ${formatCompletedAt(task.completed_at)}`;
        meta.appendChild(completedBadge);
    }

    content.appendChild(title);
    content.appendChild(meta);

    actions.className = 'task-actions';

    button.className = 'delete-btn';
    button.textContent = '🗑';

    button.addEventListener('click', function() {
        showLoader('Deleting task...');

        fetch(`/tasks/${task.id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(function() {
            allTasks = allTasks.filter(item => item.id !== task.id);
            renderAllTasks();
        })
        .catch(function(error) {
            console.error('Delete error:', error);
            alert('Gagal menghapus task.');
        })
        .finally(function() {
            hideLoader();
        });
    });

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            showLoader('Completing task...');

            fetch(`/tasks/${task.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: true
                })
            })
            .then(response => response.json())
            .then(function(updatedTask) {
                allTasks = allTasks.map(item => {
                    if (item.id === updatedTask.id) {
                        return updatedTask;
                    }

                    return item;
                });

                renderAllTasks();
            })
            .catch(function(error) {
                console.error('Complete error:', error);
                checkbox.checked = false;
                alert('Gagal menyelesaikan task.');
            })
            .finally(function() {
                hideLoader();
            });
        }
    });

    actions.appendChild(button);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    if (task.completed) {
        completedList.appendChild(li);
    } else {
        todoList.appendChild(li);
    }
}

function renderAllTasks() {
    clearLists();

    const activeTasks = sortActiveTasks(allTasks);
    const completedTasks = filterCompletedTasks(allTasks);

    activeTasks.forEach(task => renderTask(task));
    completedTasks.forEach(task => renderTask(task));

    updateStats();
}

fetch('/tasks')
    .then(response => response.json())
    .then(function(tasks) {
        if (!Array.isArray(tasks)) {
            console.log(tasks);
            return;
        }

        allTasks = tasks;
        renderAllTasks();
    })
    .catch(function(error) {
        console.error('Load tasks error:', error);
    });

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const todoText = input.value.trim();

    if (todoText === '') {
        return;
    }

    showLoader('Adding task...');

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
    .then(response => response.json())
    .then(function(newTask) {
        allTasks.push(newTask);
        renderAllTasks();

        input.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        priorityInput.value = '1';
    })
    .catch(function(error) {
        console.error('Add task error:', error);
        alert('Gagal menambahkan task.');
    })
    .finally(function() {
        hideLoader();
    });
});

if (sortActive) {
    sortActive.addEventListener('change', renderAllTasks);
}

if (completedSearch) {
    completedSearch.addEventListener('input', renderAllTasks);
}