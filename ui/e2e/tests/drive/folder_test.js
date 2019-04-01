/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author David Bauer <david.bauer@open-xchange.com>
 *
 */

/// <reference path="../../steps.d.ts" />

Feature('Drive > Folder');

const prepare = (I, folder) => {
    I.login('app=io.ox/files' + (folder ? '&folder=' + folder : ''));
    I.waitForElement('.file-list-view.complete');
};

Before(async (I, users) => {
    await users.create();
});

After(async (users) => {
    await users.removeAll();
});

// Note: The title of this test, does not really reflect what is tested here
// A better title would be something like: Public files: Upload and new actions not shown in root folder
Scenario('[C8374] Public files: Add a file', (I) => {
    prepare(I);
    I.selectFolder('Public files');
    I.clickToolbar('New');
    I.waitForText('Add new folder');
    I.dontSee('Upload files');
    I.dontSee('New text document');
    I.dontSee('New spreadsheet');
    I.dontSee('New presentation');
    I.dontSee('Add note');
});

// Note: The title of this test, does not really reflect what is tested here (again)
// A better title would be something like: Public files: Moving files to root folder not possible
Scenario('[C8375] Public files: Move a file', async (I) => {
    const folder = await I.grabDefaultFolder('infostore');
    await I.haveFile(folder, 'e2e/media/files/0kb/document.txt');
    prepare(I);
    I.waitForText('document.txt', 1, '.file-list-view');
    I.click(locate('li.list-item').withText('document.txt'));
    I.clickToolbar('~More actions');
    I.waitForText('Move');
    I.click('Move', '.smart-dropdown-container');
    I.waitForText('Public files', 1, '.folder-picker-dialog');
    I.click('~Public files', '.folder-picker-dialog');
    I.seeElement('.btn[data-action="ok"][disabled]');
});

Scenario('[C8376] Add a subfolder', async (I) => {
    prepare(I);
    I.click('[title="Actions for My files"]');
    I.click('Add new folder', '.smart-dropdown-container');
    I.waitForText('Add new folder', 1, '.modal-dialog');
    I.fillField('Folder name', 'Testfolder');
    I.click('Add');
    I.waitForText('Testfolder', 1, '.file-list-view');
});