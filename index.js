import pkg from "lodash";
import express from "express";

import bodyParser from "body-parser";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const app = express();

app.use(bodyParser.json());

app.use(express.static("public"));

app.use("/layers", express.static("./layers"));
app.use("/data", express.static("./data"));

app.use("/input", (req, res) => {
  res.sendFile("./input.html", { root: __dirname });
});

app.use("/v2", (req, res) => {
  res.sendFile("./v2.html", { root: __dirname });
});

app.use("/v21", (req, res) => {
  res.sendFile("./v21.html", { root: __dirname });
});

app.use("/approved", async (req, res) => {
  res.sendFile("./approved.html", { root: __dirname });
});

app.use("/", async (req, res) => {
  res.send("Please use v2");
});

app.listen(process.env.PORT || 8080);
