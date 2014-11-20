"use strict";

/*global document */
/*global $ */
/*global Processing */
/*global Blob */
/*global saveAs */
/*global ace */

/**
 * Singleton for display page
 */
var helloDisplay = {
    processingSource: "",
    editor: null,
    /**
     * Initialize display page
     */
    init: function () {

        // Get the gistID from the URL and display it

        if (document.URL.indexOf('#') >= 0) {
            var sketchID = document.URL.split('#')[1];

            if (sketchID[0] == "@") {
                this.displayGallery(sketchID.substr(1));
            } else {
                this.displayGist(sketchID);
            }
        }

        $("#displayCode").click(function () {
            $('#codeModal').modal('show');

            return false;
        });

        $("#downloadCode").click(function () {

            var blob = new Blob([helloDisplay.processingSource], {type: "text/processing;charset=utf-8"});
            saveAs(blob, "sketch.pde");

            return false;

        });

        // Initialize Editor

        this.editor = ace.edit("displayEditor");
        this.editor.getSession().setMode("ace/mode/processing");
        this.editor.setTheme("ace/theme/processing");
        //this.editor.renderer.setShowGutter(false); 
        this.editor.setShowFoldWidgets(false);
        this.editor.setHighlightActiveLine(false);
        this.editor.renderer.setShowPrintMargin(false);
        this.editor.setReadOnly(true);

    },
    /**
     * Fetch Gist code from GitHub and feed it to Processing.js
     */
    displayGist: function (gistID) {

        var apiURL = "https://api.github.com/gists/",
            gistURL = apiURL + gistID;

        $.ajax({
            'url': gistURL,
            'complete': function (data) {

                var gistFiles = data.responseJSON.files,
                    gistFile = gistFiles[Object.keys(gistFiles)[0]],
                    gistSource = gistFile.content;                    

                helloDisplay.showSketch(gistSource);
            }
        });
    },
    /**
     * Fetch sketch code Parse
     */    
    displayGallery: function (parseID) {    

        Parse.initialize("x8FmMInL8BbVeBqonPzgvS8WNKbPro65Li5DzTI0", "Y7PPNnhLPhCdFMAKgw7amBxGerz67gAnG3UKb53s");

        var GalleryObject = Parse.Object.extend("Gallery");
        var query = new Parse.Query(GalleryObject);
        query.get(parseID, {
          success: function(gallery) {
            helloDisplay.showSketch(gallery.get("source"));
          },
          error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
          }
        });

    },
    /**
     * Feed sourceto Processing.js
     */
    showSketch: function (source) {

        var processingCanvas,
            processingInstance,
            displayHeight,
            displayWidth;

        helloDisplay.processingSource = source;
        helloDisplay.editor.setValue(source, -1);

        try {
            processingCanvas = document.getElementById("displayCanvas");
            processingInstance = new Processing(processingCanvas, source);

            displayHeight = 400;
            displayWidth = (processingInstance.width / processingInstance.height) * displayHeight;

            $("#displayCanvas").css({
                width: displayWidth,
                height: displayHeight
            });

            $("#displayCanvasBox").css({
                width: displayWidth + ($("#displayInfo").outerWidth() + 10),
                height: displayHeight,
                marginTop: displayHeight / -2,
                marginLeft: (displayWidth + $("#displayInfo").outerWidth() + 10) / -2
            });
        } catch (e) {
            console.log("ERROR! " + e.toString());
        }

    }
};
