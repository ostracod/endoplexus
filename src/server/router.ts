
import express from "express";
import * as pageUtils from "./pageUtils.js";

export const router = express.Router();

router.get("/login", (req, res) => {
    pageUtils.renderPage(
        res, "login.html",
        { scripts: ["/javascript/client/login.js"] },
    );
});


