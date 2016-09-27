//conway's game of life

BG.col = {
	fg: 	'#FFF',
	acc: 	'#B96',
	bg: {
		hue: 0,
		sat: 0,
		val: 0
	}
}

//weird pseudo global
let life = {
	cellSize: 	16,
	padding: 	2, 
	drawGrid: 	true,
	thinkInt: 	100,
	fadeSpeed: 	4,

	oldCells: 	{},
	cells: 		{}
}

BG.init = function(canvas) {
	this.onResize(canvas);

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
	canvas.width 	= canvas.offsetWidth;
	canvas.height 	= canvas.offsetHeight;
}

let lastThink = Date.now();

BG.think = function(canvas, paused) {
	if(!paused) {
		if(Date.now() > lastThink + life.thinkInt) {
			let w = canvas.width;
			let h = canvas.height;

			let cw = Math.ceil(w / life.cellSize);
			let ch = Math.ceil(h / life.cellSize);

			//copy the old cells
			for(let i = 0; i < cw * ch; i++)
				if(life.cells[i])
					life.oldCells[i] = 1;
				else 
					life.oldCells[i] = Math.max((life.oldCells[i] || 0) - (1 / life.thinkInt) * life.fadeSpeed, 0); 

			//logic
			for(let i = 0; i < cw * ch; i++) {
				let cell = life.oldCells[i];

				let neighbors = [
					life.oldCells[i - cw - 1],
					life.oldCells[i - cw],
					life.oldCells[i - cw + 1],
					life.oldCells[i - 1],
					life.oldCells[i + 1],
					life.oldCells[i + cw - 1],
					life.oldCells[i + cw],
					life.oldCells[i + cw + 1]
				];

				//found out how many neighbors we have 
				let count = 0;

				for(let j = 0; j < 8; j++)
					if(neighbors[j] == 1)
						count++;

				//following the rules
				if(cell == 1)
					if(count < 2 || count > 3)
						life.cells[i] = undefined;
					else
						life.cells[i] = true;
				else if(count == 3)
					life.cells[i] = true;
			}

			lastThink = Date.now();	
		}
	} else
		return true; //still draw
}

BG.draw = function(ctx) {
	//round our grid size up by 8
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	let cw 	= Math.ceil(w / life.cellSize);
	let ch 	= Math.ceil(h / life.cellSize);

	//draw grid lines
	if(life.drawGrid) {
		ctx.fillStyle = '#444';

		for(let i = 1; i < cw; i++)
			ctx.fillRect(i * life.cellSize, 0, 1, h);

		for(let j = 1; j < ch; j++)
			ctx.fillRect(0, j * life.cellSize, w, 1);
	}

	//draw cells
	for(let i = 0; i < cw * ch; i++) {
		if(life.cells[i] || life.oldCells[i]) {
			let cx = i % cw;
			let cy = Math.floor(i / cw);

			if(life.cells[i])
				ctx.fillStyle = '#fff';
			else if(life.oldCells[i])
				ctx.fillStyle = 'hsl(145, 50%, ' + (life.oldCells[i] * 40) + '%)';

			ctx.fillRect(
				cx * life.cellSize + life.padding + 1,
				cy * life.cellSize + life.padding + 1,
				life.cellSize - life.padding * 2 - 1,
				life.cellSize - life.padding * 2 - 1
			);
		}
	}
}

//mouse interaction
let mDown = false;

BG.onMouseDown = function(canvas, mx, my) {
	mDown = true;

	this.onMouseMove(canvas, mx, my);
}

BG.onMouseUp = function() { mDown = false; }

BG.onMouseMove = function(canvas, mx, my) {
	let cx = Math.floor(mx / life.cellSize);
	let cy = Math.floor(my / life.cellSize);

	let id = cy * Math.ceil(canvas.width / life.cellSize) + cx;

	if(mDown)
		life.cells[id] = true;
	else
		life.oldCells[id] = Math.max(life.oldCells[id], 0.5);
}
