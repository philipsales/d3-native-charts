const d3 = Object.assign({}, require("d3"), require("d3-array"));
const local = require('./vertical-bar.localMessage.js');

/*
const d3FormatData =  [
	{binName: "1-5", count: 4},
	{binName: "5-10", count: 10},
	{binName: "11-20", count: 20}
]
*/

export const LOCAL =  true;

const drawViz = (messge) => {

	const height = 300;
	const width = 300;
	const margin = {top: 20, bottom: 50, left: 20, right: 20};

	//const data = d3FormatData;
	const data = transformData(local.message)
	
	// xScale to distribute bars
	const xScale = d3
	  .scaleBand()
	  .domain(
			data.map((d) => d.binName)
		)
	  .range([0, width - margin.right - margin.left])
	  .paddingInner(0.3);

	// yScale to size bars 
	const yScale = d3
	  .scaleLinear()
	  .domain([0, d3.max(data.map((d) => d.count))])
	  .range([0, width - margin.top - margin.bottom]);

	// remove existing svg 
	d3.select('body')
	  .selectAll('svg')
	  .remove();

	// make a svg
	const svg = d3
	  .select('body')
	  .append('svg')
	  .attr('transform', `translate (${margin.left}, ${margin.top})`)
	  .attr('width', width - margin.left)
	  .attr('height', height - margin.top);

	// add bars 
	const bars = svg
	  .append('g')
	  .attr('class', 'bars')
	  .selectAll('rect.bars')
	  .data(data)
	  .enter()
	  .append('rect')
	  .attr('x', (d) => xScale(d.binName))
	  .attr('y', (d) => height - margin.bottom - yScale(d.count))
		.attr('width', xScale.bandwidth())
		.attr('height', (d) => yScale(d.count));


	const text = svg
	  .append('g')
	  .selectAll('text')
	  .data(data)
	  .enter()
	  .append('text')
	  .attr('x', (d) => xScale(d.binName) + xScale.bandwidth()/2)
	  .attr('y', height - 20)
	  .attr('text-anchor', 'middle')
	  .attr('fill', '#000000')
	  .attr('font-family', 'Helvetica')
	  .text((d) => d.binName);

	function transformData(message){
		return message.tables.DEFAULT.map(d => {
			return { 
				"binName": d.dimension[0],
				"count": d.metric[0] 
			}
		})
	}
}

if (LOCAL) {
  drawViz(local.message);
} 
