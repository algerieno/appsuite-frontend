/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2020 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Daniel Dickhaus <daniel.dickhaus@open-xchange.com>
 */

Feature('General > Code Loading');

Before(async function (users) {
    await users.create();
});

After(async function (users) {
    await users.removeAll();
});

Scenario('[XSS] [OXUIB-400] No malicious code execution when code loading fails', async function (I, drive) {
    I.login('app=io.ox/files:foo,xx/../../xxx");document.write("XSS");//');
    // will fail if xss was succesfull -> page is overwritten
    drive.waitForApp();
});
