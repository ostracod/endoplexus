
import * as fs from "fs";
import * as pathUtils from "path";
import Database, { Database as DbType } from "better-sqlite3";
import { projectPath } from "./constants.js";

const gameDataPath = pathUtils.join(projectPath, "gameData");
const databasePath = pathUtils.join(gameDataPath, "database.sqlite3");

let db: DbType;

export const initializeDb = () => {
    if (!fs.existsSync(gameDataPath)) {
        fs.mkdirSync(gameDataPath);
    }
    db = new Database(databasePath);
    const tables = db.pragma("table_list") as { name: string }[];
    const playersTableExists = tables.some((table) => (table.name === "Players"));
    if (!playersTableExists) {
        db.prepare(`CREATE TABLE Players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            passwordHash TEXT NOT NULL,
            emailAddress TEXT NOT NULL,
            score INTEGER NOT NULL,
            parentGridId INTEGER,
            posX INTEGER,
            posY INTEGER,
            shield REAL NOT NULL,
            inventoryItems TEXT NOT NULL
        )`).run();
        db.prepare("CREATE INDEX scoreIndex ON Players(score)").run();
    }
};

export const closeDb = () => {
    db.close();
};


