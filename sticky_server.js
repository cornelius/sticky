var http = require("http");
var fs = require("fs");
var redis = require("redis");

var db = redis.createClient();

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
      
      db.incr("next.id", function (err, id) {
        if (err) {
          return console.error("error response - " + err);
        }

        db.lpush( "cards", id );
        
        db.set( "card." + id + ".id", id );
        db.set( "card." + id + ".x", data['x'] );
        db.set( "card." + id + ".y", data['y'] );
        
        console.log( "  X: " + data['x'] );
        console.log( "  Y: " + data['y'] );
        res.end( body );
      });
    } );
  } else if ( req.url == "/cards" ) {
    res.writeHead(200);
    db.lrange( "cards", 0, -1, function(err,card_ids) {
      card_ids.forEach( function(id) {
        res.write(id);
        res.write("\n");
      } );
      res.end();
    });
  } else if ( req.url == "/hello" ) {
    res.writeHead(200);
    res.end( "hello" );
  } else {
    res.writeHead(404);
    res.end("File not found");
  }
} );

server.listen(8000);
