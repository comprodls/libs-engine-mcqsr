# Assessment Item Type | Reference Implementation
This repository represents a reference implementation (best practices, seed project, etc.) for implementing new comproDLS assessment item types (for example - Multiple Choice, Single Select). Also known as **engines**, comproDLS&trade; Assessment types are designed to automatically plug-n-play with the following components in the comproDLS&trade; ecosystem:
* **comproDLS&trade; Assessments** (showcase & development bench for assessments)
* **comproDLS&trade; Builder** (authoring courses & product models, with assessments)
* **comproDLS&trade; Test Runner** (embedding assessments in Experience Apps)
* **comproDLS&trade; Activity API** (attempts & state management)
* **comproDLS&trade; Analytics API** (learning & content analytics)

Following sections provide more details on how to setup your own assessment (item type) project and related development, release & integration practices.

## Related documents & references
1. [comproDLS&trade; Product Schema](https://docs.google.com/a/comprotechnologies.com/document/d/1npkT-s7aIWrAi_uXMldWMuX9UWpvhHXTflvi__Pm2jo/edit?usp=sharing) - Read this before defining the underlying schema (instructions, options, interactions, assets/stimulus etc.). While every assessment type will have its own unique schema aspects, some elements are standardized (metadata, question text, scores, feedback, etc.) as per the comproDLS&trade; product schema document.
2. [comproDLS&trade; Assessment Showcase & Development bench](http://assessment.comprodls.com) - Use this portal to review existing assessment types, examples, as well as to develop new assessment types (provide tools for testing and customization).
3. [comproDLS&trade; Test Runner](https://github.com/comprodls/libs-frontend-testrunner) - Use this front-end library to embed assessment types (mix of custom and standard) in your application. This document is more relevant for higher-level use cases (Experience Apps, Integrations).
3. [comproDLS&trade; Activity API](http://activity.comprodls.com) - Used for managing runtime state and attempt history. See https://github.com/comprodls/service-activity/wiki/01_Activity_Concepts for more details. This document is more relevant for higher-level use cases (Experience Apps, Integrations).
4. [comproDLS&trade; Analytics API](http://analytics.comprodls.com)- Once your application is integrated with the ACTIVITY API, learning analytics for user progress & time spent are automatically available via the ANALYTICS API. This document is more relevant for higher-level use cases (Experience Apps, Integrations).


## Getting started - Setup a starter project
1. Choose a unique **comproDLS&trade; code** for your Assessment type (MCQSR, FIB, DND, etc). Refer to **TODO [comproDLS&trade; Registered Assessment Type]()** for existing codes which can't be used.
2. Setup a new GitHub repository using the following standard naming convention - **libs-engine-MY_UNIQUE_CODE** (all lowercase)
3. Copy the contents of this repository into the new repository as the initial commit. Your repository folder structure should look like: 
``` 
src
     js
        <CODE>.js
        <CODE>-editor.js
     css
        <CODE>.css
        <CODE>-editor.css
     html
        <CODE>.html
        <CODE>-editor.html
     json
        <CODE>.json
     assets
 dist     
     <CODE>.js
     <CODE>-editor.js
     assets    
Gruntfile.js
package.json
bower.json
Readme.md
.gitignore
```
4. Rename all the files (as shown above) containing `<CODE>` appropriately. For example if your `CODE` is `QUESTION_TYPE_X` then files under the `js` folder would be renamed to `QUESTION_TYPE_X.js` and `QUESTION_TYPE_X-editor.js`
5. Open the files listed below and replace all references of `MCQ` (all uppercase) with your unique code i.e. `QUESTION_TYPE_X`(all uppercase) and all references of `mcq`(all lowercase) with your unique code i.e. `question_type_x`(all lowercase)
```
src
     js
        <CODE>.js
        <CODE>-editor.js
     css
        <CODE>.css
        <CODE>-editor.css
     html
        <CODE>.html
        <CODE>-editor.html
     json
        <CODE>.json
Gruntfile.js        
```
6. Run the following commands to initialize your project and compile the changed files.
```
npm install
grunt
```
If everything worked fine, you should see an output as follows:
```
	Running "requirejs:engine" (requirejs) task
	Completed requirejs optimization for mcq renderer successfully.

	Running "requirejs:engineEditor" (requirejs) task
	Completed requirejs optimization for mcq editor successfully.

	Running "copy:images" (copy) task
	Copied 1 file
	Done.
```

## Testing your Assessment Type (BASIC flow)
1. Commit and push the above changes to your REMOTE GitHub. Also ensure that your GitHub repository is public (not private) **TODO - solve this**
2. Open http://assessment.comprodls.com and login using your comproDLS&trade; development account.
3. Click on "Register New Item" in the left menu bar.
4. Fill in the register form using your newly created item credentials.
5. **Path** - External item repository path.
6. **Item Type** - Your engine MY_UNIQUE_CODE.
7. **Item Name** - Name you want to give to the item.
8. **Layout** - Each item supports many layouts, Layout here is the name of default layout/variation to be used for the item.
9. **Supports Editor** - Mark YES/NO depending on whether your new item supports editor or not.
10. **Sample Content** - Give default content to the item.
11. Click on **Register**, you will be directly taken to the newly created item where you can validate its functioning.

## Typical development process
The typical sequence of steps for developing a new assessment type is as follows.

### Phase 1 - Student/Instructor Experience
* Define UX MOCK
* Identify your specific schema elements/aspects (which are not already available in comproDLS&trade; Product schema or cannot be mapped to an existing schema construct).
* Define the default/sample **question JSON** - `json/<CODE>.json`. You could use following sample schema as a starting point.
```json
{
    "meta": {
        "type": "MCQ",
        "title": "Question 1",
        "score": {
            "default": 0,
            "max": 1,
            "min": 0
        }
    },
    "content": {
        "instructions": [{
            "tag": "html",
            "html": "These are sample instructions for this engine"
        }],
        "canvas": {
            "layout": "MCQ",
            "data": {
                "questiondata": [{
                    "text": "This is sample question?"
                }]
            }
        }
    },
    "interactions": {},
    "feedback": {
        "global": {
            "correct": "",
            "incorrect": "",
            "empty": ""
        }
    },
    "responses": {},
    "learning-objectives": [],
    "tags": []
}
```
* Based on the UX, define the default layout for your assessment type - `html/<CODE>.html`. Include basic or first-level templating snippets (see http://rivetsjs.com/docs/guide/#usage for details on the RIVETS templating engine) for linking your **question JSON** to your template. Start with the standard schema elements like `content.instructions`, `meta.title` etc. You could use following vanilla template as a starting point.
```html
<div class="activity-body" id="mcq-engine"> 
   <h1 rv-text="jsonContent.meta.title"></h1>
   <div rv-each-instruction="jsonContent.content.instructions">
      <h4 rv-text="instruction.html"></h4>
   </div>   
   <div rv-each-question="jsonContent.content.canvas.data.questiondata">
      <h6 rv-text="question.text"></h6>
   </div>   
</div>
```
* If necessary add **custom styles** to align with your default template in `css/<CODE>.css`. Note **TODO [Bootstrap 3.3.7]**(https://github.com/twbs/bootstrap) is already included as the baseline styling system. You may skip this step initially and simply leverage default bootstrap styles.
* Now you are ready to start writing your **javascript module** in the files `js/<CODE>.js`. The library  **TODO `jquery 3.2.1`** is available as the baseline. Use the standard AMD module (see http://requirejs.org/docs/whyamd.html#amd ) pattern for specifying additional dependencies. Following is the vanilla starter module which uses RIVETS (for two-way binding and templating).
```javascript
/*
 * ----------------------
 * Engine Module Renderer
 * ----------------------
 * 
 * Item Type: MCQ Single Choice Quesion engine
 * Code: MCQ
 * Interface: Renderer
 *  
 * Item Render Interfaces / Modes :->
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
 * This engine loaded by another module/js "shell.js" which  establishes interface with the platform. The shell instantiates
 * this engine [ engine.init() ]  with necessary configuration paramters and a reference to platform Adapter
 * object which allows subsequent communuication with the platform.
 *
 * SHELL calls [ engine.getStatus() ] to check if SUBMIT has been pressed or not - the response from the engine is 
 * used to enable / disable LMS controls.
 *
 * SHELL calls engine.getConfig() to request SIZE information - the response from the engine is 
 * used to resize the container iframe.
 *
 *
 * EXTERNAL JS DEPENDENCIES : ->
 * Following are shared/common dependencies and assumed to loaded via the platform. The engine code can use/reference
 * these as needed
 * 1. JQuery (2.1.1)
 * 2. Boostrap (TODO: version) 
 */

define(['text!../html/mcq.html', //HTML layout(s) template (handlebars/rivets) representing the rendering UX
        'rivets',  // Rivets for data binding
        'sightglass'], //Required by Rivets
        function (mcqTemplateRef) {

    mcq = function() {
    
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

        /* Apply the layout HTML to the dom */
        $(elRoot).html(__constants.TEMPLATES[htmlLayout]);

        /* Initialize RIVET. */
        __initRivets(jsonContent);
        
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
       
       
    }

    /**
    * Function to show user grades.
    */
    function showGrades(savedAnswer, reviewAttempt){
          
    } 

    /**
     * Function to display last result saved in LMS.
     */ 
    function updateLastSavedResults(lastResults) {
        
    }
    /* ---------------------- PUBLIC FUNCTIONS END ----------------------------*/
     

    /* ---------------------- PRIVATE FUNCTIONS -------------------------------*/

     
    /*------------------------RIVET INITIALIZATION & BINDINGS -------------------------------*/        
    function __initRivets(jsonContent){
        
        /*Bind the data to template using rivets*/
        rivets.bind($('#mcq-engine'), {
            jsonContent: jsonContent
        });
    }

    /*------------------------RIVETS END-------------------------------*/
    
    return {
        /*Engine-Shell Interface*/
        "init": init, /* Shell requests the engine intialized and render itself. */
        "getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
        "getConfig" : getConfig, /* Shell requests a engines config settings.  */
        "handleSubmit" : handleSubmit,
        "showGrades": showGrades,
        "updateLastSavedResults": updateLastSavedResults
    };
    };
});
```
* Commit your code and test using http://assessment.comprodls.com. NOTE, at the time of registration, **Specify SUPPORT EDITOR as false**


### Phase 2 - Authoring Experience
TODO

## Understanding the ENGINE interface
The AMD **javascript module** conform to a standard **ENGINE interface** which ensures that your assesment type can be embedded and integrated across various comproDLS apps and components
* comproDLS&trade; Assessments (assessment.comprodls.com)
* comproDLS&trade; Builder 
* comproDLS&trade; Test Runner (widget for embedding assessments in Experience Apps)
* comproDLS&trade; Activity API (attempts & state management)
* comproDLS&trade; Analytics API (learning & content analytics)

### Public Methods 
These methods must be defined, as they will invoked by the container (also known as shell).

### Events 
These events must be raised by the engine at appropriate points

### Other communication points (with container)
The `adaptor` object (recieved by the engine at the time initialization) should be used to call the container for the following scenarios.
#### Report when initialization is COMPLETE

## Understanding the EDITOR interface
TODO


## DO's & DONT's
* Do not inject your own Jquery and Bootstrap. If you need a new version of these dependencies, contact the Iron Fist for more details.
* ..
* ..
* ..
* ..
* ..

## Integrating your Assessment type(s) with your Delivery Application
An assessment type may be used in various modes:
* Single or Multi-question tests with **NO state/history** - Simply use the [Test Runner](https://github.com/comprodls/libs-frontend-testrunner)) to embed your assesment type as a widget. You will need to supply content (question json).
* Single or Multi-question tests **with state/history** (Attempts, Resume, Past scores etc.)- Requires use of comproDLS&trade; PRODUCT & ACTIVITY APIs in coordination with the Test runner.
* **Embedded test** inside text/html/epub/markdown with **NO state/history** - Simply use the [Test Runner](https://github.com/comprodls/libs-frontend-testrunner))
* **Embedded test** inside text/html/epub/markdown **with state/history** - Requires use of comproDLS&trade; PRODUCT & ACTIVITY APIs in coordination with the Test runner. _TODO Embedded Items_

## Integrating your Assessment type(s) with Builder
TODO
 


