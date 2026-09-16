import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public", {
  extensions: ["html"],
  maxAge: "1h"
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(port, "0.0.0.0", () => {
  console.log(`Marvel Tower Defense running on port ${port}`);
});
