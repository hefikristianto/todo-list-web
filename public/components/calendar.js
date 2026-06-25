const calendarGrid = document.getElementById('calendar-grid');
const weekRange = document.getElementById('week-range');
const localTime = document.getElementById('local-time');
const localDate = document.getElementById('local-date');
const refreshCalendar = document.getElementById('refresh-calendar');
const pageLoader = document.getElementById('page-loader');
const backHome = document.getElementById('back-home');

let calendarTasks = [];

const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const shortMonth = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

function showLoader() {
    if (pageLoader) {
        pageLoader.classList.remove('hide');
    }
}

function hideLoader() {
    if (pageLoader) {
        pageLoader.classList.add('hide');
    }
}

function updateClock() {
    const now = new Date();

    if (localTime) {
        localTime.textContent = now.toLocaleTimeString('id-ID', {
            hour12: false
        });
    }

    if (localDate) {
        localDate.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
    }
}

function getMonday(date) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    current.setDate(diff);
    current.setHours(0, 0, 0, 0);

    return current;
}

function getWeekDays() {
    const monday = getMonday(new Date());
    const days = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        days.push(date);
    }

    return days;
}

function formatDateKey(date) {
    return (
        date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0')
    );
}

function getTaskDateKey(value) {
    if (!value) {
        return '';
    }

    return value.substring(0, 10);
}

function getTaskHour(value) {
    if (!value || value.length < 13) {
        return null;
    }

    const hour = Number(value.substring(11, 13));

    if (Number.isNaN(hour)) {
        return null;
    }

    return hour;
}

function getTaskTime(value) {
    if (!value || value.length < 16) {
        return '--:--';
    }

    return value.substring(11, 16);
}

function getCategoryClass(category) {
    const value = (category || '').toLowerCase();

    if (value.includes('coding')) return 'coding';
    if (value.includes('skripsi')) return 'skripsi';
    if (value.includes('pribadi')) return 'pribadi';
    if (value.includes('kuliah')) return 'kuliah';

    return 'default';
}

function getPriorityText(priority) {
    if (Number(priority) === 3) return 'High';
    if (Number(priority) === 2) return 'Medium';
    return 'Low';
}

function renderWeekHeader(days) {
    const empty = document.createElement('div');
    empty.className = 'calendar-cell calendar-day calendar-hour-title';
    empty.innerHTML = '<strong>HOURS</strong>';
    calendarGrid.appendChild(empty);

    const todayKey = formatDateKey(new Date());

    days.forEach(function(day) {
        const dayKey = formatDateKey(day);

        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-cell calendar-day';

        if (dayKey === todayKey) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML = `
            <div>
                <strong>${dayNames[day.getDay()]}</strong>
                <span>${String(day.getDate()).padStart(2, '0')} ${shortMonth[day.getMonth()]}</span>
            </div>
        `;

        calendarGrid.appendChild(dayCell);
    });
}

function renderCalendar() {
    if (!calendarGrid) {
        console.error('calendar-grid tidak ditemukan');
        hideLoader();
        return;
    }

    calendarGrid.innerHTML = '';

    const days = getWeekDays();
    const firstDay = days[0];
    const lastDay = days[6];

    if (weekRange) {
        weekRange.textContent =
            `${firstDay.getDate()} ${shortMonth[firstDay.getMonth()]} - ${lastDay.getDate()} ${shortMonth[lastDay.getMonth()]} ${lastDay.getFullYear()}`;
    }

    renderWeekHeader(days);

    for (let hour = 1; hour <= 23; hour++) {
        const timeCell = document.createElement('div');
        timeCell.className = 'calendar-cell calendar-time';
        timeCell.textContent = `${String(hour).padStart(2, '0')}:00`;
        calendarGrid.appendChild(timeCell);

        days.forEach(function(day) {
            const dateKey = formatDateKey(day);

            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            const tasksInCell = calendarTasks.filter(function(task) {
                if (task.completed) {
                    return false;
                }

                return (
                    getTaskDateKey(task.due_date) === dateKey &&
                    getTaskHour(task.due_date) === hour
                );
            });

            tasksInCell.sort(function(a, b) {
                return (a.due_date || '').localeCompare(b.due_date || '');
            });

            if (tasksInCell.length === 0 && (hour === 3 || hour === 6 || hour === 9 || hour === 12 || hour === 15 || hour === 18 || hour === 21)) {
                const divider = document.createElement('div');
                divider.className = 'calendar-empty-divider';
                divider.textContent = '//';
                cell.appendChild(divider);
            }

            tasksInCell.forEach(function(task) {
                const taskElement = document.createElement('div');
                const categoryClass = getCategoryClass(task.category);

                taskElement.className = `calendar-task ${categoryClass}`;

                taskElement.innerHTML = `
                    <span class="calendar-task-title">${task.text}</span>
                    <span class="calendar-task-meta">
                        ${getTaskTime(task.due_date)} • ${task.category || '-'} • ${getPriorityText(task.priority)}
                    </span>
                `;

                cell.appendChild(taskElement);
            });

            calendarGrid.appendChild(cell);
        });
    }
}

function loadTasks() {
    showLoader();

    fetch('/tasks')
        .then(function(response) {
            return response.json();
        })
        .then(function(tasks) {
            if (!Array.isArray(tasks)) {
                console.log(tasks);
                calendarTasks = [];
            } else {
                calendarTasks = tasks;
            }

            renderCalendar();
        })
        .catch(function(error) {
            console.error('Calendar load error:', error);
            calendarTasks = [];
            renderCalendar();
        })
        .finally(function() {
            hideLoader();
        });
}

if (refreshCalendar) {
    refreshCalendar.addEventListener('click', loadTasks);
}

if (backHome) {
    backHome.addEventListener('click', function(event) {
        event.preventDefault();
        showLoader();

        setTimeout(function() {
            window.location.href = backHome.href;
        }, 220);
    });
}

window.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);

    loadTasks();

    setTimeout(function() {
        hideLoader();
    }, 3000);
});