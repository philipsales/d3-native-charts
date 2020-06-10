const d3 = Object.assign({}, require("d3"), require("d3-array"));
const local = require('./histogram.localMessage.js');

export const LOCAL =  true;

/*
const d3FormatData =  [
    {price: "5.0"},
    {price: "5.6"},
    {price: "5.7"},
    {price: "5.8"},
    {price: "5.8"},
    {price: "5.8"},
    {price: "5.8"},
    {price: "5.9"},
    {price: "6.0"},
    {price: "6.2"},
    {price: "6.2"},
    {price: "6.3"},
    {price: "6.4"},
    {price: "6.5"},
    {price: "6.6"},
    {price: "6.7"},
    {price: "6.7"},
    {price: "6.7"},
    {price: "7.0"},
    {price: "7.1"},
    {price: "6.0"}
]
*/

const drawViz = (message) => {

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//const data =  d3FormatData 
	const data = transformData(message) 

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([
            d3.min(data, function(d) { return +d.value }) ,
            d3.max(data, function(d) { return +d.value }) 
            ])
        .range([0, width]);

    console.log('min value:', d3.min(data, function(d) { return +d.value }))
    console.log('length-', data.length)
    console.log('max value:', d3.max(data, function(d) { return +d.value }))

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d.value; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(data.length - 1)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(data);

        // Y axis: scale and draw:
    var y = d3.scaleLinear()
            .range([height, 0]);

    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

    svg.append("g")
        .call(d3.axisLeft(y));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#69b3a2")
    
    function transformData(message){
        return message.tables.DEFAULT.map( d => {
            return {
                "type": d.dimension[0],
                "value": d.metric[0]
            }
        })
    }
}

if (LOCAL) {
  drawViz(local.message);
} 