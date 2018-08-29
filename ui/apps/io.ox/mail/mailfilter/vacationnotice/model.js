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

define('io.ox/mail/mailfilter/vacationnotice/model', ['io.ox/core/api/mailfilter', 'gettext!io.ox/mail', 'settings!io.ox/core'], function (api, gt, coreSettings) {

    'use strict';

    var DAY = 24 * 60 * 60 * 1000;

    var VacationNoticeModel = Backbone.Model.extend({

        parse: function (response) {

            // early return is required for model.save()
            // server does not return usable data
            if (!_.isArray(response)) return {};

            var data = response[0],
                attr = {
                    active: false,
                    activateTimeFrame: false,
                    days: '7',
                    internal_id: 'vacation',
                    subject: '',
                    text: ''
                };

            // use defaults
            if (!data || !data.actioncmds[0]) {
                return _.extend(attr, this.getDefaultRange());
            }

            // copy all attributes from actioncmds[0], e.g. days, subject, text
            _.extend(attr, data.actioncmds[0]);

            // from
            if (!attr.from) attr.from = 'default';

            // addresses
            _(attr.addresses).each(function (address) {
                attr['alias_' + address] = true;
            });

            // IDs
            attr.internal_id = attr.id;
            attr.id = data.id;

            // active
            attr.active = !!data.active;

            this.parseTime(attr, data.test);

            return attr;
        },

        parseTime: function (attr, test) {

            if (_(test).size() === 2) {
                // we do have a time frame
                _(test.tests).each(parseTest);
                attr.activateTimeFrame = true;
            } else if (test.id === 'currentdate') {
                // we do have just start or end date
                parseTest(test);
                attr.activateTimeFrame = true;
            } else {
                _.extend(attr, this.getDefaultRange());
            }

            function parseTest(test) {
                attr[test.comparison === 'ge' ? 'dateFrom' : 'dateUntil'] = test.datevalue[0];
            }
        },

        getDefaultRange: function () {
            return { dateFrom: +moment(), dateUntil: +moment().add(1, 'week') };
        },

        toJSON: function () {

            var attr = this.attributes,
                cmd = _(attr).pick('days', 'subject', 'text');

            // copy internal_id as id
            cmd.id = attr.internal_id;

            // from
            if (attr.from && attr.from !== 'default') {
                cmd.from = parseAddress(attr.from);
            }

            // addresses
            cmd.addresses = [attr.primaryMail];
            _(attr).each(function (value, name) {
                if (value === true && /^alias_.*@.*$/.test(name)) cmd.addresses.push(name.substr(6));
            });

            cmd.addresses = _.uniq(cmd.addresses);

            // position
            if (attr.position !== undefined) cmd.position = attr.position;

            // time
            var testForTimeframe = { id: 'allof', tests: [] };

            function returnTzOffset(timeValue) {
                return moment.tz(timeValue, coreSettings.get('timezone')).format('Z').replace(':', '');
            }

            if (attr.dateFrom) {
                testForTimeframe.tests.push({
                    id: 'currentdate',
                    comparison: 'ge',
                    datepart: 'date',
                    datevalue: [attr.dateFrom],
                    zone: returnTzOffset(attr.dateFrom)
                });
            }

            if (attr.dateUntil) {
                testForTimeframe.tests.push({
                    id: 'currentdate',
                    comparison: 'le',
                    datepart: 'date',
                    datevalue: [attr.dateUntil],
                    zone: returnTzOffset(attr.dateFrom)
                });
            }

            if (testForTimeframe.tests.length === 1 && attr.activateTimeFrame) {
                testForTimeframe = testForTimeframe.tests[0];
            } else if (testForTimeframe.tests.length === 0 || attr.activateTimeFrame === false) {
                testForTimeframe = { id: 'true' };
            }

            // get final json
            var json = {
                active: attr.active,
                actioncmds: [cmd],
                test: testForTimeframe,
                flags: ['vacation'],
                rulename: 'vacation notice'
            };

            if (attr.id !== undefined) json.id = attr.id;

            return json;
        },

        sync: function (method, module, options) {
            switch (method) {
                case 'create':
                    return api.create(this.toJSON())
                    .done(this.onUpdate.bind(this))
                    .done(options.success).fail(options.error);
                case 'read':
                    return api.getRules('vacation')
                        .done(options.success).fail(options.error);
                case 'update':
                    return api.update(this.toJSON())
                        .done(this.onUpdate.bind(this))
                        .done(options.success).fail(options.error);
                // no default
            }
        },

        // add missing promise support
        save: function () {
            var promise = Backbone.Model.prototype.save.apply(this, arguments);
            return !promise ? $.Deferred().reject(this.validationError) : promise;
        },

        onUpdate: function () {
            // an easy way to propagate changes
            // otherwise we need to sync data across models or introduce a singleton-model-approach
            ox.trigger('mail:change:vacation-notice', this);
        },

        isActive: function () {
            if (!this.get('active')) return false;
            if (!this.get('activateTimeFrame')) return true;
            var now = +moment();
            // FROM and UNTIL
            if (this.has('dateFrom') && this.has('dateUntil')) {
                return this.get('dateFrom') <= now && (this.get('dateUntil') + DAY) > now;
            }
            // just FROM
            if (this.has('dateFrom')) return this.get('dateFrom') <= now;
            // just UNTIL
            return (this.get('dateUntil') + DAY) > now;
        },

        isPast: function () {
            return this.has('dateUntil') && (this.get('dateUntil') + DAY) < +moment();
        },

        isReverse: function () {
            return this.has('dateFrom') && this.has('dateUntil') && this.get('dateFrom') > this.get('dateUntil');
        },

        getDuration: function () {
            var from = this.get('dateFrom'), until = this.get('dateUntil');
            return Math.floor(moment.duration(moment(until + DAY).diff(from)).asDays());
        },

        validate: function () {
            // false means "good"
            if (!this.get('active')) return false;
            if (!this.get('activateTimeFrame')) return false;
            if (this.isReverse()) return { dateUntil: gt('The end date must be after the start date.') };
            if (this.isPast()) return { dateUntil: gt('The time frame is in the past.') };
            return false;
        }
    });

    function parseAddress(address) {
        var match = address.match(/^(.+)\s<(.+)>$/);
        return match ? match.slice(1, 3) : address;
    }

    return VacationNoticeModel;
});