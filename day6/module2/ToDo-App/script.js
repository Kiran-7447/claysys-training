const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

addBtn.addEventListener("click", () => {
  const value = input.value.trim();
  if (value === "") return;

  const li = document.createElement("li");
  li.innerHTML = `
      <input type="checkbox" class="check">
      <span>${value}</span>
      <button class="delete">Delete</button>
  `;

  list.appendChild(li);
  input.value = "";
});

list.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    e.target.parentElement.remove();
  }

  if (e.target.classList.contains("check")) {
    e.target.nextElementSibling.classList.toggle("completed");
  }
});