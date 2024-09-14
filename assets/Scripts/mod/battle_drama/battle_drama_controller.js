// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-25 14:56:32
// --------------------------------------------------------------------
var BattleEvent = require("battle_event")
var BattleConst = require("battle_const")
var StoryEvent = require("story_event")
var LevupgradeController = require("levupgrade_controller")
var MainuiEvent = require("mainui_event");
var Battle_dramaController = cc.Class({
    extends: BaseController,

    properties: {
        role_vo: null,
    },

    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var Battle_dramaModel = require("battle_drama_model");

        this.model = new Battle_dramaModel();
        this.model.initConfig();

        this.cache_list = [];   //缓存界面列表
        this.callBackList = []; //回调
        this.times = 0;
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        this.create_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () {
            gcore.GlobalEvent.unbind(this.create_role_event);
            this.create_role_event = null;
            var RoleController = require("role_controller")
            this.role_vo = RoleController.getInstance().getRoleVo();
            // this.requestInitProto();
        }).bind(this));
        this.battle_exit_event = gcore.GlobalEvent.bind(BattleEvent.CLOSE_RESULT_VIEW, function(combat_type){
            if(combat_type == BattleConst.Fight_Type.Darma){
                this.handleUnlock()
            }else{
                gcore.GlobalEvent.fire(StoryEvent.BATTLE_RESULT_OVER)
            }
        }.bind(this))

        if (this.loading_enter_scene == null) {
            this.loading_enter_scene = gcore.GlobalEvent.bind(MainuiEvent.LOADING_ENTER_SCENE, (function () {
              if(this.cache_popup){
                this.cache_popup();
              }
              setTimeout(()=>{
                this.showCachePanel();
              },1000)
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(13000, this.on13000);                     // 剧情副本数据
        this.RegisterProtocal(13001, this.on13001);                     // 当前关卡信息
        this.RegisterProtocal(13002, this.on13002);                     // 制作下一关
        this.RegisterProtocal(13003, this.on13003);                     // 挑战BOSS
        this.RegisterProtocal(13004, this.on13004);                     // 使用快速作战
        this.RegisterProtocal(13006, this.on13006);                     // 剧情副本常规信息
        this.RegisterProtocal(13007, this.on13007);                     // 快速作战收获物品展示以及收集金币显示
        this.RegisterProtocal(13008, this.on13008);                     // 通关奖励显示
        this.RegisterProtocal(13009, this.on13009);                     // 领取通关奖励
        this.RegisterProtocal(13010, this.on13010);                     // 开通下一章节
        this.RegisterProtocal(13011, this.on13011);                     // 快速作战BUFF信息
        this.RegisterProtocal(13015, this.on13015);                     // 通关录像
        this.RegisterProtocal(13017, this.on13017);                     // 累积挂机时间
        this.RegisterProtocal(13019, this.on13019);                     // 服务端主动推送挂机收益信息
        this.RegisterProtocal(13018, this.on13018);                     // 主动领取挂机奖励

        this.RegisterProtocal(13016, this.on13016);                     // 剧情战斗结束的结算显示 
        this.RegisterProtocal(13020, this.handle13020);                 // 玩家剧情副本超过其他玩家百分比 

        this.RegisterProtocal(13039, this.on13039);                     // 快速作战第一次花费点击
        this.RegisterProtocal(13040, this.on13040);                     // 快速作战第一次花费提示
    },

    // 登录游戏之后初始化请求的协议
    requestInitProto: function () {
        // this.SendProtocal(13006, {});
        // this.SendProtocal(13008, {});
        // this.SendProtocal(13011, {});
        // this.SendProtocal(13017, {});
    },

    send13000: function() {
        this.SendProtocal(13000, {});
    },

    on13000: function(data) {
        if (data && this.role_vo) {
            this.model.setDramaData(data);
        }
    },

    // 更新关卡信息
    on13001:function(data){
        this.model.updateDramaData(data);
    },

    // 针对快速作战的数据信息
    on13006:function(data){
        this.model.setQuickData(data);
    },
    
    // 通关奖励展示
    on13008:function(data){
        this.model.setDramaReward(data);
    },

    // 快速作战buff信息,这个后面放到需要时候请求去
    on13011:function(data){
        this.model.setBuffData(data);
    },

    // 累积挂机时间
    on13017:function(data){
        this.model.updateHookAccumulateTime(data);
    },

    // 剧情副本战斗结算信息
    on13016:function(data){
        if(data){
            require("battle_controller").getInstance().openFinishView(true,require("battle_const").Fight_Type.Darma, data)
        }
    },

    // 主动领取挂机奖励
    requestGetHookTimeAwards:function(callBack){
        this.SendProtocal(13018, {});
        this.callBackList[13018] = callBack;
    },

    on13018:function(data){
        message(data.msg);
    },

    // 服务端主动推送挂机收益展示
    on13019:function(data){
        // 剧情或者引导中不需要显示处理,这个后续补上去
        if (this.commonalert) return;
        var LoginPopupManager = require("LoginPopupManager")
        var b = LoginPopupManager.getInstance().getIsPopupStatus()
        if(IS_LOADING == true||b){
            if(b == true){
              this.cache_popup = function(data){
                this.on13019(data);
              }.bind(this,data)
            }
            this.cache_list.push({function:function(data){
                this.on13019(data);
            }.bind(this,data)});
            return;
        }
        this.cache_popup = null;

        var MainUIController = require("mainui_controller")
        var MainUiConst = require("mainui_const");

        var main_index = MainUIController.getInstance().getMainUIIndex();
        var desc = Utils.TI18N("您的挂机收益即将达到上限，请前往出击界面领取");
        var confirm_str = Utils.TI18N("前往");

        if (main_index == MainUiConst.new_btn_index.drama_scene){
            confirm_str = Utils.TI18N("确定");
            desc = Utils.TI18N("您的挂机收益即将达到上限，请点击收益宝箱领取");
        }
        
        var CommonAlert = require("commonalert");
        var controller = require("mainui_controller");
        // controller.activityPopupCachesStatus = true;
        // controller.activityPopupStatus = true;
        var confirm_callback = function(){
            if(main_index != MainUiConst.new_btn_index.drama_scene){
              var callback = function(){
                
                var ActivityController = require("activity_controller");
                var model = ActivityController.getInstance().getModel();
                this.dataList = model.getActivityList(); 
                if(this.dataList.length == 0 || this.times>0){
                  return;
                }
                this.times++;
                // var ActivityController = require("activity_controller");
                // ActivityController.getInstance().openActivityPopup(true);
               
              }.bind(this)
                MainUIController.getInstance().changeMainUIStatus(MainUiConst.new_btn_index.drama_scene,null,null,1,callback);
            }
            this.commonalert = null;
        }.bind(this)
        var cancel_callback = function () {
            var ActivityController = require("activity_controller");
            var model = ActivityController.getInstance().getModel();
            this.dataList = model.getActivityList(); 
            if(this.dataList.length == 0||this.times>0){
              return;
            }
            this.times++;
            // var ActivityController = require("activity_controller");
            // ActivityController.getInstance().openActivityPopup(true);
            this.commonalert = null;
        }.bind(this)
        this.commonalert = CommonAlert.show(desc, confirm_str, confirm_callback, Utils.TI18N("取消"), cancel_callback, null, null, {view_tag:SCENE_TAG.reconnect});
    },

    // 快速作战和收集金币展示
    on13007:function(data){
        var callBack = null;
        if(this.callBackList[13018]){
          callBack =this.callBackList[13018];
          this.callBackList[13018] = null;
        }
        this.openDramHookRewardView(true, data,callBack);
    },

    // 打开剧情这边挂机资产
    openDramHookRewardView:function(status, data, callBack){
        if(!status){
            if (this.battle_drama_hook_reward_view){
                this.battle_drama_hook_reward_view.close();
                this.battle_drama_hook_reward_view = null;
            }
        }else{
            // -- 如果在引导中,并且不是特殊处理的的引导,就不弹
            // local guide_config = GuideController:getInstance():getGuideConfig()
            // if guide_config and guide_config.id ~= GuideConst.special_id.quick_guide and guide_config.id ~= GuideConst.special_id.hook_guide  then
            //     return 
            // end
            // -- 设置不要马上显示升级
            LevupgradeController.getInstance().waitForOpenLevUpgrade(true)
            if (this.battle_drama_hook_reward_view == null){
                this.battle_drama_hook_reward_view = Utils.createClass("battle_drama_hook_reward_window");
            }
            this.battle_drama_hook_reward_view.open({data,callBack});
        }
    },

    // 打开快速作战的界面
    openDramBattleQuickView:function(status){
        if(!status){
            if(this.battle_drama_quick_win){
                this.battle_drama_quick_win.close();
                this.battle_drama_quick_win = null;
            }
        }else{
            LevupgradeController.getInstance().waitForOpenLevUpgrade(true)
            if(!this.battle_drama_quick_win){
                this.battle_drama_quick_win = Utils.createClass("battle_drama_quick_window");
            }
            this.battle_drama_quick_win.open();
        }
    },

    // 打开通关奖励界面
    openDramaRewardWindow:function(status){
        if(!status){
            if (this.battle_drama_reward_view){
                this.battle_drama_reward_view.close();
                this.battle_drama_reward_view = null;
            }
        }else{
            if (!this.battle_drama_reward_view){
                this.battle_drama_reward_view = Utils.createClass("battle_drama_reward_window");
            }
            this.battle_drama_reward_view.open();
        }
    },

    // 打开剧情章节录像 
    openDramaPassVedioWindow:function(status){
        if(!status){
            if (this.battle_drama_vedio_view){
                this.battle_drama_vedio_view.close();
                this.battle_drama_vedio_view = null;
            }
        }else{
            if (!this.battle_drama_vedio_view){
                this.battle_drama_vedio_view = Utils.createClass("battle_drama_pass_vedio_window");
            }
            this.battle_drama_vedio_view.open();
        }
    },

    //掉落信息总览界面
    openDramDropWindows:function(value,max_dun_id){
        if(!value){
            if (this.battle_drama_drop_tips_view){
                this.battle_drama_drop_tips_view.close();
                this.battle_drama_drop_tips_view = null;
            }
        }else{
            if (!this.battle_drama_drop_tips_view){
                this.battle_drama_drop_tips_view = Utils.createClass("battle_drama_drop_window");
            }
            this.battle_drama_drop_tips_view.open(max_dun_id);
        }
    },

    //  剧情副本的章节地图界面
    openBattleDramaMapWindows:function( status, chapter_id ){
        if(status == true){
            if(this.battle_drama_map_view == null){
                this.battle_drama_map_view = Utils.createClass("battle_drama_map_window",this);
            }
            if(this.battle_drama_map_view && this.battle_drama_map_view.isOpen() == false){
                this.battle_drama_map_view.open(chapter_id);
            }
            
        }else{
            if(this.battle_drama_map_view){
                this.battle_drama_map_view.close();
                this.battle_drama_map_view = null;
            }
        }
    },

    // 打开Boss信息界面
    openDramBossInfoView:function(value,data){
        if(value == false){
            if(this.battle_drama_boss_info!=null){
                this.battle_drama_boss_info.close();
                this.battle_drama_boss_info = null;
            }
        }else{
            if(this.battle_drama_boss_info == null){
                this.battle_drama_boss_info = Utils.createClass("battle_drama_boos_info_window",this);
            }
            if(this.battle_drama_boss_info && this.battle_drama_boss_info.isOpen() == false){
                this.battle_drama_boss_info.open(data);
            }
        }
    },

    // 制作下一关,请求该协议,会同步返回 13000, 13010
    send13002:function(){
        this.SendProtocal(13002, {});
    },

    // 开启下一章节
    on13002:function(data){
        message(data.msg);
    },

    // 开通下一章节,客户端请求13002 之后的返回
    on13010:function(data){
        this.handleUnlockChapter(data);
    },

    // 打开世界地图,并且播放一些列动画
    handleUnlockChapter:function(data){
        if(Config.dungeon_data.data_drama_dungeon_info[data.dun_id]){
            let next_id = Config.dungeon_data.data_drama_dungeon_info[data.dun_id].next_id
            if (next_id == 0){
                data.is_last_chapter = true
            }
        }
        data.is_last_chapter = false
        if(data){
            var WorldmapController = require("worldmap_controller")
            WorldmapController.getInstance().openWorldMapMainWindow(true,data)
        }
    },

    // 挑战BOSS
    send13003:function(){
        this.SendProtocal(13003, {is_auto:0});
    },

    // 挑战BOSS返回
    on13003:function(data){
        message(data.msg);
    },

    // 快速作战
    send13004:function(){
        this.SendProtocal(13004, {});
    },

    // 快速作战返回
    on13004:function(data){
        message(data.msg);
    },

    // 领取通关奖励
    send13009:function(id){
        var protocal = {}
        protocal.id = id;
        this.SendProtocal(13009, protocal);
    },

    // 领取通关奖励返回
    on13009:function(data){
        message(data.msg);
        if(data.code == 1){
            this.model.updateDramaReward(data.id)
        }
    },

    // 请求通关录像
    send13015:function(id){
        var protocal = {};
        protocal.dun_id = id;
        this.SendProtocal(13015, protocal);
    },

    // 录像
    on13015:function(data){
        if(data && data.dungeon_replay_log){
            var DramaEvent = require("battle_drama_event")
            gcore.GlobalEvent.fire(DramaEvent.UpdatePassVedioDataEvent, data.dungeon_replay_log)
        }
    },

    // 剧情副本进度超过其他玩家百分比
    send13020:function(  ){
        this.SendProtocal(13020, {});
    },
    
    handle13020:function( data ){
        if(data.val){
            var DramaEvent = require("battle_drama_event")
            gcore.GlobalEvent.fire(DramaEvent.UpdateDramaProgressDataEvent, data.val);
        }
    },

    getDramaBattlePassRewardRoot: function() {
        if (this.battle_drama_reward_view)
            return this.battle_drama_reward_view.root_wnd;
    },

    getDramaBattleHookRewardRoot: function() {
        if (this.battle_drama_hook_reward_view)
            return this.battle_drama_hook_reward_view.root_wnd;
    },

    getDramBattleQuickRoot: function() {
        if (this.battle_drama_quick_win)
            return this.battle_drama_quick_win.root_wnd;
    },

    handleUnlock(){
        let drama_data = this.model.getDramaData()
        if(drama_data){
            let is_show, data = this.model.getPreStatus(drama_data.max_dun_id)
            if(is_show && data.is_show == true){
                this.openBattleDramaUnlockWindow(true, data)
                cc.sys.localStorage.setItem('drama_data', JSON.stringify(drama_data.max_dun_id));
                // SysEnv:getInstance():saveDramaTipsFile({ dun_id = drama_data.max_dun_id})
            }else{
                // -- 直接抛出时间可以播放引导或者剧情了
                gcore.GlobalEvent.fire(StoryEvent.BATTLE_RESULT_OVER)
            }
        }
    },
    openBattleDramaUnlockWindow(){
        var self = this
        if(value == false){
            if(self.battle_drama_unlock_view != null){
                self.battle_drama_unlock_view.close()
                self.battle_drama_unlock_view = null
            }
        }else{
            if(self.battle_drama_unlock_view == null){
                let BattleDramaUnlockWindow = require("battle_drama_unlock_window")
                self.battle_drama_unlock_view = new BattleDramaUnlockWindow()
            }

            if(self.battle_drama_unlock_view && self.battle_drama_unlock_view.isOpen() == false){
                self.battle_drama_unlock_view.open(data)
            }
        }
    },
    openBattleDramaUnlockChapterView(value, data){
        var self = this
        if(value == false){
            if(self.battle_drama_unlock_chapter_view != null){
                self.battle_drama_unlock_chapter_view.close()
                self.battle_drama_unlock_chapter_view = null
            }
        }else{
            if(self.battle_drama_unlock_chapter_view == null){
                let BattleDramaUnlockChapterView = require("battle_drama_unlock_chapter_window")
                self.battle_drama_unlock_chapter_view = new BattleDramaUnlockChapterView()
            }

            if(self.battle_drama_unlock_chapter_view && self.battle_drama_unlock_chapter_view.isOpen() == false){
                self.battle_drama_unlock_chapter_view.open(data)
            }
        }
    },

    //进入主场景后显示缓存的界面
    showCachePanel:function(){
        if(this.cache_list == null || this.cache_list.length<=0)return;
        for(var i in this.cache_list){
            if(this.cache_list[i].function){
                this.cache_list[i].function();
            }
        }
        this.cache_list = [];
    },

    send13039:function(){
        this.SendProtocal(13039,{});
    },

    //快速作战第一次花费记录
    on13039:function(data){
    },

    send13040:function(){
        this.SendProtocal(13040,{});
    },

    //快速作战第一次花费记录
    on13040:function(data){
        this.model.setFirstFresh(data.flag != 1);
    },
});

module.exports = Battle_dramaController;