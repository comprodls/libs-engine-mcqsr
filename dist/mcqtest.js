/**
 * @license text 2.0.15 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */

define("text",["module"],function(module){"use strict";function useDefault(value,defaultValue){return void 0===value||""===value?defaultValue:value}function isSamePort(protocol1,port1,protocol2,port2){if(port1===port2)return!0;if(protocol1===protocol2){if("http"===protocol1)return useDefault(port1,"80")===useDefault(port2,"80");if("https"===protocol1)return useDefault(port1,"443")===useDefault(port2,"443")}return!1}var text,fs,Cc,Ci,xpcIsWindows,progIds=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],xmlRegExp=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,bodyRegExp=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,hasLocation="undefined"!=typeof location&&location.href,defaultProtocol=hasLocation&&location.protocol&&location.protocol.replace(/\:/,""),defaultHostName=hasLocation&&location.hostname,defaultPort=hasLocation&&(location.port||void 0),buildMap={},masterConfig=module.config&&module.config()||{};return text={version:"2.0.15",strip:function(content){if(content){content=content.replace(xmlRegExp,"");var matches=content.match(bodyRegExp);matches&&(content=matches[1])}else content="";return content},jsEscape:function(content){return content.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r").replace(/[\u2028]/g,"\\u2028").replace(/[\u2029]/g,"\\u2029")},createXhr:masterConfig.createXhr||function(){var xhr,i,progId;if("undefined"!=typeof XMLHttpRequest)return new XMLHttpRequest;if("undefined"!=typeof ActiveXObject)for(i=0;i<3;i+=1){progId=progIds[i];try{xhr=new ActiveXObject(progId)}catch(e){}if(xhr){progIds=[progId];break}}return xhr},parseName:function(name){var modName,ext,temp,strip=!1,index=name.lastIndexOf("."),isRelative=0===name.indexOf("./")||0===name.indexOf("../");return index!==-1&&(!isRelative||index>1)?(modName=name.substring(0,index),ext=name.substring(index+1)):modName=name,temp=ext||modName,index=temp.indexOf("!"),index!==-1&&(strip="strip"===temp.substring(index+1),temp=temp.substring(0,index),ext?ext=temp:modName=temp),{moduleName:modName,ext:ext,strip:strip}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(url,protocol,hostname,port){var uProtocol,uHostName,uPort,match=text.xdRegExp.exec(url);return!match||(uProtocol=match[2],uHostName=match[3],uHostName=uHostName.split(":"),uPort=uHostName[1],uHostName=uHostName[0],(!uProtocol||uProtocol===protocol)&&(!uHostName||uHostName.toLowerCase()===hostname.toLowerCase())&&(!uPort&&!uHostName||isSamePort(uProtocol,uPort,protocol,port)))},finishLoad:function(name,strip,content,onLoad){content=strip?text.strip(content):content,masterConfig.isBuild&&(buildMap[name]=content),onLoad(content)},load:function(name,req,onLoad,config){if(config&&config.isBuild&&!config.inlineText)return void onLoad();masterConfig.isBuild=config&&config.isBuild;var parsed=text.parseName(name),nonStripName=parsed.moduleName+(parsed.ext?"."+parsed.ext:""),url=req.toUrl(nonStripName),useXhr=masterConfig.useXhr||text.useXhr;return 0===url.indexOf("empty:")?void onLoad():void(!hasLocation||useXhr(url,defaultProtocol,defaultHostName,defaultPort)?text.get(url,function(content){text.finishLoad(name,parsed.strip,content,onLoad)},function(err){onLoad.error&&onLoad.error(err)}):req([nonStripName],function(content){text.finishLoad(parsed.moduleName+"."+parsed.ext,parsed.strip,content,onLoad)}))},write:function(pluginName,moduleName,write,config){if(buildMap.hasOwnProperty(moduleName)){var content=text.jsEscape(buildMap[moduleName]);write.asModule(pluginName+"!"+moduleName,"define(function () { return '"+content+"';});\n")}},writeFile:function(pluginName,moduleName,req,write,config){var parsed=text.parseName(moduleName),extPart=parsed.ext?"."+parsed.ext:"",nonStripName=parsed.moduleName+extPart,fileName=req.toUrl(parsed.moduleName+extPart)+".js";text.load(nonStripName,req,function(value){var textWrite=function(contents){return write(fileName,contents)};textWrite.asModule=function(moduleName,contents){return write.asModule(moduleName,fileName,contents)},text.write(pluginName,nonStripName,textWrite,config)},config)}},"node"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof process&&process.versions&&process.versions.node&&!process.versions["node-webkit"]&&!process.versions["atom-shell"]?(fs=require.nodeRequire("fs"),text.get=function(url,callback,errback){try{var file=fs.readFileSync(url,"utf8");"\ufeff"===file[0]&&(file=file.substring(1)),callback(file)}catch(e){errback&&errback(e)}}):"xhr"===masterConfig.env||!masterConfig.env&&text.createXhr()?text.get=function(url,callback,errback,headers){var header,xhr=text.createXhr();if(xhr.open("GET",url,!0),headers)for(header in headers)headers.hasOwnProperty(header)&&xhr.setRequestHeader(header.toLowerCase(),headers[header]);masterConfig.onXhr&&masterConfig.onXhr(xhr,url),xhr.onreadystatechange=function(evt){var status,err;4===xhr.readyState&&(status=xhr.status||0,status>399&&status<600?(err=new Error(url+" HTTP status: "+status),err.xhr=xhr,errback&&errback(err)):callback(xhr.responseText),masterConfig.onXhrComplete&&masterConfig.onXhrComplete(xhr,url))},xhr.send(null)}:"rhino"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof Packages&&"undefined"!=typeof java?text.get=function(url,callback){var stringBuffer,line,encoding="utf-8",file=new java.io.File(url),lineSeparator=java.lang.System.getProperty("line.separator"),input=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file),encoding)),content="";try{for(stringBuffer=new java.lang.StringBuffer,line=input.readLine(),line&&line.length()&&65279===line.charAt(0)&&(line=line.substring(1)),null!==line&&stringBuffer.append(line);null!==(line=input.readLine());)stringBuffer.append(lineSeparator),stringBuffer.append(line);content=String(stringBuffer.toString())}finally{input.close()}callback(content)}:("xpconnect"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof Components&&Components.classes&&Components.interfaces)&&(Cc=Components.classes,Ci=Components.interfaces,Components.utils.import("resource://gre/modules/FileUtils.jsm"),xpcIsWindows="@mozilla.org/windows-registry-key;1"in Cc,text.get=function(url,callback){var inStream,convertStream,fileObj,readData={};xpcIsWindows&&(url=url.replace(/\//g,"\\")),fileObj=new FileUtils.File(url);try{inStream=Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream),inStream.init(fileObj,1,0,!1),convertStream=Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream),convertStream.init(inStream,"utf-8",inStream.available(),Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER),convertStream.readString(inStream.available(),readData),convertStream.close(),inStream.close(),callback(readData.value)}catch(e){throw new Error((fileObj&&fileObj.path||"")+": "+e)}}),text}),define("text!../html/mcqtest.html",[],function(){return'\r\n<!-- Engine Renderer Template -->\r\n\r\n{{#with content}}\r\n<div class="activity-body mcq-body"> \r\n   <h2><strong>{{getAdapterParams "activityName"}}</strong></h2> \r\n   <p class="instructions">{{{directions}}}</p> \r\n   <div class="row">   \r\n      <div class="col-md-12">      \r\n         <div class="smart-form">       \r\n            <p>\r\n               {{#with canvas.data}}\r\n                  {{#each questiondata}}\r\n                     {{{this.text}}}\r\n                  {{/each}}\r\n               {{/with}}\r\n            </p>       \r\n            <ul class="list-unstyled nested-list">\r\n               {{#each interactions}}\r\n                  {{#with this}}\r\n                     {{#each this}}\r\n                        {{#each this}}\r\n                           {{#each this}}         \r\n                              <li>\r\n                                 <label class="radio radio-lg">\r\n                                    <span id="answer{{@index}}" class="invisible wrong pull-left"></span>\r\n                                    <input type="radio" name="optionsRadios" class="option" id="option{{@index}}" value="{{{this}}}">\r\n                                    <i></i>\r\n                                    <span class="content">{{this}}</span>\r\n                                 </label>\r\n                              </li>\r\n                           {{/each}} \r\n                        {{/each}}\r\n                     {{/each}}\r\n                  {{/with}}\r\n               {{/each}}       \r\n            </ul> \r\n         </div>   \r\n      </div>  \r\n   </div>\r\n</div>\r\n{{/with}}'}),define("css",[],function(){if("undefined"==typeof window)return{load:function(n,r,load){load()}};var head=document.getElementsByTagName("head")[0],engine=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/)||0,useImportLoad=!1,useOnload=!0;engine[1]||engine[7]?useImportLoad=parseInt(engine[1])<6||parseInt(engine[7])<=9:engine[2]||engine[8]||"WebkitAppearance"in document.documentElement.style?useOnload=!1:engine[4]&&(useImportLoad=parseInt(engine[4])<18);var cssAPI={};cssAPI.pluginBuilder="./css-builder";var curStyle,curSheet,ieCurCallback,createStyle=function(){curStyle=document.createElement("style"),head.appendChild(curStyle),curSheet=curStyle.styleSheet||curStyle.sheet},ieCnt=0,ieLoads=[],createIeLoad=function(url){curSheet.addImport(url),curStyle.onload=function(){processIeLoad()},ieCnt++,31==ieCnt&&(createStyle(),ieCnt=0)},processIeLoad=function(){ieCurCallback();var nextLoad=ieLoads.shift();return nextLoad?(ieCurCallback=nextLoad[1],void createIeLoad(nextLoad[0])):void(ieCurCallback=null)},importLoad=function(url,callback){if(curSheet&&curSheet.addImport||createStyle(),curSheet&&curSheet.addImport)ieCurCallback?ieLoads.push([url,callback]):(createIeLoad(url),ieCurCallback=callback);else{curStyle.textContent='@import "'+url+'";';var loadInterval=setInterval(function(){try{curStyle.sheet.cssRules,clearInterval(loadInterval),callback()}catch(e){}},10)}},linkLoad=function(url,callback){var link=document.createElement("link");if(link.type="text/css",link.rel="stylesheet",useOnload)link.onload=function(){link.onload=function(){},setTimeout(callback,7)};else var loadInterval=setInterval(function(){for(var i=0;i<document.styleSheets.length;i++){var sheet=document.styleSheets[i];if(sheet.href==link.href)return clearInterval(loadInterval),callback()}},10);link.href=url,head.appendChild(link)};return cssAPI.normalize=function(name,normalize){return".css"==name.substr(name.length-4,4)&&(name=name.substr(0,name.length-4)),normalize(name)},cssAPI.load=function(cssId,req,load,config){(useImportLoad?importLoad:linkLoad)(req.toUrl(cssId+".css"),load)},cssAPI}),define("css!../css/mcqtest",[],function(){}),define("mcqtest",["text!../html/mcqtest.html","css!../css/mcqtest.css"],function(mcqTemplateRef){mcqtest=function(){"use strict";function init(elRoot,params,adaptor,htmlLayout,jsonContentObj,callback){var jsonContent=jQuery.extend(!0,{},jsonContentObj);activityAdaptor=adaptor;var isContentValid=!0;if(void 0===jsonContent.content&&(isContentValid=!1),!isContentValid)return void(callback&&callback());var processedJsonContent=__parseAndUpdateJSONContent(jsonContent,params);console.log(processedJsonContent);var processedHTML=__processLayoutWithContent(__constants.TEMPLATES[htmlLayout],processedJsonContent);processedHTML=processedHTML.replace(/&lt;/g,"<"),processedHTML=processedHTML.replace(/&gt;/g,">"),$(elRoot).html(processedHTML),$(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER,adaptor.getId()),$("input[id^=option]").change(__handleRadioButtonClick),callback&&callback()}function getConfig(){return __config}function getStatus(){return __state.activitySubmitted||__state.activityPariallySubmitted}function handleSubmit(event){__saveResults(!0),activityAdaptor.showAnswers&&__markAnswers(),$("input[id^=option]").attr("disabled",!0)}function showGrades(savedAnswer,reviewAttempt){updateLastSavedResults(savedAnswer),__markAnswers(),$("input[id^=option]").attr("disabled",!0)}function updateLastSavedResults(lastResults){$.each(lastResults.results,function(num){__content.userAnswersJSON[num]=this.answer.trim();for(var i=0;i<$("input[id^=option]").length;i++)if($("input[id^=option]")[i].value.trim()===this.answer.trim()){$("input[id^=option]")[i].checked=!0;break}})}function __saveResults(bSubmit){var activityBodyObjectRef=$(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER),answerJSON=__getAnswersJSON(!1);bSubmit===!0?activityAdaptor.submitResults(answerJSON,activityBodyObjectRef,function(data,status){status===__constants.STATUS_NOERROR?(__state.activitySubmitted=!0,activityAdaptor.closeActivity(),__state.currentTries=0):__state.currentTries<__config.MAX_RETRIES&&(__state.currentTries++,__saveResults(bSubmit))}):activityAdaptor.savePartialResults(answerJSON,activityBodyObjectRef,function(data,status){status===__constants.STATUS_NOERROR&&(__state.activityPariallySubmitted=!0)})}function __handleRadioButtonClick(event){var currentTarget=event.currentTarget,quesIndex=0;$("label.radio").parent().removeClass("highlight"),$(currentTarget).parent().parent("li").addClass("highlight");var newAnswer=currentTarget.value.replace(/^\s+|\s+$/g,"");__content.userAnswersJSON[quesIndex]=newAnswer.replace(/^\s+|\s+$/g,""),__state.radioButtonClicked=!0;__content.questionsJSON[0].split("^^")[2].trim()}function __markAnswers(){for(var radioNo="",i=0;i<__content.optionsJSON.length;i++)radioNo=""+i,__markRadio(radioNo,__content.answersJSON[0],__content.optionsJSON[i])}function __markRadio(optionNo,correctAnswer,userAnswer){userAnswer.trim()===correctAnswer.trim()?($("#answer"+optionNo).removeClass("wrong"),$("#answer"+optionNo).addClass("correct"),$("#answer"+optionNo).parent().addClass("state-success")):($("#answer"+optionNo).removeClass("correct"),$("#answer"+optionNo).addClass("wrong"),$("#answer"+optionNo).parent().addClass("state-error")),$("#answer"+optionNo).removeClass("invisible")}function __getAnswersJSON(skipQuestion){var score=0,answer="",results={},end_current_test=!1,resultArray=new Array(1),questionData=__content.questionsJSON[0].split("^^"),interactionId=questionData[2].trim();return __constants.END_TEST&&(end_current_test=!0),skipQuestion?answer="Not Answered":(answer=__content.userAnswersJSON[0],__content.answersJSON[0]===__content.userAnswersJSON[0]&&score++),results={itemUID:interactionId,question:__content.questionsJSON[0],correctAnswer:__content.answersJSON[0],score:score,comment:"",end_current_test:end_current_test,answer:answer,possible:1},resultArray[0]=results,{response:{directions:__content.directionsJSON,results:resultArray}}}function __processLayoutWithContent(layoutHTML,contentJSON){var compiledTemplate=Handlebars.compile(layoutHTML),compiledHTML=compiledTemplate(contentJSON);return compiledHTML}function __parseAndUpdateJSONContent(jsonContent,params){jsonContent.content.displaySubmit=activityAdaptor.displaySubmit,__content.activityType=params.engineType;var tagName=jsonContent.content.instructions[0].tag;return __content.directionsJSON=jsonContent.content.instructions[0][tagName],jsonContent.content.directions=__content.directionsJSON,__parseAndUpdateQuestionSetTypeJSON(jsonContent),jsonContent}function __parseAndUpdateQuestionSetTypeJSON(jsonContent){var interactionId="",interactionTag="",interactionReferenceString="http://www.comprodls.com/m1.0/interaction/mcqsc",parsedQuestionArray=$.parseHTML(jsonContent.content.canvas.data.questiondata[0].text);$.each(parsedQuestionArray,function(i,el){this.href===interactionReferenceString&&(interactionId=this.childNodes[0].nodeValue.trim(),interactionTag=this.outerHTML,interactionTag=interactionTag.replace(/"/g,"'"))}),jsonContent.content.canvas.data.questiondata[0].text=jsonContent.content.canvas.data.questiondata[0].text.replace(interactionTag,"");for(var questionText="1.  "+jsonContent.content.canvas.data.questiondata[0].text,correctAnswerNumber=jsonContent.responses[interactionId].correct,interactionType=jsonContent.content.interactions[interactionId].type,optionCount=jsonContent.content.interactions[interactionId][interactionType].length,i=0;i<optionCount;i++){var optionObject=jsonContent.content.interactions[interactionId][interactionType][i],option=optionObject[Object.keys(optionObject)].replace(/^\s+|\s+$/g,"");__content.optionsJSON.push(__getHTMLEscapeValue(option)),optionObject[Object.keys(optionObject)]=option,jsonContent.content.interactions[interactionId][interactionType][i]=optionObject,Object.keys(optionObject)==correctAnswerNumber&&(__content.answersJSON[0]=optionObject[Object.keys(optionObject)])}__content.questionsJSON[0]=questionText+" ^^ "+__content.optionsJSON.toString()+" ^^ "+interactionId}function __getHTMLEscapeValue(content){var tempDiv=$("<div></div>");return $(tempDiv).html(content),$("body").append(tempDiv),content=$(tempDiv).html(),$(tempDiv).remove(),content}var activityAdaptor,__config={MAX_RETRIES:10,RESIZE_MODE:"auto",RESIZE_HEIGHT:"580"},__state={currentTries:0,activityPariallySubmitted:!1,activitySubmitted:!1,radioButtonClicked:!1},__content={directionsJSON:"",questionsJSON:[],optionsJSON:[],answersJSON:[],userAnswersJSON:[],activityType:null},__constants={DOM_SEL_ACTIVITY_BODY:".activity-body",ADAPTOR_INSTANCE_IDENTIFIER:"data-objectid",STATUS_NOERROR:"NO_ERROR",END_TEST:!1,TEMPLATES:{MCQTEST:mcqTemplateRef}};return{init:init,getStatus:getStatus,getConfig:getConfig,handleSubmit:handleSubmit,showGrades:showGrades,updateLastSavedResults:updateLastSavedResults}}}),function(c){var d=document,a="appendChild",i="styleSheet",s=d.createElement("style");s.type="text/css",d.getElementsByTagName("head")[0][a](s),s[i]?s[i].cssText=c:s[a](d.createTextNode(c))}('/*******************************************************\r\n * \r\n * ----------------------\r\n * Engine Renderer Styles\r\n * ----------------------\r\n *\r\n * These styles do not include any product-specific branding\r\n * and/or layout / design. They represent minimal structural\r\n * CSS which is necessary for a default rendering of an\r\n * MCQSC activity\r\n *\r\n * The styles are linked/depending on the presence of\r\n * certain elements (classes / ids / tags) in the DOM (as would\r\n * be injected via a valid MCQSC layout HTML and/or dynamically\r\n * created by the MCQSC engine JS)\r\n *\r\n *\r\n *******************************************************/\r\n\r\n.mcq-body span.correct:before {\r\n    content: "\\f00c";\r\n    font-family: fontawesome;\r\n    display: block;\r\n    margin: 0 3.6em auto -3.2em;\r\n}\r\n\r\n.mcq-body span.wrong:before {\r\n    content: "\\f00d";\r\n    font-family: fontawesome;\r\n    display: block;\r\n    margin: 0 3.6em auto -3.2em;\r\n}\r\n\r\n.mcq-body .col-md-6.last-child {\r\n    min-height: 200px;\r\n    border-left: 1px solid #C2C2C2;\r\n    padding-left: 20px;\r\n}\r\n\r\n.mcq-body .stimulus {\r\n    margin: 25px 0 25px 0;\r\n}\r\n#feedback-area {\r\n    margin-top: 18px;   \r\n    border: 1px solid #ddd;\r\n    border-radius: 4px;\r\n    padding: 20px;\r\n    margin: 10px 0px 10px 0px;\r\n    background-color: #eee;\r\n    color: #3D3D3D;\r\n}\r\n#feedback-area > h4 {\r\n    padding-bottom: 10px;\r\n    font-weight: 700;\r\n}\r\n/* CORRECT ANSWER icon/mark */\r\n.mcq-body #feedback-area span.correct:before {\r\n    content: "\\f00c";\r\n    font-family: fontawesome;\r\n    display: block;\r\n    margin-right: 10px;\r\n    color: #009900;\r\n    float: left;\r\n    font-size: 18px;\r\n    border: 2px solid #009900;\r\n    padding: 3px 5px 3px 5px;\r\n    border-radius: 16px;\r\n    margin: 10px;\r\n}\r\n.mcq-body #feedback-area span.wrong:before {\r\n    content: "\\f00d";\r\n    font-family: fontawesome;\r\n    display: block;\r\n    margin-right: 10px;\r\n    color: red;\r\n    float: left;\r\n    font-size: 18px;\r\n    border: 2px solid red;\r\n    padding: 2px 6px 2px 6px;\r\n    border-radius: 16px;\r\n    margin: 10px;\r\n}');