function getprop(data){
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
            // "SELECT distinct ?p ?pdate (SAMPLE(?type) as ?type) WHERE{",
            "SELECT distinct (STR(?plabel) AS ?plabel) (STR(?pdatelabel) AS ?pdatelabel) WHERE{",
            "{ <"+data.link+"> ?p ?subj .",
            "?p a owl:DatatypeProperty ; rdfs:range xsd:date.} UNION ",
              "{ { ?subj ?p <"+data.link+"> } UNION",
              "{ <"+data.link+"> ?p ?subj .}",
              "?pdate a owl:DatatypeProperty ;",
              "rdfs:range xsd:date .",
              "?subj ?pdate ?date. ?pdate rdfs:label ?pdatelabel. FILTER langMatches(lang(?pdatelabel),'en')}",
              "?p rdfs:label ?plabel.",
          	// 	"rdf:type ?type .}",
          	"FILTER langMatches(lang(?plabel),'en').",
          	"FILTER(?p!=owl:sameAs && ?p!=foaf:primaryTopic)",
            // "}Order by Desc(?date)",
            "}limit 20"
            ].join(" ");
          console.log(query);
          var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json";
         
         var links=[];
         $.ajax({
            dataType: "jsonp",  
            url: queryUrl,
            success: function( _data ) {
               var results = _data.results.bindings;
               console.log(results);
	            for ( var i in results ) {  
	              var link = {};
	              link.source=data.label;
	              link.target=results[i].plabel.value; 
	              links.push(link);
	              if(results[i].pdatelabel){
	              	var linkA= {};
	              	// var linkB= {};
		              linkA.source=results[i].plabel.value;
		              // linkA.target=results[i].type.value; 
		              // linkB.source=results[i].type.value; 
		              linkA.target=results[i].pdatelabel.value; 
		              links.push(linkA);
	              }
	          	}
	          // 	links.forEach(function(link){
	          // 		link.source=link.source.replace("http://dbpedia.org/resource/","");
			        // link.source=link.source.replace("http://dbpedia.org/ontology/","");
			        // link.source=link.source.replace("http://dbpedia.org/property/","");
			        // link.target=link.target.replace("http://dbpedia.org/ontology/","");
			        // link.target=link.target.replace("http://dbpedia.org/property/","");
	          // 	});
	          	links=remove_duplicates(links);
	          	console.log(links);
              d3.select("#proptree").select('svg').remove();
              treemenu("#proptree",links);
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