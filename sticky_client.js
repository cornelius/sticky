
$(document).ready( function() {

  $.ajax( {
    url: "/cards",
    type: "GET",
    contentType: "application/json; charset=utf-8",
    success: function(result) {
      result.forEach( function( card ) {
        var x = card.x;
        $("<div class='card'>Old Card</div>").appendTo(".canvas")
          .css("position","absolute")
          .css("left",card.x + "px")
          .css("top",card.y + "px");
      });
    },
    error: function(result) {
      alert("Error: " + result );
    }
  });

  $('.canvas').click( function(e) {
    var x = e.pageX;
    var y = e.pageY;
    
    $("<div class='card'>Hello</div>").appendTo(".canvas")
      .css("position","absolute")
      .css("left",x)
      .css("top",y);
    $.ajax( {
      url: "/click",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: "{\"x\": " + x + ", " + "\"y\": " + y + "}",
      beforeSend: function(x) {
        if (x && x.overrideMimeType) {
          x.overrideMimeType("application/j-son;charset=UTF-8");
        }
      },
      success: function(result) {
//        alert("Response from server: " + result);
      },
      error: function(result) {
        alert("Error: " + result );
      }
    } );
  } );
  
  $('.menu .clear').click( function(e) {
    $('.card').remove();
  } );
  
} );
