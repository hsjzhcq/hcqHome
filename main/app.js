 var typeHome = ["https://zjy2.icve.com.cn", "https://mooc.icve.com.cn","https://www.icve.com.cn"], //平台类型数组
     typeIndex = typeHome.indexOf(location.origin); //当前平台
    if (typeIndex === -1) { //如果当前脚本执行环境不为在数组内，则进行转跳
        let t = +prompt("当前域名无法执行脚本，输入1转跳职教云,输入2转跳智慧职教,输入3转跳资源库,其他取消转跳"); //转number型
        isNaN(t) ? t = 0 : ""; //判断转类型后是否为NaN
        switch (t) { //根据输入转跳
            case 1:
            case 2:
            case 3:
                window.location.href = `${typeHome[t - 1]}`;
                break;
        }
    }else{
        $("body").append(`<script src="https://fastly.jsdelivr.net/gh/hsjzhcq/hcqHome@main/main/${typeIndex===2?'special_':''}cont.min.js"></srcipt>`);
    }
