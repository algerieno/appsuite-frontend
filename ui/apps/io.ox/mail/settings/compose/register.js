/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2017 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/mail/settings/compose/register', [
    'io.ox/core/extensions',
    'gettext!io.ox/mail'
], function (ext, gt) {

    'use strict';

    ext.point('io.ox/settings/pane/main/io.ox/mail').extend({
        id: 'io.ox/mail/settings/compose',
        title: gt('Compose'),
        ref: 'io.ox/mail/settings/compose',
        index: 100
    });
});
