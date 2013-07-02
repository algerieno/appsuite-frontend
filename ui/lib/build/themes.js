/**
 * All content on this website (including text, images, source
 * code and any other original works), unless otherwise noted,
 * is licensed under a Creative Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * Copyright (C) Open-Xchange Inc., 2013
 * Mail: info@open-xchange.com
 *
 * @author Viktor Pracht <viktor.pracht@open-xchange.com>
 */

var fs = require('fs');
var path = require('path');

var utils = require('./fileutils');
var less = require('../less.js/lib/less/index.js');
var _ = require('../underscore');

// themes

desc('Precompiles LessCSS files for every theme');
utils.topLevelTask('update-themes', []);

if (!utils.envBoolean('skipLess')) compileLess();
function compileLess() {

    var coreDir = process.env.coreDir || utils.builddir;

    function core(file) { return path.join(coreDir, file).replace(/\\/g, '/'); }

    var ownLess = utils.list('apps', '**/*.less'), coreLess;
    var ownThemes = utils.list('apps/themes/*/definitions.less');
    var coreThemes = utils.list(core('apps/themes'), '*/definitions.less');

    if ((ownThemes.length || ownLess.length) &&
        !path.existsSync('apps/themes/definitions.less') &&
        !path.existsSync(core('apps/themes/definitions.less')))
    {
        if (process.env.coreDir) {
            console.warn('Warning: Invalid coreDir');
        } else {
            console.warn('Warning: Themes require either coreDir or skipLess');
        }
        return;
    }

    function compile(dest, defs, defsInCore, src, srcInCore) {
        dest = utils.dest(dest);
        utils.file(dest,
            [core('apps/themes/definitions.less'),
             defsInCore ? core(defs) : defs, srcInCore ? core(src) : src],
            function () {
                new less.Parser({
                    paths: ['.', coreDir],
                    relativeUrls: true
                }).parse('@import "apps/themes/definitions.less";\n' +
                         '@import "' + defs.replace(/\\/g, '/') + '";\n' +
                         '@import "' + src.replace(/\\/g, '/') + '";\n',
                function (e, tree) {
                    if (e) return fail(less.formatError(e));
                    try {
                        fs.writeFileSync(dest,
                            tree.toCSS({ compress: !utils.debug }));
                        complete();
                    } catch (e) {
                        fail(less.formatError(e));
                    }
                });
            }, { async: true });
    }

    // own themes
    _.each(ownThemes, function(defs) {
        if (!coreLess) coreLess = utils.list(core('apps'), '**/*.less');
        var dir = path.dirname(defs);
        compile(path.join(dir, 'less/common.css'), defs, false,
                'apps/themes/style.less', true);
        compile(path.join(dir, 'less/style.css'), defs, false,
                path.join(dir, 'style.less'), false);
        _.each(ownLess, function (file) {
            if (/^themes[\/\\]/.test(file)) return;
            compile(path.join(dir, 'less', file), defs, false,
                    path.join('apps', file), false);
        });
        _.each(coreLess, function (file) {
            if (/^themes[\/\\]/.test(file)) return;
            compile(path.join(dir, 'less', file), defs, false,
                    path.join('apps', file), true);
        });
    });

    // core themes
    _.each(coreThemes,
        function (defs) {
            if (path.existsSync(path.join('apps/themes', defs))) return;
            var dir = path.join('apps/themes', path.dirname(defs));
            _.each(ownLess, function (file) {
                if (/^themes[\/\\]/.test(file)) return;
                compile(path.join(dir, 'less', file),
                        path.join('apps/themes', defs), true,
                        path.join('apps', file), false);
            });
        });
}

