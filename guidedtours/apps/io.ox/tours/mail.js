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
 * @author Tobias Prinz <tobias.prinz@open-xchange.com>
 * @author Julian Bäume <julian.baeume@open-xchange.com>
 */

define('io.ox/tours/mail', [
    'io.ox/core/tk/wizard',
    'io.ox/core/notifications',
    'io.ox/tours/utils',
    'settings!io.ox/core',
    'gettext!io.ox/tours'
], function (Tour, notifications, utils, settings, gt) {

    'use strict';

    var composeApp;

    Tour.registry.add({
        id: 'default/io.ox/mail',
        app: 'io.ox/mail',
        priority: 1
    }, function () {
        var emailTour = new Tour()
        .step()
            .title(gt('Composing a new email'))
            .content(gt('To compose a new email, click on Compose in the toolbar.'))
            .hotspot('.io-ox-mail-window .primary-action .btn:visible, .classic-toolbar [data-action="io.ox/mail/actions/compose"]:visible')
            .on('next', function () {
                if (composeApp) {
                    if (composeApp.getWindow().floating.model.get('minimized')) composeApp.getWindow().floating.model.set('minimized', false);
                    return;
                }
                ox.registry.call('mail-compose', 'open').then(function (result) {
                    composeApp = result.app;
                });
            })
            .end()
        .step()
            .title(gt('Entering the recipient\'s name'))
            .content(gt('Enter the recipient\'s name into the recipients field. As soon as you typed the first letters, suggestions from the address books are displayed. To accept a recipient suggestion, click on it.'))
            .waitFor('.io-ox-mail-compose-window:visible:last .subject:visible')
            .hotspot('.active [data-extension-id=to] .tokenfield.to')
            .on('back', function () {
                if (composeApp && !composeApp.getWindow().floating.model.get('minimized')) {
                    composeApp.getWindow().floating.onMinimize();
                }
            })
            .end()
        .step()
            .title(gt('Entering the subject'))
            .content(gt('Enter the subject into the subject field.'))
            .hotspot('.active [data-extension-id=subject] input')
            .end()
        .step()
            .title(gt('Further functions'))
            .content(gt('In this area you can find further functions, e.g. for adding attachments.'))
            .hotspot('.active [data-extension-id=composetoolbar] > div:first')
            .end()
        .step()
            .title(gt('Entering the email text'))
            .content(gt('Enter the email text into the main area. If the text format was set to HTML in the options, you can format the email text. To do so select a text part and then click an icon in the formatting bar.'))
            .referTo('.io-ox-mail-compose-container')
            .hotspot('.active .io-ox-mail-compose.container .editor .editable')
            .end()
        .step()
            .title(gt('Sending the email'))
            .content(gt('To send the email, click on Send'))
            .hotspot('.io-ox-mail-compose-window.active button[data-action=send]')
            .on('before:show', function () {
                if (composeApp && composeApp.getWindow().floating.model.get('minimized')) {
                    composeApp.getWindow().floating.model.set('minimized', false);
                }
            })
            .end()
        .step()
            .on('before:show', function () {
                if (composeApp && !composeApp.getWindow().floating.model.get('minimized')) {
                    composeApp.getWindow().floating.onMinimize();
                }
            })
            .title(gt('Sorting your emails'))
            .content(gt('To sort the emails, click on Sort by. Select a sort criteria.'))
            .waitFor('.io-ox-mail-window')
            .hotspot('.list-view-control > .toolbar > .dropdown:last')
            .navigateTo('io.ox/mail/main')
            .end()
        .step()
            .title(gt('Selecting a view'))
            .content(gt('To choose between the different views, click on View in the toolbar. Select a menu entry in the layout.'))
            .spotlight('.classic-toolbar [data-dropdown="view"] ul a[data-name="layout"]')
            .referTo('.classic-toolbar [data-dropdown="view"] ul')
            .waitFor('.classic-toolbar [data-dropdown="view"] ul a[data-name="layout"]')
            .on('wait', function () {
                $('.classic-toolbar [data-dropdown="view"] ul').css('display', 'block');
            })
            .on('hide', function () {
                $('.classic-toolbar [data-dropdown="view"] ul').css('display', '');
            })
            .end()
        .step()
            .title(gt('Opening an email in a separate window'))
            .content(gt('If double-clicking on an email in the list, the email is opened in a separate window.'))
            .spotlight('.list-view.mail-item > li.list-item:first')
            .end()
        .step()
            .title(gt('Reading email conversations'))
            .content(gt('To open or close an email in a conversation, click on a free area in the header.'))
            .hotspot('.thread-view .detail-view-header')
            .end()
        .step()
            .title(gt('Halo view'))
            .content(gt('To receive information about the sender or other recipients, open the Halo view by clicking on a name.'))
            .hotspot('.halo-link')
            .end();

        if (settings.get('selectionMode') !== 'alternative') {
            emailTour.step()
                .title(gt('Editing multiple emails'))
                .content(gt('In order to edit multiple emails at once, enable the checkboxes on the left side of the emails. If the checkboxes are not displayed, click on View > Checkboxes on the right side of the toolbar.'))
                .hotspot('.classic-toolbar [data-dropdown="view"] ul a[data-name="checkboxes"]')
                .referTo('.classic-toolbar [data-dropdown="view"] ul')
                .waitFor('.classic-toolbar [data-dropdown="view"] ul a[data-name="checkboxes"]')
                .on('wait', function () {
                    $('.classic-toolbar [data-dropdown="view"] ul').css('display', 'block');
                })
                .on('hide', function () {
                    $('.classic-toolbar [data-dropdown="view"] ul').css('display', '');
                })
                .end();
        }
        emailTour.step()
            .title(gt('Opening the email settings'))
            .content(gt('To open the email settings, click the Settings menu icon on the upper right side of the menu bar. Select Settings. Click on Mail on the left side.'))
            .hotspot('#io-ox-topbar-settings-dropdown-icon i', { top: 12, left: 6 })
            .spotlight('#topbar-settings-dropdown')
            .waitFor('#topbar-settings-dropdown')
            .on('wait', function () { $('#io-ox-topbar-settings-dropdown-icon .dropdown-toggle').click(); $('#io-ox-topbar-settings-dropdown-icon').attr('forceOpen', true); })
            .on('hide', function () { $('#io-ox-topbar-settings-dropdown-icon .dropdown-toggle').click(); $('#io-ox-topbar-settings-dropdown-icon').attr('forceOpen', false); })
            .end()
        .on('stop', function () {
            if (composeApp) {
                //prevent app from asking about changed content
                composeApp.view.dirty(false);
                composeApp.quit();
                composeApp = null;
            }
        })
        .start();
    });
});
