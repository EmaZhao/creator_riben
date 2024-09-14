// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-10 20:42:57
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaRewardItem = require("battle_drama_reward_item_panel");
var CommonScrollView = require("common_scrollview");
var DramaEvent = require("battle_drama_event");
var BattleDramaRewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_reward_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.controller = require("battle_drama_controller").getInstance();
        this.model = this.controller.getModel();
        this.config_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.root_wnd.name = "battle_drama_reward_window";

        this.background = this.seekChild("background");
        this.close_btn = this.seekChild("close_btn");                       // 关闭按钮
        this.win_title = this.seekChild("win_title", cc.Label);             // wintitle
        this.win_title.string = Utils.TI18N("通关奖励")
        this.list_panel = this.seekChild("list_panel");                     // 列表展示
        this.background.scale = FIT_SCALE;
        let panel_bg = this.seekChild("panel_bg", cc.Sprite);    
        this.loadRes(PathTool.getBigBg("bigbg_61"),function(res){
            panel_bg.spriteFrame = res
        }.bind(this))

        this.panel_bg = this.seekChild("panel_bg",cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_61"),function(sp){
            this.panel_bg.spriteFrame = sp;
        }.bind(this))

        var scroll_view_size = cc.size(this.list_panel.width, this.list_panel.height)
        var setting = {
            item_class: BattleDramaRewardItem,
            start_x: 4,
            space_x: 0,
            start_y: 0,
            space_y: 7,
            item_width: 600,
            item_height: 168,
            row: 1,
            col: 1,
            once_num: 1,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.list_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.controller.openDramaRewardWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.controller.openDramaRewardWindow(false);
        }.bind(this), 2);

        this.addGlobalEvent(DramaEvent.BattleDrama_Drama_Reward_Data, function(id){
            this.updateShowInfoList(id);
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.updateShowInfoList();
    },

    // 初始化奖励列表
    initConfigRewardList:function(){
        if (this.rewards_list) return;
        this.rewards_list = []
        var floor = 0;
        var pass_list = this.model.getDramaRewardPassList();         // 已通关列表
        var drama_data = this.model.getDramaData();                  // 当前剧情副本数据
        if (!drama_data) return;
        var max_dun_id = drama_data.max_dun_id;
        var cur_drama_dungeon_info = Config.dungeon_data.data_drama_dungeon_info[max_dun_id];
        // if (!cur_drama_dungeon_info) return;
        if(cur_drama_dungeon_info){
            floor = cur_drama_dungeon_info.floor || 0;                    // 当前层,用于比较的
        }

        // 遍历出整个列表
        for(var key in Config.dungeon_data.data_drama_reward){
            var config = Config.dungeon_data.data_drama_reward[key];
            if (config){
                var target_config = Config.dungeon_data.data_drama_dungeon_info[config.limit_id];
                if (target_config) {
                    var object = { config_data: config, id: config.id, is_received: pass_list[config.id] || false, cur_dun: floor, sort_index: 0, target_dun: target_config.floor };
                    this.rewards_list.push(object);
                    if (max_dun_id >= config.limit_id) {
                        if (object.is_received == true) {
                            object.sort_index = 3;      // 已领取
                        } else {
                            object.sort_index = 1;      // 可领取
                        }
                    } else {
                        object.sort_index = 2;          // 条件不满足
                    }
                    // 储存一下
                    this.config_list[config.id] = object;
                }
            }
        }
    },

    // 更新显示
    updateShowInfoList:function(id){
        if(id == null){
            this.initConfigRewardList();
        }else{
            var object = this.config_list[id];
            if(object){
                object.is_received = true;          // 已领取
                object.sort_index = 3;              // 已领取排序id
            }
        }
        if(this.rewards_list){
            this.rewards_list.sort(Utils.tableLowerSorter(["sort_index", "id"]));
            this.item_scrollview.setData(this.rewards_list);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.rewards_list = null;
        this.config_list = null;
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        this.controller.openDramaRewardWindow(false);
    },
})
