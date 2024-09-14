// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-02-18 14:15:05
// --------------------------------------------------------------------
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var BackpackEvent = require("backpack_event");
var Battle_dramaEvent = require("battle_drama_event");
var HallowsEvent = require("hallows_event");
var BackPackConst = require("backpack_const")

var HallowsController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var HallowsModel = require("hallows_model");

        this.model = new HallowsModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // if(this.backpack_init_event == null){
        //     this.backpack_init_event = gcore.GlobalEvent.bing(BackpackEvent.GET_ALL_DATA,(function(){
        //         // -- if bag_code ~= BackPackConst.Bag_Code.BACKPACK then return end
        //         // -- self.role_vo = RoleController:getInstance():getRoleVo() 
        //         // -- if self.role_vo  == nil then
        //         // --     if self.init_role_event == nil then
        //         // --         self.init_role_event = GlobalEvent:getInstance():Bind(EventId.ROLE_CREATE_SUCCESS, function()
        //         // --             GlobalEvent:getInstance():UnBind(self.init_role_event)
        //         // --             self.role_vo = RoleController:getInstance():getRoleVo() 
        //         // --             if self.role_vo then
        //         // --                 self:requestInitProtocals()
        //         // --             end
        //         // --         end)
        //         // --     end
        //         // -- else
        //         // --     self:requestInitProtocals()
        //         // -- end
        //     }).bind(this))
        // }

        if(this.battle_drama_event == null){
            this.battle_drama_event = gcore.GlobalEvent.bind(Battle_dramaEvent.BattleDrama_Update_Max_Id,(function(max_id){
                this.requestInitProtocals(max_id);
            }).bind(this))
        }

        if(this.goods_add_event == null){
            this.goods_add_event = gcore.GlobalEvent.bind(BackpackEvent.ADD_GOODS,(function(bag_code, item_list){
                if(bag_code!=BackPackConst.Bag_Code.BACKPACK)return;
                this.checkNeedUpdateRedStatus(item_list);
            }).bind(this))
        }

        if(this.goods_update_event == null){
            this.goods_update_event = gcore.GlobalEvent.bind(BackpackEvent.MODIFY_GOODS_NUM,(function(bag_code, item_list){
                if(bag_code != BackPackConst.Bag_Code.BACKPACK)return;
                this.checkNeedUpdateRedStatus(item_list);
            }).bind(this))
        }

        if(this.goods_del_event == null){
            this.goods_del_event = gcore.GlobalEvent.bind(BackpackEvent.DELETE_GOODS,(function(bag_code, item_list){
                if(bag_code != BackPackConst.Bag_Code.BACKPACK)return;
                this.checkNeedUpdateRedStatus(item_list);
            }).bind(this))
        }

        if(this.re_link_game_event = null){
            this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME,(function(){
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide()) {
                    this.resonate_data = null;
                    this.openHallowsMainWindow(false);
                }
            }).bind(this))
        }
    },

    //物品变化的时候做处理,如果是自己操作引起的不需要这里判断的,因为那属于自身更新
    checkNeedUpdateRedStatus:function(item_list){
        if(this.is_self_handle){
            this.is_self_handle = false;
            return;
        }

        if(this.item_list == null || Utils.next(item_list) == null)return;

        for(var i in item_list){
            var cfg = item_list[i].config;
            if(cfg){
                if(cfg.id == 72001 || cfg.id == 72002 || cfg.id == 72003){
                    this.model.checkHallowsRedStatus();
                }
            }
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(24100, this.handle24100) // 圣器基础属性
        this.RegisterProtocal(24101, this.handle24101) // 圣器进阶
        this.RegisterProtocal(24102, this.handle24102) // 圣灵穿戴
        this.RegisterProtocal(24103, this.handle24103) // 圣技升级
        this.RegisterProtocal(24104, this.handle24104) // 使用圣印
        this.RegisterProtocal(24105, this.handle24105) // 共鸣变化
        this.RegisterProtocal(24107, this.handle24107) // 更新圣器
        this.RegisterProtocal(24108, this.handle24108) // 新增圣器,这个时候播放激活特效

        this.RegisterProtocal(24120, this.handle24120) // 圣器任务列表
        this.RegisterProtocal(24121, this.handle24121) // 圣器任务列表
        this.RegisterProtocal(24122, this.handle24122) // 圣器任务列表
        this.RegisterProtocal(24123, this.handle24123) // 神器重铸
        this.RegisterProtocal(24124, this.handle24124) // 是否打开过神器界面
    },

    //监测圣器系统是否解锁
    checkIsOpen:function(show_desc){
        var open_config = Config.function_data.data_base[8];
        if(open_config == null)return false;
        var is_open = MainuiController.getInstance().checkIsOpenByActivate(open_config.activate);
        if(show_desc && !is_open){
            message(open_config.desc);
        }
        return is_open;
    },

    //初始登记请求的一些数据
    requestInitProtocals:function(){
        var can_request = this.checkIsOpen();
        if(can_request){
            if(this.battle_drama_event){
                gcore.GlobalEvent.unbind(this.battle_drama_event);
                this.battle_drama_event = null;
            }
            this.requestHallowsInfo();
        }
    },

    //引导需要
    getHallowsRoot:function(finish_cb){
        if (!finish_cb) {
            if(this.hallows_window){
                return this.hallows_window.root_wnd;
            }            
        } else {
            if (this.hallows_window) {
            this.hallows_window.getRootWnd(finish_cb);

            } else {
                finish_cb(null);
            }
        }
    },
    //引导需要
    getHallowsActivityRoot:function(finish_cb){
        if (!finish_cb) {
            if(this.activity_window){
                return this.activity_window.root_wnd;
            }            
        } else {
            if (this.activity_window) {
            this.activity_window.getRootWnd(finish_cb);

            } else {
                finish_cb(null);
            }
        }
    },

    // 引导需要
    getHallowsPreviewRoot:function(finish_cb){
        if (!finish_cb) {
            if(this.hallows_preview){
                return this.hallows_preview.root_wnd;
            }            
        } else {
            if (this.hallows_preview) {
                this.hallows_preview.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        }
    },

    //打开圣器主界面
    openHallowsMainWindow:function(status, hallows_id, index){
        if(!status){
            if(this.hallows_window){
                this.hallows_window.close();
                this.hallows_window = null;
            }
        }else{
            //判断开启
            if(!this.checkIsOpen(true))return;
            // //是否打开过神器界面，第一次打开时要打开失落神器界面（引导需要）
            // var open_flag = this.model.getHallowsOpenFlag();
            // if(open_flag == 0){
            //     this.requestSignOpenHallows()
            //     this.openHallowsPreviewWindow(true)
            //     return
            // }
            if(this.hallows_window == null){
                //如果已经全部激活，则打开神器主界面（包含升级和技能）;否则打开神器任务界面
                if(this.model.checkIsHaveAllHallows()){
                    this.hallows_window = Utils.createClass("hallows_main_window",this);
                }else{
                    this.hallows_window = Utils.createClass("hallows_task_window",this);
                }
            }
            if(this.hallows_window && this.hallows_window.isOpen() == false){
                this.hallows_window.open(hallows_id, index);
            }
            
        }
    },

    // 打开所有神器预览界面
    openHallowsPreviewWindow:function( status ){
        if(status){
            if(this.hallows_preview == null){
                this.hallows_preview = Utils.createClass("hallows_preview_window",this);
            }
            if(this.hallows_preview && this.hallows_preview.isOpen() == false){
                this.hallows_preview.open();
            }
            
        }else{
            if(this.hallows_preview){
                this.hallows_preview.close();
                this.hallows_preview = null;
            }
        }
    },

    //打开圣器的圣印界面
    openHallowsTraceWindow:function(status, data){
        if(!status){
            if(this.trace_window){
                this.trace_window.close();
                this.trace_window = null;
            }
        }else{
            if(data == null)return;
            if(this.trace_window == null){
                this.trace_window = Utils.createClass("hallows_trace_window",this);
            }
            if(this.trace_window && this.trace_window.isOpen() == false){
                this.trace_window.open(data);
            }
            
        }
    },

    //圣器装备的tips
    openHallowsTips:function(status, data){
        if(!status){
            if(this.hallows_tips){
                this.hallows_tips.close();
                this.hallows_tips = null;
            }
        }else{
            if(data == null)return;
            if(this.hallows_tips == null){
                this.hallows_tips = Utils.createClass("hallows_tips_window",this);
            }
            if(this.hallows_tips && this.hallows_tips.isOpen() == false){
                this.hallows_tips.open(data);
            }
        }
    },

    //圣器激活界面
    openHallowsActivityWindow:function(status, data){
        if(!status){
            if(this.activity_window){
                this.activity_window.close();
                this.activity_window = null;
            }
        }else{
            if(data == null)return;
            if(this.activity_window == null){
                this.activity_window = Utils.createClass("hallows_activity_window",this);
            }
            if(this.activity_window && this.activity_window.isOpen() == false){
                this.activity_window.open(data);
            }
            
        }
    },

    //进阶界面
    openHallowsStepUpWindow:function(status, data){
        if(!status){
            if(this.step_up_window){
                this.step_up_window.close();
                this.step_up_window = null;
            }
            //关闭升阶面板之后,弹出共鸣面板
            if(this.resonate_data){
                this.openHallowsResonateUpWindow(true, this.resonate_data);
                this.resonate_data = null;
            }
        }else{
            if(data == null)return;
            if(this.step_up_window == null){
                this.step_up_window = Utils.createClass("hallows_step_up_window",this);
            }
            if(this.step_up_window && this.step_up_window.isOpen() == false){
                this.step_up_window.open(data);
            }
            
        }
    },

    //共鸣
    // --[[function HallowsController:openHallowsResonateUpWindow(status, data)
    //     if not status then
    //         if self.resonate_up_window then
    //             self.resonate_up_window:close()
    //             self.resonate_up_window = nil
    //         end
    //     else
    //         if self.resonate_up_window == nil then
    //             self.resonate_up_window = HallowsResonateUpWindow.New()
    //         end
    //         self.resonate_up_window:open(data)
    //     end
    // end --]]

    requestHallowsInfo:function(){
        this.SendProtocal(24100, {});
        this.SendProtocal(24120, {});
    },

    handle24100:function(data){
        this.model.updateHallowsInfo(data);
    },

    //更新圣器
    handle24107:function(data){
        this.model.updateHallowsData(data);
        gcore.GlobalEvent.fire(HallowsEvent.HallowsUpdateEvent, data.id);
    },

    //激活圣器
    handle24108:function(data){
        this.model.updateHallowsData(data);
        // 如果是激活了最后一个神器，且神器任务界面正在显示，则切换为神器升级界面
        if(this.model.checkIsHaveAllHallows() && this.hallows_window){
            this.openHallowsMainWindow(false)
            this.openHallowsMainWindow(true)
        }
        // /通知面板更新数据
        gcore.GlobalEvent.fire(HallowsEvent.HallowsActivityEvent, data.id);
        //播放激活特效
        this.openHallowsActivityWindow(true,data);
    },

    //圣器进阶
    requestHallowsAdvance:function(id, is_auto){
        this.is_self_handle  = true;
        var auto_type = 0;
        if(is_auto){
            auto_type = 1;
        }
        var protocal = {};
        protocal.id = id
        protocal.is_auto = auto_type
        this.SendProtocal(24101, protocal)
    },

    handle24101:function(data){
        message(data.msg);
        //升阶了
        if(data.result == 1){
            this.openHallowsStepUpWindow(true, data.id);
        }else{
            this.is_self_handle = false;
        }
        gcore.GlobalEvent.fire(HallowsEvent.HallowsAdvanceEvent, data.id, data.result);
    },

    //升级圣器技能
    requestHallowsSkillUpgrade:function(hallows_id){
        this.is_self_handle = true;
        var protocal = {};
        protocal.hallows_id = hallows_id
        this.SendProtocal(24103, protocal);
    },

    handle24103:function(data){
        message(data.msg);
        if(data.result == 1){
            // gcore.GlobalEvent.fire(HallowsEvent.HallowsSkillUpgradeEvent, data.hallows_id, data.id);
        }else{
            this.is_self_handle = false;
        }
    },

    //穿戴一件装备
    requestHallowsEquip:function(hallows_id, item_id, pos){
        this.is_self_handle = true;
        hallows_id = hallows_id || 0;
        item_id = item_id || 1;
        pos = pos || 1;
        var protocal = {};
        protocal.hallows_id = hallows_id;
        protocal.id = item_id;
        protocal.pos = pos;
        this.SendProtocal(24102, protocal)
    },

    handle24102:function(data){
        message(data.msg);
        if(data.result == 1){
            gcore.GlobalEvent.fire(HallowsEvent.HallowsEqupUpEvent , data.id, data.pos);
        }else{
            this.is_self_handle = false;
        }
    },

    //使用圣印物品
    requestUseTraceItem:function(hallows_id, num){
        this.is_self_handle = true;
        hallows_id = hallows_id || 0;
        num = num || 1;
        var protocal = {};
        protocal.hallows_id = hallows_id;
        protocal.num = num;
        this.SendProtocal(24104, protocal);
    },

    handle24104:function(data){
        message(data.msg);
        if(data.result == 1){
            this.openHallowsTraceWindow(false);
        }else{
            this.is_self_handle = false;
        }
    },

    // 初始化圣器任务列表
    handle24120:function(data){
        this.model.updateHallowsTask(data.list);
    },


    // 圣器任务更新信息
    handle24121:function(data){
        this.model.updateHallowsTask(data.list);
    },

    requestSubmitHallowsTask:function(id){
        var protocal = {};
        protocal.id = id
        this.SendProtocal(24122, protocal);
    },

    handle24122:function(data){
        message(data.msg)
    },

    //共鸣变化
    handle24105:function(data){
        this.resonate_data = data;
        // this.openHallowsResonateUpWindow(true, data);
    },

    // 请求神器重铸
    requestHallowsReset:function( id ){
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(24123, protocal);
    },

    handle24123:function( data ){
        message(data.msg);
    },

    // 请求标记打开神器界面
    requestSignOpenHallows:function(  ){
        this.SendProtocal(24124, {});
    },

    handle24124:function( data ){
        if(data.is_first){
            this.model.setOpenHallowsFlag(data.is_first);
        }
    },

    __delete: function () {
        if (this.model != null) {
            this.model.DeleteMe();
            this.model = null;
        }
    },


});

module.exports = HallowsController;