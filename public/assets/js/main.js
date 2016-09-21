//es6 as hell
'use strict';

//hook stuff - just declare for now
let hooks = {};

//util stuff
let util = {
	titleElem: document.getElementById('title'),

	//used a lot
	getScroll() {
		return (document.body.scrollTop || document.documentElement.scrollTop);
	},

	//dom element from #id or /path
	//yeah smartass I know about querySelector but this is faster and it's called a lot
	getElem(id) {
		return document.getElementById(id.match(/[#/]([^/]+)/)[1]);
	},

	//get actual height of an element
	computedHeight(elem) {
		let styles = window.getComputedStyle(elem);

		return elem.offsetHeight +
			//parseFloat(styles['padding-top']) +
			//parseFloat(styles['padding-bottom']) +
			parseFloat(styles['border-top-width']) +
			parseFloat(styles['border-bottom-width']) +
			parseFloat(styles['margin-top']) +
			parseFloat(styles['margin-bottom']);
	},

	//elapsed time, start val, change, duration
	//cubic
	easeOut(t, b, c, d) {
		if(t == d)
			return b + c;
		else
			return c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
	},

	//messing with location
	//also set our title in setPath
	setPath(path) {
		//fuck you opera mini
		if(window.history.replaceState)
			window.history.replaceState({}, '', path);
		else
			if(path == '/')
				window.location.hash = '';
			else
				window.location.hash = '#' + path;

		//title stuff
		//probably a better place to declare these
		let title 	= 'Andrew Ault';
		let sep 	= ': ';

		let parts 	= path.split('/');

		//if we're on a cat
		if(parts[1]) {
			let cat = parts[1];

			//capitalize
			title += sep + cat.charAt(0).toUpperCase() + cat.slice(1);

			//if we're on a project
			if(parts[2]) {
				title += sep + app.curProject.title;

				//if we're on a file
				if(parts[3])
					title += sep + app.curProject.files[app.gallery.curFile - 1];
			}
		}

		this.titleElem.innerText = title;
	},

	getPath() {
		if(window.history.replaceState)
			return window.location.pathname;
		else
			return window.location.hash;
	},

	getContext(canvas, type = '2d') {
		if(!canvas.contexts) canvas.contexts = {};

		let context = canvas.contexts[type];

		if(!context) {
			context = canvas.getContext(type);

			if(type == 'webgl' && !context)
				context = canvas.getContext('experimental-webgl');

			canvas.contexts[type] = context;
		}

		return context;
	}
}

//background stuff
let background = {
	style: 			document.createElement('style'),
	paused: 		false,
	numBackgrounds: 3,
	curBackground: 	-1,
	oldBackground: 	-1,
	dependencies: 	{},

	//default to black on white
	BG: {
		col: {
			fg: 	'#000',
			acc: 	'#F00',
			bg: {
				hue: 0,
				sat: 0,
				val: 97
			}
		}
	},

	draw() {
		let lastCall = false;

		if(util.getScroll() < background.canvas.offsetHeight) {
			let context = util.getContext(background.canvas, background.BG.context);

			if(context)
				lastCall = background.BG.draw(context);
		}

		//only draw if we're on the same background and we're not paused
		if(background.curBackground == background.oldBackground)
			if(!background.paused && !lastCall)
				requestAnimationFrame(background.draw);
	},

	setBG(num, cb) {
		this.curBackground = num;

		requestAnimationFrame(function() {
			background.oldBackground = background.curBackground;

			background.load(background.curBackground, cb);
		})
	},


	load(num, cb) {
		let req = new XMLHttpRequest();

		req.onload = function(e) {
			let BG = background.BG;

			//aaaa
			eval(req.response);

			//convenience stuff
			let halfStr = `hsl(${BG.col.bg.hue}, ${BG.col.bg.sat}%, `;
			BG.col.bg.str = halfStr + BG.col.bg.val + '%)';

			//change page colors
			background.css = `
				body {
					color: ${BG.col.fg};
					background: ${BG.col.bg.str};
				}

				.underline {
					border-color: ${BG.col.acc};
				}

				header {
					background: ${BG.col.fg};
				}

				header a {
					color: ${BG.col.bg.str};
				}

				header a:hover, header a.active {
					color: ${BG.col.acc};
				}

				#pages li {
					background: ${BG.col.bg.str};
				}

				#pages li:nth-of-type(2n) {
					background: ${halfStr}${BG.col.bg.val + 3}%);
				}

				#landing {
					color: ${BG.col.fg};
				}

				#landing #splash {
					background: ${BG.col.fg};
					color: ${BG.col.bg.str};
				}

				#landing #background {
					background: ${BG.col.bg.str};
				}

				#contact #response {
					background: ${BG.col.acc};
				}

				#contact a {
					color: ${BG.col.acc};
				}

				#contact a:hover {
					color: ${BG.col.fg};
				}

				#contact #submit {
					background: ${BG.col.fg};
					color: ${BG.col.bg.str};
				}

				#contact #submit:hover {
					background: ${BG.col.acc};
					color: ${BG.col.fg};
				}

				#arrow {
					border-bottom-color: ${BG.col.fg} !important;
				}

				#wrapper {
					background: ${BG.col.fg};
					color: ${BG.col.bg.str};
				}
			`;

			//done with BG
			background.BG = BG;
			BG = null;

			//put styles on the style element
			//how supported is this?
			background.style.textContent = background.css;

			document.getElementsByTagName('head')[0].appendChild(background.style);

			//init
			let dependencies = [];

			//loading dependencies
			if(background.BG.dependencies && background.BG.dependencies.length) {
				for(let i = 0; i < background.BG.dependencies.length; i++) {
					let src = background.BG.dependencies[i];

					//only load it if we haven't yet
					if(!background.dependencies[src]) {
						dependencies[i] = new Promise(function(resolve, reject) {
							let req = new XMLHttpRequest();

							req.onload = function(e) {
								//not that bad now
								let script = document.createElement('script');
								script.text = req.response;

								document.body.appendChild(script);

								//only load once, conflicts aren't possible
								background.dependencies[src] = true;

								resolve();
							}

							req.open('GET', '/assets/js/lib/' + src, true);

							//if we have a previous file, don't load this one until that one's loaded
							if(dependencies[i - 1])
								dependencies[i - 1].then(function() {
									req.send();
								});
							else
								req.send();
						});
					}
				}
			}

			Promise.all(dependencies).then(function() {
				//all files loaded
				background.BG.init(background.canvas, util.getContext(background.canvas, background.BG.context));

				//start drawing
				background.draw();

				//done :)
				if(cb) cb();
			});
		}

		//woops I forgot to make it async
		req.open('GET', '/assets/js/backgrounds/' + num + '.js', true);
		req.send();
	}
}

//smooth scrolling stuff
let smoothScroll = {
	duration: 	800, //ms

	ignorePath: false,
	startTime: 	0,
	startY: 	0,
	deltaY: 	0,

	think() {
		let curTime = Date.now();

		if(curTime - smoothScroll.startTime < smoothScroll.duration) {
			window.scroll(
				0,
				util.easeOut(
					curTime - smoothScroll.startTime,
					smoothScroll.startY,
					smoothScroll.deltaY,
					smoothScroll.duration
				)
			);

			requestAnimationFrame(smoothScroll.think);
		} else {
			window.scroll(0, smoothScroll.startY + smoothScroll.deltaY);

			//scroll for whatever reason doesn't call the event until the next frame
			//so we call our scroll hook to get our effects immediately, and so that we can reset ignorePath without it messing up onScroll
			hooks.onScroll();

			smoothScroll.ignorePath = false;
		}
	},

	to(targetY, skipAnim, ignorePath) {
		smoothScroll.ignorePath = ignorePath;
		smoothScroll.startTime = Date.now();
		smoothScroll.startY = document.body.scrollTop || document.documentElement.scrollTop;
		smoothScroll.deltaY = targetY - smoothScroll.startY;

		//lazy
		if(skipAnim)
			smoothScroll.startTime -= smoothScroll.duration;

		//if we call window.scroll but we're already at where we're trying to scroll to, it doesn't call the scroll event on the window
		//so if we're already where we need to be we don't need to call think, just onScroll
		if(util.getScroll() == targetY) {
			hooks.onScroll();

			//reset ignorePath
			smoothScroll.ignorePath = false;
		} else
			smoothScroll.think();
	}
}

//moving underline
let underline = {
	duration: 	800,

	to(underlineElem, targetX, preventOverwrite) {
		let startTime = underlineElem.startTime = Date.now();
		let startX = underlineElem.offsetLeft;
		let deltaX = targetX - startX;

		underlineElem.think = function() {
			let curTime = Date.now();

			if(curTime - startTime < underline.duration) {
				underlineElem.style.left = util.easeOut(
					curTime - startTime,
					startX,
					deltaX,
					underline.duration
				) + 'px';

				//make sure to hasn't been called since we started this one
				if(underlineElem.startTime == startTime)
					requestAnimationFrame(underlineElem.think);
			} else {
				underlineElem.style.left = (startX + deltaX) + 'px';

				underlineElem.isMoving = false;
			}
		}

		underlineElem.isMoving = preventOverwrite;
		underlineElem.think();
	}
}

//here we go :)
//this is mad ugly, I wish I could do methods afterwards
let app = new Vue({
	el: 'html',

	data: {
		isReady: 		false,
		showInfo: 		false,
		curProject: 	false,
		projects: 		{},
		gallery: 		{
			shouldShow: false,
			curFile: 	0,
			numFiles: 	0,
			curImage: 	'',
			dummyImg: 	false 
		},
		contact: 		{
			submitted: 	false,
			response: 	false
		}
	},

	methods: {
		pauseBG() {
			background.paused = true;
		},

		resumeBG() {
			background.paused = false;
			background.draw();
		},

		prevBG() {
			background.setBG((background.curBackground == 0) ? (background.numBackgrounds - 1) : (background.curBackground - 1));
		},

		nextBG() {
			background.setBG((background.curBackground + 1) % background.numBackgrounds);
		},
		
		viewInfo(project, elem, force) {
			//elements
			let info 		= document.getElementById('info');
			let wrapper 	= document.getElementById('wrapper');
			let parent 		= elem.parentNode;
			let siblings 	= parent.querySelectorAll('a[id]'); //barf but if we use children we'll get #info too

			//math stuff
			let index 		= parseInt(elem.attributes['data-index'].value);
			let numInRow 	= Math.floor(info.offsetWidth / elem.offsetWidth);
			let rowNum 		= Math.floor(index / numInRow);
			let firstIndex 	= rowNum * numInRow;
			let firstInRow 	= siblings[firstIndex];
			let normalChild = siblings[firstIndex + 1] || siblings[firstIndex - 1];

			//get the last elem we were under
			if(info.oldFirstInRow && firstInRow != info.oldFirstInRow) {
				//almost didn't have to do this
				let oldIndex 	= parseInt(info.oldFirstInRow.attributes['data-index'].value);
				let oldRowNum 	= Math.floor(oldIndex / numInRow);

				let oldMargin 	= parseFloat(info.oldFirstInRow.style['margin-bottom']);

				info.oldFirstInRow.style['margin-bottom'] = null; 

				//reset info's height and set margin and skip the animation
				info.classList.add('notransition');

				info.style.height = 0;

				//if we're moving forward in rows in the same page, put the info window at the bottom of where the element actually is
				if(info.oldFirstInRow.parentNode == elem.parentNode && rowNum > oldRowNum)
					info.style['margin-top'] = oldMargin - 15 + 'px';

				info.offsetHeight; //trigger reflow

				info.classList.remove('notransition');

				requestAnimationFrame(function() {
					info.style['margin-top'] = 0;
				});
			}

			//if it's the same project, minimize
			if(force === false || (force !== true && (project == this.curProject && parseFloat(info.style.height) != 0))) {
				firstInRow.style['margin-bottom'] = null;
				info.style.height = 0;
			} else {
				//change project
				this.curProject = project;

				//move info
				parent.insertBefore(info, elem.nextSibling);

				Vue.nextTick(function() {
					//set the top
					info.style.top = util.computedHeight(normalChild) * (rowNum + 1) + 'px';

					let wrapperHeight = util.computedHeight(wrapper);

					firstInRow.style['margin-bottom'] = wrapperHeight + 15 + 'px';
					info.style.height = wrapperHeight + 'px';

					//remember which elem we're under
					info.oldFirstInRow = firstInRow;
				});
			}

			//move the arrow
			let arrow = document.getElementById('arrow');
			let arrowLeft = (elem.offsetLeft + (elem.offsetWidth / 2));

			if(info.offsetHeight == 0)
				arrow.style.left = arrowLeft + 'px';
			else if(parseFloat(arrow.style.left) != arrowLeft) //can't use offsetLeft because of negative margin
				underline.to(arrow, arrowLeft);

			//precache thumbnails
			if(this.curProject.files && this.curProject.files.length) {
				let pre = 'url(' + this.curProject.path + 'files/';
				let suf = '), ';

				document.getElementById('preload').style.background = pre + this.curProject.files.join(suf + pre) + ')';
			}

			//update path
			//gotta wait a tick for info height to update
			Vue.nextTick(function() {
				hooks.onScroll();
			})
		},

		viewFile(index) {
			//toggle .active on active thumbnail
			let container = document.getElementById('thumbnails');
			let thumbnails = document.querySelectorAll('#thumbnails a');
			let elem;

			//get elem and also make it active
			for(let i = 0; i < thumbnails.length; i++) {
				let child = thumbnails[i];

				if(i == index - 1) {
					elem = child;

					child.classList.add('active');
				} else
					child.classList.remove('active');
			}

			//open up the gallery
			this.gallery.curFile = index;
			this.gallery.numFiles = this.curProject.files.length;
			this.gallery.curImage = this.curProject.path + 'files/' + this.curProject.files[index - 1];

			//we don't have to mess with any lightbox elements because the css takes care of it now :)

			//also move underline
			//don't move it, too hard to make it work on multiple lines
			//underline.to(document.querySelector('#thumbnails .underline'), elem.offsetLeft);

			//update path
			util.setPath(this.curProject.url + '/' + index);

			//done :)
			this.gallery.shouldShow = true;
		},

		hideFiles() {
			//un-.active all the thumbnails
			let thumbnails = document.getElementById('thumbnails');

			for(let i = 0; i < thumbnails.children.length; i++)
				thumbnails.children[i].classList.remove('active');

			//set path
			util.setPath(this.curProject.url);

			//hide gallery
			this.gallery.shouldShow = false;
		},

		prevFile(dontChange) {
			if(--this.gallery.curFile <= 0)
				this.gallery.curFile = this.gallery.numFiles;

			this.viewFile(this.gallery.curFile);
		},

		nextFile() {
			if(++this.gallery.curFile > this.gallery.numFiles)
				this.gallery.curFile = 1;

			this.viewFile(this.gallery.curFile);
		},

		submitForm() {
			//weird
			let app = this;

			//build our data first
			let body = `e=${app.contact.email}&b=${app.contact.body}`;

			if(app.contact.name)
				body += `&n=${app.contact.name}`;

			//ajax 
			let req = new XMLHttpRequest();

			//see if we made it
			req.onload = function(e) {
				if(req.status == 200)
					app.contact.response = 'Thanks! :)';
				else {
					app.contact.response = 'Error, try again.'

					app.contact.submitted = false;
				}
			}

			req.open('POST', '/contact', true);

			//headers
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.setRequestHeader('Content-length', body.length);

			//send
			req.send(body);

			//disable buttons so we can't send it twice
			app.contact.submitted = true;
			app.contact.response = 'Submitting...';
		}
	}
});

//the big stuff
{
	//called when vue has updated the dom with our data
	hooks.onReady = function() {
		//we reuse these a couple times
		let links 			= document.querySelectorAll('nav a');
		let navUnderline 	= document.querySelector('nav .underline');
		let header 			= document.getElementsByTagName('header')[0];

		//scroll stuff
		{
			let intro 	= document.getElementById('landing');
			let info 	= document.getElementById('info');
			
			hooks.onScroll = function() {
				let scroll 		= util.getScroll();
				let pageHt 		= intro.offsetHeight;
				let headerHt 	= header.offsetHeight;

				let path 		= util.getPath();
				let shouldPath 	= !(smoothScroll.ignorePath || app.gallery.shouldShow);

				//console.log(smoothScroll.ignorePath);

				//save some speed but only calling stuff when we have to
				if(scroll >= intro.offsetHeight - headerHt) {
					//make the header sticky
					header.classList.add('sticky');

					//lazy
					scroll += headerHt;
					
					//link highlighting and location updating
					for(let link of links) {
						let elem = link.targetElem;

						let isActive = link.classList.contains('active');

						if(scroll >= elem.offsetTop && scroll < elem.offsetTop + elem.offsetHeight) {
							if(!isActive) {
								link.classList.add('active');

								//move underline
								if(!navUnderline.isMoving)
									underline.to(navUnderline, link.offsetLeft);
							}

							//set path
							let toPath = '/' + elem.id;

							if(parseFloat(info.style.height) > 0 && app.curProject.cat == elem.id) //better than if(elem.querySelector('#info'))
								toPath += '/' + app.curProject.project;

							if(shouldPath && path != toPath)
								util.setPath(toPath);
						} else {
							if(isActive)
								link.classList.remove('active');
						}

						//ios style gradient stuff
						//removed, too intensive/hard to work with :(
						//let offset = (scroll - elem.offsetTop) / (elem.offsetHeight / 3);
						//elem.style.backgroundColor = `hsl(${background.BG.col.bg.hue}, ${background.BG.col.bg.sat}%, ${background.BG.col.bg.val + offset}%)`;
					}
				} else {
					//put the header back
					header.classList.remove('sticky');

					//hide the underline
					underline.to(navUnderline, -96);

					//un-.active all our links
					for(let link of links)
						if(link.classList.contains('active'))
							link.classList.remove('active');

					//set path
					if(shouldPath && path != '/')
						util.setPath('/');
				}
			}

			window.addEventListener('scroll', hooks.onScroll);
		}

		//navigation link hijacking and underline movement
		{
			let logo = document.querySelector('header .logo');

			logo.targetX = -96;

			//bruh I love es6
			for(let link of [logo, ...links]) {
				//assign targetElem for the first time (used in scrollEvent)
				link.targetElem = util.getElem(link.attributes.href.value);

				//make right click -> copy link location work
				if(link.targetX)
					link.attributes.href.value = '/'; //don't do /landing
				else
					link.attributes.href.value = '/' + link.targetElem.id;

				//hijack onclick
				link.onclick = function() {
					//scroll
					smoothScroll.to(this.targetElem.offsetTop);

					//move underline
					underline.to(navUnderline, this.targetX || this.offsetLeft, true);

					return false;
				}
			}
		}

		//use location to figure out where to scroll to
		//why do I have to put this in nexttick?
		Vue.nextTick(function() {
			let path 	= util.getPath();
			let parts 	= path.split('/');

			let scrollY = 0;

			//if we're trying to go to a category
			if(parts[1]) {
				let page = document.getElementById(parts[1]);

				scrollY = page.offsetTop;

				//if we're trying to go to a project
				if(parts[2]) {
					//it's safe to assume that our project exists because we check on the back end
					let project = app.projects[parts[1]][parts[2]];
					let projectElem = document.getElementById(project.cat + '-' + project.project);

					app.viewInfo(project, projectElem);

					//try to center the info window
					//for whatever reason insertBefore doesn't change offsetTop until the next tick
					//so we get to calculate where info is going to be instead of actually being able to get it
					//also we're adding because offsetTop only returns distance to parent
					scrollY = scrollY 												//top of page
						+ parseInt(window.getComputedStyle(page)['padding-top']) 	//top of page content
						+ projectElem.offsetTop 									//top of project
						//+ util.computedHeight(projectElem) 							//bottom of project
						- header.offsetHeight * 2; 									//move from under sticky header (* 2 to look nice)

					//if we're trying to go to a file
					if(parts[3])
						Vue.nextTick(function() {
							app.viewFile(parseInt(parts[3]));
						});
				}
			}

			//true to skip the smoothing and true to ignore path changing
			smoothScroll.to(scrollY, true, true);

			//call setPath just to update the title
			util.setPath(path);
		});

		//init background
		//background.setBG(Math.floor(Math.random() * background.numBackgrounds), function() {
		background.setBG(3, function() {
			app.isReady = true;
		});
	}

	//called when we have our info
	hooks.onData = function(res) {
		//unminify our response
		app.projects = {};

		//we es6 boys!!
		for(let cat of Object.keys(res)) {
			let projects = res[cat];

			app.projects[cat] = {};

			for(let project of Object.keys(projects)) {
				let info = projects[project];

				app.projects[cat][project] = {
					//unminify
					title: 		info.t,
					desc: 		info.d,
					files: 		info.f,

					//also add convenience stuff
					cat, 		//I love es6 dude
					project,
					url: 		'/' + cat + '/' + project,
					path: 		'/work/' + cat + '/' + project + '/'
				}
			}
		}

		//call onReady
		app.$nextTick(hooks.onReady);
	}

	//called when dom is loaded
	hooks.onLoad = function() {
		//load file info
		let req = new XMLHttpRequest();

		//call onData
		req.onload = function() {
			hooks.onData(req.response)
		};

		//woops I forgot to make it async
		req.open('GET', '/info', true);
		req.responseType = 'json';
		req.send();

		//handle resize for lightbox and info window
		let info 	= document.getElementById('info');
		let image 	= document.getElementById('image');

		hooks.onResize = function() {
			//try to do all that again
			if((parseFloat(info.style.height) || 0) != 0)
				app.viewInfo(app.curProject, document.getElementById(app.curProject.cat + '-' + app.curProject.project), true);

			//wtf is this fix
			image.style.display = 'none';
			image.offsetHeight;
			image.style.display = 'inline-block';

			//update stuff
			hooks.onScroll();

			//am I too nitpicky? probably
			let navUnderline 	= document.querySelector('nav .underline');
			let active 			= document.querySelector('header a.active');

			navUnderline.style.left = (active ? active.offsetLeft : -96) + 'px';

			//resize canvas 
			background.BG.onResize(background.canvas);
		};

		window.addEventListener('resize', hooks.onResize);

		//background stuff
		background.canvas = document.getElementById('background');
	}

	//here we go :)
	document.addEventListener('DOMContentLoaded', hooks.onLoad);
}