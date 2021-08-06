/*
 * @Author: hcq
 * @Date: 2021-08-02 14:15:49
 * @LastEditTime: 2021-08-06 11:32:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @version:1.2
 * @FilePath:https://github.com/hsjzhcq/hcqHome
 */
(() => {

    let url = {
            login: `https://zjy2.icve.com.cn/portal/login.html`,
            userInfo: `https://zjy2.icve.com.cn/api/student/Studio/index`,
            getLearnningCourseLists: `https://zjy2.icve.com.cn/api/student/learning/getLearnningCourseList`,
            getProcessLists: `https://zjy2.icve.com.cn/api/study/process/getProcessList`,
            getTopicByModuleIds: `https://zjy2.icve.com.cn/api/study/process/getTopicByModuleId`,
            getCellByTopicIds: `https://zjy2.icve.com.cn/api/study/process/getCellByTopicId`,
            viewDirectorys: `https://zjy2.icve.com.cn/api/common/Directory/viewDirectory`,
            stuProcessCellLog: `https://zjy2.icve.com.cn/api/common/Directory/stuProcessCellLog`,
            changeStuStudyProcessCellData: `https://zjy2.icve.com.cn/api/common/Directory/changeStuStudyProcessCellData`
        },
        tiemOut = null, //5分钟后重试定时器存放
        speed = 2000, //执行速度
        ajaxSpeed = speed, //ajax发送与内容添加速度
        isPause = 1,
        errorNum = 0, //错误次数
        pauseNode = "", //存放暂停函数节点
        domRequestSpeed = speed, //文档请求速度
        videoRequestSpeed = 10000, //视频请求速度
        videoAddSpeed = 15, //视频增加速度
        Jump = {
            isVideo: false,
            dom: false,
            video: false
        },
        nowCourseObj = {
            index: -1, //当前课程索引(因为在执行过程中会先自增,所以-1自增后会为0)
            courseName: "", //课程名字
            courseOpenId: "", //课程Id
            openClassId: "", //班级ID
            openCourseCellCount: 0, //课程内容总数
            moduleId: "", //组件id
            unCourseList: [], //待完成课程列表
            temporaryList: [], //临时列表(用于存放已经读取过的信息)
            temporaryIndex: 0, //临时索引(用于重新加载模块后从该索引开始继续获取信息)
            viewDirectory: {
                flag: "s"
            }, //临时存放viewDirectory的数据
            stuProcess: {} //临时存放stuProcess需要的数据
        },
        style = /*模块样式*/ `
        #hcq-content {
            position: fixed;
            width: 90%;
            min-width: 320px;
            height: 90%;
            left: 0;
            top: 0;
            bottom: 0;
            right: 0;
            margin: auto;
            background: linear-gradient(to right, #6A82FB, #FC5C7D);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            box-shadow: 0 0 5px #666;
            z-index: 999
        }
        
        #hcq-content>div {
            z-index: 1;
        }
        
        #hcq-content-left,
        #hcq-content-right {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: all .35s;
        }
        
        .user-name,
        .stuNum {
            background-color: rgba(255, 255, 255, .75);
        }
        
        #hcq-content-left {
            width: 180px;
            box-shadow: 1px 0 6px #666;
            background: linear-gradient(to right, #6A82FB -250%, #fff 800%);
            left: 0;
        }
        
        #hcq-content-right {
            background-color: rgba(255, 255, 255, 0.5);
        }
        
        #hcq-content-left>img {
            width: 120px;
            height: 120px;
            background-color: rgba(255, 255, 255, 0.5);
            margin: 20px auto;
            border-radius: 5px;
            object-fit: cover;
        }
        
        .left-item {
            position: relative;
            margin: .5rem 0;
            text-align: center;
        }
        
        .left-item>span,
        .menu-item>span {
            display: block;
        }
        
        .text-ellipsis {
            padding: .5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        #hcq-main {
            flex: 1;
            z-index: -2 !important;
        }
        
        #console-info {
            position: relative;
            width: 90%;
            height: 90%;
            left: 5%;
            top: 5%;
            border-radius: 5px;
            overflow: auto;
            background-color: rgba(255, 255, 255, .75);
            scroll-behavior: smooth;
        }
        
        .info-box>span {
            display: block;
            border-bottom: 1px dashed #2ECD71;
        }
        
        #console-info>.coures-menu {
            position: absolute;
            display: none;
            top:0;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            background-color: #ccc;
        }
        
        #console-info>.coures-menu[show=show] {
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
        }
        
        .coures-menu>.menu-box {
            position: relative;
            display: flex;
            justify-content: center;
            width: 20%;
        }
        
        .menu-box>div {
            position: relative;
            width: 120px;
            height: 140px;
            flex-shrink: 0;
            margin: .5rem;
            border-radius: 5px;
            background-color: rgb(114, 93, 233);
            box-shadow: 0 0 5px #666;
            color: #fff;
        }
        
        .menu-box>div>div {
            position: absolute;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            right: 0;
            background-color: #0aec6960;
        }
        
        .menu-box>div>img {
            width: 100%;
            height: 120px;
            border-radius: 5px;
            object-fit: cover;
            box-sizing: border-box;
            border: 1px solid #000;
        }
        
        .menu-box>div>span {
            display: block;
            padding: 0 !important;
            text-align: center;
            font-size: 12px;
        }
        
        #console-info::-webkit-scrollbar {
            width: 12px;
        }
        
        #console-info::-webkit-scrollbar:hover {
            background-color: rgba(0, 0, 0, 0.2);
        }
        
        #console-info::-webkit-scrollbar-thumb {
            background-color: #6A82FB;
            border-radius: 5px;
        }
        
        #hcq-content-right {
            width: 260px;
            box-shadow: -1px 0 6px #666;
            right: 0;
        }
        
        .btn {
            position: relative;
            top: 140px;
            padding: .5rem;
            margin: 0 .5rem;
            border-radius: 5px;
            overflow: hidden;
            cursor: pointer;
            background-color: rgba(255, 255, 255, .8);
            box-shadow: 0 0 0 1em transparent;
            user-select: none;
            transition: all .25s;
        }
        
        .btn[on=on] {
            animation: pulse 1s;
        }
        
        .btn>span {
            position: relative;
            z-index: 1;
        }
        
        .btn:hover {
            color: #fff !important;
            background-color: rgba(255, 255, 255, .2);
        }
        
        .switch-platform {
            --color: #6A82FB;
            border: 1px solid #6A82FB;
            color: #6A82FB;
        }
        
        .switch-platform[show=on] {
            background-color: #6A82FB;
            color: #fff
        }
        
        #hcq-content .mian-run {
            --color: #2ECD71;
            border: 1px solid #2ECD71;
            color: #2ECD71;
        }
        
        #hcq-content .mian-run[type=paused] {
            --color: #ee5d5c;
            border: 1px solid#ee5d5c;
            color: #ee5d5c;
        }
        
        #hcq-content .mian-run::after,
        .switch-platform::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            transform: scaleX(0);
            z-index: -1;
            transition: transform .35s;
        }
        
        .switch-platform::after,
        #hcq-content .mian-run::after {
            background-color: var(--color);
        }
        
        @keyframes pulse {
            from {
                box-shadow: 0 0 0 0 var(--color);
            }
        }
        
        #hcq-content .mian-run:hover::after,
        .switch-platform:hover::after {
            transform: scaleX(1);
        }
        
        .switch-box {
            position: absolute;
            z-index: -1 !important;
            width: 180px;
            height: 100%;
            left: -180px;
            transition: all .35s;
            background-color: rgba(255, 255, 255, .8);
            box-shadow: 0 0 5px #666;
        }
        
        .switch-box>ul {
            list-style: none;
            padding: 0;
        }
        
        .switch-box li {
            cursor: pointer;
            text-align: center;
            margin: .2rem;
            padding: .5rem;
            border: #6A82FB 1px solid;
            transition: all .35s;
        }
        
        .switch-box li[on=on] {
            background-color: #6A82FB;
        }
        
        .left-btn,
        .right-btn {
            display: none;
            width: 1.5rem;
            height: 100%;
            align-items: center;
            background-color: #0aec6960;
            cursor: pointer;
            user-select: none;
        }
        
        .left-btn>span,
        .right-btn>span {
            display: block;
            font-size: 1.5rem;
            transition: all .35s;
        }
        
        .menu-item {
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            margin: .5rem .2rem;
            margin-bottom: 0;
            box-shadow: 0 0 5px #666;
            background-color: rgba(0, 0, 0, 0.2);
        }
        
        .menu-item>span {
            padding: .5rem 0;
        }
        
        .menu-item input[type=text] {
            width: 60px;
            margin: 0 .2rem;
            text-align: center;
        }
        
        .menu-item.flex>div,
        #hcq-content-right>.menu-item.flex>.jump-this {
            pointer-events: none;
            background-color: rgba(0, 0, 0, .25);
        }
        
        .menu-item.flex>div {
            width: 60px;
            height: 60px;
            border-radius: 5px;
            line-height: 60px;
            user-select: none;
            transition: all .35s;
            cursor: pointer;
        }
        
        .menu-item.flex[on=on]>div,
        #hcq-content-right>.menu-item.flex>.jump-this[ck=yes] {
            pointer-events: all;
            background-color: rgba(255, 255, 255, .75);
        }
        
        .menu-item.flex[on=on]>div[on=on] {
            transform: scale(.9);
            box-shadow: 0 0 5px #000;
        }
        
        .flex {
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
        }
        
        @media all and (max-width:1148px) {
            .right-btn {
                position: absolute;
                display: flex;
                margin-left: -1.5rem;
            }
            #hcq-content-right>.right-btn>span {
                transform: rotate(0);
            }
            #hcq-content-right[on=on]>.right-btn>span {
                transform: rotate(180deg);
            }
            #hcq-content-right[on=on] {
                right: 0;
            }
            #hcq-content-right {
                position: absolute;
                right: -260px;
            }
        }
        
        @media all and (max-width:1026px) {
            .coures-menu>.menu-box {
                width: 25%;
            }
        }
        
        @media all and (max-width:846px) {
            .coures-menu>.menu-box {
                width: 33.33%;
            }
        }
        
        @media all and (max-width:768px) {
            .left-btn {
                display: flex;
                position: absolute;
            }
            #hcq-content-left {
                left: -180px;
            }
            #hcq-content-left {
                position: absolute;
            }
            #hcq-content-left[on=on] {
                left: 0;
            }
            #hcq-content-left+.left-btn>span {
                transform: rotate(0);
            }
            #hcq-content-left[on=on]+.left-btn>span {
                transform: rotate(180deg);
            }
            .coures-menu>.menu-box {
                width: 25%;
            }
        }
        
        @media all and (max-width:648px) {
            .coures-menu>.menu-box {
                width: 33.33%;
            }
        }
        
        @media all and (max-width:480px) {
            #console-info {
                width: 100%;
                height: 90%;
                left: 0;
            }
            .coures-menu>.menu-box {
                width: 50%;
            }
        }
        `,
        divs = /*模块节点*/ `
        <div id="hcq-content">
        <div id="hcq-content-left">
            <img src="" alt="用户头像">
            <div class="left-item">
                <span>用户名</span>
                <span class="user-name text-ellipsis">1234567890</span>
            </div>
            <div class="left-item">
                <span>学号</span>
                <span class="stuNum text-ellipsis">1234567890</span>
            </div>
            <div class="left-item">
                <div class="switch-platform btn">
                    <span>切换平台</span>
                </div>
            </div>
            <div class="left-item">
                <div class="mian-run btn">
                    <span>运行</span>
                </div>
            </div>
        </div>
        <div class="left-btn">
            <span>></span>
        </div>
        <div class="switch-box">
            <ul>
                <li on=on>职教云</li>
                <li>学习通</li>
                <li>暂时还不支持切换，持续更新中</li>
            </ul>
        </div>
        <div id="hcq-main">
            <div id="console-info">
                <div class="info-box"></div>
                <div class="coures-menu">
                <span style="display: block;width: 100%;text-align: center;">请在<tiem>15</tiem>秒内选择课程，过时自动选择</span>
                </div>
            </div>
        </div>
        <div id="hcq-content-right">
            <div class="right-btn">
                <span>&#60</span>
            </div>
            <div class="menu-item">
                <span>请求发送速度</span>
                <div>
                    [<input type="text" placeholder="1-4" data-default="2" id="ajax-set" value="2">秒修改一次]
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
                <span id="clear-info">点我清除页面信息</span>
            </div>
            <div class="menu-item flex">
                <div class="change-course">更换课程</div>
                <div class="jump-dom">跳过文档</div>
                <div class="jump-video">跳过视频</div>
                <div class="jump-this" jump=on>跳过本节</div>
            </div>
        </div>
    </div>
        `

    function ajaxPost(url, date) {
        return new Promise((res, rej) => {
            tiemOut = setTimeout(() => {
                if (isPause == 0) {
                    rej("已暂停运行");
                } else {
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: date,
                        dataType: "json",
                        success: function(data) {
                            res(data);
                        },
                        error: function(xhr) {
                            rej(xhr);
                        }
                    })
                }
            }, ajaxSpeed);
            if (tiemOut == null) {
                rej("已暂停运行");
            }
        })
    }

    function setNowCourseObj({ //赋值解构对对象赋值
        courseName,
        courseOpenId,
        openClassId,
        openCourseCellCount,
        moduleId
    }) {
        nowCourseObj.courseName = courseName;
        nowCourseObj.courseOpenId = courseOpenId;
        nowCourseObj.openClassId = openClassId;
        nowCourseObj.openCourseCellCount = openCourseCellCount;
        nowCourseObj.moduleId = moduleId;
    }
    if (document.querySelector("#hcq-content") == null) {
        $("head>style").eq(0).append(style);
        $("body").eq(0).append(divs);
    }
    $(function() {
        let $btn = $(".btn"),
            $switchBtn = $(".switch-platform").eq(0),
            $switchBoxLis = $(".switch-box").find("li"),
            $contentLeft = $("#hcq-content-left"),
            $contentRight = $("#hcq-content-right"),
            $leftBtn = $(".left-btn"),
            $rightBtn = $(".right-btn"),
            $consoleInfo = $("#console-info"),
            $consoleInfoItem = $consoleInfo.children(".info-box"),
            $run = $(".mian-run"),
            $speedSet = $contentRight.find("input[type=text]"),
            $couresMenu = $(".coures-menu"),
            $countDown = $couresMenu.find("tiem"),
            $changeCourse = $(".change-course"),
            $jumpDom = $(".jump-dom"),
            $jumpVideo = $(".jump-video"),
            $jumpThis = $(".jump-this");
        async function getCourseLists() { //获取课程列表
            try {
                pauseNode = getCourseLists;
                if (nowCourseObj.unCourseList.length != 0) {
                    setNowCourseObj(nowCourseObj.unCourseList[++nowCourseObj.index]);
                    setTimeOut(() => {
                        getProcessLists();
                    })
                } else {
                    Console('正在获取课程列表中');
                    let data = await ajaxPost(url["getLearnningCourseLists"]),
                        List = data.courseList,
                        finished = 0,
                        unfinishedList = [],
                        index = 0;
                    setTimeOut(() => {
                        Console(`获取到课程列表${List.length}门`);
                        List.forEach(e => {
                            if (e.process != 100) {
                                unfinishedList.push({
                                    courseName: e.courseName,
                                    courseOpenId: e.courseOpenId,
                                    openClassId: e.openClassId
                                });
                                $couresMenu.append(`
                                <div class="menu-box" data-index=${index-1}>
                                    <div>
                                        <div class="flex">${e.process}</div>
                                        <img src="${e.thumbnail}">
                                        <span class="text-ellipsis">${e.courseName}</span>
                                    </div>
                                </div>`);
                                index++;
                            } else {
                                finished++;
                            }
                        });
                        nowCourseObj.unCourseList = unfinishedList;
                        setTimeOut(() => {
                            Console(`其中已完成课程有${finished}门课程，未完成课程为${List.length-finished}门课程`);
                            errorNum = 0;
                            setTimeOut(() => {
                                Console(`正在载入未完成课程,请稍后。。。`);
                                setTimeOut(() => {
                                    $couresMenu.attr("show", "show");
                                    $(".menu-item.flex").attr("on", "on");
                                    index = 15;
                                    tiemOut = setInterval(() => {
                                        if (index <= 0) {
                                            clearInterval(tiemOut);
                                            $changeCourse.click();
                                            $countDown.parent().remove();
                                            getCourseLists();
                                        } else {
                                            $countDown.text(--index);
                                        }
                                    }, 1000);
                                });
                            });
                        });
                    });
                }
                nowCourseObj.viewDirectory.courseOpenId = nowCourseObj.courseOpenId;
                nowCourseObj.viewDirectory.openClassId = nowCourseObj.openClassId;
            } catch (e) {
                setError(e);
            }
        }
        async function getProcessLists() { //获取列表进度
            try {
                pauseNode = getProcessLists;
                Console(`当前课程名称${nowCourseObj.courseName}`);
                let data = await ajaxPost(url["getProcessLists"], {
                        courseOpenId: nowCourseObj.courseOpenId,
                        openClassId: nowCourseObj.openClassId
                    }),
                    sourseSum = data.openCourseCellCount,
                    list = data.progress.moduleList,
                    unfinishedList = [],
                    finished = 0;
                nowCourseObj.openCourseCellCount = sourseSum;
                nowCourseObj.moduleId = data.progress.moduleId;
                setTimeOut(() => {
                    Console(`成功获取到列表进度信息，本课程有${list.length}大模块，共计${sourseSum}个小节`);
                    list.forEach(e => {
                        if (e.percent != 100) {
                            unfinishedList.push({
                                id: e.id,
                                name: e.name,
                                percent: e.percent
                            })
                        } else {
                            finished++;
                        }
                    });
                    nowCourseObj.temporaryList = unfinishedList;
                    setTimeOut(() => {
                        Console(`其中已完成${finished}个模块，未完成${list.length-finished}个模块`);
                        setTimeOut(() => {
                            errorNum = 0;
                            getTopicByModuleIds();
                        });
                    });
                });
            } catch (e) {
                setError(e);
            }
        }
        async function getTopicByModuleIds() {
            try {
                pauseNode = getTopicByModuleIds;
                Console(`准备获取本课程小节信息`);
                let List = [],
                    index = nowCourseObj.temporaryIndex,
                    module = nowCourseObj.temporaryList;
                fnRetry(index);
                Console(await new Promise(r => { setTimeOut(() => { r(`正在获取本课程小节信息`) }) }));
                for (let [i, e] of module.entries()) {
                    if (i >= index) {
                        let res = await ajaxPost(url["getTopicByModuleIds"], {
                            courseOpenId: nowCourseObj.courseOpenId,
                            moduleId: e.id
                        });
                        nowCourseObj.temporaryIndex = ++index;
                        Console(`获取进度${index}/${module.length}`);
                        let obj = []
                        res.topicList.forEach(item => {
                            item.moduleId = e.id;
                            obj.push(item);
                        });
                        List.push(...obj);
                    }
                }
                errorNum = 0;
                nowCourseObj.temporaryIndex = 0;
                setTimeOut(() => {
                    nowCourseObj.temporaryList = List;
                    getCellByTopicIds();
                })
            } catch (e) {
                setError(e);
            }
        }
        async function getCellByTopicIds() {
            try {
                pauseNode = getCellByTopicIds;
                Console(`已获取本课程组件列表`);
                Console(await new Promise(r => { setTimeOut(() => { r(`准备获取课程组件节点`) }) }));
                let nodeList = [],
                    index = nowCourseObj.temporaryIndex,
                    List = nowCourseObj.temporaryList;
                fnRetry(index);
                for (let [i, e] of List.entries()) {
                    if (i >= index) {
                        let res = await ajaxPost(url["getCellByTopicIds"], {
                            courseOpenId: nowCourseObj.courseOpenId,
                            openClassId: nowCourseObj.openClassId,
                            topicId: e.id
                        });
                        nowCourseObj.temporaryIndex = ++index;
                        Console(`获取进度${index}/${List.length}`);
                        let obj = []
                        res.cellList.forEach(item => {
                            item.moduleId = e.moduleId;
                            obj.push(item);
                        });
                        nodeList.push(...obj);
                    }
                }
                errorNum = 0;
                nowCourseObj.temporaryList = [];
                nowCourseObj.temporaryIndex = 0;
                setTimeOut(() => {
                    Console(`成功获取到所有组件节点`);
                    setTimeOut(() => {
                        Console(`正在对未完成小节进行筛选`);
                        let unfinishedList = [];
                        nodeList.forEach(e => {
                            if (e.childNodeList.length != 0) {
                                e.childNodeList.forEach(item => {
                                    if (item.stuCellFourPercent != 100) {
                                        unfinishedList.push({
                                            id: item.Id,
                                            moduleId: item.moduleId,
                                            categoryName: item.categoryName,
                                            cellName: item.cellName
                                        })
                                    }
                                })
                            } else {
                                if (e.stuCellPercent != 100) {
                                    unfinishedList.push({
                                        id: e.Id,
                                        moduleId: e.moduleId,
                                        categoryName: e.categoryName,
                                        cellName: e.cellName
                                    })
                                }
                            }
                        });
                        nowCourseObj.temporaryList = unfinishedList;
                        setTimeOut(() => {
                            Console(`筛选完成,共计未完成小节${unfinishedList.length}个`);
                            setTimeOut(() => {
                                viewDirectorys();
                            })
                        })
                    });
                });
            } catch (e) {
                setError(e);
            }
        }

        async function viewDirectorys() {
            try {
                pauseNode = viewDirectorys;
                let index = nowCourseObj.temporaryIndex,
                    List = nowCourseObj.temporaryList,
                    len = List.length;
                fnRetry(index);
                Console(`准备获取当前小节`);
                $jumpThis.attr("ck", "yes");
                for (let [i, e] of List.entries()) {
                    if (i >= index) {
                        nowCourseObj.viewDirectory.moduleId = e.moduleId;
                        Console(`获取进度${index+1}/${len}`);
                        await ifSetProcess(e);
                        nowCourseObj.temporaryIndex = ++index;
                    }
                }
                Console(`本章节成功完成`);
                $jumpThis.removeAttr("ck");
                errorNum = 0;
                nowCourseObj.temporaryList = [];
                nowCourseObj.temporaryIndex = 0;
                ajaxSpeed = speed;
                if (nowCourseObj.index + 2 >= nowCourseObj.unCourseList.length) {
                    setTimeOut(() => {
                        $run.click();
                        $consoleInfoItem.html("");
                        Console(`所有课件成功完成`);
                    })
                } else {
                    getCourseLists();
                }

            } catch (e) {
                setError(e);
            }
        }
        async function ifSetProcess(ent) {
            return new Promise(async(e) => {
                let obj = nowCourseObj.stuProcess;
                if (Object.keys(obj) > 0) {
                    await stuProcessCellLog();
                } else {
                    nowCourseObj.viewDirectory.cellId = ent.id;
                    let res = await ajaxPost(url["viewDirectorys"], nowCourseObj.viewDirectory),
                        name = ent.categoryName,
                        isVideo = (Jump.isVideo = /视频|音频/.test(name));
                    nowCourseObj.stuProcess = res;
                    if (res.cellPercent != 100) {
                        if (Jump.dom == true && Jump.video == false && /文档/.test(name)) {
                            Console(`当前文档已跳过`);
                        } else if (Jump.video == true && Jump.dom == isVideo) {
                            Console(`当前视频/音频已跳过`);
                        } else {
                            await stuProcessCellLog();
                        }
                    } else {
                        Console(`本小节已完成！`);
                    }
                }
                e(0);
            })
        }
        async function stuProcessCellLog() {
            let res = nowCourseObj.stuProcess;
            if (res.code == -100) {
                let date = await ajaxPost(url["changeStuStudyProcessCellData"], {
                    courseOpenId: res.currCourseOpenId,
                    openClassId: res.currOpenClassId,
                    moduleId: res.currModuleId,
                    cellId: res.curCellId,
                    cellName: res.currCellName,
                });
                if (date.code == 1) {
                    let r = await ajaxPost(url["viewDirectorys"], nowCourseObj.viewDirectory);
                    res = r;
                }
            }
            let name = res.categoryName,
                len = 0,
                type = 0,
                newTime = res.stuStudyNewlyTime;
            try {
                if (name == undefined) {
                    pauseNode = viewDirectorys;
                    throw name;
                }
                if (name == "视频" || name == "音频") {
                    len = res.audioVideoLong;
                } else {
                    len = res.pageCount;
                }
                Console(`当前小节 类型:[${name}] 名称:[${res.cellName}] 长度:[${len}]`);
                switch (name) {
                    case "ppt文档":
                    case "pdf文档":
                    case "office文档":
                    case "excel文档":
                        type = 1;
                        ajaxSpeed = domRequestSpeed;
                        break;
                    case "视频":
                    case "音频":
                        type = Math.round((len - Math.round(newTime)) / videoAddSpeed)||1;
                        ajaxSpeed = videoRequestSpeed;
                        break;
                    default:
                        Console(`类型暂时未记录！已跳过`);
                        break;
                }
                if (type != 0) {
                    let time = 0,
                        sp = videoAddSpeed;
                    for (let i = 1; i <= type; i++) {
                        if (type > 1) {
                            time = parseInt((sp * i) + newTime);
                            if ((time + sp) >= len) {
                                time = len;
                            }
                        }
                        let r = await ajaxPost(url["stuProcessCellLog"], {
                            courseOpenId: nowCourseObj.courseOpenId,
                            openClassId: nowCourseObj.openClassId,
                            cellId: res.cellId,
                            cellLogId: res.cellLogId,
                            picNum: res.pageCount,
                            studyNewlyPicNum: res.pageCount,
                            studyNewlyTime: time,
                            token: res.guIdToken,
                        });
                        r.code >= 1 ? (() => {
                            Console(`${r.msg},本节进度${i}/${type}`);
                            nowCourseObj.stuProcess = {};
                        })() : (() => {
                            Console(`修改失败！错误码为${r.code},错误信息${r.msg}`);
                            errorNum++;
                            Console(`可能原因为速度过快,正在恢复默认速度`);
                            $("#video-set").val(ajaxSpeed = (videoRequestSpeed = 10000));
                            $("#video-time-set").val(videoAddSpeed = 15)
                            if (errorNum >= 3) {
                                Console(`连续异常3次已暂停,如有重复异常过多,可刷新页面重新运行该脚本`);
                                $run.click();
                                throw 0;
                            }
                        })();
                        if (/^.*分钟.*禁.*$/gu.test(r.msg) || /刷课/gu.test(r.msg)) {
                            Console(`账户疑似异常，已终止执行`);
                            $run.click();
                        }
                    }
                    Console(`本小节已完成！`);
                    errorNum = 0;
                    ajaxSpeed = speed;
                }
            } catch (e) {
                setError(e);
            }
            return Promise.resolve(0);
        }


        function fnRetry(i) {
            if (i != 0) {
                Console(`正在重新获取进度`);
            }
        }

        function setError(e) {
            if (isPause == 1) {
                console.error(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);
                errorNum++;
                setTimeOut(() => {
                    if (errorNum > 3) {
                        $run.click();
                        Console(`获取课程失败，请刷新后在重试`)
                        console.error(`获取课程失败，请刷新后在重试`);
                        tiemOut = setTimeout(() => {
                            Console(`正在尝试重新执行`);
                            --nowCourseObj.index;
                            getCourseLists();
                        }, 50000);
                    } else {
                        Console(`正在尝试重新获取第${errorNum}次`);
                        pauseNode();
                    }
                });
            } else {
                throw console.error(`脚本已暂停运行`);
            }
        }

        function setTimeOut(fn) {
            setTimeout(() => {
                fn()
            }, 1000);
        }

        function Console(text) {
            $consoleInfoItem.append(`
            <span class="text-ellipsis ">${text}</span>
            `);
            $consoleInfo.scrollTop($consoleInfoItem.height());
        }


        async function main() {
            Console("查询用户信息中。。。请稍后")
            try {
                let res = await ajaxPost(url["userInfo"]);
                if (res == "" || /token=.*^/.test(document.cookie)) {
                    alert("请登录后再执行该脚本！");
                    setTimeOut(() => {
                        window.location.href = url["login"];
                    });
                } else {
                    $contentLeft.children("img").attr("src", res.avator);
                    $contentLeft.find(".user-name").text(res.UserName);
                    $contentLeft.find(".stuNum").text(res.stuNo);
                    Console(`[${res.disPlayName}]用户您好，欢迎━(*｀∀´*)ノ亻!使用本脚本，正在持续更新中。`)
                    Console(`如在使用过程中出现BUG等情况,可反馈给作者<a href="tencent://message/?uin=2533094475&Site=admin5.com&Menu=yes">点我联系</a>`)
                }
            } catch (e) {
                alert(`错误原因${e},请登录后再执行该脚本！`);
                setTimeOut(() => {
                    window.location.href = url["login"];
                });
            }
        }
        main();
        $btn.click(function() {
            if ($(this).attr("on") == null) {
                $(this).attr("on", "on");
                setTimeout(() => {
                    $(this).removeAttr("on");
                }, 1000);
            }
        });
        $speedSet.blur(function() {
            let v = $(this).val().replace(/\s*/g, ""),
                area = $(this).attr("placeholder"),
                reg = /^(?<min>\d*)-(?<max>\d*)/.exec(area),
                min = +reg.groups.min,
                max = +reg.groups.max,
                setV = +$(this).data("default"),
                id = $(this).attr("id");
            if (v != "") {
                v = +v;
                if (typeof v == "number" && v >= min && v <= max) {
                    setV = v;
                }
            }
            switch (id) {
                case "ajax-set":
                    speed = 1000 * setV;
                    Console(`请求发送速度修改成功,当前速度${speed/1000}s`);
                    break;
                case "dom-set":
                    domRequestSpeed = 1000 * setV;
                    Console(`文档修改速度修改成功,当前速度${domRequestSpeed/1000}s`);
                    break;
                case "video-set":
                    videoRequestSpeed = 1000 * setV;
                    Console(`视频修改速度修改成功,当前速度${videoRequestSpeed/1000}s,下一个视频后生效`);
                    break;
                case "video-time-set":
                    videoAddSpeed = setV;
                    Console(`视频增加修改成功,当前速度${videoAddSpeed}s,下一个视频后生效`);
                    break;
                default:
                    Console("速度修改失败");
                    break;
            }
            $(this).val(setV);
        });
        $switchBtn.on("click", function() {
            if ($(this).attr("show") != null) {
                $(this).removeAttr("show");
                switchBox.style.left = "-180px";
            } else {
                $(this).attr("show", "on");
                switchBox.style.left = "180px";
            }
        })
        $switchBoxLis.click(function() {
            $(this).siblings().removeAttr("on");
            $(this).attr("on", "on");
        });
        $run.click(function() {
            clearTimeout(tiemOut);
            tiemOut = null;
            if ($(this).attr("type") != "paused") {
                $(this).attr("type", "paused");
                $(this).text("暂停");
                isPause = 1;
                if (pauseNode != "") {
                    Console("已启动脚本运行");
                    pauseNode();
                } else {
                    getCourseLists();
                }
            } else {
                $(this).removeAttr("type", "paused");
                $(this).text("运行");
                Console("已暂停脚本运行");
                isPause = 0;
            }
        });
        $("#clear-info").click(function() {
            $consoleInfoItem.html("");
        });
        $leftBtn.click(function() {
            $contentLeft.attr("on") == "on" ? $contentLeft.removeAttr("on") : (() => {
                $contentLeft.attr("on", "on");
                if ($switchBtn.attr("show") != null) {
                    $switchBtn.click();
                }
            })();
        })
        $rightBtn.click(function() {
            $contentRight.attr("on") == "on" ? $contentRight.removeAttr("on") : $contentRight.attr("on", "on");
        });
        $couresMenu.on("click", ".menu-box", function() {
            isPause = 0;
            clearInterval(tiemOut);
            tiemOut = null;
            nowCourseObj.temporaryIndex = 0;
            nowCourseObj.temporaryList = [];
            nowCourseObj.stuProcess = {};
            nowCourseObj.index = +$(this).data("index");
            $changeCourse.click();
            ajaxSpeed = speed;
            $countDown.parent().remove();
            setTimeOut(() => {
                pauseNode = getCourseLists;
                if ($run.attr("type") != "paused") {
                    $run.click();
                } else {
                    isPause = 1;
                    pauseNode();
                }
            });
        });
        $changeCourse.click(function() {
            $couresMenu.attr("show") != "show" ? (() => {
                $consoleInfoItem.html("");
                $couresMenu.attr("show", "show")
            })() : $couresMenu.removeAttr("show");
        });
        $jumpDom.click(function() {
            if ($(this).attr("on") != "on") {
                Console(`已开启跳过文档模式,并关闭跳过视频`);
                ajaxSpeed = speed;
                Jump.dom = true;
                Jump.video = false;
                $jumpVideo.removeAttr("on");
                $(this).attr("on", "on");
            } else {
                Console(`已关闭跳过文档模式`);
                Jump.dom = false;
                $(this).removeAttr("on");
            }
        });
        $jumpVideo.click(function() {
            if ($(this).attr("on") != "on") {
                Console(`已开启跳过视频模式,并关闭跳过文档`);
                ajaxSpeed = speed;
                Jump.dom = false;
                Jump.video = true;
                $jumpDom.removeAttr("on");
                $(this).attr("on", "on");
                if (Jump.isVideo) {
                    $jumpThis.click()
                }
            } else {
                Console(`已关闭跳过视频模式`);
                Jump.video = false;
                $(this).removeAttr("on");
            }
        });
        $jumpThis.click(function() {
            if (pauseNode != stuProcessCellLog) {
                if (isPause == 1) {
                    Console(`已跳过本节`);
                    clearTimeout(tiemOut);
                    setTimeOut(() => {
                        ++nowCourseObj.temporaryIndex;
                        viewDirectorys();
                    });
                    console.error('跳过本节');
                } else {
                    pauseNode = viewDirectorys;
                    $run.click();
                }
            } else {
                Console(`当前还未执行修改，不能跳过`);
            }

        })
        window.onresize = function() {
            if (window.matchMedia("(max-width:1148px)").matches) {
                if ($contentRight.attr("on") == "on") {
                    $rightBtn.click();
                }
            }
            if (window.matchMedia("(max-width:768px)").matches) {
                if ($switchBtn.attr("show") != null) {
                    $switchBtn.click();
                }
                if ($contentLeft.attr("on") == "on") {
                    $leftBtn.click()
                }
            }
        }
    });
})()
