/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2016 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Frank Paczynski <frank.paczynski@open-xchange.com>
 */

define(['io.ox/files/fluid/view-detail',
    'io.ox/files/api',
    'io.ox/core/extensions',
    'waitsFor',
    'fixture!io.ox/files/file.json',
    'fixture!io.ox/files/file-versions.json'
    ], function (view, api, ext, waitsFor, file, fileversions) {

    describe('files detail view', function () {
        var baton = ext.Baton.ensure({
                data: file
            }),
            app = {
                getName: function () {
                    return 'testapp';
                },
                folder: {
                    set: '0815',
                    getData: function () {
                        return $.Deferred().resolve(file);
                    }
                }
            },
            //use different id for each mod
            modified = function (data) {
                var bat = $.extend(true, {}, baton, {
                    data: data,
                    app: app
                });
                _.each(data, function (value, key) {
                    if (!value) delete bat.data[key];
                });
                api.tracker.updateFile(bat.data);
                return view.draw(bat, app);
            };

        //reset tracker (lock/unlock states)
        afterEach(function () {
            api.tracker.clear();
            if (api.caches.versions.get.reset)
                api.caches.versions.get.reset();
        });

        describe('needs a baton that', function () {
            it('has to be defined', function () {
                var node = view.draw();
                expect(node.is(':empty')).to.be.true;
            });
            it('stores name of opening app', function () {
                view.draw(baton, app);
                expect(baton.openedBy).to.equal('testapp');
                delete baton.openedBy;
            });
        });
        describe('creates a DOM structure', function (done) {
            beforeEach(function () {
                var node = this.node = view.draw(baton);
                waitsFor(function () {
                    return node.find('ul.io-ox-inline-links').children().length > 0;
                }).done(done);
            });
            describe('with a container that', function () {
                it('has class file-details', function () {
                    expect(this.node.hasClass('file-details')).to.be.true;
                });
                it('use folder-id and file id as data-cid', function () {
                    expect(this.node.attr('data-cid')).to.equal(baton.data.folder_id + '.' + baton.data.id);
                });
            });
            describe('with action menu that', function () {
                describe('always', function () {
                    it('has some actions', function () {
                        var actions = this.node.find('ul.io-ox-inline-links');
                        expect(actions.children()).to.have.length.above(0);
                    });
                    it('has a show internal link action if filename is defined', function () {
                        //FIXME
                        //expect(this.node.find('[data-action="showlink"]').length).toBeTruthy();
                    });
                    it('has a copy action', function () {
                        //TODO: stub read grants
                        //expect(node.find('[data-action="copy"]').length).toBeTruthy();
                    });
                });
                describe('(if', function () {
                    describe('filename or file_size are defined)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                filename: undefined,
                                file_size: undefined
                            });
                        });
                        it('has a open action', function () {
                            expect(this.node.find('[data-action="open"]')).to.have.length.above(0);
                            expect(this.mod.find('[data-action="open"]')).to.have.length(0);
                        });
                        it('has a download action', function () {
                            expect(this.node.find('[data-action="download"]')).to.have.length.above(0);
                            expect(this.mod.find('[data-action="download"]')).to.have.length(0);
                        });
                    });
                    describe('filename is defined)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                filename: undefined
                            });
                        });
                        it('has a publish action if filename is defined', function () {
                            expect(this.node.find('[data-action="publish"]')).to.have.length.above(0);
                            expect(this.mod.find('[data-action="publish"]')).to.have.length(0);
                        });
                    });
                    describe('filetype is supported)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                filename: 'something.jpg'
                            });
                        });

                        it('has a edit action ', function () {
                            expect(this.node.find('[data-action="editor"]')).to.have.length.above(0);
                            expect(this.mod.find('[data-action="editor"]')).to.have.length(0);
                        });
                    });
                    describe('file is not locked)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                id: 4712,
                                modified_by: ox.user_id,
                                locked_until: _.now() + (604800000 / 2)
                            });
                        });

                        it('has a rename action', function () {
                            expect(this.node.find('[data-action="rename"]')).to.have.length.above(0);
                        });
                        it('has a edit-description action', function () {
                            expect(this.node.find('[data-action="edit-description"]')).to.have.length.above(0);
                        });
                        it('has a move action', function () {
                            //TODO: stub read/delete grants
                            //expect(this.node.find('[data-action="move"]').length).to.have.length.above(0);
                            expect(this.mod.find('[data-action="move"]')).to.have.length(0);
                        });
                    });
                    describe('file is locked by myself)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                id: 4713,
                                modified_by: ox.user_id,
                                locked_until: _.now() + (604800000 / 2)
                            });
                        });
                        it('has a rename action', function () {
                            expect(this.mod.find('[data-action="rename"]')).to.have.length.above(0);
                        });
                        it('has a unlock action', function () {
                            expect(this.node.find('[data-action="unlock"]')).to.have.length(0);
                            //FIXME
                            //expect(this.mod.find('[data-action="unlock"]')).to.have.length.above(0);
                        });
                    });
                    describe('file is locked by another user)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                id: 4714,
                                locked_until: _.now() + (604800000 / 2)
                            });
                        });

                        it('has a rename action', function () {
                            expect(this.mod.find('[data-action="rename"]')).to.have.length(0);
                        });
                        it('has a edit description action', function () {
                            expect(this.mod.find('[data-action="edit-description"]')).to.have.length(0);
                        });
                        it('has a unlock action', function () {
                            expect(this.mod.find('[data-action="unlock"]')).to.have.length(0);
                        });
                    });
                    describe('file is unlocked)', function () {
                        beforeEach(function () {
                            this.mod = modified({
                                id: 4715,
                                locked_until: _.now() + (604800000 / 2)
                            });
                        });
                        it('has a lock action', function () {
                            //FIXME
                            //expect(this.node.find('[data-action="lock"]')).to.have.length.above(0);
                            expect(this.mod.find('[data-action="lock"]')).to.have.length(0);
                        });
                        it('has a edit-description action if file isn not locked', function () {
                            expect(this.node.find('[data-action="edit-description"]')).to.have.length.above(0);
                        });
                    });
                });
            });

            describe('that contain a table with information about versions', function () {
                beforeEach(function () {
                    if (api.caches.versions.get.restore)
                        api.caches.versions.get.restore();
                    sinon.stub(api.caches.versions, 'get', function () {
                        return $.Deferred().resolve(fileversions);
                    });
                    this.mod = modified({
                        id: 4717,
                        number_of_versions: 3
                    });
                });
                it('when versions exist', function () {
                    var mod = modified({
                        id: 4716,
                        number_of_versions: 0
                    });
                    expect(this.node.find('table.versiontable')).to.have.length.above(0);
                    expect(mod.find('table.versiontable')).to.have.length(0);
                });
                it('that can be collapsed', function () {
                    expect(this.mod.find('.versiontable').attr('style')).to.empty;
                    this.mod.find('[data-action="history"]').trigger('click');
                    expect(this.mod.find('.versiontable').attr('style').trim()).to.equal('display: table;');
                });
                it('that is initially collapsed', function () {
                    //TODO: initially hidden via css class; refactor
                });
                it('that shows all versions', function () {
                    expect(this.mod.find('.versiontable').find('tbody>tr')).to.have.length(3);
                });
                it('that highlights current version by adding class "info"', function () {
                    expect(this.mod.find('.versiontable').find('.info .versionLabel').text()).to.equal('2');
                });
            });
            it('that shows additional info about the folder', function () {
                expect(this.node.find('ul.breadcrumb')).to.have.length(1);
            });
            it('that allows uploading a new file version', function () {
                expect(this.node.find('input.file-input')).to.have.length(1);
            });
        });
    });
});