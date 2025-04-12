document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Load tasks from the backend
  const loadTasks = async () => {
    try {
      const response = await fetch("http://localhost:3000/tasks");
      const tasks = await response.json();
      tasks.forEach((task) => {
        addTaskToList(task.description, task._id); // Pass task ID
      });
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Save a task to the backend
  const saveTask = async (taskText) => {
    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: taskText }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      const newTask = await response.json();
      return newTask.task; // Return the newly created task
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Function to add a task to the list
  const addTaskToList = (taskText, taskId) => {
    const listItem = document.createElement("li");

    const taskTextSpan = document.createElement("span");
    taskTextSpan.textContent = taskText;
    listItem.appendChild(taskTextSpan);

    // Add a delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          taskList.removeChild(listItem);
          console.log("Task deleted successfully");
        } else {
          console.error("Failed to delete task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    });

    listItem.appendChild(deleteBtn);
    taskList.appendChild(listItem);
  };

  // Add task button click event
  addTaskBtn.addEventListener("click", async () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: taskText }),
      });

      if (response.ok) {
        const newTask = await response.json();
        addTaskToList(taskText, newTask.task._id); // Pass task ID
        taskInput.value = ""; // Clear the input
      } else {
        console.error("Failed to save task");
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  });

  // Load tasks on page load
  loadTasks();
});
