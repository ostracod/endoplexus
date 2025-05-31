
import * as fs from "fs";
import * as pathUtils from "path";
import * as http from "http";
import * as https from "https";
import { WebSocketExpress } from "websocket-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import logger from "morgan";
import mustacheExpress from "mustache-express";
import { TemplateParams, ExpressError } from "./server/types.js";
import { projectPath, viewsPath, isDevMode } from "./server/constants.js";
import * as pageUtils from "./server/pageUtils.js";
import * as dbUtils from "./server/dbUtils.js";
import { router } from "./server/router.js";
import { world } from "./server/world.js";

let isShuttingDown = false;

const expressApp = new WebSocketExpress();
expressApp.use(bodyParser.json({ limit: "50mb" }));
expressApp.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
expressApp.use(cookieParser());
expressApp.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
expressApp.set("trust proxy", 1);

if (isDevMode) {
    console.log("WARNING: Running in development mode! Not suitable for a production environment!");
    expressApp.disable("view cache");
    expressApp.use(logger("dev"));
}

const publicPath = pathUtils.join(projectPath, "public");
const distPath = pathUtils.join(projectPath, "dist");
const commonScriptsPath = pathUtils.join(distPath, "common");
const clientScriptsPath = pathUtils.join(distPath, "client");
expressApp.use(WebSocketExpress.static(publicPath));
expressApp.use("/javascript/common", WebSocketExpress.static(commonScriptsPath));
expressApp.use("/javascript/client", WebSocketExpress.static(clientScriptsPath));
expressApp.set("views", viewsPath);
expressApp.engine("html", mustacheExpress());
expressApp.use("/", router);

// Catch 404 status and forward to error handler.
expressApp.use((req, res, next) => {
    const error = new Error("Not Found") as ExpressError;
    error.status = 404;
    next(error);
});

// Error handler.
expressApp.use((error: ExpressError, req, res, next) => {
    const statusCode = error.status ?? 500;
    res.status(statusCode);
    const params: TemplateParams = { statusCode, message: error.message };
    if (isDevMode) {
        params.stack = error.stack;
    }
    pageUtils.renderPage(res, "error.html", {}, params);
});

dbUtils.initializeDb();
world.initialize();

const shutdownServer = async () => {
    if (isShuttingDown) {
        return;
    }
    console.log("Shutting down...");
    isShuttingDown = true;
    dbUtils.closeDb();
    world.writeToFile();
    process.exit(0);
};

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);

const portNumber = parseInt(process.env.PORT_NUMBER, 10);
let server;
if (isDevMode) {
    server = http.createServer();
} else {
    const privateKeyPath = pathUtils.join(projectPath, "ssl.key");
    const certificatePath = pathUtils.join(projectPath, "ssl.crt");
    const caBundlePath = pathUtils.join(projectPath, "ssl.ca-bundle");
    server = https.createServer({
        key: fs.readFileSync(privateKeyPath, "utf8"),
        cert: fs.readFileSync(certificatePath, "utf8"),
        ca: fs.readFileSync(caBundlePath, "utf8"),
    });
}
expressApp.attach(server);
server.listen(portNumber, () => {
    console.log(`Listening on port ${portNumber}.`);
});


