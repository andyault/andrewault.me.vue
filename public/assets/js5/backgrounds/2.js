'use strict';BG.col={fg:'#FFF',acc:'hsl(0, 60%, 60%)',bg:{hue:0,sat:0,val:20}};var scene={thinkInt:1/10000,wasResized:false,direction:1,curPos:-1,lastThink:0,cells:{},oldCells:{},states:[-1,1,1,-1]};BG.init=function(canvas){this.onResize(canvas);for(var i=0;i<360;i++){scene.states[i]=Math.floor(Math.random()*2)*2-1}scene.curPos=canvas.width*canvas.height/2;if(scene.curPos%canvas.width==0)scene.curPos+=canvas.width/2;scene.curPos=Math.floor(scene.curPos);var ctx=canvas.getContext('2d');ctx.fillStyle='hsl(0, 60%, 60%)';ctx.fillRect(0,0,canvas.width,canvas.height)};BG.onResize=function(canvas){canvas.width=canvas.offsetWidth/6;canvas.height=canvas.offsetHeight/6;scene.wasResized=true};BG.think=function(canvas,paused){if(!paused){if(Date.now()>scene.lastThink+scene.thinkInt){var w=canvas.width;var h=canvas.height;for(var i=0;i<w*h;i++){scene.oldCells[i]=scene.cells[i]}for(var _i=0;_i<Math.ceil(1/scene.thinkInt);_i++){var curState=scene.cells[scene.curPos]||0;scene.cells[scene.curPos]=++curState%scene.states.length;if(!scene.cells[scene.curPos])scene.cells[scene.curPos]=undefined;var nextCell=void 0;switch(scene.direction){case 0:nextCell=scene.curPos-w;break;case 1:nextCell=scene.curPos+1;break;case 2:nextCell=scene.curPos+w;break;case 3:nextCell=scene.curPos-1;break;}if(nextCell>w*h)nextCell=nextCell%(w*h);if(nextCell<0)nextCell=nextCell+w*h;scene.curPos=nextCell;scene.direction+=scene.states[scene.cells[nextCell]||0];if(scene.direction>3)scene.direction=0;else if(scene.direction<0)scene.direction=3}scene.lastThink=Date.now()}}};BG.draw=function(ctx){var w=ctx.canvas.width;var h=ctx.canvas.height;for(var i=0;i<w*h;i++){var cell=scene.cells[i];if(cell!=scene.oldCells[i]){var cx=i%w;var cy=Math.floor(i/w);var hue=cell*(360/scene.states.length);ctx.fillStyle='hsl('+hue+', 60%, 60%)';ctx.fillRect(cx,cy,1,1)}}};