
import express from "express";
import bcrypt from "bcrypt";
import { AccountRow } from "./types.js";
import { maxPlayerShield } from "./constants.js";
import * as pageUtils from "./pageUtils.js";
import { getDb, getAccountRow } from "./dbUtils.js";

export const router = express.Router();

router.get("/", (req, res) => {
    const account = pageUtils.getSessionAccount(req);
    if (account === null) {
        res.redirect("/login");
    } else if (account.isGuest) {
        res.redirect("/game");
    } else {
        res.redirect("/menu");
    }
});

router.get("/login", (req, res) => {
    pageUtils.renderPage(
        res, "login.html",
        { scripts: ["/javascript/client/login.js"] },
    );
});

router.get("/createAccount", (req, res) => {
    pageUtils.renderPage(
        res, "createAccount.html",
        { scripts: ["/javascript/client/createAccount.js"] },
    );
});

router.post("/createAccountAction", async (req, res) => {
    const { username, password, emailAddress } = req.body;
    const db = getDb();
    const rows = db.prepare("SELECT id FROM Accounts WHERE username = ?").all(username);
    if (rows.length > 0) {
        res.json({
            success: false,
            message: "An account with that username already exists.",
        });
        return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const accountRow: Omit<AccountRow, "id"> = {
        username,
        passwordHash,
        emailAddress,
        score: 0,
        shield: maxPlayerShield,
        inventoryItems: "[]",
    };
    db.prepare("INSERT INTO Accounts (username, passwordHash, emailAddress, score, shield, inventoryItems) VALUES (@username, @passwordHash, @emailAddress, @score, @shield, @inventoryItems)").run(accountRow);
    res.json({ success: true });
});

router.post("/loginAction", async (req, res) => {
    const { username, password } = req.body;
    const isGuest = (typeof password === "undefined");
    if (!isGuest) {
        const row = getAccountRow(username);
        if (typeof row === "undefined") {
            res.json({
                success: false,
                message: "Could not find an account with the given username.",
            });
            return;
        }
        const hashMatches = await bcrypt.compare(password, row.passwordHash);
        if (!hashMatches) {
            res.json({
                success: false,
                message: "Incorrect password.",
            });
            return;
        }
    }
    req.session.username = username;
    req.session.isGuest = isGuest;
    res.json({ success: true });
});

router.get("/logout", (req, res) => {
    delete req.session.username;
    delete req.session.isGuest;
    res.redirect("/login");
});

router.get("/menu", (req, res) => {
    if (!pageUtils.checkAuthentication(req, res)) {
        return;
    }
    const { username } = pageUtils.getSessionAccount(req);
    const row = getAccountRow(username);
    pageUtils.renderPage(
        res, "menu.html", {},
        { username, score: row.score },
    );
});

router.get("/changePassword", (req, res) => {
    if (!pageUtils.checkAuthentication(req, res)) {
        return;
    }
    pageUtils.renderPage(
        res, "changePassword.html",
        { scripts: ["/javascript/client/changePassword.js"] },
    );
});

router.post("/changePasswordAction", async (req, res) => {
    if (!pageUtils.checkAuthentication(req, res)) {
        return;
    }
    const { oldPassword, newPassword } = req.body;
    const { username } = pageUtils.getSessionAccount(req);
    const row = getAccountRow(username);
    const oldHashMatches = await bcrypt.compare(oldPassword, row.passwordHash);
    if (!oldHashMatches) {
        res.json({
            success: false,
            message: "Old password is incorrect",
        });
        return;
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    getDb().prepare("UPDATE Accounts SET passwordHash = ? WHERE id = ?")
        .run(newPasswordHash, row.id);
    res.json({ success: true });
});

router.get("/game", (req, res) => {
    if (!pageUtils.checkAuthentication(req, res, true)) {
        return;
    }
    const account = pageUtils.getSessionAccount(req);
    pageUtils.renderPage(
        res, "game.html",
        {
            scripts: ["/javascript/client/game.js"],
            stylesheets: ["/stylesheets/game.css"],
            contentWidth: 1000,
        },
        { isGuestAccount: account.isGuest },
    );
});


