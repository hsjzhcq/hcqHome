(() => {
        if ($("body").attr("add") == undefined) {
            $("head").eq(0).append("<style>" + getStyle() + "</style>");
            $("body").attr("add", "").append(getHtml());
        } else {
            return alert("请不要重复加载脚本");
        }
        var $main = $("#hcq-main"),
            $c_left = $("#hcq-content-left"),
            $c_right = $("#hcq-content-right"),
            $sw_box = $(".switch-box"),
            $l_btn = $(".left-btn"),
            $r_btn = $(".right-btn"),
            $s_btn = $(".switch-platform"),
            $supportBox = $(supportBox),
            $changeBg = $(changeBg),
            $consoleInfo = $("#console-info>.info-box"),
            $speedSet = $c_right.find("input[type=text]"),
            $couresMenu = $(".coures-menu"),
            $couresView = $(".coures-view"),
            $menubar = $("#menubar"),
            $v_btn = $menubar.children("[data-type=view]"),
            $jumpDom = $menubar.children("[data-type=jump-dom]"),
            $jumpVideo = $menubar.children("[data-type=jump-video]"),
            $jumpThis = $menubar.children("[data-type=jump-this]"),
            $ch_btn = $menubar.children("[data-type=change]"),
            $c_btn = $menubar.children("[data-type=changeBg]"),
            $countDown = $couresMenu.find("time"),
            $run = $(".mian-run");
        $sw_box.find("li[data-type='2']").attr("on", "on");
        let bgUrl = localStorage.getItem("s_bg");
        if (bgUrl) $main.css("background-image", "url(" + bgUrl + ")");
        let inTime = null; //倒计时定时器
        var config = {
                index: [0, 0, 0], //进度索引[课程索引,模块索引,节点索引,子节点索引]
                nowDomOrVideo: 0, //当前是文档还是视频[0文档,1视频]
                unIndex: 0, //未完成索引
                isRead: false, //是否为读取
                isInit: false, //是否初始化
                close: false, //是否关闭一次
                timeOut: null, //5分钟后重试定时器存放
                speed: 3000, //执行速度
                ajaxSpeed: 2000, //ajax发送与内容添加速度
                isPause: false, //是否暂停
                errorNum: 0, //错误次数
                pauseNode: null, //存放暂停函数节点
                domRequestSpeed: 2000, //文档请求速度
                videoRequestSpeed: 5000, //视频请求速度
                videoAddSpeed: 15, //视频增加速度
                Jump: 0, //是否跳过，1跳过文档，2跳过视频，其他不跳过
                _Lock: true //操作锁
            },
            maxItemView=300,
            CourseList = null, //未完成课程对象树
            unNodeList = []; //未完成子节点索引树
        const AUTHORIZATION = $.cookie("authorization");
        setTimeOut(async() => {
            userInit();
            Console("查询用户信息中。。。请稍后");
            let res = await _ajax("/studycenter/PersonalInfo/getUserInfo"); //查询用户信息
            if (res == null || res.code == -1) {
                alert("请登录后再执行该脚本！");
                setTimeout(() => {
                    location.reload();
                }, 5000);
            } else {
                let name = res.userInfo.DisplayName;
                $c_left.children("img").attr("src", res.avatorUrl + "?x-oss-process=image/resize,m_fixed,w_110,h_110,limit_0");
                $c_left.find(".user-name").text(name);
                $c_left.find(".stuNum").text(res.userInfo.UserName);
                Console(`[${name}]用户您好，欢迎━(*｀∀´*)ノ亻!使用本脚本，该脚本为职教云资源库特供版`);
                Console(`特别提示>>><b style="color:red">刷完课程后,视频部分依旧为灰色,需要手动点击视频等待5秒左右,才可完成!<b>(分析了几个小时,用了几种能想到的方法都没生效,不知道什么情况,进度拉满了,但非得你点击才算完成,离谱)`);
                Console(`制作不易,您的支持是我更新的最大动力!`);
                Console(`最新更新>>><b style="color:red">已支持自动完成作业!!!<b>`);
                config._Lock = false;
            }
        });
        class _script { //该类只关心返回什么样的数据
            constructor() {
                this.url = {};
                this.init();
            }
            init() { //初始化url与函数
                this.url.login = "/portal_new/portal/portal.html"; //登录
                this.url.courseLists = "/studycenter/MyCourse/studingCourse"; //课程列表
                this.url.moduleLists = "/study/Directory/directoryList"; //课程模块列表
                this.url.nodeLists = "/study/directory/directory"; //模块节点列表
                this.url.childNodeInfo = "/study/directory/view"; //模块子节点信息
                this.url.setProgress = "/study/directory/updateStatus"; // 视频修改进度
            }
            async getCourseLists() { //返回课程数据
                let res = await _ajax(this.url.courseLists, { userid: localStorage.getItem("userId") });
                let list = res.list;
                return {
                    len: list.length,
                    list: list.filter(v => {
                        return (+v.schedule * 100) != 100
                    }).map(v => {
                        return {
                            id: v.id,
                            name: v.title,
                            cover: v.cover,
                            progress: +v.schedule,
                            module: []
                        }
                    })
                }
            }
            async getModuleLists() { //返回模块数据
                let index = config.index[0];
                let res = await _ajax(this.url.moduleLists, {
                    courseId: CourseList[index].id,
                });
                let list = res.directory;
                let len = 0;
                var data = list.map((e, i) => {
                    let v = e.section || {};
                    len++;
                    return {
                        index: i,
                        id: v.Id,
                        name: v.Title,
                        load: false,
                        topic: e.chapters || []
                    }
                });
                return {
                    info: {
                        len: len,
                        unlen: data.length
                    },
                    module: data
                }
            } 
            async getNodeLists() { //返回节点数据
                let index = config.index[0],
                    mIndex = config.index[1];
                let res = CourseList[index].module[mIndex].topic;
                return res.map((v, i) => {
                    let type = v.chapter.ChapterType;
                    return {
                        index: i,
                        type: type,
                        id: type === 2 ? v.chapter.ResId : v.chapter.Id,
                        name: v.chapter.Title,
                        Nodes: { knowleges: v.knowleges || [], cells: v.cells }
                    }
                })
            }
            async getChildNodeLists() { //返回子节点数据
                let index = config.index[0],
                    mIndex = config.index[1],
                    tIndex = config.index[2];
                let res = CourseList[index].module[mIndex].topic[tIndex];
                if (res.type === 2) {
                    return {
                        unNode: [`${mIndex}-${tIndex}-0`],
                        data: [{
                            type: "work",
                            id: res.id,
                            name: res.name,
                            unNum: `${mIndex}-${tIndex}-0`
                        }]
                    }
                }
                let node = res.Nodes,
                    data = [],
                    unNode = [],
                    unNum = null,
                    i = 0;
                node.cells.forEach(e => filterData(e));
                node.knowleges.forEach(v => {
                    v.cells.forEach(n => filterData(n));
                });

                function filterData(e) {
                    if (e.Status !== 1) {
                        unNum = `${mIndex}-${tIndex}-${i++}`;
                        unNode.push(unNum);
                        data.push({
                            type: e.CellType,
                            id: e.Id,
                            name: e.Title,
                            unNum
                        })
                    }
                }
                return {
                    unNode: unNode,
                    data: data
                }
            }
            async getChildNodeInfo(node) { //返回子节点信息
                if (typeof node != "object") return Promise.reject("参数不为对象");
                let index = config.index[0];
                let obj = {
                    courseId: CourseList[index].id,
                    cellId: node.id,
                    enterType: "study"
                };
                return await _ajax(this.url.childNodeInfo, obj);
            }

        }

        var $Script = new _script();
        async function getCourseLists() {
            try {
                if (config.isRead && CourseList.length != 0) {
                    let data = await $Script.getCourseLists();
                    let arr = [];
                    f: for (const r of data.list) {
                        for (const e of CourseList) {
                            if (e.id == r.id) {
                                e.progress = +r.progress;
                                continue f;
                            }
                        }
                        arr.push(r);
                    }
                    if (data.list.length != CourseList.length) {
                        Console("课程有变动，重新更新课程。。。");
                        CourseList.push(...arr);
                    }
                    updataData();
                }
                config.pauseNode = "getCourseLists";
                if (CourseList.length != 0) {
                    if (!config.isInit) { CourseListInit() } else {
                        setTimeOut(getModuleLists);
                    }
                } else {
                    Console('正在获取课程列表中...');
                    let data = await $Script.getCourseLists();
                    CourseList = data.list;
                    updataData();
                    if (CourseList.length == 0) {
                        setTimeOut(Console("所有课程均完成，感谢您的使用😉"));
                        setTimeout(() => {
                            location.reload();
                        }, 3500);
                        return;
                    }
                    config.errorNum = 0;
                    await setTimeOut(() => {
                        let len = CourseList.length;
                        Console(`其中已完成课程有${data.len - len}门课程，未完成课程为${len}门课程`);
                        data = null;
                    });
                    CourseListInit();
                }

            } catch (e) {
                setError(e);
            }
        }
        async function CourseListInit() {
            await setTimeOut(() => {
                Console(`正在载入未完成课程,请稍后。。。`);
                $couresMenu.append(getCourseDom());
                config.isInit = true;
                config.isRead = false;
            }).then(r => {
                setTimeOut(() => {
                    $menubar.children("[data-type=change]").removeClass("loader");
                    if (!$ch_btn.is(".onck")) $ch_btn.click();
                    index = 15;
                    inTime = setInterval(() => {
                        if (index <= 0) {
                            clearInterval(inTime);
                            if ($ch_btn.is(".onck")) $ch_btn.click();
                            $countDown.parent().remove();
                            getModuleLists();
                        } else {
                            $countDown.text(--index);
                        }
                    }, 1000)
                })
            })
        }
        async function getModuleLists() {
            let index = config.index[0];
            try {
                config.pauseNode = "getModuleLists";
                Console(`当前课程名称${CourseList[index].name}`);
                if (CourseList[index].module.length == 0) {
                    let data = await $Script.getModuleLists();
                    CourseList[index].module = data.module;
                    updataData();
                    let len = data.info.len,
                        unlen = data.info.unlen;
                    await setTimeOut(() => {
                        Console(`成功获取到课程模块信息，本课程有${len}个模块`);
                    }).then(setTimeOut(() => {
                        Console(`其中已完成${len - unlen}个模块，未完成${unlen}个模块`);
                    }));
                } else {
                    Console(`加载课程存档模块信息中...`);
                }
                setTimeOut(() => {
                    config.errorNum = 0;
                    if (!config.close) getNodeLists();
                })
            } catch (e) {
                setError(e);
            }
        }
        async function getNodeLists() {
            var i = config.index[0],
                index = config.index[1];
            try {
                config.pauseNode = "getNodeLists";
                Console(`正在对本课程模块节点信息进行解析...`);
                var start = window.performance.now();
                let len = CourseList[i].module.length;
                while (index < len) {
                    if (config.close) break;
                    if (CourseList[i].module[index].load === false) {
                        let res = await $Script.getNodeLists();
                        CourseList[i].module[index].topic = res;
                        CourseList[i].module[index].load = true;
                    }
                    config.index[1] = ++index;
                }
                updataData();
                Console(`<模块[节点]信息>解析共耗时: ${(window.performance.now() - start).toFixed(2)} ms`);
                if (config.close) return;
                configInit(1);
                setTimeOut(() => {
                    Console(`已获取本课程所有模块节点信息`);
                    getChildNodeLists();
                })
            } catch (e) {
                setError(e);
            }
        }
        async function getChildNodeLists() {
            var i = config.index[0],
                mI = config.index[1],
                tI = config.index[2];
            try {
                config.pauseNode = "getChildNodeLists";
                Console(`正在对模块子节点信息进行解析...`);
                var start = window.performance.now();
                let mL = CourseList[i].module.length;
                while (mI < mL) {
                    if (config.close) break;
                    let tL = CourseList[i].module[mI].topic.length;
                    while (tI < tL) {
                        let node = CourseList[i].module[mI].topic[tI].Nodes;
                        if (node != null && getType(node) == "Object") {
                            let res = await $Script.getChildNodeLists();
                            if (config.close) break;
                            CourseList[i].module[mI].topic[tI].Nodes = res.data.length == 0 ? null : res.data;
                            unNodeList.push(...res.unNode);
                        } else {
                            if (node != null) {
                                node.forEach(r => {
                                    if (r.unNum) unNodeList.push(r.unNum);
                                })
                            }
                        }
                        config.index[2] = ++tI;
                    }
                    config.index[1] = ++mI;
                    config.index[2] = tI = 0;
                }
                updataData();
                Console(`<模块[子节点]信息>解析共耗时: ${(window.performance.now() - start).toFixed(2)} ms`);
                if (config.close) return;
                Console(`已获取本课程所有模块子节点信息`);
                setTimeOut(() => {
                    Console(`其中经过数据筛选可得,未完成小节共计${unNodeList.length}个`);
                    configInit(2);
                }).then(r => {
                    return setTimeOut(() => {
                        Console(`读取数据开始构建课程视图`);
                        $couresView.html(getViewDom());
                    })
                }).then(r => {
                    return setTimeOut(() => {
                        Console(`课程视图构建完毕,正在读取未完成子节点...`);
                        $menubar.children("[data-type=view]").removeClass("loader");
                    })
                }).then(r => {
                    getChildNodeInfo();
                    $jumpDom.removeClass("loader");
                    $jumpVideo.removeClass("loader");
                });
            } catch (e) {
                setError(e);
            }
        }
         async function getChildNodeInfo() {
            try {
                config.pauseNode = "getChildNodeInfo";
                while (unNodeList != 0) {
                    if (config.close) break;
                    let v = unNodeList[config.unIndex];
                    let arr = v.split("-");
                    Console(`当前子节点信息为${+arr[0] + 1}-${+arr[1] + 1}-${+arr[2] + 1}节点`);
                    let node = CourseList[config.index[0]].module[arr[0]].topic[arr[1]].Nodes[arr[2]];
                    let isJump = false,
                        JumpTxt = "";
                    let nodeType = /video/.test(node.type);
                    config.nowDomOrVideo = +nodeType;
                    switch (config.Jump) {
                        case 1:
                            if (!nodeType) isJump = true;
                            JumpTxt = "当前文档类型已跳过";
                            break;
                        case 2:
                            if (nodeType) isJump = true;
                            JumpTxt = "当前视频/音频已跳过";
                            break;
                    }
                    if (!isJump) {
                        let updata = false,
                            _type = node.type,
                            _is = _type == "work",
                            res = null;
                        if (!_is) res = await $Script.getChildNodeInfo(node);
                        Console(`当前小节 类型:[${getTypeName(_type)}] 名称:[${node.name}]`);
                        if (config.close) continue;
                        $jumpThis.removeClass("loader");
                        if (_is || (res.works && res.works.Status !== 1)) {
                            let datas = await SetProgress(res, node);
                            if (datas !== 0 && datas !== 1) {
                                updata = true;
                            } else if (datas === 1) {
                                config.unIndex++;
                            }
                        } else {
                            updata = true;
                            Console("本小节已完成！");
                        };
                        if (updata) {
                            CourseList[config.index[0]].module[arr[0]].topic[arr[1]].Nodes[arr[2]].unNum = null;
                            $(".view-3[data-un=" + v + "]").addClass("isOk");
                            unNodeList.splice(config.unIndex, 1);
                            updataData();
                        }
                        $jumpThis.addClass("loader");
                        if (config.unIndex >= unNodeList.length) config.unIndex = 0;
                    } else {
                        config.unIndex++;
                        Console(JumpTxt);
                    }
                }
                if (config.close) return;
                Console(`当前课程已成功完成`);
                configInit(3);
                CourseList.splice(config.index[0], 1);
                $couresMenu.children().eq(config.index[0]).remove();
                config.index[0] >= CourseList.length ? config.index[0] = 0 : "";
                updataData();
                setTimeOut(() => {
                    if (CourseList.length != 0) {
                        Console("准备进入下一个课程。。。");
                        getCourseLists();
                    } else {
                        alert(`所有课程均完成，感谢您的使用😉`);
                        $("#hcq-content").remove();
                    }
                });
            } catch (e) {
                setError(e);
            }
        }
        async function SetProgress(res, node) {
            try {
                var request = null;
                switch (node.type) {
                    case "video":
                       let datas = await new Promise((r, rej) => {
                            $.ajax({
                                url: res.data.statusUrl,
                                type: 'get',
                                dataType: "jsonp",
                                jsonp: "jsonpcallback",
                                success: function(v) {
                                    r(v);
                                },
                                error: function(e) {
                                    rej(e);
                                }
                            });
                        });
                        request = await _ajax($Script.url.setProgress, {
                            cellId: node.id,
                            learntime: getTime(datas.args.duration),
                            status: datas.status || 2
                        }, 5000);
                        // await _ajax("/study/directory/getPoints", { cellId: res.cell.Id });
                        break;
                    case "work":
                        Console("已获取题目,正在解析答案中...")
                        let data = await _ajax("/study/Works/works", { courseId: CourseList[config.index[0]].id, assignmentId: node.id })
                        let arr = [];
                        for (const v of data.paper.PaperQuestions) {
                            arr.push({
                                paperItemId: v.Id,
                                answer: v.Answers.join("，")
                            })
                        }
                        request = await _ajax("/study/Works/answerOnlineWorks", {
                            answerId: data.answer.Id,
                            data: JSON.stringify(arr)
                        });
                        Console("当前作业状态:" + request.msg)
                        break;
                    case "question":
                        Console("已获取题目,并开始解析...")
                        for (const v of res.data.paper.PaperQuestions) {
                            let answer = v.Answers.join("，");
                            Console(`题目:[${v.Content}] 答案:[${answer}]`)
                            let rq = await _ajax("/study/directory/answerpaper", {
                                works: res.works.Id,
                                paperItemId: v.Id,
                                answer
                            }, 1000);
                            if (rq.code == 1) { Console("已提交选项!") }
                        }
                        request = await _ajax("/study/directory/subPaper", {
                            studentWorksId: res.works.Id
                        });
                        Console("当前作业状态:" + request.msg)
                        break;
                }
                if (request && request.msg && /刷课|禁/.test(request.msg)) {
                    Console(`账户疑似异常，已终止执行`);
                    $run.click();
                }
                if (config.close) return 0;
                if (request && request.code == 1) Console(`本小节已完成！`);
                config.errorNum = 0;
            } catch (e) {
                if (!config.close) {
                    Console(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);
                    config.errorNum++;
                }
                if (config.errorNum > 3) {
                    Console(`当前节点可能异常,暂时跳过`);
                    config.errorNum=0;
                    return 1
                } else {
                    return 0
                }
            }
        }

        function getTypeName(key) {
            switch (key) {
                case "work":
                    return "作业";
                case "question":
                    return "习题";
                case "video":
                    return "视频";
                case "audio":
                    return "音频";
                case "image":
                    return "图片";
                case "text":
                    return "文档";
                default:
                    return key;
            }
        }
        function getType(v) {
            return Object.prototype.toString.call(v).slice(8, -1)
        }
        function getTime(v) {
            if (getType(v) !== "String") return 10;
            let times = v.split(":");
            return (+times[0] * 60 * 60) + (+times[1] * 60) + +times[2];
        }
        $l_btn.click(function() {
            $c_left.toggleClass("open");
        });
        $r_btn.click(function() {
            $c_right.toggleClass("open");
        });
        $s_btn.click(function() {
            $sw_box.toggleClass("open");
        });
        $sw_box.on("click", "li", function() {
            if ($(this).attr("on") == undefined) {
                confirm(`是否切换到${$(this).text()}平台`, () => {
                    window.location.href = `${typeHome[$(this).data("type")]}`;
                })
            }
        });
        $("#clear-info").click(function() {
            $consoleInfo.html("");
        });
        $couresMenu.on("click", ".menu-box", function() {
            if (inTime != null) {
                clearInterval(inTime);
                inTime = null;
                $countDown.parent().remove();
            }
            let is = true;
            if ($ch_btn.is(".onck")) $ch_btn.click();
            if ($(this).attr("now") == undefined) {
                $(this).attr("now", "").siblings("div[now]").removeAttr("now");
                let i = +$(this).index();
                config.index = [i, 0, 0];
                unNodeList = [];
                config.isPause = config.close = true;
                setTimeout(() => {
                    config.isPause = config.close = false;
                    getCourseLists();
                }, config.ajaxSpeed + 1000);
            } else is = false;
            if ($run.attr("type") != "run") {
                if (is) {
                    Console("已启动脚本运行");
                    $run.attr("type", "run");
                } else $run.click()
            }
        });
        $couresView.on("click", "li", function() {
            if ($(this).is(".unfold")) {
                $(this).parent().toggleClass("open");
            } else {
                if ($v_btn.is(".onck")) $v_btn.click();
                if (!$(this).is(".isOk")) {
                    if (config.isPause)return Console("请先运行脚本!");
                    config.unIndex = unNodeList.indexOf($(this).data("un"));
                    clearTimeout(config.timeOut);
                    getChildNodeInfo();
                } else {
                    Console("当前子节点已完成，无需执行")
                }
            }
        });
        $run.click(function() {
            if (config._Lock) return Console("请等待数据查询后执行!");
            if ($(this).attr("type") != "run") {
                $(this).attr("type", "run");
                config.isPause = config.close = false;
                if (config.pauseNode) {
                    Console("已启动脚本运行");
                    eval(config.pauseNode + "()");
                } else {
                    Console("获取课程信息中...");
                    getCourseLists();
                }
            } else {
                $(this).removeAttr("type");
                config.isPause = config.close = true;
                if (config.timeOut != null) {
                    clearTimeout(config.timeOut);
                    config.timeOut = null;
                }
                Console("已暂停脚本运行");
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
                    config.speed = 1000 * setV;
                    Console(`请求发送速度修改成功,当前速度${setV}s`);
                    break;
                case "dom-set":
                    config.domRequestSpeed = 1000 * setV;
                    Console(`文档修改速度修改成功,当前速度${setV}s`);
                    break;
                case "video-set":
                    config.videoRequestSpeed = 1000 * setV;
                    Console(`视频修改速度修改成功,当前速度${setV}s,下一个视频后生效`);
                    break;
                case "video-time-set":
                    config.videoAddSpeed = setV;
                    Console(`视频增加修改成功,当前速度${setV}s,下一个视频后生效`);
                    break;
                default:
                    Console("速度修改失败");
                    break;
            }
            $(this).val(setV);
        });
        $changeBg.on("click", "button", function() {
            setBg($(this).prev().val());
            if ($c_btn.is(".onck")) $c_btn.click();
        }).find("input[type=file]").change(function() {
            if (this.files[0].size <= 2097152) {
                let reader = new FileReader();
                reader.readAsDataURL(this.files[0]);
                reader.onload = function(e) {
                    setBg(e.target.result);
                }
            } else {
                Console("当前本地图片大于2M，无法添加");
            }
            if ($c_btn.is(".onck")) $c_btn.click();
        });
        $menubar.on("click", "div", function() {
            let type = $(this).data("type");
            if (!$(this).is(".loader")) {
                let is = false,
                    on = true,
                    dom = null;
                switch (type) {
                    case "feedback":
                        on = false;
                        break;
                    case "support":
                        is = true;
                        on = false;
                        dom = $supportBox;
                        break;
                    case "change":
                        is = true;
                        dom = $couresMenu;
                        break;
                    case "view":
                        is = true;
                        dom = $couresView;
                        break;
                    case "changeBg":
                        is = true;
                        dom = $changeBg;
                        break;
                    case "jump-dom":
                        if (config.close) return Console("运行脚本后再使用")
                        if (!$(this).is(".onck")) {
                            var text = "";
                            if (config.Jump === 2) text = ",并关闭跳过视频";
                            Console(`已开启跳过文档模式${text}`);
                            config.Jump = 1;
                            $jumpVideo.removeClass("onck");
                            if (config.nowDomOrVideo === 0) $jumpThis.click();
                        } else {
                            Console(`已关闭跳过文档模式`);
                            config.Jump = 0;
                        }
                        break;
                    case "jump-video":
                        if (config.close) return Console("运行脚本后再使用")
                        if (!$(this).is(".onck")) {
                            var text = "";
                            if (config.Jump === 1) text = ",并关闭跳过文档";
                            Console(`已开启跳过视频模式${text}`);
                            config.Jump = 2;
                            $jumpDom.removeClass("onck");
                            if (config.nowDomOrVideo === 1) $jumpThis.click();
                        } else {
                            Console(`已关闭跳过视频模式`);
                            config.Jump = 0;
                        }
                        break;
                    case "jump-this":
                        if (config.close) return Console("运行脚本后再使用")
                        on = false;
                        config.unIndex++;
                        config.nowDomOrVideo = -1;
                        $(this).addClass("loader");
                        Console(`已跳过当前子节点`);
                        clearTimeout(config.timeOut);
                        getChildNodeInfo();
                        break;
                    case "clearCache":
                        on = false;
                        confirm("是否清空缓存?(如有异常时使用)", () => {
                            localStorage.setItem("scriptID", "clearCache");
                            window.wxc.xcConfirm("清除成功,点击确认后重新执行脚本", "info", {
                                onOk: () => {
                                    location.reload();
                                }
                            });
                        })
                        break;
                }
                if (is) dom.toggleClass("show").siblings(".coures-item.show").removeClass("show");
                if (on) $(this).toggleClass("onck");
            }
        });

        function setBg(url) {
            localStorage.setItem("s_bg", url);
            $main.css("background-image", "url(" + url + ")");
        }

        function configInit(num) {
            config.errorNum = 0;
            for (let i = 1; i <= num; i++) {
                config.index[i] = 0;
            }
        }

        function getViewDom() {
            let html = "";
            for (const v of CourseList[config.index[0]].module) {
                html += `
                <ul class="view-item" data-v=1>
                    <li class="view-1 unfold">${v.name}</li>
                    <div class="view-wrap">
                `;
                for (const e of v.topic) {
                    html += `
                    <ul class="view-item" data-v=2>
                    <li class="view-2 unfold">${e.name}</li>
                    <div class="view-wrap">
                    <ul class="view-item" data-v=3>
                    `;
                    if (e.Nodes != null) {
                        for (const r of e.Nodes) {
                            html += `
                        <li class="view-3 ${r.unNum ? "" : "isOk"}" data-un=${r.unNum} >
                        <b>${getTypeName(r.type)}</b>
                        <span>${r.name}</span>
                        </li>`;
                        }
                    }
                    html += "</ul></div></ul>";
                }
                html += "</div></ul>"
            }
            return html;
        }

        function getCourseDom() {
            let html = "";
            for (const v of CourseList) {
                html += `
                <div class="menu-box">
                    <div>
                        <div class="flex">${v.progress}</div>
                        <img src="${v.cover}">
                        <span class="text-ellipsis">${v.name}</span>
                    </div>
                </div>`
            }
            return html;
        }

        function userInit() {
            let id = localStorage.getItem("userName") + "_v.3";
            if (localStorage.getItem("scriptID") !== id) {
                localStorage.setItem("scriptID", id);
                Console("对运行环境数据初始化中。。。");
                if (localStorage.getItem("s_courseList")) localStorage.removeItem("s_courseList");
                config.isRead = false;
                CourseList = [];
            } else {
                CourseList = JSON.parse(localStorage.getItem("s_courseList")) || [];
                config.isRead = true;
            }
        }


        function setTimeOut(fn) {
            return new Promise(res => {
                setTimeout(() => {
                    if (!config.close) res(fn());
                }, 1000)
            })
        }

        function updataData() {
            localStorage.setItem('s_courseList', JSON.stringify(CourseList));
        }

        function setError(e) {
            if (config.isPause === false) {
                Console(`获取异常,返回[状态码:${e.status},错误信息${e.statusText}]`);
                config.errorNum++;
                setTimeOut(() => {
                    if (config.errorNum > 3) {
                        Console(`失败次数过多，1分钟后将尝试重新执行`);
                        Console(`失败原因可能为[登录状态失效，网络异常，账户信息异常]，建议刷新本页面成功后再重新执行该脚本`);
                        clearTimeout(config.timeOut);
                        config.timeOut = setTimeout(() => {
                            $run.attr("type", "").click();
                        }, 60000)
                    } else {
                        Console(`正在尝试重新获取第${config.errorNum}次`);
                        eval(config.pauseNode + "()");
                    }
                });
            } else {
                throw console.error(`脚本已暂停运行`);
            }
        }

        function Console(e) {
            if (--maxItemView < 0) {
                maxItemView = 300;
                $consoleInfo.html("");
            }
            let dom = $(`<span class="text-ellipsis ">${e}</span>`);
            $consoleInfo.append(dom);
            dom[0].scrollIntoView();
        }

        function _ajax(url, datas, times) {
            return new Promise((res, rej) => {
                if (config.isPause === true) {
                    rej("已暂停运行");
                    config.timeOut = null;
                } else {
                    config.timeOut = setTimeout(() => {
                        if (config.isPause === true) {
                            rej("已暂停运行");
                        } else {
                            $.ajax({
                                url: location.origin + url || "",
                                type: times === false ? 'GET' : 'POST',
                                headers: {
                                    'Authorization': AUTHORIZATION
                                },
                                data: datas || {},
                                dataType: "json",
                                success: function(data) {
                                    res(data);
                                },
                                error: function(xhr) {
                                    rej(xhr);
                                }
                            });
                        }
                    }, times || config.ajaxSpeed);
                }
            })
        }
        window.onresize = function() {
            if (window.matchMedia("(max-width:1148px)").matches) {
                if ($c_right.is(".open")) {
                    $r_btn.click();
                }
            }
            if (window.matchMedia("(max-width:768px)").matches) {
                if ($sw_box.is(".open")) {
                    $s_btn.click();
                }
                if ($c_left.is(".open")) {
                    $l_btn.click()
                }
            }
        }

    function getStyle() {
        return `
        #hcq-content {position: fixed;width: 90%;min-width: 320px;height: 96%;left: 0;top: 0;
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
            .coures-menu>.menu-box {width: 50%}}`
    }

    function getHtml() {
        return `
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
    </div>`
    }
})();
