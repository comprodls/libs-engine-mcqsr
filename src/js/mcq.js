/*
 * -------------
 * Engine Module
 * -------------
 * 
 * Item Type: MCQ Single Choice Quesion engine
 * Code: MCQ
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
define(['text!../html/mcq.html', //layout(s) template representing the UX
        'rivets',  // Rivets for data binding
        'sightglass'], //Required by Rivets
        function (mcqTemplateRef) {

    mcq = function() {
    
    "use strict";
        
    /*
     * Reference to platform's activity adaptor (passed during init() ).
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
     * Internal Engine State - used to manage/track current status of the assessment.
     */ 
    var __state = {
        activityPariallySubmitted: false, /* State whether activity has been partially submitted. Possible Values: true/false(Boolean) */
        activitySubmitted: false /* State whether activity has been submitted. Possible Values: true/false(Boolean) */
    };  

    /*
     * Constants.
     */
    var __constants = {
        TEMPLATES: {
            /* Regular MCQ Layout */
            MCQ: mcqTemplateRef
        }
    };
        
    /********************************************************/
    /*                  INIT FUNCTION
        
        "elRoot" :->        DOM Element reference where the engine should paint itself.                                                     
        "params" :->        Startup params passed by platform. 
        "adaptor" :->        An adaptor interface for communication with platform (__saveResults, closeActivity, savePartialResults, getLastResults, etc.).
        "htmlLayout" :->     HTML layout  
        "jsonContent" :->    Question JSON 
        "callback" :->      Function to inform platform that init is complete.
    */
    /********************************************************/  
    function init(elRoot, params, adaptor, htmlLayout, questionJSON, callback) {        
        //Store the adaptor  
        activityAdaptor = adaptor;

        //Clone question JSON so that original is preserved.
        var jsonContent = jQuery.extend(true, {}, questionJSON);
        
        /* Apply the layout HTML to the dom */
        $(elRoot).html(__constants.TEMPLATES[htmlLayout]);

        /* Process the template by initializing RIVETs */
         rivets.bind($('#mcq-engine'), {
            jsonContent: jsonContent
        });
        
        /* Inform the Platform that init is complete */
        if(callback) {
            callback();
        }                               
        
    } /* init() Ends. */        
    
    /* ---------------------- PUBLIC FUNCTIONS --------------------------------*/
    /**
     * ENGINE Interface
     *
     * Return configuration
     */
    function getConfig () {
        return __config;
    }
    
    /**
     * ENGINE Interface
     *
     * Return the current state (Activity Submitted/ Partial Save State.) of activity.
     */
    function getStatus() {
        return __state.activitySubmitted || __state.activityPariallySubmitted;
    }


    return {
        /*Engine Interface*/
        "init": init, /* Shell requests the engine intialized and render itself. */
        "getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
        "getConfig" : getConfig, /* Shell requests a engines config settings.  */
        "handleSubmit" : function() {/* Do Nothing for now. Sample only*/},
        "showGrades": function() {/* Do Nothing for now. Sample only*/},
        "updateLastSavedResults": function() {/* Do Nothing for now. Sample only*/}
    };
    };
});