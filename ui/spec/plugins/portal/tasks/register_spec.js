/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2013 Open-Xchange Inc., Tarrytown, NY, USA. info@open-xchange.com
 *
 * @author Daniel Dickhaus <daniel.dickhaus@open-xchange.com>
 */
define(['plugins/portal/tasks/register',
        'io.ox/core/extensions',
        'io.ox/core/date',
        'fixture!io.ox/tasks/defaultTestData.json'], function (tasksPlugin, ext, date, testData) {
    
    describe('portal Tasks plugin', function () {
        
        describe('should', function () {
            beforeEach(function () {
                this.server.respondWith('PUT', /api\/tasks\?action=search/, function (xhr) {
                    xhr.respond(200, { 'Content-Type': 'text/javascript;charset=UTF-8'},
                            '{ "timestamp":1368791630910,"data": ' + JSON.stringify(testData.testSearch) + '}');
                });
                this.server.respondWith('GET', /api\/tasks\?action=get/, function (xhr) {
                    xhr.respond(200, { 'Content-Type': 'text/javascript;charset=UTF-8'},
                            '{ "timestamp":1368791630910,"data": {"id": 13371, "folder_id": 555123456, "title": "Pommes kaufen"}}');
                });
                this.node = $('<div>');
                this.baton  = ext.Baton(),
                    def = ext.point('io.ox/portal/widget/tasks').invoke('load', this.node, this.baton);
                waitsFor(function () {
                    return def._wrapped[0].state() === 'resolved';
                });
                runs(function () {
                    def = ext.point('io.ox/portal/widget/tasks').invoke('preview', this.node, this.baton);
                });
                waitsFor(function () {//wait till its actually drawn
                    return this.node.children().length === 1;
                });
            });

            afterEach(function () {
                this.node.remove();
            });
            it('draw content', function () {
                expect(this.node.children().length).toEqual(1);
                expect(this.node.children().first().is('ul')).toBeTruthy();
            });
            it('draw all Tasks', function () {
                expect(this.node.find('li.item').length).toEqual(2);
                expect($(this.node.find('.bold')[0]).text()).toEqual('Pommes kaufen');
                expect($(this.node.find('.bold')[1]).text()).toEqual('Nase putzen');
                expect($(this.node.find('.accent')[0]).text()).toEqual('Fällig am ' + new date.Local(1368791630910).format(date.DATE));
                expect($(this.node.find('.accent')[1]).text()).toEqual('Fällig am ' + new date.Local(1368791630910).format(date.DATE));
            });
        });
        describe('should not draw', function () {
            beforeEach(function () {
                this.server.respondWith('PUT', /api\/tasks\?action=search/, function (xhr) {
                    xhr.respond(200, { 'Content-Type': 'text/javascript;charset=UTF-8'},
                            '{ "timestamp":1368791630910,"data": ' + JSON.stringify(testData.testSearchEdge) + '}');
                });
                this.node = $('<div>');
                this.baton  = ext.Baton(),
                    def = ext.point('io.ox/portal/widget/tasks').invoke('load', this.node, this.baton);
                waitsFor(function () {
                    return def._wrapped[0].state() === 'resolved';
                });
                runs(function () {
                    def = ext.point('io.ox/portal/widget/tasks').invoke('preview', this.node, this.baton);
                });
                waitsFor(function () {//wait till its actually drawn
                    return this.node.children().length === 1;
                });
            });

            afterEach(function () {
                this.node.remove();
            });
            it('done tasks', function () {
                expect($(this.node.find('.bold')[1]).text()).not.toEqual('erledigt');
            });
            it('tasks without invitation', function () {
                expect($(this.node.find('.bold')[1]).text()).not.toEqual('Bin nicht eingeladen');
            });
            it('declined tasks', function () {
                expect($(this.node.find('.bold')[1]).text()).not.toEqual('Ich habe abgelehnt');
            });
            it('tasks without end_date', function () {
                expect($(this.node.find('.bold')[1]).text()).not.toEqual('hab kein end_date');
            });
        });
        describe('should', function () {
            beforeEach(function () {
                this.server.respondWith('PUT', /api\/tasks\?action=search/, function (xhr) {
                    xhr.respond(200, { 'Content-Type': 'text/javascript;charset=UTF-8'},
                            '{ "timestamp":1368791630910,"data": []}');
                });
                this.node = $('<div>');
                this.baton  = ext.Baton(),
                    def = ext.point('io.ox/portal/widget/tasks').invoke('load', this.node, this.baton);
                waitsFor(function () {
                    return def._wrapped[0].state() === 'resolved';
                });
                runs(function () {
                    def = ext.point('io.ox/portal/widget/tasks').invoke('preview', this.node, this.baton);
                });
                waitsFor(function () {//wait till its actually drawn
                    return this.node.children().length === 1;
                });
            });

            afterEach(function () {
                this.node.remove();
            });

            it('draw correct empty message', function () {
                expect(this.node.children().length).toEqual(1);
                expect(this.node.children().first().is('ul')).toBeTruthy();
                expect(this.node.children().first().text()).toEqual('Sie haben keine in Kürze fälligen oder überfälligen Aufgaben.');
            });
        });
    });
});