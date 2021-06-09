const express = require('express'),
  server = express();

const fs = require("fs");

const LOG_PATH = "/var/log";
const BUFFER_SIZE = 1024;

server.get("/:log", async (req, res) => {
  try {
    const log = req.params.log;

    if (!log) {
      return res.status(400).send({
        message: "Log file required"
      });
    }

    const logFilePath = `${LOG_PATH}/${log}`;

    fs.open(logFilePath, 'r', function(err, fd) {
      if (err || !fd) {
        return res.status(400).send({
          message: "There was a problem opening the requested log file"
        });
      }

      const stats = fs.fstatSync(fd);
      const fileSize = stats.size;

      let fileData = '';
      let buffer = Buffer.alloc(BUFFER_SIZE);
      let position = fileSize;
      let length;
      let eof = false;

      do {
        position = Math.max(0, position - BUFFER_SIZE);
        length = Math.min(BUFFER_SIZE, position === 0 ? BUFFER_SIZE : position);

        let bytesRead = fs.readSync(fd, buffer, {
          length,
          position
        });

        fileData = buffer.slice(0, bytesRead).toString().replace(/(\r)?\n/g, "<br />") + fileData;

        eof = position <= 0;
      } while (!eof);

      res.send(fileData);
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
