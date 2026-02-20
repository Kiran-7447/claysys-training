"use strict";
var _a;
// UserManager Class
class UserManager {
    constructor() {
        this.users = [];
        this.idCounter = 1;
    }
    // Add User
    addUser(name, email, role) {
        const newUser = {
            id: this.idCounter++,
            name,
            email,
            role
        };
        this.users.push(newUser);
        this.render();
    }
    // Delete User
    deleteUser(id) {
        this.users = this.users.filter(user => user.id !== id);
        this.render();
    }
    // Update Role
    updateRole(id, newRole) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.role = newRole;
            this.render();
        }
    }
    // Generic Find Method
    findBy(key, value) {
        return this.users.find(user => user[key] === value);
    }
    // Render Users
    render() {
        const list = document.getElementById("userList");
        list.innerHTML = "";
        this.users.forEach((user, index) => {
            const row = document.createElement("div");
            row.className = "user-row";
            row.innerHTML = `
        <span>${index + 1}. ${user.name}</span>
        <span>${user.email}</span>
        <span>${user.role}</span>
        <div>
          <button onclick="editUser(${user.id})">Edit</button>
          <button onclick="deleteUser(${user.id})">Delete</button>
        </div>
      `;
            list.appendChild(row);
        });
    }
}
const manager = new UserManager();
// Global Functions for Buttons
window.deleteUser = (id) => {
    manager.deleteUser(id);
};
window.editUser = (id) => {
    const user = manager.findBy("id", id);
    if (user) {
        const newRole = prompt("Enter new role (Admin/User/Guest):");
        if (newRole === "Admin" || newRole === "User" || newRole === "Guest") {
            manager.updateRole(id, newRole);
        }
        else {
            alert("Invalid Role!");
        }
    }
};
// Add Button Event
(_a = document.getElementById("addBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const roleSelect = document.getElementById("role");
    if (!nameInput.value || !emailInput.value) {
        alert("All fields required!");
        return;
    }
    manager.addUser(nameInput.value, emailInput.value, roleSelect.value);
    nameInput.value = "";
    emailInput.value = "";
});
