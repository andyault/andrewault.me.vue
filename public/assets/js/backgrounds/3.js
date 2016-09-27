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
	tileSize: 	48
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
	let h = ctx.canvas.height;

	let ts = scene.tileSize;
	let ts2 = scene.tileSize / 2;
	let ts4 = scene.tileSize / 4;
	let th = scene.tileSize * 7 / 8;

	let numRows = Math.ceil(h / th);
	let numCols = Math.ceil(w / ts);

	for(let j = -(numRows / 2); j < numRows * 1.5; j++) {
		let y = j * th;

		for(let i = 0; i < numCols + 1; i++) {
			//alternating rows
			let ix = (j % 2 == 0) ? i : i + 0.5;

			let x = ix * ts;

			//distance to center
			let d = Math.floor(Math.sqrt(
				Math.pow(ix - Math.floor(numCols / 2), 2) + 
				Math.pow(j - Math.floor(numRows / 2), 2)
			) + 0.5);

			let z = Math.cos(
				Date.now() / 500 + 
				d / 3
			) * ((numCols / 2) - d) * 10;

			//top
			ctx.beginPath();
			ctx.fillStyle = 'hsl(' + (d / 36) * 360 + ', 60%, 60%)';
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

			//debug
			/* ctx.fillStyle = '#000';
			ctx.font = 'sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(i + ', ' + j, x, y + z - 4);
			ctx.fillText(Math.floor(d * 100) / 100, x, y + z + 6); */
			
		}
	}

	//return true;
}