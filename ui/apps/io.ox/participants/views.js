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
 */

define('io.ox/participants/views', [
    'io.ox/contacts/api',
    'io.ox/core/util',
    'io.ox/core/folder/api',
    'gettext!io.ox/core',
    'less!io.ox/participants/style'
], function (api, util, folderAPI, gt) {

    'use strict';

    var ParticipantEntryView = Backbone.View.extend({

        tagName: 'div',

        className: 'participant-wrapper',

        IMG_CSS: 'default-image contact-image group-image resource-image resource-image external-user-image group-image'.split(' '),

        events: {
            'click .remove': 'onRemove',
            'keydown': 'fnKey'
        },

        options: {
            halo: false,
            closeButton: false,
            field: false,
            customize: $.noop
        },

        nodes: {},

        initialize: function (options) {
            this.options = $.extend({}, this.options, options || {});
            this.listenTo(this.model, 'change', function (model) {
                if (model && model.changed) {
                    this.$el.empty();
                    this.render();
                }
            });
            this.listenTo(this.model, 'remove', function () {
                this.remove();
            });
        },

        render: function () {
            this.$el.append(
                this.nodes.$img = $('<div>'),
                this.nodes.$text = $('<div class="participant-name">'),
                this.options.hideMail ? '' : $('<div class="participant-email">').append(this.nodes.$mail = this.options.halo ? $('<a>') : $('<span>')),
                this.options.hideMail ? '' : $('<div class="extra-decorator">').append(this.nodes.$extra = $('<span>')),
                $('<a href="#" class="remove" role="button">').append(
                    $('<div class="icon">').append(
                        $('<i class="fa fa-trash-o" aria-hidden="true">'),
                        $('<span class="sr-only">').text(gt('Remove contact') + ' ' + this.model.getDisplayName())
                    )
                )
            ).attr({ 'data-cid': this.model.cid }).toggleClass('removable', this.options.closeButton);

            this.setCustomImage();
            this.setDisplayName();
            this.setTypeStyle();
            this.options.customize.call(this);
            this.trigger('render');
            return this;
        },

        setDisplayName: function () {
            var options = {
                $el: this.nodes.$text
            };
            if (this.options.asHtml) {
                options.html = this.model.getDisplayName({ asHtml: true, isMail: this.options.isMail });
            } else {
                options.name = this.model.getDisplayName({ asHtml: false, isMail: this.options.isMail });
            }
            util.renderPersonalName(options, this.model.toJSON());
        },

        setCustomImage: function () {
            var data = this.model.toJSON();
            //fix to work with picture halo (model uses email address as id)
            if (data.type === 5) delete data.id;
            api.pictureHalo(
                this.nodes.$img,
                data,
                { width: 54, height: 54 }
            );
            this.nodes.$img.attr('aria-hidden', true).addClass('participant-image ' + (this.IMG_CSS[parseInt(this.model.get('type'), 10)] || ''));
        },

        setRows: function (mail, extra) {
            if (!this.options.hideMail) {
                extra = extra || this.model.getTypeString() || '';
                this.nodes.$mail.text(gt.noI18n(mail));
                this.nodes.$extra.text(gt.noI18n(extra));
                if (mail && extra) {
                    this.$el.addClass('three-rows');
                }
            }
        },

        isOrganizer: function () {
            if (!this.options.baton) return false;
            var appointment = this.options.baton.model.toJSON();
            if (!appointment.organizerId) return false;
            return this.model.get('id') === appointment.organizerId;
        },

        isRemovable: function () {
            if (!this.options.baton) return false;
            var appointment = this.options.baton.model.toJSON();
            // participants can be removed unless they are organizer
            if (this.model.get('id') !== appointment.organizerId) return true;
            // special case: organizer can be removed from public folders
            return folderAPI.pool.getModel(appointment.folder_id).is('public');
        },

        setTypeStyle: function () {

            var mail = this.model.getTarget(),
                extra = null;

            if (mail && this.options.field && this.model.getFieldString()) {
                mail += ' (' + this.model.getFieldString() + ')';
            }

            switch (this.model.get('type')) {
                case 1:
                case 5:
                    // set organizer
                    if (this.isOrganizer()) {
                        extra = gt('Organizer');
                        // don't remove organizer
                        if (!this.isRemovable()) this.$el.removeClass('removable');
                    }

                    if (mail && this.options.halo) {
                        this.nodes.$mail
                            .attr({ href: '#' })
                            .data({ email1: mail })
                            .addClass('halo-link');
                    }
                    break;
                case 3:
                    if (this.options.halo && !this.options.hideMail) {
                        var data = this.model.toJSON();
                        data.callbacks = {};
                        if (this.options.baton && this.options.baton.callbacks) {
                            data.callbacks = this.options.baton.callbacks;
                        }
                        var link = $('<a href="#">')
                            .data(data)
                            .addClass('halo-resource-link');
                        this.nodes.$extra.replaceWith(link);
                        this.nodes.$extra = link;
                    }
                    break;
                // no default
            }

            this.setRows(mail, extra);
        },

        fnKey: function (e) {
            // del or backspace
            if (e.which === 46 || e.which === 8) this.onRemove(e);
        },

        onRemove: function (e) {
            e.preventDefault();
            // remove from collection
            this.model.collection.remove(this.model);
        }
    });

    var UserContainer = Backbone.View.extend({

        tagName: 'div',

        className: 'participantsrow col-xs-12',

        initialize: function (options) {
            this.options = options;
            this.listenTo(this.collection, 'add', function (model) {
                this.renderLabel();
                this.renderEmptyLabel();
                this.renderParticipant(model);
            });
            this.listenTo(this.collection, 'remove', function () {
                this.renderLabel();
                this.renderEmptyLabel();
            });
            this.listenTo(this.collection, 'reset', function () {
                this.$ul.empty();
                this.renderAll();
            });
            this.$empty = $('<li>').text(gt('This list has no contacts yet'));
        },

        render: function () {
            this.$el.append(
                $('<fieldset>').append(
                    $('<legend>').addClass(this.options.labelClass || ''),
                    this.$ul = $('<ul class="list-unstyled">')
                )
            );
            this.renderAll();
            return this;
        },

        renderLabel: function () {
            var count = this.collection.length,
                label = this.options.label || gt('Participants (%1$d)', count);
            this.$('fieldset > legend').text(label);
        },

        renderParticipant: function (participant) {

            var view = new ParticipantEntryView({
                tagName: 'li',
                model: participant,
                baton: this.options.baton,
                halo: this.options.halo !== undefined ? this.options.halo : true,
                closeButton: true,
                hideMail: this.options.hideMail,
                asHtml: this.options.asHtml,
                isMail: this.options.isMail
            });

            view.on('render', function () {
                this.collection.trigger('render');
            }.bind(this));

            view.render().$el.addClass(this.options.entryClass || 'col-xs-12 col-sm-6');

            // bring organizer up
            if (participant.get('id') === this.options.baton.model.get('organizerId')) {
                this.$ul.prepend(view.$el);
            } else {
                this.$ul.append(view.$el);
            }
        },

        renderAll: function () {
            var self = this;
            this.renderLabel();
            this.renderEmptyLabel();
            this.collection.each(function (model) {
                self.renderParticipant(model);
            });
            return this;
        },

        renderEmptyLabel: function () {
            if (this.options.noEmptyLabel) {
                return;
            }
            if (this.collection.length === 0) {
                this.$ul.append(this.$empty);
            } else {
                this.$empty.remove();
            }
            return this.$ul.toggleClass('empty', this.collection.length === 0);
        }

    });

    return {
        ParticipantEntryView: ParticipantEntryView,
        UserContainer: UserContainer
    };
});
