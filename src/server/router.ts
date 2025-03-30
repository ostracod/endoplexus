
import express from "express";
import bcrypt from "bcrypt";
import { AccountRow } from "./types.js";
import { maxPlayerShield } from "./constants.js";
import * as pageUtils from "./pageUtils.js";
import { getDb } from "./dbUtils.js";

export const router = express.Router();

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
        const row = getDb().prepare("SELECT passwordHash FROM Accounts WHERE username = ?").get(username) as AccountRow;
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

router.get("/menu", (req, res) => {
    if (!pageUtils.checkAuthentication(req, res)) {
        return;
    }
    res.send("TODO: Put menu here.");
});

router.get("/game", (req, res) => {
    if (!pageUtils.checkAuthentication(req, res, true)) {
        return;
    }
    res.send("TODO: Put game page here.");
});


