//conway's game of life

BG.col = {
	fg: 	'#FFF',
	acc: 	'#B96',
	bg: {
		hue: 0,
		sat: 0,
		val: 20
	}
}

//weird pseudo global
let life = {
	cellSize: 	2,
	drawGrid: 	false,
	thinkInt: 	100,

	cells: {}
}

BG.init = function(canvas) {
	BG.onResize(canvas);

	let cw = Math.ceil(canvas.width / life.cellSize);
	let ch = Math.ceil(canvas.height / life.cellSize);

	let ctx = canvas.getContext('2d');

	//translate to center
	ctx.translate(
		-(cw - (canvas.width / life.cellSize)) / 2,
		-(ch - (canvas.height / life.cellSize)) / 2
	);

	//more settings

	//start off random cells
	for(let i = 1; i < (cw * ch) / 5; i++)
		life.cells[Math.floor(Math.random() * cw * ch)] = true;
}

BG.onResize = function(canvas) {
	canvas.width 	= Math.ceil(canvas.offsetWidth / 4);
	canvas.height 	= Math.ceil(canvas.offsetHeight / 4);
}

let lastThink = Date.now();

BG.draw = function(ctx) {
	//round our grid size up by 8
	let cw 	= Math.ceil(ctx.canvas.width / life.cellSize);
	let ch 	= Math.ceil(ctx.canvas.height / life.cellSize);

	let w = cw * life.cellSize;
	let h = ch * life.cellSize;

	//cell logic
	if(Date.now() > lastThink + life.thinkInt) {
		let newCells = {};

		for(let i = 0; i < cw * ch; i++) {
			let cell = life.cells[i];

			let neighbors = [
				life.cells[i - cw - 1],
				life.cells[i - cw],
				life.cells[i - cw + 1],
				life.cells[i - 1],
				life.cells[i + 1],
				life.cells[i + cw - 1],
				life.cells[i + cw],
				life.cells[i + cw + 1]
			];

			let count = 0;

			for(let j = 0; j < 8; j++) {
				if(neighbors[j]) {
					count++;
				}
			}

			if(cell)
				if(count < 2 || count > 3)
					newCells[i] = undefined;
				else
					newCells[i] = true;
			else if(count == 3)
				newCells[i] = true;
		}

		life.cells = newCells;

		lastThink = Date.now();

		//clear
		ctx.clearRect(0, 0, w, h);

		//not sure if this does anything
		ctx.imageSmoothingEnabled = 
		ctx.mozImageSmoothingEnabled =
		ctx.webkitImageSmoothingEnabled = false;

		ctx.fillStyle = 'hsl(0, 0%, 20%)';
		ctx.fillRect(0, 0, w, h);

		//draw grid lines
		if(life.drawGrid) {
			ctx.fillStyle = 'hsl(0, 0%, 24%)';

			for(let i = 1; i < cw; i++)
				ctx.fillRect(i * 8, 0, 1, h);

			for(let j = 1; j < ch; j++)
				ctx.fillRect(0, j * 8, w, 1);
		}

		//draw cells
		for(let i = 0; i < cw * ch; i++) {
			if(life.cells[i]) {
				let cx = i % cw;
				let cy = Math.floor(i / cw);

				ctx.fillStyle = 'hsl(0, 0%, 60%)';
				ctx.fillRect(cx * life.cellSize, cy * life.cellSize, 1, 1);

				ctx.fillStyle = 'hsl(0, 0%, 35%)';
				ctx.fillRect(cx * life.cellSize, cy * life.cellSize + 1, 1, 1);
			}
		}
	}
}