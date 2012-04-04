$(function() {

  //Build the map
  window.DUGONG.map = new L.Map('map', {
    center : new L.LatLng(24.443935, 54.41905),
    zoom : 13
  });

  // create a CloudMade tile layer
  var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/f6825bb39564441ea5548f3886452056/997/256/{z}/{x}/{y}.png', cloudmade = new L.TileLayer(cloudmadeUrl, {
    maxZoom : 18
  });

  // add the CloudMade layer to the map
  window.DUGONG.map.addLayer(cloudmade);

  window.DUGONG.CartoDB.init();

  window.DUGONG.draw_dugongs = function(){
    $.each(window.DUGONG.map_markers, function(idx){
      //var markerLocation = new L.LatLng(this.latitude, this.longitude);
      //var marker = new L.Marker(markerLo);
      window.DUGONG.map.addLayer(this);
    });
  }

  window.DUGONG.remove_dugongs = function(){
    $.each(window.DUGONG.map_markers, function(idx){
      window.DUGONG.map.removeLayer(this);
    });
    window.DUGONG.map_markers = [];
  }

  window.DUGONG.map_markers = [];

  window.DUGONG.map_render = function(){
    window.DUGONG.remove_dugongs();
    $('.dugong').each(function(e){
      var latlng = new L.LatLng($(this).find('.latitude').text(), $(this).find('.longitude').text());
      window.DUGONG.map_markers.push(new L.Marker(latlng));
    });
    window.DUGONG.draw_dugongs();
  }

});
