const express = require('express'),
  server = express();

const fs = require("fs");

const LOG_PATH = "/var/log";
const BUFFER_SIZE = 1024;

server.get("/:log", async (req, res) => {
  try {
    const { log } = req.params;
    const { lines, filter } = req.query;

    if (!log) {
      return res.status(400).send({
        message: "Log file required"
      });
    }

    const logFilePath = `${LOG_PATH}/${log}`;

    fs.open(logFilePath, 'r', function(err, fd) {
      // If we had a problem getting/opening our log file, stop processing and inform our user
      if (err || !fd) {
        return res.status(400).send({
          message: "There was a problem opening the requested log file"
        });
      }

      // Get log file size to start reading position in proper place
      const stats = fs.fstatSync(fd);
      const fileSize = stats.size;

      let fileData = '';
      let buffer = Buffer.alloc(BUFFER_SIZE);
      let position = fileSize;
      let numLinesProcessed = 0;
      let eof = false, done = false;

      do {
        // Calculate the position where we want to start reading from
        const tempPos = Math.max(0, position - BUFFER_SIZE);

        // Read file portion into buffer
        const bytesRead = fs.readSync(fd, buffer, {
          length: Math.min(BUFFER_SIZE, position),
          position: tempPos
        });

        // Update position in the file
        position = tempPos;

        const linesToProcess = [];
        // Split our lines by new line
        const lines = buffer.slice(0, bytesRead).toString().split(/(\r)?\n/);
        for (const line of lines) {
          if (line) {
            if (!filter || line.indexOf(filter) !== -1) {
              // If we don't have a filter, or if we have a filter and this line matches the filter, 
              // increment number of lines processed and add it to our lines array
              numLinesProcessed++;
              linesToProcess.push(line);
            }
          }
        }

        // Create a new line delimeted string and prepend to our data
        fileData = linesToProcess.join("<br />") + fileData;

        // If the user gave us a line limit and we've exceeded that, stop parsing log file
        if (lines && numLinesProcessed >= lines) {
          done = true;
        }

        // If our position is below or at 0, we're done reading the log file
        eof = position <= 0;
      } while (!eof && !done);

      // Reverse our array using <br>'s as our delimeter
      const reversed = fileData.split("<br />").reverse();

      // If our log file had an empty last line, remove it from the top of the reversed array
      const emptyFirstLine = reversed[0] === "";
      if (emptyFirstLine) reversed.shift();

      // Grab only the number of lines we need and join using <br>'s
      const body = reversed.slice(0, lines).join("<br />");

      res.send(body);
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
