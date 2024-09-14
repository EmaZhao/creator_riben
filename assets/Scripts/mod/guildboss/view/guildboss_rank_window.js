// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     公会副本排行榜
// <br/>Create: 2019-02-21 17:18:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var GuildBossController = require("guildboss_controller");
var GuildBossRankItem = require("guildboss_rank_item_panel");

var Guildboss_rank_Window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_rank_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.selected_tab = null;
        this.tab_list = {};
        this.panel_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild("background");
        var main_container = this.seekChild("main_container");
        var main_panel = this.seekChild(main_container,"main_panel");
        this.background.scale = FIT_SCALE;
        var scroll_view = this.seekChild(main_panel,"scroll_view");
        var list_size = scroll_view.getContentSize();
        var setting = {
            item_class: GuildBossRankItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 596,               // 单元的尺寸width
            item_height: 140,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView()
        this.scroll_view.createScroll(scroll_view, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5));
        Utils.getNodeCompByPath("main_container/main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("排行奖励");
        Utils.getNodeCompByPath("main_container/main_panel/award_title", this.root_wnd, cc.Label).string = Utils.TI18N("奖励");
        Utils.getNodeCompByPath("main_container/main_panel/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("排名");
        Utils.getNodeCompByPath("main_container/main_panel/rewards_notice", this.root_wnd, cc.Label).string = Utils.TI18N("奖励在结算完成后通过邮件发放");
        Utils.getNodeCompByPath("main_container/main_panel/close_notice", this.root_wnd, cc.Label).string = Utils.TI18N("点击黑色区域关闭窗口");
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END,function(){
            GuildBossController.getInstance().openGuildBossRankWindow(false);
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(data && data.config){
            var rewards_config = gdata("guild_dun_data","data_rank_reward",[data.config.boss_id]);
            if(rewards_config){
                var temp_config = Utils.deepCopy(rewards_config);
                temp_config.sort(Utils.tableLowerSorter(["rank1"]));
                this.scroll_view.setData(temp_config,null,this.item);
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        GuildBossController.getInstance().openGuildBossRankWindow(false);
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null
        }
        for(var k in this.panel_list){
            this.panel_list[k].deleteMe();
            this.panel_list[k] = null;
        }
        this.panel_list = null;
    },
})