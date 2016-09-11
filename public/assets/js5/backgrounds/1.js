'use strict';BG.col={fg:'#FFF',acc:'#F00',bg:{hue:0,sat:0,val:20}};var ant={cellSize:2,thinkInt:0,drawAnt:true,direction:1,curPos:-1,cells:{},newCells:{},states:[1,-1]};BG.init=function(canvas){BG.onResize(canvas);var cw=Math.ceil(canvas.width/ant.cellSize);var ch=Math.ceil(canvas.height/ant.cellSize);var ctx=canvas.getContext('2d');ctx.translate(-(cw-canvas.width/ant.cellSize)/2,-(ch-canvas.height/ant.cellSize)/2);for(var i=2;i<Math.floor(Math.random()*8);i++){ant.states[i]=Math.floor(Math.random()*2)*2-1}ant.curPos=cw*ch/2;if(ant.curPos%cw==0)ant.curPos+=cw/2;ant.curPos=Math.floor(ant.curPos)};BG.onResize=function(canvas){canvas.width=Math.ceil(canvas.offsetWidth/6);canvas.height=Math.ceil(canvas.offsetHeight/6)};var lastThink=0;BG.think=function(cw,ch){var curState=ant.cells[ant.curPos]||0;ant.cells[ant.curPos]=++curState%ant.states.length;if(!ant.cells[ant.curPos])ant.cells[ant.curPos]=undefined;var nextCell=void 0;switch(ant.direction){case 0:nextCell=ant.curPos-cw;break;case 1:nextCell=ant.curPos+1;break;case 2:nextCell=ant.curPos+cw;break;case 3:nextCell=ant.curPos-1;break;}if(nextCell>cw*ch)nextCell=nextCell%(cw*ch);if(nextCell<0)nextCell=nextCell+cw*ch;ant.curPos=nextCell;ant.direction+=ant.states[ant.cells[nextCell]||0];if(ant.direction>3)ant.direction=0;else if(ant.direction<0)ant.direction=3;lastThink=Date.now()};BG.draw=function(ctx){var cw=Math.ceil(ctx.canvas.width/ant.cellSize);var ch=Math.ceil(ctx.canvas.height/ant.cellSize);var w=cw*ant.cellSize;var h=ch*ant.cellSize;if(Date.now()>lastThink+ant.thinkInt){for(var i=0;i<25;i++){this.think(cw,ch)}ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=ctx.mozImageSmoothingEnabled=ctx.webkitImageSmoothingEnabled=false;for(var _i=0;_i<cw*ch;_i++){var cell=ant.cells[_i];if(cell){var cx=_i%cw;var cy=Math.floor(_i/cw);var hue=cell*(360/ant.states.length);ctx.fillStyle='hsl('+hue+', 60%, 60%)';ctx.fillRect(cx*ant.cellSize,cy*ant.cellSize,1,1);ctx.fillStyle='hsl('+hue+', 60%, 35%)';ctx.fillRect(cx*ant.cellSize,cy*ant.cellSize+1,1,1)}}if(ant.drawAnt){var antx=ant.curPos%cw;var anty=Math.floor(ant.curPos/cw);ctx.fillStyle=this.col.acc;ctx.fillRect(antx*ant.cellSize,anty*ant.cellSize,1,1)}}};