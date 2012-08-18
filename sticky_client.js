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

  var socket = io.connect('/');

  socket.on('cards', function( data ) {
    data.forEach( function( card ) {
      var element = "<div id='" + card.id + "' class='card'> " +
        card.text + "</div>";
      $(element).appendTo(".canvas")
        .css("position","absolute")
        .css("left",card.x + "px")
        .css("top",card.y + "px")
        .draggable( { stop: dropped } );
    });
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
    
    $(card).appendTo(".canvas")
      .css("position","absolute")
      .css("left",x)
      .css("top",y)
      .draggable( { stop: dropped } )
      .keyup(function(ev) {
        if ( ev.which === 13 ) {
          var text = $('.card-input-field').val();
          $('.card-input').replaceWith( text );
          save( id, text, x, y );
        }
      })
      
    $('.card-input-field').focus();

    socket.emit("click", { "id": id, "x": x, "y": y });
  });
  
  $('.menu .clear').click( function(e) {
    $('.card').remove();
    socket.emit("clear");
  });

});
