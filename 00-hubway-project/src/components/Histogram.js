import * as d3 from 'd3';
import '../style/histogram.css';

function Histogram(_){
	//factory function

	let _thresholds;
	let _domain;
	let _value = () => {}; //function
	let _tickX = 6;
	let _tickY = 5;
	let _tickXFormat = d => d;
	let _maxY = -Infinity;

	const _dispatch = d3.dispatch('mousemove:x');
	//Internal event dispatch

	function exports(data,i){
		const root = this;

		const width = root.clientWidth; 
		const height = root.clientHeight;
		const margin = {t:20,r:20,b:20,l:30};
		const w = width - margin.l - margin.r;
		const h = height - margin.t - margin.b;

		const svg = d3.select(root)
			.classed('histogram',true)
			.selectAll('svg')
			.data([1]); //What's going on here?
		const svgEnter = svg.enter().append('svg')
			.attr('width',width)
			.attr('height',height);
		svgEnter.append('g').attr('class','plot')

		const plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform',`translate(${margin.l},${margin.t})`);

		//Transform data
		//Group trips into discrete 15 minute bins, using the d3.histogram layout
		const histogram = d3.histogram()
			.value(_value)
			.thresholds(_thresholds)
			.domain(_domain);
		const tripsByQuarterHour = histogram(data)
			.map(d => {
				return {
					x0:d.x0, //left bound of the bin; 18.25 => 18:15
					x1:d.x1,
					volume:d.length
				}
			});

		//Set up scales in the x and y direction
		const scaleX = d3.scaleLinear().domain(_domain).range([0,w]);
		const maxVolume = d3.max(tripsByQuarterHour, d => d.volume);
		const scaleY = d3.scaleLinear().domain([0, Math.max(_maxY,maxVolume)]).range([h,0]);

		//Set up axis generator
		const axisY = d3.axisLeft()
			.scale(scaleY)
			.tickSize(-w)
			.ticks(_tickY);

		const axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(_tickX)
			.tickFormat(_tickXFormat);

		//Draw
		//Bars
		//Update
		const binsUpdate = plot
			.selectAll('.bin')
			.data(tripsByQuarterHour);

		//Enter
		const binsEnter = binsUpdate.enter()
			.append('rect')
			.attr('class','bin') //If you forget this, what will happen if we re-run this the activityHistogram function?
			.attr('x', d => scaleX(d.x0))
			.attr('width', d => (scaleX(d.x1) - scaleX(d.x0)))
			.attr('y', d => h)
			.attr('height', 0);

		//Enter + update
		binsEnter.merge(binsUpdate)
			.transition()
			.duration(500)
			.attr('x', d => scaleX(d.x0))
			.attr('width', d => (scaleX(d.x1) - scaleX(d.x0)))
			.attr('y', d => scaleY(d.volume))
			.attr('height', d => (h - scaleY(d.volume)))
			.style('fill','rgba(0,0,0,.1)');

		//Exit
		binsUpdate.exit().remove();

		//Axis
		const axisXNode = plot
			.selectAll('.axis-x')
			.data([1]);
		const axisXNodeEnter = axisXNode.enter()
			.append('g')
			.attr('class','axis axis-x');
		axisXNode.merge(axisXNodeEnter)
			.attr('transform',`translate(0,${h})`)
			.call(axisX);

		const axisYNode = plot
			.selectAll('.axis-y')
			.data([1]);
		const axisYNodeEnter = axisYNode.enter()
			.append('g')
			.attr('class','axis axis-y');
		axisYNode.merge(axisYNodeEnter)
			.call(axisY);

		//Mouse indicator
		let mouseIndicator = plot
			.selectAll('.mouse-indicator')
			.data([1]);
		mouseIndicator = mouseIndicator.enter()
			.append('line')
			.attr('class','mouse-indicator')
			.merge(mouseIndicator)
			.style('stroke-width','1px')
			.style('stroke','rgba(255,255,255,.5)');

		//Mouse target
		let mouseTarget = plot
			.selectAll('.mouse-target')
			.data([1]);
		mouseTarget = mouseTarget.enter()
			.append('rect')
			.attr('class','mouse-target')
			.merge(mouseTarget)
			.attr('width',w)
			.attr('height',h)
			.style('fill-opacity',.01)
			.on('mousemove', function(){
				const [x,y] = d3.mouse(this);

				mouseIndicator
					.attr('x1',x)
					.attr('x2',x)
					.attr('y1',h)
					.attr('y2',y);
					_dispatch.call('mousemove: x',null, scaleX.invert(x));
			})
			.on('mouseleave', () => {
				mouseIndicator
					.attr('x1',0)
					.attr('x2',0)
					.attr('y1',0)
					.attr('y2',0);
			})

	}

	//Getter/setter
	exports.thresholds = function(_){
		//_ is an array of thresholds
		if(typeof _ === 'undefined') return _thresholds;
		_thresholds = _;
		return this;
	}

	exports.domain = function(_){
		if(typeof _ == 'undefined') return _domain;
		_domain = _;
		return this;
	}

	exports.value = function(fn){
		if(typeof fn ==='undefined') return _value;
		_value = fn;
		return this;
	}

	exports.tickX = function(_){
		if(typeof _ ==='undefined') return _tickX;
		_tickX = _;
		return this;
	}

	exports.tickY = function(_){
		if(typeof _ ==='undefined') return _tickY;
		_tickY = _;
		return this;
	}

	exports.tickXFormat = function(fn){
		if(typeof fn ==='undefined') return _tickXFormat;
		_tickXFormat = fn;
		return this;
	}

	exports.margin = function(_){

	}

	exports.maxY = function(_){
		if(typeof _ === 'undefined') return _maxY;
		_maxY = _;
		return this;
	}

	exports.on = function(eventType, cb){
		//eventType : string of event Type
		//cb: function

		_dispatch.on(eventType, cb);
		return this;
	}

	return exports;
}

//Default export (only one per module .js file)
export default Histogram;

//Named export (multiples allowed)
export const timeline = Histogram()
	.domain([new Date(2013,0,1), new Date(2013,11,31)])
	.value(d => d.t0)
	.thresholds(d3.timeMonth.range(new Date(2013,0,1), new Date(2013,11,31), 1))
	.tickXFormat(d => {
		return (new Date(d)).toUTCString();
	})
	.tickX(2);

export const activityHistogram = Histogram()
	.thresholds(d3.range(0,24,.5))
	.domain([0,24])
	.value(d => d.time_of_day0)
	.tickXFormat(d => {
		const time = +d;
		const hour = Math.floor(time);
		let min = Math.round((time-hour)*60);
		min = String(min).length === 1? "0"+ min : min;
		return `${hour}:${min}`
	})
	.maxY(1000);
