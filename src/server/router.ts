
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


