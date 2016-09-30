//langton's ant/turmites

BG.col = {
	fg: 	'#FFF',
	acc: 	'#F00',
	bg: {
		hue: 0,
		sat: 0,
		val: 20
	}
}

let scene = {
	cellSize: 	2,
	thinkInt: 	1 / 25,
	drawAnt: 	true,

	direction: 	1, //trbl
	curPos: 	-1,

	lastThink: 	0,
	cells: 		{},
	newCells: 	{},
	states: 	[1, -1]
}

BG.init = function(canvas) {
	this.onResize(canvas);

	let cw = Math.ceil(canvas.width / scene.cellSize);
	let ch = Math.ceil(canvas.height / scene.cellSize);

	let ctx = canvas.getContext('2d');

	//translate to center
	ctx.translate(
		-(cw - (canvas.width / scene.cellSize)) / 2,
		-(ch - (canvas.height / scene.cellSize)) / 2
	);

	//random states
	for(let i = 2; i < Math.floor(Math.random() * 8); i++)
		scene.states[i] = Math.floor(Math.random() * 2) * 2 - 1;

	//start the ant in the center
	scene.curPos = cw * ch / 2;
	if((scene.curPos % cw) == 0) scene.curPos += cw / 2;

	scene.curPos = Math.floor(scene.curPos);
}

BG.onResize = function(canvas) {
	canvas.width 	= Math.ceil(canvas.offsetWidth / 6);
	canvas.height 	= Math.ceil(canvas.offsetHeight / 6);
}

BG.think = function(canvas, paused) {
	if(!paused) {
		if(Date.now() > scene.lastThink + scene.thinkInt) {
			let cw = Math.ceil(canvas.width / scene.cellSize);
			let ch = Math.ceil(canvas.height / scene.cellSize);

			for(let i = 0; i < Math.ceil(1 / scene.thinkInt); i++) {
				let curState = scene.cells[scene.curPos] || 0;

				scene.cells[scene.curPos] = (++curState % scene.states.length);

				if(!scene.cells[scene.curPos]) scene.cells[scene.curPos] = undefined;

				let nextCell;

				//see which way we're facing
				switch(scene.direction) {
					case 0:
						nextCell = scene.curPos - cw;
						break;
					case 1:
						nextCell = scene.curPos + 1;
						break;
					case 2:
						nextCell = scene.curPos + cw;
						break;
					case 3:
						nextCell = scene.curPos - 1;
						break;
				}

				if(nextCell > cw * ch)
					nextCell = nextCell % (cw * ch);

				if(nextCell < 0)
					nextCell = nextCell + cw * ch;

				//move to our new cell
				scene.curPos = nextCell;

				//turn
				scene.direction += scene.states[scene.cells[nextCell] || 0];

				if(scene.direction > 3)
					scene.direction = 0;
				else if(scene.direction < 0)
					scene.direction = 3;
			}

			//done :)
			scene.lastThink = Date.now();
		}
	}
}

BG.draw = function(ctx) {
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	let cw 	= Math.ceil(w / scene.cellSize);
	let ch 	= Math.ceil(h / scene.cellSize);

	//clear
	ctx.clearRect(0, 0, w, h);

	//draw cells
	for(let i = 0; i < cw * ch; i++) {
		let cell = scene.cells[i];

		if(cell) {
			let cx = i % cw;
			let cy = Math.floor(i / cw);

			let hue = cell * (360 / scene.states.length);

			ctx.fillStyle = 'hsl(' + hue + ', 60%, 60%)';
			ctx.fillRect(cx * scene.cellSize, cy * scene.cellSize, 1, 1);

			ctx.fillStyle = 'hsl(' + hue + ', 60%, 35%)';
			ctx.fillRect(cx * scene.cellSize, cy * scene.cellSize + 1, 1, 1);
		}
	}

	//draw ant
	if(scene.drawAnt) {
		let antx = scene.curPos % cw;
		let anty = Math.floor(scene.curPos / cw);

		ctx.fillStyle = this.col.acc;
		ctx.fillRect(antx * scene.cellSize, anty * scene.cellSize, 1, 1);
	}
}