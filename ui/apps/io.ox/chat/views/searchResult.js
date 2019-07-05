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

define('io.ox/chat/views/searchResult', [
    'io.ox/backbone/views/disposable',
    'io.ox/chat/events',
    'io.ox/chat/data',
    'io.ox/chat/views/chatListEntry'
], function (DisposableView, events, data, ChatListEntryView) {

    'use strict';

    var SearchResultView = DisposableView.extend({

        tagName: 'ul',
        className: 'search-result',

        initialize: function () {
            this.collection = new Backbone.Collection();
            this.listenTo(events, 'cmd:search', function (query) {
                this.query = query;
                this.search(query);
            });
            this.listenTo(this.collection, 'add remove reset', _.debounce(this.render.bind(this), 10));
        },

        render: function () {
            this.$el.parent().toggleClass('show-search', !!this.query);
            this.$el.empty().append(
                this.collection.map(function (model) {
                    return new ChatListEntryView({ model: model }).render().$el;
                })
            );
            if (this.collection.length === 0) {
                this.$el.append(
                    $('<li class="no-results">').text('No search results')
                );
            }
            return this;
        },

        searchAddresses: function (query) {
            return require(['io.ox/contacts/addressbook/popup']).then(function (picker) {
                return picker.getAllMailAddresses().then(function (res) {
                    return picker.search(query, res.index, res.hash, true);
                });
            });
        },

        searchMessages: function (query) {
            var url = data.API_ROOT + '/messages?' + $.param({ q: query }),
                regexQuery = new RegExp('(\\b' + escape(query) + ')', 'ig');
            return $.getJSON(url).then(function (result) {
                result.forEach(function (data) {
                    data.body = data.body.replace(regexQuery, '<b class="search-highlight">$1</b>');
                });
                return result;
            });
        },

        search: function (query) {
            if (!query) return this.collection.reset();

            $.when(
                this.searchMessages(query),
                this.searchAddresses(query)
            ).then(function (messages, addresses) {
                var ids = {},
                    chatsByMessage = messages.map(function (message) {
                        // find according room
                        var room = data.chats.get(message.roomId);
                        if (!room) return;
                        room = room.clone();
                        room.set('lastMessage', message);
                        ids[room.get('id')] = true;

                        return room;
                    }),
                    chatsByAddress = addresses.map(function (address) {
                        // find according room
                        var room = data.chats.find(function (model) {
                            return model.get('type') === 'private' && model.get('members').indexOf(address.user_id) >= 0;
                        });
                        if (room) return room;
                        return new data.chats.model({
                            lastMessage: { id: 15, roomId: 4, senderId: 4, body: 'Create new chat', type: 'text' },
                            members: [data.user_id, address.user_id],
                            type: 'private',
                            unreadCount: 0
                        });
                    }).filter(function (room) {
                        return !ids[room.get('id')];
                    });
                var models = [].concat(chatsByMessage).concat(chatsByAddress);
                models = _(models).compact();
                this.collection.reset(models);
            }.bind(this));
        }
    });

    // escape words for regex
    function escape(str) {
        return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    return SearchResultView;
});
