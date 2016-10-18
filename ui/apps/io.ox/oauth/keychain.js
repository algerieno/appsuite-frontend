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
 * @author Francisco Laguna <francisco.laguna@open-xchange.com>
 */

 /**
 The keychain plugin. Use io.ox/keychain/api to interact with OAuth accounts
 **/

define.async('io.ox/oauth/keychain', [
    'io.ox/core/extensions',
    'io.ox/core/http',
    'io.ox/core/event',
    'io.ox/core/notifications',
    'io.ox/core/api/filestorage',
    'io.ox/oauth/backbone',
    'gettext!io.ox/core'
], function (ext, http, Events, notifications, filestorageApi, OAuth, gt) {

    'use strict';

    var moduleDeferred = $.Deferred(),
        accounts = new OAuth.Account.Collection(),
        point = ext.point('io.ox/keychain/api'),
        ServiceModel = Backbone.Model.extend({
            initialize: function () {
                var keychainAPI = new OAuthKeychainAPI(this.toJSON());

                // add initialized listener before extending (that triggers the initialized event)
                keychainAPI.one('initialized', function () {
                    // trigger refresh if we have accounts or the settings account list might miss Oauth accounts due to race conditions
                    if (accounts.length > 0) {
                        keychainAPI.trigger('refresh.all');
                    }
                });

                point.extend(keychainAPI);

                this.keychainAPI = keychainAPI;
            }
        }),
        ServiceCollection = Backbone.Collection.extend({
            model: ServiceModel,
            forAccount: function (account) {
                return this.get(account.get('serviceId'));
            },
            withShortId: function (shortId) {
                return this.filter(function (service) {
                    return simplifyId(service.id) === shortId;
                })[0];
            }
        }),
        services = new ServiceCollection();

    var generateId = function () {
        generateId.id = generateId.id + 1;
        return generateId.id;
    };

    generateId.id = 1;

    function simplifyId(id) {
        return id.substring(id.lastIndexOf('.') + 1);
    }

    // Extension
    function OAuthKeychainAPI(service) {
        var self = this;

        Events.extend(this);

        this.id = simplifyId(service.id);
        this.displayName = service.displayName;

        function outgoing(account) {
            if (!account) {
                return account;
            }
            account.accountType = self.id;
            return account;
        }

        function chooseDisplayName() {
            var names = {}, name, counter = 0;
            _(accounts.forService(service.id)).each(function (account) {
                names[account.displayName] = 1;
            });

            name = 'My ' + service.displayName + ' account';

            while (names[name]) {
                counter++;
                name = 'My ' + service.displayName + ' account (' + counter + ')';
            }
            return name;
        }

        this.getAll = function () {
            return _(accounts.forService(service.id)).chain()
                .map(function (account) { return account.toJSON(); })
                .sortBy(function (account) { return account.id; })
                .map(outgoing)
                .value();
        };

        this.get = function (id) {
            return outgoing(accounts.get(id).toJSON());
        };

        this.getStandardAccount = function () {
            return outgoing(_(this.getAll()).first());
        };

        this.hasStandardAccount = function () {
            return this.getAll().length > 0;
        };

        this.createInteractively = function (popupWindow, scopes) {
            scopes = [].concat(scopes || []);

            var def = $.Deferred();

            // the popup must exist already, otherwise we run into the popup blocker
            if (!popupWindow) return def.reject();

            var newAccount = new OAuth.Account.Model({
                displayName: chooseDisplayName(),
                serviceId: service.id,
                popup: popupWindow
            });

            newAccount.enableScopes(scopes);

            return newAccount.save().then(function (account) {
                accounts.add(newAccount);
                ox.trigger('refresh-portal');
                notifications.yell('success', gt('Account added successfully'));
                return account;
            }, function () {
                notifications.yell('error', gt('Account could not be added'));
            });
        };

        this.remove = function (account) {
            account = accounts.get(account.id);

            return account.destroy().then(function () {
                var filestorageAccount;
                // if rampup failed, ignore filestorages, maybe the server does not support them
                if (filestorageApi.rampupDone) {
                    filestorageAccount = filestorageApi.getAccountForOauth(account.toJSON());
                    // if there is a filestorageAccount for this Oauth account, remove it too
                    if (filestorageAccount) {
                        // use softDelete parameter to only cleanup caches. Backend removes the filestorage account automatically, so we don't need to send a request
                        filestorageApi.deleteAccount(filestorageAccount, { softDelete: true });
                    }
                }
            });
        };

        this.update = function (data) {
            var account = accounts.get(data.id);
            account.set(data);

            return account.save().then(function () {
                var filestorageAccount;
                // if rampup failed, ignore filestorages, maybe the server does not support them
                if (filestorageApi.rampupDone) {
                    filestorageAccount = filestorageApi.getAccountForOauth(account.toJSON());
                }

                // if there is a filestorageAccount for this Oauth account, update it too. Changes foldername in drive
                if (filestorageAccount) {
                    var options = filestorageAccount.attributes;
                    options.displayName = account.get('displayName');

                    return $.when(account.toJSON(), filestorageApi.updateAccount(options));
                }
                return account.toJSON();
            }).done(function () {
                self.trigger('refresh.list', account.toJSON());
            });
        };

        this.reauthorize = function (account) {
            account = accounts.get(account.id);
            if (!account) return $.Deferred().reject();

            return account.reauthorize().then(function () {
                ox.trigger('refresh-portal');
                return account.toJSON();
            }, function (e) {
                notifications.yell('error', e.error);
            });
        };
        if (_.contains(['xing', 'twitter', 'linkedin', 'boxcom', 'dropbox', 'google', 'msliveconnect', 'yahoo'], this.id)) {
            this.canAdd = function () {
                return self.getAll().length === 0;
            };
        }
    }

    function getAll() {
        // Fetch services & accounts
        return $.when(
            http.GET({
                module: 'oauth/services',
                params: {
                    action: 'all'
                }
            }),
            http.GET({
                module: 'oauth/accounts',
                params: {
                    action: 'all'
                }
            }))
            .then(function (s, a) {
                services.add(s[0]);
                accounts.add(a[0]);
                return $.when(services, accounts);
            });
    }

    getAll().done(function (services, accounts) {

        accounts.listenTo(accounts, 'add remove', function (model) {
            var service = services.forAccount(model);
            service.keychainAPI.trigger('refresh.all refresh.list', model.toJSON());
            // Some standard event handlers
            require(['plugins/halo/api'], function (haloAPI) {
                haloAPI.halo.refreshServices();
            });
        });

        // rampup filestorageApi. Success or failure is unimportant here. Resolve loading in any case
        filestorageApi.rampup().then(function () {
            // perform consistency check for filestorage accounts (there might be cases were they are out of sync)
            // we delay it so it doesn't prolong appsuite startup
            _.delay(filestorageApi.consistencyCheck, 5000);
        }).always(function () {
            // Resolve loading
            moduleDeferred.resolve({
                message: 'Done with oauth keychain',
                services: services,
                accounts: accounts,
                serviceIDs: services.map(function (service) { return simplifyId(service.id); })
            });
        });
    })
    .fail(function () {

        console.error('Could not initialize OAuth keyring!');
        // rampup filestorageApi. Success or failure is unimportant here. Resolve loading in any case
        filestorageApi.rampup().always(function () {
            // Resolve on fail
            moduleDeferred.resolve({ message: 'Init failed', services: [], accounts: [], serviceIDs: [] });
        });
    });

    ox.on('http:error:OAUTH-0040', function (err) {
        //do not yell
        err.handled = true;
        if ($('.modal.oauth-reauthorize').length > 0) return;

        require(['io.ox/backbone/views/modal']).then(function (ModalDialog) {
            new ModalDialog({ title: gt('Error') })
            .extend({
                default: function () {
                    this.$el.addClass('oauth-reauthorize');
                },
                text: function () {
                    this.$body.append(err.error);
                }
            })
            .addCancelButton()
            .addButton({
                action: 'reauthorize',
                label: gt('Reauthorize')
            })
            .on('reauthorize', function () {
                var service = services.get(err.error_params[4]),
                    account = accounts.get(err.error_params[1]),
                    api = new OAuthKeychainAPI(service.toJSON());

                api.reauthorize(account.toJSON());
            })
            .open();
        });
    });

    return moduleDeferred;
});
