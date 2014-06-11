/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2014 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Alexander Quast <alexander.quast@open-xchange.com>
 */

define('io.ox/contacts/mobile-toolbar-actions',
   ['io.ox/core/extensions',
    'io.ox/core/extPatterns/links',
    'io.ox/contacts/api',
    'gettext!io.ox/mail'],
    function (ext, links, api, gt) {

    'use strict';

    // define links for each page

    var pointListView = ext.point('io.ox/contacts/mobile/toolbar/listView'),
        pointDetailView = ext.point('io.ox/contacts/mobile/toolbar/detailView'),
        actions = ext.point('io.ox/contacts/mobile/actions'),
        meta = {
        'create': {
            prio: 'hi',
            mobile: 'hi',
            label: gt('New'),
            icon: 'fa fa-plus',
            drawDisabled: true,
            ref: 'io.ox/contacts/actions/create',
            cssClasses: 'io-ox-action-link mobile-toolbar-action'
        },
        'send': {
            prio: 'hi',
            mobile: 'hi',
            label: gt('Send mail'),
            ref: 'io.ox/contacts/actions/send',
            drawDisabled: true
        },
        'vcard': {
            prio: 'lo',
            mobile: 'lo',
            label: gt('Send as vCard'),
            ref: 'io.ox/contacts/actions/vcard',
            drawDisabled: true
        },
        'invite': {
            prio: 'hi',
            mobile: 'hi',
            label: gt('Invite to appointment'),
            ref: 'io.ox/contacts/actions/invite',
            drawDisabled: true
        },
        'edit': {
            prio: 'hi',
            mobile: 'hi',
            label: gt('Edit'),
            ref: 'io.ox/contacts/actions/update',
            drawDisabled: true
        },
        'delete': {
            prio: 'hi',
            mobile: 'hi',
            label: gt('Delete'),
            drawDisabled: true,
            ref: 'io.ox/contacts/actions/delete'
        },
        'move': {
            mobile: 'lo',
            label: gt('Move'),
            drawDisabled: true,
            ref: 'io.ox/contacts/actions/move'
        },
        'copy': {
            mobile: 'lo',
            label: gt('Copy'),
            drawDisabled: true,
            ref: 'io.ox/contacts/actions/copy'
        }
    };

    function addAction(point, ids) {
        var index = 0;
        _(ids).each(function (id) {
            var extension = meta[id];
            extension.id = id;
            extension.index = (index += 100);
            point.extend(new links.Link(extension));
        });
        index = 0;
    }

    addAction(pointListView, ['create']);
    addAction(actions, ['send', 'invite', 'vcard', 'edit', 'delete', 'move', 'copy']);

    // add submenu as text link to toolbar in multiselect
    pointDetailView.extend(new links.Dropdown({
        index: 50,
        label: $('<span>').text(
            //.# Will be used as menu heading in mail module which then shows the sub-actions "mark as read" and "mark as unread"
            gt('Actions')
        ),
        noCaret: true, // don't draw the caret icon beside menu link
        drawDisabled: true,
        ref: 'io.ox/contacts/mobile/actions'
    }));

    var updateToolbar = _.debounce(function (contact) {
        var self = this;
        //get full data, needed for require checks for example
        api.get(contact).done(function (data) {
            if (!data) return;
            var baton = ext.Baton({ data: data, app: self });
            // handle updated baton to pageController
            self.pages.getToolbar('detailView').setBaton(baton);
        });
    }, 50);

    // multi select toolbar links need some attention
    // in case nothing is selected disabled buttons
    // This should be done via our Link concept, but I
    // didn't get it running. Feel free to refactor this
    // to a nicer solutioun
    /*pointListViewMultiSelect.extend({
        id: 'update-button-states',
        index: 10000,
        draw: function (baton) {
            // hmmmm, should work for this easy case
            if (baton.data.length === 0) {
                $('.mobile-toolbar-action', this).addClass('ui-disabled');
            } else {
                $('.mobile-toolbar-action', this).removeClass('ui-disabled');
            }
        }
    });*/

    // some mediator extensions
    // register update function and introduce toolbar updating
    ext.point('io.ox/contacts/mediator').extend({
        id: 'toolbar-mobile',
        index: 10100,
        setup: function (app) {
            if (_.device('!small')) return;
            app.updateToolbar = updateToolbar;
        }
    });

    ext.point('io.ox/contacts/mediator').extend({
        id: 'update-toolbar-mobile',
        index: 10300,
        setup: function (app) {
            if (!_.device('small')) return;

            // folder change
            app.grid.on('change:ids', function () {
                app.folder.getData().done(function (data) {
                    var baton = ext.Baton({ data: data, app: app });
                    // handle updated baton to pageController
                    app.pages.getToolbar('listView').setBaton(baton);
                });
            });

            // multiselect
            app.grid.selection.on('change', function  (e, list) {
                if (app.props.get('checkboxes') !== true ) return;
                if (list.length === 0) {
                    // reset to remove old baton
                     app.pages.getSecondaryToolbar('listView')
                        .setBaton(ext.Baton({data: [], app: app}));
                     return;
                }
                api.getList(list).done(function (data) {
                    if (!data) return;
                    var baton = ext.Baton({ data: data, app: app });
                    // handle updated baton to pageController
                    app.pages.getSecondaryToolbar('listView').setBaton(baton);
                });
            });

            // simple select
            app.grid.selection.on('pagechange:detailView', function () {
                // update toolbar on each pagechange
                var data = app.grid.selection.get();
                app.updateToolbar(data[0]);
            });

        }
    });

    ext.point('io.ox/contacts/mediator').extend({
        id: 'change-mode-toolbar-mobile',
        index: 10400,
        setup: function (app) {
            if (!_.device('small')) return;
            // if multiselect is triggered, show secondary toolbar with other options based on selection
            app.props.on('change:checkboxes', function (model, state) {
                app.pages.toggleSecondaryToolbar('listView', state);
            });
        }
    });

});
