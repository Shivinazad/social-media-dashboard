// Task operations
async function fetchTasks() {
  try {
    const response = await fetch("http://localhost:3000/tasks");
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function addTask(description) {
  try {
    const response = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) {
      throw new Error("Failed to add task");
    }
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function deleteTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

// DOM operations and event handlers
document.addEventListener("DOMContentLoaded", async () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Load initial tasks
  const tasks = await fetchTasks();
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });

  // Add task handler
  addTaskBtn.addEventListener("click", async () => {
    const description = taskInput.value.trim();
    if (description) {
      const success = await addTask(description);
      if (success) {
        const tasks = await fetchTasks();
        taskList.innerHTML = "";
        tasks.forEach((task) => {
          const taskElement = createTaskElement(task);
          taskList.appendChild(taskElement);
        });
        taskInput.value = "";
      }
    }
  });

  // Enter key handler
  taskInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const description = taskInput.value.trim();
      if (description) {
        const success = await addTask(description);
        if (success) {
          const tasks = await fetchTasks();
          taskList.innerHTML = "";
          tasks.forEach((task) => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
          });
          taskInput.value = "";
        }
      }
    }
  });
});

// Create task element
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const taskContent = document.createElement("div");
  taskContent.className = "task-content";
  taskContent.textContent = task.description;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = "&times;";
  deleteBtn.addEventListener("click", async () => {
    const success = await deleteTask(task._id);
    if (success) {
      li.remove();
    }
  });

  li.appendChild(taskContent);
  li.appendChild(deleteBtn);
  return li;
}
