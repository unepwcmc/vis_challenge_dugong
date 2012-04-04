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

});
