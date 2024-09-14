// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      时间工具
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var TimeTool = {
    // 获取时间转换的

    //生成时间格式为00:00:00的(时：分：秒)
    getTimeFormat: function (less_time) {
        less_time = Number(less_time) || 0;
        var hour = Math.floor(less_time / 3600);
        var min = Math.floor((less_time % 3600) / 60);
        var sec = less_time % 3600 % 60;
        hour = (hour < 10) && "0" + hour || hour;
        min = (min < 10) && "0" + min || min;
        sec = (sec < 10) && "0" + sec || sec;
        return hour + ":" + min + ":" + sec
    },

    //生成时间格式为00:00的(分：秒)
    getMinSecTime: function (less_time) {
        less_time = Number(less_time) || 0;
        var hour = Math.floor(less_time / 3600);
        var min = Math.floor((less_time % 3600) / 60);
        var sec = Math.floor(less_time % 3600 % 60);
        min = hour * 60 + min;
        min = (min < 10) && "0" + min || min;
        sec = (sec < 10) && "0" + sec || sec;
        return min + ":" + sec
    },

    //生成时间格式为00:00:00的(时：分：秒)
    getTimeFormatII: function (less_time) {
        less_time = Number(less_time) || 0;
        var hour = Math.floor(less_time / 3600);
        var min = Math.floor((less_time % 3600) / 60);
        var sec = Math.floor(less_time % 3600 % 60);
        if (sec <= 0) {
            if (min <= 0) {
                return hour + "時間"
            } else {
                return hour + cc.js.formatStr("時間%s分", min)
            }
        }
        return hour + cc.js.formatStr("時間%s分%s秒", min, sec)
    },

    //生成时间格式为00:00:00的(时：分)
    GetTimeFormatTwo: function (less_time, is_num) {
        less_time = Number(less_time) || 0;
        var hour = Math.floor(less_time / 3600);
        var min = Math.floor((less_time % 3600) / 60);
        var sec = Math.floor(less_time % 3600 % 60);
        var str_hour = (hour < 10) && "0" + hour || hour;
        var str_min = (min < 10) && "0" + min || min;
        var str_sec = (sec < 10) && "0" + sec || sec;
        if (hour <= 0) {
            if (is_num != null) {
                return str_min + ":" + str_sec
            }
            return str_min + "分" + str_sec + "秒"
        } else {
            if (is_num != null) {
                return str_hour + ":" + str_min
            }
            return str_hour + "時間" + str_min + "分"
        }
    },

    //生成时间格式为00:00的(时：分)
    getTimeFormatIII: function (less_time) {
        less_time = Number(less_time) || 0;
        var hour = Math.floor(less_time / 3600);
        var min = Math.floor((less_time % 3600) / 60);
        hour = (hour < 10) && "0" + hour || hour;
        min = (min < 10) && "0" + min || min;
        return hour + ":" + min
    },

    getTimeMs: function (less_time, isNum) {
        less_time = Number(less_time) || 0
        var hour = Math.floor(less_time / 3600)
        var min = Math.floor((less_time % 3600) / 60)
        var sec = Math.floor(less_time % 3600 % 60)
        if (isNum != null) {
            sec = (sec < 10) && "0" + sec || sec
            var max_m = hour * 60 + min
            max_m = (max_m < 10) && "0" + max_m || max_m
            return max_m + ":" + sec
        }

        else {
            return cc.js.formatStr("%s分%s秒", hour * 60 + min, sec)
        }
    },

    //传入时间戳，生成时间格式为(年-月-日 时：分：秒)
    getYMDHMS: function (less_time) {
        return this.dateFtt("yyyy-MM-dd hh:mm:ss", less_time)
    },

    //传入时间戳，生成时间格式为(月-日 时：分：秒)
    getMDHMS: function (less_time) {
        return this.dateFtt("MM-dd hh:mm:ss", less_time)
    },
    //传入时间戳，生成时间格式为(月-日 )
    getMD: function (less_time) {
        return this.dateFtt("MM.dd", less_time)
    },
    //传入时间戳，生成时间格式为(月-日 时：分)
    getMDHM: function (less_time) {
        return this.dateFtt("MM-dd hh:mm", less_time)
    },
    //传入时间戳，生成时间格式为(时：分：秒)
    getHMS: function (less_time) {
        return this.dateFtt("hh:mm:ss", less_time)
    },
    //传入时间戳，生成时间格式为(年 时：分：秒)
    getYDHM: function (less_time) {
        return this.dateFtt("yyyy hh:mm:ss", less_time)
    },
    //传入时间戳，生成时间格式为(时：分)
    getHM: function (less_time) {
        return this.dateFtt("hh:mm", less_time)
    },
    //传入时间戳，生成时间格式为(分：秒)
    getMS: function (less_time) {
        return this.dateFtt("mm:ss", less_time)
    },

    //传入时间戳，生成时间格式为(年-月-日)
    getYMD: function (less_time) {
        return this.dateFtt("yyyy-MM-dd", less_time)
    },

    //功能：传入时间戳，生成时间格式为(xxxx年xx月xx日)
    getYMD2: function (less_time) {
        return this.dateFtt("yyyy" + Utils.TI18N("年") + "MM" + Utils.TI18N("月") + "dd" + Utils.TI18N("日"), less_time)
    },
     //功能：传入时间戳，生成时间格式为(xxxx/xx/xx)
    getYMD3: function (less_time) {
      return this.dateFtt("yyyy" + "/" + "MM" + "/" + "dd" , less_time)
    },

    getYMD4: function (less_time) {
      return this.dateFtt("yyyy" + "." + "MM" + "." + "dd" , less_time)
    },

    getYMD5: function (less_time) {
      var m = this.dateFtt("MM", less_time);
        var d = this.dateFtt("dd", less_time);
      return  m + "." + d ;
    },

    getMD2: function (less_time) {
        var m = this.dateFtt("MM", less_time);
        var d = this.dateFtt("dd", less_time);
        return m + "月" + d + "日"
    },

    //获取距离第二天凌晨0点所剩下的时间
    getOneDayLessTime: function () {

    },

    //格式输出
    //（格式，时间戳）
    dateFtt: function (fmt, less_time) {
        if (less_time == null) {
            return 0
        }
        //需要13位时间戳(也即是毫秒)
        var date = new Date(less_time * 1000);
        var o = {
            "M+": date.getMonth() + 1,                 //月分   
            "d+": date.getDate(),                    //日   
            "h+": date.getHours(),                   //時間   
            "m+": date.getMinutes(),                 //分   
            "s+": date.getSeconds(),                 //秒   
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
            "S": date.getMilliseconds()             //毫秒   
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },


    //1天秒数
    day2s: function () {
        return 86400
    },

    //转换成时间戳  格式为： 年-月-日 小时：分钟：秒
    getTimeStamp(list){//数组
      var year = list[0]|0;
      var month = list[1]|0;
      var dates = list[2]|0;
      var hours = list[3]|0;
      var minutes = list[4]|0;
      var seconds = list[5]|0;
      var str = year + "-" + month + "-" + dates + " " + hours + ":" + minutes + ":" + seconds;
      var date = new Date(str);
      var time = date.getTime()/1000;
      return time;
    },


    getDayDifference: function (time_tmps) {

    },

    //xx天xx小时xx分xx秒
    getTimeFormatDay: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / TimeTool.day2s())
        var lessT = Math.floor(less_time % TimeTool.day2s())
        var hour = Math.floor(lessT / 3600)
        var min = Math.floor((lessT % 3600) / 60)
        var sec = Math.floor(lessT % 3600 % 60)
        var dayStr = ""
        if (day >= 1) {
            dayStr = day + "日"
        }
        if (day >= 1) {
            if (hour > 0)
                return dayStr + hour + "時間"
            else
                return dayStr
        }
        else {
            if (sec <= 0) {
                if (min <= 0) {
                    if (hour <= 0)
                        return ""
                    return dayStr + hour + "時間"
                }
                else
                    return dayStr + hour + cc.js.formatStr("時間%s分", min)
            }
            return dayStr + hour + cc.js.formatStr("時間%s分", min)
        }
    },

    //大于1天显示xx天 小于一天显示xx小时xx分xx秒
    getTimeDayOrTime: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / TimeTool.day2s())
        var dayStr = ""
        if (day >= 1) {
            dayStr = day + "日"
            return dayStr
        }
        if (day < 1)
            return os.date("%X ", less_time)
    },

    //显示两单位计时
    getTimeFormatDayII: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / 86400)
        var lessT = Math.floor(less_time % 86400)
        var hour = Math.floor(lessT / 3600)
        var min = Math.floor((lessT % 3600) / 60)
        var sec = Math.floor(lessT % 3600 % 60)
        var dayStr = ""
        var hourStr = ""
        var minStr = ""
        var secStr = ""
        if (sec >= 1)
            secStr = sec + "秒"
        if (min >= 1)
            minStr = min + "分"
        if (hour >= 1)
            hourStr = hour + "時間"
        if (day >= 1)
            return day + "日" + hourStr
        else
            if (hour >= 1)
                return hourStr + minStr
            else
                return minStr + secStr
        // return hourStr+minStr+secStr
    },

    //显示两单位计时
    getTimeFormatDayIII: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / 86400)
        var lessT = Math.floor(less_time % 86400)
        var hour = Math.floor(lessT / 3600)
        var min = Math.floor((lessT % 3600) / 60)
        var sec = Math.floor(lessT % 3600 % 60)
        var dayStr = ""
        var hourStr = ""
        var minStr = ""
        var secStr = ""
        if (day >= 1) {
            if (hour >= 1) {
                hourStr = hour + "時間"

                dayStr = day + "日"
                return dayStr + hourStr
            }
        }
        else {
            hourStr = hour + "時間"
            minStr = min + "分"
            secStr = sec + "秒"
            return hourStr + minStr + secStr
        }
    },

    //当大于1天时，显示x天，小于一天时，显示x时x分
    getTimeFormatDayIV: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / 86400)
        var time_str = ""
        if (day >= 1)
            time_str = day + "日"
        else {
            var lessT = Math.floor(less_time % 86400)
            var hour = Math.floor(lessT / 3600)
            var min = Math.floor((lessT % 3600) / 60)
            var sec = Math.floor(lessT % 3600 % 60)
            if (hour < 10) hour = "0" + hour
            if (min < 10) min = "0" + min
            if (sec < 10) sec = "0" + sec
            time_str = hour + ":" + min + ":" + sec
            return time_str
        }
    },

    //获得天，小时，分，秒
    getTimeName: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / TimeTool.day2s())
        var lessT = Math.floor(less_time % TimeTool.day2s())
        var hour = Math.floor(lessT / 3600)
        var min = Math.floor((lessT % 3600) / 60)
        var sec = Math.floor(lessT % 3600 % 60)
        return day, hour, min, sec
    },

    //大于1天显示x天x小时，少于一天显示x小时xfen
    getTimeFormatDayIIIIII: function (less_time) {
        less_time = Number(less_time) || 0
        var day = Math.floor(less_time / TimeTool.day2s())
        var lessT = Math.floor(less_time % TimeTool.day2s())
        var hour = Math.floor(lessT / 3600)
        var min = Math.floor((lessT % 3600) / 60)
        var sec = Math.floor(lessT % 3600 % 60)
        var dayStr = ""
        if (day >= 1)
            dayStr = day + "日"
        if (day >= 1)
            return dayStr + hour + "時間"
        else {
            if (sec <= 0) {
                if (min <= 0) {
                    if (hour <= 0)
                        return ""
                    return dayStr + hour + "時間"
                } else
                    return dayStr + hour + cc.js.formatStr("時間%s分", min)
            }
            return dayStr + hour + cc.js.formatStr("時間%s分", min)
        }
    },

    getTimeFormatDayIIIIIIII: function (less_time) {
        less_time = Number(less_time) || 0;
        var day = Math.floor(less_time / 86400);
        var lessT = Math.floor(less_time % 86400);
        var hour = Math.floor(lessT / 3600);
        var min = Math.floor((lessT % 3600) / 60);
        var sec = Math.floor(lessT % 3600 % 60);
        var time_str = "";
        if (hour < 10) {
            hour = "0" + hour
        }
        if (min < 10) {
            min = "0" + min
        }
        if (sec < 10) {
            sec = "0" + sec
        }
        if (day >= 1) {
            time_str = day + "日" + hour + ":" + min + ":" + sec //cc.js.formatStr("%d天%d:%d:%d",day,hour,min,sec)
        } else {
            time_str = hour + ":" + min + ":" + sec//cc.js.formatStr("%d:%d:%d", hour, min,sec)
        }
        return time_str;
    },

    //图标需要的时间显示
    getTimeForFunction(less_time) {
        less_time = Number(less_time) || 0
        let day = Math.floor(less_time / TimeTool.day2s())
        let lessT = Math.floor(less_time % TimeTool.day2s())
        let hour = Math.floor(lessT / 3600)
        let min = Math.floor((lessT % 3600) / 60)
        let sec = Math.floor(lessT % 3600 % 60)
        if (day >= 1) {
            return day + "日" + hour + "時間"
        } else {
            let str_hour = (hour < 10) && "0" + hour || hour
            let str_min = (min < 10) && "0" + min || min
            let str_sec = (sec < 10) && "0" + sec || sec
            if (hour >= 1) {
                return str_hour + ":" + str_min + ":" + str_sec
            } else {
                return str_min + ":" + str_sec
            }
        }
    },
    //邮件用 不满1天显示小时 以此类推
    getDayOrHour: function (less_time) {
        less_time = Number(less_time) || 0;
        var day = Math.floor(less_time / TimeTool.day2s());
        var lessT = Math.floor(less_time % TimeTool.day2s());
        var hour = Math.floor(lessT / 3600);
        var min = Math.floor((lessT % 3600) / 60);
        var sec = Math.floor(lessT % 3600 % 60);
        if (day >= 1) {
            return day + "日"
        }
        else if (hour >= 1) {
            return hour + "時間"
        }
        else if (min >= 1) {
            return min + "分"
        }
        else if (sec >= 1) {
            return sec + "秒"
        }
    },

    // 好友列表显示时间
    //  1   小于24小时以内，显示“xx小时前”，小时向上取整   
    //  2   大于24小时以上，显示“xx天前”，天数向上取整    
    //  3   大于72小时以上，统一显示“3天以上” 
    getTimeFormatFriendShowTime:function(less_time){
        less_time = Number(less_time) || 0;
        let day = Math.floor(less_time/TimeTool.day2s());
        if(day >= 3){
            return Utils.TI18N("3日前");
        }
        if(day > 0){
            return day+Utils.TI18N("日前");
        }

        let lessT = Math.floor(less_time%TimeTool.day2s());
        let hour = Math.ceil(lessT / 3600);

        if(hour <= 0){
            hour = 1;
        }
        return hour+Utils.TI18N("時間前");
    },
    
};
module.exports = TimeTool;