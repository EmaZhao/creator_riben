// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 11:41:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaConst = require("arena_const");
var TimeTool = require("timetool");

var ArenaChampionMyMatchReadyPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_my_match_ready_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        var base_config = Config.arena_champion_data.data_const.battle_members
        if (base_config) {
            this.need_rank_index = base_config.val;
        } else {
            this.need_rank_index = 1024;
        }
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        this.notice_txt_lb = this.seekChild("notice_txt", cc.Label);
        this.des_txt_rt = this.seekChild("des_txt", cc.RichText);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidget();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },

    updateWidget: function() {
        var my_status = this.model.getMyMatchStatus();

        if (my_status == ArenaConst.champion_my_status.in_match) return;
        if (my_status == ArenaConst.champion_my_status.unopened) {
            this.notice_txt_lb.string = Utils.TI18N("本次冠军赛尚未开启");
            this.base_info = this.model.getBaseInfo();
            if (this.base_info) {
                this.less_time = this.base_info.step_status_time - gcore.SmartSocket.getTime();
                if (this.less_time > 0)
                    this.startUpdate();
            }
        } else if (my_status == ArenaConst.champion_my_status.unjoin) {
            this.notice_txt_lb.string = Utils.TI18N("您未能参与本次冠军赛");
            var str = Utils.TI18N("可前往竞猜界面参与竞猜玩法，各种稀有道具等你来兑换");
            this.des_txt_rt.string = str;
        }
    },

    update: function(dt) {
        var cur_time = Math.ceil(this.less_time - dt);
        if (cur_time < Math.ceil(this.less_time) || (this.less_time === this.base_info.step_status_time - gcore.SmartSocket.getTime())) {
            var less_time_str = TimeTool.getTimeFormat(Math.ceil(this.less_time));
            var des_str = cc.js.formatStr(Utils.TI18N("开启倒计时:<color=#66e734>%s</color>\n排位赛名前<color=#66e734>%s名</color>的玩家将自动参与"), less_time_str, this.need_rank_index);
            this.des_txt_rt.string = Utils.TI18N(des_str);
            this.less_time = cur_time;
        }
        this.less_time -= dt;

        if (this.less_time < 0) {
            this.stopUpdate();
        }
    },

    // 主界面基础信息更新
    updateBaseInfo: function() {

    },
})