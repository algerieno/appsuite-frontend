/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2018 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 *
 */

define('io.ox/core/locale', ['settings!io.ox/core'], function (settings) {

    'use strict';

    var locale,
        time, date, number, firstDayOfWeek, firstDayOfYear,
        //localeBackups = {},
        definedLocales = ['en'];

    // locale names
    // more or less manually added
    // need a better way to get at least names for everything that moment.js supports
    var supportedLocales = {
        'sq': 'Shqipëria',
        'ar-dz': 'ﺮﺌﺎﺰﺠﻠﺍ',
        'ar': 'ﺔﻴﺐﺮﻌﻠﺍ',
        'es': 'España',
        'en-au': 'Australia',
        'de-at': 'Österreich',
        'be': 'Беларусь',
        'nl-be': 'België',
        'fr': 'France',
        'pt-br': 'Brasil',
        'bg': 'България',
        'en-ca': 'Canada',
        'fr-ca': 'Canada',
        'hr': 'Hrvatska',
        'cs': 'Česko',
        'da': 'Danmark',
        'es-do': 'República Dominicana',
        'et': 'Eesti',
        'mk': 'Macedonia',
        'fi': 'Suomi',
        'sv': 'Finland',
        'de': 'Deutschland',
        'el': 'Ελλάδα',
        'zh-hk': '香港',
        'hu': 'Magyarország',
        'is': 'Ísland',
        'fa': 'Iran',
        'en-ie': 'Ireland',
        'he': 'לארשי',
        'it': 'Italia',
        'ja': '日本',
        'ko': '대한민국',
        'ar-kw': 'ﺖﻴﻮﻜﻠﺍ',
        'lv': 'Latvija',
        'lt': 'Lietuva',
        'ar-ma': 'ﺔﻴﺐﺮﻐﻤﻠﺍ ﺔﻜﻠﻤﻤﻠﺍ',
        'nl': 'Nederland',
        'en-nz': 'New Zealand',
        'zh-cn': '中华人民共和国',
        'pl': 'Polska',
        'pt': 'Portugal',
        'ro': 'România',
        'ru': 'Россия',
        'ar-sa': 'ﺔﻴﺪﻮﻌﺴﻠﺍ ﺔﻴﺐﺮﻌﻠﺍ ﺔﻜﻠﻤﻤﻠﺍ',
        'sr': 'Југославија',
        'sk': 'Slovensko',
        'sl': 'Slovenija',
        'eu': 'Espainia',
        'ca': 'Espanya',
        'fr-ch': 'Suisse',
        'de-ch': 'Schweiz',
        'zh-tw': '中華民國',
        'th': 'ไทย',
        'ar-tn': 'ﺲﻨﻮﺗ',
        'tr': 'Türkiye',
        'uk': 'Україна',
        'en-gb': 'United Kingdom',
        'en': 'United States',
        'vi': 'Việt Nam'
    };

    function getSettings() {
        return _.extend({
            time: 'default',
            date: 'default',
            number: 'default',
            firstDayOfWeek: 'default',
            firstDayOfYear: 'default'
        }, settings.get('locale'));
    }

    function getLocale() {
        var id = settings.get('region');
        if (supportedLocales[id]) return id;
        return deriveLocale(settings.get('language', 'en_US'));
    }

    function deriveLocale(language) {
        language = language.toLowerCase().replace(/_/, '-');
        if (supportedLocales[language]) return language;
        language = language.split(/-/)[0];
        if (supportedLocales[language]) return language;
        return 'en-us';
    }

    function setMomentLocale(id) {
        if (definedLocales.indexOf(id) > -1) {
            updateMomentLocale(id);
        } else {
            // load the file that contains the define, then load the define itself
            // we need do it this way to avoid the use of anonymous defines
            require(['static/3rd.party/moment/locale/' + id + '.js'], function () {
                require(['moment/locale/' + id], function () {
                    updateMomentLocale(id);
                    definedLocales.push(id);
                });
            });
        }
    }

    function updateMomentLocale(id) {

        if (definedLocales.indexOf(id) === -1) return;

        var longDateFormat = {};
        // time format
        if (time !== 'default') longDateFormat.LT = time;
        // date format
        if (date !== 'default') longDateFormat.L = date;
        var week = {};
        // first day of week (Sunday or Monday)
        if (firstDayOfWeek !== 'default') week.dow = firstDayOfWeek;
        // first day of year. this has an impact how calendar week is calculated
        if (firstDayOfYear !== 'default') week.doy = firstDayOfWeek;
        // drop custom locale
        moment.locale(id + '-custom', null);
        // define custom locale
        moment.defineLocale(id + '-custom', { parentLocale: id, longDateFormat: longDateFormat, week: week });
        // finally set custom locale
        moment.locale(id + '-custom');
    }

    function onSettingsChange() {
        var localeSettings = getSettings();
        time = localeSettings.time;
        date = localeSettings.date;
        number = localeSettings.number;
        firstDayOfWeek = localeSettings.firstDayOfWeek;
        firstDayOfYear = localeSettings.firstDayOfYear;
        updateMomentLocale(locale);
    }

    // get current locale
    locale = getLocale();
    //backupLocale('en');
    setMomentLocale(locale);
    settings.on('change:locale', onSettingsChange);
    onSettingsChange();

    // Number formatting
    // we just need a proper match for custom formats
    var numberFormats = { '1,234.56': 'en-us', '1.234,56': 'de-de', '1’234.56': 'de-ch', '1 234,56': 'de-at' };

    function getNumber(n, options) {
        if (isNaN(n)) return n;
        return Number(n).toLocaleString(numberFormats[number] || locale, options);
    }

    var dateFormats = ['MM/DD/YYYY', 'M/D/YYYY', 'MM/DD/YY', 'M/D/YY', 'DD.MM.YYYY', 'D.M.YYYY', 'DD.MM.YY', 'D.M.YY', 'YYYY-MM-DD'];

    return {

        // getter/setter

        getLocale: function () {
            return locale;
        },

        setLocale: function (id) {
            locale = id;
            setMomentLocale(locale);
        },

        // formatting

        number: function (n, d) {
            return getNumber(n, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
        },

        currency: function (n, code) {
            return getNumber(n, { style: 'currency', currency: code || 'EUR', currencyDisplay: 'symbol', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        percent: function (n, d) {
            return getNumber(n, { style: 'percent', minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
        },

        // utility functions

        getSettings: getSettings,

        getLocaleOptions: function () {
            return _(supportedLocales)
                .pairs()
                .map(function (item) {
                    return { label: item[1], value: item[0] };
                })
                .sort(function (a, b) { return a.label.localeCompare(b.label); });
        },

        getNumberFormats: function () {
            return _(numberFormats).keys();
        },

        getDateFormats: function () {
            return dateFormats.slice();
        }
    };
});