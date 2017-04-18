/*
 * -------------------
 * Engine Module Editor
 * -------------------
 * 
 * Item Type: MCQ Single Choice Quesion engine
 * Code: MCQTEST
 * Interface: Editor
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
 * ENGINE-EDITOR - SHELL interface : ->
 * 
 * This "engine editor" loaded by another module/js "shell.js" which  establishes interface with the platform. The shell instantiates
 * this engine [ engine.init() ]  with necessary configuration paramters and a reference to platform Adapter
 * object which allows subsequent communuication with the platform.
 *
 *
 * SHELL calls engine.getConfig() to request SIZE information - the response from the engine is 
 * used to resize the container iframe.
 *
 * 
 * EXTERNAL JS DEPENDENCIES : ->
 * Following are shared/common dependencies and assumed to loaded via the platform. The engine code can use/reference
 * these as needed
 * 1. JQuery ...? (TODO: version)
 * 2. Handlebars (TODO: version)
 * 3. Boostrap  (TODO: version)
 * 5. Rivets (TODO: version / decide if common)
 *

 *
 */

define(['text!../html/mcqtest-editor.html', //Layout of the Editor
        'uuid',
        'css!../css/mcqtest-editor.css', //Custom CSS of the Editor
        'sortable',
        'css!../../bower_components/jquery-ui/themes/base/jquery-ui.css',
        'rivets',
        'sightglass'
        ], function (mcqTemplateRef,uuid) {

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
        RESIZE_MODE: "auto", /* Possible values - "manual"/"auto". Default value is "auto". */
        RESIZE_HEIGHT: "580" /* Applicable, if RESIZE_MODE is manual. If RESIZE_HEIGHT is defined in TOC then that will overrides. */
        /* If both config RESIZE_HEIGHT and TOC RESIZE_HEIGHT are not defined then RESIZE_MODE is set to "auto"*/
    };
    
    /*
     * Internal Engine State.
     */ 
    var __state = {
    };  
    

    /*
     * Constants 
     */
    var __constants = {
        /* CONSTANT for HTML selectors - defined in the layout */ 
        DOM_SEL_ACTIVITY_BODY: ".activity-body",
        
        /* CONSTANT for identifier in which Adaptor Instance will be stored */
        ADAPTOR_INSTANCE_IDENTIFIER: "data-objectid",
        
        TEMPLATES: {
            /* Regular MCQ Layout */
            MCQTEST_EDITOR: mcqTemplateRef
        }
    };
    
    var __processedJsonContent;
    var __parsedQuestionArray = [];
    var __interactionIds = [];
    var __interactionTags = [];
    var __finalJSONContent = {};
    var __quesEdited = {};
    __quesEdited.isEditing = false;
        
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
      
        __processedJsonContent = jQuery.extend(true, {}, jsonContentObj);
        __preProcessJSON();
        __customizeJSONForIteration();

        activityAdaptor = adaptor;

        var isContentValid = true;

        /* ------ VALIDATION BLOCK START -------- */    
        if (__processedJsonContent.content === undefined) {
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
    
        /* Update the DOM and render the processed HTML - main body of the activity */      
        $(elRoot).html(__constants.TEMPLATES[htmlLayout]);

        __initRivets();

        $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());            
    
        /* ---------------------- SETUP EVENTHANDLER STARTS----------------------------*/
             
        $(document).on('change', '.editor .radio input:radio', __handleRadioButtonClick);
        __bindSortable();

        /* ---------------------- SETUP EVENTHANDLER ENDS------------------------------*/

        /* Inform the shell that init is complete */
        if(callback) {
            callback();
        }                               
        
        /* ---------------------- END OF INIT ---------------------------------*/
    } /* init() Ends. */        
    
    /* ---------------------- PUBLIC FUNCTIONS START ---------------------------------*/
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

    function saveItemInEditor(){
        var activityBodyObjectRef = $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER); 
        activityAdaptor.submitEditChanges(__transformJSONtoOriginialForm(), activityBodyObjectRef);
    }

    /* ---------------------- PUBLIC FUNCTIONS START ---------------------------------*/

    /* ---------------------- PRIVATE FUNCTIONS START ---------------------------------*/

    function __preProcessJSON(){
        var newArray =[];
        var newObj={};
        var interactionTag;
        for(var i=0; i <__processedJsonContent.content.canvas.data.questiondata.length; i++){
            __parsedQuestionArray = $.parseHTML(__processedJsonContent.content.canvas.data.questiondata[i].text);
            var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/mcqsc";
            $.each(__parsedQuestionArray, function(index, el) {
              if(this.href === interactionReferenceString) {
                __interactionIds.push(this.childNodes[0].nodeValue.trim())
                interactionTag = this.outerHTML;
                interactionTag = interactionTag.replace(/"/g, "'");
                __interactionTags.push(interactionTag);
                __processedJsonContent.content.canvas.data.questiondata[i].text = __processedJsonContent.content.canvas.data.questiondata[i].text.replace(interactionTag, '');
              }
            });
        }
        for(var key in __processedJsonContent.content.interactions){
            newObj = __processedJsonContent.content.interactions[key];
            newObj.key = key;
            newArray.push(newObj);
        }
        __processedJsonContent.content.interactions = newArray;
    }

    function __customizeJSONForIteration(){
        for(var i=0; i <__interactionIds.length; i++){
           var processedArray = [];
           __processedJsonContent.content.interactions[i].MCQTEST.forEach(function(obj, index){
                var processedObj = {};
                processedObj.customAttribs = {};
                Object.keys(obj).forEach(function(key){
                    processedObj.customAttribs.key = key;
                    processedObj.customAttribs.value = obj[key];
                    processedObj.customAttribs.isEdited = false;
                    processedObj.customAttribs.index = index;
                    if(__processedJsonContent.responses[__interactionIds[i]].correct == processedObj.customAttribs.key){
                        processedObj.customAttribs.isCorrect = processedObj.customAttribs.value;
                    } else{
                        processedObj.customAttribs.isCorrect = false;
                    }
                });
                processedArray.push(processedObj);
            });
            __processedJsonContent.content.interactions[i].MCQTEST = processedArray; 
        }
    }

    function __initRivets(){
        /*
         * Formatters for rivets
         */
        rivets.formatters.args = function(fn){
          var args = Array.prototype.slice.call(arguments, 1);
          return function()  {
            return fn.apply(this, Array.prototype.concat.call(arguments, args))
          }
        }

        rivets.formatters.appendindex = function(obj, index) {
            var array = [];
            array.push(obj[index])
            return array;
        };

        /* 
         * Bind data to template using rivets
         */
        rivets.bind($('#mcq-editor'), {
            content: __processedJsonContent.content, 
            toggleEditing: __toggleEditing, 
            toggleQuestionTextEditing: __toggleQuestionTextEditing, 
            quesEdited: __quesEdited,
            removeItem: __removeItem,
            addItem: __addItem,
            removeEditing : __removeEditing,
            interactionIds : __interactionIds
        });
    }

        /*------------------------RIVET FUNCTIONS START-------------------------------*/
    function __toggleQuestionTextEditing(event, element){
        element.isEditing = !element.isEditing;
        $(event[0].currentTarget).siblings('.question-text-editor').focus();
    }

    function __toggleEditing(event, element){
        element.customAttribs.isEdited = !element.customAttribs.isEdited;
        $(event[0].currentTarget).parent().find('.option-value')[0].focus();
    }

    function __removeItem(event, element, interaction){
        __processedJsonContent.content.interactions[interaction].MCQTEST.splice(element.customAttribs.index,1);
        for(var option=element.index; option<__processedJsonContent.content.interactions[interaction].MCQTEST.length; option++){
            obj.interactions[interaction].MCQTEST[option].customAttribs.index--;
        }
        activityAdaptor.itemChangedInEditor(__transformJSONtoOriginialForm());
    }

    function __removeEditing(event, element){
        if(element.customAttribs){
            element.customAttribs.isEdited = false;    
        } else{
            element.isEditing = false;
        }
        activityAdaptor.itemChangedInEditor(__transformJSONtoOriginialForm());
    }

    function __addItem(event, content, interaction){
        var newObj = {};
        newObj.customAttribs = {};
        newObj.customAttribs.key = uuid.v4();
        newObj.customAttribs.value = "";
        newObj.customAttribs.isEdited = true;
        newObj.customAttribs.index = content.interactions[interaction].MCQTEST.length;
        content.interactions[interaction].MCQTEST.push(newObj);
        activityAdaptor.itemChangedInEditor(__transformJSONtoOriginialForm());
    }
        /*------------------------RIVET FUNCTIONS END-------------------------------*/

    function __bindSortable(){
        $(".sortable").sortable({
            handle: ".drag-icon",
            axis: 'y',
            stop: function( event, ui ) {
                var prevIndex = $(ui.item[0]).attr('elementIndex');
                var currentIndex;
                var prevItem ={};
                var currentItem ={};
                var interaction;
                var interactIndex;
                $(ui.item[0]).parent('.sortable').children('li').each(function(index){
                    if($(this).attr('elementIndex') == prevIndex){
                        currentIndex = index;
                        interactIndex = parseInt($(this).attr('interactIndex'));
                        return false;
                    }
                });
                
                prevIndex = parseInt(prevIndex);
                $(".sortable").sortable("cancel");
                prevItem =  jQuery.extend({},__processedJsonContent.content.interactions[interactIndex].MCQTEST[prevIndex].customAttribs);
                currentItem = jQuery.extend({},__processedJsonContent.content.interactions[interactIndex].MCQTEST[currentIndex].customAttribs);
                __processedJsonContent.content.interactions[interactIndex].MCQTEST[prevIndex].customAttribs = currentItem;
                __processedJsonContent.content.interactions[interactIndex].MCQTEST[currentIndex].customAttribs = prevItem;
                $.each(__processedJsonContent.content.interactions[interactIndex].MCQTEST, function(index, value){
                    __processedJsonContent.content.interactions[interactIndex].MCQTEST[index].customAttribs.index = index;
                });
                activityAdaptor.itemChangedInEditor(__transformJSONtoOriginialForm());
            } 
        });
    }

    function __handleRadioButtonClick(event){
        var currentTarget = event.currentTarget;
        var quesIndex = 0;
        var interactionIndex = $(currentTarget).parent().parent("li").attr('interactIndex');
        $("label.radio").parent().removeClass("highlight");
        $(currentTarget).parent().parent("li").addClass("highlight");  
        
        var newAnswer = currentTarget.value.replace(/^\s+|\s+$/g, '');
        
        __state.radioButtonClicked = true;
        __processedJsonContent.responses[__interactionIds[interactionIndex]].correct = $(currentTarget).attr('key');
        activityAdaptor.itemChangedInEditor(__transformJSONtoOriginialForm());
    }

    function __transformJSONtoOriginialForm(){
        __finalJSONContent = jQuery.extend(true, {}, __processedJsonContent);
        var newObj = {};
        for(var interaction=0;interaction <__finalJSONContent.content.interactions.length; interaction++){
            var content = __finalJSONContent.content.interactions[interaction];
            for(var option=0;option<content.MCQTEST.length;option++){
                content.MCQTEST[option][content.MCQTEST[option].customAttribs.key] = content.MCQTEST[option].customAttribs.value;
                delete content.MCQTEST[option].customAttribs;
            }
            newObj[content.key] = content;  
            delete newObj[content.key].key;
        }
        __finalJSONContent.content.interactions = newObj;
        for(var i=0;i <__finalJSONContent.content.canvas.data.questiondata.length; i++){
            __finalJSONContent.content.canvas.data.questiondata[i].text += __interactionTags[i];
        }
        return __finalJSONContent;
    }    
    /* ---------------------- PRIVATE FUNCTIONS END ---------------------------------*/
    
    return {
        /*Engine-Shell Interface*/
        "init": init, /* Shell requests the engine intialized and render itself. */
        "getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
        "getConfig" : getConfig, /* Shell requests a engines config settings.  */
        "saveItemInEditor" : saveItemInEditor
    };
    };
});