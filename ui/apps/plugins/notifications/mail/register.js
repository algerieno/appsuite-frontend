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
 * @author Mario Scheliga <mario.scheliga@open-xchange.com>
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 * @author Daniel Dickhaus <daniel.dickhaus@open-xchange.com>
 */

define('plugins/notifications/mail/register', [
    'io.ox/mail/api',
    'io.ox/core/extensions',
    'gettext!plugins/notifications',
    'io.ox/mail/util',
    'io.ox/core/settings/util',
    'io.ox/core/folder/api',
    'io.ox/core/api/account',
    'io.ox/core/capabilities',
    'io.ox/backbone/mini-views',
    'io.ox/core/desktopNotifications',
    'io.ox/contacts/api',
    'settings!io.ox/mail',
    'io.ox/core/tk/sounds-util'
], function (api, ext, gt, util, formUtil, folderApi, account, cap, miniViews, desktopNotifications, contactsApi, settings, soundUtil) {

    'use strict';

    var lastCount = -1,
        DURATION = 5 * 1000, // miliseconds to show the notification
        iconPath = ox.base + '/apps/themes/default/fallback-image-contact.png'; // fallbackicon shown in desktop notification

    function filter(model) {
        // ignore virtual/all (used by search, for example) and unsubscribed folders
        if (!model.get('subscribed') || (/^default0\/virtual/.test(model.id))) return false;
        return /^default0\D/.test(model.id) && !account.is('spam|trash|unseen', model.id) && (folderApi.getSection(model.get('type')) === 'private');
    }

    // show desktopNotification (if enabled) for a new mail
    function newMailDesktopNotification(message) {

        // some mailservers do not send extra data like sender and subject, check this here
        var text = message.subject || gt('No subject');

        // Dovecot has extra field "teaser"
        if (message.teaser) text += '\n\n' + message.teaser;
        // get email for picture halo
        var imageURL = message.email ? contactsApi.pictureHalo(null, {
            email: message.email }, { urlOnly: true, width: 120, height: 120, scaleType: 'containforcedimension' }) : iconPath;
        // check if user has an image, otherwise use fallback image
        $(new Image()).one('load error', function (e) {
            if (this.width === 1 || e.type === 'error') {
                // use fallback image
                imageURL = iconPath;
            }
            desktopNotifications.show({
                title: message.displayname || message.email || gt('New mail'),
                body: text,
                icon: imageURL,
                duration: DURATION,
                onclick: function () {
                    window.focus();
                    ox.launch('io.ox/mail/main', { folder: message.folder });
                }
            });
        }).attr('src', imageURL);
    }

    var update = _.debounce(function () {

        var app = ox.ui.apps.get('io.ox/mail') || ox.ui.apps.get('io.ox/mail/placeholder');
        if (!app) return;

        // get relevant folder models and sum up unread messages
        var count = _(folderApi.pool.models)
            .chain()
            .filter(filter)
            .reduce(function (sum, model) {
                return sum + (model && model.get('unread')) || 0;
            }, 0)
            .value();

        if (count !== lastCount) {
            api.trigger('all-unseen', count);
            lastCount = count;
        }

        // don't let the badge grow infinite
        if (count > 999) count = '999+';

        //#. %1$d number of notifications
        app.setCounter(count, { arialabel: gt('%1$d unread mails', count) });

    }, 100);

    // add a badge to mailapp in the topbar
    ext.point('io.ox/core/notifications/badge').extend({
        id: 'mail',
        index: 100,
        register: function () {
            folderApi.on('change:unread', update);
            folderApi.on('pool:add', update);
            update();
        }
    });

    var ids = new Backbone.Collection();

    // new mail title and desktop notifications
    // removes mails of a whole folder from notificationview
    function removeFolder(folder) {
        var mails = _.compact(_(ids.models).map(function (item) {
            if (item.attributes.folder_id === folder) {
                return item.attributes.id;
            }
        }));
        if (mails.length > 0) {
            ids.remove(mails);
        }
    }
    function checkNew(items) {
        var newIds = _(items).map(function (item) {
                return item.folder_id + '.' + item.id;
            }),
            oldIds = _(ids.models).map(function (model) {
                return model.get('folder_id') + '.' + model.get('id');
            }),
            newItems = _.difference(newIds, oldIds);

        // only show these if there is not already the websocket push listening
        if (newItems.length && !cap.has('websocket')) {
            // if theres multiple items or no specific notification given, use the generic
            if (newItems.length > 1) {
                desktopNotifications.show({
                    title: gt('New mails'),
                    body: gt('You have new mail'),
                    icon: iconPath
                });
            } else {
                api.get(_.extend({}, _.cid(newItems[0]), { unseen: true })).then(function (data) {
                    var from = data.from || [['', '']],
                        //#. %1$s mail sender
                        //#. %2$s mail subject
                        //#, c-format
                        message = gt('Mail from %1$s, %2$s', util.getDisplayName(from[0]), data.subject || gt('No subject'));
                    desktopNotifications.show({
                        title: gt('New mail'),
                        body: message,
                        icon: iconPath
                    });
                });
            }

        }
    }

    // special add function to consider mails that might have been read elsewhere (didn't throw update:set-seen in appsuite)
    api.on('new-mail', function (e, recent, unseen) {
        var whitelist = _(unseen).map(function (item) { return item.id; }),
            collectionIds = _(ids.models).map(function (item) { return item.attributes.id; }),
            idsToRemove = _.difference(collectionIds, whitelist);

        if (idsToRemove.length > 0) {
            ids.remove(idsToRemove);
        }

        checkNew(recent);
        ids.add(recent);

        if (ids.models.length === 0) {
            api.newMailTitle(false);
        }
    });

    api.on('deleted-mails update:set-seen', function (e, param) {
        if (_.isArray(param)) {
            ids.remove(param);
        } else {
            removeFolder(param);
        }

        if (ids.length === 0) {
            api.newMailTitle(false);
        }
    });

    api.checkInbox();

    // play sound and/or show notification on new mail
    ox.on('socket:mail:new', function (message) {
        // update counters
        update();
        // play sound
        if (settings.get('playSound')) soundUtil.playSound();
        // show notification
        newMailDesktopNotification(message);
    });

    return true;
});
