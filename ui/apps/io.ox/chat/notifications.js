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
 * @author Alexander Quast <alexander.quast@open-xchange.com>
 */

define('io.ox/chat/notifications', [
    'io.ox/chat/api',
    'io.ox/chat/events',
    'io.ox/core/active',
    'io.ox/switchboard/presence',
    'io.ox/chat/data',
    'io.ox/contacts/api',
    'io.ox/chat/util',
    'settings!io.ox/chat',
    'gettext!io.ox/chat'
], function (api, events, isActive, presence, data, contactsApi, util, settings, gt) {

    'use strict';

    // Look for new messages
    events.on('message:new', onMessageNew);

    function onMessageNew(e) {
        var model = e.message;
        // debug
        if (ox.debug) console.debug('new message', model);
        // don't notify on your own or system messages
        if (model.isMyself() || model.isSystem()) return;
        // don't notify if busy
        if (presence.getMyAvailability() === 'busy') return;
        // don't notify if the user is currently active and the UI is not hidden
        var active = isActive() && !settings.get('hidden'),
            alwaysPlay = settings.get('sounds/playWhen') === 'always';
        // treat sound and desktop notifications differently
        if (!active || alwaysPlay) playSound();
        if (!active) showNotification(e);
    }

    //
    // Sound
    //

    var playSound = (function () {

        var audio, current;

        function play(name) {
            if (name !== current) {
                current = name;
                audio = new Audio(ox.base + '/apps/io.ox/chat/sounds/' + name);
                audio.volume = 0.4;
            }
            try {
                if (audio) audio.play();
            } catch (e) {
                // play() might throw an exception if the browser is inactive for too long
                if (ox.debug) console.error(e);
            }
        }

        // audio preview when changing sounds in settings
        settings.on('change:sounds/file', function (file) {
            if (_.device('smartphone')) return;
            play(file);
        });

        return _.throttle(function () {
            if (!settings.get('sounds/enabled')) return;
            play(settings.get('sounds/file'));
        }, 600);

    }());

    //
    // Native Desktop Notifications
    //

    var showNotification = (function () {

        function getIcon(model, opt) {
            var def = new $.Deferred(),
                iconFallback = opt.isMultiple
                    ? ox.base + '/apps/themes/default/fallback-image-group.png'
                    : ox.base + '/apps/themes/default/fallback-image-contact.png';
            if (opt.isMultiple) {
                if (model.get('icon')) {
                    api.requestBlobUrl({ url: model.getIconUrl() }).then(function (icon) {
                        def.resolve(icon);
                    });
                } else {
                    def.reject(iconFallback);
                }
            } else {
                var icon = contactsApi.pictureHalo(null, { email: opt.message.get('sender') }, { urlOnly: true, width: 120, height: 120, scaleType: 'containforcedimension' });
                $(new Image()).one('load error', function (e) {
                    if (this.width === 1 || e.type === 'error') return def.reject(iconFallback);
                    def.resolve(icon);
                }).attr('src', icon);
            }
            return def;
        }

        function getBody(opt) {
            var previewLength = settings.get('notificationPreviewLength', 100),
                fileContent, body;

            // decide which file emoticon to use depending on mimetype
            if (opt.message.get('type') === 'file') {
                switch (util.getClassFromMimetype(opt.message.get('files')[0].mimetype)) {
                    case 'image':
                        fileContent = '📷 ' + gt('Picture');
                        break;
                    default:
                        fileContent = '📄 ' + opt.message.get('files')[0].name;
                        break;
                }
            }
            body = fileContent ? fileContent : opt.message.get('content');
            if (opt.isMultiple) body = opt.originator + ': ' + body; // prepend name to body if from group
            if (body.length > previewLength) body = body.slice(0, previewLength) + '...';

            return body;
        }

        return _.throttle(function (e) {
            if (!settings.get('showChatNotifications')) return;
            var model = e.room,
                opt = {
                    isMultiple: model.isGroup() || model.isChannel(),
                    message: e.message,
                    originator: data.users.getByMail(e.message.get('sender')).getName()
                };

            getIcon(model, opt).always(function (iconUrl) {
                var title = opt.isMultiple ? model.get('title') : opt.originator,
                    options = {
                        body: getBody(opt),
                        icon: iconUrl
                    };
                var notification = new Notification(title, options);
                notification.onclick = function () {
                    window.focus();
                    events.trigger('cmd', { cmd: 'show-chat', id: model.get('roomId') });
                };
                return notification;
            });
        }, 600);
    }());
});
