/**
 * get arguments
 */
var arguments       = process.argv.slice(2);

/**
 * load modules
 */
var websocket = require('websocket').server;
var http      = require('http');

/**
 * setup
 */
const WS_ID = 'WebSocketPipe';
var debug   = (arguments[2] == '1') ? true : false;

/**
 * Create server with http module and weiterreiche the
 * instance to websocket module
 */
var httpd = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
httpd.listen(arguments[1], arguments[0], function(){});

// Create the WebSocket-Server
wsServer = new websocket({
    httpServer: httpd
});


var _pipes    = {};


// WebSocket server listen on ...
wsServer.on('request', function(request) {

    var connection = request.accept(null, request.origin);
    var packet;
    var uid;

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            try {
                // get package as JSON
                packet = JSON.parse(message.utf8Data);

                //
                if (packet.type == WS_ID) {
                    switch (packet.action) {
                    case 'startup':
                        uid = packet.uid;
                        console.log('new client: ' + uid);
                        // store information about pipe!
                        _pipes[packet.uid] = {
                            resource: packet.data,
                            connection: connection,
                            interval: null
                        };
                        break;

                    case 'shutdown':
                        delete _pipes[packet.uid];
                        break;

                    case 'message':
                    default:
                        // demonstration
                        if (packet.data == 'couchdb') {
                            // couchdb is our trigger for continously deliver data from server ...
                            _pipes[packet.uid]['interval'] = setInterval(_ping, 10000, connection, packet.uid);
                        } else {
                            // send the received data as echo
                            _echo(packet);
                        }
                        break;
                    }
                }
            } catch (e) {};

            // process WebSocket message
            if (debug) {
                console.log(message);
            }
        }
    });

    /**
     * sends a pong to given id + connection
     */
    var _ping = function(connection, uid) {

        connection.send('{"type": "'+WS_ID+'", "uid": "' + uid + '", "data": "ping"}');
    };

    /**
     * simple echo for input
     */
    var _echo = function(packet) {
        connection.send(
            '{"type": "'+WS_ID+'", "action": "message", "uid": "'+packet.uid+'", "data": "'+
            ((packet.data) ? packet.data : packet.url)+'"}'
        );
    };

    /**
     * dummy event
     */
    connection.on('close', function(connection) {
        //
        console.log('connection closed by client with uid = ' + uid);

        for (pipe in _pipes) {
            if (pipe == uid) {
                if (_pipes[pipe]['interval'] != null) {
                    clearTimeout(_pipes[pipe]['interval']);
                }

                delete _pipes[pipe];
            }
        }
    });
});
