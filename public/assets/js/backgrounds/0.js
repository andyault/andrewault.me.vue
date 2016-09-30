//conway's game of life

//parent settings
BG.col = {
	fg: 	'#FFF',
	acc: 	'#B96',
	bg: {
		hue: 0,
		sat: 0,
		val: 0
	}
}

//global
let scene = {
	cellSize: 	16,
	padding: 	2, 
	drawGrid: 	true,
	thinkInt: 	100,
	fadeSpeed: 	4,

	lastThink: 	0,
	oldCells: 	{},
	cells: 		{}
}

BG.init = function(canvas) {
	this.onResize(canvas);

	let cw = Math.ceil(canvas.width / scene.cellSize);
	let ch = Math.ceil(canvas.height / scene.cellSize);

	//start off random cells
	for(let i = 1; i < (cw * ch) / 5; i++)
		scene.cells[Math.floor(Math.random() * cw * ch)] = true;
}

BG.onResize = function(canvas) {
	canvas.width 	= canvas.offsetWidth;
	canvas.height 	= canvas.offsetHeight;
}

BG.think = function(canvas, paused) {
	if(!paused) {
		if(Date.now() > scene.lastThink + scene.thinkInt) {
			let w = canvas.width;
			let h = canvas.height;

			let cw = Math.ceil(w / scene.cellSize);
			let ch = Math.ceil(h / scene.cellSize);

			//copy the old cells
			for(let i = 0; i < cw * ch; i++)
				if(scene.cells[i])
					scene.oldCells[i] = 1;
				else 
					scene.oldCells[i] = Math.max((scene.oldCells[i] || 0) - (1 / scene.thinkInt) * scene.fadeSpeed, 0); 

			//logic
			for(let i = 0; i < cw * ch; i++) {
				let cell = scene.oldCells[i];

				let neighbors = [
					scene.oldCells[i - cw - 1],
					scene.oldCells[i - cw],
					scene.oldCells[i - cw + 1],
					scene.oldCells[i - 1],
					scene.oldCells[i + 1],
					scene.oldCells[i + cw - 1],
					scene.oldCells[i + cw],
					scene.oldCells[i + cw + 1]
				];

				//found out how many neighbors we have 
				let count = 0;

				for(let j = 0; j < 8; j++)
					if(neighbors[j] == 1)
						count++;

				//following the rules
				if(cell == 1)
					if(count < 2 || count > 3)
						scene.cells[i] = undefined;
					else
						scene.cells[i] = true;
				else if(count == 3)
					scene.cells[i] = true;
			}

			scene.lastThink = Date.now();	
		}
	} else
		return true; //still draw
}

BG.draw = function(ctx) {
	//round our grid size up by 8
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	let cw 	= Math.ceil(w / scene.cellSize);
	let ch 	= Math.ceil(h / scene.cellSize);

	//draw grid lines
	if(scene.drawGrid) {
		ctx.fillStyle = '#444';

		for(let i = 1; i < cw; i++)
			ctx.fillRect(i * scene.cellSize, 0, 1, h);

		for(let j = 1; j < ch; j++)
			ctx.fillRect(0, j * scene.cellSize, w, 1);
	}

	//draw cells
	for(let i = 0; i < cw * ch; i++) {
		if(scene.cells[i] || scene.oldCells[i]) {
			let cx = i % cw;
			let cy = Math.floor(i / cw);

			if(scene.cells[i])
				ctx.fillStyle = '#fff';
			else if(scene.oldCells[i])
				ctx.fillStyle = 'hsl(145, 50%, ' + (scene.oldCells[i] * 40) + '%)';

			ctx.fillRect(
				cx * scene.cellSize + scene.padding + 1,
				cy * scene.cellSize + scene.padding + 1,
				scene.cellSize - scene.padding * 2 - 1,
				scene.cellSize - scene.padding * 2 - 1
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
	let cx = Math.floor(mx / scene.cellSize);
	let cy = Math.floor(my / scene.cellSize);

	let id = cy * Math.ceil(canvas.width / scene.cellSize) + cx;

	if(mDown)
		scene.cells[id] = true;
	else
		scene.oldCells[id] = Math.max(scene.oldCells[id], 0.5);
}
