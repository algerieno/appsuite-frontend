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
 * @author Francisco Laguna <francisco.laguna@open-xchange.com>
 */

define("io.ox/linkedIn/view-detail",
    ["io.ox/core/extensions",
     "io.ox/core/lightbox",
     "css!io.ox/linkedIn/style.css"], function (ext, lightbox) {
    
    "use strict";
    
    var actionPoint = ext.point("linkedIn/details/actions");
    var rendererPoint = ext.point("linkedIn/details/renderer");
    
    function todo() {
        alert("TODO");
    }

    function draw(data) {
        
        var $node = $("<div/>").addClass("linkedIn").css({ overflow: "auto" }),
            $detailNode = $("<div/>").addClass("details").appendTo($node),
            $table = $("<table><tr><td class='t10' /><td class='t11' /></td></tr><tr><td class='r2' colspan='2'/></tr><table>").appendTo($detailNode),
            $pictureNode = $table.find(".t10"),
            $nameNode = $table.find(".t11"),
            $relationNode = $table.find(".r2");
        
        $pictureNode.append($("<img/>").attr("src", data.pictureUrl || (ox.base + "/apps/themes/default/dummypicture.xpng")));
        
        $nameNode.append($("<div class='name' />").text(data.firstName + " " + data.lastName));
        $nameNode.append($("<div class='headline' />").text(data.headline));
        
        var $actionsNode = $("<div/>").addClass("actions").appendTo($node);
        actionPoint.each(function (ext) {
            $actionsNode.append($("<a href='#'/>").text(ext.label).click(function () {
                ext.action();
                return false;
            }));
        });
        
        rendererPoint.each(function (ext) {
            $node.append(ext.draw({data: data, win: $node}));
        });
        
        return $node;
    }
    
    // Mock Actions
    actionPoint.extend({
        id: "linkedin/details/connect",
        label: "Connect",
        action: todo,
        index: 100
    });
    
    actionPoint.extend({
        id: "linkedin/details/compose",
        label: "Write a message",
        action: todo,
        index: 200
    });
    
    // Detail renderers
    

    // Past Engagements
    rendererPoint.extend({
        id: "linkein/details/renderer/experience",
        draw: function (options) {
            var data = options.data;
            var win = options.win;
            
            var $myNode = $("<div/>").addClass("pastEngagements extension");
            if (data.positions && data.positions.values && data.positions.values.length !== 0) {
                var pastEngagements = [];
                
                _(data.positions.values).each(function (position) {
                    var $posNode = $("<div/>").addClass("position").appendTo($myNode);
                    if (position.isCurrent) {
                        $posNode.addClass("current");
                    } else {
                        $posNode.hide();
                        pastEngagements.push($posNode);
                    }
                    if (position.startDate && position.startDate.year) {
                        var timeSpentThere = position.startDate.year;
                        if (position.endDate && position.endDate.year) {
                            timeSpentThere += " - " + position.endDate.year;
                        } else if (position.isCurrent) {
                            timeSpentThere += " - Present";
                        }
                        $("<span/>").text(timeSpentThere).appendTo($posNode).addClass("timeSpent");
                    }
                    if (position.title) {
                        $("<span/>").appendTo($posNode).text(position.title).addClass("title");
                    }
                    if (position.company && position.company.name) {
                        $("<div/>").text(position.company.name).appendTo($posNode).addClass("companyName");
                    }
                });
                if (pastEngagements.length !== 0) {
                    var pastEngagementsVisible = false;
                    var $moreToggle = $("<a href='#'/>").text("More...").click(function () {
                        pastEngagementsVisible = !pastEngagementsVisible;
                        if (pastEngagementsVisible) {
                            $moreToggle.text("Show less");
                            _(pastEngagements).invoke("fadeIn", 500);
                            win.animate({scrollTop: _(pastEngagements).first().offset().top - 50}, 500);
                        } else {
                            $moreToggle.text("More...");
                            _(pastEngagements).invoke("fadeOut");
                        }
                    }).appendTo($myNode);
                }
            }
            return $myNode;
        },
        index: 100
    });
    
    rendererPoint.extend({
        id: "linkein/details/renderer/relations",
        draw: function (options) {
            var data = options.data;
            
            var $myNode = $("<div/>").addClass("relations extension");
            if (data.relationToViewer && data.relationToViewer.connections && data.relationToViewer.connections.values && data.relationToViewer.connections.values !== 0) {
                $myNode.append($("<h1/>").text("Connections you share with " + data.firstName + " " + data.lastName));
                _(data.relationToViewer.connections.values).each(function (relation) {
                    if (relation.fullProfile) {
                        var imageUrl = relation.fullProfile && relation.fullProfile.pictureUrl ?
                            relation.fullProfile.pictureUrl : ox.base + "/apps/themes/default/dummypicture.xpng";
                        var $image = $("<img/>")
                            .css("margin", "0 5px 0 0")
                            .attr("src", imageUrl)
                            .attr("alt", relation.fullProfile.firstName + " " + relation.fullProfile.lastName);
                        $myNode.append($image);
                        $image.click(function () {
                            new lightbox.Lightbox({
                                getGhost: function () {
                                    return $image;
                                },
                                buildPage: function () {
                                    return draw(relation.fullProfile);
                                }
                            }).show();
                        });
                    } else {
                        $myNode.append($("<span/>").text(relation.person.firstName + " " + relation.person.lastName));
                    }
                });
            }
            
            return $myNode;
        },
        index: 200
    });
    
    return {
        draw: draw
    };
});
