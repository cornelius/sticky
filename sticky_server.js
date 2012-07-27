var http = require("http");
var fs = require("fs");

var server = http.Server( function(req,res) {
  
  console.log( req.url );
  
  if ( req.url == "/" ) {
    fs.readFile("./index.html", function(error,content) {
      if (error) {
        res.writeHead(500);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      }
    } );
  } else if ( req.url == "/sticky_client.js" ) {
    fs.readFile("./sticky_client.js", function(error,content) {
      if (error) {
        res.writeHead(500);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(content, 'utf-8');
      }
    } );
  } else if ( req.url == "/sticky.css" ) {
    fs.readFile("./sticky.css", function(error,content) {
      if (error) {
        res.writeHead(500);
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(content, 'utf-8');
      }
    } );
  } else if ( req.url == "/click" ) {
    res.writeHead(200, {'Content-Type': 'application/x-json'});
    var body = "";
    req.on('data', function(chunk) {
      body += chunk;
    } );
    req.on('end', function() {
      console.log( "  BODY: " + body );
      var data = JSON.parse( body );
      console.log( "  X: " + data['x'] );
      console.log( "  Y: " + data['y'] );
      res.end( body );
    } );
  } else if ( req.url == "/hello" ) {
    res.writeHead(200);
    res.end( "hello" );
  } else {
    res.writeHead(404);
    res.end("File not found");
  }
} );

server.listen(8000);
