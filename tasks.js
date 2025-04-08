document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Load tasks from localStorage
  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(taskText => {
      addTaskToList(taskText);
    });
  };

  // Save tasks to localStorage
  const saveTasks = () => {
    const tasks = Array.from(taskList.children).map(item => item.querySelector("span").textContent);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // Function to add a task to the list
  const addTaskToList = (taskText) => {
    const listItem = document.createElement("li");

    const taskTextSpan = document.createElement("span");
    taskTextSpan.textContent = taskText;
    listItem.appendChild(taskTextSpan);

    // Add a delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      taskList.removeChild(listItem);
      saveTasks();
    });

    listItem.appendChild(deleteBtn);
    taskList.appendChild(listItem);
  };

  // Add task button click event
  addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    addTaskToList(taskText);
    saveTasks();

    // Clear the input
    taskInput.value = "";
  });

  // Load tasks on page load
  loadTasks();
});
