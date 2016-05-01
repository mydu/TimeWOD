function treemenu(bar,data){
  var margin = {top: 30, right: 20, bottom: 30, left: 20},
      width = 350 - margin.left - margin.right,
      barHeight = 20,
      barWidth = width * .8;

  var i = 0,
      duration = 400,
      root;

  var tree = d3.layout.tree()
      .nodeSize([0, 20]);

  function elbow(d, i) {
    return "M" + d.source.y + "," + d.source.x
        + "V" + d.target.x + "H" + d.target.y;
  }
  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(bar).append("svg")
      .attr("width", width + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function moveChildren(node) {
      if(node.children) {
          node.children.forEach(function(c) { moveChildren(c); });
          node._children = node.children;
          node.children = null;
      }
  }

  // d3.json("class.json", function(error, flare) {
  //   flare.x0 = 0;
  //   flare.y0 = 0;
  //   moveChildren(flare);
  //   update(root = flare);
  // });
if (typeof data==="string"){
  d3.csv(data, function(links) {
  // function drawLinks(links){
    // links.forEach(function(link) {
    //     query(link.target);
    //   });
    var nodesByName = {};
    
    links.forEach(function(link) {
        var parent = link.source = nodeByName(link.source),
            child = link.target = nodeByName(link.target);
        if (parent.children) parent.children.push(child);
        else parent.children = [child];
      });
    function nodeByName(name) {
      return nodesByName[name] || (nodesByName[name] = {name: name});
    }
    // console.log(nodesByName);
    loadFlare(nodesByName["Thing"]);
    function loadFlare(flare) {
      // console.log(flare);
      flare.x0 = 0;
      flare.y0 = 0;
      moveChildren(flare);
      update(root=flare);
    }
  });
}
else{
    var nodesByName = {};
    
    data.forEach(function(link) {
        // console.log(link);
        var parent = link.source = nodeByName(link.source),
            child = link.target = nodeByName(link.target);
        if (parent.children) parent.children.push(child);
        else parent.children = [child];
      });
    function nodeByName(name) {
      return nodesByName[name] || (nodesByName[name] = {name: name});
    }
    console.log(nodesByName[data[0].source.name]);
    loadFlare(nodesByName[data[0].source.name]);
    function loadFlare(flare) {
      // console.log(flare);
      flare.x0 = 0;
      flare.y0 = 0;
      moveChildren(flare);
      update(root=flare);
    }
} 


  function update(source) {

    // Compute the flattened node list. TODO use d3.layout.hierarchy
    var nodes = tree.nodes(root);

    var height = Math.max(250, nodes.length * barHeight + margin.top + margin.bottom);
    // console.log(height);

    d3.select(bar).select("svg").transition()
        .duration(duration)
        .attr("height", height);

    d3.select(bar).select(self.frameElement).transition()
        .duration(duration)
        .style("height", height + "px");

    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .on("click", click);

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)

    node.select('text')
        .text(function(d) { 
          if (d.children) {
            return '-' + d.name;
          } else if (d._children) {
            return '+' + d.name;
          } else {
            return d.name;
          }
        });

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return elbow({source: o, target: o});
        })
      .transition()
        .duration(duration)
        .attr("d", elbow);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d",elbow);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return elbow({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  // var nodes_selected=[];
  var lastClickD = null;
  var lastClickP = null;
  function click(d) {
    $("#classBtn").addClass("disabled");
    $("#classSelected").html("");
    $("#propSelected").html("");
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    if (lastClickD){
      lastClickD._isSelected = false;
    }
    if (lastClickP){
      lastClickP._isSelected = false;
    }
    if(!d.children && d._children===null){
      d._isSelected = true;
      lastClickD = d;
      if(d.parent){
      d.parent._isSelected = true;
      lastClickP=d.parent;
      nodes_selected.unshift(d.name,d.parent.name);
      $("#classBtn").removeClass("disabled");
      $("#classSelected").html(d.parent.name);
      $("#propSelected").html(d.name);
      }
    }
    update(d);
  }

  function color(d) {
    if (d._isSelected) return 'green';
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }
}
