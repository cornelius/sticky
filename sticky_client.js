function newId() {
  return Math.random().toString(36).substring(7);
}

var user_name = "";

$(document).ready( function() {

  function saveCard( id, text, x, y, user ) {
    socket.emit('saveCard',
      { "id": id, "text": text, "x": x, "y": y, "user": user } );
  }

  function dropped( event, ui ) {
    var x = parseInt( ui.offset.left );
    var y = parseInt( ui.offset.top );
    var id = ui.helper.attr("id");
    var text = ui.helper.find(".text").text();
    ui.helper.find(".user").text( user_name );
    saveCard( id, text, x, y, user_name );
  }

  function cardContent( text, user ) {
    return "<span class=\"text\">" + text + "</span><br/>" +
      "<span class=\"user\">" + user + "</span>"
  }

  function newCard( id, x, y, text, user ) {
    var element = "<div id='" + id + "' class='card'> " +
      cardContent( text, user ) +
      "</div>";
    $(element).appendTo(".canvas")
      .css("position","absolute")
      .css("left",x + "px")
      .css("top",y + "px")
      .draggable( { stop: dropped } );
  }

  var socket = io.connect('/');
  
  socket.on('cards', function( data ) {
    data.forEach( function( card ) {
      newCard( card.id, card.x, card.y, card.text, card.user );
    });
    $(".loading").fadeOut("fast");
  });

  socket.on('card', function(data) {
    var card = $(".card#" + data["id"]);
    if (card.length) {
      card.css("left",data["x"] + "px");
      card.css("top",data["y"] + "px");
    } else {
      newCard( data["id"], data["x"], data["y"], data["text"], data["user"] );
    }
  });

  socket.on('trash', function(data) {
    $(".card#" + data["id"]).remove();
  });
  
  socket.on('clear', function(data) {
    $('.card').remove();
  });

  $('.trashcan').droppable( {
    drop: function(event,ui) {
      var id = ui.helper.attr("id");
      socket.emit("trash", { "id": id });
      ui.helper.remove();
    }
  });

  $('.canvas').click( function(e) {
    var x = e.pageX;
    var y = e.pageY;

    var id = newId();
    
    var card = "<div id='" + id + "' class='card'>" +
        "<div class='card-input'>" +
          "<div class='card-input-label'>Enter text for card:</div>" +
          "<input class='card-input-field' type='text'></input>" +
        "</div>" +
      "</div>";

    $(".card.new-card").remove();
    
    $(card).appendTo(".canvas")
      .addClass("new-card")
      .css("position","absolute")
      .css("left",x)
      .css("top",y)
      .draggable( { stop: dropped } )
      .keyup(function(ev) {
        if ( ev.which === 13 ) {
          var text = $('.card-input-field').val();
          $('.card-input').replaceWith( cardContent( text, user_name ) );
          $('.card').removeClass("new-card");
          saveCard( id, text, x, y, user_name );
        }
      })
      
    $('.card-input-field').focus();
  });
  
  $('.menu .clear').click( function(e) {
    $('.card').remove();
    socket.emit("clear");
  });

  function saveName() {
    user_name = $("#name-entry").val();
    $("<span>Welcome, " + user_name + "!</span>").appendTo('.welcome');
    $('#name-dialog').dialog("close");
  }

  $('#name-entry').keyup(function(ev) {
    if ( ev.which === 13 ) {
      saveName();
    }
  });
  
  $('#name-dialog').dialog({
    modal: true,
    buttons: { "Continue": saveName }
  });
});
