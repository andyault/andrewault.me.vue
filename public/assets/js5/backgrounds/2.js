'use strict';//langton's ant but cooler, weather-map looking thing
BG.col={fg:'#FFF',acc:'hsl(0, 60%, 60%)',bg:{hue:0,sat:0,val:20}};//weird pseudo global
var ant={thinkCalls:10000,wasResized:false,direction:1,//trbl
curPos:-1,cells:{},newCells:{},states:[-1,1,1,-1]};BG.init=function(canvas){this.onResize(canvas);//change states
for(var i=0;i<360;i++){ant.states[i]=Math.floor(Math.random()*2)*2-1}//start the ant in the center
ant.curPos=canvas.width*canvas.height/2;if(ant.curPos%canvas.width==0)ant.curPos+=canvas.width/2;ant.curPos=Math.floor(ant.curPos);//start with a state 1 background
var ctx=canvas.getContext('2d');ctx.fillStyle='hsl(0, 60%, 60%)';ctx.fillRect(0,0,canvas.width,canvas.height)};BG.onResize=function(canvas){canvas.width=canvas.offsetWidth/6;canvas.height=canvas.offsetHeight/6;ant.wasResized=true};BG.think=function(w,h){var curState=ant.cells[ant.curPos]||0;ant.cells[ant.curPos]=++curState%ant.states.length;if(!ant.cells[ant.curPos])ant.cells[ant.curPos]=undefined;var nextCell=void 0;//see which way we're facing
switch(ant.direction){case 0:nextCell=ant.curPos-w;break;case 1:nextCell=ant.curPos+1;break;case 2:nextCell=ant.curPos+w;break;case 3:nextCell=ant.curPos-1;break;}if(nextCell>w*h)nextCell=nextCell%(w*h);if(nextCell<0)nextCell=nextCell+w*h;//move to our new cell
ant.curPos=nextCell;//turn
ant.direction+=ant.states[ant.cells[nextCell]||0];if(ant.direction>3)ant.direction=0;else if(ant.direction<0)ant.direction=3};BG.draw=function(ctx){//round our grid size up by 8
var w=ctx.canvas.width;var h=ctx.canvas.height;//get a copy of our old cells
var oldCells={};if(!ant.wasResized){for(var i=0;i<w*h;i++){oldCells[i]=ant.cells[i]}}else ant.wasResized=false;//think
for(var _i=0;_i<ant.thinkCalls;_i++){this.think(w,h)}//not sure if this does anything
ctx.imageSmoothingEnabled=ctx.mozImageSmoothingEnabled=ctx.webkitImageSmoothingEnabled=false;//draw cells (but only if they've changed)
for(var _i2=0;_i2<w*h;_i2++){var cell=ant.cells[_i2];if(cell!=oldCells[_i2]){var cx=_i2%w;var cy=Math.floor(_i2/w);var hue=cell*(360/ant.states.length);ctx.fillStyle='hsl('+hue+', 60%, 60%)';ctx.fillRect(cx,cy,1,1)}}};