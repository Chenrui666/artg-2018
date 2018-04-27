import {select,path,event,mouse,dispatch} from 'd3';
import './style.css';

const div = select('.container')
	.append('div')
	.classed('module',true);
const w = div.node().clientWidth;
const h = div.node().clientHeight;
const plot = div.append('svg')
	.attr('width',w)
	.attr('height',h);

//Draw shapes
const circle = plot.append('g')
	.attr('transform',`translate(${w/4},${h/2})`)
	.append('circle')
	.attr('r',w/16);
const square = plot.append('g')
	.attr('transform',`translate(${w/4*2},${h/2})`)
	.append('rect')
	.attr('x',-w/16)
	.attr('y',-w/16)
	.attr('width',w/8)
	.attr('height',w/8);
const triangle = plot.append('g')
	.attr('transform',`translate(${w/4*3},${h/2})`)
	.append('path');
const pathData = path();
pathData.moveTo(0,-w/16);
pathData.lineTo(w/16,w/16);
pathData.lineTo(-w/16,w/16);
pathData.lineTo(0,-w/16);
triangle.attr('d',pathData.toString());

//Basic d3 event API
//selection.on(eventType, callback)
// circle.on('click',function(d){
// 	console.log(d);
// 	console.log(this);
// 	console.log(event);
// });

// square
// 	.on('mouseenter',function(d){
// 		console.log(this);
// 	})
// 	.on('mouseleave', d => {
// 		console.log(this);
// 	});

// //On mouseenter
// //Turn circle red
// circle
// 	.on('mouseenter',function(d){
// 		select(this).style('fill','red');
// 	})
// 	.on('mouseleave',function(d){
// 		select(this).style('fill','black');
// 	})

// //Turn square green
// square  //superseed the eariler one  //add namespace to the eventtype---mouseenter.foo(then youcan have two event on the same element)
// 	.on('mouseenter',function(d){
// 		select(this).style('fill','green');
// 	})
// 	.on('mouseleave',function(d){
// 		select(this).style('fill','black');
// 	})


// square.on('mouseenter', null); //remove all mouseenter
// square.on('.foo',null);   //only remove the second

// //Turn triangle blue
// triangle
// 	.on('mouseenter',function(d){
// 		select(this).style('fill','blue');
// 	})
// 	.on('mouseleave',function(d){
// 		select(this).style('fill','black');
// 	})

// d3.dispatch //factory
// dispatcher //product from the factory

const dispatcher = dispatch(
	'element:onhover', 
	'element:onunhover',
	'element:changeColor'
	//customerstring, you could add more
	);

//How do we make these three elements interact among themselves?
circle.on('mouseenter', () =>{dispatcher.call('element:changeColor',null,'red');}) //null is the context,showing when mouseenter
	//we are going to broadcast to the dispatch that mouseenter event occured
	
	  .on('mouseleave', ()=>{ dispatcher.call('element:changeColor',null, 'black');})

square.on('mouseenter', () =>{dispatcher.call('element:changeColor',null,'green');})	
	  .on('mouseleave', ()=>{ dispatcher.call('element:changeColor',null, 'black');})


triangle.on('mouseenter', () =>{dispatcher.call('element:changeColor',null,'blue');})	
	  .on('mouseleave', ()=>{ dispatcher.call('element:changeColor',null, 'black');})

dispatcher.on('element:changeColor', function(arg){
	triangle.transition().style('fill', arg);
	circle.transition().style('fill', arg);
	square.transition().style('fill', arg);

})

//dispatch broadcasts event back out to all the subscribers





