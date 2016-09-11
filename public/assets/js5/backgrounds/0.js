'use strict';BG.col={fg:'#FFF',acc:'#B96',bg:{hue:0,sat:0,val:20}};var life={cellSize:2,drawGrid:false,thinkInt:100,cells:{}};BG.init=function(canvas){BG.onResize(canvas);var cw=Math.ceil(canvas.width/life.cellSize);var ch=Math.ceil(canvas.height/life.cellSize);var ctx=canvas.getContext('2d');ctx.translate(-(cw-canvas.width/life.cellSize)/2,-(ch-canvas.height/life.cellSize)/2);for(var i=1;i<cw*ch/5;i++){life.cells[Math.floor(Math.random()*cw*ch)]=true}};BG.onResize=function(canvas){canvas.width=Math.ceil(canvas.offsetWidth/4);canvas.height=Math.ceil(canvas.offsetHeight/4)};var lastThink=Date.now();BG.draw=function(ctx){var cw=Math.ceil(ctx.canvas.width/life.cellSize);var ch=Math.ceil(ctx.canvas.height/life.cellSize);var w=cw*life.cellSize;var h=ch*life.cellSize;if(Date.now()>lastThink+life.thinkInt){var newCells={};for(var i=0;i<cw*ch;i++){var cell=life.cells[i];var neighbors=[life.cells[i-cw-1],life.cells[i-cw],life.cells[i-cw+1],life.cells[i-1],life.cells[i+1],life.cells[i+cw-1],life.cells[i+cw],life.cells[i+cw+1]];var count=0;for(var j=0;j<8;j++){if(neighbors[j]){count++}}if(cell){if(count<2||count>3)newCells[i]=undefined;else newCells[i]=true;}else if(count==3)newCells[i]=true}life.cells=newCells;lastThink=Date.now();ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=ctx.mozImageSmoothingEnabled=ctx.webkitImageSmoothingEnabled=false;ctx.fillStyle='hsl(0, 0%, 20%)';ctx.fillRect(0,0,w,h);if(life.drawGrid){ctx.fillStyle='hsl(0, 0%, 24%)';for(var _i=1;_i<cw;_i++){ctx.fillRect(_i*8,0,1,h)}for(var _j=1;_j<ch;_j++){ctx.fillRect(0,_j*8,w,1)}}for(var _i2=0;_i2<cw*ch;_i2++){if(life.cells[_i2]){var cx=_i2%cw;var cy=Math.floor(_i2/cw);ctx.fillStyle='hsl(0, 0%, 60%)';ctx.fillRect(cx*life.cellSize,cy*life.cellSize,1,1);ctx.fillStyle='hsl(0, 0%, 35%)';ctx.fillRect(cx*life.cellSize,cy*life.cellSize+1,1,1)}}}};