function legend(color){
	
	d3.select("#legend").select("svg").remove();
	var margin = {top: 30, right: 20, bottom: 30, left: 20},
  	width = 280 - margin.left - margin.right,
  	legend_height=20,
  	height=legend_height*color.domain().length;

  	var color_instance=[];
  	var color_span=[];
  	color.domain().forEach(function(d){
  		if (span_instance.indexOf(d) >-1){
  			if (span_instance.indexOf(d)%2===0)
  			color_span.push(d)
  		}
  		else {
  			color_instance.push(d);
  		}
  	});
  	
  	// draw legend
	  var legend_svg = d3.select("#legend")
					.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height",height+margin.top+margin.bottom)
					.append("g")
					.attr("transform", "translate(" + (margin.left+20) + "," + margin.top + ")");

	  var legend_control=legend_svg.append("g")
	  					.attr("class","legendCtrl")
	  					.on("mouseover",function(d){
								d3.select(this).classed("active-hover",true);
	  							d3.select(this).selectAll(".removeMarker").style("display","block");
	  					})
	  					.on("mouseout",function(d){
							d3.select(this).classed("active-hover",false);
							d3.select(this).selectAll(".removeMarker").style("display","none");
						});
	  
	  legend_control.append("rect")
	 		.attr("y",-10)
	 		.attr("height",15)
	 		.attr("width",250)
	 		.style("opacity",0);

	  legend_control.append("circle")
	  				.attr("class","legendRect")
	  				.attr("cx", 7)
				    .attr("cy", -5)
				    .attr("r", 8)
			      	.attr("fill", "#000")
			      	.style("stroke", "#000")
			      	.style("stroke-width","2px");

	  legend_control.append("text")
					 .attr("x", 20)
				     .text("All");

	  legend_control.append("text")
				.attr("class","removeMarker")
				.attr('font-family', 'FontAwesome')
				.attr("font-size",14)
				.text("\uf00d")
				.attr("x",function(d){
					return 25+d3.select(this.parentNode).selectAll("text").node().getComputedTextLength();
				})
				.on("click",function(d){
					var group=d3.selectAll("#legend").selectAll("circle,text,rect").filter("*:not(.pinned)");
					group.classed("removed",!group.classed("removed"));
					d3.selectAll(".removeMarker").text(group.classed("removed") ? "\uf0e2" : "\uf00d");
					var filternode=d3.selectAll(".circle,.spanRect").filter("*:not(.pinned)");
					filternode.classed("removed",!filternode.classed("removed"));
					var filterlink=d3.selectAll(".link");
					filterlink.classed("removed",!filterlink.classed("removed"));
	  			});
	  var legend_span=legend_svg.append("g")
	  						.attr("transform", "translate(0,20)")
	  						.selectAll("g")
						  	.data(color_span)
							.enter()
							.append("g")
							.attr("class", "legendSpan")
							.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
							.on("mouseover",function(d){
								d3.select(this).classed("active-hover",true);
								d3.select(this).selectAll(".pinMarker,.removeMarker").style("display","block");
								var filterspan=d3.selectAll(".span").filter(function(data){return data.prop_start===d;});
								filterspan.selectAll("rect").classed("active-hover",true);
							})
							.on("mouseout", mouseout_span);
	function mouseout_span(d){
			d3.select(this).classed("active-hover",false);
			d3.select(this).selectAll(".pinMarker,.removeMarker").style("display","none");
			d3.selectAll(".span").selectAll("rect").classed("active-hover",false);
			// d3.selectAll(".span").classed("active-hover",false);
	}
	  // draw legend square
	 legend_span.append("rect")
	 			  .attr("class","legendRect")
	 			  .attr("x",-2)
	 			  .attr("y",-10)
			      .attr("rx",5)
			      .attr("ry",5)
			      .attr("width",function(d){
			      	if (span_instance.indexOf(d)%2===0) return 20;
	      			else return 0;})
			      .attr("height", 10)
			      .attr("fill", color)
			      .style("stroke", color)
			      .style("stroke-width","2px");
			      
	  legend_span.append("rect")
	 		.attr("y",-10)
	 		.attr("height",15)
	 		.attr("width",250)
	 		.style("opacity",0);		
	  // draw legend text
	  legend_span.append("text")
	      .attr("x", 20)
	      // .attr("y", 0)
	      .text(function(d) { 
	      	var end=span_instance[span_instance.indexOf(d)+1];
	      	return d+" - "+end;})

	  legend_span.append("text")
			.attr("class","pinMarker")
			.attr('font-family', 'FontAwesome')
			.attr("font-size",14)
			.text("\uf08d")
			.attr("x",function(d){
				return 25+d3.select(this.parentNode).selectAll("text").node().getComputedTextLength();
			});
	  legend_span.append("text")
			.attr("class","removeMarker")
			.attr('font-family', 'FontAwesome')
			.attr("font-size",14)
			.text("\uf00d")
			.attr("x",function(d){
				return 40+d3.select(this.parentNode).selectAll("text").node().getComputedTextLength();
			});
		legend_span.selectAll(".removeMarker")
		   .on("click",function(d,i){
		   	if (!d3.select(this).classed("pinned")){
		      	var group=d3.select(this.parentNode).selectAll("text,rect");
  				group.classed("removed",!group.classed("removed"));
  				d3.select(this).text(group.classed("removed") ? "\uf0e2" : "\uf00d");
				var filterspan=d3.selectAll(".span").filter(function(data){return data.prop_start===d;});
				filterspan.selectAll("rect").classed("removed",!filterspan.selectAll("rect").classed("removed"));
			}
		});
	legend_span.selectAll(".pinMarker")
		   .on("click",function(d,i){
		   		if (!d3.select(this).classed("removed")){
					var group=d3.select(this.parentNode).selectAll("text,rect");
					group.classed("pinned",!group.classed("pinned"));
					group.filter(".removeMarker").style("opacity",group.classed("pinned") ? 0.5:1);

					if(group.classed("pinned")){
						d3.select(this.parentNode).on("mouseout",function(){
							d3.select(this).classed("active-hover",false);
						});
					}
					else{
						d3.select(this.parentNode).on("mouseout",mouseout_span);
					}
					var filterspan=d3.selectAll(".span").filter(function(data){return data.prop_start===d;});
					filterspan.selectAll("rect").classed("pinned",!filterspan.selectAll("rect").classed("pinned"));
					}
			});

	  // draw legend colored rectangles
	  var legend=legend_svg.append("g")
	  			.attr("transform", "translate(0,"+(color_span.length+1)*20+")")
	  			.selectAll("g")
			  	.data(color_instance)
				.enter()
				.append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
				.on("mouseover",function(d){
					d3.select(this).classed("active-hover",true);
					d3.select(this).selectAll(".pinMarker,.removeMarker").style("display","block");
					var filternode=d3.selectAll(".node").filter(function(data){return data.relation===d;});
					filternode.selectAll("circle").classed("active-hover",true);
					filternode.each(function(e){
						// d3.selectAll(".link").filter(function(data){ return data.target===e || data.source===e || data.target===e.parent || data.source===e.children; }).classed("active-hover",true);
						d3.selectAll(".link").filter(function(data){ return data.target===e }).classed("active-hover",true);
					});
					//MoveToFront function
					filternode[0].forEach(function(d){
						d.parentNode.appendChild(d);
						});
				})
				.on("mouseout", mouseout);
	function mouseout(d){
			d3.select(this).classed("active-hover",false);
			d3.select(this).selectAll(".pinMarker,.removeMarker").style("display","none");
			d3.selectAll(".node").selectAll("circle").classed("active-hover",false);
			d3.selectAll(".link").classed("active-hover",false);
	}
	legend.append("rect")
	 		.attr("y",-10)
	 		.attr("height",15)
	 		.attr("width",250)
	 		.style("opacity",0);

	 legend.append("text")
	 	   .attr("class","legendCount")
	 	   .attr("x", -10)
	 	   .style("text-anchor", "end")
	 	   .style("fill","steelblue");

	 // draw legend square/circle
	 legend.append("circle")
	 			  .attr("class","legendRect")
			      .attr("cx", 7)
			      .attr("cy", -5)
			      .attr("r", 8)
			      // .attr("height", 16)
			      .attr("fill", color)
			      .attr("stroke", color)
			      .style("stroke-width","2px");		      
	  		
	  // draw legend text
	  legend.append("text")
	      .attr("x", 20)
	      .attr("class","legendLable")
	      // .attr("y", 0)
	      .text(function(d) { return d;})
	  legend.append("text")
			.attr("class","pinMarker")
			.attr('font-family', 'FontAwesome')
			.attr("font-size",14)
			.text("\uf08d")
			.attr("x",function(d){
				return 25+d3.select(this.parentNode).selectAll(".legendLable").node().getComputedTextLength();
			});
	  legend.append("text")
			.attr("class","removeMarker")
			.attr('font-family', 'FontAwesome')
			.attr("font-size",14)
			.text("\uf00d")
			.attr("x",function(d){
				return 40+d3.select(this.parentNode).selectAll(".legendLable").node().getComputedTextLength();
			});
 	
	legend.selectAll(".removeMarker")
		   .on("click",function(d,i){
		   	if (!d3.select(this).classed("pinned")){
		      	var group=d3.select(this.parentNode).selectAll("text,circle");
  				group.classed("removed",!group.classed("removed"));
  				d3.select(this).text(group.classed("removed") ? "\uf0e2" : "\uf00d");

  				var filternode=d3.selectAll(".node").filter(function(data){return data.relation===d;});
				// var filterspan=d3.selectAll(".span").filter(function(data){return data.prop_start===d || data.prop_end===d;});
				filternode.selectAll("circle").classed("removed",!filternode.selectAll("circle").classed("removed"));
				// filterspan.classed("removed",!filterspan.classed("removed"));
				filternode[0].forEach(function(d){
					d.parentNode.appendChild(d);
				});
				filternode.each(function(e){
						var filterlink=d3.selectAll(".link").filter(function(data){ return data.target===e; });
						filterlink.classed("removed",!filterlink.classed("removed"));
						var filterchildnode=d3.selectAll(".node").filter(function(data){return data.parent===e && data.relation!=e.relation;});
						if (filterchildnode[0].length>0) {
							console.log(filterchildnode);
							filterchildnode.selectAll("circle").classed("removed",!filterchildnode.selectAll("circle").classed("removed"));
						}
				});

				// min_date=d3.min(filternode.data(),function(d){
				// 	return d.date;
				// });
				// min_date=d3.max(filternode.data(),function(d){
				// 	return d.date;
				// });
				// timeseries.update_range([min_date,max_date]);
				// timelineSlider.update_brush(min_date,max_date);
			}
		});
	legend.selectAll(".pinMarker")
		   .on("click",function(d,i){
		   		if (!d3.select(this).classed("removed")){
		   			d3.selectAll(".node").selectAll("circle").classed("single-pinned",false);
		   			d3.selectAll(".link").classed("single-pinned",false);
					var group=d3.select(this.parentNode).selectAll("text,circle");
					group.classed("pinned",!group.classed("pinned"));
					group.filter(".removeMarker").style("opacity",group.classed("pinned") ? 0.5:1);

					if(group.classed("pinned")){
						d3.select(this.parentNode).on("mouseout",function(){
							d3.select(this).classed("active-hover",false);
						});
					}
					else{
						d3.select(this.parentNode).on("mouseout",mouseout);
					}
					var filternode=d3.selectAll(".node").filter(function(data){return data.relation===d;});
					filternode[0].forEach(function(d){
						d.parentNode.appendChild(d);
					});
					filternode.selectAll("circle").classed("pinned",!filternode.selectAll("circle").classed("pinned"));
					// filternode.each(function(e){
					// 	d3.selectAll(".link").filter(function(data){ return data.target===e || data.source===e || data.target===e.parent || data.source===e.children; }).classed("pinned",!filternode.selectAll("circle").classed("pinned"));
					// });
		   		}
			 });
}
