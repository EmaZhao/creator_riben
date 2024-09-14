// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-15 14:38:52
// --------------------------------------------------------------------
var StoryController = require("story_controller");
var GuideMainView   = require("guide_main_window");
var StoryEvent      = require("story_event");
var GuideEvent      = require("guide_event");

var GuideController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var GuideModel = require("guide_model");

        this.model = new GuideModel();
        this.model.initConfig();
        this.is_guiding = false;
        this.guide_list = [];        // 缓存的引导id
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function() {
        //     var data = {};
        //     data.id = 10185;
        //     this.handle11120(data);
        // }.bind(this))
        this.init_role_event = gcore.GlobalEvent.bind(StoryEvent.STORY_OVER, function() {
            if (this.guide_list && this.guide_list.length > 0) {
                var cur_guide = this.guide_list.shift();
                this.checkGuideToPlay(cur_guide); 
            }
        }.bind(this))   
        this.can_play_drama_event = gcore.GlobalEvent.bind(StoryEvent.PREPARE_PLAY_PLOT, function(){
            if(this.guide_list != null && Utils.next(this.guide_list) != null){
                if(this.guide_list.length){
                    let config = this.guide_list.splice(0,1)//table.remove(self.guide_list, 1)
                    this.checkGuideToPlay(config)
                }
            }
        }.bind(this))     
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(11120, this.handle11120.bind(this));   // 播放引导
        this.RegisterProtocal(11121, this.handle11121.bind(this));   // 引导心跳包
        this.RegisterProtocal(11123, this.handle11123.bind(this));   // 清除所有剧情和引导        
    },

    handle11120: function(data) {
        cc.log("收到服务端执行引导协议");
        cc.log(data);
        // return;
        if (!data || !data.id) return 
        if (this.cur_guide_config && this.cur_guide_config.id == data.id) return;
        // 如果没有引导数据,直接结束掉
        var config = Config.drama_data.data_guide[data.id];
        if (!config) {
            this.startPlayGuide(false, data.id);
            return
        } 
        
        // 储存服务器发送过来的该引导已经完成的步数
        this.startPlayGuide(true, data.id);
    },

    send11121: function(guide_id, step) {
        var protocal = {};
        protocal.id = guide_id;
        protocal.n = step;
        this.SendProtocal(11121, protocal);
    },

    handle11121: function(data) {
        if (this.guide_view) {
            cc.log("保存成功，服务器返回");
            this.guide_view.doNextGuideFromServer(data.id, data.n);
        }
    },

    handle11123: function() {

    },

    // ==============================--
    // desc:开始播放客户端引导
    // time:2017-07-24 08:06:26
    // @status:
    // @id:
    // @return  
    // ==============================--
    startPlayGuide: function(status, id, is_skip) {
        gcore.GlobalEvent.fire(GuideEvent.CloseButtonListPanelEffect)
        if (!status) {
            // 这个时候做一个处理吧
            this.delayTouchEnabled();
            if (this.guide_view) {
                this.guide_view.close();
                this.guide_view = null;
            }
            this.is_guiding = false;
            this.cur_guide_config = null
            this.send11122(id, is_skip);
            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo.lev == 5){
              gcore.GlobalEvent.fire(GuideEvent.GuideClose);
            }

            // 是否有下一个引导
            if (this.guide_list && this.guide_list.length > 0) {
                cc.log("执行缓存中的引导");
                var config = this.guide_list.shift();
                    this.checkGuideToPlay(config);
            } else {
                // 主ui的聊天气泡
                var MainuiController = require("mainui_controller")
                MainuiController.getInstance().setMainUIChatBubbleStatus(true)                
            }
        } else {
            cc.log("222");
            // 如果客户端缓存已经完成了该引导则不需要继续了
            // var guide_cache = RoleEnv:getInstance():get(RoleEnv.keys.guide_step_list, {})
            // if guide_cache[id] ~= nil then
            //     if guide_cache[id][RoleEnv.keys.guide_over_step] == true then
            //         this.startPlayGuide(false, id)
            //         return 
            //     end
            // end

            var config = Config.drama_data.data_guide[id];

            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();

            var guide_cache_data = cc.sys.localStorage.getItem("guide_data" + role_vo.srv_id + role_vo.rid);   

            if (guide_cache_data) {
                guide_cache_data = JSON.parse(guide_cache_data);
                if (guide_cache_data[id] && guide_cache_data[id][config.over_step]) {
                    this.startPlayGuide(false, id);
                    return;                    
                }
            }

            if (!config || !config.act || config.act.length == 0) {
                this.startPlayGuide(false, id);
                return;
            }

            cc.log("111");

            // 判断播放引导
            this.checkGuideToPlay(config);
        }
    },

    send11122: function(id, is_skip) {
        if (is_skip) {
            is_skip = true;
        } else {
            is_skip = false;
        }

        var protocal = {};
        protocal.id = id;
        protocal.is_skip = is_skip;
        this.SendProtocal(11122, protocal)        
    },

    checkGuideToPlay: function(config) {
        if (!config) return;

        // 正在播放当前引导,不需要储存了
        if (this.cur_guide_config && this.cur_guide_config.id == config.id) return;

        // 待播放引导列表里面存在,也不需要存了
        for (var guide_i in this.guide_list) {
            if (this.guide_list[guide_i].id == config.id)
                return;
        }

        // 剧情状态下.不播放引导
        var story_status = StoryController.getInstance().getModel().isStoryState() || false; 
        var adult_story_state = require("hero_controller").getInstance().getModel().isAdultStoryState()||false;
        if (story_status || adult_story_state) {
            this.guide_list.push(config);
            return
        }

        // 如果出升级提示
        // var is_inlevipgrade = LevupgradeController:getInstance():waitLevupgrade()
        // if is_inlevipgrade then
        //     table_insert( self.guide_list, 1, config )
        //     return
        // end

        // 如果在引导中的时候,不播,缓存这吧
        if (this.cur_guide_config) {
            this.guide_list.push(config);            
            return;
        }

        cc.log("3333");

        if (config.act.length > 0) {
            this.playGuide(config);
        } else {
            this.startPlayGuide(false, config.bid);
        }
    },

    playGuide: function(config) {
        if (this.is_guiding) return;
        this.cur_guide_config = config;
        this.is_guiding = true;
        
        if (config.is_close == 1) {
            Utils.closeAllWindow();
            // BaseView.closeAllView()
        }
        // BaseView.closeSomeWin()

        // 主ui的聊天气泡
        // var MainuiController = require("mainui_controller")
        // MainuiController.getInstance().setMainUIChatBubbleStatus(false)

        if (!this.guide_view) {
            this.guide_view = new GuideMainView(this);
        }

        this.guide_view.open();
        this.guide_view.addGuid(config);
    },

    delayTouchEnabled: function() {

    },

    isInGuide: function() {
        return this.is_guiding;
    },



    //打开任务引导
    openTaskGuideWindow:function(status,config){
        if(status){
            if(this.task_guide_window == null){
                this.task_guide_window = Utils.createClass("task_guide_window");
            }
            this.task_guide_window.open(config);
        }else{
            if(this.task_guide_window){
                this.task_guide_window.close();
            }
            this.task_guide_window = null;
        }
    },

    getTaskGuideWindow:function(){
        return this.task_guide_window
    },

    getTaskGuideEffectStatus:function(){
        if(this.task_guide_window){
            return this.task_guide_window.getEffectActive();
        }
        return false
    },

    setGuideMainRootWnd:function(status){
        if(this.guide_view){
            this.guide_view.root_wnd.active = status;
        }
    }
});

module.exports = GuideController;