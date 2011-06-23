var nodechess = (function() {
    var game, socket, connected, onLoginComplete, files;
    game = {};
    game.move = {};
    files = ['a','b','c','d','e','f','g','h'];

    socket = new io.Socket(null, {port:8000, rememberTransport:false});

    game.onLogin = function(data) {
	var result = {success:data.success};
	if (!result.succuess) {
	    result.reason = data.reason;
	}
	else {
	}
	game.onLoginComplete(result);
    };

    game.onUpdate = function(data) {
	var rank, file, fileindex, locations, id, piece;

	/* { '<file><rank>': '<piece>', ... } */
	locations = data.locations;

	for (fileindex = 0; fileindex < 8; fileindex++) {
	    file = files[fileindex];
	    for (rank = 1; rank < 9; rank++) {
		id = file + rank.toString();
		$('#' + id + '>div').removeClass();
		if (locations.hasOwnProperty(id)) {
		    if (locations[id].length > 0) {
			$('#' + id + '>div').addClass('piece ' + locations[id]);
		    }
		}
	    }
	}
    };

    /* note: the 'message' event is emitted when a transport receives new messages from the socket.io server */
    socket.on('message', function(data) {
	if (data.cmd === 'login') {
	    game.onLogin(data);
	} else if (data.cmd === 'update') {
	    game.onUpdate(data);
	}
    });

    game.processMove = function() {
	socket.send({cmd:'move', from:game.move.from, to:game.move.to});
	game.cancelMove();
    };

    /* public */
    game.cancelMove = function() {
	if (game.move.from) {
	    $('#' + game.move.from).removeClass('highlight');
	}
	game.move = {};
    };

    game.login = function(username, onLoginComplete) {
	if (!connected) {
	    onLoginComplete({success:false, reason:'Connection to server could not be made.'});
	}
	else {
	    game.onLoginComplete = onLoginComplete;
	    socket.send({cmd:'login', username:username});
	}
    };

    game.selectSquare = function(squareId) {
	if (game.move.from) {
	    game.move.to = squareId;
	    game.processMove();
	}
	else {
	    $('#' + squareId).addClass('highlight');
	    game.move.from = squareId;
	}
    };

    try
    {
	/* todo: does socket.io expose any 'connected' property */
	socket.connect();
	connected = true;
    }
    catch (ex)
    {
    }

    return game;
}());

/* todo: move to app.html */
$(function() {
    $('#connect').button();

    var submit = function(eventObject) {
	nodechess.login($('#username').val(), function(result) {
	    if (result.success) {
		$('.login').fadeOut(1000, function() {
		    $('.board').fadeIn(1000);
		});
	    }
	    else {
		alert('login failed');
	    }
	});
	eventObject.preventDefault();
    };
    $('#connect').click(submit);
    $('#form').submit(submit);

    $('.square').click(function(eventObject) {
	nodechess.selectSquare(eventObject.currentTarget.id);
    });
    $(document).keydown(function(eventObject) {
	/* escape */
	if (eventObject.which === 27) {
	    nodechess.cancelMove();
	}
    });

    $('.login').fadeIn(2000);
});