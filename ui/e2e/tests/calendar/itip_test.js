/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Philipp Schumacher <philipp.schumacher@open-xchange.com>
 *
 */

/// <reference path="../../steps.d.ts" />

const moment = require('moment');

const actions = new DataTable(['buttonText', 'className', 'emailTitle', 'itipStatus']);
// itipStatus needs to be adjusted as soon as OXUIB-206 is fixed
actions.add(['Accept', 'accepted', 'accepted', 'You have accepted this appointment']);
actions.add(['Tentative', 'tentative', 'tentatively accepted', 'You tentatively accepted this appointment']);
actions.add(['Decline', 'declined', 'declined', 'You declined this appointment']);

Feature('Calendar > iTIP');

Before(async (users) => {
    await users.create();

});

After(async (users) => {
    await users.removeAll();

});

Data(actions).Scenario('[C241073] OX - OX', async function (I, calendar, mail, users, current, contexts) {
    const ctx = await contexts.create();
    await users.create(users.getRandom(), ctx);
    // 1.) User#A: Create an appointment with User#B
    const startDate = moment().startOf('hour').add(1, 'hour');
    const endDate = moment().startOf('hour').add(3, 'hour');
    await session('Alice', async () => {
        I.login('app=io.ox/calendar');
        calendar.waitForApp();
        calendar.newAppointment();
        I.fillField('Subject', 'MySubject');
        await calendar.setDate('startDate', startDate);
        await calendar.setDate('endDate', endDate);
        I.fillField(calendar.locators.starttime, startDate.format('h:MM A'));
        I.clearField(calendar.locators.endtime);
        I.fillField(calendar.locators.endtime, endDate.format('h:MM A'));
        await calendar.addParticipant(users[1].userdata.primaryEmail, false);
        I.click('Create');
        I.waitForDetached('.io-ox-calendar-edit-window');
    });
    // 2.) User#B: Read the iTIP mail
    await session('Bob', async () => {
        I.login('app=io.ox/mail', { user: users[1] });
        I.waitForText('New appointment: MySubject', 30);
        mail.selectMail('New appointment: MySubject');
        I.waitForElement('.mail-detail-frame');
        I.waitForText('Accept');
        I.waitForText('Tentative');
        I.waitForText('Decline');
        I.waitForText(`MySubject, ${startDate.format('ddd, M/D/YYYY h:MM – ') + endDate.format('h:MM A')}`);
        // 3.) User#B: Accept the appointment
        I.click(current.buttonText);
        I.waitForText(`You have ${current.emailTitle} the appointment`);
        // 4.) User#B: Go to calendar and verify the updated appointment information
        I.openApp('Calendar');
        calendar.waitForApp();
        calendar.switchView('Week');
        I.waitForInvisible('.page.current .workweek');
        I.waitForVisible('.page.current .week');
        I.waitForVisible('.page.current .week .appointment .title');
        I.click('.page.current .week .appointment .title');
        I.waitForElement('.io-ox-sidepopup');
        I.waitForElement(`.io-ox-sidepopup .participant a.accepted[title="${users[0].userdata.primaryEmail}"]`);
        I.waitForElement(`.io-ox-sidepopup .participant a.${current.className}[title="${users[1].userdata.primaryEmail}"]`);
    });
    // 5.) User#A: Read the iTIP mail
    await session('Alice', async () => {
        I.openApp('Mail');
        I.waitForText(`${users[1].userdata.display_name} ${current.emailTitle} the invitation: MySubject`);
        // 6.) User#A: Accept changes
        mail.selectMail(`${users[1].userdata.display_name} ${current.emailTitle} the invitation: MySubject`);
        I.waitForElement('.mail-detail-frame');
        I.waitForText('Accept changes');
        I.dontSeeElement({ xpath: './/button[text() = "Accept"]' });
        I.dontSee('Decline');
        I.dontSee('Tentative');
        I.click('Accept changes');
        I.waitForText('The appointment has been updated');
        I.waitForInvisible(
            locate('.list-view li.list-item')
                .withText(`${users[1].userdata.display_name} ${current.emailTitle} the invitation: MySubject`)
        );
        // 7.) User#A: Go to calendar and verify the updated appointment information
        I.openApp('Calendar');
        calendar.waitForApp();
        calendar.switchView('Week');
        I.waitForInvisible('.page.current .workweek');
        I.waitForVisible('.page.current .week');
        I.waitForVisible('.page.current .week .appointment .title');
        I.click('.page.current .week .appointment .title');
        I.waitForElement('.io-ox-sidepopup');
        I.waitForElement(`.io-ox-sidepopup .participant a.accepted[title="${users[0].userdata.primaryEmail}"]`);
        I.waitForElement(`.io-ox-sidepopup .participant a.${current.className}[title="${users[1].userdata.primaryEmail}"]`);
        // 9.) User#A: Decline the appointment
        I.click('Decline');
        I.waitForElement(`.io-ox-sidepopup .participant a.declined[title="${users[0].userdata.primaryEmail}"]`);
        I.waitForElement(`.io-ox-sidepopup .participant a.${current.className}[title="${users[1].userdata.primaryEmail}"]`);
    });
    await session('Bob', () => {
        // NO iTIP mail is sent to User#B.
        I.openApp('Mail');
        I.refreshPage();
        I.dontSee(`${users[0].userdata.display_name} declined the invitation: MySubject`);
    });
    // 10.) User#A: Delete the appointment
    await session('Alice', () => {
        I.click('Delete');
        I.waitForText('Add a message to the notification email for the other participants');
        I.fillField('comment', 'MyComment');
        I.click('Delete appointment');
        I.waitForDetached('.modal-dialog');
        I.waitForDetached('.appointment [aria-label^="MySubject"]');
    });
    // 11.) User#B: Read the iTIP mail
    await session('Bob', () => {
        I.refreshPage(); // maybe create reload function in page object
        I.waitForText('Appointment canceled: MySubject');
        mail.selectMail('Appointment canceled: MySubject');
        I.waitForElement('.mail-detail-frame');
        I.waitForText(`MySubject, ${startDate.format('ddd, M/D/YYYY h:MM – ') + endDate.format('h:MM A')}`);
        I.waitForText(current.itipStatus);
        I.waitForText('MyComment');
        // 12.) User#B: Delete
        I.click('Delete');
        I.waitForInvisible(
            locate('.list-view li.list-item')
                .withText('Appointment canceled: MySubject')
        );
        // 13.) User#B: Go to calendar and verify the appointment has been deleted
        I.openApp('Calendar');
        I.dontSee('MySubject');
    });
});

Scenario('[C241128] Attachments in iTIP mails', async function (I, users, mail, calendar, contexts) {
    const ctx = await contexts.create();
    await users.create(users.getRandom(), ctx);
    // 1.) User#A: Create an appointment with attachment with User#B
    const startDate = moment().startOf('hour').add(1, 'hour');
    const endDate = moment().startOf('hour').add(3, 'hour');
    I.login('app=io.ox/calendar', { user: users[0] });
    calendar.waitForApp();
    calendar.newAppointment();
    I.fillField('Subject', 'MySubject');
    await calendar.setDate('startDate', startDate);
    await calendar.setDate('endDate', endDate);
    I.fillField(calendar.locators.starttime, startDate.format('h:MM A'));
    I.clearField(calendar.locators.endtime);
    I.fillField(calendar.locators.endtime, endDate.format('h:MM A'));
    await calendar.addParticipant(users[1].userdata.primaryEmail, false);
    I.pressKey('Pagedown');
    I.see('Attachments', '.io-ox-calendar-edit-window');
    I.attachFile('.io-ox-calendar-edit-window input[type="file"]', 'e2e/media/files/generic/testdocument.odt');
    I.click('Create', '.io-ox-calendar-edit-window');
    I.waitForDetached('.io-ox-calendar-edit-window', 5);
    I.logout();
    // 3.) User#B: Accept the appointment
    I.login('app=io.ox/mail', { user: users[1] });
    mail.waitForApp();
    I.waitForText('New appointment: MySubject', 30);
    mail.selectMail('New appointment: MySubject');
    I.waitForElement('.mail-detail-frame');
    I.waitForText('Accept');
    I.waitForText('Tentative');
    I.waitForText('Decline');
    I.waitForText(`MySubject, ${startDate.format('ddd, M/D/YYYY h:MM – ') + endDate.format('h:MM A')}`);
    I.click('Accept');
    I.waitForText('You have accepted the appointment');
    // 4.) User#B: Download and verify the appointment
    I.openApp('Calendar');
    calendar.waitForApp();
    calendar.switchView('Week');
    I.waitForInvisible('.page.current .workweek');
    I.waitForVisible('.page.current .week');
    I.waitForVisible('.page.current .week .appointment .title');
    I.click('.page.current .week .appointment .title');
    I.waitForText('testdocument.odt', '.io-ox-sidepopup .attachment-list');
    I.wait(1);
    I.click('testdocument.odt', '.io-ox-sidepopup .attachment-list');
    I.waitForText('Download');
    I.handleDownloads();
    I.click('Download');
    I.amInPath('/build/e2e/downloads/');
    I.waitForFile('testdocument.odt', 10);
    I.seeFile('testdocument.odt');
    I.seeFileContentsEqualReferenceFile('e2e/media/files/generic/testdocument.odt');
    I.logout();
    // 5.) User#A: Read the iTIP mail
    I.login('app=io.ox/mail', { user: users[0] });
    mail.waitForApp();
    I.waitForText(`${users[1].userdata.display_name} accepted the invitation: MySubject`, 30);
    // 6.) User#A: Accept changes
    mail.selectMail(`${users[1].userdata.display_name} accepted the invitation: MySubject`);
    I.waitForElement('.mail-detail-frame');
    I.waitForText('Accept changes');
    I.click('Accept changes');
    I.waitForInvisible('.mail-detail-frame');
    // 7.) User#A: Download and verify the appointment
    I.openApp('Calendar');
    calendar.waitForApp();
    calendar.switchView('Week');
    I.waitForInvisible('.page.current .workweek');
    I.waitForVisible('.page.current .week');
    I.waitForVisible('.page.current .week .appointment .title');
    I.click('.page.current .week .appointment .title');
    I.waitForText('testdocument.odt', '.io-ox-sidepopup .attachment-list');
    I.wait(1);
    I.click('testdocument.odt', '.io-ox-sidepopup .attachment-list');
    I.waitForText('Download');
    I.handleDownloads();
    I.click('Download');
    I.amInPath('/build/e2e/downloads/');
    I.waitForFile('testdocument.odt', 10);
    I.seeFile('testdocument.odt');
    I.seeFileContentsEqualReferenceFile('e2e/media/files/generic/testdocument.odt');

});

Scenario('[C241126] iTIP mails without appointment reference', async function (I, users, mail, calendar) {
    // 1.) Import the attached mail 'mail3.eml'
    await I.haveMail({ folder: 'default0/INBOX', path: 'e2e/media/mails/c241126_3.eml' });
    // 2.) Read the mail3
    I.login('app=io.ox/mail');
    I.waitForText('Appointment canceled: #1');
    mail.selectMail('Appointment canceled: #1');
    I.waitForText('This email contains an appointment');
    I.waitForText('The organizer would like to cancel an appointment that could not be found.');
    // 3.) Import the attached mail 'mail2.eml'
    await I.haveMail({ folder: 'default0/INBOX', path: 'e2e/media/mails/c241126_2.eml' });
    // 4.) Read the mail2
    I.waitForText('tthamm accepted the invitation: #1');
    mail.selectMail('tthamm accepted the invitation: #1');
    I.waitForText('This email contains an appointment');
    I.waitForText('An attendee wanted to change his/her participant state in an appointment that could not be found.');
    I.waitForText('Probably the appointment was already canceled.');
    // 5.) Import the attached mail 'mail1.eml'
    await I.haveMail({ folder: 'default0/INBOX', path: 'e2e/media/mails/c241126_1.eml' });
    // 6.) Read the mail1
    I.waitForText('New appointment: #1');
    mail.selectMail('New appointment: #1');
    I.waitForText('Accept');
    I.waitForText('Tentative');
    I.waitForText('Decline');
    // 7.) 'Accept' the appointment
    I.click('Accept');
    I.waitForText('You have accepted the appointment');
    I.openApp('Calendar');
    I.executeScript(function () {
        // go to 2018-03-22
        ox.ui.App.getCurrentApp().setDate(1521720000000);
    });
    I.click('3/22/2018, Thursday, CW 12', calendar.locators.mini);
    I.waitForText('#1');
    I.openApp('Mail');
    // 8.) Read the mail2
    mail.selectMail('tthamm accepted the invitation: #1');
    I.waitForText("You have received an E-Mail containing a reply to an appointment that you didn't organize. Best ignore it.");
    // 9.) Read the mail3
    mail.selectMail('Appointment canceled: #1');
    I.waitForText('Delete');
    // 10.) 'Delete'
    I.click('Delete');
    I.retry(5).dontSee('Appointment canceled: #1');
});

Scenario('[Bug 63767] Error when creating appointment from email', async function (I, users, mail) {

    const userMail = users[0].userdata.email1;

    await I.haveMail({
        attachments: [{
            content: 'Blubber',
            content_type: 'text/plain',
            disp: 'inline'
        }],
        from: [['Julius Caesar', userMail]],
        subject: 'Blub',
        to: [['Julius Caesar', userMail]]
    });

    I.login('app=io.ox/mail');
    mail.waitForApp();

    // select mail and invite to appointment
    mail.selectMail('Blub');
    I.waitForVisible({ css: '.detail-view-header [aria-label="More actions"]' });
    I.click('~More actions', '.detail-view-header');
    I.waitForText('Invite to appointment', '.dropdown.open .dropdown-menu');
    I.click('Invite to appointment', '.dropdown.open .dropdown-menu');

    // same as in calendar helper
    I.waitForVisible(locate({ css: '.io-ox-calendar-edit-window' }).as('Edit Dialog'));
    I.waitForFocus('.io-ox-calendar-edit-window input[type="text"][name="summary"]');
    I.fillField('Subject', 'Going to the pub');
    I.pressKey('Pagedown');
    I.attachFile('.io-ox-calendar-edit-window input[type="file"]', 'e2e/media/files/generic/contact_picture.png');
    I.click('Create', '.io-ox-calendar-edit-window');
    // there should be no backend error
    I.waitForDetached('.io-ox-calendar-edit-window', 5);
});
