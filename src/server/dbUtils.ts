
import * as fs from "fs";
import * as pathUtils from "path";
import Database, { Database as DbType } from "better-sqlite3";
import { AccountRow } from "./types.js";
import { projectPath } from "./constants.js";

const gameDataPath = pathUtils.join(projectPath, "gameData");
const databasePath = pathUtils.join(gameDataPath, "database.sqlite3");

let db: DbType;

export const initializeDb = (): void => {
    if (!fs.existsSync(gameDataPath)) {
        fs.mkdirSync(gameDataPath);
    }
    db = new Database(databasePath);
    const tables = db.pragma("table_list") as { name: string }[];
    const playersTableExists = tables.some((table) => (table.name === "Accounts"));
    if (!playersTableExists) {
        db.prepare(`CREATE TABLE Accounts (
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
        db.prepare("CREATE INDEX accountScoreIndex ON Accounts(score)").run();
    }
};

export const getDb = (): DbType => db;

export const getAccountRow = (username: string): AccountRow => (
    db.prepare("SELECT * FROM Accounts WHERE username = ?").get(username) as AccountRow
);

export const closeDb = (): void => {
    db.close();
};


