const d3 = Object.assign({}, require("d3"), require("d3-array"));
const local = require('./dendogram-bar.localMessage.js');

export const LOCAL =  true;

const d3FormatDatav1 =  [
	{id: "breast cancer", value: "" },
	{id: "breast cancer.specified", value: "" },
	{id: "breast cancer.specified.stage 0 - 1c", value: "100" },
	{id: "breast cancer.specified.stage 0 - 1c", value: "635" },
	{id: "breast cancer.specified.stage 2 - 3c", value: "335" },
	{id: "breast cancer.specified.stage 2 - 3c", value: "505" },
	{id: "breast cancer.specified.stage 3 - 2c", value: "235" },
	{id: "breast cancer.specified.stage 5 - 2c", value: "605" },
	{id: "breast cancer.unspecified", value: "" },
	{id: "breast cancer.unspecified.unspecified", value: "300" }
]
const d3FormatData =  [
	{id: "breast cancer", value: "" },
	{id: "breast cancer.nonspecified", value: "" },
	{id: "breast cancer.nonspecified.unspecified", value: "300" },
	{id: "breast cancer.specified", value: "" },
	{id: "breast cancer.specified.stage 0 - 1c", value: "100" },
	{id: "breast cancer.specified.stage 0 - 1c.stage 0", value: "100" },
	{id: "breast cancer.specified.stage 0 - 1c.stage 1", value: "200" },
	{id: "breast cancer.specified.stage 0 - 1c.stage 1b", value: "400" },
	{id: "breast cancer.specified.stage 0 - 1c.stabe 1c", value: "100" },
	{id: "breast cancer.specified.stage 2 - 2c", value: "100" },
	{id: "breast cancer.specified.stage 2 - 2c.stabe 2a", value: "10" },
	{id: "breast cancer.specified.stage 2 - 2c.stabe 2b", value: "300" },
	{id: "breast cancer.specified.stage 2 - 2c.stabe 2c", value: "950" },
	{id: "breast cancer.undetermined", value: "" },
	{id: "breast cancer.undetermined.undetermined", value: "300" }
]
/*
const d3FormatData =  [
	{id: "breast cancer", value: "" },
	{id: "breast cancer.stage 0 - 1c", value: "100" },
	{id: "breast cancer.stage 0 - 1c.stage 0", value: "100" },
	{id: "breast cancer.stage 0 - 1c.stage 1", value: "200" },
	{id: "breast cancer.stage 0 - 1c.stage 1b", value: "400" },
	{id: "breast cancer.stage 0 - 1c.stabe 1c", value: "100" },
	{id: "breast cancer.stage 2 - 2c", value: "100" },
	{id: "breast cancer.stage 2 - 2c.stabe 2a", value: "10" },
	{id: "breast cancer.stage 2 - 2c.stabe 2b", value: "300" },
	{id: "breast cancer.stage 2 - 2c.stabe 2c", value: "950" }
]
*/

const drawViz = (message) => {
	const height = 400;
	const width = 960;
	const margin = {top: 20, bottom: 50, left: 100, right: 100};

	// main svg
	d3.select('body')
      .selectAll('svg')
	  .remove();

	const svg = d3.select("body")
		    .append('svg')
            .attr("width", width)
			.attr("height", height);

	const g = svg.append("g")
			.attr('transform', `translate (${margin.left}, ${margin.top})`)

    // x-scale and x-axis
    const experienceName = ["", "","","","",""];
    const formatSkillPoints = function (d) {
        return experienceName[d % 6];
	}

	const xdata = d3FormatData 
	console.log('d3data', xdata)
	const data = transformData(message)
	console.log('data', data)

	console.log('max', d3.max(data, function(d) { return +d.value }))
    const xScale =  d3.scaleLinear()
			.domain([
				0, 
				d3.max(data, function(d) { 
					console.log('value', +d.value)
					return +d.value 
				})  
			])
            .range([
				0, 
				d3.mean(data, function(d) { return +d.value }) 
			]);

    const xAxis = d3.axisTop()
					.scale(xScale)
					.ticks(0)
					.tickFormat(formatSkillPoints);

    // Setting up a way to handle the data
    const tree = d3.cluster()                 // This D3 API method setup the Dendrogram datum position.
				   .size([height, width - 460])    // Total width - bar chart width = Dendrogram chart width
				   .separation(function separate(a, b) {
						return a.parent == b.parent            // 2 levels tree grouping for category
						|| a.parent.parent == b.parent
						|| a.parent == b.parent.parent ? 0.4 : 0.8;
					});

    const stratify = d3.stratify()            // This D3 API method gives cvs file flat data array dimensions.
            .parentId(function(d) { 
				return d.id.substring(0, d.id.lastIndexOf(".")); 
			});

	const root = stratify(data);

	tree(root);

	// Draw every datum a line connecting to its parent.
	const link = g.selectAll(".link")
			.data(root.descendants().slice(1))
			.enter()
			.append("path")
			.attr("class", "link")
			.attr("d", function(d) {
				return "M" + d.y + "," + d.x
						+ "C" + (d.parent.y + 100) + "," + d.x
						+ " " + (d.parent.y + 100) + "," + d.parent.x
						+ " " + d.parent.y + "," + d.parent.x;
			});

	// Setup position for every datum; Applying different css classes to parents and leafs.
	const node = g.selectAll(".node")
			.data(root.descendants())
			.enter()
			.append("g")
			.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	// Draw every datum a small circle.
	node.append("circle")
			.attr("r", 4);

	// Setup G for every leaf datum.
	const leafNodeG = g.selectAll(".node--leaf")
			.append("g")
			.attr("class", "node--leaf-g")
			.attr("transform", "translate(" + 8 + "," + -13 + ")");

	leafNodeG.append("rect")
			.attr("class","shadow")
			//.style("fill", function (d) {return d.data.color;})
			.style("fill", "#80A0A0")
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
				return d.data.id.substring(d.data.id.lastIndexOf(".") + 1) + ": " + d.data.value;
			});

	// Write down text for every parent datum
	const internalNode = g.selectAll(".node--internal");

	internalNode.append("text")
				.attr("y", -10)
				.style("text-anchor", "middle")
				.text(function (d) {
					return d.data.id.substring(d.data.id.lastIndexOf(".") + 1);
				});

	// Attach axis on top of the first leaf datum.
	const firstEndNode = g.select(".node--leaf");
	
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
	svg.selectAll(".grid")
	   .select("line")
	   .style("stroke-dasharray","20,1")
	   .style("stroke","black");

	function transformData(message){
		return message.tables.DEFAULT.map(d => {
			return { 
				"id": d.dimension[0],
				"value": d.metric[0] 
			}
		})
	}

}

if (LOCAL) {
  drawViz(local.message);
} 