const express = require('express'),
  server = express();

const fs = require("fs");

const LOG_PATH = "/var/log";

server.get("/:log", async (req, res) => {
  try {
    const log = req.params.log;

    if (!log) {
      return res.status(400).send({
        message: "Log file required"
      });
    }

    const logFilePath = `${LOG_PATH}/${log}`;

    fs.readFile(logFilePath, 'utf8', (err, data) => {
      res.json(data);
   });
  } catch (err) {
    // Be sure to log the error somewhere appropriate and notify code owners
    res.status(500).send({
      message: "There was a problem with your request"
    });
  }
});

server.get("*", (req, res) => {
  res.status(404).send({
    url: `${req.originalUrl} not found`
  });
});

module.exports = server;
