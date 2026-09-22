# 📚 Student Task & Study Planner

A responsive and interactive **Student Task & Study Planner** built using **HTML, CSS, and JavaScript**.

This project is designed for a JavaScript practical assignment and demonstrates the use of **Arrays, JSON objects, form validation, DOM manipulation, event handling, and interactive UI features** without using any backend or database.

---

## 🎯 Project Objective

The Student Task & Study Planner helps students manage their study tasks by allowing them to:

- Add new study tasks
- View existing tasks
- Mark tasks as completed
- Edit tasks
- Delete tasks
- Search tasks
- Filter tasks
- View task statistics
- View stored data in JSON format

The project demonstrates how JavaScript can be used to create a complete interactive web application.

---

## ✨ Features

### ➕ Add Task

Users can add a study task with:

- Task title
- Subject
- Priority
- Due date
- Estimated study time
- Task description

Before a task is added, JavaScript validates all the entered information.

### ✅ Form Validation

The application validates:

- Task title cannot be empty
- Subject cannot be empty
- Priority must be selected
- Due date cannot be empty
- Due date cannot be earlier than today
- Study time must be a positive number
- Study time must be between 1 and 600 minutes
- Description cannot be empty

Invalid inputs display clear error messages below the corresponding fields.

Invalid data is **not added to the tasks Array**.

---

## 📋 Task Management

### Display Tasks

Tasks are dynamically generated using JavaScript.

Task cards are not hard-coded in HTML.

### ✅ Complete Task

Users can mark a task as completed.

The `completed` property of the corresponding JSON object is updated.

### ✏️ Edit Task

Users can edit existing tasks.

Edited information is validated before updating the task.

### 🗑️ Delete Task

Users can delete individual tasks from the application.

### 🔍 Search

Users can search tasks by:

- Task title
- Subject

Search results update dynamically.

### 🔽 Filter

Tasks can be filtered by:

- All
- Pending
- Completed
- High Priority
- Medium Priority
- Low Priority

---

## 📊 Task Statistics

The dashboard displays:

- **Total Tasks**
- **Completed Tasks**
- **Pending Tasks**
- **Total Study Time**

The statistics are automatically updated whenever the task data changes.

---

## 🧾 Arrays & JSON

The application stores task information using a JavaScript Array containing JSON objects.

Example:

```javascript
const tasks = [
    {
        id: 1,
        title: "Complete JavaScript Assignment",
        subject: "Web Development",
        priority: "High",
        dueDate: "2026-09-25",
        studyTime: 60,
        description: "Complete the JavaScript practical assignment.",
        completed: false
    }
];
