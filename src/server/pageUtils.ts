
import * as fs from "fs";
import * as pathUtils from "path";
import { Response } from "express";
import Mustache from "mustache";
import { PageOptions, TemplateParams } from "./types.js";
import { viewsPath } from "./constants.js";

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


