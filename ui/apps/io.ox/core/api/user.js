/**
 * All content on this website (including text, images, source
 * code and any other original works), unless otherwise noted,
 * is licensed under a Creative Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * Copyright (C) Open-Xchange Inc., 2006-2011
 * Mail: info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define("io.ox/core/api/user",
    ["io.ox/core/http", "io.ox/core/api/factory"], function (http, apiFactory) {

    "use strict";

    // generate basic API
    var api = apiFactory({
        module: "user",
        keyGenerator: function (obj) {
            return String(obj.id);
        },
        requests: {
            all: {
                columns: "1,20,500",
                sort: "500", // display_name
                order: "asc"
            },
            list: {
                action: "list",
                columns: "1,20,500,524"
            },
            get: {
                action: "get"
            },
            search: {
                action: "search",
                columns: "1,20,500,524",
                sort: "500",
                order: "asc",
                getData: function (query) {
                    return { pattern: query };
                }
            }
        }
    });

    api.getTextNode = function (id) {
        var node = document.createTextNode("");
        api.get({ id: id })
            .done(function (data) {
                node.nodeValue = data.display_name || data.email1;
            })
            .always(function () {
                _.defer(function () { // use defer! otherwise we return null on cache hit
                    node = null; // don't leak
                });
            });
        return node;
    };

    api.getPictureURL = function (id) {

        var deferred = $.Deferred(),
            url = ox.base + "/apps/themes/default/dummypicture.png",
            fail = function () {
                deferred.resolve(url);
            };

        api.get({ id: id })
            .done(function (data) {
                // ask contact interface for picture
                require(["io.ox/contacts/api"], function (contactsAPI) {
                    contactsAPI.get({ id: data.contact_id, folder: data.folder_id })
                    .done(function (data) {
                        if (data.image1_url) {
                            deferred.resolve(data.image1_url);
                        } else {
                            fail();
                        }
                    })
                    .fail(fail);
                });
            })
            .fail(fail);

        return deferred;
    };

    api.getPicture = function (id) {
        var node = $("<div>"),
            clear = function () {
                _.defer(function () { // use defer! otherwise we return null on cache hit
                    node = clear = null; // don't leak
                });
            };
        api.getPictureURL(id)
            .done(function (url) {
                node.css("backgroundImage", "url(" + url + ")");
            })
            .always(clear);
        return node;
    };

    return api;
});