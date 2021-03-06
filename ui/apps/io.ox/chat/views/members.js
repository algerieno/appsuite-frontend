/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Richard Petersen <richard.petersen@open-xchange.com>
 */

define('io.ox/chat/views/members', [
    'io.ox/backbone/views/disposable',
    'io.ox/chat/views/avatar',
    'io.ox/switchboard/presence',
    'gettext!io.ox/chat'
], function (Disposable, AvatarView, presence, gt) {

    'use strict';

    return Disposable.extend({

        tagName: 'fieldset',

        className: 'members',

        events: {
            'click .remove': 'onRemove'
        },

        initialize: function () {
            this.listenTo(this.collection, 'add remove reset', this.render);
        },

        renderEntry: function (model) {
            if (model.get('id') === ox.user_id) return;
            return $('<li>').attr('data-id', model.get('id')).append(
                $('<div class="picture">').append(
                    new AvatarView({ model: model }).render().$el,
                    presence.getPresenceIcon(model.get('email'))
                ),
                $('<div class="center">').append(
                    $('<strong>').text(model.getName()),
                    $('<span>').text(model.get('email1'))
                ),
                $('<div class="member-controls">').append(
                    model.get('id') !== ox.user_id ? $('<button class="remove">').append($('<i class="fa fa-times">')) : null
                )
            );
        },

        render: function () {
            this.$el.empty().append(
                //#. %1$d is the number of participants
                $('<legend>').text(gt('Participants (%1$d)', this.collection.length - 1)),
                $('<ul class="list-unstyled">').append(
                    this.collection.map(this.renderEntry.bind(this))
                )
            );
            return this;
        },

        onRemove: function (e) {
            var target = $(e.currentTarget),
                id = target.closest('li').attr('data-id'),
                model = this.collection.get(id);
            this.collection.remove(model);
        }
    });
});
