jquery.WebSocket
================

jquery.WebSocket enables WebSocket support for all Browsers. In older
Browsers the WebSocket is emulated by using AJAX Long Polling as fall-
back. But all instances of WebSocket providing the same interface and
the same events! So no need to worry about writing application code
based on WebSockets and it's events like onmessage, onclose ...

One simple interface $.WebSocket(url, protocol, options); thats it.
The same interface as current native WebSocket implementation. The same
native events (onopen, onmessage, onerror, onclose) + custom event onsend.

But jquery.WebSockets adds some nice features:

[x] Multiplexing - Use a single socket connection and as many logical pipes
    within as your browser supports. All these pipes are emulated WebSockets
    also with the same API + same events! Use each pipe as WebSocket! But
    this requires you to implement the protocol on this level of communication
    The data is en- + decoded in a special way to make multiplexing possible

[x] Interface for adding protocol to manipulate data before they are send
    and right after they arrive before event onmessage is fired!

example:

<code>
    // The WebSocket-Object (with resource + fallback)
    var ws = $.WebSocket('ws://127.0.0.1:9300', null, {http: 'http://127.0.0.1:81/Lab/Websocket/Data/poll.php'});

    // WebSocket onerror event triggered also in fallback
    ws.onerror = function(e) {
        console.log('Error with WebSocket uid: ' + e.target.uid);
    };

    /**
     * demonstrate multiplexing
     */
    var pipe1;

    // if connection is opened => start opening a pipe (multiplexing)
    ws.onopen = function() {
        //
        pipe1 = ws.registerPipe('user/all', null, {
            onopen: function() {
                console.log('pipe1 (' + this.uid + ') connected!');
            },
            onmessage: function(e) {
                console.log('< pipe1 : ' + e.data);
            },
            onerror: function(e) {
                console.log('< pipe1 error : ' + e.data);
            },
            onclose: function() {
                console.log('pipe1 (' + pipe.uid + ') connection closed!');
            }
        });
    };
</code>