(function() {

  // (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
  window.DUGONG.create_graphs = function(dugongs) {

    // Various formatters.
    var formatNumber = d3.format(",d"),
        formatChange = d3.format("+,d"),
        formatDate = d3.time.format("%B %d, %Y"),
        formatTime = d3.time.format("%I:%M %p");

    // Create the crossfilter for the relevant dimensions and groups.
    var dugong = crossfilter(dugongs),
        all = dugong.groupAll(),
        year = dugong.dimension(function(d) { return d.year; }),
        years = year.group(),
        season = dugong.dimension(function(d) { return d.season; }),
        seasons = season.group();

    var charts = [

      // Year
      barChart()
          .dimension(year)
          .group(years)
        .x(d3.scale.linear()
            .domain([2000, 2012.25])
            .rangeRound([0, 10 * 60])),

      // Season
      barChart()
          .dimension(season)
          .group(seasons)
        .x(d3.scale.linear()
            .domain([0, 3.25])
            .rangeRound([0, 10 * 24])),

    ];

    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    var chart = d3.selectAll(".chart")
        .data(charts)
        .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

    // Render the total.
    d3.selectAll("#total")
        .text(formatNumber(dugong.size()));

    renderAll();

    // Renders the specified chart or list.
    function render(method) {
      d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
      chart.each(render);
      d3.select("#active").text(formatNumber(all.value()));
    }

    // Like d3.time.format, but faster.
    function parseDate(d) {
      return new Date(2001,
          d.substring(0, 2) - 1,
          d.substring(2, 4),
          d.substring(4, 6),
          d.substring(6, 8));
    }

    window.filter = function(filters) {
      filters.forEach(function(d, i) { charts[i].filter(d); });
      renderAll();
    };

    window.reset = function(i) {
      charts[i].filter(null);
      renderAll();
    };

    function barChart() {
      if (!barChart.id) barChart.id = 0;

      var margin = {top: 10, right: 10, bottom: 20, left: 10},
          x,
          y = d3.scale.linear().range([100, 0]),
          id = barChart.id++,
          axis = d3.svg.axis().orient("bottom"),
          brush = d3.svg.brush(),
          brushDirty,
          dimension,
          group,
          round;

      function chart(div) {
        var width = x.range()[1],
            height = y.range()[0];

        y.domain([0, group.top(1)[0].value]);

        div.each(function() {
          var div = d3.select(this),
              g = div.select("g");

          // Create the skeletal chart.
          if (g.empty()) {
            // reset button
            div.select(".title").append("a")
                .attr("href", "javascript:reset(" + id + ")")
                .attr("class", "reset")
                .text("reset")
                .style("display", "none");

            // create 'g', inside an SVG element
            g = div.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add the clip path, which is the box that covers the range
            g.append("clipPath")
                .attr("id", "clip-" + id)
              .append("rect")
                .attr("width", width)
                .attr("height", height);

            // Add the background (total stat, grey) and foreground (current stat, blue) bars
            g.selectAll(".bar")
                .data(["background", "foreground"])
              .enter().append("path")
                .attr("class", function(d) { return d + " bar"; })
                .datum(group.all());

            // Adds a clip path association
            g.selectAll(".foreground.bar")
                .attr("clip-path", "url(#clip-" + id + ")");

            // Add the axis to g
            g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(axis);

            // Initialize the brush component with pretty resize handles.
            var gBrush = g.append("g").attr("class", "brush").call(brush);
            gBrush.selectAll("rect").attr("height", height);
            gBrush.selectAll(".resize").append("path").attr("d", resizePath);
          }

          // Only redraw the brush if set externally.
          if (brushDirty) {
            brushDirty = false;
            g.selectAll(".brush").call(brush);
            div.select(".title a").style("display", brush.empty() ? "none" : null);
            if (brush.empty()) {
              g.selectAll("#clip-" + id + " rect")
                  .attr("x", 0)
                  .attr("width", width);
            } else {
              var extent = brush.extent();
              g.selectAll("#clip-" + id + " rect")
                  .attr("x", x(extent[0]))
                  .attr("width", x(extent[1]) - x(extent[0]));
            }
          }

          // Set the .bars to have the bar paths
          g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
          // Generates some magic string which draws the bars in the .bar elements
          var path = [],
              i = -1,
              n = groups.length,
              d;
          while (++i < n) {
            d = groups[i];
            path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
          }
          return path.join("");
        }

        function resizePath(d) {
          var e = +(d == "e"),
              x = e ? 1 : -1,
              y = height / 3;
          return "M" + (.5 * x) + "," + y
              + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
              + "V" + (2 * y - 6)
              + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
              + "Z"
              + "M" + (2.5 * x) + "," + (y + 8)
              + "V" + (2 * y - 8)
              + "M" + (4.5 * x) + "," + (y + 8)
              + "V" + (2 * y - 8);
        }
      }

      brush.on("brushstart.chart", function() {
        // display the reset option
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", null);
      });

      brush.on("brush.chart", function() {
        // gets the range of clip path and filters on it
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
          .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
      });

      brush.on("brushend.chart", function() {
        if (brush.empty()) {
          // Hide 'reset' button
          var div = d3.select(this.parentNode.parentNode.parentNode);
          div.select(".title a").style("display", "none");
          // Reset filters
          div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
          dimension.filterAll();
        }
      });

      chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
      };

      chart.x = function(_) {
        // set x on itself, the axis and the brush
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
      };

      chart.y = function(_) {
        // sets x on itself
        if (!arguments.length) return y;
        y = _;
        return chart;
      };

      chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
      };

      chart.filter = function(_) {
        if (_) {
          brush.extent(_);
          dimension.filterRange(_);
        } else {
          brush.clear();
          dimension.filterAll();
        }
        brushDirty = true;
        return chart;
      };

      chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
      };

      chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
      };

      return d3.rebind(chart, brush, "on");
    }
  };

})();
