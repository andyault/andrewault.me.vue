//webgl mode7 scrolling
//yeah I used a tutorial, call a cop

BG = {
	col: {
		fg: 	'#333',
		acc: 	'#FFB8F1',
		bg: {
			hue: 0,
			sat: 0,
			val: 97
		}
	},

	context: 	'webgl',
	dependencies: [
		'sylvester.js',
		'glUtils.js'
	] 	
}

//webgl psuedo-global
let scene = {
	buffers: 	{},
	vertices: 	{},
	colors: 	{},
	shaders: 	{},
	shaderSrc: 	{},
	mvMatrix: 	null,

	init(gl) {
		//init buffers and shaders
		let err = 
			this.initBuffers(gl) ||
			this.initShaders(gl);

		if(err)
			return console.log('error: \n ', err.replace('\n', '\n  '));

		gl.clearColor(0.0, 0.0, 0.0, 1.0); 	//set clear color
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST); 			//enable depth testing
		gl.depthFunc(gl.LEQUAL); 			//near to far
	},

	initBuffers(gl) {
		this.buffers.square = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.square);

		this.vertices.square = [
			 1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
			 1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices.square), gl.STATIC_DRAW);

		//colors are separate?
		this.buffers.squareColors = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.squareColors);

		this.colors.square = [
			1.0, 1.0, 1.0, 1.0,
			1.0, 0.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,
			0.0, 0.0, 1.0, 1.0
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors.square), gl.STATIC_DRAW);
	},

	initShaders(gl) {
		//compile shaders
		for(let type of ['vertex', 'fragment']) {
			//hacky 
			let glType = gl[type.toUpperCase() + '_SHADER'];

			if(!glType) continue;

			//declare shader
			let shader = this.shaders[type] = gl.createShader(glType);
			gl.shaderSource(shader, this.shaderSrc[type]);
			gl.compileShader(shader);

			//make sure it compiled
			if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				let err = gl.getShaderInfoLog(shader);

				gl.deleteShader(shader);

				return type + ': \n  ' + err.replace('\n', '\n  ');
			}
		}

		//weird
		this.shaderProgram = gl.createProgram();

		gl.attachShader(this.shaderProgram, this.shaders.vertex);
		gl.attachShader(this.shaderProgram, this.shaders.fragment);

		gl.linkProgram(this.shaderProgram);

		//make sure it linked
		if(!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS))
			return 'unable to link shader program';

		gl.useProgram(this.shaderProgram);

		this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
		gl.enableVertexAttribArray(this.vertexPositionAttribute);

		this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, 'aVertexColor');
		gl.enableVertexAttribArray(this.vertexColorAttribute);
	},

	draw(gl) {
		let w = gl.canvas.width;
		let h = gl.canvas.height;

		gl.viewport(0, 0, w, h);

		//clear
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//set perspective
		this.pMatrix = makePerspective(45, w / h, 0.1, 100.0);

		//reset our main matrix
		this.mvMatrix = Matrix.I(4);

		//fun stuff
		this.mvMatrix = this.mvMatrix.x( 	//mult
			Matrix.Translation( 			//by a matrix
				$V( 						//???
					[-0.0, 0.0, -6.0] 		//translation matrix
				)
			).ensure4x4() 					//???
		);

		//send our vertices to the shader
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.square);
		gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		//and our colors
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.squareColors);
		gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

		//set uniforms
		gl.uniformMatrix4fv(
			gl.getUniformLocation(
				this.shaderProgram,
				'uPMatrix'
			),
			false,
			new Float32Array(this.pMatrix.flatten())
		);

		gl.uniformMatrix4fv(
			gl.getUniformLocation(
				this.shaderProgram,
				'uMVMatrix'
			),
			false,
			new Float32Array(this.mvMatrix.flatten())
		);

		//here we go :)
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}

scene.shaderSrc.fragment = `
	varying lowp vec4 vColor;

	void main(void) {
		gl_FragColor = vColor;
	}
`;

scene.shaderSrc.vertex = `
	attribute vec3 aVertexPosition;
	attribute vec4 aVertexColor;

	uniform mat4 uMVMatrix;
	uniform mat4 uPMatrix;

	varying lowp vec4 vColor;

	void main(void) {
 		gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
 		vColor = aVertexColor;
	}
`;

BG.init = function(canvas, context) {
	this.onResize(canvas, context);

	//webgl init
	scene.init(context);
}

BG.onResize = function(canvas, context) {
	canvas.width 	= canvas.offsetWidth; //Math.ceil(canvas.offsetWidth / 4);
	canvas.height 	= canvas.offsetHeight; //Math.ceil(canvas.offsetHeight / 4);
}

BG.draw = function(gl) {
	scene.draw(gl);
}