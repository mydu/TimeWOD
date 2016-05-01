var events=[];
var nodes_selected=[];
var thumbnail_selected=[];
var TimeSpan=[];
// var minDate=new Date();
// var relations=[];
var colorScale= d3.scale.category20();
var span_prop=[ ["active years start date","active years end date"],
                                ["birth date","death date"],
                                ["opening date","closing date"],
                                ["formation date","closing date"],
                                ["founding date","closing date"],
                                ["opening","closed"],
                                ["first air date","last air date"],
                                ["start date","end date"],
                                ["first publication date","last publication date"]
                               ];
var span_instance=[ "active years start date","active years end date",
                                "birth date","death date",
                                "opening date","closing date",
                                "formation date","closing date",
                                "founding date","closing date",
                                 "opening","closed",
                                "first air date","last air date",
                                "start date","end date",
                                "first publication date","last publication date"
                                ];
treemenu("#class-search","all_pdate.csv");
var panelSlider=slider_generator("#panel-slider");
// var timelineSlider=slider_generator("#timeline-slider");
panelSlider.update();

var xScale = d3.time.scale()
var zoom = d3.behavior.zoom()
            // .scaleExtent([1, 100])
            .x(xScale)
            .on("zoom", zoomed);
function zoomed() {
      timeseries.update_range(xScale.domain());
      timelineSlider.update_brush(xScale.domain());
}
//init timeline
var timeseries=timeseries_generator();
var timelineSlider;


//Hide Loading when no outstanding ajax request 
jQuery.ajaxPrefilter(function( options ) {
    options.global = true;
});
$(document).ajaxStart(function() {
  $("#loading").modal('show');
});
$(document).ajaxStop(function() {
  $("#loading").modal('hide');
});

// $(document).ajaxError(function() {
//   $("#err_message").html("ERROR: Could not Complete your SPARQL Query Due To Heavy Query Load, Try It Later!");
//   $("#search-modal").modal('hide');
//   $("#error").modal('show');
// });


function ex1Query(){
  events=[];
  getprop("http://dbpedia.org/resource/Louis_C.K.");
}

function ex2Query(){
  events=[];
  var movies=["http://dbpedia.org/resource/Holiday_Hotel","http://dbpedia.org/resource/La_Ballade_des_Dalton","http://dbpedia.org/resource/The_Lazarus_Syndrome"];
  movies.forEach(function(d,i){
    getprop(d);
  });
}

function urlQuery(){
  var search_url=$("#dburl").val();
  getprop(search_url);
}

function classQuery(){
    // $("#wrapper").addClass("left-toggled").removeClass("right-toggled");
    // console.log(nodes_selected);
    // console.log(TimeSpan);
        var formatDate = d3.time.format("%Y-%m-%d")
        var begin=formatDate(TimeSpan[0][0]);
        var end=formatDate(TimeSpan[0][1]);
        var dateType=nodes_selected[0];
        var subj=nodes_selected[1];
        if (subj.includes("all ")){
          subj=subj.replace("all ","");
        }
        var url = "http://dbpedia.org/sparql";
        var query = [
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
            "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
            "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
            "PREFIX : <http://dbpedia.org/resource/>",
            "PREFIX dbpedia2: <http://dbpedia.org/property/>",
            "PREFIX dbpedia: <http://dbpedia.org/>",
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
            "PREFIX dbo: <http://dbpedia.org/ontology/>",
            "SELECT distinct ?s WHERE {",
              "?s a [rdfs:label \""+subj+"\"@en].",
              "?pdate rdfs:label \""+dateType+"\"@en.",
              "?s ?pdate ?date.",
              "FILTER ( ?date >= \""+begin+"\"^^xsd:date && ?date <= \""+end+"\"^^xsd:date)",
            "}Order by Asc(?date)",
            "limit 3 offset 100"
            ].join(" ");
        
          console.log(query);
          var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
         
          $.ajax({
            dataType: "jsonp",  
            url: queryUrl,
            timeout: 30000,
            // beforeSend: function() {
            //   $("#loading").modal('show');
            // },
            error:function(x,t,m){
               if(t==="timeout") $("#err_message").html("ERROR: Could not Complete your SPARQL Query Due To Heavy Query Load, Try It Later!");
                $("#search-modal").modal('hide');
                $("#error").modal('show');
            },
            success: function( _data ) {
              // events=[];//comment out if do query UNION(aggregation)
              var results = _data.results.bindings;
              console.log(results);
              // $("#loading").modal('hide');
              if(results.length===0){
                $("#err_message").html("ERROR: No SPARQL Query Result Found, Please Try Another Query!");
                // $("#loading").modal('hide');
                $("#error").modal('show');
              }
              else{
                $("#error").modal('hide');
                $("#search-modal").modal('hide');
                
                for ( var i in results ) { 
                  getprop(results[i].s.value);
                } 
              }
            }
          });
    }

function getprop(source){
        source=source.replace("http://dbpedia.org/page/","http://dbpedia.org/resource/")
        var url = "http://dbpedia.org/sparql";
        var query = [
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
            "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
            "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
            "PREFIX : <http://dbpedia.org/resource/>",
            "PREFIX dbpedia2: <http://dbpedia.org/property/>",
            "PREFIX dbpedia: <http://dbpedia.org/>",
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
            "PREFIX dbo: <http://dbpedia.org/ontology/>",

            "SELECT distinct (STR(?slabel) AS ?slabel) ?img (STR(?plabel) AS ?plabel) (STR(?pdatelabel) AS ?pdatelabel) (MAX(?date) AS ?date) (STR(?subjlabel) AS ?subjlabel) ?subj ?subimg ?wiki ?subwiki  WHERE{",
            "{ <"+source+"> ?p ?date .",
            "?p a owl:DatatypeProperty ;rdfs:range xsd:date .} UNION ",
              "{ { ?subj ?p <"+source+"> } UNION",
              "{ <"+source+"> ?p ?subj .}",
              "?pdate a owl:DatatypeProperty ;",
              "rdfs:range xsd:date . ",
              "?subj ?pdate ?date. ?pdate rdfs:label ?pdatelabel. ",
              "?subj rdfs:label ?subjlabel. ",
              "?subj foaf:isPrimaryTopicOf ?subwiki",
              "OPTIONAL {?subj dbo:thumbnail ?subimg.}",
              "FILTER NOT EXISTS {?subj rdf:type dbo:Place }.",
              "FILTER (!regex(str(?pdatelabel), 'death date', 'i')).",
              "FILTER langMatches(lang(?pdatelabel),'en'). ",
              "FILTER langMatches(lang(?subjlabel),'en')}",
              "<"+source+"> rdfs:label ?slabel.",
              "<"+source+"> foaf:isPrimaryTopicOf ?wiki.",
              "OPTIONAL {<"+source+"> dbo:thumbnail ?img.}",
              "?p rdfs:label ?plabel.",
            //  "rdf:type ?type .}",
            "FILTER langMatches(lang(?slabel),'en').",
            "FILTER langMatches(lang(?plabel),'en').",
            "FILTER (datatype(?date) = xsd:date).",
            "FILTER(?p!=owl:sameAs && ?p!=foaf:primaryTopic)",
            "}Order by ASC(?date)",
            // "}"
            ].join(" ");
          console.log(query);
          var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
         
         // var events=[];
         $.ajax({
            dataType: "jsonp",  
            url: queryUrl,
            timeout: 30000,
            // beforeSend: function() {
            //   $("#loading").modal('show');
            // },
            error:function(x,t,m){
               if(t==="timeout") $("#err_message").html("ERROR: Could not Complete your SPARQL Query Due To Heavy Query Load, Try It Later!");  
               $("#search-modal").modal('hide');
               $("#error").modal('show');
            },
            success: function( _data ) { 
              var results = _data.results.bindings;
              var sub_results=[];
              var find=false;
              results.forEach(function(d){
                  if(!d.pdatelabel) find=true;
                });
              if(results.length===0 || !find){
                // $("#loading").modal('hide');
                $("#err_message").html("ERROR: No SPARQL Query Result Found, Please Try Another Query!");
                $("#search-modal").modal('hide');
                $("#error").modal('show');
              }
              else{
                $("#error").modal('hide');
                $("#search-modal").modal('hide');
                var event = {};
                event["object"]=results[0].slabel.value;
                event["img"]=(results[0].img !=null) ? results[0].img.value: null;
                event["source"]=source;
                // if(_.isEmpty(event["instance"])) { event["instance"] = []; }
                for ( var i in results ) {
                  event["event"]=[];
                  event["timespan"]=[];
                }
                results.forEach(function(d){
                  if(!d.pdatelabel){
                    event["event"].push({
                        link:source,
                        label:d.slabel.value,
                        img: (d.img !=null) ? d.img.value: null,
                        pdate:d.plabel.value,
                        wiki:d.wiki.value,
                        relation:d.plabel.value,
                        date:new Date(d.date.value.replace("+02:00","")),
                        children:[]
                      });
                      //append relations for legends
                      // relations.push(d.plabel.value);
                    }
                    else sub_results.push(d);
                });
                sub_results.forEach(function(d){
                  
                    //remove duplicates
                    var c=0;
                    event.event[0].children.forEach(function(e){
                      if(e.link===d.subj.value) c+=1;
                    });
                    if(c===0){
                    event.event[0].children.unshift({
                            link:d.subj.value,
                            label:d.subjlabel.value,
                            img: (d.subimg !=null) ? d.subimg.value: null,
                            relation:d.plabel.value,
                            pdate:d.pdatelabel.value,
                            wiki:d.subwiki.value,
                            date:new Date(d.date.value.replace("+02:00","")),
                            children:[]
                        });
                        //append relations for legends
                        // relations.push(d.plabel.value);
                      }
                  });
            //          depthQuery(d.subj.value).done(function(_data){
            //               var sub_results = _data.results.bindings;
            //               var children=[];
            //               if(sub_results.length!=0){
            //                 //remove duplicates
            //                 sub_results.forEach(function(data){
            //                   var count=0;
            //                   children.forEach(function(e){
            //                     if(e.link===data.subj.value) count+=1;
            //                   });
                            
            //                   if (count===0){
            //                     children.push({
            //                         link:data.subj.value,
            //                         label:data.subjlabel.value,
            //                         img: (data.subimg !=null) ? data.subimg.value: null,
            //                         relation:data.plabel.value,
            //                         pdate:data.pdatelabel.value,
            //                         wiki:data.subwiki.value,
            //                         date:new Date(data.date.value.replace("+02:00","")),
            //                         children:[]
            //                     });
            //                   }
            //               });
            //               event.event[0].children.forEach(function(c,i){
            //                 if (c.link===d.subj.value) d.children=children;
            //               });
            //               //find minDate
            //               var this_minDate=d3.min(results, function(d) {
            //                 return new Date(d.date.value.replace("+02:00",""));
            //               });
            //               if(this_minDate<minDate)  minDate=this_minDate;
            //               }
            //           });
            //       }
            //     }    
            // });

                //find minDate
                // var this_minDate=d3.min(results, function(d) {
                //   return new Date(d.date.value.replace("+02:00",""));
                // });
                // if(this_minDate<minDate)  minDate=this_minDate;
                // colorScale.domain(d3.set(relations).values());
                //construct time span
                var count=0,prop_start=[],prop_end=[],date_start=[],date_end=[];
                for (var i in span_prop){
                  event["event"].forEach(function(d){
                    var default_end=new Date();
                    if(d.relation===span_prop[i][0]) { 
                      date_start.push(d.date);
                      prop_start.push(d.relation); 
                      event["event"].forEach(function(e){
                        if(e.relation===span_prop[i][1]) {
                          // date_end.push(e.date);
                          default_end=e.date; 
                        }
                      });
                      date_end.push(default_end);
                      prop_end.push(span_prop[i][1]);
                    }
                  });
                }
                for(var i=0; i<date_start.length; i++){
                  if(date_start[i]<date_end[i]){
                     event["timespan"].push({
                      label:results[0].slabel.value,
                       wiki:results[0].wiki.value,
                      link:source,
                      prop_start:prop_start[i],
                      prop_end:prop_end[i],
                      date_start:date_start[i],
                      date_end:date_end[i]
                   });
                  }
                }
                //   for ( var i in results ) {
                //     if(results[i].pdatelabel){
                //         event[results[i].plabel.value]=[];
                //     }
                //   }
                //   for ( var i in results ) {
                //   if(results[i].pdatelabel){
                //     var pevent= {};
                //     pevent.label=results[i].subjlabel.value;
                //     pevent[results[i].pdatelabel.value]=results[i].date.value.replace("+02:00","");
                //     event[results[i].plabel.value].push(pevent);
                //   }
                //   else{
                //     event[results[i].plabel.value]=results[i].date.value.replace("+02:00","");
                //   }
                // }
                events.unshift(event);
                if(sub_results.length===0) timeseries.update(events);
                else{
                  var draw=false;
                  sub_results.forEach(function(d,i){
                      if (i===sub_results.length-1) draw=true;
                      depthQuery(d.subj.value,draw);
                    // timeseries.update(events);
                  });
                }  
          }    
        }
    });
}
function depthQuery(source,draw){
  var url = "http://dbpedia.org/sparql";
        var query = [
            "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
            "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
            "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
            "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
            "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
            "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
            "PREFIX : <http://dbpedia.org/resource/>",
            "PREFIX dbpedia2: <http://dbpedia.org/property/>",
            "PREFIX dbpedia: <http://dbpedia.org/>",
            "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
            "PREFIX dbo: <http://dbpedia.org/ontology/>",

            "SELECT distinct  (STR(?plabel) AS ?plabel) (STR(?pdatelabel) AS ?pdatelabel) (MAX(?date) AS ?date) (STR(?subjlabel) AS ?subjlabel) ?subj ?subimg ?subwiki  WHERE{",
             "{ ?subj ?p <"+source+"> } UNION",
              "{ <"+source+"> ?p ?subj .}",
              "?pdate a owl:DatatypeProperty ;",
              "rdfs:range xsd:date . ",
              "?subj ?pdate ?date. ?pdate rdfs:label ?pdatelabel. ",
              "?subj rdfs:label ?subjlabel. ",
              "?subj foaf:isPrimaryTopicOf ?subwiki",
              "OPTIONAL {?subj dbo:thumbnail ?subimg.}",
              "FILTER NOT EXISTS {?subj rdf:type dbo:Place }.",
              "FILTER (!regex(str(?pdatelabel), 'death date', 'i')).",
              "FILTER langMatches(lang(?pdatelabel),'en'). ",
              "FILTER langMatches(lang(?subjlabel),'en')",
              "?p rdfs:label ?plabel.",
            "FILTER langMatches(lang(?plabel),'en').",
            "FILTER (datatype(?date) = xsd:date).",
            "FILTER(?p!=owl:sameAs && ?p!=foaf:primaryTopic)",
            // "}Order by Desc(?date)",
            "}limit 2"
            ].join(" ");
          console.log(query);
          var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
         return $.ajax({
            dataType: "jsonp",  
            url: queryUrl,
            timeout: 50000,
            // beforeSend: function() {
            //   $("#loading").modal('show');
            // },
            error:function(x,t,m){
               if(t==="timeout") $("#err_message").html("ERROR: Could not Complete your SPARQL Query Due To Heavy Query Load, Try It Later!");  
               $("#search-modal").modal('hide');
               $("#error").modal('show');
            },
            success: function( _data ) {
              $("#error").modal('hide');
              var results = _data.results.bindings;
              if(results.length!=0){
                // find minDate
                // var this_minDate=d3.min(results, function(d) {
                //   return new Date(d.date.value.replace("+02:00",""));
                // });
                // if(this_minDate<minDate)  minDate=this_minDate;
                    
                var index;
                // var index=events[0].event[0].children.length-data.id;
                //events[0].event[0] might not have children ERROR return undefined
                if (events[0].event[0].children) {
                   events[0].event[0].children.forEach(function(d,i){
                    if (d.link===source) index=i;
                  });

                    if (index){
                      events[0].event[0].children[index].children=[];
                      
                      results.forEach(function(d){
                        //remove duplicates
                        var c=0;
                        events[0].event[0].children[index].children.forEach(function(e){
                          if(e.link===d.subj.value) c+=1;
                        });
                        if(c===0 && d.subj.value!=events[0].event[0].link){
                            events[0].event[0].children[index].children.push({
                            link:d.subj.value,
                            label:d.subjlabel.value,
                            img: (d.subimg !=null) ? d.subimg.value: null,
                            relation:d.plabel.value,
                            pdate:d.pdatelabel.value,
                            wiki:d.subwiki.value,
                            date:new Date(d.date.value.replace("+02:00","")),
                            // parent:events[0].event[0].children[index],
                            children:[]
                          });
                          // relations.push(d.plabel.value);
                        }
                      });
                    }   
                }
              
                if(events[0].event[0]._children){
                  events[0].event[0]._children.forEach(function(d,i){
                    if (d.link===source) index=i;
                  });
                  if(index){

                      events[0].event[0]._children[index].children=[];
                      results.forEach(function(d){
                      //remove duplicates
                      var c=0;
                      events[0].event[0]._children[index].children.forEach(function(e){
                        if(e.link===d.subj.value) c+=1;
                      });
                      if(c===0 && d.subj.value!=events[0].event[0].link){
                          events[0].event[0]._children[index].children.push({
                          link:d.subj.value,
                          label:d.subjlabel.value,
                          img: (d.subimg !=null) ? d.subimg.value: null,
                          relation:d.plabel.value,
                          pdate:d.pdatelabel.value,
                          wiki:d.subwiki.value,
                          date:new Date(d.date.value.replace("+02:00","")),
                          // parent:events[0].event[0].children[index],
                          children:[]
                        });
                        // relations.push(d.plabel.value);
                      }
                    });
                  }
                }
              }
            if (draw===true) {
              console.log(events);
              // test(events);
              // console(document.readyState);
              // if(type==="class") {
              //    // console.log(events.length);
              //   if (events.length>=3) $("#loading").modal('hide');
              // }
              // else $("#loading").modal('hide');
              timeseries.update(events);
            }
        }

    });
}

function remove_duplicates(objectsArray) {
    var usedObjects = {};

    for (var i=objectsArray.length - 1;i>=0;i--) {
        var so = JSON.stringify(objectsArray[i]);

        if (usedObjects[so]) {
            objectsArray.splice(i, 1);

        } else {
            usedObjects[so] = true;          
        }
    }

    return objectsArray;

}

// function propQuery(){
//   var prop=nodes_selected.pop();
//   var dateType=nodes_selected.pop();
//   var data_obj=thumbnail_selected.pop();
//   var data=data_obj.link;
//   var url = "http://dbpedia.org/sparql";
//   if (data.replace("http://dbpedia.org/resource/","")===prop) {
//     var query = [
//         "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
//         "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
//         "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
//         "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
//         "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
//         "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
//         "PREFIX : <http://dbpedia.org/resource/>",
//         "PREFIX dbpedia2: <http://dbpedia.org/property/>",
//         "PREFIX dbpedia: <http://dbpedia.org/>",
//         "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
//         "PREFIX dbo: <http://dbpedia.org/ontology/>",
//         "SELECT distinct ?s (MAX(?date) as ?date) (sql:SAMPLE(?label) AS ?label) ?abs ?img WHERE {",
//               "?s rdfs:label \""+data_obj.label+"\"@en .",
//                "?pdate rdfs:label \""+dateType+"\"@en.",
//               "?s ?pdate ?date.",
//               "?s dbo:abstract ?abs.",
//               "?s rdfs:label ?label.",
//               "OPTIONAL {?s dbo:thumbnail ?img.}",
//               "FILTER langMatches(lang(?label),'en').",
//               "FILTER langMatches(lang(?abs),'en').",
//               // "FILTER ( ?date >= \""+begin+"\"^^xsd:date && ?date <= \""+end+"\"^^xsd:date)",
//             "}Order by Asc(?date)",
//             "limit 5"
//         ].join(" ");
//   }
//   else {
//     var query = [
//         "PREFIX owl: <http://www.w3.org/2002/07/owl#>",
//         "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
//         "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
//         "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
//         "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
//         "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
//         "PREFIX : <http://dbpedia.org/resource/>",
//         "PREFIX dbpedia2: <http://dbpedia.org/property/>",
//         "PREFIX dbpedia: <http://dbpedia.org/>",
//         "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>",
//         "PREFIX dbo: <http://dbpedia.org/ontology/>",
//         "SELECT distinct ?s (MAX(?date) as ?date) (sql:SAMPLE(?label) AS ?label) ?abs ?img WHERE {",
//             "{ ?s dbpedia2:"+prop+" <"+data+"> } UNION",
//             "{ ?s dbo:"+prop+" <"+data+"> } UNION",
//             "{ <"+data+"> dbpedia2:"+prop+" ?s } UNION",
//               "{ <"+data+"> dbo:"+prop+" ?s .}",
//               "{?s dbpedia2:"+dateType+" ?date} UNION",
//               "{?s dbo:"+dateType+" ?date .}",
//               "?s dbo:abstract ?abs.",
//               "?s rdfs:label ?label.",
//               "OPTIONAL {?s dbo:thumbnail ?img.}",
//               "FILTER langMatches(lang(?label),'en').",
//               "FILTER langMatches(lang(?abs),'en').",
//               // "FILTER ( ?date >= \""+begin+"\"^^xsd:date && ?date <= \""+end+"\"^^xsd:date)",
//             "}Order by Asc(?date)",
//             "limit 5"
//         ].join(" ");
//   }
//       console.log(query);
//       var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";

//       $.ajax({
//             dataType: "jsonp",  
//             url: queryUrl,
//             success: function( _data ) {
//               // events=[];//comment out if do query UNION(aggregation)
//               var results = _data.results.bindings;
//               // var levels=Array.apply(null, {length: results.length}).map(Number.call, Number);
//               // levels =d3.shuffle(levels);
//               var firstDate= new Date(results[0].date.value.replace("+02:00",""))
//               for ( var i in results ) { 
//                 var event = {};
//                 // event.id = i;
//                 event.label = results[i].label.value;
//                 event.abs = results[i].abs.value;
//                 event.date_start =new Date(results[i].date.value.replace("+02:00",""));
//                 event.date_end = "";
//                 event.link = results[i].s.value;
//                 event.level=data_obj.level;
//                 if (results[i].img!=null) event.img = results[i].img.value; 
//                 else event.img = null; 
//                 events.push(event);        
//               }
                
//               // if (data_obj.date_start< firstDate) events.unshift(data_obj);
//               // else events.push(data_obj);
//             // console.log(events);
//             // d3.select("#timeline").selectAll(".thumbnail").remove();
//             //draw timeline
//             timeline(events);
//             }
//       });
// }

