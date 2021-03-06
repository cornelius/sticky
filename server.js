var fs = require("fs");
var Step = require("step");

var nconf = require("nconf");
nconf.env('__').file({ file: 'config.json' });
var port = nconf.get("PORT");
var db_host = nconf.get("DB:HOST");
var db_port = nconf.get("DB:PORT");
var db_pass = nconf.get("DB:PASS");

console.log("PORT " + port );

var db = require("redis").createClient(db_port,db_host);

if ( db_pass ) {
  db.auth(db_pass, function (err) {
    if (err) {
      console.log("ERROR CONNECTING TO REDIS");
      throw err;
    }
    console.log("CONNECTED TO REDIS");
    main();
  });
} else {
  main();
}

function main() {
  var app = require("http").Server( handler ).listen(port);
  var io = require("socket.io").listen(app);

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

    socket.on("userJoined", function(data) {
      socket.broadcast.emit( "userJoined", { "user": data["user"] } );
      socket.set("user",data["user"]);

      Step(
        function getUsers() {
          var group = this.group();
          io.sockets.clients().forEach( function( other_socket ) {
            if ( socket != other_socket ) {
              other_socket.get("user",group());
            }
          });
        },
        function printUsers(err,users) {
          socket.emit( 'printUsers', users );
        }
      );
    });

    socket.on("disconnect", function() {
      socket.get("user",function(err,user) {
        socket.broadcast.emit( "userLeft", { "user": user } );
      });
    });
    
    socket.on('saveCard', function(data) {
      var id = data['id'];

      console.log( "SAVE " + JSON.stringify(data) );
      
      db.get( "card." + id + ".id", function( err, value ) {
        if ( err ) {
          console.log( "Error getting id for " + id );
        } else {
          if ( id !== value ) {
            db.lpush( "cards", id );
            db.set( "card." + id + ".id", id );
          }
          db.set( "card." + id + ".x", data['x'] );
          db.set( "card." + id + ".y", data['y'] );
          db.set( "card." + id + ".text", data['text'] );
          db.set( "card." + id + ".user", data['user'] );
          
          socket.broadcast.emit( "card",
            { "id": id, "x": data["x"], "y": data["y"], "text": data["text"],
              "user": data["user"] }
          );
        }
      });
    });
    
    socket.on("trash", function(data) {
      var id = data['id'];

      console.log( "TRASH " + id );

      db.lrem( "cards", 0, id );
      
      db.del( "card." + id + ".id" );
      db.del( "card." + id + ".x" );
      db.del( "card." + id + ".y" );
      db.del( "card." + id + ".text" );
      db.del( "card." + id + ".user" );
      
      socket.broadcast.emit("trash", { "id": id });
    });

    socket.on("clear", function(data) {
      console.log("CLEAR");

      db.del( "cards" );
      
      socket.broadcast.emit("clear");
    });
  });

  function loadCard( id, cb ) {
    var card = {};
    card.id = id;
    Step(
      function loadCard() {
        db.get( "card." + id + ".x", this.parallel() );
        db.get( "card." + id + ".y", this.parallel() );
        db.get( "card." + id + ".text", this.parallel() );
        db.get( "card." + id + ".user", this.parallel() );
      },
      function saveCard(err,x,y,text,user) {
        card.x = x;
        card.y = y;
        card.text = text;
        if ( user === null ) {
          card.user = "";
        } else {
          card.user = user;
        }
        return card;
      },
      function printCard(err,card) {
        cb( 0, card );
      }
    )
  }

  function handler(req,res) {  
    console.log( req.url );
    
    if ( req.url == "/" ) {
      fs.readFile("index.html", function(error,content) {
        if (error) {
          res.writeHead(500);
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      } );
    } else if ( req.url == "/sticky_client.js" ) {
      fs.readFile("sticky_client.js", function(error,content) {
        if (error) {
          res.writeHead(500);
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/javascript' });
          res.end(content, 'utf-8');
        }
      } );
    } else if ( req.url == "/sticky.css" ) {
      fs.readFile("sticky.css", function(error,content) {
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
}
