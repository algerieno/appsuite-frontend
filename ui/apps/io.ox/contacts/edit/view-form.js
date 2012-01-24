/**
 * All content on this website (including text, images, source code and any
 * other original works), unless otherwise noted, is licensed under a Creative
 * Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * Copyright (C) Open-Xchange Inc., 2006-2011 Mail: info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 * @author Christoph Kopp <christoph.kopp@open-xchange.com>
 */

define("io.ox/contacts/edit/view-form",
    ["io.ox/core/extensions",
     "gettext!io.ox/contacts/contacts",
     "io.ox/contacts/util",
     "io.ox/contacts/api",
     'io.ox/core/tk/forms'
    ], function (ext, gt, util, api, forms) {

    "use strict";

    var app = null;
    // smart join
    var join = function () {
        return _(arguments)
        .select(function (obj, i) {
            return i > 0 && !!obj;
        })
        .join(arguments[0] || "");
    };

    function renewHeader() {
        var newObj = {
            title: $('input[name="title"]').val(),
            last_name: $('input[name="last_name"]').val(),
            first_name: $('input[name="first_name"]').val(),
            position: $('input[name="position"]').val(),
            company: $('input[name="company"]').val(),
            profession: $('input[name="profession"]').val()
        },
            nameClearTitle = $('.name.clear-title'),
            jobClearTitle = $('.job.clear-title');

        nameClearTitle.text(util.getFullName(newObj));
        jobClearTitle.text(util.getJob(newObj));
    }

    var getDataWrapper = function (data) {
      var mydata = data;
      var mywrapper = {
        get: function (k) {
            console.log('get:' + k + '('+mydata[k]+')');
            console.log(mydata);
          return mydata[k];
        },
        set: function (k, val) {
            console.log(mydata);
            mydata[k] = val;
            $(mywrapper).trigger(k + '.changed', val);
        },
        getData: function () {
            return mydata;
        }
      };
      console.log(data);
      return mywrapper;
    };


    function addField(o) {
        //o.node.append(forms.createLabeledTextField({name: o.name, label: o.label, model: { get: function () { return "whoaa";}, set: function () {}}}));
        var now = _.now(),
            field = forms.createTextField({dataid: o.dataid, name: o.name, label: o.label, model: getDataWrapper(o.data)}),

            /*$('<input>', { name: o.name, type: 'text', id: o.name + "_" + now })
                .addClass('nice-input')
                // TODO: add proper CSS class
                .css({ fontSize: '14px', width: '300px', paddingTop: '0.25em', paddingBottom: '0.25em', webkitBorderRadius: 0, webkitAppearance: 'none' })
                .on('change', {name: o.name, node: o.node}, function (e) {
                        var tr = $(e.data.node).find('tr.' + e.data.name);
                        if (tr.find('input').val() === '') {
                            tr.removeClass('filled');
                        } else {
                            tr.addClass('filled');
                        }
                    }),*/
            td = $("<td>").addClass("value").css('paddingBottom', '0.5em')
                .append(field),
            tr = $("<tr>").addClass(o.id + ' ' + o.name)
                .append(
                    $("<td>").addClass("label")
                    .css({ paddingTop: '7px', width: '150px' })
                    .append($('<label>').text(o.label).attr('for', o.name + "_" + now))
                )
                .append(td);
        // auto-update header?
        if (/^(first_name|last_name|title|company|position|profession)$/.test(o.name)) {
            field.on('change keyup', { name: o.name }, function (e) {
                _.defer(renewHeader);
            });
        }
        if (!o.value) {
            if (_.isFunction(o.fn)) {
                o.fn(td);
            } else {
                if (typeof o.fn === "string") {
                    tr.addClass(o.fn);
                }
            }
            tr.appendTo(o.node);
        } else {
            field.val(o.value);
            tr.appendTo(o.node);
        }
    }





    function addBlockheader(node, id, title) {
        var headline = $('<div>').text(title),
            tr = $('<tr>').addClass(id + ' headline hidden').append($('<td>'), $('<td>').append(headline));

        tr.appendTo(node);
    }

    function addSpacer(node) {
        var tr = $('<tr>').append(
            $('<td>', { colspan: '2' }).text('\u00A0')
        );
        tr.appendTo(node);
    }





    var formFields = {
        personalFields: {
            fields: {
                'titel' : {
                    label: gt("Title"),
                    name: 'title',
                    fn: 'hidden',
                    weight: 100,
                    blockid: 'contact-personal'
                },
                'first_name': {
                    label: gt("First name"),
                    name: 'first_name',
                    weight: 110,
                    blockid: 'contact-personal'
                },
                'last_name': {
                    label: gt("Last name"),
                    name: 'last_name',
                    weight: 120,
                    blockid: 'contact-personal'
                },
                'display_name': {
                    label: gt("Display name"),
                    name: 'display_name',
                    weight: 130,
                    blockid: 'contact-personal'
                },
                'second_name': {
                    label: gt("Second name"),
                    name: 'second_name',
                    fn: 'hidden',
                    weight: 140,
                    blockid: 'contact-personal'
                },
                'suffix': {
                    label: gt("Suffix"),
                    name: 'suffix',
                    fn: 'hidden',
                    weight: 105,
                    blockid: 'contact-personal'
                },
                'nickname': {
                    label: gt("Nickname"),
                    name: 'nickname',
                    fn: 'hidden',
                    weight: 160,
                    blockid: 'contact-personal'
                },
                'birthday': {
                    label: gt("Birthday"),
                    name: 'birthday',
                    fn: 'hidden',
                    weight: 170,
                    blockid: 'contact-personal'
                }

            }
        },
        mailFields: {
            fields: {
                'email1': {
                    label: gt('E-Mail 1'),
                    name: 'email1',
                    weight: 200,
                    blockid: 'contact-email'
                },
                'email2': {
                    label: 'E-Mail 2',
                    name: 'email2',
                    fn: 'hidden',
                    weight: 210,
                    blockid: 'contact-email'
                },
                'email3': {
                    label: 'E-Mail 3',
                    name: 'email3',
                    fn: 'hidden',
                    weight: 220,
                    blockid: 'contact-email'
                }
            }
        },
        phoneFields: {
            fields: {
                'telephone_business1': {
                    label: gt("Telephone business 1"),
                    name: 'telephone_business1',
                    weight: 301,
                    blockid: 'contact-phone'
                },
                'telephone_business2': {
                    label: gt("Telephone business 2"),
                    name: 'telephone_business2',
                    fn: 'hidden',
                    weight: 302,
                    blockid: 'contact-phone'
                },
                'fax_business': {
                    label: gt("Fax business"),
                    name: 'fax_business',
                    fn: 'hidden',
                    weight: 303,
                    blockid: 'contact-phone'
                },
                'telephone_callback': {
                    label: gt("Telephone callback"),
                    name: 'telephone_callback',
                    fn: 'hidden',
                    weight: 304,
                    blockid: 'contact-phone'
                },
                'telephone_car': {
                    label: gt("Telephone car"),
                    name: 'telephone_car',
                    fn: 'hidden',
                    weight: 305,
                    blockid: 'contact-phone'
                },
                'telephone_company': {
                    label: gt("Phone (Company)"),
                    name: 'telephone_company',
                    fn: 'hidden',
                    weight: 306,
                    blockid: 'contact-phone'
                },
                'telephone_home1': {
                    label: gt("Phone (home)"),
                    name: 'telephone_home1',
                    fn: 'hidden',
                    weight: 307,
                    blockid: 'contact-phone'
                },
                'telephone_home2': {
                    label: gt("Phone (home 2nd)"),
                    name: 'telephone_home2',
                    fn: 'hidden',
                    weight: 308,
                    blockid: 'contact-phone'
                },
                'fax_home': {
                    label: gt("Fax home"),
                    name: 'fax_home',
                    fn: 'hidden',
                    weight: 309,
                    blockid: 'contact-phone'
                },
                'cellular_telephone1': {
                    label: gt("Cellphone"),
                    name: 'cellular_telephone1',
                    weight: 310,
                    blockid: 'contact-phone'
                },
                'cellular_telephone2': {
                    label: gt("Cellphone (2nd)"),
                    name: 'cellular_telephone2',
                    fn: 'hidden',
                    weight: 311,
                    blockid: 'contact-phone'
                },
                'telephone_other': {
                    label: gt("Phone (other)"),
                    name: 'telephone_other',
                    fn: 'hidden',
                    weight: 312,
                    blockid: 'contact-phone'
                },
                'fax_other': {
                    label: gt("Fax other"),
                    name: 'fax_other',
                    fn: 'hidden',
                    weight: 313,
                    blockid: 'contact-phone'
                },
                'telephone_isdn': {
                    label: gt("Telephone isdn"),
                    name: 'telephone_isdn',
                    fn: 'hidden',
                    weight: 314,
                    blockid: 'contact-phone'
                },
                'telephone_pager': {
                    label: gt("Telephone pager"),
                    name: 'telephone_pager',
                    fn: 'hidden',
                    weight: 315,
                    blockid: 'contact-phone'
                },
                'telephone_primary': {
                    label: gt("Telephone primary"),
                    name: 'telephone_primary',
                    fn: 'hidden',
                    weight: 316,
                    blockid: 'contact-phone'
                },
                'telephone_radio': {
                    label: gt("Telephone radio"),
                    name: 'telephone_radio',
                    fn: 'hidden',
                    weight: 317,
                    blockid: 'contact-phone'
                },
                'telephone_telex': {
                    label: gt("Telephone telex"),
                    name: 'telephone_telex',
                    fn: 'hidden',
                    weight: 318,
                    blockid: 'contact-phone'
                },
                'telephone_ttytdd': {
                    label: gt("Telephone ttytdd"),
                    name: 'telephone_ttytdd',
                    fn: 'hidden',
                    weight: 319,
                    blockid: 'contact-phone'
                },
                'instant_messenger1': {
                    label: gt("Instant messenger 1"),
                    name: 'instant_messenger1',
                    fn: 'hidden',
                    weight: 320,
                    blockid: 'contact-phone'
                },
                'instant_messenger2': {
                    label: gt("Instant messenger 2"),
                    name: 'instant_messenger2',
                    fn: 'hidden',
                    weight: 321,
                    blockid: 'contact-phone'
                },
                'telephone_ip': {
                    label: gt("Telephone ip"),
                    name: 'telephone_ip',
                    fn: 'hidden',
                    weight: 322,
                    blockid: 'contact-phone'
                },
                'telephone_assistant': {
                    label: gt("Telephone_assistant"),
                    name: 'telephone_assistant',
                    fn: 'hidden',
                    weight: 323,
                    blockid: 'contact-phone'
                }
            }
        },
        homeFields: {
            fields: {
                'street_home': {
                    label: gt("Street"),
                    name: 'street_home',
                    fn: 'hidden',
                    weight: 400,
                    blockid: 'contact-home-address'
                },
                'postal_code_home': {
                    label: gt("Postal code"),
                    name: 'postal_code_home',
                    fn: 'hidden',
                    weight: 410,
                    blockid: 'contact-home-address'
                },
                'city_home': {
                    label: gt("City"),
                    name: 'city_home',
                   fn: 'hidden',
                    weight: 420,
                    blockid: 'contact-home-address'
                },
                'state_home': {
                    label: gt("State"),
                    name: 'state_home',
                    fn: 'hidden',
                    weight: 430,
                    blockid: 'contact-home-address'
                },
                'country_home': {
                    label: gt("Country"),
                    name: 'country_home',
                    fn: 'hidden',
                    weight: 440,
                    blockid: 'contact-home-address'
                }

            }
        },
        businessFields: {
            fields: {
                'street_business': {
                    label: gt("Street"),
                    name: 'street_business',
                    fn: 'hidden',
                    weight: 510,
                    blockid: 'contact-work-address'
                },
                'postal_code_business': {
                    label: gt("Postal code"),
                    name: 'postal_code_business',
                    fn: 'hidden',
                    weight: 520,
                    blockid: 'contact-work-address'
                },
                'city_business': {
                    label: gt("City"),
                    name: 'city_business',
                    fn: 'hidden',
                    weight: 530,
                    blockid: 'contact-work-address'
                },
                'state_business': {
                    label: gt("State"),
                    name: 'state_business',
                    fn: 'hidden',
                    weight: 540,
                    blockid: 'contact-work-address'
                },
                'country_business': {
                    label: gt("Country"),
                    name: 'country_business',
                    fn: 'hidden',
                    weight: 550,
                    blockid: 'contact-work-address'
                }
            }
        },
        otherFields: {
            fields: {
                'street_other': {
                    label: gt("Street"),
                    name: 'street_other',
                    fn: 'hidden',
                    weight: 600,
                    blockid: 'contact-other-address'
                },
                'postal_code_other': {
                    label: gt("Postal code"),
                    name: 'postal_code_other',
                    fn: 'hidden',
                    weight: 610,
                    blockid: 'contact-other-address'
                },
                'city_other': {
                    label: gt("City"),
                    name: 'city_other',
                    fn: 'hidden',
                    weight: 620,
                    blockid: 'contact-other-address'
                },
                'state_other': {
                    label: gt("State"),
                    name: 'state_other',
                    fn: 'hidden',
                    weight: 630,
                    blockid: 'contact-other-address'
                },
                'country_other': {
                    label: gt("Country"),
                    name: 'country_other',
                    fn: 'hidden',
                    weight: 640,
                    blockid: 'contact-other-address'
                }
            }
        },
        jobFields: {
            fields: {
                'room_number': {
                    label: gt("Room number"),
                    name: 'room_number',
                    fn: 'hidden',
                    weight: 500,
                    blockid: 'contact-job-descriptions'
                },
                'profession': {
                    label: gt("Profession"),
                    name: 'profession',
                    fn: 'hidden',
                    weight: 700,
                    blockid: 'contact-job-descriptions'
                },
                'position': {
                    label: gt("Position"),
                    name: 'position',
                    fn: 'hidden',
                    weight: 705,
                    blockid: 'contact-job-descriptions'
                },
                'company': {
                    label: gt("Company"),
                    name: 'company',
                    fn: 'hidden',
                    weight: 710,
                    blockid: 'contact-job-descriptions'
                },
                'department': {
                    label: gt("Department"),
                    name: 'department',
                    fn: 'hidden',
                    weight: 715,
                    blockid: 'contact-job-descriptions'
                },
                'employee_type': {
                    label: gt("Employee type"),
                    name: 'employee_type',
                    fn: 'hidden',
                    weight: 720,
                    blockid: 'contact-job-descriptions'
                },
                'number_of_employees': {
                    label: gt("Number of employees"),
                    name: 'number_of_employees',
                    fn: 'hidden',
                    weight: 725,
                    blockid: 'contact-job-descriptions'
                },
                'sales_volume': {
                    label: gt("Sales volume"),
                    name: 'sales_volume',
                    fn: 'hidden',
                    weight: 730,
                    blockid: 'contact-job-descriptions'
                },
                'tax_id': {
                    label: gt("Tax id"),
                    name: 'tax_id',
                    fn: 'hidden',
                    weight: 735,
                    blockid: 'contact-job-descriptions'
                },
                'commercial_register': {
                    label: gt("Commercial register"),
                    name: 'commercial_register',
                    fn: 'hidden',
                    weight: 740,
                    blockid: 'contact-job-descriptions'
                },
                'branches': {
                    label: gt("Branches"),
                    name: 'branches',
                    fn: 'hidden',
                    weight: 745,
                    blockid: 'contact-job-descriptions'
                },
                'business_category': {
                    label: gt("Business category"),
                    name: 'business_category',
                    fn: 'hidden',
                    weight: 750,
                    blockid: 'contact-job-descriptions'
                },
                'info': {
                    label: gt("Info"),
                    name: 'info',
                    fn: 'hidden',
                    weight: 755,
                    blockid: 'contact-job-descriptions'
                },
                'manager_name': {
                    label: gt("Manager name"),
                    name: 'manager_name',
                    fn: 'hidden',
                    weight: 760,
                    blockid: 'contact-job-descriptions'
                },
                'assistant_name': {
                    label: gt("Assistant name"),
                    name: 'assistant_name',
                    fn: 'hidden',
                    weight: 765,
                    blockid: 'contact-job-descriptions'
                }

            }
        },
        specialFields: {
            fields: {
                'marital_status': {
                    label: gt("Marital status"),
                    name: 'marital_status',
                    fn: 'hidden',
                    weight: 801,
                    blockid: 'special-information'
                },
                'number_of_children': {
                    label: gt("Number of children"),
                    name: 'number_of_children',
                    fn: 'hidden',
                    weight: 802,
                    blockid: 'special-information'
                },
                'spouse_name': {
                    label: gt("Spouse name"),
                    name: 'spouse_name',
                    fn: 'hidden',
                    weight: 803,
                    blockid: 'special-information'
                },
                'note': {
                    label: gt("Note"),
                    name: 'note',
                    fn: 'hidden',
                    weight: 804,
                    blockid: 'special-information'
                },
                'url': {
                    label: gt("Url"),
                    name: 'url',
                    fn: 'hidden',
                    weight: 805,
                    blockid: 'special-information'
                },
                'anniversary': {
                    label: gt("Anniversary"),
                    name: 'anniversary',
                    fn: 'hidden',
                    weight: 806,
                    blockid: 'special-information'
                },
                'userfield01': {
                    label: gt("Userfield 01"),
                    name: 'userfield01',
                    fn: 'hidden',
                    weight: 807,
                    blockid: 'special-information'
                },
                'userfield02': {
                    label: gt("Userfield 02"),
                    name: 'userfield02',
                    fn: 'hidden',
                    weight: 808,
                    blockid: 'special-information'
                },
                'userfield03': {
                    label: gt("Userfield 03"),
                    name: 'userfield03',
                    fn: 'hidden',
                    weight: 809,
                    blockid: 'special-information'
                },
                'userfield04': {
                    label: gt("Userfield 04"),
                    name: 'userfield04',
                    fn: 'hidden',
                    weight: 810,
                    blockid: 'special-information'
                },
                'userfield05': {
                    label: gt("Userfield 05"),
                    name: 'userfield05',
                    fn: 'hidden',
                    weight: 811,
                    blockid: 'special-information'
                },
                'userfield06': {
                    label: gt("Userfield 06"),
                    name: 'userfield06',
                    fn: 'hidden',
                    weight: 812,
                    blockid: 'special-information'
                },
                'userfield07': {
                    label: gt("Userfield 07"),
                    name: 'userfield07',
                    fn: 'hidden',
                    weight: 813,
                    blockid: 'special-information'
                },
                'userfield08': {
                    label: gt("Userfield 08"),
                    name: 'userfield08',
                    fn: 'hidden',
                    weight: 814,
                    blockid: 'special-information'
                },
                'userfield09': {
                    label: gt("Userfield 09"),
                    name: 'userfield09',
                    fn: 'hidden',
                    weight: 815,
                    blockid: 'special-information'
                },
                'userfield10': {
                    label: gt("Userfield 10"),
                    name: 'userfield10',
                    fn: 'hidden',
                    weight: 816,
                    blockid: 'special-information'
                },
                'userfield11': {
                    label: gt("Userfield 11"),
                    name: 'userfield11',
                    fn: 'hidden',
                    weight: 817,
                    blockid: 'special-information'
                },
                'userfield12': {
                    label: gt("Userfield 12"),
                    name: 'userfield12',
                    fn: 'hidden',
                    weight: 818,
                    blockid: 'special-information'
                },
                'userfield13': {
                    label: gt("Userfield 13"),
                    name: 'userfield13',
                    fn: 'hidden',
                    weight: 819,
                    blockid: 'special-information'
                },
                'userfield14': {
                    label: gt("Userfield 14"),
                    name: 'userfield14',
                    fn: 'hidden',
                    weight: 820,
                    blockid: 'special-information'
                },
                'userfield15': {
                    label: gt("Userfield 15"),
                    name: 'userfield15',
                    fn: 'hidden',
                    weight: 821,
                    blockid: 'special-information'
                },
                'userfield16': {
                    label: gt("Userfield 16"),
                    name: 'userfield16',
                    fn: 'hidden',
                    weight: 822,
                    blockid: 'special-information'
                },
                'userfield17': {
                    label: gt("Userfield 17"),
                    name: 'userfield17',
                    fn: 'hidden',
                    weight: 823,
                    blockid: 'special-information'
                },
                'userfield18': {
                    label: gt("Userfield 18"),
                    name: 'userfield18',
                    fn: 'hidden',
                    weight: 824,
                    blockid: 'special-information'
                },
                'userfield19': {
                    label: gt("Userfield 19"),
                    name: 'userfield19',
                    fn: 'hidden',
                    weight: 825,
                    blockid: 'special-information'
                },
                'userfield20': {
                    label: gt("Userfield 20"),
                    name: 'userfield20',
                    fn: 'hidden',
                    weight: 826,
                    blockid: 'special-information'
                }
            }
        }
    };



    function addSwitch(node, id, title) {
        var select = $(node).find('.' + id + '.hidden'),
            f = ($(node).find('.' + id + '.hidden')).length,
            allInputsTr = $(node).find('tr.' + id),
            g = $(node).find('.' + id).length,
            v = g - f,
            buttonTextOn,
            buttonTextOff,
            oldP;
        if (v >= 1) {
            $(node).find('.' + id + '.headline').removeClass('hidden');
            buttonTextOn = 'show more';
            buttonTextOff = 'show less';
        } else {
            buttonTextOn = '+ ' + title;
            buttonTextOff = '- ' + title;
        }
        var button = $('<a>').addClass(id).text(buttonTextOn),
            tr = $('<tr>').append($('<td>'), $('<td>').append(button));

        button.on('click', {id: id}, function (event) {
            if (button.text() === buttonTextOn) {
                oldP = $('.window-content').scrollTop();
                $(node).find('.' + event.data.id + '.hidden').removeClass('hidden').addClass('visible');
                button.text(buttonTextOff);
            } else {
                $(node).find('.' + event.data.id + '.visible').removeClass('visible').addClass('hidden');
                button.text(buttonTextOn);
                $('.window-content').scrollTop(oldP);
            }
        });
        allInputsTr.on('change keyup', function () {
            var values = {};
            allInputsTr.not('.headline').each(function (index) {
//                console.log($(this).find('input'));
                if ($(this).find('input').val() !== '') {
                    values[index] = $(this).find('input').val();
                    $(this).addClass('filled');

                } else {
                    $(this).removeClass('filled');
                }
                });

//            console.log(values);
            if (!_.isEmpty(values)) {
                buttonTextOff = 'show less';
                buttonTextOn = 'show more';
                button.text(buttonTextOff);
                $('.' + id + '.headline').removeClass('visible filled');
            }
            else {
                buttonTextOn = '+ ' + title;
                buttonTextOff = '- ' + title;
                button.text(buttonTextOn);
                $('tr.' + id).removeClass('filled').addClass('hidden');
                }
        });

        if (select[1]) {
            tr.appendTo(node);
        }

    }


    function createfields(fielddata) {
        ext.point("io.ox/contacts/edit/form/" + fielddata.blockid).extend({
            index: fielddata.weight,
            id: 'contact-' + fielddata.name,
            draw: function (data, id) {
                var dateValue = data[fielddata.name];
                if (/^(anniversary|birthday)$/.test(fielddata.name)) {
                    var date = new Date(data[fielddata.name]);
                    if (!isNaN(date.getDate())) {
                        dateValue = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
                    }
                }
                addField({
                    label: fielddata.label,
                    name: fielddata.name,
                    dataid: fielddata.name,
                    'data': data,
                    value: dateValue,
                    node:  this,
                    fn: fielddata.fn,
                    id: fielddata.blockid
                });

            }
        });
    }

    var addrBlock = 'street,postal_code/city,country,state'; //street,postal_code/city,country,state


//    function drawSingleFieldAdd(o) {
//        var tr = $('<tr>'),
//            td = $('<td>'),
//            label = $('<td>').addClass('label').css({
//                'padding-top': '7px',
//                'width': '150px'
//            });
//
//        td.addClass('value').css('padding-bottom', '0.5em')
//        .append($('<input>').addClass('nice-input').css({
//            'font-size': '14px',
//            'width': '300px',
//            'padding-top': '0.25em',
//            'padding-bottom': '0.25em'
//        }).attr({
//            'name': o.fieldname,
//            'id': o.labalFor
//            }).val(o.data));
//
//        tr.addClass(o.className);
//        if (!o.drawData) {
//            tr.addClass(o.status);
//        }
//        label.append($('<label>').attr('for', o.labalFor).text(o.labeltext));
//        this.append(tr.append(label, td));
//    }


    function addAddrb(fields, name) {
        var fieldArray = addrBlock.split(","),
            nameBlock = name.slice(0, -6);
        ext.point("io.ox/contacts/edit/form/contact-" + nameBlock + "-address").extend({
            index: 100,
            id: 'contact-home-block',
            draw: function (data, id) {
                for (var i = 0, len = fieldArray.length; i < len; ++i) {
                    var inline = fieldArray[i].split("/"),
                        tr = $('<tr>'),
                        label = $('<td>').addClass('label').css({
                            'padding-top': '7px',
                            'width': '150px'
                        }),
                        td = $('<td>'),
                        now = _.now(),
                        fieldname, fieldname2, labeltext, labeltext2;
                    if (inline[1]) {
                        fieldname = inline[0] + '_' + nameBlock;
                        fieldname2 = inline[1] + '_' + nameBlock;
                        labeltext = formFields[name].fields[fieldname].label;
                        labeltext2 = formFields[name].fields[fieldname2].label;
                        var input1 = $('<input>').attr({
                            'name': fieldname,
                            'id': fieldname + '_' + now})
                        .addClass('nice-input').val(data[inline[0] + '_' + nameBlock])
                        .css({
                            'font-size': '14px',
                            'width': '100px',
                            'padding-top': '0.25em',
                            'padding-bottom': '0.25em'
                        }),
                            input2 = $('<input>').attr({
                                'name': fieldname2,
                                'id': fieldname2 + '_' + now
                            })
                            .addClass('nice-input').val(data[inline[1] + '_' + nameBlock])
                            .css({
                                'font-size': '14px',
                                'width': '177px',
                                'padding-top': '0.25em',
                                'padding-bottom': '0.25em',
                                'margin-left': '0.5em'
                            }),
                            labelData1 = $('<label>').attr('for', fieldname + '_' + now).text(labeltext),
                            labelData2 = $('<label>').attr('for', fieldname2 + '_' + now).text(labeltext2);
                        label.append(labelData1, labelData2);
                        td.css('padding-bottom', '0.5em').append(input1, input2);
                        tr.addClass(formFields[name].fields[fieldname].blockid);
                        if (!data[inline[0] + '_' + nameBlock]) {
                            tr.addClass(formFields[name].fields[fieldname2].fn);
                        }
                        this.append(tr.append(label, td));
                    } else {
                        fieldname = fieldArray[i] + '_' + nameBlock;
                        labeltext = formFields[name].fields[fieldname].label;
                        var drawData = data[fieldArray[i] + '_' + nameBlock],
                            rowClassStatus = formFields[name].fields[fieldname].fn,
                            rowClass = formFields[name].fields[fieldname].blockid + ' ' + fieldname,
                            labalFor = fieldname + '_' + now;



                        td.addClass('value').css('padding-bottom', '0.5em')
                        .append($('<input>').addClass('nice-input').css({
                            'font-size': '14px',
                            'width': '300px',
                            'padding-top': '0.25em',
                            'padding-bottom': '0.25em'
                        }).attr({
                            'name': fieldname,
                            'id': labalFor
                            }).val(drawData));

                        tr.addClass(rowClass);
                        if (!drawData) {
                            tr.addClass(rowClassStatus);
                        }
                        label.append($('<label>').attr('for', labalFor).text(labeltext));
                        this.append(tr.append(label, td));


//                        drawSingleFieldAdd({
//                            data: drawData,
//                            status: rowClassStatus,
//                            className: rowClass,
//                            labelFor: labalFor,
//                            name: fieldname,
//                            label: labeltext
//
//                        });
                    }
                }
            }
        });
    }

    function loopformblocks(formBlock) {
        for (var i in formBlock.fields) {
            createfields(formBlock.fields[i]);
        }
    }

    function loopformfields(formFields) {
        var formBlocks;
        for (var i in formFields) {
            if (/^(homeFields|businessFields|otherFields)$/.test(i)) {
                formBlocks = formFields[i];
                addAddrb(formBlocks, i);
            } else {
                formBlocks = formFields[i];
                loopformblocks(formBlocks);
            }
        }
    }



//    function loopfieldform(formFields) {
//        for (var i in fieldobj.fields) {
//            createfields(fieldobj.fields[i]);
//        }
//    }

    loopformfields(formFields);

    // head
    ext.point("io.ox/contacts/edit/form").extend({
        index: 100,
        id: "contact-head",
        draw: function (data) {
            var node = $("<tr>").appendTo(this);
            ext.point("io.ox/contacts/edit/form/head").invoke("draw", node, data);
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form/head").extend({
        index: 100,
        id: 'contact-picture',
        draw: function (data) {
            var node = $('<td>');
            ext.point("io.ox/contacts/edit/form/head/button").invoke("draw", node, data);
            this.append(
                $('<td>')
                .css({ verticalAlign: "top", paddingBottom: "0" })
                .append(
                    api.getPicture(data).addClass("picture")

                )
                .append(
                    $('<a>', { href: '#' }).addClass('change-pic-link')
                    .text('change picture')
                )
                .on('click', function (e) {
                    e.preventDefault();
                    var status = $('tr.contact-image.hidden');
                    if (status[0]) {
                        $('tr.contact-image').removeClass('hidden');
                        $('.change-pic-link').remove();
                    } else {
                        $('tr.contact-image').addClass('hidden');
                    }

                })
            )
            .append(
                $(node)
                .css({ verticalAlign: "top" })
                .append(
                    $("<div>")
                    .addClass("name clear-title")
                    .text(util.getFullName(data))
                )
                .append(
                    $("<div>")
                    .addClass("job clear-title")
                    .text(util.getJob(data)
                    )
                )
            );
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 100,
        id: 'contact-image',
        draw: function (data) {
            var id = 'contact-image',
                form = $('<form>',
                    {   'accept-charset': 'UTF-8',
                        'enctype': 'multipart/form-data',
                        'id': 'contactUploadImage',
                        'method': 'POST',
                        'name': 'contactUploadImage',
                        'target': 'blank.html'
                    })
                    .append(
                        $.labelize(
                            $('<input>', { name: 'file', type: 'file' }),
                            'contact_image_upload'
                        )
                    )
                    .append(
                        $('<iframe/>',
                        {   'name': 'hiddenframePicture',
                            'src': 'blank.html'
                        })
                        .css('display', 'none')
                    );
            var td = $('<td>').append(form);
            this.append($('<tr>').addClass(id + ' hidden').append($('<td>'), td));
        }
    });

    function updateContact(data, form) {

        var changes = {}, id, value;
        for (id in form) {
            value = $.trim(form[id]);
            if (value !== '' && value !== data[id]) {
                changes[id] = value;
            } else if (value === '' && data[id] !== undefined && data[id] !== '') {
                changes[id] = /^email[123]$/.test(id) ? null : '';
            }
        }

        //console.warn('changes', changes);

        return api.edit({
            id: data.id,
            folder: data.folder_id,
            timestamp: _.now(),
            data: changes
        });
    }

    ext.point("io.ox/contacts/edit/form/head/button").extend({
        index: 200,
        id: "inline-actions",
        draw: function (data) {
//            var buttonCancel = $('<a>').attr({
//                'href': '#',
//                'class': 'button default-action cancelbutton'
//            }).text('cancel').on('click', {app: app}, function (event) {
//                event.data.app.quit();
//            });
            var buttonSave = $('<a>').attr({
                'href': '#',
                'class': 'button default-action savebutton',
                'data-action': 'save'
            }).text('Save').on('click', {app: app}, function (event) {
                event.preventDefault();
                var formdata = {},
                    formFrame = $('.abs'),
                    image = formFrame.find("input[type=file]").get(0);

                formFrame.find('input').each(function (index) {
                    var value =  $(this).val(),
                       id = $(this).attr('name');
                    formdata[id] = value;
                });

                   // collect anniversary
                formFrame.find('.value input[name="anniversary"]')
                    .each(function (index) {
                        var value =  $(this).val(),
                            id = $(this).attr('name'),
                            dateArray = value.split('.');
                        var date =  Date.UTC(dateArray[2], (--dateArray[1]), (dateArray[0]));
                        if (value !== "") {
                            formdata[id] = date;
                        }
                    });

                   // collect birthday
                formFrame.find('.value input[name="birthday"]')
                .each(function (index) {
                    var value =  $(this).val(),
                        id = $(this).attr('name'),
                        dateArray = value.split('.'),
                        date =  Date.UTC(dateArray[2], (--dateArray[1]), (dateArray[0]));
                    if (value !== "") {
                        formdata[id] = date;
                    }
                });

                var timestamp = new Date().getTime();

                if (image.files && image.files[0]) {
                    formdata.folderId = data.folder_id;
                    formdata.id = data.id;
                    formdata.timestamp = timestamp;
                    api.editNewImage(JSON.stringify(formdata), image.files[0]);
                    event.data.app.quit();
                } else {
                    updateContact(data, formdata).done(function () {
                        event.data.app.quit();
                    });
                }
            });
            this.append($('<div>').append(buttonSave));
//            var td = $('<td>', { colspan: '2' }).append(buttonCancel, buttonSave);
//            this.append($('<tr>').append(td));
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-personal',
        draw: function (data) {
            var id = 'contact-personal';
            addBlockheader(this, id, 'Contact personal');
            ext.point("io.ox/contacts/edit/form/contact-personal").invoke("draw", this, data);
//            var date = new Date(data.birthday);
//            if (!isNaN(date.getDate())) {
//                addField({
//                    label: gt("Birthday"),
//                    name: 'birthday',
//                    value: date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(),
//                    node: this,
//                    id: id
//                });
//            }
            addSwitch(this, id, 'Personal information');
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-email',
        draw: function (data) {
            var id = 'contact-email';
            addBlockheader(this, id, 'Mail');
            ext.point("io.ox/contacts/edit/form/contact-email").invoke("draw", this, data);
            addSwitch(this, id, 'E-Mail addresses');
            addSpacer(this);
        }
    });





    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-phone',
        draw: function (data) {
            var id = 'contact-phone';
            addBlockheader(this, id, 'Phone');
            ext.point("io.ox/contacts/edit/form/contact-phone").invoke("draw", this, data);
            addSwitch(this, id, 'Phone numbers');
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-home-address',
        draw: function (data) {
            var id = 'contact-home-address';
            addBlockheader(this, id, 'Home address');
            ext.point("io.ox/contacts/edit/form/contact-home-address").invoke("draw", this, data);
            addSwitch(this, id, 'Home address');
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-other-address',
        draw: function (data) {
            var id = 'contact-other-address';
            addBlockheader(this, id, 'Other address');
            ext.point("io.ox/contacts/edit/form/contact-other-address").invoke("draw", this, data);
            addSwitch(this, id, 'Other address');
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-work-address',
        draw: function (data) {
            var id = 'contact-work-address';
            addBlockheader(this, id, 'Work address');
            ext.point("io.ox/contacts/edit/form/contact-business-address").invoke("draw", this, data);
            addSwitch(this, id, 'Work address');
            addSpacer(this);
        }
    });

    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'contact-job-descriptions',
        draw: function (data) {
            var id = 'contact-job-descriptions';
            addBlockheader(this, id, 'Job');
            ext.point("io.ox/contacts/edit/form/contact-job-descriptions").invoke("draw", this, data);
            addSwitch(this, id, 'Job information');
            addSpacer(this);
        }
    });

//    ext.point("io.ox/contacts/edit/form").extend({
//        index: 120,
//        id: 'connect',
//        draw: function (data) {
//            var id = 'connect';
//
//
//            addSwitch(this, id);
//            addSpacer(this);
//        }
//    });


    ext.point("io.ox/contacts/edit/form").extend({
        index: 120,
        id: 'special-information',
        draw: function (data) {
            var id = 'special-information';
            addBlockheader(this, id, 'Special');
            ext.point("io.ox/contacts/edit/form/special-information").invoke("draw", this, data);
            addSwitch(this, id, 'Special information');
            addSpacer(this);
        }
    });





    ext.point("io.ox/contacts/edit/form").extend({
        index: 200,
        id: 'bottom-line',
        draw: function (data) {
            var node = $('<td>', { colspan: '2' });
            ext.point("io.ox/contacts/edit/form/head/button").invoke("draw", node, data);
            this.append($('<tr>').append(node));
        }
    });



    return {
        draw: function (data, appdata) {
            app = appdata;
            var node;
            if (!data) {
                node = $();
            } else {
                node = $("<table>", { border: 0, cellpadding: 0, cellspacing: 0 })
                    .addClass("contact-detail edit")
                    .attr('data-obj-id', data.folder_id + '.' + data.id);
                ext.point("io.ox/contacts/edit/form").invoke("draw", node, data);
            }
            return node;
        }
    };
});
