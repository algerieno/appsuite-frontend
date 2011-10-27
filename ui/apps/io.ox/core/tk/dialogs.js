/**
 * All content on this website (including text, images, source
 * code and any other original works), unless otherwise noted,
 * is licensed under a Creative Commons License.
 *
 * http://creativecommons.org/licenses/by-nc-sa/2.5/
 *
 * Copyright (C) Open-Xchange Inc., 2006-2011
 * Mail: info@open-xchange.com
 *
 * @author Matthias Biggeleben <matthias.biggeleben@open-xchange.com>
 */

define("io.ox/core/tk/dialogs", function () {
    
    'use strict';
    
    // scaffolds
    var underlay = $("<div/>").addClass("abs io-ox-dialog-underlay"),
        popup = $("<div/>").addClass("io-ox-dialog-popup")
            .append(
                $("<div/>").addClass("content")
            )
            .append(
                $("<div/>").addClass("controls")
            );
    
    var Dialog = function (options) {
        
        var nodes = {
                underlay: underlay.clone().hide().appendTo("body"),
                popup: popup.clone().hide().appendTo("body")
            },
            
            deferred = $.Deferred(),
            
            closeViaEscapeKey,
            
            close = function () {
                $(document).unbind("keydown", closeViaEscapeKey);
                nodes.popup.remove();
                nodes.underlay.remove();
                nodes = deferred = null;
            },
            
            process = function (e) {
                deferred.resolve(e.data || e);
                close();
            },
            
            o = _.extend({
                underlayAction: null,
                defaultAction: null,
                easyOut: false
                // width (px), height (px),
                // maxWidth (px), maxHeight (px)
            }, options);
            
        this.text = function (str) {
            var p = nodes.popup.find(".content");
            p.find(".plain-text").remove();
            p.append($("<div>").addClass("plain-text").text(str || ""));
            return this;
        };
        
        this.append = function (node) {
            nodes.popup.find(".content").append(node);
            return this;
        };
        
        this.addButton = function (action, label) {
            nodes.popup.find(".controls").append(
                $.button({
                    label: label,
                    data: action,
                    click: process
                })
            );
            return this;
        };
        
        closeViaEscapeKey = function (e) {
            if (e.which === 27) {
                process("cancel");
            }
        };
        
        this.show = function () {
            
            var dim = {
                width: o.width || nodes.popup.width(),
                height: o.height || nodes.popup.height()
            };
            
            // limit width & height
            _(["width", "height"]).each(function (d) {
                // apply explicit limit
                var id = o[$.camelCase("max-" + d)];
                if (o[id] && dim[d] > o[id]) {
                    dim[d] = o[id];
                }
                // apply document limits
                var max = $(document)[d]() - 100;
                if (dim[d] && dim[d] > max) {
                    dim[d] = max;
                }
            });
            
            // apply dimensions
            nodes.popup.css({
                width: dim.width + "px",
                height: dim.height + "px",
                marginTop: 0 - ((dim.height + 60) / 2 >> 0) + "px"
            });
            
            nodes.underlay.show();
            nodes.popup.show();
            
            // fix content height in case async requests draw later
            var h1 = nodes.popup.height(),
                h2 = nodes.popup.find(".controls").outerHeight(true);
            nodes.popup.find(".content").css("height", (h1 - h2) + "px");
            
            if (o.easyOut) {
                $(document).bind("keydown", closeViaEscapeKey);
            }
            
            return deferred;
        };
        
        nodes.underlay.click(function () {
            if (o.underlayAction) {
                process(o.underlayAction);
            } else if (o.easyOut) {
                process("cancel");
            }
        });
        
        nodes.popup.click(function () {
            if (o.defaultAction) {
                process(o.defaultAction);
            }
        });
        
        this.setUnderlayAction = function (action) {
            o.underlayAction = action;
            return this;
        };
        
        this.setDefaultAction = function (action) {
            o.defaultAction = action;
            return this;
        };
        
        this.lightbox = function () {
            o.underlayAction = "close";
            o.defaultAction = "close";
            return this;
        };
    };
    
    var SidePopup = function (width) {
        
        var processEvent,
            isProcessed,
            open,
            close,
            closeByEscapeKey,
            closeByScroll,
            closeByClick,
            timer = null,
            
            pane = $("<div>")
                .addClass("io-ox-sidepopup-pane default-content-padding abs"),
            popup = $("<div>")
                .addClass("io-ox-sidepopup abs")
                .append(pane)
                .bind("click", function (e) {
                    processEvent(e);
                }),
            arrow = $("<div>")
                .addClass("io-ox-sidepopup-arrow")
                .append($("<div>").addClass("border"))
                .append($("<div>").addClass("triangle")),
            
            self = this;
        
        // public nodes
        this.nodes = {};
        this.lastTrigger = null;
        
        processEvent = function (e) {
            e.preventDefault();
        };
        
        isProcessed = function (e) {
            return e.isDefaultPrevented();
        };
        
        closeByEscapeKey = function (e) {
            if (e.which === 27) {
                close(e);
            }
        };
        
        closeByScroll = function (e) {
            close(e);
        };
        
        closeByClick = function (e) {
            if (!isProcessed(e)) {
                processEvent(e);
                close(e);
            }
        };
        
        close = function (e) {
            // remove handlers & avoid leaks
            $(document).unbind("keydown", closeByEscapeKey);
            self.nodes.closest.unbind("scroll", closeByScroll);
            self.nodes.click.unbind("click", closeByClick);
            self.lastTrigger = null;
            // use time to avoid flicker
            timer = setTimeout(function () {
                arrow.detach();
                pane.empty();
                popup.detach();
            }, 100);
        };
        
        open = function (e, handler) {
            // get proper elements
            var my = $(this), current, zIndex, sidepopup;
            self.nodes = {
                closest: my.parents(".io-ox-sidepopup-pane, .window-content"),
                click: my.parents(".io-ox-sidepopup-pane, .window-body"),
                target: my.parents(".window-body")
            };
            // get active side popup & triggering element
            sidepopup = self.nodes.closest.prop("sidepopup") || null;
            self.lastTrigger = sidepopup ? sidepopup.lastTrigger : null;
            // get zIndex for visual stacking
            zIndex = (my.parents(".io-ox-sidepopup, .window-content").css("zIndex") || 1) + 2;
            // second click?
            if (self.lastTrigger === this) {
                close(e);
            } else {
                
                // open siblings?
                if (sidepopup) {
                    sidepopup.close();
                }
                
                // remember as current trigger
                self.lastTrigger = this;
                self.nodes.closest.prop("sidepopup", self);
                
                // prevent default to avoid close
                processEvent(e);
                // clear timer
                clearTimeout(timer);
                
                // add handlers to close popup
                self.nodes.click.bind("click", closeByClick);
                self.nodes.closest.bind("scroll", closeByScroll);
                $(document).bind("keydown", closeByEscapeKey);
                
                // decide for proper side
                var docWidth = $(document).width(),
                    max = docWidth * 0.45 >> 0,
                    distance, mode, direction, pos,
                    parentPopup = my.parents(".io-ox-sidepopup").first();
                    
                if (parentPopup.length) {
                    mode = parentPopup.hasClass("right") ? "left" : "right";
                } else {
                    distance = my.offset().left + my.outerWidth() - (docWidth / 2 >> 0);
                    mode = distance < 0 ? "right" : "left";
                }
                
                direction = mode === "right" ? "left" : "right";
                pos = mode === "right" ?
                        Math.max(max, Math.max(width || 0, my.offset().left + my.outerWidth() + 25)) :
                        Math.max(max, docWidth - Math.max(width || 0, my.offset().left + 25));
                        
                
                //pane.css("maxWidth", max + "px");
                
                popup.removeClass("left right")
                    .addClass(mode)
                    .css(direction, pos + "px")
                    .css("zIndex", zIndex);
                
                arrow.removeClass("left right")
                    .addClass(mode)
                    .css(direction, pos + "px")
                    .css("zIndex", zIndex + 1);
                
                // call custom handler
                (handler || $.noop).call(this, pane.empty(), e);
                
                // set arrow top
                var halfHeight = (my.outerHeight(true) / 2 >> 0),
                    top = my.offset().top + halfHeight - self.nodes.target.offset().top;
                arrow.css("top", top);
                
                // finally, add popup to proper element
                self.nodes.target.append(popup).append(arrow);
            }
        };
        
        this.delegate = function (node, selector, handler) {
            $(node).delegate(selector, "click", function (e) {
                open.call(this, e, handler);
            });
            return this;
        };
        
        this.show = function (e, handler) {
            open.call(e.target, e, handler);
            return this;
        };
        
        this.close = function (e) {
            close(e);
        };
    };
    
    //TODO: Less C&P
    var pane = $('<div/>').addClass('abs io-ox-dialog-pane').append(
        $("<div/>").addClass("content")
    )
    .append(
        $("<div/>").addClass("controls")
    );

    
    var SlidingPane = function () {
        var self = this;
        var nodes = {
            pane: pane.clone().hide().appendTo('body'),
            relativeTo: null
        };
        
        nodes.content = nodes.pane.find('.content');
        nodes.controls = nodes.pane.find('.controls');
        
        this.visible = false;
        
        var deferred = $.Deferred(),
        
        close = function () {
            self.visible = false;
            nodes.pane.fadeOut();
        },
        
        process = function (e) {
            deferred.resolve(e.data);
            close();
        };
        
        this.text = function (str) {
            nodes.content.text(str || "");
            return this;
        };
        
        this.append = function (node) {
            nodes.content.append(node);
            return this;
        };
        
        this.addButton = function (action, label) {
            nodes.controls.append(
                $.button({
                    label: label,
                    data: action,
                    click: process
                })
            );
            return this;
        };
        
        this.relativeTo = function (node) {
            nodes.relativeTo = $(node);
            return this;
        };
        
        this.toggle = function () {
            if (this.visible) {
                process("toggeled");
            } else {
                this.show();
            }
        };
        
        this.show = function () {
            this.visible = true;
            var offset, top, left, height, width, windowHeight, windowWidth;
            
            windowHeight = $(window).height();
            windowWidth = $(window).width();
            
            // Force Rendering for shrink-to-fit size detection
            // There has to be a cleverer way to do this
            var oldOpacity = nodes.pane.css("opacity");
            nodes.pane.css("opacity", "0.001");
            nodes.pane.show();
            
            height = nodes.controls.outerHeight(true) + nodes.content.outerHeight(true) + 2;
            width = Math.max(nodes.controls.outerWidth(true), nodes.content.outerWidth(true)) + 2;
            nodes.pane.hide();
            nodes.pane.css("opacity", oldOpacity);
            
            if (nodes.relativeTo) {
                // Depending on where our anchor element is, position the pane
                offset = nodes.relativeTo.offset();
                // Is the anchor in the upper half?
                if (offset.top < (windowHeight / 2)) {
                    // Yup, so we'll put the pane below the anchor
                    top = offset.top + nodes.relativeTo.outerHeight() + 3;
                } else {
                    // Nope, so we'll put the pane above the anchor
                    top = offset.top - height - 10;
                    if (top < 0) {
                        top = 0;
                    }
                }
                
                // Is the anchor to the left or the right of the center?
                
                if (offset.left < (windowWidth / 2)) {
                    // It's on the left, so we align the left sides
                    left = offset.left;
                } else {
                    // It's on the right, so we align the right sides
                    left = offset.left + nodes.relativeTo.outerWidth() - width;
                }
                
                nodes.pane.css({
                    height: height + "px",
                    width: width + "px",
                    top: top + "px",
                    left: left + "px"
                });
            } else {
                // Hm. Put it in the center. Though, truth be told, this is probably supposed
                // to be a dialog
                nodes.pane.css({
                    height: height + "px",
                    width: width + "px",
                    marginTop: 0 - (height / 2 >> 0) + "px"
                });
            }
            nodes.pane.fadeIn();
            return deferred;
        };
    };
    
    return {
        ModalDialog: Dialog,
        SlidingPane: SlidingPane,
        SidePopup: SidePopup
    };
});

/* Test

require(["io.ox/core/tk/dialogs"], function (dialogs) {
    new dialogs.ModalDialog()
        .text("Are you really sure about your decision? Are you aware of all consequences you have to live with?")
        .addButton("cancel", "No, rather not")
        .addButton("delete", "Shut up and delete it!")
        .show()
        .done(function (action) {
            console.debug("Action", action);
        });
});

*/