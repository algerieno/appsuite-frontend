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
 * @author Julian Bäume <julian.baeume@open-xchange.com>
 */

define(['io.ox/core/manifests'], function (manifests) {
    'use strict';

    describe('Core manifests', function () {

        it('should define global ox.manifests object', function () {
            expect(ox.manifests).to.exist;
        });

        it('should provide a reset method', function () {
            expect(manifests.reset).to.be.a('function');
        });

        it('should provide a manifest manager object', function () {
            expect(manifests.manager).to.exist;
        });

        describe('provides the manifest manager which', function () {
            it('should be exported globally as ox.manifests', function () {
                expect(ox.manifests).to.equal(manifests.manager);
            });

            describe('has a "pluginsFor" method that', function () {
                it('should return an empty list if no extension point is given', function () {
                    expect(manifests.manager.pluginsFor()).to.be.empty;
                });

                it('should return a list of plugins for a given extension point name', function () {
                    manifests.manager.pluginPoints.testPoint = [{
                        path: 'path/to/plugin2'
                    }, {
                        path: 'path/to/plugin1'
                    }];

                    expect(manifests.manager.pluginsFor('testPoint')).to.deep.equal(['path/to/plugin2', 'path/to/plugin1']);

                    delete manifests.manager.pluginPoints.testPoint;
                });
            });
        });
    });
});
