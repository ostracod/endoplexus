
import express from "express";

export const router = express.Router();

router.get("/test", async (req, res) => {
    res.json({ success: true });
});


