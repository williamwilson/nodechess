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
    console.log('sending resource: ' + path);
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