import fs from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "src", "data", "users.json");

export function getUser(userId = "default") {
    try {
        const data = fs.readFileSync(usersPath, "utf-8");
        const users = JSON.parse(data);
        return users[userId] || {};
    } catch (err) {
        return {};
    }
}

export function saveUser(userId = "default", newData = {}) {
    let users = {};

    try {
        users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
    } catch (err) { }

    users[userId] = {
        ...users[userId],
        ...newData
    };

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}
