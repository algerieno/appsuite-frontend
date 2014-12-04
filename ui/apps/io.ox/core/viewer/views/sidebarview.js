/**
 * All content on this website (including text, images, source
 * code and any other original works), unless otherwise noted,
 * is licensed under a Creative Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2014 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Edy Haryono <edy.haryono@open-xchange.com>
 * @author Mario Schroeder <mario.schroeder@open-xchange.com>
 */
define('io.ox/core/viewer/views/sidebarview', [
    'io.ox/core/viewer/eventdispatcher',
    'io.ox/core/viewer/views/sidebar/fileinfoview',
    'io.ox/core/viewer/views/sidebar/filedescriptionview'
], function (EventDispatcher, FileInfoView, FileDescriptionView) {

    'use strict';

    /**
     * The SidebarView is responsible for displaying the detail sidebar.
     * This view should show file meta information, versions, sharing/permissions
     * etc. This view should have children views (TBD)
     */
    var SidebarView = Backbone.View.extend({

        className: 'viewer-sidebar',

        events: {

        },

        // the default width of this sidebar in pixels.
        width: 400,

        // the visible state of the side bar, hidden per default.
        opened: false,

        initialize: function () {
            //console.info('SidebarView.initialize()');
            this.$el.on('dispose', this.dispose.bind(this));

            this.fileInfoView = new FileInfoView();
            this.fileDescriptionView = new FileDescriptionView();

            this.listenTo(EventDispatcher, 'viewer:displayeditem:change', function (data) {
                //console.warn('SidebarbarView viewer:displayeditem:change', data);
                this.render(data);
            });

            this.listenTo(EventDispatcher, 'viewer:toggle:sidebar', function () {
                //console.warn('SidebarbarView viewer:toggle:sidebar');
                this.$el.toggleClass('opened');
                this.opened = !this.opened;
            });
        },

        render: function (data) {
            //console.info('SidebarView.render() ', data);
            // append sub views
            this.$el.append(
                    this.fileInfoView.render(data).el,
                    this.fileDescriptionView.render(data).el
            );

            return this;
        },

        dispose: function () {
            //console.info('SidebarView.dispose()');
            this.stopListening();
            return this;
        }
    });

    return SidebarView;
});
