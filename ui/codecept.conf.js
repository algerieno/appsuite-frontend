/* eslint-env node, es6  */
var defaultContext;

// please create .env file based on .evn-example
require('dotenv').config();

['LAUNCH_URL', 'SELENIUM_HOST', 'PROVISIONING_URL', 'CONTEXT_ID'].forEach(function notdefined(key) {
    if (process.env[key]) return;
    console.error('\x1b[31m', `ERROR: Missing value for environment variable '${key}'. Please specify a '.env' file analog to '.env-example'.`);
    process.exit();
});

module.exports.config = {
    tests: './e2e/tests/**/*_test.js',
    timeout: 10000,
    output: './build/e2e/',
    helpers: {
        WebDriver: {
            url: process.env.LAUNCH_URL,
            host: process.env.SELENIUM_HOST,
            smartWait: 1000,
            waitForTimeout: 30000,
            browser: 'chrome',
            restart: true,
            windowSize: 'maximize',
            uniqueScreenshotNames: true,
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['no-sandbox']
                }
            },
            timeouts: {
                script: 5000
            }
        },
        OpenXchange: {
            require: './e2e/helper',
            mxDomain: 'ox-e2e-backend.novalocal',
            serverURL: process.env.PROVISIONING_URL,
            contextId: process.env.CONTEXT_ID,
            filestoreId: process.env.FILESTORE_ID
        }
    },
    include: {
        I: './e2e/actor',
        users: './e2e/users',
        contexts: './e2e/contexts',
        search: './e2e/actor_search'
    },
    bootstrap: function (done) {
        // setup chai
        var chai = require('chai');
        chai.config.includeStack = true;
        // setup axe matchers
        require('./e2e/axe-matchers');

        // set moment defaults
        // note: no need to require moment-timezone later on. requiring moment is enough
        var moment = require('moment');
        require('moment-timezone');
        moment.tz.setDefault('Europe/Berlin');

        var codecept = require('codeceptjs'),
            config = codecept.config.get(),
            seleniumReady;
        seleniumReady = new Promise(function (resolve, reject) {
            if (config.helpers.WebDriver && /127\.0\.0\.1/.test(config.helpers.WebDriver.host)) {
                require('@open-xchange/codecept-helper').selenium
                    .start()
                    .then(resolve, reject);
            } else {
                resolve();
            }
        });

        var contexts = codecept.container.support('contexts'),
            testContextReady;
        testContextReady = new Promise(function (resolve) {
            const ctxData = {
                id: config.helpers.OpenXchange.contextId
            };
            // provide filestore id, otherwise it's not possible to create more then 5
            // contexts existing at a time.
            if (typeof config.helpers.OpenXchange.filestoreId !== 'undefined') ctxData.filestoreId = config.helpers.OpenXchange.filestoreId;

            contexts.create(ctxData).then(function (ctx) {
                defaultContext = ctx;
                resolve();
            }, function (err) {
                console.error(`Could not create context ${JSON.stringify(ctxData, null, 4)}.\nError: ${err.faultstring}`);
                process.exit(1);
            });
        });

        Promise.all([
            seleniumReady,
            testContextReady
        ]).then(() => done());
    },
    teardown: function () {
        const helper = new (require('@open-xchange/codecept-helper').helper)();
        defaultContext.remove = function (auth) {
            helper.executeSoapRequest('OXContextService', 'delete', {
                ctx: { id: this.ctxdata.id },
                auth: auth || this.auth
            });
        };
        if (defaultContext.id !== 10) defaultContext.remove();
        //HACK: defer killing selenium, because it's still needed for a few ms
        setTimeout(function () {
            require('@open-xchange/codecept-helper').selenium.stop();
        }, 500);
    },
    plugins: {
        allure: { enabled: true },
        testrail: {
            require: './e2e/plugins/testrail',
            host: process.env.TESTRAIL_HOST || 'https://testrail.local',
            user: process.env.TESTRAIL_USERNAME || 'testuser',
            password: process.env.TESTRAIL_API_KEY || 'testkey',
            project_id: process.env.TESTRAIL_PROJECTID || '1',
            runName: process.env.TESTRAIL_RUNNAME || 'test',
            enabled: process.env.TESTRAIL_ENABLED || false
        }
    },
    name: 'App Suite Core UI'
};
