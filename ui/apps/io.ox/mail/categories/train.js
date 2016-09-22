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
 * @author Frank Paczynski <frank.paczynski@open-xchange.com>
 */

define('io.ox/mail/categories/train', [
    'io.ox/mail/categories/api',
    'io.ox/core/yell',
    'gettext!io.ox/mail'
], function (api, yell, gt) {

    'use strict';

    function createSenderList(carrier) {
        carrier.senderlist = _.chain(carrier.maillist)
                .map(function (mail) { return mail.from[0][1]; })
                .uniq()
                .value();
        return carrier;
    }

    function createTextLines(carrier) {
        carrier.textlines = {
            success: gt.format(
                //#. successfully moved a message via drag&drop to another mail category (tab)
                //#. %1$s represents the name if the target category
                //#, c-format
                gt.ngettext('Message moved to to category "%1$s".', 'Messages moved to category "%1$s".', carrier.maillist.length),
                _.escape(carrier.options.targetname)
            ),
            question: gt.format(
                //#. ask user to move all messages from the same sender to the mail category (tab)
                //#. %1$s represents a email address
                //#, c-format
                gt.ngettext(
                    'Do you want to move all messages from %1$s to that category?',
                    'Do you want to move all messages from selected senders to that category?',
                    carrier.senderlist.length
                ),
                '<b>' + _.escape(carrier.senderlist) + '</b>'
            )
        };
        return carrier;
    }

    function createContentString(carrier) {
        carrier.contentstring = $('<tmp>').append(
            $('<div class="content">').append(
                $('<p class="status">').html(carrier.textlines.success),
                $('<p>').html(carrier.textlines.question),
                $('<button role="button" class="btn btn-default btn-primary" data-action="move-all">').text(gt('Move all'))
            )
        ).html();
        return carrier;
    }

    function yellOut(carrier) {
        carrier.node = yell({
            message: carrier.contentstring,
            html: true,
            duration: -1
        })
        .addClass('category-toast')
        .on('click', '.btn-primary', function () {
            api.train(carrier.options).fail(yell);
            yell('close');
        });
        return carrier;
    }

    return {

        open: function (options) {
            var carrier = { maillist: options.data, options: options },
                pipeline = _.pipe(carrier);

            pipeline
                .then(createSenderList)
                .then(createTextLines)
                .then(createContentString)
                .then(yellOut);
        }
    };
});
