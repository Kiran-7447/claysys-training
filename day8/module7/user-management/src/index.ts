interface User {
    id: number;
    name: string;
    email: string;
    role: "Admin" | "User";
}

class UserManager {

    private users: User[] = [];
    private currentId: number = 1;

    public addUser(name: string, email: string, role: "Admin" | "User"): void {
        const newUser: User = {
            id: this.currentId++,
            name,
            email,
            role
        };
        this.users.push(newUser);
        this.renderUsers();
    }

    public findUserBy<K extends keyof User>(key: K, value: User[K]): User | undefined {
        return this.users.find(user => user[key] === value);
    }

    public updateUserRole(id: number, newRole: "Admin" | "User"): void {
        const user = this.findUserBy("id", id);
        if (user) {
            user.role = newRole;
            this.renderUsers();
        }
    }

    public deleteUser(id: number): void {
        this.users = this.users.filter(user => user.id !== id);
        this.renderUsers();
    }

    private renderUsers(): void {
        const tbody = document.getElementById("userTableBody") as HTMLTableSectionElement;
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
                const id = Number((e.target as HTMLElement).getAttribute("data-id"));
                const user = this.findUserBy("id", id);
                if (user) {
                    const newRole = user.role === "Admin" ? "User" : "Admin";
                    this.updateUserRole(id, newRole);
                }
            });
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.target as HTMLElement).getAttribute("data-id"));
                this.deleteUser(id);
            });
        });
    }
}

const manager = new UserManager();

document.addEventListener("DOMContentLoaded", () => {

    const addBtn = document.getElementById("addBtn") as HTMLButtonElement;

    addBtn.addEventListener("click", () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const role = (document.getElementById("role") as HTMLSelectElement).value as "Admin" | "User";

        manager.addUser(name, email, role);

        (document.getElementById("name") as HTMLInputElement).value = "";
        (document.getElementById("email") as HTMLInputElement).value = "";
    });

});