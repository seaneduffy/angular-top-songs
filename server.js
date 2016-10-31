'use strict';

let express = require('express'),
	app = express(),
	http = require('http').Server(app);


app.use(require('body-parser').json());
app.use(express.static('./dist'));
app.set('views', __dirname + '/src/templates/');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index.ejs', {});
});

http.listen(3000, function() {
	console.log('Server started. Listening on port 3000');
});