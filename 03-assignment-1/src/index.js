import * as d3 from 'd3';
import './style.css';

import parse from './parse';

console.log('Week 3 assignment 1: writing a reusable activity histogram');

//Set up DOM scaffolding
const width = d3.select('#activity-histogram').node().clientWidth;
const height = d3.select('#activity-histogram').node().clientHeight;
const margin = {t:20,r:100,b:20,l:100};
const w = width - margin.l - margin.r;
const h = height - margin.t - margin.b;
const plot = d3.select('#activity-histogram')
	.append('svg')
	.attr('width',width)
	.attr('height',height)
	.append('g')
	.attr('class','acitivity-histogram-inner')
	.attr('transform',`translate(${margin.l},${margin.t})`);

//Import and parse data
d3.csv('./data/hubway_trips_reduced.csv', parse, function(err,trips){

	//Bind selection to the entire array of trips, one to one
	plot
		.datum(trips) //note: .datum(), not .data()
		.each(activityHistogram);

});

function activityHistogram(data){

	//Transform data
	//Group trips into discrete 15 minute bins, using the d3.histogram layout
	const histogram = d3.histogram()
		.value(d => d.time_of_day0)
		.thresholds(d3.range(0,24,.25));
	const tripsByQuarterHour = histogram(data)
		.map(d => {
			return {
				x0:d.x0, //left bound of the bin; 18.25 => 18:15
				x1:d.x1,
				volume:d.length
			}
		});
	console.log(tripsByQuarterHour);

	//Set up scales in the x and y direction
	const scaleX = d3.scaleLinear().domain([0,24]).range([0,w]);
	const maxVolume = d3.max(tripsByQuarterHour, d => d.volume);
	const scaleY = d3.scaleLinear().domain([0,maxVolume]).range([h,0]);

	//Set up axis generator
	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-w);

	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickFormat(d => {
			const time = +d;
			const hour = Math.floor(time);
			let min = Math.round((time-hour)*60);
			min = String(min).length === 1? "0"+ min : min;
			return `${hour}:${min}`
		});

	//Draw
	/*** YOUR CODE HERE ***/
	// const bars = plot.selectAll('.bar')
	// 	.data(tripsByQuarterHour)
	// 	.enter()
	// 	.append('g');

	// bars.append('rect')
	// 	.attr('x', function(d){ return scaleX(d.x0);})
	// 	.attr('y', function(d){ return scaleY(d.volume)})
	// 	.attr('width', function(d){ return scaleX(d.x1-d.x0);})
	// 	.attr('height', function(d){ return d.volume;})
	// 	.attr('fill', 'red');

	const binUpdate = d3.select(this)
		.selectAll('.bin') //selection of 0 elements
		.data(tripByQuarterHour); //array of 96 bins
		//enter set of 96
		//exit set of 0

	const binsEnter = binUpdate.enter()
		.append('rect')
		.attr('class', '.bin')
		.attr('x', d=> scaleX(d.x0))
		.attr('width', d => (scaleX(d.x1) - scaleX(d.x0) - 1))
		.attr('y', d=> scaleY(d.volume)
		.attr('height', 0)
		.style('fill', 'green')

	binsEnter.merge(binUpdate)
		.transition()
		.duration(500)
		.attr('x', d=> scaleX(d.x0))
		.attr('width', d => (scaleX(d.x1) - scaleX(d.x0) - 1))
		.attr('y', d=> scaleY(d.volume)
		.attr('height', d=> (h -scaleY(d.volume)))
		.style('fill', 'gray');





		

	/*** YOUR CODE HERE ***/

	//Axis
	const axisXNode = d3.select(this)// in order to avoiod redraw x-axis when run it twice
		.selectAll('.axis-x') //selection of size 0
		.data([1]); //data array of 1 element
		//enter set will be set 1
		//exit 0
		//update 0
	const axisXNodeEnter = axisXNode.enter()
		.append('g')
		.attr('class','axis-x');
		//<g.axis-x>
	axisXNode.merge(axisXNodeEnter)
		.attr('transform',`translate(0,${h})`)
		.call(axisX);

	const axisYNode = d3.select(this)
		.selectAll('.axis-y')
		.data([1]);
	const axisYNodeEnter = axisYNode.enter()
		.append('g')
		.attr('class','axis-y');
	axisYNode.merge(axisYNodeEnter)
		.call(axisY);

	axisYNodeEnter.select('.domain').style('display','none');
	axisYNodeEnter.selectAll('line')
		.style('stroke','rgb(80,80,80)')
		.style('stroke-dasharray','2px 2px');

}