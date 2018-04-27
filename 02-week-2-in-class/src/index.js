import * as d3 from 'd3';
//Install bootstrap first, using npm install bootstrap --save
//import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import parse from './parse';

console.log('Week 2 in class');

//Part 1: review d3-selection
//https://github.com/d3/d3-selection

//Select elements
const moduleSelection = d3.select('.module') //d3.selection
console.log(moduleSelection);
console.log(moduleSelection.node()) //node
const divSelection = d3.select('div') //selection the first div

//Selection vs DOMNode

//Modifying selection
const redNode = moduleSelection
	.append('div')
	.attr('class', 'new new-div')
	.style('width', '100px')
	.style('height', '200px')
	.style('background', 'red')

const greenNode = redNode
	.append('div')
	.style('background', 'green')
	.style('width', '40px')
	.style('height', '40px')

console.log(redNode.node());
console.log(greenNode.node());



//Handle events
redNode.on('click', function(){
	console.log('Red cicked')
});
greenNode.on('click', function(){


});

const divSelection2 = d3.select('body')
	.selectAll('div');




//Control flow: .each and .call
divSelection2.each(function(d,i,nodes){
	console.group();
	console.log(d) //datum
	console.log(i) //index
	console.log(nodes) //group
	console.log(this); //node

	console.groupEnd();



});

//Data binding


//Import and parse data
d3.csv('./data/hubway_trips_reduced.csv', parse, function(err,trips){

	//Data transformation, discovery, and mining

	const tripsByStation0 = d3.nest()
		.key(function(d){return d.station0 })
		.entries(trips);

	const tripVolumeByStation0 = tripsByStation0.map(function(d){

		/**
		 d = {
	key:'22',
	values:[...]
		 }
		 **/

		 return {
		 	station:d.key,
		 	volume:d.values.length
		 };

	});

	// slice
	// sort

	console.log(tripVolumeByStation0); //array, 142

	//mine for maximun
	const maxVolume = d3.max(tripVolumeByStation0, function(d){return d.volume});


	//visual space measurements
	const margin = {t:100, r:300, b:100, l:300};
	const padding = 3;
	const w = d3.select('.module').node().clientWidth;
	const h = d3.select('.module').node().clientHeight;
	const _w = w - margin.l - margin.r;
	const _h = h - margin.t - margin.b;

	console.log(w,h);

	//scale
	const scaleX = d3.scaleLinear().domain([0, maxVolume]).range([0, _w]);


	//Represent / DOM manipulation
	const svgNode = d3.select('.module')
		.append('svg')
		.attr('width', w)
		.attr('height', h); //selection targeting svg elements
	const plot = svgNode
		.append('g')
		.attr('class', 'chart')
		.attr('transform', `translate(${margin.l}, ${(margin.t)})`); //selection of <g.chart>

	console.log(plot.node());

	const stationNodes = plot.selectAll('.station') //selectio of 0 element
		.data(tripVolumeByStation0)
		.enter() //special selection, of deficit between DOM and data points in the array size = 142
		.append('g')
		.attr('class', 'station')//selection of <g.station> * 142
		.attr('transform', function(d,i){
			return `translate(0, ${i*h/tripVolumeByStation0.length})`
		})

	stationNodes
		.append('rect')
		.attr('width', function(d){
			return scaleX(d.volume);
		})
		.attr('height', _h/tripVolumeByStation0.length - padding)
		.style('fill', 'red');

	stationNodes
		.append('text')
		.text(function(d){
			return d.station;
		})
		.attr('text-anchor','end')
		.style('font-size', '6px');



});