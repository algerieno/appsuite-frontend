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
 * @author Christoph Kopp <christoph.kopp@open-xchange.com>
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/mail/mailfilter/autoforward/model', [
    'io.ox/core/api/mailfilter',
    'io.ox/core/api/user',
    'gettext!io.ox/mail'
], function (api, userAPI, gt) {

    'use strict';

    var AutoforwardModel = Backbone.Model.extend({

        parse: function (data) {

            // early return is required for model.save()
            // server does not return usable data
            if (!_.isObject(data)) return {};
            this.availableActions = data.availableActions;

            var attr = {
                active: false,
                copy: false,
                processSub: true,
                to: '',
                userMainEmail: data.user.email1
            };

            if (_.isEmpty(data.forward)) {
                // new rule
                attr.position = _.isEmpty(data.vacation) ? 0 : data.vacation.position + 1;
                return attr;
            }

            // rule already exists
            attr.active = !!data.forward.active;
            attr.id = data.forward.id;

            _(data.forward.actioncmds).each(function (value) {
                switch (value.id) {
                    case 'redirect':
                        attr.to = value.to;
                        attr.copy = !!value.copy;
                        break;
                    case 'stop':
                        attr.processSub = false;
                        break;
                    case 'keep':
                        attr.copy = true;
                        break;
                    // no default
                }
            });

            return attr;
        },

        toJSON: function () {

            var attr = this.attributes;

            var json = {
                actioncmds: [{ id: 'redirect', to: attr.to }],
                active: !!attr.active,
                flags: ['autoforward'],
                position: attr.position,
                rulename: gt('autoforward'),
                test: { id: 'true' }
            };

            if (attr.copy) {
                if (this.availableActions.copy) { json.actioncmds[0].copy = true; } else { json.actioncmds.push({ id: 'keep' }); }
            }
            if (!attr.processSub) json.actioncmds.push({ id: 'stop' });
            // first rule gets 0 so we check for isNumber
            if (_.isNumber(attr.id)) json.id = attr.id;

            return json;
        },

        sync: function (method, module, options) {

            if (this.attributes.to === '' && this.attributes.id) method = 'delete';

            switch (method) {
                case 'create':
                    return api.create(this.toJSON())
                        .done(this.onUpdate.bind(this))
                        .done(options.success).fail(options.error);
                case 'read':
                    return $.when(
                        api.getRules('autoforward'),
                        api.getRules('vacation'),
                        userAPI.get(),
                        api.getConfig()
                    )
                    .then(function (forward, vacation, user, config) {
                        var getIdList = function () {
                            var list = {};
                            _.each(config.actioncmds, function (val) {
                                list[val.id] = val;
                            });
                            return list;
                        };
                        return { forward: forward[0], vacation: vacation[0], user: user, availableActions: getIdList() };
                    })
                    .done(options.success)
                    .fail(options.error);
                case 'update':
                    return api.update(this.toJSON())
                        .done(this.onUpdate.bind(this))
                        .done(options.success).fail(options.error);
                case 'delete':
                    return api.deleteRule(this.get('id'))
                        .done(this.onUpdate.bind(this))
                        .done(options.success).fail(options.error);
                // no default
            }
        },

        onUpdate: function () {
            // an easy way to propagate changes
            // otherwise we need to sync data across models or introduce a singleton-model-approach
            ox.trigger('mail:change:auto-forward', this);
        },

        isActive: function () {
            return !!this.get('active');
        }
    });

    return AutoforwardModel;
});
