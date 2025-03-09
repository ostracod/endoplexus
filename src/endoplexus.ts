
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import logger from "morgan";
import mustacheExpress from "mustache-express";
import { TemplateParams, ExpressError } from "./server/types.js";
import { publicPath, commonScriptsPath, clientScriptsPath, viewsPath, privateKeyPath, certificatePath, caBundlePath, isDevMode, sessionSecret, serverPortNumber } from "./server/constants.js";
import * as pageUtils from "./server/pageUtils.js";
import { router } from "./server/router.js";

let isShuttingDown = false;

const expressApp = express();
expressApp.use(bodyParser.json({ limit: "50mb" }));
expressApp.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
expressApp.use(cookieParser());
expressApp.use(expressSession({
    secret: sessionSecret,
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

expressApp.use(express.static(publicPath));
expressApp.use("/javascript/common", express.static(commonScriptsPath));
expressApp.use("/javascript/client", express.static(clientScriptsPath));
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

const shutdownServer = async () => {
    if (isShuttingDown) {
        return;
    }
    console.log("Shutting down...");
    isShuttingDown = true;
    // TODO: Persist server state before shutting down.

    process.exit(0);
};

process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);

let server;
if (isDevMode) {
    server = http.createServer(expressApp);
} else {
    server = https.createServer({
        key: fs.readFileSync(privateKeyPath, "utf8"),
        cert: fs.readFileSync(certificatePath, "utf8"),
        ca: fs.readFileSync(caBundlePath, "utf8"),
    }, expressApp);
}
const portNumber = parseInt(serverPortNumber, 10);
server.listen(portNumber, () => {
    console.log(`Listening on port ${portNumber}.`);
});


