
import * as dotenv from "dotenv";
import * as pathUtils from "path";
import { fileURLToPath } from "url";

dotenv.config();

export const projectPath = pathUtils.join(fileURLToPath(import.meta.url), "..", "..", "..");
export const viewsPath = pathUtils.join(projectPath, "views");
export const gameDataPath = pathUtils.join(projectPath, "gameData");
export const isDevMode = (process.env.NODE_ENV === "development");

export const maxPlayerShield = 100;


