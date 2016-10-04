'use strict';BG={col:{fg:'#333',acc:'#FFB8F1',bg:{hue:0,sat:0,val:97}},context:'webgl',dependencies:['sylvester.js','glUtils.js']};var scene={buffers:{},vertices:{},colors:{},shaders:{},shaderSrc:{},mvMatrix:null,init:function init(gl){var err=this.initBuffers(gl)||this.initShaders(gl);if(err)return console.log('error: \n ',err.replace('\n','\n  '));gl.clearColor(0,0,0,1);gl.clearDepth(1);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL)},initBuffers:function initBuffers(gl){this.buffers.square=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.square);this.vertices.square=[1,1,0,-1,1,0,1,-1,0,-1,-1,0];gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.vertices.square),gl.STATIC_DRAW);this.buffers.squareColors=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.squareColors);this.colors.square=[1,1,1,1,1,0,0,1,0,1,0,1,0,0,1,1];gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.colors.square),gl.STATIC_DRAW)},initShaders:function initShaders(gl){var _arr=['vertex','fragment'];for(var _i=0;_i<_arr.length;_i++){var type=_arr[_i];var glType=gl[type.toUpperCase()+'_SHADER'];if(!glType)continue;var shader=this.shaders[type]=gl.createShader(glType);gl.shaderSource(shader,this.shaderSrc[type]);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){var err=gl.getShaderInfoLog(shader);gl.deleteShader(shader);return type+': \n  '+err.replace('\n','\n  ')}}this.shaderProgram=gl.createProgram();gl.attachShader(this.shaderProgram,this.shaders.vertex);gl.attachShader(this.shaderProgram,this.shaders.fragment);gl.linkProgram(this.shaderProgram);if(!gl.getProgramParameter(this.shaderProgram,gl.LINK_STATUS))return'unable to link shader program';gl.useProgram(this.shaderProgram);this.vertexPositionAttribute=gl.getAttribLocation(this.shaderProgram,'aVertexPosition');gl.enableVertexAttribArray(this.vertexPositionAttribute);this.vertexColorAttribute=gl.getAttribLocation(this.shaderProgram,'aVertexColor');gl.enableVertexAttribArray(this.vertexColorAttribute)},draw:function draw(gl){var w=gl.canvas.width;var h=gl.canvas.height;gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);this.pMatrix=makePerspective(45,w/h,0.1,100);this.mvMatrix=Matrix.I(4);this.mvMatrix=this.mvMatrix.x(Matrix.Translation($V([-0,0,-6])).ensure4x4());gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.square);gl.vertexAttribPointer(this.vertexPositionAttribute,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.squareColors);gl.vertexAttribPointer(this.vertexColorAttribute,4,gl.FLOAT,false,0,0);gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram,'uPMatrix'),false,new Float32Array(this.pMatrix.flatten()));gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram,'uMVMatrix'),false,new Float32Array(this.mvMatrix.flatten()));gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}};scene.shaderSrc.fragment='\n\tvarying lowp vec4 vColor;\n\n\tvoid main(void) {\n\t\tgl_FragColor = vColor;\n\t}\n';scene.shaderSrc.vertex='\n\tattribute vec3 aVertexPosition;\n\tattribute vec4 aVertexColor;\n\n\tuniform mat4 uMVMatrix;\n\tuniform mat4 uPMatrix;\n\n\tvarying lowp vec4 vColor;\n\n\tvoid main(void) {\n \t\tgl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n \t\tvColor = aVertexColor;\n\t}\n';BG.init=function(canvas,context){this.onResize(canvas,context);scene.init(context)};BG.onResize=function(canvas,context){canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight};BG.draw=function(gl){scene.draw(gl)};