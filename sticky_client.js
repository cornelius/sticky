function newId() {
  return Math.random().toString(36).substring(7);
}

function save( id, text, x, y ) {
  $.ajax( {
    url: "/save",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: "{" +
      "\"id\": \"" + id + "\", " + 
      "\"text\": \"" + text + "\", " + 
      "\"x\": " + x + ", " +
      "\"y\": " + y + "}",
    beforeSend: function(x) {
      if (x && x.overrideMimeType) {
        x.overrideMimeType("application/j-son;charset=UTF-8");
      }
    },
    success: function(result) {
//        alert("Response from server: " + result);
    },
    error: function(result) {
      alert("/save Error: " + result );
    }
  } );
}

$(document).ready( function() {

  $.ajax( {
    url: "/cards",
    type: "GET",
    contentType: "application/json; charset=utf-8",
    success: function(result) {
      result.forEach( function( card ) {
        var element = "<div id='" + card.id + "' class='card'> " +
          card.text + "</div>";
        $(element).appendTo(".canvas")
          .css("position","absolute")
          .css("left",card.x + "px")
          .css("top",card.y + "px")
          .draggable();
      });
    },
    error: function(result) {
      alert("/cards Error: " + result );
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
      .draggable()
      .keyup(function(ev) {
        if ( ev.which === 13 ) {
          var text = $('.card-input-field').val();
          $('.card-input').replaceWith( text );
          save( id, text, x, y );
        }
      })
      
    $('.card-input-field').focus();

    $.ajax( {
      url: "/click",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: "{\"id\": \"" + id + "\", " + "\"x\": " + x + ", " + "\"y\": " + y + "}",
      beforeSend: function(x) {
        if (x && x.overrideMimeType) {
          x.overrideMimeType("application/j-son;charset=UTF-8");
        }
      },
      success: function(result) {
//        alert("Response from server: " + result);
      },
      error: function(result) {
        alert("/click Error: " + result );
      }
    } );
  } );
  
  $('.menu .clear').click( function(e) {
    $('.card').remove();
    $.ajax( {
      url: "/clear",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: "",
      beforeSend: function(x) {
        if (x && x.overrideMimeType) {
          x.overrideMimeType("application/j-son;charset=UTF-8");
        }
      },
      success: function(result) {
//        alert("Response from server: " + result);
      },
      error: function(result) {
        alert("/clear Error: " + result );
      }
    } );
  } );
  
} );
