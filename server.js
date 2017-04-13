var http = require('http');

var server = http.createServer();

server.on('request', function(req, res) {
  console.log("From: " + req.connection.remoteAddress);
  console.log("To:   " + req.headers.host);
  console.log("Page: " + req.url);

  var response = "<html>Welcome to the Island of PodPi!<br>" +
                 "your address is: " + req.connection.remoteAddress +
                 "<html>";
  res.write(response);
  res.end();
});

server.listen(8080, function() {
  console.log("OK, I'm listening... ", server.address());
});
