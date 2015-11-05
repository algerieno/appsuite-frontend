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
 * @author Daniel Dickhaus <daniel.dickhaus@open-xchange.com>
 */

define('io.ox/core/api/quota', ['io.ox/core/http', 'io.ox/core/capabilities'], function (http, capabilities) {

    'use strict';

    var fallback = { quota: -1, use: 0, countquota: -1, countuse: 0 };

    var api = {
        /**
         * get File quota and current use
         * @return { deferred} returns object with quota and use properties)
         */
        getFile: function () {
            return http.GET({
                module: 'quota',
                params: { action: 'filestore' }
            });
        },

        /**
         * get mail quota and current use
         * @return { deferred} returns object with quota and use properties)
         */
        getMail: function () {
            return http.GET({
                module: 'quota',
                params: { action: 'mail' }
            });
        },

        /**
         * get mail and file quota
         * @return { deferred} returns quota object
         */
        get: function () {

            var hasWebmail = capabilities.has('webmail'),
                hasFiles = capabilities.has('infostore');

            http.pause();
            if (hasWebmail) this.getMail();
            if (hasFiles) this.getFile();
            return http.resume()
                .then(function (req) {
                    var result = {}, item = req.shift();
                    if (hasWebmail) {
                        result.mail = item.data;
                        item = req.shift();
                    } else {
                        result.mail = fallback;
                    }
                    if (hasFiles) {
                        result.file = item.data;
                    } else {
                        result.file = fallback;
                    }
                    $(api).trigger('quota-update', result);
                    return result;
                });
            // for demo purposes
            // .then(function (quotas) {
            //     // create fake values for testing
            //     quotas.file.quota = 50 * 1024 * 1024; // 50mb limit
            //     quotas.file.use = 26 * 1024 * 1024; // 26mb in use
            //     quotas.mail.quota = 5.88 * 1024 * 1024; // 100mb limit
            //     quotas.mail.use = 4.85 * 1024 * 1024; // 87mb in use
            //     quotas.mail.countquota = 200; // 200 limit
            //     quotas.mail.countuse = 191;  // 191 in use
            //     return quotas;
            // });
        }
    };

    // get fresh quota to trigger update events
    ox.on('refresh^', function () {
        api.get();
    });

    return api;
});
