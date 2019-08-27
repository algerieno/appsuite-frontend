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
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/chat/views/chatList', [
    'io.ox/backbone/views/disposable',
    'io.ox/chat/views/state',
    'io.ox/chat/views/chatListEntry'
], function (DisposableView, StateView, ChatListEntryView) {

    'use strict';

    var ChatListView = DisposableView.extend({

        tagName: 'ul',

        className: 'chats',

        initialize: function () {
            this.listenTo(this.collection, {
                'add': this.onAdd,
                'remove': this.onRemove,
                'change:open': this.onChangeOpen,
                'change:modified': this.onChangeModified
            });
        },

        render: function () {
            // rendering happens via onAdd
            this.collection.fetch();
            return this;
        },

        renderItem: function (model) {
            return new ChatListEntryView({ model: model }).render().$el;
        },

        renderIcon: function (model) {
            switch (model.get('type')) {
                case 'private':
                    return $('<span class="btn-icon">').append(
                        new StateView({ model: model.getFirstMember() }).render().$el.addClass('small')
                    );
                case 'group':
                    return $('<i class="fa fa-group btn-icon" aria-hidden="true">');
                case 'channel':
                    return $('<i class="fa fa-hashtag btn-icon" aria-hidden="true">');
                // no default
            }
        },

        getItems: function () {
            return this.collection.getOpen();
        },

        getNode: function (model) {
            return this.$('[data-cid="' + model.get('id') + '"]');
        },

        onAdd: _.debounce(function (model, collection, options) {
            if (this.disposed) return;

            this.$el.prepend(
                options.changes.added
                .filter(function (model) { return model.isOpen(); })
                .map(this.renderItem, this)
            );
        }, 1),

        onRemove: function (model) {
            this.getNode(model).remove();
        },

        onChangeOpen: function (model, value) {
            if (value) {
                this.$el.prepend(this.renderItem(model));
            } else {
                this.onRemove(model);
            }
        },

        onChangeModified: function (model) {
            var node = this.getNode(model),
                hasFocus = node[0] === document.activeElement;
            this.$el.prepend(node);
            if (hasFocus) node.focus();
        }
    });

    return ChatListView;
});
