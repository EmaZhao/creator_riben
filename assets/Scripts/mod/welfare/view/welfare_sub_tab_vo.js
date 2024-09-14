/*-----------------------------------------------------+
 * 子活动的显示数据,主要是左侧标签以及部分活动面板内部使用
 * @author zys
 +-----------------------------------------------------*/
 var TimeTool = require("timetool");
var WelfareSubTabVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.bid = 0           //子活动编号
        this.sort_val = 0      //排序
        this.title = ""        //子活动标题
        this.ico = ""          //子活动左侧图标
        this.type_ico = 0      //子活动热门等戳
        this.panel_type = 0    //子活动客户端面板类型(3-介绍)

        //--------------------以上是标签需要的数据,下面是扩展数据,不一定需要

        this.reward_title = "" //子活动子项背景
        this.aim_title = ""    //子活动目标标题(现在用于活动标签面板的背景,对应资源路径为 action/action_img/XX)
        this.title2 = ""       //子活动标题2,显示在横幅上面
        this.top_banner = ""   //子活动顶部横幅图片
        this.rule_str = ""     //子活动规则
        this.time_str = ""     //子活动时间
        this.bottom_alert = "" //子活动底部提示
        this.channel_ban = ""  //不显示的渠道(只有客户端用)
        this.remain_sec = 0    //子活动剩余活动秒数

        this.tips_status = false
    },

    update: function (data) {
        if (data) {
            for (var k in data) {
                this.setParam(k, data[k])
            }
        }
    },

    setTipsStatus: function (status) {
        this.tips_status = status != 0;
    },

    setParam: function (key, value) {
        if (this[key] != value) {
            this[key] = value;
        }
    },

    getTime:function () {
      var desc = "";
      let tiem = this.remain_sec;
      if(tiem && tiem>0){
        desc = TimeTool.getTimeForFunction(tiem)
      }
      return desc;
    },

    _delete: function () {

    },


});

module.exports = WelfareSubTabVo;