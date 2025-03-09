
import * as dotenv from "dotenv";
import * as pathUtils from "path";
import { fileURLToPath } from "url";

dotenv.config();

export const projectPath = pathUtils.join(fileURLToPath(import.meta.url), "..", "..", "..");
export const publicPath = pathUtils.join(projectPath, "public");
export const viewsPath = pathUtils.join(projectPath, "views");
export const privateKeyPath = pathUtils.join(projectPath, "ssl.key");
export const certificatePath = pathUtils.join(projectPath, "ssl.crt");
export const caBundlePath = pathUtils.join(projectPath, "ssl.ca-bundle");
const distPath = pathUtils.join(projectPath, "dist");
export const commonScriptsPath = pathUtils.join(distPath, "common");
export const clientScriptsPath = pathUtils.join(distPath, "client");

export const isDevMode = (process.env.NODE_ENV === "development");
export const sessionSecret = process.env.SESSION_SECRET;
export const serverPortNumber = process.env.PORT_NUMBER;


