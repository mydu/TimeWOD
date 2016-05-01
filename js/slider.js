var slider_generator=function(loc){
    var formatDate = d3.time.format("%Y");
    d3.select(loc).select('svg').remove();
    // svg attributes
    

    if(loc === "#panel-slider"){
      var margin = {top:10, right:10, bottom: 20, left: 10},
         width,
         height;
       width = 380 - margin.left - margin.right;
       height = 20;
    }

    if(loc === "#timeline-slider"){
      var margin = {top:10, right:100, bottom: 20, left: 120},
         width,
         height,
         canvas_width;
      canvas_width = +(d3.select('#timeline-slider').style('width').replace('px', ''));
      width = canvas_width - margin.left - margin.right;
      height = 40;
    }
    var x = d3.time.scale()
          .range([0, width]);

    var brush = d3.svg.brush()
          .x(x);

    var svg = d3.select(loc).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height",height + margin.top + margin.bottom)
          .attr("class","slider")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", width)
          .attr("height", height +margin.top + margin.bottom);

    var xAxis=d3.svg.axis()
            .scale(x)
            .orient("top")
            .ticks(10)
            // .ticks(d3.time.year, 10)
            .tickFormat(d3.time.format('%Y'));

    var update_brush=function(time_range) {
      brush.extent(time_range);
      d3.selectAll(".brush").filter("#timeline-slider").call(brush);
    }
    var update=function(min_date,max_date){

      if(min_date ===undefined  || max_date ===undefined ){
        var min_date=d3.time.year.offset(new Date(),-100);
        var max_date=d3.time.year.offset(new Date(),1);
      }

      x.domain([min_date,max_date]);

      
      brush.extent([min_date,max_date])
          .on("brushend", brushended)
          .on("brush", brushed);


      // svg.append("rect")
      //     .attr("class", "grid-background")
      //     .attr("transform", "translate(0," + height*3/4 + ")")
      //     .attr("width", width)
      //     .attr("height", height/4);
          // svg.append("g")
          // .attr("class", "x grid")
          // .attr("transform", "translate(0," + height + ")")
          // .call(d3.svg.axis()
          //     .scale(x)
          //     .orient("bottom")
          //     .tickSize(-height)
          //     .ticks(d3.time.year, 10)
          //     .tickFormat(""))
          //     .selectAll(".tick")
          //     .classed("minor", function(d) { return d.getFullYear(); });

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height/2 + ")")
          .call(xAxis);
            // .tickPadding(0))
            // .selectAll("text")
            // .attr("x", 6)
            // .style("text-anchor", null);
     var gBrush = svg.append("g")
          .attr("class","brush")
          .attr("id",loc.replace("#",""))
          .attr("clip-path", "url(#clip)")
          .call(brush)
          .call(brush.event);
      gBrush.selectAll("rect")
          .attr("transform", "translate(0," + height/4 + ")")
          .attr("height", height/2);

      function brushended() {
        if (!d3.event.sourceEvent) return; // only transition after input
        var extent0 = brush.extent(),
            extent1 = extent0.map(d3.time.year.round);

            // if empty when rounded, use floor & ceil instead
            if (extent1[0] >= extent1[1]) {
              extent1[0] = d3.time.year.offset(d3.time.year.ceil(extent0[0]), -1);
              extent1[1] = d3.time.year.offset(d3.time.year.ceil(extent0[1]), 1);
            }

            if (extent1[0] < min_date) {
              extent1[0] = d3.time.year.ceil(min_date);
            }

            if (extent1[1] > max_date) {
              extent1[1] = d3.time.year.ceil(max_date);
            }
        d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event);
          if(loc==="#panel-slider"){
            TimeSpan.unshift(extent1);
            $("#timeSelected").html(" From "+formatDate(extent1[0])+" To "+formatDate(extent1[1])+"");
          }
          if(loc === "#timeline-slider"){
              timeseries.update_range(extent1);
          }
      }

      function brushed() {
        var extent0 = brush.extent(),
            extent1 = extent0.map(d3.time.year.round);
            // if empty when rounded, use floor & ceil instead
            if (extent1[0] >= extent1[1]) {
              extent1[0] = d3.time.year.offset(d3.time.year.ceil(extent0[0]), -1);
              extent1[1] = d3.time.year.offset(d3.time.year.ceil(extent0[1]), 1);
            }
            if(loc === "#panel-slider"){
              TimeSpan.unshift(extent1);
           } 
           if(loc === "#timeline-slider"){
              xScale.domain(extent1);
              zoom.x(xScale);
              timeseries.update_range(extent1);
           }
      }
  }
  
  return {
    update:update,
    update_brush:update_brush
  };
};