
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
    console.log(db.pragma("table_list"));
};

export const closeDb = () => {
    db.close();
};


