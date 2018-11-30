/**
 * This work is provided under the terms of the CREATIVE COMMONS PUBLIC
 * LICENSE. This work is protected by copyright and/or other applicable
 * law. Any use of the work other than as authorized under this license
 * or copyright law is prohibited.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * © 2017 OX Software GmbH, Germany. info@open-xchange.com
 *
 * @author David Bauer <david.bauer@open-xchange.com>
 */

define('io.ox/core/settings/util', ['io.ox/backbone/mini-views/common'], function (miniViews) {

    'use strict';

    var that = {

        header: function (text) {
            return $('<h1>').text(text);
        },

        checkbox: function (id, label, model) {
            if (model.isConfigurable && !model.isConfigurable(id)) return $();
            return new miniViews.CustomCheckboxView({ name: id, model: model, label: label }).render().$el;
        },

        switchView: function (id, label, model) {
            if (model.isConfigurable && !model.isConfigurable(id)) return $();
            return new miniViews.SwitchView({ name: id, model: model, label: label }).render().$el;
        },

        select: function (id, label, model, options, View) {
            var SelectView = View ? View : miniViews.SelectView;
            var guid = _.uniqueId('form-control-label-');
            return [
                $('<label class="control-label col-sm-4">').attr('for', guid).text(label),
                $('<div class="col-sm-6">').append(
                    new SelectView({
                        list: options,
                        name: id,
                        model: model,
                        id: guid,
                        className: 'form-control'
                    }).render().$el
                )
            ];
        },

        compactSelect: function (name, label, model, list, options) {
            if (model.isConfigurable && !model.isConfigurable(name)) return $();
            options = options || {};
            var id = 'settings-' + name;
            return $('<div class="form-group row">').append(
                $('<div>').addClass('col-md-' + (options.width || 6)).append(
                    $('<label>').attr('for', id).text(label),
                    new miniViews.SelectView({ id: id, name: name, model: model, list: list, integer: !!options.integer, groups: !!options.groups }).render().$el
                )
            );
        },

        fieldset: function (text) {
            var args = _(arguments).toArray();
            return $('<fieldset>').append($('<legend class="sectiontitle">').append($('<h2>').text(text))).append(args.slice(1));
        },

        input: function (id, label, model, description) {
            var guid = _.uniqueId('form-control-label-'),
                attributes = description ? { 'aria-describedby': _.uniqueId('form-control-description_') } : {};
            return [
                $('<label>').attr('for', guid).text(label),
                new miniViews.InputView({ name: id, model: model, className: 'form-control', id: guid, attributes: attributes }).render().$el,
                description ? $('<div class="help-block">').text(description).prop('id', attributes['aria-describedby']) : $()
            ];
        },

        textarea: function (id, label, model, description) {
            var guid = _.uniqueId('form-control-label-'),
                attributes = description ? { 'aria-describedby': _.uniqueId('form-control-description_') } : {};
            return $('<div class="form-group row">').append(
                $('<div>').addClass('col-md-6').append(
                    $('<label>').attr('for', guid).text(label),
                    new miniViews.TextView({ name: id, model: model, className: 'form-control', id: guid, rows: 3, attributes: attributes }).render().$el,
                    description ? $('<div class="help-block">').text(description).prop('id', attributes['aria-describedby']) : $()
                )
            );
        }
    };

    return that;
});
