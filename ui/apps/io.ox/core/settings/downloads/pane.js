/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2013 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/core/settings/downloads/pane',
    ['io.ox/core/extensions',
     'io.ox/core/capabilities',
     'gettext!io.ox/core',
     'settings!io.ox/core',
     'less!io.ox/core/settings/downloads/style'
    ], function (ext, capabilities, gt, settings) {

    'use strict';

    // please no download on mobile devices or when disabled via setting
    if (_.device('!desktop') || settings.get('settings/downloadsDisabled')) return;

    /*
     * Default download: Updater
     */
    if (capabilities.has('oxupdater')) {
        ext.point('io.ox/core/settings/downloads/pane/detail').extend({
            id: 'updater',
            index: 100,
            draw: function () {
                var href = ox.apiRoot + '/updater/installer/oxupdater-install.exe?session=' + ox.session;
                this.append(
                    $('<section>').append(
                        $('<h2>').text(gt('Updater')),
                        $('<p>').append(
                            $('<i class="icon-download-alt">'),
                            $.txt(' '),
                            $('<a>', { href: href, target: '_blank' }).addClass('action').text(gt('Download install file (for Windows)'))
                        ),
                        $('<p>').text(
                            gt('The updater provides a simple installation wizard. Follow the instructions to install the application. ' +
                            'The updater will inform you of any updates for the Connector for Microsoft Outlook, Notifier and Drive. ' +
                            'You can download the updates from within the updater.')
                        )
                    )
                );
            }
        });
    }

    // no download available?
    if (ext.point('io.ox/core/settings/downloads/pane/detail').list().length === 0) return;

    //
    // draw settings pane
    //
    ext.point('io.ox/settings/pane').extend({
        id: 'io.ox/core/downloads',
        index: 'last',
        title: gt('Downloads'),
        pane: 'io.ox/core/settings/downloads/pane',
        advancedMode: true
    });

    ext.point('io.ox/core/settings/downloads/pane').extend({
        draw: function () {
            // headline
            this.addClass('downloads-settings-pane').append(
                $('<h1>').text(gt('Downloads'))
            );
            // draw download items
            ext.point('io.ox/core/settings/downloads/pane/detail').invoke('draw', this);
        }
    });
});
