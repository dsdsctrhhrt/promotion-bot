// bot-server.js
//
// This server logs in AS your bot's Roblox account and promotes people
// exactly the way a human staff member would from the group's website -
// just triggered automatically when your game asks it to.
//
// Requires the "noblox.js" package (see package.json).

const express = require("express");
const noblox = require("noblox.js");

const app = express();
app.use(express.json());

// Set these as Environment Variables on your host. Never hardcode them,
// and especially never put ROBLOSECURITY in code you upload anywhere
// public - anyone with that value can fully log in as your bot account.
const GROUP_ID = Number(process.env.GROUP_ID);
const GAME_SECRET = process.env.GAME_SECRET;
const ROBLOSECURITY = process.env.ROBLOSECURITY;

let botReady = false;

noblox.setCookie(ROBLOSECURITY)
	.then((currentUser) => {
		botReady = true;
		console.log(`Bot logged in as ${currentUser.UserName} (${currentUser.UserID})`);
	})
	.catch((err) => {
		console.error("Bot failed to log in - your ROBLOSECURITY cookie is probably wrong or expired:", err);
	});

app.post("/setRank", async (req, res) => {
	try {
		const { secret, userId, rank } = req.body;

		if (secret !== GAME_SECRET) {
			return res.status(403).json({ error: "bad secret" });
		}
		if (!botReady) {
			return res.status(503).json({ error: "bot is not logged in yet, try again shortly" });
		}
		if (!userId || !rank) {
			return res.status(400).json({ error: "missing userId or rank" });
		}

		await noblox.setRank({ group: GROUP_ID, target: userId, rank: rank });

		return res.json({ success: true });
	} catch (err) {
		console.error("Rank change failed:", err);
		return res.status(500).json({ error: String(err) });
	}
});

app.get("/", (req, res) => {
	res.send("Rank bot is running. Logged in: " + botReady);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("Bot server listening on port " + PORT);
});
