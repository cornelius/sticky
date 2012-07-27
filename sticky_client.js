
$(document).ready( function() {

  $('body').click( function(e) {
    var x = e.pageX;
    var y = e.pageY;
    
    $("<div class='card'>Hello</div>").appendTo("body")
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
} );
