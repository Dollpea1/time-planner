// Time Planner - Clean, Local-Only Task Tracker
(function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'time_planner_tasks';

  // DOM Elements
  const addTaskForm = document.getElementById('add-task-form');
  const taskNameInput = document.getElementById('task-name');
  const taskDateInput = document.getElementById('task-date');
  const taskTimeInput = document.getElementById('task-time');
  const taskStatusInput = document.getElementById('task-status');
  const taskCategoryInput = document.getElementById('task-category');

  const searchInput = document.getElementById('search-input');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptySubtitle = document.getElementById('empty-subtitle');
  const totalCountBadge = document.getElementById('total-count');

  // Edit Modal Elements
  const editModal = document.getElementById('edit-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskIdInput = document.getElementById('edit-task-id');
  const editTaskNameInput = document.getElementById('edit-task-name');
  const editTaskDateInput = document.getElementById('edit-task-date');
  const editTaskTimeInput = document.getElementById('edit-task-time');
  const editTaskStatusInput = document.getElementById('edit-task-status');
  const editTaskCategoryInput = document.getElementById('edit-task-category');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const editCancelBtn = document.getElementById('edit-cancel-btn');

  // State
  let tasks = loadTasks();

  // Initialize
  function init() {
    // Set default date to today for convenience
    const today = new Date().toISOString().split('T')[0];
    if (taskDateInput && !taskDateInput.value) {
      taskDateInput.value = today;
    }

    renderTasks();
    attachEventListeners();
  }

  // Load tasks from localStorage
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map(task => ({
        ...task,
        status: task.status || 'Pending',
        category: task.category || 'Personal'
      }));
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
      return [];
    }
  }

  // Save tasks to localStorage
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }

  // Format date for display (e.g., Nov 6, 2026 or fallback)
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  // Format time for display (e.g., 2:30 PM or fallback)
  function formatTime(timeStr) {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return timeStr;
    }
  }

  // Escape HTML to prevent injection
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render task list and update counters
  function renderTasks() {
    const searchTerm = (searchInput.value || '').trim().toLowerCase();

    // Update total count counter at the top
    totalCountBadge.textContent = tasks.length;

    // Filter tasks if searching
    const filteredTasks = tasks.filter(task => {
      if (!searchTerm) return true;
      const nameMatch = task.name.toLowerCase().includes(searchTerm);
      const dateMatch = task.date.toLowerCase().includes(searchTerm) || formatDate(task.date).toLowerCase().includes(searchTerm);
      const timeMatch = task.time.toLowerCase().includes(searchTerm) || formatTime(task.time).toLowerCase().includes(searchTerm);
      const statusMatch = (task.status || '').toLowerCase().includes(searchTerm);
      const categoryMatch = (task.category || '').toLowerCase().includes(searchTerm);
      return nameMatch || dateMatch || timeMatch || statusMatch || categoryMatch;
    });

    // Clear current list
    taskList.innerHTML = '';

    // Handle empty state
    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks planned yet!';
      emptySubtitle.textContent = 'Fill in the task details above and click "Add Task" to get started.';
      emptyState.style.display = 'block';
      taskList.style.display = 'none';
      return;
    }

    if (filteredTasks.length === 0) {
      emptyTitle.textContent = 'No matching tasks found';
      emptySubtitle.textContent = `No tasks match "${searchTerm}". Try a different keyword.`;
      emptyState.style.display = 'block';
      taskList.style.display = 'none';
      return;
    }

    // Tasks are present
    emptyState.style.display = 'none';
    taskList.style.display = 'flex';

    // Populate task items
    filteredTasks.forEach(task => {
      const isDone = (task.status || 'Pending') === 'Done';
      const li = document.createElement('li');
      li.className = `task-item ${isDone ? 'is-done' : ''}`;
      li.setAttribute('data-id', task.id);

      li.innerHTML = `
        <div class="task-main">
          <div class="task-title">${escapeHtml(task.name)}</div>
          <div class="task-meta">
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              ${escapeHtml(formatDate(task.date))}
            </span>
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              ${escapeHtml(formatTime(task.time))}
            </span>
            <button type="button" class="meta-chip chip-status ${isDone ? 'chip-status-done' : 'chip-status-pending'}" data-action="toggle-status" data-id="${task.id}" title="Click to toggle Status">
              ${isDone ? '✓ Done' : '⏳ Pending'}
            </button>
            <span class="meta-chip chip-category">
              ${escapeHtml(task.category || 'Personal')}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button type="button" class="btn-icon btn-edit" data-id="${task.id}" aria-label="Edit task: ${escapeHtml(task.name)}">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          <button type="button" class="btn-icon btn-delete" data-id="${task.id}" aria-label="Delete task: ${escapeHtml(task.name)}">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      `;

      taskList.appendChild(li);
    });
  }

  // Handle Add Task Submission
  function handleAddTask(e) {
    e.preventDefault();

    const name = taskNameInput.value.trim();
    const date = taskDateInput.value;
    const time = taskTimeInput.value;

    if (!name) {
      alert('Please enter a task name.');
      taskNameInput.focus();
      return;
    }

    if (!date) {
      alert('Please select a date.');
      taskDateInput.focus();
      return;
    }

    if (!time) {
      alert('Please select a time.');
      taskTimeInput.focus();
      return;
    }

    const status = taskStatusInput.value || 'Pending';
    const category = taskCategoryInput.value || 'Personal';

    const newTask = {
      id: Date.now().toString(),
      name,
      date,
      time,
      status,
      category,
      createdAt: Date.now()
    };

    // Add new task to top of list
    tasks.unshift(newTask);
    saveTasks();

    // Reset input fields
    taskNameInput.value = '';
    taskTimeInput.value = '';
    taskStatusInput.value = 'Pending';
    taskCategoryInput.value = 'Personal';
    // Retain date for convenience or keep today's date

    renderTasks();
  }

  // Handle Edit Task button click
  function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editTaskIdInput.value = task.id;
    editTaskNameInput.value = task.name;
    editTaskDateInput.value = task.date;
    editTaskTimeInput.value = task.time;
    editTaskStatusInput.value = task.status || 'Pending';
    editTaskCategoryInput.value = task.category || 'Personal';

    editModal.style.display = 'flex';
    editTaskNameInput.focus();
  }

  // Close Edit Modal
  function closeEditModal() {
    editModal.style.display = 'none';
    editTaskForm.reset();
  }

  // Handle Save in Edit Modal
  function handleEditTask(e) {
    e.preventDefault();

    const id = editTaskIdInput.value;
    const name = editTaskNameInput.value.trim();
    const date = editTaskDateInput.value;
    const time = editTaskTimeInput.value;
    const status = editTaskStatusInput.value || 'Pending';
    const category = editTaskCategoryInput.value || 'Personal';

    if (!name) {
      alert('Task name cannot be empty.');
      editTaskNameInput.focus();
      return;
    }

    if (!date) {
      alert('Please select a date.');
      editTaskDateInput.focus();
      return;
    }

    if (!time) {
      alert('Please select a time.');
      editTaskTimeInput.focus();
      return;
    }

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].name = name;
      tasks[taskIndex].date = date;
      tasks[taskIndex].time = time;
      tasks[taskIndex].status = status;
      tasks[taskIndex].category = category;
      saveTasks();
      renderTasks();
    }

    closeEditModal();
  }

  // Toggle Status between Pending and Done
  function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = (task.status === 'Done') ? 'Pending' : 'Done';
    saveTasks();
    renderTasks();
  }

  // Handle Delete Task with Confirmation
  function handleDeleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmed = window.confirm(`Are you sure you want to delete the task "${task.name}"?`);
    if (confirmed) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
    }
  }

  // Attach Event Listeners
  function attachEventListeners() {
    // Add task form
    addTaskForm.addEventListener('submit', handleAddTask);

    // Search input
    searchInput.addEventListener('input', () => {
      renderTasks();
    });
    searchInput.addEventListener('search', () => {
      renderTasks();
    });

    // Event delegation for Status toggle, Edit and Delete buttons on the task list
    taskList.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-action="toggle-status"]');
      const editBtn = e.target.closest('.btn-edit');
      const deleteBtn = e.target.closest('.btn-delete');

      if (toggleBtn) {
        const taskId = toggleBtn.getAttribute('data-id');
        toggleTaskStatus(taskId);
      } else if (editBtn) {
        const taskId = editBtn.getAttribute('data-id');
        openEditModal(taskId);
      } else if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-id');
        handleDeleteTask(taskId);
      }
    });

    // Edit modal form submission
    editTaskForm.addEventListener('submit', handleEditTask);

    // Close edit modal buttons
    modalCloseBtn.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);

    // Close edit modal on clicking backdrop
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModal();
      }
    });

    // Close edit modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && editModal.style.display === 'flex') {
        closeEditModal();
      }
    });
  }

  // Run app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

