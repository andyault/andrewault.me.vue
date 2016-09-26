//isometric illusion wave thing

BG.col = {
	fg: 	'#333',
	acc: 	'#FFB8F1',
	bg: {
		hue: 0,
		sat: 0,
		val: 97
	}
}

let scene = {
	tileSize: 	64
}

BG.init = function(canvas) {
	this.onResize(canvas);
}

BG.onResize = function(canvas) {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
}

BG.draw = function(ctx) {
	let w = ctx.canvas.width;
	let h = cxt.canvas.height;

	for(let i = 0; i < w; i += tileSize) {
		ctx.beginPath();
		ctx.fillStyle = '#ccc';
		ctx.moveTo(i, tileSize / 4);
		ctx.lineTo(i + tileSize / 2, 0);
		ctx.lineTo(i + tileSize, tileSize / 4);
		ctx.lineTo(i + tileSize / 2, tileSize / 2);
		ctx.fill();
	}
}