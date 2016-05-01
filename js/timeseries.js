// event circlesmap
var timeseries_generator = function(){
  var margin = {top:20, right:100, bottom: 20, left: 120},
      height = 40,
      cell_height = 150,
      canvas_width,
      width;
      // width = 1100 - margin.left - margin.right;
  canvas_width = +(d3.select('#timeline').style('width').replace('px', ''));
  width = canvas_width - margin.left - margin.right;
  var format = d3.time.format("%Y/%m/%d");
  // var xScale = d3.time.scale().range([0, width]);
  xScale.range([0, width]);
  var i = 0;
  var tree = d3.layout.tree()
    .size([cell_height, width]);
  var root=[];

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.x, d.y]; });

  var color = d3.scale.category20();
  var color_obj = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom');

  var mode;
  var tm;
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .attr('id', 'tip')
  .direction('s')
  .offset(function(d){
  	if(d.prop_start) return[10,0];
  	else if(d.y) return [cell_height-d.y-20,0];
  	else return [cell_height-20,0];
  })
  .html(function(d) {
  	if(d.prop_start===undefined){
  		return  "<span id='tip'>" + d.label + "</span>"
    		+"<div><a target='_blank' href="+d.link+"><img width='20' src='img/dbpedia.png'></a>"
    		+"<a target='_blank' href="+d.wiki+"><img width='20' src='img/wiki.png'></a></div>"
    		+"<hr style='margin:2px 0'>"
    		+"<img id='tip' height='50' src="+d.img+"><br>"
    		+"<span id='tip'>"+d.pdate +": "+ format(d.date) + "</span>"
    		+"<hr style='margin:2px 0'>"
    		+"<a style='cursor:pointer' onclick=\"getprop('"+d.link+"');\"><span id='tip' class='glyphicon glyphicon-plus' aria-hidden='true'></span>Timeline</a>";
  	}
    else{
    	if(format(d.date_end)===format(new Date())){
  		return  "<span>" + d.label + "</span>"
				+"<div><a target='_blank' href="+d.link+"><img width='20' src='img/dbpedia.png'></a>"
				+"<a target='_blank' href="+d.wiki+"><img width='20' src='img/wiki.png'></a></div>"
  				+"<hr style='margin:2px 0'>"
  				+"<span id='tip'>" + format(d.date_start)+" - Today</span><br>"
  				+"<span>(" + d.prop_start + ")</span>"; 
	  	}
	  	else { return "<span>" + d.label + "</span>"
					+"<div><a target='_blank' href="+d.link+"><img width='20' src='img/dbpedia.png'></a>"
					+"<a target='_blank' href="+d.wiki+"><img width='20' src='img/wiki.png'></a></div>"
	  				+"<hr style='margin:2px 0'>"
	  				+"<span>" + d.prop_start+" - "+d.prop_end+ "</span><br>"
	  				+"<span>(" + format(d.date_start)+" - "+format(d.date_end)+ ")</span>";  
	  	} 
    }   		
  });
 
	

  var update_range=function(time_range){

  	xScale.domain(time_range);
	d3.select("#timeline").selectAll(".grid").call(xAxis);
	d3.select("#timeline").selectAll(".todayline,.todaytext").attr("transform", "translate(" +xScale(new Date()) + ",0)");
	d3.select("#timeline").selectAll(".todaycircle").attr("cx",xScale(new Date()));
	d3.select("#timeline").selectAll(".node")
		.attr("transform", function(d) {return "translate(" +xScale(d.date) + ","+d.y+")";});

	d3.select("#timeline").selectAll(".link")
			.attr("d", function(d){
		      return diagonal({ source: { x: xScale(d.source.date), y: d.source.y }, target: { x: xScale(d.target.date), y: d.target.y } });
		    });
	d3.select("#timeline").selectAll(".series2").selectAll("circle")
			.attr("cx", function(d, i) { return xScale(d.date) });
	 // d3.select("#timeline").selectAll(".line")
	 // 	.transition()
		// .duration(750)
	 // 	.attr("x1", function(d, i) { return xScale(d.date) })
	 // 	.attr("x2", function(d, i) { return xScale(d.date) });

	 // d3.select("#timeline").selectAll(".text,.image")
	 // 	.transition()
		// .duration(750)
	 // 	.attr("x", function(d, i) { return xScale(d.date) });
	 d3.select("#timeline").selectAll(".spanRect")
		.attr("width",function(d){return xScale(d.date_end)-xScale(d.date_start);})
       	.attr("x",function(d){return xScale(d.date_start)})
  }

 
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  function reverse_collapse(d) {
	  if (d._children) {
      d.children = d._children;
      d.children.forEach(reverse_collapse);
      d._children = null;
    }
  }
  function draw_tree(data,index){

	root[index] = data;
	root[index].x0 = xScale(data.date);
	root[index].y0 = 0;
	// root[index].children.forEach(collapse);
	//first level
	// collapse(root[index]);
	update_tree(root[index],index);
}
 function update_tree(source,index){
  	var expand=0;
  	if(root[index].children){
  		root[index].children.forEach(function(d){
  			if (d._children) {
  				$("#input"+index+"").slider('setValue', 2);
  				expand+=1;
  			}
  		});
  		if (expand===0) $("#input"+index+"").slider('setValue', 3);
  	}
  	else $("#input"+index+"").slider('setValue', 1);

  	d3.selectAll(".removed").classed("removed",false);
	d3.selectAll(".pinned").classed("pinned",false);
	d3.selectAll(".active-hover").classed("active-hover",false);
	d3.selectAll(".single-pinned").classed("single-pinned",false);
  	var duration=500;
  	var nodes = tree.nodes(root[index]).reverse(),
		links = tree.links(nodes);
	// Normalize for fixed-depth.
	nodes.forEach(function(d) { 
		 d.y=d.depth*50;
		// if(mode===false) d.y=d.depth*50-d.depth*20*index;
		// else d.y=d.depth*50;
	});
	nodes.forEach(function(d) {d.x = xScale(d.date);});
	var group=d3.selectAll(".series").filter("#element"+index+"");
	var node = group.selectAll("g.node")
		  .data(nodes, function(d) { return d.id || (d.id = ++i); });
	  // .enter().append("g")
	  // .attr("class", "node")	  

	// Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; });
      
  nodeEnter.append("circle")
      .attr("r", 1e-6)
      // .attr("stroke", function(d){return color(d.relation);})
      // .style("fill", function(d) { return d.children ? color(d.relation) : "#f0f0f0"; });
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" +d.x+ "," + d.y + ")"; });

  nodeUpdate.select("circle")
      .attr("r",10)
	  .attr("class","circle")
	  .attr("stroke", function(d){return color(d.relation);})
	  .style("fill", function(d) { return color(d.relation) });
	  // .style("fill", function(d) { return d._children ? color(d.relation) : "#f0f0f0"; });

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
      .remove();

  	nodeExit.select("circle")
      		.attr("r", 1e-6);

    d3.selectAll(".node")
	    .on("mousedown", function() {
	       d3.event.preventDefault();
	    })
    	.on("mouseover",function(d){
			  	this.parentNode.appendChild(this);
			  	this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);
			    d3.selectAll(".link").filter(function(data){ return data.target===d || data.source===d || data.target===d.parent || data.source===d.children; }).classed("active-hover",true);
			    if(tm) clearTimeout(tm);
				tip.show(d);
				d3.select(this).selectAll("circle").classed("active-hover",true);
				var filternode=d3.selectAll(".node").filter(function(data){return data===d.parent||data.parent===d;});
				filternode.selectAll("circle").classed("active-hover",true);
				filternode[0].forEach(function(d){
						d.parentNode.appendChild(d);
				});
				d3.selectAll(".legend,.legendSpan").filter(function(data){return data===d.relation;}).classed("active-hover",true);
				var grid_select=d3.selectAll(".thumbnail").filter("#"+d3.select(this.parentNode).attr("id"));
				grid_select.selectAll(".gridpoint").classed("active-hover",true).attr("cx",xScale(d.date));
				grid_select.selectAll(".gridline").classed("active-hover",true).attr("x1",xScale(d.date)).attr("x2",xScale(d.date)).attr("y2",-(cell_height-d.y-20));
			  })
			  .on("mouseout",function(d){
			    d3.selectAll(".link").filter(function(data){ return data.target===d || data.source===d || data.target===d.parent || data.source===d.children; }).classed("active-hover",false);
			    tm=setTimeout(function(){
							tip.hide(d);},500);
				d3.selectAll("circle").classed("active-hover",false);
				d3.selectAll(".legend,.legendSpan").classed("active-hover",false);
				d3.selectAll(".gridpoint,.gridline").classed("active-hover",false);
			  })
			  .on("click",function(d){
			  	// d3.selectAll(".node").selectAll("circle").classed("pinned",false);
			  	d3.selectAll(".pinned").classed("pinned",false);
			  	d3.selectAll(".removeMarker").style("opacity",1);
			  	d3.selectAll(".pinMarker,.removeMarker").style("display","none");
			  	d3.selectAll(".legend").on("mouseout",function(){
			  		d3.select(this).classed("active-hover",false);
					d3.select(this).selectAll(".pinMarker,.removeMarker").style("display","none");
					d3.selectAll(".node").selectAll("circle").classed("active-hover",false);
					d3.selectAll(".link").classed("active-hover",false);
			  	});
			  	d3.selectAll(".node").selectAll("circle").classed("single-pinned",false);
			  	d3.selectAll(".link").classed("single-pinned",false);
			  	d3.select(this).selectAll("circle").classed("single-pinned",true);
			  	d3.selectAll(".link").filter(function(data){ return data.target===d || data.source===d || data.target===d.parent || data.source===d.children; }).classed("single-pinned",true);
				var filternode=d3.selectAll(".node").filter(function(data){return data===d.parent||data.parent===d;});
				filternode.selectAll("circle").classed("single-pinned",true);
				// d3.selectAll(".legend").filter(function(data){return data===d.relation||data===d.parent.relation;}).classed("active-hover",true);
				culculate_legend(d);
			  })
			.on("dblclick",function(d){
		      		// toggle collapse
		      		var index=d3.select(this.parentNode).attr('id').replace("element","");
				  	if (d.children) {
					    d._children = d.children;
					    d.children = null;
				  } else {
				  	// if(d.depth===0) $("#input"+index+"").slider('setValue', 3);
				  	// else $("#input"+index+"").slider('setValue', 2);
				    d.children = d._children;
				    d._children = null;
				  }
				  // var index=this.parentNode.attr('id').replace("#element","");
				  update_tree(d,index);
				  // d3.selectAll(".link").classed("single-pinned",false);
		      });


	var link = group.selectAll("path.link")
	   .data(links, function(d) { return d.target.id; });

	
	  // Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", "link")
		      .style("stroke", function(d){return color(d.target.relation);})
			  .style("stroke-width","5px")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return diagonal({source: o, target: o});
		      });

		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
		      .attr("d", diagonal);

		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
		        var o = {x: source.x, y: source.y};
		        return diagonal({source: o, target: o});
		      })
		      .remove();
		  // d3.selectAll(".link").filter(function(data){ return data.source===source;}).classed("active-hover",true);
		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
  }
  function culculate_legend(data){
			legend_count={};
			color.domain().forEach(function(d){
				legend_count[d]=0;
				if(data.children){
					data.children.forEach(function(e){
						if (e.relation===d) legend_count[d]+=1;
					});
				}
				var filterlegend=d3.selectAll(".legendCount").filter(function(d){return (d in legend_count);});
					filterlegend.text(function(d){
						return legend_count[d]>0 ? legend_count[d]:""; 
					});
				});
	}

  var update_view = function(data,prev_length) {

  	//initialize to multiple view
  	mode=true;
  	d3.select("#single").classed("active",!mode);
   	d3.select("#multiple").classed("active",mode);
   	if (data.length===0) {
   		d3.select("#timeline").selectAll("svg").remove();
   		d3.select("#timeline-slider").selectAll("svg").remove();
    	d3.select("#legend").selectAll("svg").remove();
    	d3.select("#mode").style("display","none");
   	}

   	else {
   		 // calculate svg height
	    height = data.length * (cell_height+20);

	    // Remove old timeseries chart if there is one
	    d3.select("#timeline").selectAll("svg").remove();
   		d3.select("#timeline-slider").selectAll("svg").remove();
    	d3.select("#legend").selectAll("svg").remove();
    	d3.select("#mode").style("display","block");
	    //Time range
	    var min_date_first=d3.min(data, function(d) {
		    	return d3.min(d.event,function(e){
		    		return e.date;
		    	});
		 });
	     var min_date_sec=d3.min(data, function(d) {
	     		if (d.event[0].children){
	     			return d3.min(d.event[0].children,function(e){
		    			return e.date;
		    		});
	     		}
	     		if (d.event[0]._children){
	     			return d3.min(d.event[0]._children,function(e){
		    			return e.date;
		    		});
	     		}
		 });
		 var min_date_third=d3.min(data, function(d) {
		 	if (d.event[0].children){
		 		return d3.min(d.event[0].children,function(e){
		    		if(e.children){
		    			return d3.min(e.children,function(f){
		    				return f.date;
		    			});
		    		}
		    		if(e._children){
		    			return d3.min(e._children,function(f){
		    				return f.date;
		    			});
		    		}
		    	});
		 	}
		 	if (d.event[0]._children){
		 		return d3.min(d.event[0]._children,function(e){
		    		if(e.children){
		    			return d3.min(e.children,function(f){
		    				return f.date;
		    			});
		    		}
		    		if(e._children){
		    			return d3.min(e._children,function(f){
		    				return f.date;
		    			});
		    		}
		    	});
		 	}
		 });

		// var max_date=d3.max(data, function(d) {
	 //    	return d3.max(d.event,function(e){
	 //    		return e.date;
	 //    	});
	 //    });
		// console.log(min_date,max_date);

		// var min_date=d3.time.year.offset(minDate,-1);
		var min_date=d3.min([min_date_first,min_date_sec,min_date_third]);
		min_date=d3.time.year.offset(min_date,-1);
		var max_date=d3.time.year.offset(new Date(),5);
	   //update timeline slider
	 

	   timelineSlider=slider_generator("#timeline-slider");
	   timelineSlider.update(min_date,max_date);
	  
	    // update the time scale to current range
	    // if(data[0].timespan.length>0){
	    // 	var min_date_2=data[0].timespan[data[0].timespan.length-1].date_start;
	    // 	min_date_2=d3.time.year.offset(min_date_2,-1);
	    // }
	    // if(data[0].timespan.length===0){
		   //  var min_date_2=min_date;
	    // }
     //   	timelineSlider.update_brush(min_date_2,max_date);
	    // xScale.domain([min_date_2,max_date]);
	    xScale.domain([min_date,max_date]);
	    
	    //color scale
	    var relation=[];
	    data.forEach(function(d){
	    	d.event.forEach(function(e){
				relation.push(e.relation);
			});
	    });
	    data.forEach(function(d){
	    	if(d.event[0].children){
	    		d.event[0].children.forEach(function(e){
					relation.push(e.relation);
				});
	    	}
	    	if(d.event[0]._children){
	    		d.event[0]._children.forEach(function(e){
					relation.push(e.relation);
				});
	    	}
	    	
	    });
	    data.forEach(function(d){
	    	if(d.event[0].children){
	    		d.event[0].children.forEach(function(e){
					if(e.children){
						e.children.forEach(function(f){
							relation.push(f.relation);
						});
					}
					if(e._children){
						e._children.forEach(function(f){
							relation.push(f.relation);
						});
					}
				});
	    	}
	    	if(d.event[0]._children){
	    		d.event[0]._children.forEach(function(e){
					if(e.children){
						e.children.forEach(function(f){
							relation.push(f.relation);
						});
					}
					if(e._children){
						e._children.forEach(function(f){
							relation.push(f.relation);
						});
					}
				});
	    	}	
	    });

		if (data.length!=prev_length) {
			color.domain(d3.set(relation).values());
		}
		//draw legend	
		legend(color);

		//color of objects
		// color_obj.domain(Array.apply(null, {length: data.length}).map(Number.call, Number));

	    // Draw the updated timeline
	    var svg = d3.select("#timeline")
	    .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .attr("class","timeline")
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	    
	    //  // Draw xAxis grid
	    // svg.append("g")
		   //  .attr("class", "x grid")
		   //  .attr("transform", "translate(0,-" + margin.top + ")")
		   //  .call(xAxis);

	    svg.append("defs").append("clipPath")
			    .attr("id", "clip")
			    .append("rect")
			    .attr("width", width)
			    .attr("height", height +margin.top + margin.bottom);
		svg.call(tip);

		var global=svg.append("g")
						.attr("class","g grid")
						.attr("transform", "translate(0,"+(cell_height-10)+")")
						.style("opacity",0);
		global.append("rect")
				.attr("transform", "translate(0,-"+(cell_height-10)+")")
			  .attr("width", width)
	          .attr("height", cell_height-10)
	          .style("fill","#f0f0f0")
	          .style("cursor","move")
	          .call(zoom);
	    global.call(xAxis);
	    // var global_legend=global.append("g")
	    // 						.attr("transform", "translate(-"+margin.left+",0)")
	    // 						.selectAll("g")
	   	// 						.data(data).enter()
	   	// 						.append("g")
	   	// 						.attr("class","g_legend")
	   	// 						.attr("transform", function(d, i) { return "translate(0," + i * 50 + ")"; });
	   	// global_legend.append("rect")
					//  .attr("width",15)
					//  .attr("height",15)
					//  .style("fill",function(d,i){
					//  	return color_obj(i);
					//  })

	   	var thumbnail=svg.append("g")
					.selectAll("g")
	   				.data(data).enter()
	   				.append("g")
	   				.attr("class","thumbnail")
	   				.attr("id",function(d,i){return "element"+i;})
	   				.attr("transform", function(d,i){
	   					return "translate(-"+margin.left+","+((cell_height+20) * i)+")"
	   				});

	   	thumbnail.append("rect")
	                .attr("width", width)
	                .attr("height", cell_height-10)    
	                .attr("transform","translate("+margin.left+",0)")
	                .style("fill","#f0f0f0")
	                .style("cursor","move")    
	                .attr("class", "grid-background")
	                .call(zoom);
	
	    thumbnail.append("rect")
	    		 .attr("width", margin.left-40)
			     .attr("height", cell_height-10)
			     .attr("class","thumbnailRect")	
      			.style("fill","#f0f0f0")
			    .style("cursor","pointer")
	   			.on("click",function(d,i){
	   					if(i!=0){
	   						events.splice(i,1);
					     	events.unshift(d);
					     	timeseries.update(events,data.length);
	   					}	     	
			    });
		d3.selectAll(".thumbnail").selectAll("rect")
				.on("mouseover",function(d,i){
						d3.selectAll(".thumbnail").selectAll("rect,.today,.x.grid").classed("active-hover",false);
	   					d3.select(this.parentNode).selectAll("rect,.today,.x.grid").classed("active-hover",true);
	   					// culculate_legend(d);
	   				});

	   	//initialize and highlight the first rects 
	    d3.selectAll(".thumbnail").filter(function(d,i){return i===0;}).selectAll("rect").classed("active-hover",true);
	   	// culculate_legend(data[0]);
		// function culculate_legend(data){
		// 	legend_count={};
		// 	color.domain().forEach(function(d){
		// 		legend_count[d]=0;
		// 		data.event[0].children.forEach(function(e){
		// 			if (e.relation===d){
		// 				legend_count[d]+=1;
		// 			}
		// 		});
		// 	});
		// 	var filterlegend=d3.selectAll(".legendCount").filter(function(d){return (d in legend_count);});
		// 	filterlegend.text(function(d){
		// 		return legend_count[d]>0 ? legend_count[d]:""; 
		// 	});
		// }
		
	   	thumbnail.append("image")
	   			.attr("y", 10)
				.attr("width", 80)
				.attr("height", 80)
				.attr("xlink:href",function(d,i){ return d.img});
		thumbnail.append("text")
				.attr("class","thumblabel")
				.attr("transform", "translate(0,110)")
				.text(function(d,i){ return d.object})
				.call(wrap,80);
		thumbnail.append('text')
			    .attr('font-family', 'FontAwesome')
			    .attr('font-size', 20)
			    .attr("class","uparrow")
			    .style("opacity",0.5)
			    .style("fill","steelblue")
			   	.attr("transform", "translate("+(margin.left-70)+",10)")
			    .text('\uf062')
			    .attr("cursor","pointer")
			    .on("mouseover",function(d,i){
	   					if(i!=0) d3.select(this).style("opacity",1);
	   			})
	   			.on("mouseout",function(d){
	   					d3.select(this).style("opacity",0.5);
	   			})
			    .on("click",function(d,i){
	   					if(i!=0){
	   						events.splice(i,1);
					     	events.unshift(d);
					     	timeseries.update(events,data.length);
	   					}	     	
			    });
		thumbnail.append('text')
			    .attr('font-family', 'FontAwesome')
			    .attr('font-size', 20)
			    .attr("class","remove")
			    .style("opacity",0.5)
			    .style("fill","#cd0a0a")
			   	.attr("transform", "translate("+(margin.left-50)+",10)")
			    .text('\uf00d')
			    .attr("cursor","pointer")
			    .on("mouseover",function(d){
			    	d3.select(this).style("opacity",1);
			    })
			    .on("mouseout",function(d){
			    	d3.select(this).style("opacity",0.5);
			    })
			    .on("click",function(d,i){
			    	events = $.grep(events, function(e){ 
   							return e.object != data[i].object; 
					});
			    	timeseries.update(events,data.length);
			    });
		var today=thumbnail.append("g")
				 .attr("class", "today")
				 .attr("transform", "translate("+margin.left+","+(cell_height-10)+")")
		today.append("circle")
				 .attr("class","todaycircle")
				 .attr("r",5)
				 .attr("fill","steelblue")
				 .attr("cx",xScale(new Date()));

		today.append("line")
			.attr("transform", "translate("+xScale(new Date())+",0)")
			.attr("class","todayline")
			.attr("y1",0)
			.attr("y2",-(cell_height-10));

		today.append("text")
			.attr("transform", "translate("+xScale(new Date())+",0)")
			.attr("y",-70)
			.attr("class","todaytext")
			.text("Today");
		var depth_ctrl=thumbnail.append("foreignObject")
							.attr("class","depthCtrl")
							.attr("id",function(d,i){return "depthCtrl"+i+""})
							.attr("transform", "translate("+(margin.left-30)+",0)")
							.attr("width", 20)
						    .attr("height", cell_height-10);

		depth_ctrl.append("xhtml:div")
				  .html(function(d,i){
						return "<input id='input"+i+"' data-slider-id='input"+i+"Slider' type='text' data-slider-ticks='[1, 2, 3]' data-slider-ticks-snap-bounds='30' data-slider-min='1' data-slider-max='3' data-slider-step='1' data-slider-value='3' data-slider-tooltip='hide' data-slider-orientation='vertical'/>";
				  });
		data.forEach(function(d,i){
			$("#input"+i+"").slider()
							.on("change",function(){
								if(this.value==="1") {
									collapse(root[i]);
								}
								if(this.value==="2") {
									if(root[i].children){
									   root[i].children.forEach(collapse);
									}
									if(root[i]._children){
									   reverse_collapse(root[i]);
									   root[i].children.forEach(collapse);
									}
								}
								if(this.value==="3"){
									collapse(root[i]);
									reverse_collapse(root[i]);
								}
								update_tree(root[i],i);
							});
			$("#input"+i+"Slider")
				.css("top",((cell_height+20)*i+40)+'px');
		});
		
		var grid=thumbnail.append("g")
				 .attr("class", "x grid")
				 .attr("transform", "translate("+margin.left+","+(cell_height-10)+")")
				 .call(xAxis);

		grid.append("circle")
				 .attr("class","gridpoint")
				 .attr("r",5)
				 .attr("fill","steelblue");
		grid.append("circle")
				 .attr("class","gridpoint_end")
				 .attr("r",5)
				 .attr("fill","steelblue");

		grid.append("line")
			.attr("class","gridline").attr("y1",0);
		grid.append("line")
			.attr("class","gridline_end").attr("y1",0);

	    for(var j=0;j<data.length; j++){
	    	// draw each obj seperate
			var g = svg.append("g").attr("clip-path", "url(#clip)");

	        var series=g.append("g")
					.attr("class","series")
					.attr("id","element"+j)
					.attr("transform", "translate(0,"+((cell_height+20) * j+20)+")")
					.on("mouseover",function(){
						this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);
						this.parentNode.appendChild(this);
					});

			d3.selectAll("#tip").on("mouseover",function(d){
				// console.log(d);
				if(tm) clearTimeout(tm);
			})
			.on("mouseout",function(d){
					tm=setTimeout(function(){
							tip.hide(d);},500);
			});

			draw_tree(data[j].event[0],j);
			// roots.push(data[j].event[0]);
			// // roots.forEach(function(root){
			// 	roots[j].x0=0;
			// 	roots[j].y0=0;
			// 	roots[j].children.forEach(collapse);
			// // });
			// update_tree(roots[j],series,j);
		
			  
			var series2=g.append("g").selectAll("g")
					 .data(data[j].event)
					 .enter().append("g")
					 .attr("class","series2")
					 .attr("id","element"+j)
					 .attr("transform", "translate(0,"+((cell_height+20) * j+20)+")");

			var circle= series2.append("circle")
					.attr("class","circle")
					.attr("cx", function(d,i) {return xScale(d.date) })
					.attr("cy", 0)
					.attr("r",10)
					.style("display",function(d,i){
						if (i===0) return "none";
					})
					.style("fill",function(d,i) {
						var index=span_instance.indexOf(d.relation);
						if (index >-1 && index%2===1) return color(span_instance[index-1]);
						else return color(d.relation);	
					})
				.on("mouseover",function(d,i){
					this.parentNode.parentNode.parentNode.appendChild(this.parentNode.parentNode);
					if(tm) clearTimeout(tm);
					tip.show(d);
					d3.select(this).classed("active-hover",true);
					d3.selectAll(".legend,.legendSpan").filter(function(data){return data===d.relation;}).classed("active-hover",true);
					var grid_select=d3.selectAll(".thumbnail").filter("#"+d3.select(this.parentNode).attr("id"));
					grid_select.selectAll(".gridpoint").classed("active-hover",true).attr("cx",xScale(d.date));
					grid_select.selectAll(".gridline").classed("active-hover",true).attr("x1",xScale(d.date)).attr("x2",xScale(d.date)).attr("y2",-(cell_height-d3.select(this).attr("cy")-20));
				})
				.on("mouseout",function(d){
					tm=setTimeout(function(){
							tip.hide(d);},500);
					d3.select(this).classed("active-hover",false);
					d3.selectAll(".legend,.legendSpan").filter(function(data){return data===d.relation;}).classed("active-hover",false);
					d3.selectAll(".gridpoint,.gridline").classed("active-hover",false);
				});
				// .on("click",function(d){
				// 	getprop(d.link)
				// 	// min_date=d3.time.year.offset(d.date,-1);
				// 	// update_range([min_date,max_date]);
				// 	// timelineSlider.update_brush(min_date,max_date);
				// });	
			var span=g.append("g").selectAll("g")
					 .data(data[j].timespan)
					 .enter().append("g")
					 .attr("class","span")
					 .attr("id","element"+j)
					 .attr("transform", "translate(0,"+(cell_height+20) * j+")");		 

			var span_rect=span.append("rect")
					 .attr("class","spanRect")
       				 .style("fill",function(d){return color(d.prop_start);})
       				 .attr("width",function(d){return xScale(d.date_end)-xScale(d.date_start);})
       				 .attr("height",10)
       				 .attr("rx",5)
       				 .attr("ry",5)
       				 .attr("x",function(d){return xScale(d.date_start)})
       				 .attr("y",function(d,i){return 0.1*(i+1)*cell_height;})
       				 .on("mouseover",function(d){
						if(tm) clearTimeout(tm);
						tip.show(d);
       				 	d3.select(this).classed("active-hover",true);
       				 	// var filternode=d3.selectAll(".series").filter(function(data) { return data.label===d.label && (data.relation===d.prop_start || data.relation===d.prop_end);});
       				 	// filternode.selectAll("circle,text").classed("active-hover",true);
       				 	d3.selectAll(".legendSpan").filter(function(data){ return data===d.prop_start;}).classed("active-hover",true);
       				 	var grid_select=d3.selectAll(".thumbnail").filter("#"+d3.select(this.parentNode).attr("id"));
       				 	grid_select.selectAll(".gridpoint").classed("active-hover",true).attr("cx",xScale(d.date_start));
						grid_select.selectAll(".gridline").classed("active-hover",true).attr("x1",xScale(d.date_start)).attr("x2",xScale(d.date_start)).attr("y2",-(cell_height-10-d3.select(this).attr("y")));
       				 	if(d.date_end.getDay()!=(new Date()).getDay()) {
       				 		grid_select.selectAll(".gridpoint_end").classed("active-hover",true).attr("cx",xScale(d.date_end));
       				 		grid_select.selectAll(".gridline_end").classed("active-hover",true).attr("x1",xScale(d.date_end)).attr("x2",xScale(d.date_end)).attr("y2",-(cell_height-10-d3.select(this).attr("y")));
       				 	}
       				 })
       				 .on("mouseout",function(d){
       				 	tm=setTimeout(function(){
							tip.hide(d);},500);
       				 	d3.select(this).classed("active-hover",false);
       				 	// d3.selectAll(".series").selectAll("circle,text").classed("active-hover",false);
       				 	d3.selectAll(".legendSpan").filter(function(data){return data===d.prop_start;}).classed("active-hover",false);
       				 	d3.selectAll(".gridpoint,.gridpoint_end,.gridline,.gridline_end").classed("active-hover",false);
       				 });
						
			// g.append("g")
			// .attr("class", "x gridline")
			// .attr("transform", "translate(0," + (cell_height * (j+0.3)) + ")")
			// .call(xAxis);

			// g.append("g")
			// .attr("class", "x gridline")
			// .attr("transform", "translate(0," + (cell_height * (j+0.8)) + ")")
			// .call(xAxis);
	    }
    	// end of drawing timeseries
   	}

   	d3.select("#single").on("click",function(d){
   		mode=false;
   		d3.select(this).classed("active",!mode);
   		d3.select("#multiple").classed("active",mode);
		switchSingle();
	})
	d3.select("#multiple").on("click",function(d){
		mode=true;
		d3.select(this).classed("active",mode);
   		d3.select("#single").classed("active",!mode);
		switchMultiple();
	})
   	function switchSingle(){
   		
   		var t=svg.transition().duration(750);
   		t.selectAll(".thumbnail").selectAll("*").style("display",mode ?"block":"none");
   		t.selectAll(".g.grid").style("opacity",mode ?0:1);
		var g_series=t.selectAll('.series,.series2');
		g_series.attr('transform',"translate(0,20)");
		// d3.select("#legend").selectAll(".legendCount").style("opacity",mode ?1:0);
		// d3.select("#legend").selectAll(".legendRect").style("opacity",mode ?1:0.2);
		for(var i=0;i<data.length; i++){
			// g_series.filter("#element"+i+"").attr('transform',"translate(0,"+(20*i+20)+")");
			// g_series.filter("#element"+i+"").selectAll("circle").style("fill",color_obj(i));
			// g_series.filter("#element"+i+"").selectAll("circle").attr('transform',"translate(0,"+(30*i)+")");
			var g_span=t.selectAll(".span").filter("#element"+i+"");
			g_span.attr('transform',"translate(0,"+(20*i)+")");
			// update_tree(root[i],i);
			// g_span.selectAll("rect").style("fill",color_obj(i));
			// var g_thumb=t.selectAll(".thumbnail").filter("#element"+i+"");
			// g_thumb.selectAll(".thumblabel").attr('transform',"translate(0,"+(30*(i+1)-cell_height*i)+")");
			// g_thumb.selectAll(".remove").attr('transform',"translate("+(margin.left-50)+","+(+30*(i+1)-cell_height*i)+")");
		}
		d3.selectAll(".gridpoint,.gridpoint_end,.gridline,.gridline_end").classed("active-hover",false);
   	}
   	function switchMultiple(){
   		
   		var t=svg.transition().duration(750);
   		t.selectAll(".thumbnail").selectAll("*").style("display",mode ?"block":"none");
   		t.selectAll(".g.grid").style("opacity",mode ?0:1);
   		var g_series=t.selectAll('.series,.series2').attr('transform',"translate(0,20)");
   		var g_span=t.selectAll(".span");
		// g_series.selectAll("line").style("display",mode ?"block":"none");
		// g_series.selectAll("circle").attr('transform',"translate(0,20)");
		// g_series.selectAll("circle").style("fill",function(d,i) { return color(d.relation);});
		// g_span.selectAll("rect").style("fill",function(d){return color(d.prop_start);});

		// d3.select("#legend").selectAll(".legendCount").style("opacity",mode ?1:0);
		// d3.select("#legend").selectAll(".legendRect").style("opacity",mode ?1:0.2);
		for(var i in data){
			// if(overlap===true)  t.selectAll('.series').filter("#element"+i+"").attr('transform',"translate(0,"+20*i+")");
			g_series.filter("#element"+i+"").attr('transform',"translate(0,"+((cell_height+20) * i+20)+")");
			g_span.filter("#element"+i+"").attr('transform',"translate(0,"+(cell_height+20) * i+")");
			// update_tree(root[i],i);
			// var g_thumb=t.selectAll(".thumbnail").filter("#element"+i+"");
			// g_thumb.selectAll(".thumblabel").attr('transform',"translate(0,110)");
			// g_thumb.selectAll(".remove").attr('transform',"translate("+(margin.left-50)+",10)")
		}
   	}
   	d3.selectAll(".gridpoint,.gridpoint_end,.gridline,.gridline_end").attr("opacity",0);
   	d3.selectAll(".today,.x.grid").attr("opacity",0);
  };

  function wrap(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/[ \f\n\r\t\v]+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 1,
	        lineHeight = 1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")) || 0,
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
}

  // var init = function() {};

  return {
    // init: init,
    update: update_view,
    update_range: update_range
  };
};
 