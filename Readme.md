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
2. [comproDLS&trade; Assessment Showcase & Development bench](http:..)  - 
3. [comproDLS&trade; Activity API](http:..)  - 

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


## Development & Build process

## Engine JS: /js/<CODE>.js
lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum 

Minimal file
```
..
..
..
```

