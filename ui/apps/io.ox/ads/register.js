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
 * @author Christoph Kopp <christoph.kopp@open-xchange.com>
 *
 */
define('io.ox/ads/register', [
    'io.ox/core/extensions',
    'io.ox/core/capabilities',
    'less!io.ox/ads/style'
], function (ext, capabilities) {
    'use strict';

    var config = [],
        reloadTimers = [];

    ext.point('io.ox/ads').extend({
        id: 'default',
        inject: function (baton) {
            this.append(
                baton.data.inject
            );
        },
        changeModule: function (module, baton) {
            var allAds = baton.data.config,
                activeAds = allAds.filter(function activeFilter(conf) {
                    return typeof conf.active === 'undefined' || conf.active === true;
                })
                .filter(function moduleFilter(conf) {
                    return _.isEmpty(conf.showInModules) || _.contains(conf.showInModules, module);
                }).filter(function capabilityFilter(conf) {
                    return _.isEmpty(conf.capabilities) || capabilities.has(conf.capabilities);
                });

            allAds.forEach(function (ad) {
                var baton = ext.Baton.ensure(ad);
                ext.point(ad.space).invoke('cleanup', undefined, baton);
            });

            reloadTimers.forEach(clearInterval);
            reloadTimers = [];

            activeAds.forEach(function (ad) {
                var baton = ext.Baton.ensure(ad);
                ext.point(ad.space).invoke('draw', undefined, baton);

                if (ad.reloadAfter) {
                    reloadTimers.push(setInterval(function () {
                        ext.point(ad.space).invoke('reload', undefined, baton);
                    }, ad.reloadAfter));
                }
            });
        }
    });

    /**
     * Load Ad configuration from config load
     *
     * @params ad - { inject: function, config: array }
     */
    function loadAdConfig(ad) {
        var baton = ext.Baton.ensure(ad);
        ext.point('io.ox/ads').invoke('inject', $('head'), baton);

        //handle configuration
        ext.point('io.ox/ads').invoke('config', undefined, baton);
        config = baton.data.config.map(function (conf, index) {
            return _.extend({ id: index }, conf);
        });
    }

    ox.manifests.loadPluginsFor('io.ox/ads/config').then(function () {
        for (var i = 0; i < arguments.length; i++) {
            loadAdConfig(arguments[i]);
        }
    });

    function changeModule(app) {
        var baton = ext.Baton.ensure({
            app: app,
            config: config
        });
        ext.point('io.ox/ads').invoke('changeModule', undefined, app.get('name'), baton);
    }

    ox.on('app:start', changeModule);

    ox.on('app:resume', changeModule);

    /**
     ** Add extensions for core UI points, can be used to hook up ad extension points
     **/
    ox.on('mail:send:start', function () {
        // ignore, if not configured at all
        if (!config['io.ox/ads/mailSentOverlay']) return;

        require(['io.ox/ads/mailoverlay'], function (Overlay) {
            var app = ox.ui.apps.get('io.ox/mail'),
                target = app.pages.getAll().detailView.$el.closest('.window-body'),
                baton = ext.Baton.ensure(config['io.ox/ads/mailSentOverlay'] || { html: '' });

            new Overlay({ target: target, baton: baton }).show();
        });
    });

    ext.point('io.ox/portal/sections').extend({
        id: 'motor',
        before: 'widgets',
        draw: function () {
            this.append(
                $('<div id="io-ox-ad-portal" class="io-ox-ad">').hide()
            );
        }
    });

    ext.point('io.ox/mail/thread-view').extend({
        id: 'motor',
        index: 50,
        draw: function () {
            this.$el.append(
                $('<div id="io-ox-ad-mail-detail">').hide()
            );
        }
    });

    ext.point('io.ox/core/foldertree/infostore/app').extend({
        id: 'motor',
        index: 150,
        draw: function () {
            this.append(
                $('<div id="io-ox-ad-drive-folder">').hide()
            );
        }
    });

    /**
     ** extension points for ad areas
     **/

    ext.point('io.ox/ads/driveFolder').extend({
        id: 'default',
        draw: function (baton) {
            $('#io-ox-ad-drive-folder').append(
                baton.data.html
            ).show();
        },
        cleanup: function () {
            $('#io-ox-ad-drive-folder').empty().hide();
        }
    });

    ext.point('io.ox/ads/portalBillboard').extend({
        id: 'default',
        draw: function (baton) {
            $('#io-ox-ad-portal').append(
                baton.data.html
            ).show();
        },
        cleanup: function () {
            $('#io-ox-ad-portal').empty().hide();
        }
    });

    ext.point('io.ox/ads/mailDetail').extend({
        id: 'default',
        draw: function (baton) {
            var detail = $('#io-ox-ad-mail-detail');

            detail.closest('.thread-view-control').addClass('show-ad');
            detail.append(
                baton.data.html
            ).show();
        },
        cleanup: function () {
            var detail = $('#io-ox-ad-mail-detail');

            detail.closest('.thread-view-control').removeClass('show-ad');
            detail.empty().hide();
        }
    });

    ext.point('io.ox/ads/leaderboard').extend({
        id: 'default',
        draw: function (baton) {
            $('#io-ox-core').addClass('show-ad');
            $('#io-ox-ad-banner').append(
                baton.data.html
            );

        },
        cleanup: function () {
            $('#io-ox-core').removeClass('show-ad');
            $('#io-ox-ad-banner').empty();
        }
    });

    ext.point('io.ox/ads/mailSentOverlay').extend({
        id: 'default',
        index: 100,
        draw: function (baton) {
            //not called from mail overlay view
            if (typeof this === 'undefined') return;

            this.append(
                baton.data.html
            );
        }
    });

});
