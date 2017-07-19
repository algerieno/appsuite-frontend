/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2016 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Alexander Quast <alexander.quast@open-xchange.com>
 */

define('io.ox/core/sockets', ['static/3rd.party/socket.io.slim.js', 'io.ox/core/capabilities'], function (io, cap) {
    'use strict';

    var socket,
        // disable debugging for release
        URI = /*_.url.hash('socket-uri') ? _.url.hash('socket-uri') :*/ ox.abs,
        PATH = '/socket.io/appsuite',
        isConnected = false,
        supported = Modernizr.websockets && cap.has('websocket'),
        debug = true, //_.url.hash('socket-debug') || ox.debug,
        options = {
            path: PATH,
            transports: ['websocket'],      // do not change, middleware only support sockets not http polling
            reconnectionAttempts: 25,       // max retries, each retry doubles the reconnectionDelay
            randomizationFactor: 0.0,       // randomize reconnect delay by +/- (factor * delay) ( 0 <= factor <= 1)
            reconnectionDelay: 1000,        // delay for the first retry
            reconnectionDelayMax: 10 * 60 * 1000      // 10 min. max delay between a reconnect (reached after aprox. 10 retries)
        };

    ox.websocketlog = [];

    function log(event) {
        try {
            ox.websocketlog.push({
                timestamp: _.now(),
                date: moment().format('D.M.Y HH:mm:ss'),
                event: event
            });
        } catch (e) {
            console.log(e);
        }
    }

    function connectSocket() {
        var def = $.Deferred();
        // connect Websocket
        if (debug) log('Websocket trying to connect...');
        socket = io.connect(URI + '/?session=' + ox.session, options);
        // expose global variable for debugging
        if (debug) window.socket = socket;
        socket.on('connect', function () {
            if (debug) log('Websocket connected!');
            isConnected = true;
            def.resolve(socket);
        });
        socket.on('disconnect', function () {
            if (debug) log('Websocket disconnected');
            isConnected = false;
        });
        socket.on('reconnect', function () {
            if (debug) log('Websocket was reconnected');
            isConnected = true;
        });
        socket.on('reconnecting', function () {
            if (debug) log('Websocket trying to reconnect');
        });
        socket.on('connect_error', function () {
            if (debug) log('Websocket connection error');
            if (socket.io.backoff.attempts === options.reconnectionAttempts) {
                ox.trigger('socket:maxreconnections:reached');
                if (debug) log('Max reconnection attempts for socket reached, stopping reconnection.');
            }
            def.reject();
        });
        socket.on('connect_timeout', function () {
            if (debug) log('Websocket connection timeout');
            def.reject();
        });

        // close socket on invalid session
        socket.on('session:invalid', function () {
            if (debug) log('Websocket disconnected due to invalid session');
            if (socket.connected) socket.close();
        });

        ox.on('relogin:required', function () {
            if (debug) log('Websocket disconnected due to invalid session');
            if (socket.connected) socket.close();
        });

        // reconnect socket on new session
        ox.on('relogin:success', function () {
            if (socket.disconnected) {
                if (debug) log('Websocket reconnecting with new session');
                if (socket.disconnected) {
                    // recreate URI to pass new session
                    socket.io.uri = URI + '/?session=' + ox.session;
                    socket.connect();
                }
            }
        });
        // disconnect on logout
        ox.on('logout', function () {
            if (debug) log('Websocket disconnected on logout');
            if (socket.connected) socket.close();
        });

        return def;
    }

    /**
     * returns a websocket which will be automatically connected if it's the first
     * call. All subsequent getSocket() calls will return the socket instance.
     * @return {[type]} Deferred object resolving with the socket.io object
     */
    function getSocket() {
        if (socket === undefined && supported) {
            return connectSocket();
        } else if (socket) {
            return $.Deferred().resolve(socket);
        }
        if (debug) log('No websocket support, connection not possible.');
        return $.Deferred().reject();
    }

    // getSocket will return a connected socket
    return {
        isConnected: isConnected,
        getSocket: getSocket
    };
});
