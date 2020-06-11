const d3 = Object.assign({}, require('d3'), require('d3-array'));
const local = require('./ridge.localMessage.js');

export const LOCAL = true;

const ridgeLine = (message) => {
  const margin = { top: 60, right: 30, bottom: 20, left: 110 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

  //read data
  // d3.csv('https://raw.githubusercontent.com/zonination/perceptions/master/probly.csv', function (data) {
  // d3.csv("https://raw.githubusercontent.com/zonination/perceptions/master/probly.csv").then(snap => {

    const data = transformData(local.message)
    console.log('snap', snap)
    // const categories = data.columns
    const dataLength = data.length

    const description = []
    for (let i = 0; i < dataLength; i++) {
      const key = data[i].id
      description.push(key)
    }

    // Add X axis
    const x = d3.scaleLinear()
      .domain([-10, 140])
      .range([0, width]);
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // Create a Y scale for densities
    const y = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height, 0]);

    // Create the Y axis for names
    const yName = d3.scaleBand()
      .domain(description)
      .range([0, height])
      .paddingInner(1)
    svg.append('g')
      .call(d3.axisLeft(yName));

    const kde = densityData(kernel(7), x.ticks(40))
    const allDensity = []
    for (let i = 0; i < dataLength; i++) {
      const key = data[i].id
      const density = kde(data.map(function (d) { return d[key]; }))
      allDensity.push({ key: key, density: density })
    }

    console.log('allDensity', allDensity)

    // Add areas
    svg.selectAll('areas')
      .data(allDensity)
      .enter()
      .append('path')
      .attr('transform', function (d) { return ('translate(0,' + (yName(d.key) - height) + ')') })
      .datum(function (d) { return (d.density) })
      .attr('fill', '#69b3a2')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('d', d3.line()
        .curve(d3.curveBasis)
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); })
      )
  // })

  function densityData(kernel, X) {
    return function (V) {
      return X.map(function (x) {
        return [x, d3.mean(V, function (v) { return kernel(x - v); })];
      });
    };
  }
  function kernel(k) {
    return function (v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

  function transformData(message) {
    return message.tables.DEFAULT.map(d => {
      return {
        'id': d.dimension[0],
        'value': d.metric[0]
      }
    })
  }

}

if (LOCAL) {
  ridgeLine(local.message);
} 