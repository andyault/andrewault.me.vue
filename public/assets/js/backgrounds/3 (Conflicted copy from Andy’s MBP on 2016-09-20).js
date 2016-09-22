//pseudo 3d mode7

BG.col = {
	fg: 	'#333',
	acc: 	'#FFB8F1',
	bg: {
		hue: 0,
		sat: 0,
		val: 97
	}
}

//weird pseudo global
let scene = {
	textures: 	[
		'm7_map.png'
	],
	images: 	[],

	camZ: 		-64,
}

BG.init = function(canvas) {
	this.onResize(canvas);

	this.initTextures();
}

BG.initTextures = function() {
	for(let i = 0; i < scene.textures.length; i++) {
		scene.images[i] = {}
		let img = scene.images[i].img = new Image();

		img.src = 'assets/img/' + scene.textures[i];

		img.onload = function() {
			scene.images[i].w = img.width;
			scene.images[i].h = img.height;
		}
	}
}

BG.onResize = function(canvas) {
	canvas.width 	= canvas.offsetWidth;
	canvas.height 	= canvas.offsetHeight;
}

BG.think = function(w, h) {
}

BG.draw = function(ctx) {
	//round our grid size up by 8
	let w = ctx.canvas.width;
	let h = ctx.canvas.height;

	let w2 = Math.ceil(w / 2);
	let h2 = Math.ceil(h / 2);

	let rw = w;

	let img = scene.images[0];

	for(let i = 0; i < h2; i++) {
		let slice 	= (1 / h2);
		let frac 	= i * slice;

		/*
		//slice
		let sx = 0;
		let sy = frac * img.h / 2;

		let sw = img.w;
		let sh = 1;

		//drawn
		let dx = w / 2 - rw / 2;
		let dy = h2 + i;

		let dw = rw;
		let dh = 1;

		ctx.drawImage(img.img, sx, sy, sw, sh, dx, dy, dw, dh); */

		let yWorld = scene.camZ;
		let z = yWorld / i;

		ctx.fillStyle = (z % 2 == 0) ? '#fff' : '#ccc';
		ctx.fillRect(0, h - i, w, 1);
	}

	if(img.h)
		return true;
}