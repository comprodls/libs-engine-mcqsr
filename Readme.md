# Assessment Item Type | Reference Implementation
This repository represents a reference implementation (best practices, seed project, etc.) for implementing a new comproDLS assessment item-type (Multiple Choice, Single Select) - designed to automatically plug-n-play with the following components in the comproDLS&trade ecosystems:
* comproDLS&trade; Assessments (assessment.comprodls.com)
* comproDLS&trade; Builder 
* comproDLS&trade; Test Runner (widget for embedding assessments in Experience Apps)
* comproDLS&trade; Activity API (attempts & state management)
* comproDLS&trade; Analytics API (learning & content analytics)

Following sections provide more details on how to setup your own assessment project and subsequent development, release & integration practices.

## Related documents & references
1. [comproDLS&trade; Product Schema](http:..) - You will need to this define your underlying schema. While every assessment will have unique schema aspects, some schema elements need to be standardized (metadata, question text, scores, feedback, etc.) as per comproDLS&trade; product schema document.
2. [comproDLS&trade; Assessment Showcase & Development bench](http://assessment.comprodls.com) - Use this application to review existing assessement types, as well as develop new assessment types.
3. [comproDLS&trade; Test Runner](https://github.com/comprodls/libs-frontend-testrunner) - Use this front-end library to embed assessment types (mix of custom and standard) in your application.
3. [comproDLS&trade; Activity API](http://activity.comprodls.com) - Used for managing runtime state and attempt history. See https://github.com/comprodls/service-activity/wiki/01_Activity_Concepts for more details
4. [comproDLS&trade; Activity API](http://activity.comprodls.com)- Once you're application is integrated with the ACTIVITY API, learning analytics for user progress & time spent are automatically available via the ANALYTICS API.


## Getting started - Setup a starter project
1. Choose an unique **comproDLS&trade; code** for your Assessment type (MCQSR, FIB, DND, etc). Refer to [comproDLS&trade; Registered Assessment Type] for exiting code which can not used.
2. Setup a new GitHub repository using the following standard naming convention - **libs-engine-MY_UNIQUE_CODE** (all lowercase)
3. Copy the contents of this repository into the new respository as the initial commit. Your repository folder structure should look like: 
``` 
dist - ................
src
     js   - .....
        <CODE>.js
        <CODE>-editor.js
     css  - .....  
        <CODE>.css
        <CODE>-editor.css
     html  - .....   
        <CODE>.html
        <CODE>-editor.html
     json  - .....
        <CODE>.json
     assets  - .....
Gruntfile.js - ................
package.json -...............
bower.json -...............
```
4. Rename all the files (as shown above) containing `<CODE>` appropriately. For example if you `CODE` is `QUESTION_TYPE_X` then files under the `js` folder would be renamed to `QUESTION_TYPE_X.js` and `QUESTION_TYPE_X-editor.js`
5. Open the files listed below and replace all references of `MCQ` with your unique code i.e. `QUESTION_TYPE_X`.
```
 	 js  - .....
        <CODE>.js
        <CODE>-editor.js
     html  - .....   
        <CODE>.html
        <CODE>-editor.html
```
6. Run the following commands to initialize your project and compile the change files.
```
npm install
grunt
```
If everything worked fine, you should an output as follows:
```
sdjkfhsk
sdffhsd
```

## Testing your Assessment Type (BASIC flow)
1. Commit and push any changes to your REMOTE GitHub. Also ensure that your GitHub repository is public (not private) **TODO - solve this**
2. Open http://assessment.comprodls.com and login using your comproDLS&trade; development account.
3. ...
4. ...
5. ...
6. ...
7. ...
8. ...
9. ...
10. ...

## Typical development process
The typical sequence of steps for developing a new assessment type is as follows.

### Phase 1 - Student/Instructor Experience
* Define UX MOCK
* Identify your specific schema elements/aspects (which are not aleady available in comproDLS&trade; Product schema or cannot be mapped to an exiting schema construct.).
* Define the default/sample **question JSON** - `json/<CODE>.json`. You could use following generic schema as a starting point.
```javascript
gdfg
dfg
```
* Based on the UX, define the default layout for your assessment type - `html/<CODE>.json`. Include basic or first-level templating snippets (see ..... for detail on the RIVETs templating engine) for linking your **question JSON** to your template. Start with the standard schema elements like `content.instructions`, `meta,title` etc. You could use following vanilla template as a starting point.
```html
<html>
```
* If necessary add **custom styles** to align with your default template in `css/<CODE>.json`. Note [Bootstrap 3.7.x](http://..) is already included as the baseline styling system. You may skip this step initially and simply leverage default bootstrap styles.
* Now you are ready to start writing your **javascript module** in the files `js/<CODE>.js` . The library  `jquery 1.x` is available as the baseline. Use the standard AMD module (see ......... ) pattern for specify additional dependencies. Following a vanilla starter module which uses RIVETs (for two-way binding and templating).
```javascript
var a=0;
```
* Commit your code and test using assessment.comprodls.com NOTE, at the time registration, **Specify SUPPORT EDITOR as false**


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
These events must raised by the engine at appropriate points

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


