http = require("http");

var server = http.Server( function(req,res) {
  res.end("hello");
} );

server.listen(8000);
