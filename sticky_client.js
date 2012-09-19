function newId() {
  return Math.random().toString(36).substring(7);
}

$(document).ready( function() {

  function save( id, text, x, y ) {
    socket.emit('save', { "id": id, "text": text, "x": x, "y": y } );
  }

  function dropped( event, ui ) {
    var x = parseInt( ui.offset.left );
    var y = parseInt( ui.offset.top );
    var id = ui.helper.attr("id");
    var text = ui.helper.text();
    save( id, text, x, y );
  }

  function newCard( id, x, y, text ) {
    var element = "<div id='" + id + "' class='card'> " +
      text + "</div>";
    $(element).appendTo(".canvas")
      .css("position","absolute")
      .css("left",x + "px")
      .css("top",y + "px")
      .draggable( { stop: dropped } );
  }

  var socket = io.connect('/');
  
  socket.on('cards', function( data ) {
    data.forEach( function( card ) {
      newCard( card.id, card.x, card.y, card.text );
    });
    $(".loading").fadeOut("fast");
  });

  socket.on('card', function(data) {
    var card = $(".card#" + data["id"]);
    if (card.length) {
      card.css("left",data["x"] + "px");
      card.css("top",data["y"] + "px");
    } else {
      newCard( data["id"], data["x"], data["y"], data["text"] );
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
          $('.card-input').replaceWith( text );
          $('.card').removeClass("new-card");
          save( id, text, x, y );
        }
      })
      
    $('.card-input-field').focus();
  });
  
  $('.menu .clear').click( function(e) {
    $('.card').remove();
    socket.emit("clear");
  });

  function saveName() {
    var name = $("#name-entry").val();
    $("<span>Welcome, " + name + "!</span>").appendTo('.welcome');
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
