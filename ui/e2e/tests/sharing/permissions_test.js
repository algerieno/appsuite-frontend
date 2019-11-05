/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Julian Bäume <julian.baeume@open-xchange.com>
 *
 */

/// <reference path="../../steps.d.ts" />

Feature('Sharing');

Before(async (users) => {
    await users.create();
    await users.create();
});

After(async (users) => {
    await users.removeAll();
});

Scenario('[C45032] Edit Permissions at "My shares"', async function (I, users, drive) {
    session('Alice', () => {
        I.login('app=io.ox/files');
        drive.waitForApp();
        I.waitForText('My shares');
        I.selectFolder('My shares');
        drive.waitForApp();
        // sometimes this is not fast enough and there are 4 objects
        I.seeNumberOfElements('.list-view li.list-item', 0);

        //I.shareFolder('Music');
        I.click('My files', '.folder-tree');
        I.selectFolder('Music');
        drive.waitForApp();
        I.clickToolbar('Share');
        I.clickDropdown('Invite people');
        I.waitForText('Share folder');
        I.click('Send notification by email');
        I.dontSeeCheckboxIsChecked('Send notification by email');
        I.click('~Select contacts');
        I.waitForElement('.modal .list-view.address-picker li.list-item');
        I.fillField('Search', users[1].get('name'));
        I.waitForText(users[1].get('name'), 5, '.address-picker');
        I.waitForText(users[1].get('primaryEmail'));
        I.click(users[1].get('primaryEmail'), '.address-picker .list-item');
        I.click({ css: 'button[data-action="select"]' });
        I.waitForDetached('.address-picker');
        I.waitForElement(locate('.permissions-view .row').at(2));
        I.dontSee('Guest', '.permissions-view');
        I.seeNumberOfElements('.permissions-view .permission.row', 2);
        I.click('Author');
        I.clickDropdown('Viewer');
        I.click('Share', '.modal');
        I.waitForDetached('.modal');

        I.selectFolder('My shares');
        I.waitForElement(locate('.displayname').withText('Music').inside('.list-view'));
        I.seeNumberOfElements('.list-view li.list-item', 1);

        I.click('Music', '.list-view .displayname');
    });

    session('Bob', () => {
        I.login('app=io.ox/files', { user: users[1] });
        drive.waitForApp();
        I.waitForText('Shared files', 5, '.folder-tree');
        I.selectFolder('Shared files');
        drive.waitForApp();
        I.waitForText(users[0].get('name'));
        I.selectFolder(users[0].get('name'));
        I.waitForText('Music', 5, '.list-view');
        I.selectFolder('Music');
        I.retry(3).dontSee('New', '.classic-toolbar');
        I.selectFolder(users[0].get('name'));
    });

    session('Alice', () => {
        I.click('Edit share');
        I.waitForText('Share folder');
        I.click('Send notification by email');
        I.dontSeeCheckboxIsChecked('Send notification by email');
        I.click('Details', locate('.permissions-view .row').at(2));
        I.clickDropdown('Create objects and subfolders');

        //close the dropdown
        I.click('.smart-dropdown-container');

        I.click('Share', '.modal');
        I.waitForDetached('.modal');
    });

    session('Bob', () => {
        I.triggerRefresh();

        I.selectFolder('Music');
        I.clickToolbar('New');
        I.clickDropdown('Add new folder');
        I.waitForText('Add new folder');
        I.fillField('Folder name', 'Hello from Bob');
        I.click('Add');
    });

    session('Alice', () => {
        I.selectFolder('Music');

        I.triggerRefresh();

        I.waitForText('Hello from Bob');
    });
});

Scenario('[C107063] Revoke Permissions at "My shares"', async function (I, users, drive) {
    session('Alice', () => {
        I.login('app=io.ox/files');
        drive.waitForApp();
        I.selectFolder('My shares');
        // sometimes this is not fast enough and there are 4 objects
        I.retry(3).seeNumberOfElements('.list-view li.list-item', 0);

        //I.shareFolder('Music');
        I.selectFolder('Music');
        I.clickToolbar('Share');
        I.clickDropdown('Invite people');
        I.waitForText('Share folder');
        I.click('Send notification by email');
        I.dontSeeCheckboxIsChecked('Send notification by email');
        I.click('~Select contacts');
        I.waitForElement('.modal .list-view.address-picker li.list-item');
        I.fillField('Search', users[1].get('name'));
        I.waitForText(users[1].get('name'), 5, '.address-picker');
        I.waitForText(users[1].get('primaryEmail'));
        I.click(users[1].get('primaryEmail'), '.address-picker .list-item');
        I.click({ css: 'button[data-action="select"]' });
        I.waitForDetached('.address-picker');
        I.waitForElement(locate('.permissions-view .row').at(2));
        I.dontSee('Guest', '.permissions-view');
        I.seeNumberOfElements('.permissions-view .permission.row', 2);
        I.click('Author');
        I.clickDropdown('Viewer');
        I.click('Share', '.modal');
        I.waitForDetached('.modal');

        I.selectFolder('My shares');
        I.waitForElement(locate('.displayname').withText('Music').inside('.list-view'));
        I.seeNumberOfElements('.list-view li.list-item', 1);
        I.waitForText('Music', 5, '.list-view');

        I.click('Music', '.list-view .displayname');
    });

    session('Bob', () => {
        I.login('app=io.ox/files', { user: users[1] });
        drive.waitForApp();
        I.selectFolder(users[0].get('name'));
        I.waitForText('Music', 5, '.list-view');
    });

    session('Alice', () => {
        I.clickToolbar('Revoke access');
        I.waitForText('Revoked access.');
    });

    session('Bob', () => {
        I.triggerRefresh();

        I.waitForInvisible('Shared files', 5, '.folder-tree');
        //I.dontSee('Music', '.list-view');
    });
});

Scenario('[C73919] Copy a shared file to another folder', async function (I, users) {
    // the test case also shares with an external user, this is left out for now.

    const folder = await I.grabDefaultFolder('infostore');
    await I.haveFile(folder, 'e2e/media/files/0kb/document.txt');
    I.login('app=io.ox/files');
    I.waitForText('document.txt', 5, '.file-list-view');

    I.click(locate('.list-view li').withText('document.txt'));
    I.clickToolbar('~View');
    I.waitForVisible('.io-ox-viewer');
    I.waitForEnabled({ css: '.io-ox-viewer input.file-input' });
    I.attachFile('.io-ox-viewer input.file-input', 'e2e/media/files/0kb/document.txt');
    I.click('Upload');
    I.waitForText('Versions (2)');
    I.clickToolbar('~Close viewer');
    I.waitForDetached('.io-ox-viewer');
    I.see('Versions (2)', '.detail-pane');

    //I.shareFile
    I.clickToolbar('Share');
    I.click('Invite people');
    I.waitForText('Share file');
    I.click('~Select contacts');
    I.waitForElement('.modal .list-view.address-picker li.list-item');
    I.fillField('Search', users[1].get('name'));
    I.waitForText(users[1].get('name'), 5, '.address-picker');
    I.waitForText(users[1].get('primaryEmail'));
    I.click(users[1].get('primaryEmail'), '.address-picker .list-item');
    I.click({ css: 'button[data-action="select"]' });
    I.waitForElement(locate('.permissions-view .row').at(1));
    I.click('Share', '.modal');
    I.waitForDetached('.modal');
    I.see('This file is shared with others', '.detail-pane');

    I.clickToolbar('~More actions');
    I.click('Copy');
    I.waitForText('Copy', 5, '.modal');
    I.pressKey('Arrow_Down');
    I.click('Documents', '.modal');
    I.waitForElement(locate('li.selected').withAttr({ 'aria-label': 'Documents' }).inside('.modal-body'));
    I.click('Copy', '.modal');
    I.waitForText('File has been copied', 5);

    I.selectFolder('Documents');
    I.waitForText('document.txt', 5, '.list-view');
    I.waitForDetached('#io-ox-refresh-icon .fa-spin');
    I.waitForVisible(locate('.io-ox-files-main .list-view li').withText('document.txt'));
    I.click(locate('.list-view li').withText('document.txt'));
    I.see('Upload new version', '.detail-pane');
    I.dontSee('Versions (2)', '.detail-pane');
    I.see('Shares', '.detail-pane');
    I.dontSee('This file is shared with others', '.detail-pane');

    I.logout();

    I.login('app=io.ox/mail', { user: users[1] });
    I.waitForText('has shared the file', undefined, '.list-view');
    I.click(locate('li.list-item'));
    I.waitForElement('.mail-detail-frame');
    within({ frame: '.mail-detail-frame' }, () => {
        I.waitForText('View file');
        I.click('View file');
    });
    I.waitForElement({ css: '[aria-label="View details"]' });
    I.click('~View details');
    I.click('Shared files', '.detail-pane');
    I.waitForDetached('.busy-indicator.io-ox-busy');
    I.waitForText('document.txt');
    I.click(locate('.io-ox-files-main .list-view li').withText('document.txt'));
    I.see('Versions (2)', '.detail-pane');
    I.see('This file is shared with others', '.detail-pane');

    I.clickToolbar(locate('.io-ox-files-main .classic-toolbar [aria-label="More actions"]'));
    I.click(locate('.dropdown.open.more-dropdown li').withText('Copy'));
    I.waitForText('Copy', 5, '.modal');
    I.pressKey('Arrow_Down');
    I.click('Documents', '.modal');
    I.waitForElement(locate('li.selected').withAttr({ 'aria-label': 'Documents' }).inside('.modal-body'));
    I.click('Copy', '.modal');
    I.waitForText('File has been copied', 5);

    I.selectFolder('My files');
    I.waitForElement('.io-ox-files-main .list-view.complete');
    I.selectFolder('Documents');
    I.waitForVisible(locate('.io-ox-files-main .list-view li').withText('document.txt'));
    I.click(locate('.io-ox-files-main .list-view li').withText('document.txt'));
    I.waitForText('Upload new version', 5, '.detail-pane');
    I.dontSee('Versions (2)', '.detail-pane');
    I.see('Shares', '.detail-pane');
    I.dontSee('This file is shared with others', '.detail-pane');
});
