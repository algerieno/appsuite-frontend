/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2018 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author David Bauer <david.bauer@open-xchange.com>
 */
/// <reference path="../../steps.d.ts" />

const { expect } = require('chai');

Scenario('Contacts - List view w/o contact', async (I) => {
    I.login('app=io.ox/contacts');
    I.waitForElement('.contact-detail');
    I.waitForElement('.vgrid-cell.selectable.contact.selected');
    I.clickToolbar('View');
    I.click('Checkboxes');
    I.click('.vgrid-cell.selectable.contact.selected .vgrid-cell-checkbox');
    I.waitForElement('.summary.empty');

    expect(await I.grabAxeReport()).to.be.accessible;
});

Scenario('Contacts - List view with contact detail view', async (I) => {
    I.login('app=io.ox/contacts');
    I.waitForElement('.contact-detail');

    expect(await I.grabAxeReport()).to.be.accessible;
});

Scenario('Contacts - Modal Dialog - New address book (with exceptions)', async (I) => {
    // Exceptions:
    // Input field has a missing label (critical)
    const excludes = { exclude: [['input[name="name"]']] };

    I.login('app=io.ox/contacts');
    I.waitForElement('.contact-detail');
    I.selectFolder('Contacts');
    I.click('Add new address book');
    I.waitForText('Add as public folder');

    expect(await I.grabAxeReport(excludes)).to.be.accessible;
});

Scenario('Contacts - Modal Dialog - Import', async (I) => {

    I.login('app=io.ox/contacts');
    I.waitForText('My address books');
    I.doubleClick('~My address books');
    I.click('~Contacts');
    I.waitForElement('[title="Actions for Contacts"]');
    I.click('*[title="Actions for Contacts"]');
    I.waitForText('Import');
    I.click('Import');
    I.waitForElement('h1.modal-title');

    expect(await I.grabAxeReport()).to.be.accessible;
});

Scenario('Contacts - Modal Dialog - Create sharing link (with exceptions)', async (I) => {
    // Exceptions:
    // Typeahead missing label (critical)
    // Textinput, password and textarea have missing visual labels (critical)

    const excludes = { exclude: [
        ['.tt-hint'], ['.tt-input'],
        ['[placeholder="Password"]'],
        ['[placeholder="Message (optional)"]'],
        ['input[type="text"].form-control']
    ] };

    I.login('app=io.ox/contacts');
    I.waitForText('My address books');
    I.doubleClick('~My address books');
    I.click('~Contacts');
    I.waitForElement('[title="Actions for Contacts"]');
    I.click('*[title="Actions for Contacts"]');
    I.waitForText('Create sharing link');
    I.click('Create sharing link');
    I.waitForElement('h1.modal-title');
    I.waitForText('Password required');

    expect(await I.grabAxeReport(excludes)).to.be.accessible;
});

Scenario('Contacts - New contact window', async (I) => {

    I.login('app=io.ox/contacts');
    I.waitForText('My address books');
    I.doubleClick('~My address books');
    I.click('~Contacts');
    I.waitForElement('[title="Actions for Contacts"]');
    I.clickToolbar('New');
    I.waitForText('Add contact');
    I.click('Add contact');
    I.waitForText('Personal information');

    expect(await I.grabAxeReport()).to.be.accessible;
});

Scenario('Contacts - New distribution list window (with exceptions)', async (I) => {
    // Exceptions:
    // Typeahead missing label (critical)
    const excludes = { exclude: [['.tt-hint'], ['.tt-input']] };

    I.login('app=io.ox/contacts');
    I.waitForText('My address books');
    I.doubleClick('~My address books');
    I.click('~Contacts');
    I.waitForElement('[title="Actions for Contacts"]');
    I.clickToolbar('New');
    I.waitForText('Add distribution list');
    I.click('Add distribution list');
    I.waitForText('Participants');

    expect(await I.grabAxeReport(excludes)).to.be.accessible;
});