'use strict';

let express 	= require('express'),
	fs 			= require('fs'),
	nodemailer 	= require('nodemailer'),
	qs 			= require('querystring');

let config 		= require('./config');

//express :)
let app = module.exports = express();

//util stuff
//test for dotfiles
let exp = /^\./;

let scrapeFiles = function() {
	let projects = {};
	let basepath = './public/work';

	//new way to do this is way better
	let cats = fs.readdirSync(basepath);

	//for each category (designs, programs, webdev)
	for(let i = 0; i < cats.length; i++) {
		let cat = cats[i];

		if(!exp.test(cat)) {
			projects[cat] = {}

			let dirs = fs.readdirSync(basepath + '/' + cat);

			//for each project (native, posters, etc)
			for(let j = 0; j < dirs.length; j++) {
				let dir = dirs[j];

				if(!exp.test(dir)) {
					let path = basepath + '/' + cat + '/' + dir + '/';

					//load info file
					let info = JSON.parse(fs.readFileSync(path + 'info.json'));

					projects[cat][dir] = {
						t: info.title,
						d: info.desc,
						w: info.web
					}

					//hacky ass way to avoid using deprecated fs.existsSync
					try {
						projects[cat][dir].f = fs.readdirSync(path + 'files');
					} catch(e) {};
				}
			}
		}
	}

	return projects;
};

//static files
app.use(express.static(__dirname + '/public', {index: false}));

//babel polyfill
app.use('/babel-polyfill', express.static(__dirname + '/node_modules/babel-polyfill'));

//json for stuff
app.get('/info', function(req, res) {
	res.json(scrapeFiles());
});

//contact form 
var transporter = nodemailer.createTransport({
	service: 	'hotmail',
	auth: 		{
		user: 	config.emailUser,
		pass: 	config.emailPass
	}
});

app.post('/contact', function(req, res) {
	res.type('html');
	
	let body = '';
	
	req.on('data', function(chunk) {
		body += chunk;
		
		if(body.length > 1e6) {
			res.status(413).end();
			
			req.connection.destroy();
		}
	});
	
	req.on('end', function() {
		var post = qs.parse(body);
		
		if(!post.e || !post.b) return res.status(413).end();
		
		transporter.sendMail({
			from: 		post.e,
			sender: 	post.e,
			to: 		config.toEmail,
			subject: 	post.n || 'contact',
			text: 		post.body
		}, function(err, info) {
			if(err) return res.status(500).end();
		
			res.status(200).end();
		});
	});
});

//main page
app.get('/:cat?/:project?/:file?', function(req, res, next) {
	let projects = scrapeFiles();

	//if we're trying to go to a specific section
	if(req.params.cat) {
		//about and contact are special
		if(req.params.cat == 'about' || req.params.cat == 'contact') {
			if(req.params.project) return next(); //but they don't have any pages inside them
		} else {
			let cat = projects[req.params.cat];

			//make sure it exists
			//but it could also be a web project
			if(!cat) return next();

			if(req.params.project) {
				let project = cat[req.params.project];

				if(!project) return next();

				//gotta do -1 cause stupid pretty file indexes
				if(req.params.file) {
					if(!project.f || !project.f[parseInt(req.params.file) - 1])
						return next();
				}
			}
		}
	}

	res.sendFile(__dirname + '/public/home.html');
});

//web projects
app.get('/:project*', function(req, res, next) {
	let projects = scrapeFiles();

	let path;

	for(let catk in projects) {
		let cat = projects[catk];

		for(let dir in cat) {
			let project = cat[dir];

			if(project.w && req.params.project == dir) {
				path = catk + '/' + dir + '/project';

				break;
			}
		}

		if(path) break;
	}

	if(path) {
		console.log(req.url);

		req.url = req.url.substr(req.params.project.length + 2);

		console.log(req.url);

		let index;

		//if it doesn't end with an extension
		if(!/[^\/]+\..+$/.test(req.url)) { 
			//get the name of what the file would be 
			let match = req.url.match(/([^\/]+)\/?$/);

			//should always be true hopfully
			if(match) {
				index = match[1] + '.html';

				//don't try to get file/file.html, just /file.html
				req.url = req.url.substr(0, req.url.length - match[0].length);
			}
		}

		//should never be true I think
		if(!req.url.length)
			req.url = '/';

		express.static(__dirname + '/public/work/' + path, {index}).apply(this, arguments);
	} else
		next();
});

//404
app.get('*', function(req, res) {
	res.status(404).type('html').end('404 - "' + req.url + '" not found');
});

//start it up
let server = app.listen(process.env.port || 8080, function() {
	let addr = server.address();
	
	console.log('server started at', addr.address + ':' + addr.port);
});