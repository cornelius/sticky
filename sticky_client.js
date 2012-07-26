
$(document).ready( function() {

  $('body').click( function(e) {
    $('.click').append("<li>Click: " + e.pageX + "</li>");
    $.ajax( {
      url: "/click",
      type: "POST",
      contentType: "application/json; charset=utf-8",
      data: "{\"x\": " + e.pageX + "}",
      beforeSend: function(x) {
        if (x && x.overrideMimeType) {
          x.overrideMimeType("application/j-son;charset=UTF-8");
        }
      },
      success: function(result) {
        alert("Response from server: " + result);
      },
      error: function(result) {
        alert("Error: " + result );
      }
    } );
  } );
} );
