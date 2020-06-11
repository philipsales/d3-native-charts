const d3 = Object.assign({}, require("d3"), require("d3-array"));
const local = require('./tree.localMessage.js');

export const LOCAL =  true;

const d3FormatData =  [
	{id: "total breast", value: "", color: ""},
	{id: "total breast.specified", value: "", color: ""},
	{id: "total breast.specified.stage 0 - 1c", value: "11000", color: ""},
	{id: "total breast.specified.stage 1 - 2c", value: "62035", color: ""},
	{id: "total breast.specified.stage 3 - 3c", value: "2035", color: ""}
]

const drawViz = (message) => {
	const height = 400;
	const width = 960;
	const margin = {top: 20, bottom: 50, left: 100, right: 100};

	// main svg
	d3.select('body')
	.selectAll('svg')
	.remove();

	var svg = d3.select("body")
		    .append('svg')
            .attr("width", width)
			.attr("height", height);

	const g = svg.append("g")
			.attr("transform", "translate(20,0)");       // move right 20px.

    // x-scale and x-axis
    var experienceName = ["", "","","","",""];
    var formatSkillPoints = function (d) {
        return experienceName[d % 6];
    }
    var xScale =  d3.scaleLinear()
            .domain([0, 28000])
            .range([0, 280]);

    var xAxis = d3.axisTop()
            .scale(xScale)
            .ticks(5)
            .tickFormat(formatSkillPoints);

    // Setting up a way to handle the data
    var tree = d3.cluster()                 // This D3 API method setup the Dendrogram datum position.
            .size([height, width - 460])    // Total width - bar chart width = Dendrogram chart width
            .separation(function separate(a, b) {
                return a.parent == b.parent            // 2 levels tree grouping for category
                || a.parent.parent == b.parent
                || a.parent == b.parent.parent ? 0.4 : 0.8;
            });

    var stratify = d3.stratify()            // This D3 API method gives cvs file flat data array dimensions.
            .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

	const data = d3FormatData 

        var root = stratify(data);
        tree(root);

        // Draw every datum a line connecting to its parent.
        var link = g.selectAll(".link")
                .data(root.descendants().slice(1))
                .enter().append("path")
                .attr("class", "link")
                .attr("d", function(d) {
                    return "M" + d.y + "," + d.x
                            + "C" + (d.parent.y + 100) + "," + d.x
                            + " " + (d.parent.y + 100) + "," + d.parent.x
                            + " " + d.parent.y + "," + d.parent.x;
                });

        // Setup position for every datum; Applying different css classes to parents and leafs.
        var node = g.selectAll(".node")
                .data(root.descendants())
                .enter().append("g")
                .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        // Draw every datum a small circle.
        node.append("circle")
                .attr("r", 4);

        // Setup G for every leaf datum.
        var leafNodeG = g.selectAll(".node--leaf")
                .append("g")
                .attr("class", "node--leaf-g")
                .attr("transform", "translate(" + 8 + "," + -13 + ")");

        leafNodeG.append("rect")
                .attr("class","shadow")
                .style("fill", function (d) {return d.data.color;})
                .attr("width", 2)
                .attr("height", 30)
                .attr("rx", 2)
                .attr("ry", 2)
                .transition()
                    .duration(800)
                    .attr("width", function (d) {return xScale(d.data.value);});

        leafNodeG.append("text")
                .attr("dy", 19.5)
                .attr("x", 8)
                .style("text-anchor", "start")
                .text(function (d) {
                    return d.data.id.substring(d.data.id.lastIndexOf(".") + 1) + " - " + d.data.value;
                });

        // Write down text for every parent datum
        var internalNode = g.selectAll(".node--internal");
        internalNode.append("text")
                .attr("y", -10)
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
                });

        // Attach axis on top of the first leaf datum.
        var firstEndNode = g.select(".node--leaf");
            firstEndNode.insert("g")
                    .attr("class","xAxis")
                    .attr("transform", "translate(" + 7 + "," + -14 + ")")
                    .call(xAxis);

            // tick mark for x-axis
            firstEndNode.insert("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(7," + (height - 15) + ")")
                    .call(d3.axisBottom()
                            .scale(xScale)
                            .ticks(5)
                            .tickSize(-height, 0, 0)
                            .tickFormat("")
                    );

        // Emphasize the y-axis baseline.
        svg.selectAll(".grid").select("line")
                .style("stroke-dasharray","20,1")
                .style("stroke","black");

        // The moving ball
/*        var ballG = svg.insert("g")
                .attr("class","ballG")
                .attr("transform", "translate(" + 1100 + "," + height/2 + ")");
        ballG.insert("circle")
                .attr("class","shadow")
                .style("fill","steelblue")
                .attr("r", 8);
        ballG.insert("text")
                .style("text-anchor", "middle")
                .attr("dy",5)
                .text("0.0");
*/
        // Animation functions for mouse on and off events.
        d3.selectAll(".node--leaf-g")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut);

        function handleMouseOver(d) {
            var leafG = d3.select(this);

            leafG.select("rect")
                    .attr("stroke","#4D4D4D")
                    .attr("stroke-width","2");


            var ballGMovement = ballG.transition()
                    .duration(400)
                    .attr("transform", "translate(" + (d.y
                            + xScale(d.data.value) + 90) + ","
                            + (d.x + 1.5) + ")");

            ballGMovement.select("circle")
                    .style("fill", d.data.color)
                    .attr("r", 18);

            ballGMovement.select("text")
                    .delay(300)
                    .text(Number(d.data.value).toFixed(1));
        }
        function handleMouseOut() {
            var leafG = d3.select(this);

            leafG.select("rect")
                    .attr("stroke-width","0");
        }
	
}

if (LOCAL) {
  drawViz();
} 