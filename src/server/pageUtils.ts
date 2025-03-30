
import * as fs from "fs";
import * as pathUtils from "path";
import { Request, Response } from "express";
import Mustache from "mustache";
import { PageOptions, TemplateParams, SessionAccount } from "./types.js";
import { viewsPath, isDevMode } from "./constants.js";

export const renderPage = (
    res: Response,
    path: string,
    options: PageOptions = {},
    params: TemplateParams = {},
): void => {
    const templatePath = pathUtils.join(viewsPath, path);
    const template = fs.readFileSync(templatePath, "utf8");
    const content = Mustache.render(template, params);
    res.render("template.html", {
        scripts: options.scripts ?? [],
        stylesheets: options.stylesheets ?? [],
        content,
        contentWidth: options.contentWidth ?? 700,
    });
};

export const getSessionAccount = (req: Request): SessionAccount | null => {
    if (isDevMode) {
        const { username } = req.query;
        if (typeof username !== "undefined") {
            req.session.username = username;
        }
    }
    const { username, isGuest } = req.session;
    return (typeof username === "undefined") ? null : { username, isGuest };
};

export const hasLoggedIn = (req: Request, allowGuest = false): boolean => {
    const account = getSessionAccount(req);
    if (account === null) {
        return false;
    }
    return allowGuest ? true : !account.isGuest;
};

export const checkAuthentication = (
    req: Request,
    res: Response,
    allowGuest = false,
): boolean => {
    if (hasLoggedIn(req, allowGuest)) {
        return true;
    }
    res.redirect("/login");
    return false;
};


