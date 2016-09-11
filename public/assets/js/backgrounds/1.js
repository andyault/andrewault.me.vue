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

//weird pseudo global
let ant = {
	cellSize: 	2,
	thinkInt: 	0,
	drawAnt: 	true,

	direction: 	1, //trbl
	curPos: 	-1,

	cells: 		{},
	newCells: 	{},
	states: 	[1, -1]
}

BG.init = function(canvas) {
	BG.onResize(canvas);

	let cw = Math.ceil(canvas.width / ant.cellSize);
	let ch = Math.ceil(canvas.height / ant.cellSize);

	let ctx = canvas.getContext('2d');

	//translate to center
	ctx.translate(
		-(cw - (canvas.width / ant.cellSize)) / 2,
		-(ch - (canvas.height / ant.cellSize)) / 2
	);

	//random states
	for(let i = 2; i < Math.floor(Math.random() * 8); i++)
		ant.states[i] = Math.floor(Math.random() * 2) * 2 - 1;

	//start the ant in the center
	ant.curPos = cw * ch / 2;
	if((ant.curPos % cw) == 0) ant.curPos += cw / 2;

	ant.curPos = Math.floor(ant.curPos);
}

BG.onResize = function(canvas) {
	canvas.width 	= Math.ceil(canvas.offsetWidth / 6);
	canvas.height 	= Math.ceil(canvas.offsetHeight / 6);
}

let lastThink = 0;

BG.think = function(cw, ch) {
	let curState = ant.cells[ant.curPos] || 0;

	ant.cells[ant.curPos] = (++curState % ant.states.length);

	if(!ant.cells[ant.curPos]) ant.cells[ant.curPos] = undefined;

	let nextCell;

	//see which way we're facing
	switch(ant.direction) {
		case 0:
			nextCell = ant.curPos - cw;
			break;
		case 1:
			nextCell = ant.curPos + 1;
			break;
		case 2:
			nextCell = ant.curPos + cw;
			break;
		case 3:
			nextCell = ant.curPos - 1;
			break;
	}

	if(nextCell > cw * ch)
		nextCell = nextCell % (cw * ch);

	if(nextCell < 0)
		nextCell = nextCell + cw * ch;

	//move to our new cell
	ant.curPos = nextCell;

	//turn
	ant.direction += ant.states[ant.cells[nextCell] || 0];

	if(ant.direction > 3)
		ant.direction = 0;
	else if(ant.direction < 0)
		ant.direction = 3;

	//done :)
	lastThink = Date.now();
}

BG.draw = function(ctx) {
	//round our grid size up by 8
	let cw 	= Math.ceil(ctx.canvas.width / ant.cellSize);
	let ch 	= Math.ceil(ctx.canvas.height / ant.cellSize);

	let w = cw * ant.cellSize;
	let h = ch * ant.cellSize;

	//cell logic
	if(Date.now() > lastThink + ant.thinkInt) {
		//think
		for(let i = 0; i < 25; i++) 
			this.think(cw, ch);

		//clear
		ctx.clearRect(0, 0, w, h);

		//not sure if this does anything
		ctx.imageSmoothingEnabled = 
		ctx.mozImageSmoothingEnabled =
		ctx.webkitImageSmoothingEnabled = false;

		//draw cells
		for(let i = 0; i < cw * ch; i++) {
			let cell = ant.cells[i];

			if(cell) {
				let cx = i % cw;
				let cy = Math.floor(i / cw);

				let hue = cell * (360 / ant.states.length);

				ctx.fillStyle = 'hsl(' + hue + ', 60%, 60%)';
				ctx.fillRect(cx * ant.cellSize, cy * ant.cellSize, 1, 1);

				ctx.fillStyle = 'hsl(' + hue + ', 60%, 35%)';
				ctx.fillRect(cx * ant.cellSize, cy * ant.cellSize + 1, 1, 1);
			}
		}

		//draw ant
		if(ant.drawAnt) {
			let antx = ant.curPos % cw;
			let anty = Math.floor(ant.curPos / cw);

			ctx.fillStyle = this.col.acc;
			ctx.fillRect(antx * ant.cellSize, anty * ant.cellSize, 1, 1);
		}
	}

	//ctx.font = '4px sans-serif';
	//ctx.fillStyle = '#fff';
	//ctx.fillText(ant.states.map((a) => { return a < 0 ? 'L' : 'R' }).join(''), 0, 4);
}