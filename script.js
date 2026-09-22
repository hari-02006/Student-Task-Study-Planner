const STORAGE_KEY = "studentTaskPlannerData";

const defaultTasks = [
  {
    id: 1,
    title: "Complete JavaScript Assignment",
    subject: "Web Development",
    priority: "High",
    dueDate: "2026-09-30",
    studyTime: 90,
    description: "Finish the JavaScript practical assignment and check all validation features.",
    completed: false,
  },
  {
    id: 2,
    title: "Prepare for DBMS Quiz",
    subject: "Database Systems",
    priority: "Medium",
    dueDate: "2026-09-27",
    studyTime: 60,
    description: "Revise SQL queries, normalization, and database design concepts.",
    completed: true,
  },
  {
    id: 3,
    title: "Write Communication Notes",
    subject: "Professional Communication",
    priority: "Low",
    dueDate: "2026-10-02",
    studyTime: 40,
    description: "Review class notes and create summary points for speaking practice.",
    completed: false,
  },
];

let tasks = [...defaultTasks];
let editingTaskId = null;
let currentFilter = "All";
let searchTerm = "";

const form = document.getElementById("taskForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const formSuccess = document.getElementById("formSuccess");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const totalStudyTime = document.getElementById("totalStudyTime");
const viewJsonBtn = document.getElementById("viewJsonBtn");
const jsonModal = document.getElementById("jsonModal");
const jsonOutput = document.getElementById("jsonOutput");
const closeJsonModal = document.getElementById("closeJsonModal");
const resetBtn = document.getElementById("resetBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// This map helps us show validation errors below the correct input field.
const fieldErrorMap = {
  title: "titleError",
  subject: "subjectError",
  priority: "priorityError",
  dueDate: "dueDateError",
  studyTime: "studyTimeError",
  description: "descriptionError",
};

function showSuccessMessage(message) {
  formSuccess.textContent = message;
  formSuccess.classList.add("visible");
  setTimeout(() => {
    formSuccess.classList.remove("visible");
    formSuccess.textContent = "";
  }, 2400);
}

function clearFieldError(fieldName) {
  const errorElement = document.getElementById(fieldErrorMap[fieldName]);
  if (errorElement) {
    errorElement.textContent = "";
  }
}

function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(fieldErrorMap[fieldName]);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearAllErrors() {
  Object.keys(fieldErrorMap).forEach((fieldName) => clearFieldError(fieldName));
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// This function loads saved tasks from localStorage if they exist.
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return;
  }

  try {
    const parsedData = JSON.parse(savedTasks);
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      tasks = parsedData;
    } else {
      tasks = [...defaultTasks];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (error) {
    tasks = [...defaultTasks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFormData() {
  return {
    id: editingTaskId ?? Date.now(),
    title: document.getElementById("title").value.trim(),
    subject: document.getElementById("subject").value.trim(),
    priority: document.getElementById("priority").value,
    dueDate: document.getElementById("dueDate").value,
    studyTime: document.getElementById("studyTime").value.trim(),
    description: document.getElementById("description").value.trim(),
    completed: document.getElementById("status").value === "Completed",
  };
}

// Validation happens here before data is added to the tasks array.
function validateTask(taskData) {
  const errors = {};

  if (!taskData.title) {
    errors.title = "Task title cannot be empty.";
  }

  if (!taskData.subject) {
    errors.subject = "Subject cannot be empty.";
  }

  if (!taskData.priority) {
    errors.priority = "Priority must be selected.";
  }

  if (!taskData.dueDate) {
    errors.dueDate = "Due date cannot be empty.";
  } else {
    const selectedDate = new Date(`${taskData.dueDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.dueDate = "Due date cannot be earlier than today.";
    }
  }

  if (!taskData.studyTime) {
    errors.studyTime = "Study time is required.";
  } else {
    const minutes = Number(taskData.studyTime);
    if (Number.isNaN(minutes) || minutes <= 0) {
      errors.studyTime = "Study time must be a positive number.";
    } else if (minutes < 1 || minutes > 600) {
      errors.studyTime = "Study time must be between 1 and 600 minutes.";
    }
  }

  if (!taskData.description) {
    errors.description = "Description cannot be empty.";
  }

  return errors;
}

function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const totalMinutes = tasks.reduce((sum, task) => sum + Number(task.studyTime || 0), 0);

  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  pendingTasks.textContent = pending;
  totalStudyTime.textContent = `${totalMinutes} min`;
}

function getFilteredTasks() {
  const query = searchTerm.toLowerCase();

  return tasks.filter((task) => {
    const matchesText =
      task.title.toLowerCase().includes(query) || task.subject.toLowerCase().includes(query);

    let matchesFilter = true;

    if (currentFilter === "Pending") {
      matchesFilter = !task.completed;
    } else if (currentFilter === "Completed") {
      matchesFilter = task.completed;
    } else if (currentFilter === "High" || currentFilter === "Medium" || currentFilter === "Low") {
      matchesFilter = task.priority === currentFilter;
    }

    return matchesText && matchesFilter;
  });
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">No tasks match your search or filter.</div>';
    return;
  }

  taskList.innerHTML = filteredTasks
    .map(
      (task) => `
        <article class="task-card ${task.completed ? "completed" : ""}">
          <div class="task-top">
            <div>
              <p class="task-subject">${task.subject}</p>
              <h3>${task.title}</h3>
            </div>
            <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
          </div>

          <p class="task-meta">${formatDate(task.dueDate)} • ${task.studyTime} minutes</p>
          <p class="task-description">${task.description}</p>

          <div class="task-bottom">
            <label class="check-wrap">
              <input type="checkbox" data-action="toggle" data-id="${task.id}" ${task.completed ? "checked" : ""} />
              <span>Completed</span>
            </label>

            <div class="task-actions">
              <button type="button" class="icon-btn" data-action="edit" data-id="${task.id}">Edit</button>
              <button type="button" class="icon-btn delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function resetForm() {
  form.reset();
  editingTaskId = null;
  clearAllErrors();
  formTitle.textContent = "Add New Task";
  submitBtn.textContent = "Save Task";
  document.getElementById("status").value = "Pending";
  formSuccess.classList.remove("visible");
  formSuccess.textContent = "";
}

function fillFormForEdit(task) {
  editingTaskId = task.id;
  formTitle.textContent = "Edit Task";
  submitBtn.textContent = "Update Task";

  document.getElementById("title").value = task.title;
  document.getElementById("subject").value = task.subject;
  document.getElementById("priority").value = task.priority;
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("studyTime").value = task.studyTime;
  document.getElementById("description").value = task.description;
  document.getElementById("status").value = task.completed ? "Completed" : "Pending";

  clearAllErrors();
}

// Submit event handles both add and update operations.
function handleTaskSubmit(event) {
  event.preventDefault();

  const taskData = getFormData();
  const errors = validateTask(taskData);

  clearAllErrors();

  const errorFields = Object.keys(errors);
  if (errorFields.length > 0) {
    errorFields.forEach((fieldName) => showFieldError(fieldName, errors[fieldName]));
    return;
  }

  if (editingTaskId !== null) {
    const taskIndex = tasks.findIndex((task) => task.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
    }
  } else {
    tasks.push(taskData);
  }

  saveTasks();
  renderTasks();
  updateStatistics();
  resetForm();
  showSuccessMessage(editingTaskId === null ? "Task added successfully!" : "Task updated successfully!");
}

function handleDeleteTask(taskId) {
  const confirmed = window.confirm("Are you sure you want to delete this task?");
  if (!confirmed) return;

  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
  updateStatistics();

  if (editingTaskId === taskId) {
    resetForm();
  }
}

function handleClearAll() {
  if (tasks.length === 0) {
    showSuccessMessage("No tasks are available to clear.");
    return;
  }

  const confirmed = window.confirm("This will delete all tasks. Continue?");
  if (!confirmed) return;

  tasks = [];
  saveTasks();
  renderTasks();
  updateStatistics();
  resetForm();
  showSuccessMessage("All tasks were deleted.");
}

function handleViewJson() {
  jsonOutput.textContent = JSON.stringify(tasks, null, 2);
  jsonModal.classList.remove("hidden");
  jsonModal.setAttribute("aria-hidden", "false");
}

function closeJsonPanel() {
  jsonModal.classList.add("hidden");
  jsonModal.setAttribute("aria-hidden", "true");
}

function handleTaskListClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const taskId = Number(button.dataset.id);

  if (action === "delete") {
    handleDeleteTask(taskId);
  }

  if (action === "edit") {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      fillFormForEdit(taskToEdit);
    }
  }
}

function handleTaskListChange(event) {
  const checkbox = event.target.closest("input[data-action='toggle']");
  if (!checkbox) return;

  const taskId = Number(checkbox.dataset.id);
  const currentTask = tasks.find((task) => task.id === taskId);

  if (currentTask) {
    currentTask.completed = checkbox.checked;
    saveTasks();
    renderTasks();
    updateStatistics();
  }
}

function setUpFieldValidation() {
  const fields = [
    "title",
    "subject",
    "priority",
    "dueDate",
    "studyTime",
    "description",
  ];

  fields.forEach((fieldName) => {
    const element = document.getElementById(fieldName);
    if (!element) return;

    element.addEventListener("input", () => clearFieldError(fieldName));
    element.addEventListener("change", () => clearFieldError(fieldName));
  });
}

// Set up all event listeners.
form.addEventListener("submit", handleTaskSubmit);
searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderTasks();
});
filterSelect.addEventListener("change", (event) => {
  currentFilter = event.target.value;
  renderTasks();
});

taskList.addEventListener("click", handleTaskListClick);
taskList.addEventListener("change", handleTaskListChange);
viewJsonBtn.addEventListener("click", handleViewJson);
closeJsonModal.addEventListener("click", closeJsonPanel);
jsonModal.addEventListener("click", (event) => {
  if (event.target === jsonModal) {
    closeJsonPanel();
  }
});
resetBtn.addEventListener("click", resetForm);
clearAllBtn.addEventListener("click", handleClearAll);
setUpFieldValidation();

loadTasks();
renderTasks();
updateStatistics();
resetForm();
