/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2020 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Tran Dong Tran <tran-dong.tran@open-xchange.com>
 */

const moment = require('moment');

Feature('Calendar > List View');


Before(async function (users) {
    await users.create();
});

After(async function (users) {
    await users.removeAll();
});


// Tests proper labeling and focus after changing the startDate of appointments in the listview
Scenario('Reorder appointments with labels in list view', async function (I, calendar) {

    /**
    * The following cases are tested within this test:
    *   Change date of appointment without merging or splitting groups and maintining order
    *   - 1a: First appointment
    *   - 1b: In-between appointment
    *   - 1c: Last appointment
    *   Change date of appointment results in merge/split and is still in order
    *   - 2a: Merge last appointment of group with group below
    *   - 2b: Merge last appointment of group with group above
    *   - 2c: Split last appointment of group to new group
    *   - 2d: Split last appointment of group to existing group
    *   Changed appointment is out of range
    *   - 3a: Appointment is in the future and out of range
    *   - 3b: Appointment is in the past and out of range
    *   Change date of appointment results in changed order of appointments
    *   - 4a: Bottom to top
    *   - 4b: Top to bottom
    *   - 4c: Joins group as last appointment
    *   - 4d: Joins group as in-between appointment
    *   - 4e: Joins group as first appointment
    **/

    const appointmentDefaultFolder = await I.grabDefaultFolder('calendar');
    const refDate = moment().startOf('day').add(10, 'hour');
    const listItemSelector = (type, index) => {
        return locate(`.list-view .list-item:nth-child(${index + 1}).${type}`).as(index + '. list item (' + type + ')');
    };
    const folder = locate(`.folder [data-id="cal://0/${appointmentDefaultFolder}"]`);

    I.say('I have 4 appointments');
    await I.haveAppointment({
        folder: 'cal://0/' + appointmentDefaultFolder,
        startDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().format('YYYYMMDD[T]HHmmss')
        },
        endDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(2, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        summary: 'Appointment 1'
    });

    await I.haveAppointment({
        folder: 'cal://0/' + appointmentDefaultFolder,
        startDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(2, 'day').add(2, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        endDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(2, 'day').add(4, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        summary: 'Appointment 2'
    });

    await I.haveAppointment({
        folder: 'cal://0/' + appointmentDefaultFolder,
        startDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(4, 'day').add(6, 'hour').format('YYYYMMDD[T]HHmmss') },
        endDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(4, 'day').add(8, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        summary: 'Appointment 3'
    });

    await I.haveAppointment({
        folder: 'cal://0/' + appointmentDefaultFolder,
        startDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(6, 'day').add(8, 'hour').format('YYYYMMDD[T]HHmmss') },
        endDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(6, 'day').add(10, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        summary: 'Appointment 4'
    });
    await I.haveAppointment({
        folder: 'cal://0/' + appointmentDefaultFolder,
        startDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(8, 'day').add(10, 'hour').format('YYYYMMDD[T]HHmmss') },
        endDate: {
            tzid: 'Europe/Berlin',
            value: refDate.clone().add(8, 'day').add(12, 'hour').format('YYYYMMDD[T]HHmmss')
        },
        summary: 'Appointment 5'
    });

    // login
    I.login('app=io.ox/calendar&perspective=list');
    calendar.waitForApp();

    // check initial appointments
    I.say('I see subjects in correct order');
    I.waitNumberOfVisibleElements('.list-view .appointment', 5);
    I.see('Appointment 1', listItemSelector('appointment', 2));
    I.see('Appointment 2', listItemSelector('appointment', 4));
    I.see('Appointment 3', listItemSelector('appointment', 6));
    I.see('Appointment 4', listItemSelector('appointment', 8));
    I.see('Appointment 5', listItemSelector('appointment', 10));

    I.say('I see labels in correct order');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 5);
    I.see(refDate.clone().format('l'), listItemSelector('list-item-label', 1));
    I.see(refDate.clone().add(2, 'day').format('l'), listItemSelector('list-item-label', 3));
    I.see(refDate.clone().add(4, 'day').format('l'), listItemSelector('list-item-label', 5));
    I.see(refDate.clone().add(6, 'day').format('l'), listItemSelector('list-item-label', 7));
    I.see(refDate.clone().add(8, 'day').format('l'), listItemSelector('list-item-label', 9));

    function changeStartDate(index, date) {
        I.say('Change start date of ' + index + '. list-item in list to ' + date);
        const appointmentSelector = listItemSelector('appointment', index);

        // Open edit window
        I.waitForVisible(appointmentSelector);
        I.click(appointmentSelector);
        I.clickToolbar('Edit');
        I.waitForVisible(calendar.locators.edit);
        I.waitForFocus('.io-ox-calendar-edit-window input[type="text"][name="summary"]');

        I.fillField(calendar.locators.startdate, date);

        I.click('Save', '.io-ox-calendar-edit-window');
        I.waitForDetached('.io-ox-calendar-edit-window');
    }

    // Cases 1x: Change date of appointment without merging or splitting groups and maintining order
    I.say('Check Cases: Changing appointments without changing the order without merging/splitting');

    // Case 1a: First appointment
    I.say('Check Case 1a: Change first appointment of list without merge');
    changeStartDate(2, refDate.clone().add(1, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 5);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(1, 'day').format('l'), 5, listItemSelector('list-item-label', 1));
    I.see('Appointment 1', listItemSelector('appointment', 2));
    I.waitForText(refDate.clone().add(1, 'day').format('l'), '.rightside');
    I.dontSee(refDate.clone().format('l'), '.list-view');

    // Case 1b: In-between appointment
    I.say('Check Case 1b: Change in-between appointment of list without merge');
    changeStartDate(4, refDate.clone().add(3, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 5);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, listItemSelector('list-item-label', 3));
    I.see('Appointment 2', listItemSelector('appointment', 4));
    I.waitForText(refDate.clone().add(3, 'day').format('l'), '.rightside');
    I.dontSee(refDate.clone().add(2, 'day').format('l'), '.list-view');

    // Case 1c: Last appointment
    I.say('Check Case 1c: Change last appointment of list without merge');
    changeStartDate(10, refDate.clone().add(9, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 5);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(9, 'day').format('l'), 5, listItemSelector('list-item-label', 9));
    I.see('Appointment 5', listItemSelector('appointment', 10));
    I.waitForText(refDate.clone().add(9, 'day').format('l'), '.rightside');
    I.dontSee(refDate.clone().add(8, 'day').format('l'), '.list-view');

    // Cases 2x: Change date of appointment results in merge/split and is still in order
    I.say('Check Cases: Changing appointments without changing the order with merging/splitting');

    // Case 2a: Merge last appointment of group with group below
    I.say('Check Case 2a: Merge last appointment of group with appointment below');
    changeStartDate(4, refDate.clone().add(4, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 4);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(4, 'day').format('l'), 5, listItemSelector('list-item-label', 3));
    I.see('Appointment 2', listItemSelector('appointment', 4));
    I.see('Appointment 3', listItemSelector('appointment', 5));
    I.waitForText(refDate.clone().add(4, 'day').format('l'), '.rightside');
    I.dontSee(refDate.clone().add(3, 'day').format('l'), '.list-view');

    // Case 2b: Merge last appointment of group with group above
    I.say('Check Case 2b: Merge last appointment of group with appointment above');
    changeStartDate(7, refDate.clone().add(4, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 3);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(4, 'day').format('l'), 5, listItemSelector('list-item-label', 3));
    I.see('Appointment 2', listItemSelector('appointment', 4));
    I.see('Appointment 3', listItemSelector('appointment', 5));
    I.see('Appointment 4', listItemSelector('appointment', 6));
    I.waitForText(refDate.clone().add(4, 'day').format('l'), '.rightside');
    I.dontSee(refDate.clone().add(6, 'day').format('l'), '.list-view');

    // Case 2c: Split last appointment of group to new group
    I.say('Check case 2c: Split last appointment of group to new group');
    changeStartDate(6, refDate.clone().add(5, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 4);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(5, 'day').format('l'), 5, listItemSelector('list-item-label', 6));
    I.see('Appointment 4', listItemSelector('appointment', 7));
    I.waitForText(refDate.clone().add(5, 'day').format('l'), '.rightside');

    // Case 2d: Split last appointment of group to existing group
    I.say('Check case 2d: Split last appointment of group to existing group');
    changeStartDate(5, refDate.clone().add(5, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 4);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(5, 'day').format('l'), 5, listItemSelector('list-item-label', 5));
    I.see('Appointment 3', listItemSelector('appointment', 6));
    I.waitForText(refDate.clone().add(5, 'day').format('l'), '.rightside');

    // Case 2e: Split first appointment of group to existing group
    I.say('Check case 2e: Split first appointment of group to existing group');
    changeStartDate(6, refDate.clone().add(4, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 4);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(4, 'day').format('l'), 5, listItemSelector('list-item-label', 3));
    I.see('Appointment 3', listItemSelector('appointment', 5));
    I.waitForText(refDate.clone().add(4, 'day').format('l'), '.rightside');

    // Case 2f: Split first appointment of group to new group
    I.say('Check case 2f: Split first appointment of group to new group');
    changeStartDate(4, refDate.clone().add(3, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 5);
    I.seeNumberOfVisibleElements('.list-view .appointment', 5);
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, listItemSelector('list-item-label', 3));
    I.see('Appointment 2', listItemSelector('appointment', 4));
    I.waitForText(refDate.clone().add(3, 'day').format('l'), '.rightside');

    // Case 3x: Changed appointment is out of range
    I.say('Check Cases: Changing appointments without changing the order but with dates out of range');

    // Case 3a: Appointment is in the future and out of range
    I.say('Check Case 3a: Appointment is out of range (future)');
    changeStartDate(10, refDate.clone().add(2, 'year').format('l'));
    I.waitForFocus(folder);
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 4);
    I.seeNumberOfVisibleElements('.list-view .appointment', 4);
    I.dontSee('Appointment 5', '.list-view');
    I.dontSee(refDate.clone().add(9, 'day').format('l'), '.list-view');
    I.dontSee(refDate.clone().add(2, 'year').format('l'), '.list-view');

    // Case 3b: Appointment is in the past and out of range
    I.say('Check Case 3b: Appointment is out of range (past)');
    changeStartDate(2, refDate.clone().subtract(1, 'day').format('l'));
    I.waitForFocus(folder);
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 3);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.dontSee('Appointment 1', '.list-view');
    I.dontSee(refDate.clone().add(1, 'day').format('l'), '.list-view');
    I.dontSee(refDate.clone().subtract(1, 'day').format('l'), '.list-view');

    // Case 4x: Change date of appointment results in changed order of appointments
    I.say('Check Case 4a: Change of order');
    // Case 4a: Bottom to top
    I.say('Check Case 4a: Changed appointment goes from bottom to top');
    changeStartDate(6, refDate.clone().format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 3);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.waitForText(refDate.clone().format('l'), 5, listItemSelector('list-item-label', 1));
    I.see('Appointment 4', listItemSelector('appointment', 2));
    I.waitForText(refDate.clone().format('l'), 5, '.rightside');
    I.dontSee(refDate.clone().add(5, 'day').format('l'), '.list-view');

    // Case 4b: Top to bottom
    I.say('Check Case 4b: Changed appointment goes from top to bottom');
    changeStartDate(2, refDate.clone().add(5, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 3);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.waitForText(refDate.clone().add(5, 'day').format('l'), 5, listItemSelector('list-item-label', 5));
    I.see('Appointment 4', listItemSelector('appointment', 6));
    I.waitForText(refDate.clone().add(5, 'day').format('l'), 5, '.rightside');
    I.dontSee(refDate.clone().format('l'), '.list-view');

    // Case 4c: Joins group as last appointment
    I.say('Check Case 4c: Joins group as last appointment');
    changeStartDate(6, refDate.clone().add(3, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 2);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, listItemSelector('list-item-label', 1));
    I.see('Appointment 2', listItemSelector('appointment', 2));
    I.see('Appointment 4', listItemSelector('appointment', 3));
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, '.rightside');
    I.dontSee(refDate.clone().add(5, 'day').format('l'), '.list-view');

    // Case 4d: Joins group as in-between appointment
    I.say('Check Case 4d: Joins group as in-between appointment');
    changeStartDate(5, refDate.clone().add(3, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 1);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, listItemSelector('list-item-label', 1));
    I.see('Appointment 2', listItemSelector('appointment', 2));
    I.see('Appointment 3', listItemSelector('appointment', 3));
    I.see('Appointment 4', listItemSelector('appointment', 4));
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, '.rightside');
    I.dontSee(refDate.clone().add(5, 'day').format('l'), '.list-view');

    // Case 4e: Joins group as first appointment
    I.say('Check Case 4d: Joins group as first appointment');
    changeStartDate(2, refDate.clone().add(4, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    changeStartDate(5, refDate.clone().add(3, 'day').format('l'));
    I.waitForFocus('~Edit appointment');
    I.waitNumberOfVisibleElements('.list-view .list-item-label', 1);
    I.seeNumberOfVisibleElements('.list-view .appointment', 3);
    I.see('Appointment 2', listItemSelector('appointment', 2));
    I.see('Appointment 3', listItemSelector('appointment', 3));
    I.see('Appointment 4', listItemSelector('appointment', 4));
    I.waitForText(refDate.clone().add(3, 'day').format('l'), 5, '.rightside');
});
