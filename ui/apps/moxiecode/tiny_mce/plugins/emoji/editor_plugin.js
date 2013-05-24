/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2013 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Julian Bäume <julian.baeume@open-xchange.com>
 */
(function () {

    "use strict";

    window.tinymce.create('tinymce.plugins.EmojiPlugin', {
        init : function (ed, url) {
            ed.addCommand('mceInsertEmoji', function (ui, baton) {
                require(['io.ox/core/tk/dialogs',
                        'moxiecode/tiny_mce/plugins/emoji/main'], function (dialogs, emoji) {
                    var popup = new dialogs.SidePopup();
                    popup.show(baton.event, function (pane) {
                        _(emoji.icons).each(function (icon) {
                            pane.append(
                                $('<a href="#" class="emoji">')
                                .attr('title', icon.desc)
                                .addClass(icon.css)
                                .click(function (evt) {
                                    var ed = baton.editor;
                                    evt.preventDefault();

                                    ed.execCommand('mceInsertContent', false, icon.unicode);
                                })
                            );
                        });
                    });
                });
            });

            //TODO: translate title
            ed.addButton('emoji', {
                title: 'Insert Emoji',
                image: url + '/img/smile.gif',
                onclick: function (e) {
                    ed.execCommand('mceInsertEmoji', true, {event: e, editor: ed});
                }
            });
            ed.contentCSS.push(url + '/font/androidemoji.less');
        },
        getInfo: function () {
            return {
                longname: 'Emoji plugin',
                author: 'Julian Bäume',
                authorurl: 'http://open-xchange.com',
                infourl: 'http://oxpedia.org/wiki/AppSuite:Emoji',
                version: '0.1'
            };
        }
    });

    window.tinymce.PluginManager.add('emoji', window.tinymce.plugins.EmojiPlugin);
}());
