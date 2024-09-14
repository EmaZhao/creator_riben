/*-----------------------------------------------------+
 * 字符串相关处理
 * @author whjing2012@163.com
 +-----------------------------------------------------*/


window.StringUtil = {

    regex: /(<.*?>|#\d*|[^<>#]+)/ig,

    parse: function (str, handler) {
        // handler = handler || 'handler';
        return str
        var arr = str.match(this.regex);
        str = "";
        var end_tags = [];
        for (var i = 0, n = arr.length; i < n; i++) {
            var s = arr[i];
            //Log.info("====>", s, s.charAt(0));
            if (s == "</div>") {
                if (end_tags.length > 0) {
                    str += end_tags.pop();
                }
            } else if (s.length > 1 && s.charAt(0) == "#") {
                var face = s.substr(1);
                str += "<img src='" + face + "' />";
            } else if (s.length > 4 && s.charAt(0) == '<') {
                var s1 = s.substr(1, 3);
                var s_end = s.substr(s.length - 2, 2);
                var end_tag = "";
                if (s1 == "ass") {
                    var a = s.match(/<assets=(\d+)/i);
                    if (a && a.length == 2) {
                        str += "<img src='" + a[1] + "' />"
                    }
                } else if (s1 == "img") {
                    var a = s.match(/\w+=[^\s>]+/ig);
                    if (!a) continue;
                    for (var j = 0, m = a.length; j < m; j++) {
                        var s2 = a[j].split("=");
                        if (s2.length < 2) continue;
                        if (s2[0] == "src") {
                            str += "<img src='" + s2[1].replace(/^['"]|['"]$/ig, '') + "' />";
                        }
                    }
                } else {
                    var a = s.match(/\w+=[^\s>]+/ig);
                    if (!a) continue;
                    for (var j = 0, m = a.length; j < m; j++) {
                        var s2 = a[j].split("=");
                        if (s2.length < 2) continue;
                        var s3 = s2[1].replace(/^['"]|['"]$/ig, '');
                        if (s2[0] == "fontcolor" || s2[0] == "fontColor") {
                            str += "<color=" + s3 + " >";
                            end_tag = "</color>" + end_tag;
                        } else if (s2[0] == "fontsize") {
                            str += "<size=" + s3 + " >";
                            end_tag = "</size>" + end_tag;
                        } else if (s2[0] == "click") {
                            str += "<on click='" + (handler || s3) + "' param='" + s3 + "' >";
                            end_tag = "</on>" + end_tag;
                        } else if (s2[0] == "href") {
                            str += "<u><on click='" + (handler || s3) + "' param='" + s3 + "' >";
                            end_tag = "</on></u>" + end_tag;
                        } else if (s2[0] == "outline") {
                            var s4 = s2[1].split(",");
                            if (s4.length < 2) continue;
                            var color = "#fffff";
                            var width = 1;
                            if(s4[0].length > 3){
                                color = s4[0];
                                width = s4[1]
                            }else{
                                color = s4[1];
                                width = s4[0]
                            }
                            str += "<outline color=" + color + " width=" + width + " >";
                            end_tag = "</outline>" + end_tag;
                        }
                    }
                }
                if (s_end == "/>") {
                    str += end_tag;
                } else {
                    end_tags.push(end_tag);
                }
            } else {
                str += s;
            }
        }
        return str;
    },

    //处理字符串，返回处理后的string，和资源数组resArr，
    parseStr: function (str, handler) {
        var arr = str.match(/(<.*?>|#\d*|[^<>#]+)/ig);
        str = "";
        var end_tags = [];
        var arr_1 = [];
        for (var i = 0, n = arr.length; i < n; i++) {
            var s = arr[i];
            if (s == "</div>") {
                if (end_tags.length > 0) {
                    str += end_tags.pop();
                }
            } else if (s.length > 1 && s.charAt(0) == "#") {
                var face = s.substr(1);
                str += "<img src='" + face + "' />";
            } else if (s.length > 4 && s.charAt(0) == '<') {
                var s1 = s.substr(1, 3);
                var s_end = s.substr(s.length - 2, 2);
                var end_tag = "";
                if (s1 == "ass") {
                    var a = s.match(/<assets=(\d+)/i);
                    if (a && a.length == 2) {
                        str += "<img src='" + a[1] + "' />"
                        arr_1.push(a[1])
                    }
                } else if (s1 == "img") {
                    var a = s.match(/\w+=[^\s>]+/ig);
                    if (!a) continue;
                    for (var j = 0, m = a.length; j < m; j++) {
                        var s2 = a[j].split("=");
                        if (s2.length < 2) continue;
                        if (s2[0] == "src") {
                            str += "<img src='" + s2[1].replace(/^['"]|['"]$/ig, '') + "' />";
                            arr_1.push(s2[1])
                        }
                    }
                } else {
                    var a = s.match(/\w+=[^\s>]+/ig);
                    if (!a) continue;
                    for (var j = 0, m = a.length; j < m; j++) {
                        var s2 = a[j].split("=");
                        if (s2.length < 2) continue;
                        var s3 = s2[1].replace(/^['"]|['"]$/ig, '');
                        if (s2[0] == "fontcolor" || s2[0] == "fontColor") {
                            str += "<color=" + s3 + " >";
                            end_tag = "</color>" + end_tag;
                        } else if (s2[0] == "fontsize") {
                            str += "<size=" + s3 + " >";
                            end_tag = "</size>" + end_tag;
                        } else if (s2[0] == "click") {
                            str += "<on click='" + (handler || s3) + "' param='" + s3 + "' >";
                            end_tag = "</on>" + end_tag;
                        } else if (s2[0] == "href") {
                            str += "<u><on click='" + (handler || s3) + "' param='" + s3 + "' >";
                            end_tag = "</on></u>" + end_tag;
                        } else if (s2[0] == "outline") {
                            var s4 = s2[1].split(",");
                            if (s4.length < 2) continue;
                            var color = "#fffff";
                            var width = 1;
                            if (s4[0].length > 3) {
                                color = s4[0];
                                width = s4[1]
                            } else {
                                color = s4[1];
                                width = s4[0]
                            }
                            str += "<outline color=" + color + " width=" + width + " >";
                            end_tag = "</outline>" + end_tag;
                        }
                    }
                }
                if (s_end == "/>") {
                    str += end_tag;
                } else {
                    end_tags.push(end_tag);
                }
            } else {
                str += s;
            }
        }
        return {string:str,resArr:arr_1}
    },
    //返回图标资源名称列表
    parseStrNew:function (str, handler,resParse) {

        if(str.indexOf("<div")!=-1||str.indexOf("<assets")!=-1){
            return this.parseStr(str,handler);
        }
        if(resParse == false){
            return { string: str, resArr: [] };
        }
        var arr = str.match(/(<.*?>|#\d*|[^<>#]+)/ig);
        var res = [];
        for (var i = 0, n = arr.length; i < n; i++) {
            if (arr[i].length > 4 && arr[i].charAt(0) == '<') {
                var s1 = arr[i].substr(1, 3);
                if (s1 == "img") {
                    var a = arr[i].match(/\w+=[^\s>]+/ig);
                    if (!a) continue;
                    var s2 = a[0].split("=");
                    if (s2.length >= 2 && s2[0] == "src") {
                        res.push(s2[1].replace(/^['"]|['"]$/ig, ''));
                    }
                } else if (s1 == "ass") {//兼容服务器未处理的
                    var a = arr[i].match(/<assets=(\d+)/i);
                    if (a && a.length == 2) {
                        res.push(a[1])
                    }
                }
            }
        }
        return { string: str, resArr: res };
    },
    // 给文本设置字符串 先做解析处理
    richtextSetString: function (richtext, str, handler) {
        richtext.string = this.parse(str);
        this.richtextClick(richtext, handler);
    },

    richtextClick: function (richtext, handler) {
        handler = handler || 'handler';
        for (let i = 0; i < richtext._labelSegments.length; ++i) {
            let labelSegment = richtext._labelSegments[i];
            if (labelSegment._clickHandler) {
                labelSegment._clickParam = labelSegment._clickParam || labelSegment._clickHandler;
                labelSegment._clickHandler = handler;
            }
        }
    },

    //拆分成字符
    splitStr: function (str) {
        var list = {};
    },

    util_num_chn: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
    util_num_std: ["零", "十", "百", "千", "万", "億"],

    //数字转换成小写中文
    numToChinese: function (value) {
        return value
        // value = Number(value) || 0;
        // value_str = String(value);
        // var array = value_str.split("");
        // var length = array.length;
        // var flag = false;
        // var str = "";
        // var len = 0;
        // if(length > 13){
        //     print("只支持13位数字")
        //     return
        // }
        // for(var k in array){
        //     var v = array[k];
        //     if(v.charAt == "0" && length > 1){
        //         flag = true;
        //     }else{

        //     }
        // }
    }

};

module.exports = StringUtil;