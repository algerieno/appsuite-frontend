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
 * @author Julian Bäume <julian.baeume@open-xchange.com>
 */

define([
    'io.ox/core/desktop'
], function (ui) {
    'use strict';

    describe('Core', function () {
        describe('AppSuite desktop', function () {

            describe('provides the Window API which', function () {
            });

            describe('provides the App API which', function () {
                var app, oldApps = [];
                beforeEach(function () {
                    ui.apps.forEach((a) => oldApps.push(a));
                });

                afterEach(function () {
                    //clean up
                    if (app && app.get('state') === 'running') {
                        return app.quit();
                    }
                    ui.apps.reset([]);
                    oldApps.forEach((a) => ui.apps.push(a));
                });

                describe('has simple applications', function () {
                    beforeEach(function () {
                        app = new ui.App({
                            name: 'io.ox/testApp'
                        });
                    });
                    it('should define global App object', function () {
                        expect(ui.App).to.exist;
                    });

                    it('should launch a test app', function () {
                        expect(app.get('state')).to.equal('ready');
                        return app.launch().then(function () {
                            expect(ui.apps.models).to.contain(app);
                            expect(app.get('state')).to.equal('running');
                        });
                    });
                });

                describe('createApp convenience function', function () {
                    it('should creates a new app and adds it to the gobal collection', function () {
                        app = ui.createApp({
                            id: 'io.ox/testApp'
                        });
                        expect(app).to.exist;
                        expect(ui.apps.get('io.ox/testApp')).to.exist;
                    });
                    it('should do checks using "requires" attribute of the app', function () {
                        app = ui.createApp({
                            id: 'io.ox/testApp',
                            requires: 'upsell stuff'
                        });
                        expect(app).not.to.exist;
                        expect(ui.apps.get('io.ox/testApp')).not.to.exist;
                    });
                });

                describe('should allow to customize the launch method', function () {
                    var launcher = function (options) {
                            var def = $.Deferred();

                            options.callback();
                            _.defer(function () {
                                def.resolve();
                            });
                            return def;
                        }, callback;

                    beforeEach(function () {
                        app = new ui.App({
                            name: 'io.ox/testApp',
                            launch: launcher
                        });
                        callback = sinon.spy();
                    });
                    afterEach(function () {
                        expect(callback.calledTwice, 'callback has been called twice').to.be.true;
                    });

                    it('during initialization', function () {

                        expect(app.get('state')).to.equal('ready');
                        var def = app.launch({ callback: callback }).then(function () {
                            expect(ui.apps.models).to.contain(app);
                            expect(app.get('state')).to.equal('running');
                            callback();
                        });
                        expect(app.get('state')).to.equal('initializing');
                        return def;
                    });

                    it('after initialization', function () {
                        app.setLauncher(launcher);
                        return app.launch({ callback: callback }).then(function () {
                            callback();
                        });
                    });
                });
            });
        });
    });
});
