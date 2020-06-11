const d3 = Object.assign({}, require("d3"), require("d3-hexbin"));
const local = require('./hexbin.localMessage.js');

export const LOCAL =  true;

const d3FormatData =  [
 {x: "20", y: "10.2", group: "male"},
 {x: "20", y: "11.2", group: "male"},
 {x: "21", y: "12.2", group: "male"},
 {x: "21", y: "13.2", group: "male"},
 {x: "23", y: "23.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "50", y: "13.2", group: "male"},
 {x: "30", y: "33.2", group: "male"},
 {x: "40", y: "13.2", group: "male"},
 {x: "33", y: "13.2", group: "male"},
 {x: "55", y: "3.2", group: "male"},
 {x: "53", y: "2", group: "male"},
 {x: "64", y: "1", group: "male"}
]

const drawViz = (message) => {
   
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom,
        minOffset = 3,
        maxOffset = 2;

	d3.select('body')
	  .selectAll('svg')
	  .remove();
    // append the svg object to the body of the page
    var svg = 
        d3.select("body")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xdata = d3FormatData 
    console.log(xdata)
    var data = transformData(message) 
    console.log(data)

    
    // Add X axis
    var x = d3.scaleLinear()
              //.domain([5, 18])
              .domain([
                d3.min(data, function(d) { return +d.x}) - minOffset,
                d3.max(data, function(d) { return +d.x}) + maxOffset 
              ])
              .range([ 0, width ]);

    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
              .domain([
                  d3.min(data, function(d) { return +d.y}) - minOffset,
                  d3.max(data, function(d) { return +d.y}) + maxOffset 
                ])
              .range([ height, 0 ]);

    svg.append("g")
       .call(d3.axisLeft(y));

    // Reformat the data: d3.hexbin() needs a specific format
    var inputForHexbinFun = []

    data.forEach(function(d) {
        inputForHexbinFun.push( [x(d.x), y(d.y)] )  // Note that we had the transform value of X and Y !
    })

    // Prepare a color palette
    var color = d3.scaleLinear()
                  //.domain([0, 500]) // Number of points in the bin?
                  .domain([0, 10]) // Number of points in the bin?
                  .range(["transparent",  "#69b3a2"])

    // Compute the hexbin data
    var hexbin = d3.hexbin()
                   .radius(9) // size of the bin in px
                   .extent([ [0, 0], [width, height] ])

    // Plot the hexbins
    svg.append("clipPath")
       .attr("id", "clip")
       .append("rect")
       .attr("width", width)
       .attr("height", height)

    svg.append("g")
       .attr("clip-path", "url(#clip)")
       .selectAll("path")
       .data( hexbin(inputForHexbinFun) )
       .enter().append("path")
       .attr("d", hexbin.hexagon())
       .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
       .attr("fill", function(d) { return color(d.length); })
       .attr("stroke", "black")
       .attr("stroke-width", "0.4")

	function transformData(message){
		return message.tables.DEFAULT.map(d => {
			return { 
				"x": d.metric[0] ,
				"y": d.metric[1] , 
				"group": d.dimension[0]
			}
		})
	}
}

if (LOCAL) {
  drawViz(local.message);
} 