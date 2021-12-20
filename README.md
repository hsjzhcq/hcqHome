### 1.0版本(只支持职教云)

## 引用代码为：

let $dom=document.createElement("script");</br>
$dom.setAttribute("src", "https://cdn.jsdelivr.net/gh/hsjzhcq/hcqHome@main/%E6%99%BA%E6%85%A7%E8%81%8C%E6%95%99%E5%88%B7%E8%AF%BE%E8%84%9A%E6%9C%AC.js");</br>
document.body.appendChild($dom);</br>

## 复制以上代码，登录职教云，然后打开浏览器中的控制台（按f12进入），粘贴然后回车即可。

[推荐登录职教云后再打开控制台粘贴执行该脚本,如果对你有帮助，请你点亮上面的Star，谢谢😘]。

-----------------------------分割线---------------------------------

### 2021/12/19更新为2.0版本

## 引用代码为：

let $dom=document.createElement("script");</br>
$dom.setAttribute("src", "https://cdn.jsdelivr.net/gh/hsjzhcq/hcqHome@main/main/app.js");</br>
document.body.appendChild($dom);</br>

#### 更新内容如下(预览图)

![](https://cdn.jsdelivr.net/gh/hsjzhcq/hcqHome@main/img/design-sketch.png)

1.新增智慧职教平台支持。(原本还想添加学习通，不过发现学习通都是ifream内嵌，没办法通过接口获取课程信息，而dom节点提取分析又因为跨域而没办法完成，所以学习通就算了)

2.新增课程视图，通过课程视图快捷指定某一子节点。(感觉其实一直挂着就好了，这些功能很鸡肋，刷课肯定是要都刷完咯😂)

3.新增进度重载，如果课程已经加载过但是还没有完成，那下一次刷课就能够更快的进入刷课流程。

4.新增背景图设置，可以用网络图片或者本地图片。(本地图片不能超过2M，因为是存在浏览器的localStorage上的，而localStorage存储上限为5M，避免引起错误所以限定大小)

5.新增反馈转跳，如遇bug或者建议可通过邮箱发送消息给作者。

### 由于一开始写的核心功能代码可扩展性基本为0，所以添加新的平台只能是重写核心代码了，花了一个星期左右完成了2.0版本，由于作者快毕业了，不会用到网课平台了，所以后续不再更新，只进行简单维护和bug修改，望理解😜。

