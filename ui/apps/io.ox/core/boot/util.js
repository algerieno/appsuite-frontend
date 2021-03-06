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
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define('io.ox/core/boot/util', [], function () {

    'use strict';

    function displayFeedback() {

        var node = feedbackNode;

        if (!node) return;
        if (typeof node === 'function') node = node();
        if (typeof node === 'string') node = $.txt(node); // TODO: this had a gt()

        $('#io-ox-login-feedback').empty().append(
            $('<div role="alert" class="selectable-text alert alert-info">').append(
                node
            )
        );

    }
    var feedbackNode = null;
    // var feedbackType = null;

    ox.on('language', displayFeedback);

    ox.on('change:document:title', function (arg) {
        var elements = [].concat(arg),
            change = _.lfo(changeDocumentTitle);

        // skip if we don't have a session (i.e. during signin) because there is no way to get anything via user api
        if (ox.signin) return change(elements);

        require(['io.ox/core/api/user', 'io.ox/contacts/util'], function (api, util) {
            api.get({ id: ox.user_id }).done(function (data) {
                var user = util.getMailFullName(data) || ox.user;
                elements.push(user);
                change(elements);
            });
        });
    });

    function changeDocumentTitle(elements) {
        document.title = document.customTitle = _.compact(_.uniq(elements)).concat(ox.serverConfig.productName).join(' - ');
    }

    var exports = {

        DURATION: 250,

        debug: $.noop,

        gt: _.identity,

        setPageTitle: function (title) {
            ox.trigger('change:document:title', title);
            // document.title = title || '';
            $('[name="apple-mobile-web-app-title"]').attr('content', title);
        },

        feedback: function (type, node) {
            // feedbackType = type;
            feedbackNode = node;
            displayFeedback();
        },

        cleanUp: function () {
            // we don't clear the password right now (see bug 36950)
            $('#io-ox-login-form')
                .off('submit')
                .find('input, button').prop('readonly', true);
        },

        gotoSignin: function (hash) {
            var ref = (location.hash || '').replace(/^#/, ''),
                path = _.url.vars(ox.serverConfig.loginLocation || ox.loginLocation),
                glue = path.indexOf('#') > -1 ? '&' : '#';
            hash = (hash || '') + (ref ? '&ref=' + encodeURIComponent(ref) : '');
            _.url.redirect((hash ? path + glue + hash : path));
        },

        isAnonymous: function () {
            return _.url.hash('login_type') === 'anonymous_password';
        },

        isGuest: function () {
            return _.url.hash('login_type') === 'guest';
        },

        isContinue: function () {
            return /^(guest|message_continue)$/.test(_.url.hash('login_type'));
        },

        isGuestWithPassword: function () {
            return _.url.hash('login_type') === 'guest_password';
        },


        scopeCustomCss: function (customCss, scopeIdentifier) {
            if (!customCss) return;

            customCss = customCss.replace(/([^}{]*{)/gi, function (x) {
                if (x.trim().indexOf('@') === 0) return x;
                if (x.trim().indexOf(scopeIdentifier) >= 0) return x;
                return x.match(/^\s*/)[0] + scopeIdentifier + ' ' + x.trim();
            });

            return customCss;
        },

        fail: function (error, focus) {
            var self = this;
            // restore form
            this.restore();

            // show error
            if (error && error.error === '0 general') {
                this.feedback('error', 'No connection to server. Please check your internet connection and retry.');
            } else if (error && error.code === 'LGI-0011') {
                //password expired
                this.feedback('error', function () {
                    return [
                        $('<p>').text(self.gt('Your password is expired. Please change your password to continue.')),
                        // don't use a button here or it will trigger a submit event
                        $('<a target="_blank" role="button" class="btn btn-primary btn">')
                            .text(self.gt('Change password'))
                            // error_params[0] should contain a url to password change manager or sth.
                            .attr('href', error.error_params[0])
                    ];
                });
            } else if (error && error.code === 'LGI-0016' && (error.error_params || []).length === 1) {
                _.url.redirect(error.error_params[0]);
            } else {
                this.feedback('error', $.txt(_.formatError(error, '%1$s (%2$s)')));
            }
            // reset focus
            var id = (_.isString(focus) && focus) || (this.isAnonymous() && 'password') || 'username';
            $('#io-ox-login-' + id).focus().select();
            // event
            ox.trigger('login:fail', error);
        },

        restore: function () {
            // stop being busy
            $('#io-ox-login-form')
                // visual response (shake sucks on touch devices)
                .css('opacity', '')
                .find('input').prop('disabled', false);
            $('#io-ox-login-blocker').hide();
            //$('#io-ox-login-feedback').idle();
        },

        lock: function () {
            // be busy
            $('#io-ox-login-form')
                .css('opacity', 0.5)
                .find('input').prop('disabled', true);
            $('#io-ox-login-blocker').show();
            //$('#io-ox-login-feedback').busy().empty();
        },

        checkTabHandlingSupport: function () {
            return !ox.serverConfig.openInSingleTab
                && !_.device('ie && ie <= 11')  // no old internet explorer
                && !_.device('smartphone')      // no mobile
                && !_.device('tablet')          // no tablet
                && !_.device('touch && macos'); // no iPadOS
        }

    };

    //
    // take care of invalid sessions
    //

    ox.relogin = function () {
        var Stage = require('io.ox/core/extPatterns/stage');
        Stage.run('io.ox/core/boot/login', {}, { methodName: 'relogin' });
    };

    ox.on('relogin:required', ox.relogin);

    ox.busy = function (block) {
        // init screen blocker
        $('#background-loader')[block ? 'busy' : 'idle']()
            .show()
            .addClass('secure' + (block ? ' block' : ''));
    };

    ox.idle = function () {
        $('#background-loader')
            .removeClass('secure block')
            .hide()
            .idle()
            .empty();
    };

    // only disable, don't show night-rider
    ox.disable = function () {
        $('#background-loader')
            .addClass('busy block secure')
            .on('touchmove', function (e) {
                e.preventDefault();
                return false;
            })
            .show();
    };

    //
    // Debug?
    //

    if (/\bboot/.test(_.url.hash('debug'))) {
        exports.debug = function () {
            var args = _(arguments).toArray(), t = _.now() - ox.t0;
            args.unshift('boot (' + (t / 1000).toFixed(1) + 's): ');
            console.log.apply(console, args);
        };
    }

    return exports;
});
