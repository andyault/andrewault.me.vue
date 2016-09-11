//?

BG = {
	col: {
		fg: 	'#333',
		acc: 	'#FFB8F1',
		bg: {
			hue: 0,
			sat: 0,
			val: 97
		}
	},
	context: 'webgl'
}

BG.init = function(canvas) {
	BG.onResize(canvas);
}

BG.onResize = function(canvas) {
	canvas.width 	= canvas.offsetWidth / 4;
	canvas.height 	= canvas.offsetHeight / 4;

	let context = canvas.getContext('webgl');

	if(!context) context = canvas.getContext('experimental-webgl');

	if(context) context.viewport(0, 0, canvas.width, canvas.height);
}

BG.draw = function(ctx) {

}