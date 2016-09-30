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
	tileSize: 	48,
	speed: 		-1 / 500,
	size: 		3 / 4,
	height: 	64,

	time: 		0,
	lastTime: 	0
}

BG.init = function(canvas) {
	this.onResize(canvas);
}

BG.onResize = function(canvas) {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;}

BG.think = function(canvas, paused) {
	let now = Date.now();

	if(!paused)
		scene.time += now - scene.lastTime;

	scene.lastTime = now;

	return true;
}

BG.draw = function(ctx) {
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	let ts 	= scene.tileSize;
	let ts2 = scene.tileSize / 2;
	let ts4 = scene.tileSize / 4;
	let th 	= scene.tileSize * 7 / 8;

	let numCols = Math.ceil((w / ts) / 2) * 2;
	let numRows = Math.ceil((h / th) / 2) * 2;

	//start negative so that the center tile is always center screen
	let nx = Math.ceil((w - numCols * ts) / 2);
	let ny = Math.ceil((h - numRows * th) / 2);

	for(let j = -2; j < numRows + 1; j++) {
		let y = ny + j * th;

		for(let i = 0; i < numCols + 1; i++) {
			let x = nx + i * ts;

			//draw odd rows off center
			//this is so trial and error it's not even funny
			if(j % 2 != (numRows / 2) % 2)
				x += ts2;

			//distance to center
			let d = Math.floor(Math.sqrt(
				Math.pow((x / ts) - ((w / ts) / 2), 2) +
				Math.pow((y / th) - ((h / th) / 2), 2)
			) + 0.5);

			//'z' - '3d' height
			let z = Math.cos(
				scene.time * scene.speed +
				d * scene.size
			) * scene.height;

			//high in the center, nothing by the outsides
			z *= 1.1 - (d / numCols * 2);

			//top
			ctx.beginPath();
			ctx.fillStyle = 'hsl(' + (d / numCols * 2) * 360 + ', 60%, 60%)';
			ctx.moveTo(x - ts2, y 			+ z);
			ctx.lineTo(x, 		y - ts4 	+ z);
			ctx.lineTo(x + ts2, y 			+ z);
			ctx.lineTo(x, 		y + ts4 	+ z);
			ctx.fill();

			//left
			ctx.beginPath();
			ctx.fillStyle = '#aaa';
			ctx.moveTo(x - ts2, y 			+ z);
			ctx.lineTo(x, 		y + ts4 	+ z);
			ctx.lineTo(x, 		h);
			ctx.lineTo(x - ts2, h);
			ctx.fill();

			//right
			ctx.beginPath();
			ctx.fillStyle = '#ccc';
			ctx.moveTo(x, 		y + ts4 	+ z);
			ctx.lineTo(x + ts2, y 			+ z);
			ctx.lineTo(x + ts2, h);
			ctx.lineTo(x, 		h);
			ctx.fill();
		}
	}
}