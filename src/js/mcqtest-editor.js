/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: MCQ Single Choice Quesion engine
 * Description: A HTML5 activity template for a MCQ Single Choice type activity.
 *  
 * Interfaces / Modes :->
 * 
 *  1. Supports Standard ENGINE-SHELL interface
 *      {
 *          init(),
 *          getStatus(),
 *          getConfig()
 *      }
 * 
 * ENGINE - SHELL interface : ->
 *
 * This engine assume that a module "shell.js" loads first, and establishes interface with the platform. The shell in
 * turn instantiates [ engine.init() ] this engine with necessary configuration paramters and a reference to platform Adapter
 * object which allows subsequent communuication with the platform.
 *
 * SHELL calls engine.getStatus() to check if SUBMIT has been pressed or not - the response from the engine is 
 * used to enable / disable LMS controls.
 *
 * SHELL calls engine.getConfig() to request SIZE information - the response from the engine is 
 * used to resize the container iframe.
 *
 *
 * EXTERNAL JS DEPENDENCIES : ->
 * Following are shared/common dependencies (specified in index.html), and assumed to loaded via the platform)
 * 1. JQuery
 * 2. Handlebars
 * 3. LMS Adapter
 * 4. Utils (for activity resize etc.)
 * 5. SHELL
 *
 *
 */

define(['text!../html/mcqtest-editor.html','css!../css/mcqtest-editor.css','rivets','sightglass'], function (mcqTemplateRef) {

    mcqtestEditor = function() {
    "use strict";
        
    /*
     * Reference to platform's activity adaptor (initialized during init() ).
     */
    var activityAdaptor;     
    
    /*
     * Internal Engine Config.
     */ 
    var __config = {
        MAX_RETRIES: 10, /* Maximum number of retries for sending results to platform for a particular activity. */ 
        RESIZE_MODE: "auto", /* Possible values - "manual"/"auto". Default value is "auto". */
        RESIZE_HEIGHT: "580" /* Applicable, if RESIZE_MODE is manual. If RESIZE_HEIGHT is defined in TOC then that will overrides. */
        /* If both config RESIZE_HEIGHT and TOC RESIZE_HEIGHT are not defined then RESIZE_MODE is set to "auto"*/
    };
    
    /*
     * Internal Engine State.
     */ 
    var __state = {
        currentTries: 0, /* Current try of sending results to platform */
        activityPariallySubmitted: false, /* State whether activity has been partially submitted. Possible Values: true/false(Boolean) */
        activitySubmitted: false, /* State whether activity has been submitted. Possible Values: true/false(Boolean) */
        radioButtonClicked: false /* State whether radio button is clicked.  Possible Values: true/false(Boolean) */   
    };  
    
    /*
     * Content (loaded / initialized during init() ).
     */ 
    var __content = {
        directionsXML: "",
        questionsXML: [], /* Contains the question obtained from content XML. */
        optionsXML: [], /* Contains all the options for a particular question obtained from content XML. */
        answersXML: [], /* Contains the answer for a particular question obtained from content XML. */
        userAnswersXML: [], /* Contains the user answer for a particular question. */
        activityType: null  /* Type of FIB activity. Possible Values :- FIBPassage.  */    
    };

    /*
     * Constants.
     */
    var __constants = {
        /* CONSTANT for HTML selectors */ 
        DOM_SEL_ACTIVITY_BODY: ".activity-body",
        
        /* CONSTANT for identifier in which Adaptor Instance will be stored */
        ADAPTOR_INSTANCE_IDENTIFIER: "data-objectid",
        
        /* CONSTANT for PLATFORM Save Status NO ERROR */
        STATUS_NOERROR: "NO_ERROR",

        /* CONSTANT to end test. */
        END_TEST: false,
        
        TEMPLATES: {
            /* Regular MCQ Layout */
            MCQTEST_EDITOR: mcqTemplateRef
        }
    };
    
    var processedJsonContent;

        
    /********************************************************/
    /*                  ENGINE-SHELL INIT FUNCTION
        
        "elRoot" :->        DOM Element reference where the engine should paint itself.                                                     
        "params" :->        Startup params passed by platform. Include the following sets of parameters:
                        (a) State (Initial launch / Resume / Gradebook mode ).
                        (b) TOC parameters (videoRoot, contentFile, keyframe, layout, etc.).
        "adaptor" :->        An adaptor interface for communication with platform (__saveResults, closeActivity, savePartialResults, getLastResults, etc.).
        "htmlLayout" :->    Activity HTML layout (as defined in the TOC LINK paramter). 
        "jsonContent" :->    Activity JSON content (as defined in the TOC LINK paramter).
        "callback" :->      To inform the shell that init is complete.
    */
    /********************************************************/  
    function init(elRoot, params, adaptor, htmlLayout, jsonContentObj, callback) {        

        /* ---------------------- BEGIN OF INIT ---------------------------------*/
        var jsonContent = jQuery.extend(true, {}, jsonContentObj);
        activityAdaptor = adaptor;
        
        var isContentValid = true;

        /* ------ VALIDATION BLOCK START -------- */    
        if (jsonContent.content === undefined) {
            isContentValid = false;
        }
        if(!isContentValid) {
            /* Inform the shell that init is complete */
            if(callback) {
                callback();
            }           
            return; /* -- EXITING --*/
        } 
        /* ------ VALIDATION BLOCK END -------- */        
        

        /* Parse and update content JSON. */
        processedJsonContent = __parseAndUpdateJSONContent(jsonContent, params);
         
        var processedHTML = __constants.TEMPLATES[htmlLayout];
        /* Apply the content JSON to the htmllayout */
        //var processedHTML = __processLayoutWithContent(__constants.TEMPLATES[htmlLayout], processedJsonContent);
        processedHTML = processedHTML.replace(/&lt;/g,"<");
        processedHTML = processedHTML.replace(/&gt;/g,">");

        /* Update the DOM and render the processed HTML - main body of the activity */      
        $(elRoot).html(processedHTML);
        
      /*  rivets.formatters.propertyList = {
          read: function(obj) {
            var properties = []
            for (var key in obj) {
              properties.push({key: key, value: obj[key]})
            }
            return properties
          },
          publish: function(obj) {
            console.log(obj)
            return obj;
          }
        }*/

        rivets.formatters.args = function(fn){
          var args = Array.prototype.slice.call(arguments, 1);
          return function()  {
            return fn.apply(this, Array.prototype.concat.call(arguments, args))
          }
        }


        var processedObj = {};
        var processedArray = [];
        var quesEdited = {};
        quesEdited.isEditing = false;

        processedJsonContent.content.interactions.i1.MCQTEST.forEach(function(obj, index){
            processedObj= {};
            Object.keys(obj).forEach(function(key){
                processedObj.key = key;
                processedObj.value = obj[key];
                processedObj.isEdited = false;
                if(processedJsonContent.responses.i1.correct == processedObj.key){
                    processedObj.isCorrect = processedObj.value;
                }
            });
            processedArray.push(processedObj);
        });
        processedJsonContent.content.interactions.i1.MCQTEST = processedArray;
        console.log(processedArray)
        rivets.bind($('#mcq-editor'), {content: processedJsonContent, toggleEditing: toggleEditing, toggleQuestionTextEditing: toggleQuestionTextEditing, quesEdited: quesEdited});

        $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());            
        $('.q1').keydown(function(){
            console.log(processedJsonContent);
        })
        /* ---------------------- SETUP EVENTHANDLER STARTS----------------------------*/
             
        $('.editor .radio input:radio').change(__handleRadioButtonClick);

        $('.option-value').keydown(function(){
            console.log(processedJsonContent)
        })

        function toggleQuestionTextEditing(event, element){
            element.isEditing = !element.isEditing;
        }

        function toggleEditing(event, element){
            element.isEdited = !element.isEdited;
        }
        /* ---------------------- SETUP EVENTHANDLER ENDS------------------------------*/

        /* Inform the shell that init is complete */
        if(callback) {
            callback();
        }                               
        
        /* ---------------------- END OF INIT ---------------------------------*/
    } /* init() Ends. */        
    
    /**
     * ENGINE-SHELL Interface
     *
     * Return configuration
     */
    function getConfig () {
        return __config;
    }
    
    /**
     * ENGINE-SHELL Interface
     *
     * Return the current state (Activity Submitted/ Partial Save State.) of activity.
     */
    function getStatus() {
        return __state.activitySubmitted || __state.activityPariallySubmitted;
    }
    /*
     * -------------------
     * DOM EVENT HANDLERS                      
     * -------------------
     */

    
    /**
    * Function to handle radio button click.
    */
    function __handleRadioButtonClick(event){
        /*
         * Soft save here
         */
         console.log("called")
        var currentTarget = event.currentTarget;
        var quesIndex = 0;
        
        $("label.radio").parent().removeClass("highlight");
        $(currentTarget).parent().parent("li").addClass("highlight");  
        
        var newAnswer = currentTarget.value.replace(/^\s+|\s+$/g, '');
            
        /* Save new Answer in memory. */
        __content.userAnswersXML[quesIndex] = newAnswer.replace(/^\s+|\s+$/g, '');  
        
        __state.radioButtonClicked = true;
        
        var interactionId = __content.questionsXML[0].split("^^")[2].trim();
        processedJsonContent.responses.i1.correct = $(currentTarget).attr('key');
    }    
    
    /**
     * Function to process HandleBars template with JSON.
     */
    function __processLayoutWithContent(layoutHTML, contentJSON) {
        /* Compiling Template Using Handlebars. */
        var compiledTemplate = Handlebars.compile(layoutHTML);

        /*Compiling HTML from Template. */
        var compiledHTML = compiledTemplate(contentJSON);
        return compiledHTML;
    }
    
    /**
     * Parse and Update JSON based on MCQSC specific requirements.
     */
    function __parseAndUpdateJSONContent(jsonContent, params) { 
        jsonContent.content.displaySubmit = activityAdaptor.displaySubmit;   
        
        __content.activityType = params.engineType;
            
        /* Activity Instructions. */
        var tagName = jsonContent.content.instructions[0].tag;
        __content.directionsXML = jsonContent.content.instructions[0][tagName];
        /* Put directions in JSON. */
        jsonContent.content.directions = __content.directionsXML;

        __parseAndUpdateQuestionSetTypeJSON(jsonContent);
        
        /* Returning processed JSON. */
        return jsonContent; 
    }

    
    /**
     * Parse and Update Question Set type JSON based on  MCQSC specific requirements.
     */  
    function __parseAndUpdateQuestionSetTypeJSON(jsonContent) {

        /* Extract interaction id's and tags from question text. */
        var interactionId = "";
        var interactionTag = "";
        /* String present in href of interaction tag. */
        var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/mcqsc";
        /* Parse questiontext as HTML to get HTML tags. */
        var parsedQuestionArray = $.parseHTML(jsonContent.content.canvas.data.questiondata[0].text);
        $.each( parsedQuestionArray, function(i, el) {
          if(this.href === interactionReferenceString) {
            interactionId = this.childNodes[0].nodeValue.trim();
            interactionTag = this.outerHTML;
            interactionTag = interactionTag.replace(/"/g, "'");
          }
        });
        /* Replace interaction tag with blank string. */
        jsonContent.content.canvas.data.questiondata[0].text = jsonContent.content.canvas.data.questiondata[0].text.replace(interactionTag,"");
        var questionText = "1.  " + jsonContent.content.canvas.data.questiondata[0].text;
        var correctAnswerNumber = jsonContent.responses[interactionId].correct;
        var interactionType = jsonContent.content.interactions[interactionId].type;
        var optionCount = jsonContent.content.interactions[interactionId][interactionType].length;

        /* Make optionsXML and answerXML from JSON. */
        for(var i = 0; i < optionCount; i++) {
            var optionObject = jsonContent.content.interactions[interactionId][interactionType][i];
            var option = optionObject[Object.keys(optionObject)].replace(/^\s+|\s+$/g, '');
            __content.optionsXML.push(__getHTMLEscapeValue(option));
            optionObject[Object.keys(optionObject)] = option;
            /* Update JSON after updating option. */
            jsonContent.content.interactions[interactionId][interactionType][i] = optionObject;
            if(Object.keys(optionObject) == correctAnswerNumber) {
                __content.answersXML[0] = optionObject[Object.keys(optionObject)];
            }
        }
        __content.questionsXML[0] = questionText + " ^^ " + __content.optionsXML.toString() + " ^^ " + interactionId;       
    }
    
    /**
     * Escaping HTML codes from String.
     */
    function __getHTMLEscapeValue(content) {  
        var tempDiv = $("<div></div>");
        $(tempDiv).html(content);
        $("body").append(tempDiv);
        content  = $(tempDiv).html();
        $(tempDiv).remove();    
        return content;
    }       
    
    return {
        /*Engine-Shell Interface*/
        "init": init, /* Shell requests the engine intialized and render itself. */
        "getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
        "getConfig" : getConfig /* Shell requests a engines config settings.  */
    };
    };
});