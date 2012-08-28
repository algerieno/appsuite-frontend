/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2012 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Christoph Hellweg <christoph.hellweg@open-xchange.com>
 */

define('io.ox/calendar/week/perspective',
        ['io.ox/calendar/week/view',
         'io.ox/calendar/api',
         'io.ox/calendar/util',
         'io.ox/core/http',
         'io.ox/core/tk/dialogs',
         'io.ox/calendar/view-detail'
         ], function (View, api, util, http, dialogs, detailView) {

    'use strict';

    var perspective = new ox.ui.Perspective('week');
    
    _.extend(perspective, {
        
        collection:     {},
        days:           7,
        startDate:      null,
        dialog:         $(),
        
        showAppointment: function (e, obj) {
            // open appointment details
            var that = this;
            api.get(obj).done(function (data) {
                that.dialog
                    .show(e, function (popup) {
                        popup.append(detailView.draw(data));
                    });
            });
        },
        
        createAppointment: function (e, start, end) {
            console.log('createAppointment', e, start.toString(), end.toString());
        },
        
        editAppointment: function (e, obj) {
            require('io.ox/core/extensions')
                .point('io.ox/calendar/detail/actions/edit')
                .invoke('action', this, obj);
        },
        
        getAppointments: function (start, end) {
            // fetch appointments
            var self = this,
                collection = self.collection;
            if (collection) {
                api.getAll({ start: start, end: end }).done(function (list) {
                    collection.reset(_(list).map(function (obj) {
                        var m = new Backbone.Model(obj);
                        m.id = _.cid(obj);
                        return m;
                    }));
                    collection = null;
                });
            }
        },
        
        refresh: function () {
            // FIXME: replace 'startDate' with calendar logic
            this.startDate = util.getWeekStart();
            
            this.getAppointments(this.startDate, this.startDate + util.DAY * this.days);
        },
        
        render: function (app) {
            this.collection = new Backbone.Collection([]);
            this.main.addClass('week-view').empty();

            var weekView = new View({
                collection: this.collection,
                columns: this.days,
                startDate: this.startDate
            });
            
            weekView
                .on('showAppointment', this.showAppointment, this)
                .on('createAppointment', this.createAppointment, this)
                .on('editAppointment', this.editAppointment, this);
            
            this.main
                .empty()
                .append(weekView.render().el)
                .find('.scrollpane')
                .scrollTop(weekView.getScrollPos());
            
            this.dialog = new dialogs.SidePopup()
                .on('close', function () {
                    $('.appointment', this.main).removeClass('opac current');
                });

            // watch for api refresh
            api.on('refresh.all', $.proxy(this.refresh, this));

            app.getWindow().on('show', $.proxy(this.refresh, this));
            
            this.refresh();
        }
    });

    return perspective;
});
