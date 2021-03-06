/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2020 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/chat/commands', [
    'io.ox/core/extensions',
    'io.ox/chat/events',
    'io.ox/switchboard/api',
    'io.ox/chat/data',
    'gettext!io.ox/chat'
], function (ext, events, api, data, gt) {

    'use strict';

    var commands = {};
    var regex = /^\s*\/(\w+)$/;

    events.on('message:post', function (e) {
        var match = regex.exec(e.attr.content);
        if (!match) return;
        events.trigger('message:command', { command: match[1], room: e.room, consume: e.consume });
    });

    events.on('message:command', function (e) {
        e.consume();
        var command = commands[e.command];
        if (!command) return e.room.addSystemMessage({ command: e.command, type: 'text', message: gt('Unknown command: %1$s', e.command) });
        var payload = { room: e.room, consume: e.consume };
        command.callback(payload);
        events.trigger('message:command:' + e.command, payload);
    });

    // Register command
    // Mandatory parameters: command and callback
    // Nice to have: description
    function register(options) {
        if (!options || !options.command || !_.isFunction(options.callback)) {
            return console.error('Unable to register command', options);
        }
        commands[options.command] = options;
    }

    // built-in commands

    register({
        command: 'commands',
        callback: function (e) {
            var list = _(commands)
                .chain()
                .values()
                .sortBy('command')
                .map(function (data) {
                    return '\n<b>/' + data.command + '</b> ' + _.escape(data.description || '');
                })
                .value();
            e.room.addSystemMessage({ command: 'commands', type: 'text', message: gt('Supported commands: %1$s', list) });
        },
        description: gt('List all commands')
    });

    // register({
    //     command: 'format',
    //     callback: function (e) {
    //         e.room.addSystemMessage({ command: 'format', type: 'text', message: 'Test!' });
    //     },
    //     description: gt('Show formatting options'),
    //     render: function (options) {
    //     }
    // });

    register({
        command: 'version',
        callback: function (e) {
            e.room.addSystemMessage({ command: 'version', type: 'text', message: gt('Server version: %1$s', data.serverConfig.version) });
        },
        description: gt('Show server version')
    });

    register({
        command: 'zoom',
        callback: startCall.bind(null, 'zoom'),
        description: gt('Start a Zoom meeting'),
        render: renderCall
    });

    register({
        command: 'jitsi',
        callback: startCall.bind(null, 'jitsi'),
        description: gt('Start a Jitsi meeting'),
        render: renderCall
    });

    function startCall(type, e) {
        var members = _(e.room.get('members')).chain().keys().without(api.userId).value();
        require(['io.ox/switchboard/call/api'], function (call) {
            call.start(type, members).then(function (dialog) {
                dialog.on('call', function () {
                    var url = this.getJoinURL();
                    if (!url) return;
                    var caller = data.users.getName(api.userId) || api.userId;
                    //#. %1$s is a user name
                    var content = gt('%1$s is calling.', caller)
                        // \uD83D\uDCDE is phone receiver
                        + ' \uD83D\uDCDE\n'
                        //#. %1$s is a link
                        + gt('Please click the following link to join: %1$s', url);
                    e.room.postMessage({ command: type, content: JSON.stringify({ link: url, text: content }) });
                });
            });
        });
    }

    function renderCall(options) {

        var model = options.model;
        var json = options.json;
        var href = _.escape(json.link);
        if (!href) return $();
        var sender = model.get('sender');
        var caller = data.users.getName(sender) || sender;

        return $('<a class="content incoming-call" target="_blank" rel="noopener">').attr('href', href).append(
            $('<i class="fa fa-phone" aria-hidden="true">'),
            $('<div class="caller ellipsis">').text(gt('%1$s is calling', caller)),
            $('<div class="join-link ellipsis">').text(href)
        );
    }

    return {

        register: register,

        get: function (id) {
            return commands[id];
        },

        getRender: function (id) {
            var command = commands[id];
            return command && command.render;
        }
    };
});
