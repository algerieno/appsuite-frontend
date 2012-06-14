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

define("io.ox/calendar/view-grid-template",
    ["io.ox/calendar/util", "io.ox/core/tk/vgrid", "io.ox/core/extensions", "gettext!io.ox/calendar/calendar",
     "less!io.ox/calendar/style.css"], function (util, VGrid, ext, gt) {

    "use strict";
    var fnClickPerson = function (e) {
        console.log('clicked person, ', e);
        e.preventDefault();
        ext.point("io.ox/core/person:action").each(function (ext) {
            _.call(ext.action, e.data, e);
        });
    };

    var that = {

        // main grid template
        main: {
            build: function () {
                var title, location, time, date, shown_as, conflicts, isPrivate;
                this.addClass("calendar")
                    .append(time = $("<div>").addClass("time"))
                    .append(date = $("<div>").addClass("date"))
                    .append(isPrivate = $("<div>").addClass("private").hide())
                    .append(title = $("<div>").addClass("title"))
                    .append(location = $("<div>").addClass("location"))
                    .append(shown_as = $("<div/>").addClass("abs shown_as"))
                    .append(conflicts = $("<div/>").addClass("conflicts").hide());
                return { title: title, location: location, time: time, date: date, shown_as: shown_as, conflicts: conflicts, isPrivate: isPrivate };
            },
            set: function (data, fields, index) {
                fields.title.text(data.title || '\u00A0');
                fields.location.text(data.location || '\u00A0');
                util.addTimezoneLabel(fields.time.empty(), data);
                fields.date.text(util.getDateInterval(data));
                fields.shown_as.get(0).className = "abs shown_as " + util.getShownAsClass(data);
                if (data.conflicting_participants) {
                    var conflicts = $('<span/>');
                    fields.conflicts.text(gt('Conflicts:'));
                    fields.conflicts.append(conflicts);
                    data.conflicting_participants.each(function (participant, index, list) {
                        participant.fetch()
                            .done(function () {
                                conflicts.append(
                                    $('<a>')
                                        .addClass('person-link')
                                        .text(participant.get('display_name'))
                                        .css('margin-left', '4px')
                                        .on('click', { internal_userid: participant.get('id') }, fnClickPerson)
                                );
                                if (index < (list.length - 1)) {
                                    conflicts.append($('<span>').addClass('delimiter').html('&nbsp;&bull; '));
                                }
                            });
                    });
                    fields.conflicts.show();
                    fields.conflicts.css('white-space', 'normal');
                    this.css('height', 'auto');
                    console.log('data vgrid', data);
                    window.cdata = data;
                } else {
                    fields.conflicts.hide();
                }

                if (data.private_flag === true) {
                    console.log('render private');
                    fields.isPrivate.text(gt('private')).show();
                } else {
                    fields.isPrivate.hide();
                }
            }
        },

        // template for labels
        label: {
            build: function () {
                this.addClass("calendar-label");
            },
            set: function (data, fields, index) {
                var d = util.getSmartDate(data.start_date);
                this.text(d);
            }
        },

        // detect new labels
        requiresLabel: function (i, data, current) {
            var d = util.getSmartDate(data.start_date);
            return (i === 0 || d !== current) ? d : false;
        },

        // simple grid-based list for portal & halo
        drawSimpleGrid: function (list) {

            // use template
            var tmpl = new VGrid.Template(),
                $div = $("<div>");

            // add template
            tmpl.add(that.main);

            _(list).each(function (data, i) {
                var clone = tmpl.getClone();
                clone.update(data, i);
                clone.appendTo($div).node
                    .css("position", "relative")
                    .data("appointment", data)
                    .addClass("hover");
            });

            return $div;
        },

        // simple click handler used by several simple grids
        hOpenDetailPopup: function (e) {

            var data = e.data || $(this).data("appointment");

            require(["io.ox/calendar/view-detail", "io.ox/core/tk/dialogs"],
                function (view, dialogs) {
                    new dialogs.ModalDialog({
                            width: 600,
                            easyOut: true
                        })
                        .append(view.draw(data))
                        .addButton("close", "Close")
                        .show();
                    data = null;
                }
            );

            return false;
        }
    };

    return that;
});
