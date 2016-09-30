//langton's ant but cooler, weather-map looking thing

BG.col = {
	fg: 	'#FFF',
	acc: 	'hsl(0, 60%, 60%)',
	bg: {
		hue: 0,
		sat: 0,
		val: 20
	}
}

let scene = {
	thinkInt: 	1 / 10000,
	wasResized: false,

	direction: 	1, //trbl
	curPos: 	-1,

	lastThink: 	0,
	cells: 		{},
	oldCells: 	{},
	states: 	[-1, 1, 1, -1]
}

BG.init = function(canvas) {
	this.onResize(canvas);

	//change states
	for(let i = 0; i < 360; i++)
		scene.states[i] = Math.floor(Math.random() * 2) * 2 - 1;

	//start the ant in the center
	scene.curPos = canvas.width * canvas.height / 2;
	if((scene.curPos % canvas.width) == 0) scene.curPos += canvas.width / 2;

	scene.curPos = Math.floor(scene.curPos);

	//start with a state 1 background
	let ctx = canvas.getContext('2d');

	ctx.fillStyle = 'hsl(0, 60%, 60%)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

BG.onResize = function(canvas) {
	canvas.width 	= canvas.offsetWidth / 6;
	canvas.height 	= canvas.offsetHeight / 6;

	scene.wasResized = true;
}

BG.think = function(canvas, paused) {
	if(!paused) {
		if(Date.now() > scene.lastThink + scene.thinkInt) {
			let w = canvas.width;
			let h = canvas.height;

			for(let i = 0; i < w * h; i++)
				scene.oldCells[i] = scene.cells[i];

			for(let i = 0; i < Math.ceil(1 / scene.thinkInt); i++) {
				let curState = scene.cells[scene.curPos] || 0;

				scene.cells[scene.curPos] = (++curState % scene.states.length);

				if(!scene.cells[scene.curPos]) scene.cells[scene.curPos] = undefined;

				let nextCell;

				//see which way we're facing
				switch(scene.direction) {
					case 0:
						nextCell = scene.curPos - w;
						break;
					case 1:
						nextCell = scene.curPos + 1;
						break;
					case 2:
						nextCell = scene.curPos + w;
						break;
					case 3:
						nextCell = scene.curPos - 1;
						break;
				}

				if(nextCell > w * h)
					nextCell = nextCell % (w * h);

				if(nextCell < 0)
					nextCell = nextCell + w * h;

				//move to our new cell
				scene.curPos = nextCell;

				//turn
				scene.direction += scene.states[scene.cells[nextCell] || 0];

				if(scene.direction > 3)
					scene.direction = 0;
				else if(scene.direction < 0)
					scene.direction = 3;
			}

			scene.lastThink = Date.now();
		}
	}
}

BG.draw = function(ctx) {
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	//draw cells (but only if they've changed)
	for(let i = 0; i < w * h; i++) {
		let cell = scene.cells[i];

		if(cell != scene.oldCells[i]) {
			let cx = i % w;
			let cy = Math.floor(i / w);

			let hue = cell * (360 / scene.states.length);

			ctx.fillStyle = 'hsl(' + hue + ', 60%, 60%)';
			ctx.fillRect(cx, cy, 1, 1);
		}
	}
}