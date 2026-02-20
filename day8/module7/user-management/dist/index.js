"use strict";
class UserManager {
    constructor() {
        this.users = [];
        this.currentId = 1;
    }
    addUser(name, email, role) {
        const newUser = {
            id: this.currentId++,
            name,
            email,
            role
        };
        this.users.push(newUser);
        this.renderUsers();
    }
    findUserBy(key, value) {
        return this.users.find(user => user[key] === value);
    }
    updateUserRole(id, newRole) {
        const user = this.findUserBy("id", id);
        if (user) {
            user.role = newRole;
            this.renderUsers();
        }
    }
    deleteUser(id) {
        this.users = this.users.filter(user => user.id !== id);
        this.renderUsers();
    }
    renderUsers() {
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";
        this.users.forEach((user, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="actions">
                    <button data-id="${user.id}" class="editBtn">Edit</button>
                    <button data-id="${user.id}" class="deleteBtn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(e.target.getAttribute("data-id"));
                const user = this.findUserBy("id", id);
                if (user) {
                    const newRole = user.role === "Admin" ? "User" : "Admin";
                    this.updateUserRole(id, newRole);
                }
            });
        });
        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number(e.target.getAttribute("data-id"));
                this.deleteUser(id);
            });
        });
    }
}
const manager = new UserManager();
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    addBtn.addEventListener("click", () => {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const role = document.getElementById("role").value;
        manager.addUser(name, email, role);
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
    });
});
