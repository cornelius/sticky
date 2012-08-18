var http = require("http");
var fs = require("fs");
var redis = require("redis");
var Step = require("step");

var db = redis.createClient();
var server = http.Server( handler );

var io = require("socket.io").listen(server);

server.listen(8000);

io.sockets.on('connection', function (socket) {
  var result = [];
  Step(
    function loadCardList() {
      db.lrange( "cards", 0, -1, this );
    },
    function loadCards(err,card_ids) {
      if ( err ) throw err;
      var group = this.group();
      card_ids.forEach( function (id) {
        loadCard( id, group() );
      });
    },
    function printCards(err,cards) {
      cards.forEach( function(card) {
        result.push( card );
      });
      socket.emit( 'cards', result );
    }
  );

  socket.on('save', function(data) {
    var id = data['id'];

    console.log( "SAVE ID: " + id );
    
    db.get( "card." + id + ".id", function( err, value ) {
      if ( err ) {
        console.log( "Error getting id for " + id );
      } else {
        if ( id === value ) {
          db.set( "card." + id + ".x", data['x'] );
          db.set( "card." + id + ".y", data['y'] );
          db.set( "card." + id + ".text", data['text'] );
        }
      }
    });
  });
  
  socket.on("click", function(data) {
    var id = data['id'];

    console.log( "CLICK: " + id );
    
    db.lpush( "cards", id );
    
    db.set( "card." + id + ".id", id );
    db.set( "card." + id + ".x", data['x'] );
    db.set( "card." + id + ".y", data['y'] );
    
    console.log( "  ID: " + id );
    console.log( "  X: " + data['x'] );
    console.log( "  Y: " + data['y'] );
  });
  
  socket.on("trash", function(data) {
    var id = data['id'];

    console.log( "DELETE " + id );

    db.lrem( "cards", 0, id );
    
    db.del( "card." + id + ".id" );
    db.del( "card." + id + ".x" );
    db.del( "card." + id + ".y" );
    db.del( "card." + id + ".text" );
  });

  socket.on("clear", function(data) {
    console.log("CLEAR");
    db.del( "cards" );
  });  
});

function handler(req,res) {  
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
  } else if ( req.url == "/hello" ) {
    res.writeHead(200);
    res.end( "hello" );
  } else {
    res.writeHead(404);
    res.end("File not found");
  }
}

function loadCard( id, cb ) {
  var card = {};
  card.id = id;
  Step(
    function loadCard() {
      db.get( "card." + id + ".x", this.parallel() );
      db.get( "card." + id + ".y", this.parallel() );
      db.get( "card." + id + ".text", this.parallel() );
    },
    function saveCard(err,x,y,text) {
      card.x = x;
      card.y = y;
      card.text = text;
      return card;
    },
    function printCard(err,card) {
      cb( 0, card );
    }
  )
}
