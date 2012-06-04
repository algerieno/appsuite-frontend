/**
 * All content on this website (including text, images, source code and any
 * other original works), unless otherwise noted, is licensed under a Creative
 * Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * Copyright (C) Open-Xchange Inc., 2006-2011 Mail: info@open-xchange.com
 *
 * @author Francisco Laguna <francisco.laguna@open-xchange.com>
 */

define("io.ox/settings/accounts/email/test",
    ["io.ox/core/extensions", "io.ox/core/api/account",
     "io.ox/settings/main"], function (ext, api, settings) {

    "use strict";


    // test objects


    var TIMEOUT = 5000,

        TESTACCOUNT = {
//          "primary_address": "tester@gmx.net",
//          "mail_protocol": "pop3",
//          "mail_port": 995,
//          "mail_server": "pop.gmx.net",
//          "transport_protocol": "smtp",
//          "transport_port": 465,
//          "transport_server": "mail.gmx.net",
//          "login": "tester@gmx.net",
            "mail_protocol": "pop3",
            "name": "Ein Account",
            "personal": "Tester",
            "unified_inbox_enabled": false,
            "mail_secure": true,
            "password": "test",
            "pop3_refresh_rate": "3",
            "pop3_expunge_on_quit": true,
            "transport_secure": true,
            "transport_login": "tester@gmx.net",
            "transport_password": "test",
            "pop3_storage": "mailaccount",
            "spam_handler": "NoSpamHandler"
        },

        TESTMAILAUTOCONFIG = {
            'email': 'tester@gmx.net',
            'password': 'test'
        };
    //christoph-kopp@gmx.net



     // helpers
    function Done() {
        var f = function () {
            return f.value;
        };
        f.value = false;
        f.yep = function () {
            f.value = true;
        };
        return f;
    }


    /*
     * Suite: Contacts Test
     */
    ext.point('test/suite').extend({
        id: 'email-account-create-api',
        index: 100,
        test: function (j) {
            j.describe("Creates a new Emailaccount via api", function () {

                var dataId, obj;

                j.it('creates a new account', function () {
                    api.create(TESTACCOUNT);
                });

                j.it('gets the id of the created account', function () {

                    j.runs(function () {
                        var me = this;
                        me.ready = false;
                        api.on('account_created', function (e, data) {
                            if (data) {
                                dataId = data.id;
                                me.ready = true;
                            }
                        });

                        j.waitsFor(function () {
                            return this.ready;
                        }, 'catches the id', TIMEOUT);

                    });

                });

                j.it('modifies the account name', function () {

                    j.runs(function () {
                        var me = this;
                        me.ready = false;
                        api.get(dataId).done(function (data) {
                            obj = data;
                            obj.name = 'Ein Account changed';
                            me.ready = true;
                        });

                        j.waitsFor(function () {
                            return this.ready;
                        }, 'update', TIMEOUT);

                    });

                });

//                j.it('updates the account', function () {
//                    var me = this;
//                    me.ready = false;
//                    api.update(obj).done(function (data) {
//                        me.ready = true;
//                        console.log('update');
//                        dataId = data.id;
//                        me.ready = true;
//                    });
//
//
//                    j.waitsFor(function () {
//                        return this.ready;
//                    }, 'update', TIMEOUT);
//
//                });

                j.it('deletes the created account', function () {
//                    console.log('delete');
//                    api.remove([dataId]);
                });

            });
        }
    });

    ext.point('test/suite').extend({
        id: 'email-account-create-ui',
        index: 100,
        test: function (j) {
            j.describe("Creates a new Emailaccount via ui", function () {

                var app = null, accountPane, buttonAdd, buttonAddAutoconf, dialog,
                    buttonSave, detailPane, dataId;

                j.it('opens settings app ', function () {

                    var loaded = new Done();

                    j.waitsFor(loaded, 'Could not load app', TIMEOUT);

                    settings.getApp().launch().done(function () {
                        console.log('is geladen');
                        app = this;
                        loaded.yep();

                        j.waitsFor(function () {
                            accountPane = $('[data-obj-id="io.ox/settings/accounts"]');
                            if (accountPane[0]) {
                                console.log(accountPane);
                                accountPane.trigger('click');
                                return true;
                            }

                        }, 'trigger', TIMEOUT);

                        j.expect(app).toBeTruthy();
                    });
                });

                j.it('hits the add button', function () {

                    j.waitsFor(function () {
                        buttonAdd = $('[data-action="add"]');
                        if (buttonAdd[0]) {
                            return true;
                        }
                    }, 'looks for add button', TIMEOUT);

                    j.runs(function () {
                        buttonAdd.triggerHandler('click');
                    });
                });


                j.it('looks for the autoconf form and the add button', function () {

                    j.waitsFor(function () {
                        dialog = $('.io-ox-dialog-popup');
                        buttonAddAutoconf = $('button.btn-primary');
                        if (dialog[0] && buttonAddAutoconf[0]) {
                            return true;
                        }
                    }, 'looks for dialog', TIMEOUT);

                });

                j.it('fills the form', function () {
                    dialog.find('input').val(TESTMAILAUTOCONFIG.email);
                });

                j.it('hits the add button', function () {

                    j.runs(function () {
                        buttonAddAutoconf.trigger('click');
                    });

                });

                j.it('looks for the add form and save button', function () {

                    j.waitsFor(function () {
                        detailPane = $('.settings-detail-pane');
                        buttonSave = $('[data-action="save"]');
                        if (detailPane[0] && buttonSave[0]) {
                            return true;
                        }
                    }, 'looks for detailPane', TIMEOUT);

                });

                j.it('compares the autofilled primary address with the testobject', function () {

                    j.expect(detailPane.find('[data-property="primary_address"]').val()).toEqual(TESTMAILAUTOCONFIG.email);

                });

                j.it('fills the form', function () {
                    _.each(TESTACCOUNT, function (value, key) {
                        detailPane.find('[data-property="' + key + '"]').val(value).trigger('change');
                    });
                });

                j.it('hits the save button', function () {

                    j.runs(function () {
                        console.log(buttonSave + ' gedrueckt');
                        buttonSave.trigger('click');
                    });
                });

                j.it('gets the id of the created account', function () {

                    j.runs(function () {
                        var me = this;
                        me.ready = false;
                        api.on('account_created', function (e, data) {
                            if (data) {
                                dataId = data.id;
                                me.ready = true;
                            }
                        });

                        j.waitsFor(function () {
                            return this.ready;
                        }, 'catches the id', TIMEOUT);

                    });

                });

                j.it('deletes the created account', function () {
                    api.remove([dataId]);
                });

            });

        }
    });


    ext.point('test/suite').extend({
        id: 'email-autoconfig',
        index: 100,
        test: function (j) {
            j.describe("Tests the mail-autoconfig api", function () {

                var emailConfigData;

                j.it('tests the autoconfig api', function () {

                    j.runs(function () {
                        var me = this;
                        me.ready = false;
                        api.autoconfig(TESTMAILAUTOCONFIG)
                        .done(function (data) {
                            me.ready = true;
                        })
                        .fail(function () {
                            console.log('no configdata recived');
                        });

                        j.waitsFor(function () {
                            return this.ready;
                        }, 'response from autoconfig arrived', TIMEOUT);

                    });

                });

            });
        }
    });





});