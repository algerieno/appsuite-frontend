/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 * © 2019 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Daniel Pondruff <daniel.pondruff@open-xchange.com>
 */

/// <reference path="../../../steps.d.ts" />

Feature('Tasks > Edit');

Before(async (users) => {
    await users.create();
    await users.create();
    await users.create();
});
After(async (users) => {
    await users.removeAll();
});

Scenario('[C7738] Edit task with all fields filled', async function (I, users) {
    let testrailID = 'C7738';
    let testrailName = 'Edit task with all fields filled';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        status: '1',
        percent_completed: '0',
        folder_id: taskDefaultFolder,
        recurrence_type: '0',
        full_time: true,
        private_flag: false,
        timezone: 'Europe/Berlin',
        notification: true,
        target_duration: '1337',
        actual_duration: '1337',
        target_costs: '1337',
        actual_costs: '1337',
        trip_meter: '1337mm',
        billing_information: 'Don not know any Bill',
        companies: 'Open-Xchange GmbH',
        note: testrailName,
        currency: 'EUR'
    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');

    I.waitForElement('.tasks-detailview', 5);
    I.see('Estimated duration in minutes');
    I.see('1337');
    I.see('Actual duration in minutes');
    I.see('1337');
    I.see('Estimated costs');
    I.see('1337 EUR');
    I.see('Actual costs');
    I.see('1337 EUR');
    I.see('Distance');
    I.see('1337mm');
    I.see('Billing information');
    I.see('Don not know any Bill');
    I.see('Companies');
    I.see('Open-Xchange GmbH');

    I.clickToolbar('Edit');
    I.waitForElement('.io-ox-tasks-edit', 5);
    I.fillField({ css: '[name="target_duration"]' }, '1338');
    I.fillField({ css: '[name="actual_duration"]' }, '1338');
    I.fillField({ css: '[name="target_costs"]' }, '1338');
    I.fillField({ css: '[name="actual_costs"]' }, '1338');
    I.selectOption({ css: '[name="currency"]' }, 'RUB');
    I.fillField({ css: '[name="trip_meter"]' }, '1338mm');
    I.fillField({ css: '[name="billing_information"]' }, 'Yes, i know any Bill');
    I.fillField({ css: '[name="companies"]' }, 'Open-Xchange Inc.');
    I.click('Save');

    I.waitForDetached('.io-ox-tasks-edit', 5);
    I.dontSee('1337');
    I.dontSee('1337');
    I.dontSee('1337 EUR');
    I.dontSee('1337 EUR');
    I.dontSee('1337mm');
    I.dontSee('Don not know any Bill');
    I.dontSee('Open-Xchange GmbH');
    I.see('1338');
    I.see('1338');
    I.see('1338 RUB');
    I.see('1338 RUB');
    I.see('1338mm');
    I.see('Yes, i know any Bill');
    I.see('Open-Xchange Inc.');

    I.logout();
});

Scenario('[C7739] Change tasks due date in dropdown', async function (I, users) {
    const moment = require('moment');

    let testrailID = 'C7739';
    let testrailName = 'Change tasks due date in dropdown';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    const days = ['tomorrow', 2, 3, 4, 5, 6, 'in one week'];
    days.forEach(function (day, i) {
        I.clickToolbar('Due');
        if (i === 0) I.clickToolbar(day);
        else if (i === 6) I.clickToolbar(day);
        else I.clickToolbar(moment().add(i + 1, 'days').format('dddd'));
        I.waitForText('Due ' + moment().add(i + 1, 'days').format('M/D/YYYY'), 5, '.tasks-detailview .end-date');
        I.waitForText(moment().add(i + 1, 'days').format('M/D/YYYY'), 5, '.vgrid .end_date');
    });
    I.logout();
});

Scenario('[C7740] Edit Task', async function (I, users) {
    let testrailID = 'C7740';
    let testrailName = 'Edit Task';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.clickToolbar('Edit');
    I.waitForElement('.io-ox-tasks-edit', 5);

    I.fillField('Subject', testrailID + ' - 2');
    I.waitForText(testrailID + ' - 2', 5, '.floating-window-content .title');
    I.click('Save');
    I.waitForDetached('.io-ox-tasks-edit', 5);
    I.waitForText(testrailID + ' - 2', 5, '.tasks-detailview .title');
    I.waitForText(testrailID + ' - 2', 5, '[role="navigation"] .title');
    I.logout();
});
Scenario.skip('[C7739] Change tasks due date in dropdown', async function (I, users) {
    const moment = require('moment');

    let testrailID = 'C7739';
    let testrailName = 'Change tasks due date in dropdown';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    const days = ['tomorrow', 2, 3, 4, 5, 6, 'in one week'];
    days.forEach(function (day, i) {
        I.clickToolbar('Due');
        if (i === 0) I.clickToolbar(day);
        else if (i === 6) I.clickToolbar(day);
        else I.clickToolbar(moment().add(i + 1, 'days').format('dddd'));
        I.waitForText('Due ' + moment().add(i + 1, 'days').format('M/D/YYYY'), 5, '.tasks-detailview .end-date');
        I.waitForText(moment().add(i + 1, 'days').format('M/D/YYYY'), 5, '.vgrid .end_date');
    });
    I.logout();
});
Scenario('[C7741] Mark Task as Done', async function (I, users) {
    let testrailID = 'C7741';
    let testrailName = 'Mark Task as Done';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.clickToolbar('Done');
    I.waitForText('Done', 5, '[aria-label="Task list"] .status.badge-done');
    I.waitForText('Progress 100 %', 5, '.tasks-detailview .task-progress');
    I.waitForText('Done', 5, '.tasks-detailview .badge-done.state');
    I.waitForText('Date completed', 5);
    I.logout();
});
Scenario('[C7742] Mark Task as Undone', async function (I, users) {
    let testrailID = 'C7742';
    let testrailName = 'Mark Task as Undone';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName,
        percent_completed: 100,
        status: 3

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.clickToolbar('Undone');
    I.waitForText('Not started', 5, '[aria-label="Task list"] .status.badge-notstarted');
    I.dontSee('Progress 100 %');
    I.waitForText('Not started', 5, '.tasks-detailview .badge-notstarted');
    I.logout();
});
Scenario('[C7743] Move single Task', async function (I, users) {
    let testrailID = 'C7743';
    let testrailName = 'Move single Task';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    const folder = {
        module: 'tasks',
        title: testrailID
    };
    I.createFolder(folder, taskDefaultFolder, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    //Dirty SHIT ! Need a helper for this
    I.waitForElement('[aria-label="Tasks Toolbar"] .more-dropdown [data-action="more"]');
    I.click('[aria-label="Tasks Toolbar"] .more-dropdown [data-action="more"]');
    I.waitForElement('.smart-dropdown-container.open .dropdown-menu', 5);
    I.clickToolbar('Move');
    I.waitForText('Move', 5, '.modal-open .modal-title');
    I.retry(3).click('.modal [data-id="virtual/flat/tasks/private"] div.folder-arrow');
    I.waitForElement('.modal-dialog .open.folder.section', 5);
    I.retry(3).click('.modal [aria-label="' + testrailID + '"]');
    I.waitForElement('.modal .selected[aria-label="' + testrailID + '"]', 5);
    I.waitForEnabled('.modal-footer button.btn-primary');
    I.click('Move', 'div.modal-footer');
    I.waitForDetached('.modal');
    I.selectFolder(testrailID);
    I.waitForElement('[aria-label="C7743, ."]');
    I.click('[aria-label="C7743, ."]');
    //Dirty SHIT ! Need a helper for this
    I.waitForElement('.tasks-detailview', 5);
    I.waitForText(testrailID, 5, '.tasks-detailview .title');
    I.waitForText(testrailID, 5, '[role="navigation"] .title');


    I.logout();
});
Scenario('[C7744] Mark several task as done at the same time', async function (I, users) {
    let testrailID = 'C7744';
    let testrailName = 'Mark several task as done at the same time';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    let numberOfTasks = 3;
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        var task = {
            title: id,
            folder_id: taskDefaultFolder,
            note: testrailName
        };
        I.haveTask(task, { user: users[0] });
    }
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.click('[aria-label="Tasks toolbar"] .btn[title="Select all"]');
    I.seeNumberOfElements('li.selected.vgrid-cell', numberOfTasks);
    I.waitForText(numberOfTasks + ' items selected', 5, '.task-detail-container .message');
    I.clickToolbar('Done');
    I.retry(5).seeNumberOfElements('[aria-label="Task list"][role="navigation"] .badge-done.status', numberOfTasks);
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        I.click('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', Done."]');
        I.waitForElement('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', Done."].selected', 5);
        I.waitForElement('.tasks-detailview', 5);
        I.waitForText(id, 5, '.tasks-detailview .title');
        I.waitForText('Progress 100 %', 5, '.tasks-detailview .task-progress');
        I.waitForText('Done', 5, '.tasks-detailview .badge-done.state');
        I.waitForText('Date completed', 5);
    }
    I.logout();
});
Scenario('[C7745] Mark several Task as Undone at the same time', async function (I, users) {
    let testrailID = 'C7745';
    let testrailName = 'Mark several Task as Undone at the same time';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    let numberOfTasks = 3;
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        var task = {
            title: id,
            folder_id: taskDefaultFolder,
            note: testrailName,
            percent_completed: 100,
            status: 3
        };
        I.haveTask(task, { user: users[0] });
    }
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.click('[aria-label="Tasks toolbar"] .btn[title="Select all"]');
    I.seeNumberOfElements('li.selected.vgrid-cell', numberOfTasks);
    I.waitForText(numberOfTasks + ' items selected', 5, '.task-detail-container .message');
    I.clickToolbar('Undone');
    I.retry(5).seeNumberOfElements('[aria-label="Task list"][role="navigation"] .badge-notstarted.status', numberOfTasks);
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        I.click('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', Not started."]');
        I.waitForElement('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', Not started."].selected', 5);
        I.waitForElement('.tasks-detailview', 5);
        I.waitForText('Not started', 5, '.tasks-detailview .badge-notstarted');
        I.waitForText(id, 5, '.tasks-detailview .title');
    }
    I.logout();
});
Scenario('[C7746] Move several tasks to an other folder at the same time', async function (I, users) {
    let testrailID = 'C7746';
    let testrailName = 'Move several tasks to an other folder at the same time';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    let numberOfTasks = 3;
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        var task = {
            title: id,
            folder_id: taskDefaultFolder,
            note: testrailName
        };
        I.haveTask(task, { user: users[0] });
    }
    const folder = {
        module: 'tasks',
        title: testrailID
    };
    I.createFolder(folder, taskDefaultFolder, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.click('[aria-label="Tasks toolbar"] .btn[title="Select all"]');
    I.seeNumberOfElements('li.selected.vgrid-cell', numberOfTasks);
    I.waitForText(numberOfTasks + ' items selected', 5, '.task-detail-container .message');
    //Dirty SHIT ! Need a helper for this
    I.waitForElement('[aria-label="Tasks Toolbar"] .more-dropdown [data-action="more"]');
    I.click('[aria-label="Tasks Toolbar"] .more-dropdown [data-action="more"]');
    I.waitForElement('.smart-dropdown-container.open .dropdown-menu', 5);
    I.clickToolbar('Move');
    I.waitForText('Move', 5, '.modal-open .modal-title');
    I.retry(3).click('.modal [data-id="virtual/flat/tasks/private"] div.folder-arrow');
    I.waitForElement('.modal-dialog .open.folder.section', 5);
    I.retry(3).click('.modal [aria-label="' + testrailID + '"]');
    I.waitForElement('.modal .selected[aria-label="' + testrailID + '"]', 5);
    I.waitForEnabled('.modal-footer button.btn-primary');
    I.click('Move', 'div.modal-footer');
    I.waitForDetached('.modal');
    I.selectFolder(testrailID);
    //Dirty SHIT ! Need a helper for this
    for (let i = 0; i < numberOfTasks; i++) {
        let id = testrailID + ' - ' + i;
        I.waitForElement('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', ."]', 5);
        I.click('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', ."]');
        I.waitForElement('[role="navigation"][aria-label="Task list"] [aria-label="' + testrailID + ' - ' + i + ', ."].selected', 5);
        I.waitForElement('.tasks-detailview', 5);
        I.waitForText(id, 5, '.tasks-detailview .title');
    }
    I.logout();
});
Scenario('[C7747] Add an attachment to a Task', async function (I, users) {
    let testrailID = 'C7747';
    let testrailName = 'Add an attachment to a Task';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.clickToolbar('Edit');
    I.waitForElement('.io-ox-tasks-edit', 5);
    I.click('Expand form');

    I.attachFile('[data-app-name="io.ox/tasks/edit"] input[type="file"]', 'e2e/media/files/generic/testdocument.odt');
    I.waitForElement('.file.io-ox-core-tk-attachment', 5);
    I.seeNumberOfElements('.file.io-ox-core-tk-attachment', 1);
    I.click('Save');
    I.waitForText(testrailID, 10, '.tasks-detailview .title');
    I.waitForText('Attachments', 10, '.tasks-detailview .attachments');
    I.waitForText('testdocument.odt', 10, '.tasks-detailview [data-dropdown="io.ox/core/tk/attachment/links"]');
    I.logout();
});
Scenario('[C7748] Remove an attachment from a Task', async function (I, users) {
    let testrailID = 'C7747';
    let testrailName = 'Remove an attachment from a Task';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        folder_id: taskDefaultFolder,
        note: testrailName

    };
    const createTask = await I.haveTask(task, { user: users[0] });
    let taskID = createTask.id;
    await I.haveAttachment('tasks', { id: taskID, folder: taskDefaultFolder }, 'e2e/media/files/generic/testdocument.odt');
    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForElement('.tasks-detailview', 5);
    I.waitForText(testrailID, 10, '.tasks-detailview .title');
    I.waitForText('Attachments', 10, '.tasks-detailview .attachments');
    I.waitForText('testdocument.odt', 10, '.tasks-detailview [data-dropdown="io.ox/core/tk/attachment/links"]');
    I.clickToolbar('Edit');
    I.waitForElement('[data-app-name="io.ox/tasks/edit"]', 5);
    I.waitForElement('.floating-window-content .container.io-ox-tasks-edit', 5);
    I.waitForElement('.file.io-ox-core-tk-attachment', 5);
    I.seeNumberOfElements('.file.io-ox-core-tk-attachment', 1);
    I.click('.io-ox-core-tk-attachment-list .remove');
    I.waitForDetached('.file.io-ox-core-tk-attachment', 5);
    I.seeNumberOfElements('.file.io-ox-core-tk-attachment', 0);
    I.click('Save');
    I.waitForDetached('.io-ox-tasks-edit', 5);
    I.waitForElement('.tasks-detailview', 5);
    I.waitForText(testrailID, 10, '.tasks-detailview .title');
    I.waitForDetached('.tasks-detailview .attachments-container');
    I.logout();
});
Scenario('[C7749] Edit existing Task as participant', async function (I, users) {
    let testrailID = 'C7749';
    let testrailName = 'Edit existing Task as participant';
    const taskDefaultFolder = await I.grabDefaultFolder('tasks', { user: users[0] });
    const task = {
        title: testrailID,
        status: '1',
        percent_completed: '0',
        folder_id: taskDefaultFolder,
        recurrence_type: '0',
        full_time: true,
        private_flag: false,
        timezone: 'Europe/Berlin',
        notification: true,
        note: testrailName,
        participants: [{
            id: users[1].userdata.id,
            type: 1
        }]
    };
    I.haveTask(task, { user: users[0] });
    I.login('app=io.ox/tasks', { user: users[1] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForText(testrailID, 5, '.window-body');
    I.waitForText(testrailID, 5, '.tasks-detailview .title');
    I.clickToolbar('Edit');
    I.waitForElement('[data-app-name="io.ox/tasks/edit"]', 5);
    I.waitForElement('.floating-window-content .container.io-ox-tasks-edit', 5);
    I.fillField('Subject', testrailID + ' - 2');
    I.fillField('Description', testrailName + ' - 2');
    I.click('Save');
    I.waitForText(testrailID + ' - 2', 5, '.window-body');
    I.waitForText(testrailID + ' - 2', 5, '.tasks-detailview .title');
    I.logout();

    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.waitForText(testrailID + ' - 2', 5, '.window-body');
    I.waitForText(testrailID + ' - 2', 5, '.tasks-detailview .title');
    I.logout();
});
Scenario('[C7750] Edit existing Task in a shared folder', async function (I, users) {
    let testrailID = 'C7750';
    let testrailName = 'Edit existing Task in a shared folder';
    //const taskDefaultFolder = await I.getDefaultFolder('tasks', { user: users[0] });
    const folder = {
        module: 'tasks',
        subscribed: 1,
        title: testrailID,
        permissions: [
            {
                bits: 403710016,
                entity: users[0].userdata.id,
                group: false
            }, {
                bits: 403710016,
                entity: users[1].userdata.id,
                group: false
            }
        ]
    };
    const createFolder = await I.createFolder(folder, '2', { user: users[0] });
    let folderID = createFolder.data.data;

    const task = {
        title: testrailID,
        status: '1',
        percent_completed: '0',
        folder_id: folderID,
        recurrence_type: '0',
        full_time: true,
        private_flag: false,
        timezone: 'Europe/Berlin',
        notification: true,
        note: testrailName
    };
    I.haveTask(task, { user: users[0] });

    I.login('app=io.ox/tasks', { user: users[1] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.selectFolder(testrailID);
    I.waitForText(testrailID, 5, '.window-body');
    I.waitForText(testrailID, 5, '.tasks-detailview .title');
    I.clickToolbar('Edit');
    I.waitForElement('[data-app-name="io.ox/tasks/edit"]', 5);
    I.waitForElement('.floating-window-content .container.io-ox-tasks-edit', 5);
    I.fillField('Subject', testrailID + ' - 2');
    I.fillField('Description', testrailName + ' - 2');
    I.click('Save');
    I.waitForText(testrailID + ' - 2', 5, '.window-body');
    I.waitForText(testrailID + ' - 2', 5, '.tasks-detailview .title');
    I.logout();

    I.login('app=io.ox/tasks', { user: users[0] });
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.selectFolder(testrailID);
    I.waitForText(testrailID + ' - 2', 5, '.window-body');
    I.waitForText(testrailID + ' - 2', 5, '.tasks-detailview .title');
    I.logout();
});
Scenario('[C7751] Close Task with the X', async function (I) {
    I.login('app=io.ox/tasks');
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.clickToolbar('New');
    I.waitForVisible('.io-ox-tasks-edit-window');
    I.waitForElement('.floating-window-content .btn-primary[disabled=""][data-action="save"]', 5);
    I.waitForElement('.io-ox-tasks-edit-window[data-app-name="io.ox/tasks/edit"]', 5);
    I.click('.floating-window-content button[data-action="close"]');
    I.waitForDetached('.floating-window-content .btn-primary[disabled=""][data-action="save"]', 5);
    I.waitForDetached('.io-ox-tasks-edit-window[data-app-name="io.ox/tasks/edit"]', 5);
    I.logout();
});
Scenario('[C7752] Close Task with the X after adding some information', async function (I) {
    let testrailID = 'C7752';
    let testrailName = 'Close Task with the X after adding some information';
    I.login('app=io.ox/tasks');
    I.waitForVisible('*[data-app-name="io.ox/tasks"]');
    I.clickToolbar('New');
    I.waitForVisible('.io-ox-tasks-edit-window');
    I.fillField('Subject', testrailID);
    I.fillField('Description', testrailName);
    I.click('.floating-window-content button[data-action="close"]');
    I.waitForElement('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.waitForText('Do you really want to discard your changes?', 5, '.io-ox-dialog-wrapper');
    I.click('Cancel');
    I.waitForDetached('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.click('.floating-window-content button[data-action="close"]');
    I.waitForElement('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.waitForText('Do you really want to discard your changes?', 5, '.io-ox-dialog-wrapper');
    I.click('Cancel');
    I.waitForDetached('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.click('.floating-window-content button[data-action="close"]');
    I.waitForElement('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.waitForText('Do you really want to discard your changes?', 5, '.io-ox-dialog-wrapper');
    I.click('Discard changes');
    I.waitForDetached('.io-ox-dialog-wrapper [role="alertdialog"]', 5);
    I.waitForDetached('.floating-window-content .btn-primary[disabled=""][data-action="save"]', 5);
    I.waitForDetached('.io-ox-tasks-edit-window[data-app-name="io.ox/tasks/edit"]', 5);
    I.logout();
});