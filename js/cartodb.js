(function() {
  window.DUGONG.CartoDB = {
  init : function() {
    this.resource_path = 'carbon-tool.cartodb.com/api/v1/sql';
    this.resource_url = 'https://' + this.resource_path;
    this.data = [];
    this.query("SELECT * FROM dugongs LIMIT 500", function(data){
      window.DUGONG.create_graphs(data.rows);
      //window.DUGONG.draw_dugongs();
    });
  },
  query : function(sql, callback, proxy) {
    var url = this.resource_url;
    var crossDomain = true;
    if(proxy) {
      url = 'api/v0/proxy/' + this.resource_url
      crossDomain = false;
    }
    if(sql.length > 1500) {
      $.ajax({
        url : url,
        crossDomain : crossDomain,
        type : 'POST',
        dataType : 'json',
        data : 'q=' + encodeURIComponent(sql),
        success : callback,
        error : function() {
          if(proxy) {
            callback();
          } else {
            //try fallback
            app.Log.log("failed cross POST, using proxy");
            query(sql, callback, true)
          }
        }
      });
    } else {
      //OK, if the server returns 400 none of the callbacks are called
      // :(
      $.getJSON(this.resource_url + '?q=' + encodeURIComponent(sql) + '&callback=?').success(callback).fail(function() {
        callback();
      }).complete(function() {
      });
    }
  }
};

})();
