/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Alexander Quast <alexander.quast@open-xchange.com>
 *
 */

/// <reference path="../../../steps.d.ts" />

Feature('Settings > Mail');

Before(async (users) => {
    await users.create();
});

After(async (users) => {
    await users.removeAll();
});

Scenario('[7772] Contact collection when sending mail', async (I) => {
    await I.haveSetting('io.ox/mail//features/registerProtocolHandler', false);

    I.login('app=io.ox/settings&folder=virtual/settings/io.ox/mail');
    I.waitForVisible('.io-ox-mail-settings');
    I.checkOption('Automatically collect contacts in the folder "Collected addresses" while sending');

    I.openApp('Mail');
    I.waitForText('Compose', '.classic-toolbar');
    I.retry(5).clickToolbar('Compose');

    I.waitForFocus('[placeholder="To"]');
    I.fillField('To', 'urbi@orbi.vat');
    I.fillField('Subject', 'Richtig gutes zeug');
    I.click('Send');
    I.waitForVisible('#io-ox-launcher');

    I.openApp('Address Book');
    I.click('#io-ox-refresh-icon');
    I.waitForText('My address books');
    I.doubleClick('~My address books');

    I.selectFolder('Collected addresses');
    I.waitForText('urbi@orbi.vat');
});

