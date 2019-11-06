/**
* This work is provided under the terms of the CREATIVE COMMONS PUBLIC
* LICENSE. This work is protected by copyright and/or other applicable
* law. Any use of the work other than as authorized under this license
* or copyright law is prohibited.
*
* http://creativecommons.org/licenses/by-nc-sa/2.5/
* © 2019 OX Software GmbH, Germany. info@open-xchange.com
*
* @author Christoph Kopp <christoph.kopp@open-xchange.com>
*/

/// <reference path="../../../steps.d.ts" />

Feature('Mailfilter > Vacation notice');

Before(async function (users) {
    await users.create();
    await users.create();
});

After(async function (users) {
    await users.removeAll();
});

Scenario('[C7785] Set vacation notice', async function (I, users) {
    await I.haveSetting({
        'io.ox/mail': { messageFormat: 'text' }
    }, { user: users[1] });

    I.login('app=io.ox/settings&folder=virtual/settings/io.ox/mail');
    I.waitForVisible('.rightside .io-ox-mail-settings');
    I.see('Mail', '.rightside h1');

    I.waitForVisible('.form-group.buttons [data-action="edit-vacation-notice"]');
    I.click('Vacation notice ...', '.form-group.buttons [data-action="edit-vacation-notice"]');
    I.waitForElement('.modal');

    // check for all expexted elements
    I.seeElement('.modal-header input[name="active"]');

    // buttons
    I.see('Cancel', '.modal-footer');
    I.see('Apply changes', '.modal-footer');

    // form elements
    I.seeElement('.modal input[name="activateTimeFrame"][disabled]');
    I.seeElement('.modal input[name="dateFrom"][disabled]');
    I.seeElement('.modal input[name="dateUntil"][disabled]');
    I.seeElement('.modal input[name="subject"][disabled]');
    I.seeElement('.modal textarea[name="text"][disabled]');
    I.see('Show advanced options');

    // enable
    I.click('.modal-header .checkbox.switch.large');


    I.seeElement('.modal input[name="activateTimeFrame"]:not([disabled])');
    I.seeElement('.modal input[name="subject"]:not([disabled])');
    I.seeElement('.modal textarea[name="text"]:not([disabled])');

    I.fillField('.modal input[name="subject"]', 'Vacation subject');
    I.fillField('.modal textarea[name="text"]', 'Vacation text');

    I.click('Apply changes');

    I.see('Vacation notice ...', '.settings-detail-pane [data-action="edit-vacation-notice"]');

    I.waitForElement('.settings-detail-pane [data-action="edit-vacation-notice"] .fa-toggle-on');
    I.waitForDetached('.modal');

    I.logout();

    I.login('app=io.ox/mail', { user: users[1] });

    // compose mail for user 0
    I.clickToolbar('Compose');
    I.waitForVisible('.io-ox-mail-compose textarea.plain-text,.io-ox-mail-compose .contenteditable-editor');
    I.wait(1);
    I.fillField('.io-ox-mail-compose div[data-extension-id="to"] input.tt-input', users[0].get('primaryEmail'));
    I.fillField('.io-ox-mail-compose [name="subject"]', 'Test subject');
    I.fillField({ css: 'textarea.plain-text' }, 'Test text');
    I.seeInField({ css: 'textarea.plain-text' }, 'Test text');

    I.click('Send');
    I.waitForElement('~Sent, 1 total', 30);

    I.logout();

    I.login('app=io.ox/mail', { user: users[0] });

    // check for mail
    I.waitForVisible('.io-ox-mail-window .leftside ul li.unread');
    I.click('.io-ox-mail-window .leftside ul li.unread');
    I.waitForVisible('.io-ox-mail-window .mail-detail-pane .subject');
    I.see('Test subject', '.mail-detail-pane');

    I.logout();

    I.login('app=io.ox/mail', { user: users[1] });

    // check for vacation notice
    I.waitForVisible('.io-ox-mail-window .leftside ul li.unread');
    I.click('.io-ox-mail-window .leftside ul li.unread');
    I.waitForVisible('.io-ox-mail-window .mail-detail-pane .subject');
    I.see('Vacation subject', '.mail-detail-pane');

});

Scenario('[C163027] User gets notified if a vacation notice is avtive (banner in inbox)', async function (I, users) {
    let [user] = users;

    I.haveMailFilterRule({
        rulename: 'vacation notice',
        active: true,
        flags: ['vacation'],
        test: { 'id': 'true' },
        actioncmds: [
            { days: '7', subject: 'Test Subject', text: 'Test Text', id: 'vacation', addresses: [user.get('primaryEmail')] }
        ]
    });

    I.login('app=io.ox/mail');
    I.waitForElement('.window-body .leftside .alert');
    I.see('Your vacation notice is active', '.window-body .leftside .alert');
});

Scenario('[C110281] Vacation notice is time zone capable', async function (I, users) {

    await I.haveSetting({
        'io.ox/mail': { messageFormat: 'text' },
        'io.ox/core': { timezone: 'Europe/London' }
    }, { user: users[0] });
    await I.haveSetting({
        'io.ox/core': { timezone: 'Pacific/Kiritimati' }
    }, { user: users[1] });

    I.login('app=io.ox/settings&folder=virtual/settings/io.ox/mail', { user: users[1] });
    I.waitForVisible('.rightside .io-ox-mail-settings');
    I.see('Mail', '.rightside h1');

    I.waitForVisible('.form-group.buttons [data-action="edit-vacation-notice"]');
    I.click('Vacation notice ...', '.form-group.buttons [data-action="edit-vacation-notice"]');
    I.waitForElement('.modal');

    // enable
    I.click('.modal-header .checkbox.switch.large');

    I.fillField('.modal input[name="subject"]', 'Vacation subject');
    I.fillField('.modal textarea[name="text"]', 'Vacation text');

    I.click('Send vacation notice during this time only');
    I.click('Apply changes');

    I.see('Vacation notice ...', '.form-group.buttons [data-action="edit-vacation-notice"]');

    I.waitForElement('.form-group.buttons [data-action="edit-vacation-notice"] .fa-toggle-on');
    I.waitForDetached('.modal');

    I.logout();

    I.login('app=io.ox/mail', { user: users[0] });

    // compose mail for user 1
    I.clickToolbar('Compose');
    I.waitForVisible('.io-ox-mail-compose textarea.plain-text,.io-ox-mail-compose .contenteditable-editor');
    I.wait(1);
    I.fillField('.io-ox-mail-compose div[data-extension-id="to"] input.tt-input', users[1].get('primaryEmail'));
    I.fillField('.io-ox-mail-compose [name="subject"]', 'Test subject');
    I.fillField({ css: 'textarea.plain-text' }, 'Test text');
    I.seeInField({ css: 'textarea.plain-text' }, 'Test text');

    I.click('Send');

    // check for mail
    I.waitForElement('~Sent, 1 total', 30);
    I.waitForElement('~Inbox, 1 unread, 1 total', 30);

    I.waitForVisible('.io-ox-mail-window .leftside ul li.unread');
    I.click('.io-ox-mail-window .leftside ul li.unread');
    I.waitForVisible('.io-ox-mail-window .mail-detail-pane .subject');
    I.see('Vacation subject', '.mail-detail-pane');

});
