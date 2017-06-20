/*
 * -------------
 * Engine Module
 * -------------
 * 
 * Item Type: MCQSR Single Choice Quesion engine
 * Code: MCQSR
 * Interface: ENGINE
 
 *  ENGINE Interface public functions
 *  {
 *          init(),
 *          getStatus(),
 *          getConfig()
 *  }
 * 
 *
 * This engine is designed to be loaded dynamical by other applications (or  platforms). At the starte the function [ engine.init() ] will be called  with necessary configuration paramters and a reference to platform "Adapter"  which allows subsequent communuication with the platform.
 *
 * The function [ engine.getStatus() ] may be called to check if SUBMIT has been pressed or not - the response from the engine is used to enable / disable appropriate platform controls.
 *
 * The function engine.getConfig() is called to request SIZE information - the response from the engine is used to resize & display the container iframe.
 *
 *
 * EXTERNAL JS DEPENDENCIES : ->
 * Following are shared/common dependencies and assumed to loaded via the platform. The engine code can use/reference these as needed
 * 1. JQuery (2.1.1)
 * 2. Boostrap (TODO: version) 
 */

define(['text!../html/mcqsr.html', //HTML layout(s) template (handlebars/rivets) representing the rendering UX
        'text!../html/mcqsr-image-options.html',
        'css!../css/mcqsr.css',  //Custom styles of the engine (applied over bootstrap & front-end-core)
        'rivets',  // Rivets for data binding
        'sightglass'], //Required by Rivets
        function (mcqsrTemplateRef, mcqsrOptionsTemplateRef) {

    mcqsr = function() {
    
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
        directionsJSON: "",
        questionsJSON: [], /* Contains the question obtained from content JSON. */
        optionsJSON: [], /* Contains all the options for a particular question obtained from content JSON. */
        answersJSON: [], /* Contains the answer for a particular question obtained from content JSON. */
        userAnswersJSON: [], /* Contains the user answer for a particular question. */
        feedbackJSON: {}, /* Contains the feedback for question*/
        activityType: null  /* Type of FIB activity. Possible Values :- FIBPassage.  */    
    };

    /*
     * Constants.
     */
    var __constants = {
        /* CONSTANT for PLATFORM Save Status NO ERROR */
        STATUS_NOERROR: "NO_ERROR",
        TEMPLATES: {
            /* Regular MCQSR Layout */
            MCQSR: mcqsrTemplateRef,
            MCQ_IMAGE_OPTIONS: mcqsrOptionsTemplateRef
        }
    };
    // Array of all interaction tags in question
    var __interactionIds = [];
    var __processedJsonContent;
        
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
        //Store the adaptor  
        activityAdaptor = adaptor;

        //Clone the JSON so that original is preserved.
        var jsonContent = jQuery.extend(true, {}, jsonContentObj);
        
        /* ------ VALIDATION BLOCK START -------- */    
        if (jsonContent.content === undefined) {
            if(callback) {
                callback();
            }       
            //TODO - In future more advanced schema validations could be done here        
            return; /* -- EXITING --*/
        }
        
        /* ------ VALIDATION BLOCK END -------- */        
        
        /* Parse and update content JSON. */
        __processedJsonContent = __parseAndUpdateJSONContent(jsonContent, params, htmlLayout);
        //Process JSON for easy iteration in template
        //__parseAndUpdateJSONForRivets();
        __parseAndUpdateJSONForRivets(__processedJsonContent);

        /* Apply the layout HTML to the dom */
        $(elRoot).html(__constants.TEMPLATES[htmlLayout]);

        /* Initialize RIVET. */
        __initRivets();
        /* ---------------------- SETUP EVENTHANDLER STARTS----------------------------*/
            
        $('input[class^=mcqsroption]').change(__handleRadioButtonClick); 

        $(document).bind('userAnswered', function() {
            __saveResults(false);
        });

        /* ---------------------- SETUP EVENTHANDLER ENDS------------------------------*/

        /* Inform the shell that init is complete */
        if(callback) {
            callback();
        }                               
        
        /* ---------------------- END OF INIT ---------------------------------*/
    } /* init() Ends. */        
    /* ---------------------- PUBLIC FUNCTIONS --------------------------------*/
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
    
    /**
    * Bound to click of Activity submit button.
    */
    function handleSubmit(event){
        /* Saving Answer. */
        __saveResults(true);

        $('input[class^=mcqsroption]').attr("disabled", true);
    }

    /**
    * Function to show user grades.
    */
    function showGrades(){
        /* Mark answers. */
        __markAnswers();
        $('input[class^=mcqsroption]').attr("disabled", true);      
    } 

    /**
     * Function to display last result saved in LMS.
     */ 
    function updateLastSavedResults(lastResults) {
        $.each(lastResults.interactions, function(num) {
            __content.userAnswersJSON[num] = this.answer.trim();
            for(var i = 0; i < $('input[class^=mcqsroption]').length; i++) {
                if($('input[class^=mcqsroption]')[i].value.trim() === this.answer.trim()) {
                    $('input[class^=mcqsroption]')[i].checked = true;
                    break;
                }
            }
        });

        __content.feedbackJSON = __getFeedbackJSON();
    }

    /**
     * Function to show feedback in LMS.
     */ 
    function showFeedback() {
        if(!$.isEmptyObject(__content.feedbackJSON)) {
            var feedbackJSON = __content.feedbackJSON;
            $(".mcqsr-body #feedback-area").remove();            
            if(feedbackJSON.status === "correct") {
                $(".mcqsr-body").append("<div class='alert' id='feedback-area'><span class='correct'></span><h4>Feedback</h4>" + feedbackJSON.content + "</div>");
            } else {
                $(".mcqsr-body").append("<div class='alert' id='feedback-area'><a href='#' class='close' data-dismiss='alert' arrayia-label='close' title='close'>x</a><span class='wrong'></span><h4>Feedback</h4>" + feedbackJSON.content + "</div>");                                 
            }
            
            /* Auto resize iframe container. */
            activityAdaptor.autoResizeActivityIframe();            
        }
    }  

    /* ---------------------- PUBLIC FUNCTIONS END ----------------------------*/
     

    /* ---------------------- PRIVATE FUNCTIONS -------------------------------*/

     /* ---------------------- JSON PROCESSING FUNCTIONS START ---------------------------------*/
     /**
     * Parse and Update JSON based on MCQSR specific requirements.
     */
    function __parseAndUpdateJSONContent(jsonContent, params, htmlLayout) { 
        jsonContent.content.displaySubmit = activityAdaptor.displaySubmit;   
        
        __content.activityType = params.engineType;
        __content.layoutType = jsonContent.content.canvas.layout;

        /* Activity Instructions. */
        var tagName = jsonContent.content.instructions[0].tag;
        __content.directionsJSON = jsonContent.content.instructions[0][tagName];
        /* Put directions in JSON. */
        jsonContent.content.directions = __content.directionsJSON;
        $.each(jsonContent.content.stimulus, function(i) {
            if(this.tag === "image") {
                jsonContent.content.stimulus.mediaContent =this.image;
            }
        });
        __parseAndUpdateQuestionSetTypeJSON(jsonContent);
        
        /* Returning processed JSON. */
        return jsonContent; 
    }

    
    /**
     * Parse and Update Question Set type JSON based on  MCQSR specific requirements.
     */  
    function __parseAndUpdateQuestionSetTypeJSON(jsonContent) {

        /* Extract interaction id's and tags from question text. */
        var interactionId = "";
        var interactionTag = "";
        /* String present in href of interaction tag. */
        var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/mcqsr";
        /* Parse questiontext as HTML to get HTML tags. */
        var parsedQuestionArray = $.parseHTML(jsonContent.content.canvas.data.questiondata[0].text);
        $.each( parsedQuestionArray, function(i, el) {
          if(this.href === interactionReferenceString) {
            interactionId = this.childNodes[0].nodeValue.trim();
            __interactionIds.push(interactionId);
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

        /* Make optionsJSON and answerJSON from JSON. */
        for(var i = 0; i < optionCount; i++) {
            var optionObject = jsonContent.content.interactions[interactionId][interactionType][i];
            var option = optionObject[Object.keys(optionObject)].replace(/^\s+|\s+$/g, '');
            __content.optionsJSON[Object.keys(optionObject)[0]] = option;
            optionObject[Object.keys(optionObject)] = option;
            /* Update JSON after updating option. */
            jsonContent.content.interactions[interactionId][interactionType][i] = optionObject;
            if(Object.keys(optionObject) == correctAnswerNumber) {
                __content.answersJSON[0] = correctAnswerNumber;
            }
        }
        __content.questionsJSON[0] = questionText + " ^^ " + __content.optionsJSON.toString() + " ^^ " + interactionId;       
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

    /* 
    * Get feedback in the form:
    * {
    *    "id": "global.correct",
    *    "status" : "correct",
    *    "content" : "Answer is correct"
    * }
    */
    function __getFeedbackJSON() {
        var feedbackJSON = {};
        var id = "",  content = "", status = "";
        var userAnswer = __content.userAnswersJSON[0];
        var correctAnswer = __content.answersJSON[0];          
        var feedback = __processedJsonContent.feedback.global;
        /* If feedback object is not empty than generate userFeedback. */
        if(feedback !== "" && feedback !== undefined && !($.isEmptyObject(feedback))) {                           
            if(userAnswer === "") { /* If user answer is empty. */
                id = "global.empty";
                status = "incorrect";
                content = feedback["empty"];
            } else if(userAnswer === correctAnswer) { /* If user answer contains non-english characters. */
                id = "global.correct";
                status = "correct";
                content = feedback["correct"];                
            } else if(userAnswer !== correctAnswer) { /* If user answer contains non-english characters. */
                id = "global.incorrect";
                status = "incorrect";
                content = feedback["incorrect"];                
            }               
        }                 
        feedbackJSON = {
            id: id,
            status: status,
            content: content
        };
        return feedbackJSON;         
    }   

    /***
     * Function to modify question JSON for easy iteration in template
     * 
     * Original JSON Object
     * ---------------------
     * 
     * "MCQSR": [
          {
            "choiceA": "She has the flu." 
          },
          {
            "choiceB": "She has the measles."
          }  
        ]

        Modified JSON Object
        ----------------------

        "MCQSR": [
          {
              "customAttribs" : {
                    "key" : "choiceA",
                    "value" : "She has the flu.",
                    "isEdited" : false,
                    "index" : 0
                    "isCorrect" : false
              } 
          },
           {
              "customAttribs" : {
                    "key" : "choiceB",
                    "value" : "She has the measles.",
                    "isEdited" : false,
                    "index" : 1
                    "isCorrect" : true
              } 
          }  
        ]
     */
    function __parseAndUpdateJSONForRivets(jsonContent){  
       var processedArray = [];
       for(var i=0; i <__interactionIds.length; i++){
            jsonContent.content.interactions[__interactionIds[i]].MCQSR.forEach(function(obj, index){
                var processedObj = {};
                processedObj.customAttribs = {};
                Object.keys(obj).forEach(function(key){
                    processedObj.customAttribs.key = key;
                    processedObj.customAttribs.value = obj[key];
                });
                processedArray.push(processedObj);
            });
            jsonContent.content.interactions[__interactionIds[i]].MCQSR = processedArray;  
       }
    } 

    /*------------------------RIVET INITIALIZATION & BINDINGS -------------------------------*/        
    function __initRivets(){
        /* Formatter to transform object into object having 'key' property with value key
         * and 'value' with the value of the object
         * Example:
         * var obj = {'choiceA' : 'She has flu.'} to
         * obj= { 'key' : 'choiceA', 'value' : 'She has flu.'}
         * This is done to access the key and value of object in the template using rivets.
         */
        rivets.formatters.propertyList = function(obj) {
          return (function() {
            var properties = [];
            for (var key in obj) {
              properties.push({key: key, value: obj[key]})
            }
            return properties
          })();
        }

        /* This formatter is used to append interaction property to the object
         * and return text of the question for particular interaction
         */
        rivets.formatters.appendInteraction = function(obj, interaction, MCQSR){
            return obj[interaction].text;
        }

        /* This formatter is used to return the array of options for a particular
         * interaction so that rivets can iterate over it.
         */
        rivets.formatters.getArray = function(obj, interaction){
            return obj[interaction].MCQSR;
        }

        var isMCQImageEngine = false;
        /* Find if layout is of type MCQ_IMG*/
        if(__content.layoutType == 'MCQ_IMG'){
            isMCQImageEngine = true;
        }

        /*Bind the data to template using rivets*/
        rivets.bind($('#mcqsr-engine'), {
            content: __processedJsonContent.content,
            isMCQImageEngine: isMCQImageEngine
        });
    }

    /*------------------------RIVETS END-------------------------------*/

    /* ---------------------- JQUERY BINDINGS ---------------------------------*/
    /**
    * Function to handle radio button click.
    */
    function __handleRadioButtonClick(event){
        /*
         * Soft save here
         */
        var currentTarget = event.currentTarget;
        
        $("label.radio").parent().removeClass("highlight");
        $(currentTarget).parent().parent("li").addClass("highlight");  
        
        var newAnswer = currentTarget.value.replace(/^\s+|\s+$/g, '');
            
        /* Save new Answer in memory. */
        __content.userAnswersJSON[0] = $(event.currentTarget).attr('id');  
        
        __state.radioButtonClicked = true;
        
        var interactionId = __content.questionsJSON[0].split("^^")[2].trim();

        __content.feedbackJSON = __getFeedbackJSON();

        $(document).triggerHandler('userAnswered');
    }   

    /**
     * Function called to send result JSON to adaptor (partial save OR submit).
     * Parameters:
     * 1. bSumbit (Boolean): true: for Submit, false: for Partial Save.
     */
    function __saveResults(bSubmit){
        
        var uniqueId = activityAdaptor.getId(); 

        /*Getting answer in JSON format*/
        var answerJSON = __getAnswersJSON(false);

        if(!$.isEmptyObject(__content.feedbackJSON)) {
            answerJSON.response.feedback = __content.feedbackJSON;    
        }

        if(bSubmit===true) {/*Hard Submit*/

            /*Send Results to platform*/
            activityAdaptor.submitResults(answerJSON, uniqueId, function(data, status){
                if(status=== __constants.STATUS_NOERROR){
                    __state.activitySubmitted = true;
                    /*Close platform's session*/
                    activityAdaptor.closeActivity();
                    __state.currentTries = 0;
                } else {
                    /* There was an error during platform communication, so try again (till MAX_RETRIES) */             
                    if(__state.currentTries < __config.MAX_RETRIES) {
                        __state.currentTries++ ;
                        __saveResults(bSubmit);
                    }

                }

            });
        } else{ /*Soft Submit*/
            /*Send Results to platform*/
            activityAdaptor.savePartialResults(answerJSON, uniqueId, function(data, status){
                if(status=== __constants.STATUS_NOERROR){
                    __state.activityPariallySubmitted = true;
                } else {
                    /* There was an error during platform communication, do nothing for partial saves */
                }
            });
        }
    }    

    /*------------------------OTHER PRIVATE FUNCTIONS------------------------*/

    /**
     * Function to show correct Answers to User, called on click of Show Answers Button.
     */ 
    function __markAnswers(){
        var radioNo = "";
        /* Looping through answers to show correct answer. */
        for(var key in __content.optionsJSON){
           __markRadio(key, __content.answersJSON[0]);
        }
    }
    /* Add correct or wrong answer classes*/
    function __markRadio(userAnswer, correctAnswer) {    
        if(userAnswer.trim() === correctAnswer.trim()) {
            $("#" + userAnswer).siblings('.answer').removeClass("wrong");
            $("#" + userAnswer).siblings('.answer').addClass("correct");
            $("#" + userAnswer).parent().addClass("state-success");
        } else {
            $("#" + userAnswer).siblings('.answer').removeClass("correct");
            $("#" + userAnswer).siblings('.answer').addClass("wrong");
            $("#" + userAnswer).parent().addClass("state-error");
        }
        $("#" + userAnswer).siblings('.answer').removeClass("invisible");
    }

    
    /**
     *  Function used to create JSON from user Answers for submit(soft/hard).
     *  Called by :-
     *   1. __saveResults (internal).
     *   2. Multi-item-handler (external).
     */  
    function __getAnswersJSON(skipQuestion){

        var score = 0;
        var answer = "";
        var interactions = {};
        
        /*Setup results array */
        var interactionArray = new Array(1);
        /* Split questionJSON to get interactionId. */
        var questionData = __content.questionsJSON[0].split("^^");
        var interactionId = questionData[2].trim();

        if (skipQuestion) {
            answer = "Not Answered";
        } else {
            answer = __content.userAnswersJSON[0];

            /* Calculating scores.*/
            if(__content.answersJSON[0] === __content.userAnswersJSON[0]){
                score++;
            }
        }   
        
        interactions = {
            id: interactionId,
            answer: answer,           
            score: score,
            maxscore: __processedJsonContent.meta.score.max
        };
        interactionArray[0] = interactions;

        var response =  {
            "interactions": interactionArray
        };    

        return {
            response: response
        };
    }   
    
    return {
        /*Engine-Shell Interface*/
        "init": init, /* Shell requests the engine intialized and render itself. */
        "getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
        "getConfig" : getConfig, /* Shell requests a engines config settings.  */
        "handleSubmit" : handleSubmit,
        "showGrades": showGrades,
        "updateLastSavedResults": updateLastSavedResults,
        "showFeedback": showFeedback
    };
    };
});