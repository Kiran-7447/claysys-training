// Role Type (Valid roles only)
type Role = "Admin" | "User" | "Guest";

// User Interface
interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// UserManager Class
class UserManager {
  private users: User[] = [];
  private idCounter: number = 1;

  // Add User
  addUser(name: string, email: string, role: Role): void {
    const newUser: User = {
      id: this.idCounter++,
      name,
      email,
      role
    };
    this.users.push(newUser);
    this.render();
  }

  // Delete User
  deleteUser(id: number): void {
    this.users = this.users.filter(user => user.id !== id);
    this.render();
  }

  // Update Role
  updateRole(id: number, newRole: Role): void {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.role = newRole;
      this.render();
    }
  }

  // Generic Find Method
  findBy<K extends keyof User>(key: K, value: User[K]): User | undefined {
    return this.users.find(user => user[key] === value);
  }

  // Render Users
  render(): void {
    const list = document.getElementById("userList") as HTMLElement;
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
(window as any).deleteUser = (id: number) => {
  manager.deleteUser(id);
};

(window as any).editUser = (id: number) => {
  const user = manager.findBy("id", id);
  if (user) {
    const newRole = prompt("Enter new role (Admin/User/Guest):") as Role;
    if (newRole === "Admin" || newRole === "User" || newRole === "Guest") {
      manager.updateRole(id, newRole);
    } else {
      alert("Invalid Role!");
    }
  }
};

// Add Button Event
document.getElementById("addBtn")?.addEventListener("click", () => {
  const nameInput = document.getElementById("name") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const roleSelect = document.getElementById("role") as HTMLSelectElement;

  if (!nameInput.value || !emailInput.value) {
    alert("All fields required!");
    return;
  }

  manager.addUser(nameInput.value, emailInput.value, roleSelect.value as Role);

  nameInput.value = "";
  emailInput.value = "";
});