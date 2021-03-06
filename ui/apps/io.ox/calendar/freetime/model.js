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
 * @author Daniel Dickhaus <daniel.dickhaus@open-xchange.com>
 */

define('io.ox/calendar/freetime/model', [
    'settings!io.ox/calendar',
    'io.ox/calendar/model'
], function (settings, models) {

    'use strict';

    var model = Backbone.Model.extend({
        initialize: function () {
            var now = moment().startOf(settings.get('scheduling/dateRange', 'week'));
            this.set({
                timezone: now.tz(),
                startDate: now,
                compact: settings.get('scheduling/compact', false),
                zoom: settings.get('scheduling/zoom', '100'),
                onlyWorkingHours: settings.get('scheduling/onlyWorkingHours', true),
                startHour: Math.max(parseInt(settings.get('startTime', 8), 10) - 1, 0),
                endHour: Math.min(parseInt(settings.get('endTime', 18), 10), 24),
                attendees: new models.AttendeeCollection(null, { resolveGroups: true }),
                showFree: settings.get('scheduling/showFree', false),
                showReserved: settings.get('scheduling/showReserved', true),
                showFineGrid: settings.get('scheduling/showFineGrid', false),
                timeSlots: {},
                dateRange: settings.get('scheduling/dateRange', 'week')
            });
        }
    });

    return model;
});
