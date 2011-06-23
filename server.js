var http, io, url, fs, server, socket, sendResource, send404;

http = require('http');
io = require('./node_modules/socket.io');
url = require('url');
fs = require('fs');

server = http.createServer(function(req, res) {
    var path;

    path = url.parse(req.url).pathname;
    sendResource(res, path);
});

sendResource = function(res, path) {
    console.log('node: sending resource: ' + path);
    fs.readFile(__dirname + path, function(err, data) {
	var htmlPattern = /.html$/gi;
	if (err) {
	    send404(res);
	    return;
	}
	
	res.writeHead(200, { 'content-type': (path.match(htmlPattern) ? 'text/html' : 'text/javascript') });
	res.write(data, 'utf8');
	res.end();
    });
};

send404 = function(res) {
    res.writeHead(404);
    res.write('four-o-four');
    res.end();
};

server.listen(8000);

socket = io.listen(server);
socket.on('connection', function(client) {
    var game;
    console.log('nodechess: client connected: ' + client.sessionId);
    game = {'a1': 'lightrook',
	    'b1': 'lightknight',
	    'c1': 'lightbishop',
	    'd1': 'lightqueen',
	    'e1': 'lightking',
	    'f1': 'lightbishop',
	    'g1': 'lightknight',
	    'h1': 'lightrook',
	    'a2': 'lightpawn',
	    'b2': 'lightpawn',
	    'c2': 'lightpawn',
	    'd2': 'lightpawn',
	    'e2': 'lightpawn',
	    'f2': 'lightpawn',
	    'g2': 'lightpawn',
	    'h2': 'lightpawn',
	    'a8': 'darkrook',
	    'b8': 'darkknight',
	    'c8': 'darkbishop',
	    'd8': 'darkqueen',
	    'e8': 'darkking',
	    'f8': 'darkbishop',
	    'g8': 'darkknight',
	    'h8': 'darkrook',
	    'a7': 'darkpawn',
	    'b7': 'darkpawn',
	    'c7': 'darkpawn',
	    'd7': 'darkpawn',
	    'e7': 'darkpawn',
	    'f7': 'darkpawn',
	    'g7': 'darkpawn',
	    'h7': 'darkpawn'};

    client.on('message', function(data) {
	if (data.cmd === 'login') {
	    client.send({cmd:'login', success:true});
	    client.send({cmd:'update', locations:game});
	}
	else if (data.cmd === 'move') {
	    var moved;
	    if (game.hasOwnProperty(data.from)) {
		if (game[data.from]) {
		    moved = game[data.from];
		    game[data.from] = '';
		    game[data.to] = moved;
		}
	    }
	    client.send({cmd:'update', locations:game});
	}
    });
});