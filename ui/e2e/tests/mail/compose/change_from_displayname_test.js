/**
* This work is provided under the terms of the CREATIVE COMMONS PUBLIC
* LICENSE. This work is protected by copyright and/or other applicable
* law. Any use of the work other than as authorized under this license
* or copyright law is prohibited.
*
* http://creativecommons.org/licenses/by-nc-sa/2.5/
* © 2019 OX Software GmbH, Germany. info@open-xchange.com
*
* @author Francisco Laguna <francisco.laguna@open-xchange.com>
*/

/// <reference path="../../../steps.d.ts" />

Feature('Mail Compose');

Before(async (users) => {
    await users.create();
});
After(async (users) => {
    await users.removeAll();
});

Scenario('[C163026] Change \'from\' display name when sending a mail', async (I, users) => {
    let [user] = users;
    await I.haveSetting('io.ox/mail//features/registerProtocolHandler', false);
    // Log in and switch to mail app
    I.login('app=io.ox/mail');
    I.waitForText('Compose');
    I.click('Compose');
    // Wait for the compose dialog
    I.waitForVisible('.io-ox-mail-compose textarea.plain-text,.io-ox-mail-compose .contenteditable-editor');

    // Navigate to the name change dialog
    I.click(user.get('primaryEmail'));
    I.click('Edit names');

    I.waitForElement('input[name=overwrite]');
    I.click('input[name=overwrite]');
    I.fillField('name', 'Entropy McDuck');
    I.click('Save');
    I.waitForDetached('io-ox-dialog-popup');

    // Verify the dislay name has changed
    I.see('Entropy McDuck');

    // Turn off display names
    I.click(user.get('primaryEmail'));
    I.click('Show names');

    // Close the dropdown
    I.click('div.smart-dropdown-container');
    I.dontSee('Entropy McDuck');
});