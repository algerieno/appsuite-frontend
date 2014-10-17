/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2011 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Francisco Laguna <francisco.laguna@open-xchange.com>
 */

define('io.ox/core/settings/pane',
    ['io.ox/core/extensions',
     'io.ox/backbone/basicModel',
     'io.ox/backbone/views',
     'io.ox/backbone/forms',
     'io.ox/core/api/apps',
     'io.ox/core/capabilities',
     'io.ox/core/notifications',
     'plugins/portal/userSettings/register',
     'settings!io.ox/core',
     'settings!io.ox/core/settingOptions',
     'gettext!io.ox/core'
    ], function (ext, BasicModel, views, forms, appAPI, capabilities, notifications, userSettings, settings, settingOptions, gt) {

    'use strict';

    var point = views.point('io.ox/core/settings/entry'),
        SettingView = point.createView({ tagName: 'form', className: 'form-horizontal'}),
        reloadMe = ['language', 'timezone', 'theme'];

    ext.point('io.ox/core/settings/detail').extend({
        index: 50,
        id: 'extensions',
        draw: function () {
            var model = settings.createModel(BasicModel);
            model.on('change:highcontrast', function (m, value) {
                $('html').toggleClass('high-contrast', value);
            });
            model.on('change', function (model) {
                settings.saveAndYell().then(
                    function success() {

                        var showNotice = _(reloadMe).any(function (attr) {
                            return model.changed[attr];
                        });

                        if (showNotice) {
                            notifications.yell(
                                'success',
                                gt('The setting requires a reload or relogin to take effect.')
                            );
                        }
                    }
                );
            });
            this.addClass('settings-container').append(
                $('<h1>').text(gt('Basic settings'))
            );
            new SettingView({model: model}).render().$el.attr('role', 'form').appendTo(this);
        }
    });

    //
    // My contact data
    //

    point.basicExtend({
        id: 'my-contact-data',
        index: '10000',
        draw: function () {
            this.append(
                $('<div data-extension-id="my-contact-data">').append(
                    $('<div class="form-group">').append(
                        $('<label class="control-label col-sm-4">'),
                        $('<div class="col-sm-4">').append(
                            $('<button type="button" class="btn btn-default" tabindex="1">')
                            .text(gt('My contact data') + ' ...')
                            .on('click', function () {
                                require(['io.ox/core/settings/user'], function (userSettings) {
                                    userSettings.openModalDialog();
                                });
                            })
                        )
                    )
                )
            );
        }
    });

    //
    // Change password
    //

    if (capabilities.has('edit_password')) {
        point.basicExtend({
            id: 'change-password',
            index: '11000',
            draw: function () {
                this.append(
                    $('<div data-extension-id="change-password">').append(
                        $('<div class="form-group">').append(
                            $('<label class="control-label col-sm-4">'),
                            $('<div class="col-sm-4">').append(
                                $('<button type="button" class="btn btn-default" tabindex="1">')
                                .text(gt('Change password') + ' ...')
                                .on('click', userSettings.changePassword)
                            )
                        )
                    )
                );
            }
        });
    }

    point.extend(new forms.SelectControlGroup({
        id: 'language',
        index: 100,
        labelCssClass: 'col-sm-4',
        controlCssClass: 'col-sm-4',
        attribute: 'language',
        label: gt('Language'),
        selectOptions: ox.serverConfig.languages || {},
        updateModel: function () {
            var value = this.nodes.element.val();
            this.model.set(this.attribute, value, {validate: true});
            _.setCookie('language', value);
        }
    }));

    (function () {
        // Timezones
        var available = settingOptions.get('availableTimeZones'),
            technicalNames = _(available).keys(),
            userTZ = settings.get('timezone', 'UTC'),
            sorted = {};

        // Sort the technical names by the GMT offset
        technicalNames.sort(function (a, b) {
            var va = available[a],
                vb = available[b],
                diff = Number(va.substr(4, 3)) - Number(vb.substr(4, 3));
            if (diff === 0 || _.isNaN(diff)) {
                return (vb === va) ? 0 : (va < vb) ? -1 : 1;
            } else {
                return diff;
            }
        });

        // filter double entries and sum up results in 'sorted' array
        for (var i = 0; i < technicalNames.length; i++) {
            var key = technicalNames[i],
                key2 = technicalNames[i + 1];
            if (key2 && available[key] === available[key2]) {
                if (key2 === userTZ) {
                    sorted[key2] = available[key2];
                } else {
                    sorted[key] = available[key];
                }
                i++;
            } else {
                sorted[key] = available[key];
            }
        }

        point.extend(new forms.SelectControlGroup({
            id: 'timezones',
            index: 200,
            labelCssClass: 'col-sm-4',
            controlCssClass: 'col-sm-4',
            attribute: 'timezone',
            label: gt('Time zone'),
            selectOptions: sorted
        }));

        // Themes
        var availableThemes = settingOptions.get('themes') || {};

        //  until we get translated themes from backend
        if (availableThemes['default']) {
            availableThemes['default'] = gt('Default Theme');
        }

        if (!_(availableThemes).isEmpty() && settings.isConfigurable('theme')) {
            point.extend(new forms.SelectControlGroup({
                id: 'theme',
                index: 400,
                labelCssClass: 'col-sm-4',
                controlCssClass: 'col-sm-4',
                attribute: 'theme',
                label: gt('Theme'),
                selectOptions: availableThemes
            }));
        }

        point.extend(new forms.CheckControlGroup({
            id: 'highcontrast',
            index: 401,
            labelCssClass: 'col-sm-4',
            controlCssClass: 'col-sm-4',
            attribute: 'highcontrast',
            label: gt('High contrast theme')
        }));

    }());

    (function () {
        if (settings.isConfigurable('refreshInterval')) {
            var MINUTES = 60000;
            var options = {};

            options[5 * MINUTES] = gt('5 minutes');
            options[10 * MINUTES] = gt('10 minutes');
            options[15 * MINUTES] = gt('15 minutes');
            options[30 * MINUTES] = gt('30 minutes');

            point.extend(new forms.SelectControlGroup({
                id: 'refreshInterval',
                index: 300,
                labelCssClass: 'col-sm-4',
                controlCssClass: 'col-sm-4',
                attribute: 'refreshInterval',
                label: gt('Refresh interval'),
                selectOptions: options
            }));
        }
    }());

    // Auto Start App

    (function () {
        if (settings.isConfigurable('autoStart')) {
            var options = {};
            _(appAPI.getFavorites()).each(function (app) {
                options[app.path] = /*#, dynamic*/gt.pgettext('app', app.title);
            });

            options.none = gt('None');
            point.extend(new forms.SelectControlGroup({
                id: 'autoStart',
                index: 500,
                labelCssClass: 'col-sm-4',
                controlCssClass: 'col-sm-4',
                attribute: 'autoStart',
                label: gt('Default app after sign in'),
                selectOptions: options
            }));
        }
    }());

    // Auto open notification area
    (function () {
        var options = {};

        options.never = gt('Never');
        options.noEmail = gt('On new notifications except mails');
        options.always = gt('On every new notification');

        if (settings.isConfigurable('autoOpenNotificationarea')) {
            point.extend(new forms.SelectControlGroup({
                id: 'autoOpenNotfication',
                index: 700,
                labelCssClass: 'col-sm-4',
                controlCssClass: 'col-sm-4',
                attribute: 'autoOpenNotification',
                label: gt('Automatic opening of notification area'),
                selectOptions: options
            }));
        }
    }());

    // Auto Logout

    (function () {
        var MINUTES = 60000,
            options = {};

        options[0] = gt('Off');
        options[5 * MINUTES] = gt('5 minutes');
        options[10 * MINUTES] = gt('10 minutes');
        options[15 * MINUTES] = gt('15 minutes');
        options[30 * MINUTES] = gt('30 minutes');

        point.extend(new forms.SelectControlGroup({
            id: 'autoLogout',
            index: 600,
            labelCssClass: 'col-sm-4',
            controlCssClass: 'col-sm-4',
            attribute: 'autoLogout',
            label: gt('Automatic sign out'),
            selectOptions: options,
            updateModel: function () {
                this.setValueInModel(this.nodes.element.val());
                ox.autoLogout.restart();
            }
        }));

    }());

    // point.basicExtend({
    //     id: 'clearCache',
    //     index: 200000,
    //     draw: function () {
    //         this.append(
    //             $('<button type="button" class="btn btn-default">').text(gt("Clear cache")).on("click", function (e) {
    //                 e.preventDefault();
    //                 require(["io.ox/core/cache"], function () {
    //                     ox.cache.clear();
    //                 });
    //             })
    //         );
    //     }
    // });
});
