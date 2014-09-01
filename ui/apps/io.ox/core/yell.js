/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2014 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/core/yell', ['gettext!io.ox/core'], function (gt) {

    'use strict';

    var validType = /^(busy|error|info|success|warning|screenreader)$/,

        durations = {
            busy: 10000,
            error: 30000,
            info: 10000,
            success: 4000,
            warning: 10000,
            screenreader: 100,
        },

        icons = {
            busy: 'fa fa-refresh fa-spin',
            error: 'fa fa-exclamation',
            info: 'fa fa-exclamation',
            success: 'fa fa-check',
            warning: 'fa fa-exclamation'
        },

        timer = null;

    function remove() {
        clearTimeout(timer);
        $('.io-ox-alert').trigger('notification:removed').remove();
    }

    function click (e) {

        var alert = $('.io-ox-alert');
        if (alert.length === 0) return;

        if (_.device('smartphone')) return remove();

        // close if clicked outside notifications
        if (!$.contains(alert.get(0), e.target)) return remove();

        // click on close?
        if ($(e.target).closest('.close').length) return remove();
    }

    $(document).on(_.device('touch') ? 'tap.yell' : 'click.yell', click);

    return function yell(type, message, focus) {

        if (type === 'destroy' || type === 'close') return remove();

        var o = {
            duration: 0,
            html: false,
            type: 'info',
            focus: false
        };

        if (_.isObject(type)) {
            // catch server error?
            if ('error' in type) {
                o.type = 'error';
                o.message = type.message || type.error;
                o.headline = gt('Error');
            } else {
                o = _.extend(o, type);
            }
        } else {
            o.type = type || 'info';
            o.message = message;
            o.focus = focus;
        }

        // add message
        if (!validType.test(o.type)) return;

        if (o.type !== 'screenreader') { //screenreader notifications should not remove standard ones, so special remove here
            clearTimeout(timer);
            timer = o.duration === -1 ? null : setTimeout(remove, o.duration || durations[o.type] || 5000);
        } else {
            setTimeout(function () {
                $('.io-ox-alert-screenreader').remove();
            }, o.duration || durations[o.type] || 100);
        }

        var html = o.html ? o.message : _.escape(o.message).replace(/\n/g, '<br>'),
            className = 'io-ox-alert io-ox-alert-' + o.type + (o.type === 'screenreader' ? ' sr-only' : ''),
            wordbreak = html.indexOf('http') >= 0 ? 'break-all' : 'normal',
            node = $('<div tabindex="-1">');

        // replace existing alert?
        var alert = $('.io-ox-alert');

        if (alert.length) {
            className += ' appear';
            alert.remove();
        }

        node.attr('class', className).append(
            $('<div class="icon">').append(
                $('<i>').addClass(icons[o.type] || 'fa fa-fw')
            )
        );

        // DO NOT REMOVE! We need to use defer here, otherwise screenreaders don't read the alert correctly.
        _.defer(function () {
            node.append(
                $('<div role="alert" aria-live="polite" class="message user-select-text">').append(
                    o.headline ? $('<h2 class="headline">').text(o.headline) : [],
                    $('<div>').css('word-break', wordbreak).html(html)
                )
            );
        });

        if (o.type !== 'screenreader') {
            node.append(
                $('<a href="#" role="button" class="close" tabindex="1">').append(
                    $('<i class="fa fa-times" aria-hidden="true">'),
                    $('<span class="sr-only">').text(gt('Click to close this notification')))
            );
        }

        $('#io-ox-core').append(node);

        // put at end of stack not to run into opening click
        setTimeout(function () {

            node.addClass('appear'); // might be already added
            if (o.focus) node.attr('tabindex', 1).focus();

        }, _.device('touch') ? 300 : 0);

        return node;
    };
});
