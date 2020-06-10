const d3 = Object.assign({}, require("d3"), require("d3-array"));
const local = require('./tree.localMessage.js');

export const LOCAL =  true;

/*
const d3FormatData =  [
	{id: "total breast", value: 1615},
	{id: "total breast.specified", value: 1427},
	{id: "total breast.specified.stage 0 - 1c", value: 406},
]
*/

const drawViz = (message) => {
	const height = 400;
	const width = 960;
	const margin = {top: 20, bottom: 50, left: 100, right: 100};

	d3.select('body')
	  .selectAll('svg')
	  .remove();

	const svg = d3
	  .select('body')
	  .append('svg')
	  .attr('width', width)
	  .attr('height', height);

	const g =  svg.append('g')
				.attr('transform', `translate (${margin.left}, ${margin.top})`)

	const tree = d3.tree()
		.size([height - 400, width - 160]);

	const cluster = d3.cluster()
		.size([height - 100, width - 360]);

	const stratify = d3.stratify()
		.parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

	const data = transformData(local.message)

	const root = stratify(data)
		.sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

	console.log('root', root)
	console.log('root.descendants()', root.descendants().slice(1))

	cluster(root);

	const link = g.selectAll(".link")
		.data(root.descendants().slice(1))
		.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	const node = g.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	node.append("circle")
		.attr("r", 2.5);

	node.append("text")
		.attr("dy", 3)
		.attr("x", function(d) { return d.children ? -8 : 8; })
		.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
		//.text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
		.text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1) + ': ' + d.data.value; });

	function diagonal(d) {
		return "M" + d.y + "," + d.x
			+ "C" + (d.parent.y + 100) + "," + d.x
			+ " " + (d.parent.y + 100) + "," + d.parent.x
			+ " " + d.parent.y + "," + d.parent.x;
	}

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