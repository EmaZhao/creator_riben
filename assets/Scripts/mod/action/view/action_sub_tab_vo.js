/*-----------------------------------------------------+
 * 子活动的显示数据,主要是左侧标签以及部分活动面板内部使用
 * @author zys
 +-----------------------------------------------------*/
 var TimeTool = require("timetool")
 var ActionSubTabVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        var self = this
        self.bid = 0            //--子活动编号
        self.sort_val = 0       //--排序
        self.title = ""         //--子活动标题
        self.ico = ""           //--子活动左侧图标
        self.type_ico = 0       //--子活动热门等戳
        self.panel_type = 0     //--子活动客户端面板类型(3-介绍)
    
        self.is_show_in_action = true
        
        // ----------------------以上是标签需要的数据,下面是扩展数据,不一定需要
    
        self.reward_title = ""  //--子活动子项背景
        self.aim_title = ""     //--子活动目标标题(现在用于活动标签面板的背景,对应资源路径为 action/action_img/XX)
        self.title2 = ""        //--子活动标题2,显示在横幅上面
        self.top_banner = ""    //--子活动顶部横幅图片
        self.rule_str = ""      //--子活动规则
        self.time_str = ""      //--子活动时间
        self.bottom_alert = ""  //--子活动底部提示
        self.channel_ban = ""   //--不显示的渠道(只有客户端用)
        self.remain_sec = 0     //--子活动剩余活动秒数

        self.cli_type = 0       //活动类型,现在对应的是活动图标id
        self.cli_type_name = "" //活动图标的名字,动态调整

        self.camp_id = 0        //--活动编号
    
        self.tips_status = false
    },

    update: function (data) {
        if (data) {
            for (var k in data) {
                this.setParam(k, data[k])
            }
        }
    },
    setShowStatus(status){
        this.is_show_in_action = status
    },

    isShowInAction(){
        return this.is_show_in_action
    },
    setParam: function (key, value) {
        if (this[key] != value) {
            this[key] = value;
        }
    },
    updateTime(){
        this.remain_sec--
    },

    getTime:function () {
      var desc = "";
      let tiem = this.remain_sec;
      if(tiem && tiem>0){
        desc = TimeTool.getTimeForFunction(tiem)
      }
      return desc;
    },

    setRedPointStatus:function(status){
      if(this.redPointStatus != status){
        this.redPointStatus =status;
      }
    },

    getRedPointStatus:function(){
      if(!this.redPointStatus){
        this.redPointStatus = false;
      }
      return this.redPointStatus;
    },


    setTipsStatus:function(status){
        this.tips_status = status != 0;
        this.fire(ActionSubTabVo.UPDATE_TIPS_STATUS);
    },

    _delete: function () {

    },


});
ActionSubTabVo.UPDATE_TIPS_STATUS = "ActionSubTabVo.UPDATE_TIPS_STATUS";

module.exports = ActionSubTabVo;