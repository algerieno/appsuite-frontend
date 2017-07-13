/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2017 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Richard Petersen <richard.petersen@open-xchange.com>
 *
 */

define('io.ox/calendar/chronos-util', [

], function () {

    'use strict';
    var attendeeLookupArray = ['', 'INDIVIDUAL', 'GROUP', 'RESOURCE', 'RESOURCE', 'INDIVIDUAL'];

    return {
        rangeFilter: function (start, end) {
            return function (model) {
                if (model.get('endDate') < start) return false;
                if (model.get('startDate') > end) return false;
                return true;
            };
        },
        cid: function (o) {
            if (_.isObject(o)) {
                if (o.attributes) o = o.attributes;
                var cid = o.folder + '.' + o.id;
                if (o.recurrenceId) cid += '.' + o.recurrenceId;
                return cid;
            } else if (_.isString(o)) {
                var s = o.split('.'),
                    r = { folder: s[0], id: s[1] };
                if (s.length === 3) r.recurrenceId = parseInt(s[2], 10);
                return r;
            }
        },
        // creates an attendee object from a user object or model and contact model or object
        // used to create default participants and used by addparticipantsview
        // options can contain attende object fields that should be prefilled (usually partStat: 'ACCEPTED')
        createAttendee: function (user, options) {
            if (!user) return;
            options = options || {};
            var displayName = user.get ? user.get('display_name') : user.display_name,
                attendee = {
                    cuType: attendeeLookupArray[(user.get ? user.get('type') : user.type)] || 'INDIVIDUAL',
                    cn: user.getDisplayName ? user.getDisplayName() : displayName,
                    partStat: 'NEEDS-ACTION',
                    comment: ''
                };

            if (attendee.cuType !== 'RESOURCE') {
                if (user.id && (user.get ? user.get('type') : user.type) !== 5) attendee.entity = user.id;
                attendee.email = user.get ? user.get('email1') : user.email1;
                attendee.uri = 'mailto:' + (user.get ? user.get('email1') : user.email1);
            } else {
                attendee.partStat = 'ACCEPTED';
                attendee.comment = user.get ? user.get('description') : user.description;
                attendee.entity = user.get ? user.get('id') : user.id;
            }

            // override with predefined values if given
            return _.extend(attendee, options);
        },

        // all day appointments have no timezone and the start and end dates are in date format not date-time
        // checking the start date is sufficient as the end date must be of the same type, according to the spec
        isAllday: function (app) {
            if (!app) return false;
            var time = app.get ? app.get('startDate') : app.startDate;
            // there is either no time value or the time value is only 0s
            return this.isLocal(app) && (time.value.indexOf('T') === -1 || time.value.search(/T0*$/) !== -1);
        },

        // appointments may be in local time. This means they do not move when the timezone changes. Do not confuse this with UTC time
        isLocal: function (app) {
            if (!app) return false;
            var time = app.get ? app.get('startDate') : app.startDate;
            return time && time.value && !time.tzid;
        }
    };

});
