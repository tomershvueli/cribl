const fs = require('fs');
const superagent = require('superagent');

const endpoint = 'http://localhost:3000/log/';

describe('get log file', () => {
  it('should return 200 for log file that exists', async () => {
    const res = await superagent.get(`${endpoint}wifi.log`);
    expect(res.statusCode).toEqual(200);
  });

  it('should return 400 for log file that does not exist', async () => {
    try {
      await superagent.get(`${endpoint}not_here.log`);
    } catch (err) {
      expect(err.response.statusCode).toEqual(400);
    }
  });

  it('should return the log file backwards', async () => {
    const res = await superagent.get(`${endpoint}wifi.log`);
    expect(res.statusCode).toEqual(200);
    
    const lines = res.text.split("<br />");
    expect(lines[0].indexOf("Thu Jun 10 14:05:54.106")).not.toEqual(-1);
    expect(lines[lines.length - 1].indexOf("Jun  9 00:16:23")).not.toEqual(-1);
  });

  it('should match our file line by line, backwards', async () => {
    const res = await superagent.get(`${endpoint}wifi.log`);
    expect(res.statusCode).toEqual(200);

    const resLines = res.text.split("<br />");

    fs.open("mocks/logs/wifi.log", 'r', function(_err, fd) {
      const body = fs.readFileSync(fd, 'utf-8');
      // Let's get the number of lines in the response, but filter to make sure it exists and isn't undefined
      const bodyLines = body.split(/(\r)?\n/).filter(i => !!i);

      expect(resLines.length).toEqual(bodyLines.length);
      expect(resLines.reverse()).toEqual(bodyLines);
    });
  });

  it('should return correct number of lines if passed in', async () => {
    const numLines = 5;
    const res = await superagent.get(`${endpoint}wifi.log?lines=${numLines}`);
    expect(res.statusCode).toEqual(200);
    expect(res.text.match(/<br \/>/g).length).toEqual(numLines - 1);
  });

  it('should return only lines with filter phrase present', async () => {
    const filter = "com.apple.wifi.join_history";
    const res = await superagent.get(`${endpoint}wifi.log?filter=${filter}`);
    expect(res.statusCode).toEqual(200);
    
    const lines = res.text.split("<br />");
    for (const line of lines) {
      expect(line.indexOf(filter)).not.toEqual(-1);
    }
  });

  it('should return specified number of lines with filter phrase present', async () => {
    const filter = "com.apple.wifi.join_history";
    const numLines = 5;
    const res = await superagent.get(`${endpoint}wifi.log?filter=${filter}&lines=${numLines}`);
    expect(res.statusCode).toEqual(200);
    
    const lines = res.text.split("<br />");
    expect(lines.length).toEqual(numLines);
    
    for (const line of lines) {
      expect(line.indexOf(filter)).not.toEqual(-1);
    }
  });
});
