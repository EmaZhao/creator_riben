// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      冒险主控制器
// <br/>Create: 2019-05-09 14:14:52
// --------------------------------------------------------------------
var AdventureEvent = require("adventure_event");
var BattleConst         = require("battle_const");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");
var BattleController = require("battle_controller");

var AdventureController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var AdventureModel = require("adventure_model");

        this.model = new AdventureModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(20600, this.handle20600)    //基本信息
        this.RegisterProtocal(20601, this.handle20601)    //BUFF信息
        this.RegisterProtocal(20602, this.handle20602)    //房间信息
        this.RegisterProtocal(20603, this.handle20603)    //服务端通知更新指定房间信息
        this.RegisterProtocal(20604, this.handle20604)    //获取当前伙伴信息数据
        this.RegisterProtocal(20605, this.handle20605)    //设置上阵伙伴信息
        this.RegisterProtocal(20606, this.handle20606)    //每一层结算
        this.RegisterProtocal(20607, this.handle20607)    //使用3个主要技能的
        this.RegisterProtocal(20608, this.handle20608)    //进去指定房间
        this.RegisterProtocal(20609, this.handle20609)    //技能信息
        this.RegisterProtocal(20610, this.handle20610)    //选中伙伴
        this.RegisterProtocal(20611, this.handle20611)    //一击必杀请求
        this.RegisterProtocal(20612, this.handle20612)    //冒险重置

        this.RegisterProtocal(20620, this.handle20620)    //事件反馈
        this.RegisterProtocal(20621, this.handle20621)    //猜拳结果反馈
        this.RegisterProtocal(20622, this.handle20622)    //buff信息查看
        this.RegisterProtocal(20623, this.handle20623)    //答题信息
        this.RegisterProtocal(20624, this.handle20624)    //怪物信息

        this.RegisterProtocal(20625, this.handle20625)    //获得技能,主要是用于表现效果处理

        this.RegisterProtocal(20627, this.handle20627)    //NPC对话序号
        this.RegisterProtocal(20628, this.handle20628)    //NPC对话结果
        this.RegisterProtocal(20630, this.handle20630)    //宝箱打开结果
        this.RegisterProtocal(20631, this.handle20631)    //神秘商店事件

        this.RegisterProtocal(20632, this.handle20632)    //神秘商店总览
        this.RegisterProtocal(20633, this.handle20633)    //神秘商店购买

        this.RegisterProtocal(20634, this.handle20634)
        this.RegisterProtocal(20635, this.handle20635)
    },

    isMonster:function(event_type){
        return event_type == AdventureEvent.EventType.boss || event_type == AdventureEvent.EventType.mon || event_type == AdventureEvent.EventType.mon1 || event_type == AdventureEvent.EventType.mon2 || event_type == AdventureEvent.EventType.mon3;
    },

    openAnswerView:function(value,data){
        if(value == false){
            if(this.adventure_answer_view != null){
                this.adventure_answer_view.close();
                this.adventure_answer_view = null;
            }
        }else{
            if(this.adventure_answer_view == null){
                this.adventure_answer_view = Utils.createClass("adventure_evt_answer_window",this);
            }
            if(this.adventure_answer_view && this.adventure_answer_view.isOpen() == false){
                this.adventure_answer_view.open(data);
            }
        }
    },

    //==============================--
    //desc:进入冒险的主入口
    //@return 
    //==============================--
    requestEnterAdventure:function(){
        var form_list = this.model.getFormList();
        if(form_list == null || Utils.next(form_list) == null){
            this.openAdventureFormWindow(true);
        }else{
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Adventrue) 
        }
    },

    // ==============================--
    // desc:打开冒险站前布阵界面
    // @status:
    // @return 
    // ==============================--
    openAdventureFormWindow:function(status){
        if(!status){
            if(this.form_window){
                this.form_window.close();
                this.form_window = null;
            }
        }else{
            if(this.form_window == null){
                this.form_window = Utils.createClass("adventure_form_window",this);
            }
            if(this.form_window && this.form_window.isOpen() == false){
                this.form_window.open();
            }
        }
    },

    
    // -- 引导需要
    // function AdventureController:getAdventureRoot()
    //     if this.adventure_window then
    //         return this.adventure_window.root_wnd
    //     end
    // end

    // -- 引导需要下一层的指引
    // function AdventureController:getNextAlertRoot()
    //     if this.adventure_window then
    //         var alert = this.adventure_window:getAlert()
    //         if alert then
    //             return alert.root_wnd
    //         end
    //     end
    // end

    openAdventureMainWindow:function(status){
        if(!status){
            if(this.adventure_window){
                this.adventure_window.close();
                this.adventure_window = null;
            }
        }else{
            // 没有布阵是不给进去的
            var form_list = this.model.getFormList();
            if(form_list == null || Utils.next(form_list) == null){
                // print("跳转进入神界冒险有误,当前还没有布阵 ============>")
                return;
            }
            // 没有基础数据也不做响应
            var base_data = this.model.getAdventureBaseData();
            if(base_data == null)return;

            if(this.adventure_window == null){
                this.adventure_window = Utils.createClass("adventure_main_window",this);
            }
            if(this.adventure_window && this.adventure_window.isOpen() == false){
                this.adventure_window.open();
            }
        }
    },

    openWindowByConfig:function(data){
        if(data == null || data.config == null)return;
        var config = data.config;
        if(this.isMonster(config.evt_type)){//boss或者怪物
            if(this.model.allHeroIsDie() == true){
                message(Utils.TI18N("英雄全部阵亡,本轮冒险已结束!"));
                return;
            }
            this.openEvtViewByType(true, "adventure_evt_challenge_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.box){//B宝箱
            this.openEvtViewByType(true, "adventure_evt_box_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.finger_guessing){//猜拳
            this.openEvtViewByType(true, "adventure_evt_fighterguess_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.answer){//答题
            this.openEvtViewByType(true, "adventure_evt_answer_start_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.npc){//npc事件
            this.openEvtViewByType(true, "adventure_evt_npc_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.freebox){//免费宝箱
            this.openEvtViewByType(true, "adventure_evt_free_box_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.npc_talk){//npc对话
            this.openEvtViewByType(true, "adventure_evt_other_npc_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.shop){//神秘商店
            this.openEvtViewByType(true, "adventure_evt_shop_window", data);
        }else if(config.evt_type == AdventureEvent.EventType.effect){//特效事件
            this.send20620(data.id, AdventureEvent.AdventureEvenHandleType.handle, {});
        }
    },

    // 打开各种事件面板
    openEvtViewByType:function(status, ref_class, data, extendparam, is_other){
        if(status == false){
            if(this.adventure_evt_view!=null){
                this.adventure_evt_view.close();
			    this.adventure_evt_view = null;
            }
        }else{
            if(data == null)return;
            var ref_class = ref_class || "adventure_evt_challenge_window" 
            if(this.adventure_evt_view == null){
                this.adventure_evt_view = Utils.createClass(ref_class,this);
            }
            if(this.adventure_evt_view && this.adventure_evt_view.isOpen() == false){
                this.adventure_evt_view.open(data);
            }
        }
    },

    // ==============================--
    // desc:冒险商店
    // @status:
    // @return 
    // ==============================--
    openAdventrueShopWindow:function(status){
        if(!status){
            if(this.shop_window){
                this.shop_window.close();
                this.shop_window = null;
            }
        }else{
            if(this.shop_window == null){
                this.shop_window = Utils.createClass("adventure_shop_window",this);
            }
            if(this.shop_window && this.shop_window.isOpen() == false){
                this.shop_window.open();
            }
        }
    },

    // ==============================--
    // desc:一击必杀界面
    // @status:
    // @return 
    // ==============================--
    openAdventureShotKillWindow:function(status, config){
        if(!status){
            if(this.shot_kill_window){
                this.shot_kill_window.close();
                this.shot_kill_window = null;
            }
        }else{
            if(config == null)return;
            if(this.shot_kill_window == null){
                this.shot_kill_window = Utils.createClass("adventure_shot_kill_window",this);
            }
            if(this.shot_kill_window && this.shot_kill_window.isOpen() == false){
                this.shot_kill_window.open(config);
            }
        }
    },

    // ==============================--
    // desc:使用药品
    // @status:
    // @return 
    // ==============================--
    openAdventureUseHPWindow:function(status, config){
        if(!status){
            if(this.use_hp_window){
                this.use_hp_window.close();
                this.use_hp_window = null;
            }
        }else{
            if(config == null)return;
            if(this.use_hp_window == null){
                this.use_hp_window = Utils.createClass("adventure_use_hp_window",this);
            }
            if(this.use_hp_window && this.use_hp_window.isOpen() == false){
                this.use_hp_window.open(config);
            }
        }
    },

    // 事件操作
    send20620:function(room_id,action,ext_list){
        var protocal = {};
        protocal.room_id = room_id;
        protocal.action = action;
        protocal.ext_list = ext_list || {};
        this.SendProtocal(20620, protocal);
    },

    handle20620:function(data){
        message(data.msg);
        if(data.code == 2){
            this.openEvtViewByType(false);
        }
    },

    // 请求房间信息
    send20602:function(){
        var protocal = {};
        this.SendProtocal(20602, protocal);
    },

    // 房间信息返回
    handle20602:function(data){
        this.model.setRoomList(data);
    },

    // 服务端通知更新指定房间信息
    handle20603:function(data){
        this.model.updateRoomList(data);
    },

    send20604:function(){
        this.SendProtocal(20604, {});
    },

    // 获取当前伙伴信息数据
    handle20604:function(data){
        this.model.updateFormPartner(data.partners, data.id);
        // if(NEEDCHANGEENTERSTATUS == 2 && !this.first_enter){//如果是1就跳转到出具
        //     this.first_enter  = true;
        //     MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.drama_scene);
        // }
    },

    // 请求布阵
    requestSetForm:function(plist){
        var protocal = {};
        protocal.plist = plist || {};
        this.SendProtocal(20605, protocal);
    },

    handle20605:function(data){
        if(data.code == 1){
            this.openAdventureFormWindow(false);
            // 请求进入
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Adventrue);
        }
    },

    send20608:function(room_id){
        var protocal = {};
        protocal.room_id = room_id;
        this.SendProtocal(20608, protocal);
    },

    handle20608:function(data){
        message(data.msg);
        if(data.code == 1){
            gcore.GlobalEvent.fire(AdventureEvent.HandleRoomOverEvent, data.room_id);
        }
    },

    // 基本信息
    send20600:function(){
        var protocal = {};
        this.SendProtocal(20600, protocal);
    },

    // 基本信息返回
    handle20600:function(data){
        if(data) {
            this.model.setAdventureBaseData(data);
        }
    },

    // buff信息
    send20601:function(){
        this.SendProtocal(20601, {});
    },

    // buff信息返回
    handle20601:function(data){
        if(data){
            this.model.setBuffData(data);
        }
    },
    
    handle20622:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Buff_Info,data);
        }
    },

    handle20621:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Guess_Result,data);
        }
    },

    handle20623:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Answer_Info,data);
        }
    },
    

    handle20628:function(data){
        if(data){
            message(data.msg);
            gcore.Timer.set(function () {
                this.openEvtViewByType(false);
                this.showGetItemTips(data.items);
            }.bind(this), 1000, 1);
        }
    },

    handle20630:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Box_Result_Info,data);
        }
    },

    handle20627:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Npc_Info,data);
        }
    },

    handle20631:function(data){
        if(data.type == 1){//点击房间事件时候请求20协议之后返回处理
            gcore.GlobalEvent.fire(AdventureEvent.Update_Evt_Shop_Info,data);
        }else if(data.type == 2){//点击技能商店直接弹出
            this.openAdventureEvtShopView(true, data.list);
        }
    },

    // ==============================--
    // desc:主动打开神秘商店
    // @status:
    // @data:
    // @return 
    // ==============================--
    openAdventureEvtShopView:function(status, data){
        if(!status){
            if(this.shop_evt_window){
                this.shop_evt_window.close();
                this.shop_evt_window = null;
            }
        }else{
            if(this.shop_evt_window == null){
                this.shop_evt_window = Utils.createClass("adventure_evt_shop_window",this);
            }
            if(this.shop_evt_window && this.shop_evt_window.isOpen() == false){
                if(data){
                    data.is_auto = true;
                }
                this.shop_evt_window.open(data);
            }
        }
    },

    // ==============================--
    // desc:冒险中飘字处理
    // @items:
    // @is_guess:是否是猜拳结果
    // @ret:猜拳的结果
    // @return 
    // ==============================--
    showGetItemTips:function(items, is_guess, ret){
        if(items){
            var str = "";
            for(var i in items){
                var v = items[i];
                if(str != ""){
                    str = str + "，"
                }
                var item_config = Utils.getItemConfig(v.bid);
                if(gdata("item_data","data_assets_id2label",v.bid)){
                    str = cc.js.formatStr("%s<img src=%s></img><color=#289b14>x%s</color>", str, item_config.icon, v.num);
                }else{
                    var BackPackConst = require("backpack_const");
                    str = cc.js.formatStr("%s<color=%s>%s</color><color=#289b14>x%s</color>", str, BackPackConst.quality_color(item_config.quality), item_config.name, v.num);
                }
            }
            if(is_guess == true){
                ret = ret || 0;
                if(ret == 0){//平
                    str = cc.js.formatStr(Utils.TI18N("平局！太可惜了，%s还你"), str);
                }else if(ret == 1){//赢
                    str = cc.js.formatStr(Utils.TI18N("好吧，这%s归你了"), str);
                }else{
                    str = cc.js.formatStr(Utils.TI18N("看你这么可怜，还你%s吧"), str);
                }
            }else{
                str = cc.js.formatStr(Utils.TI18N("获取%s"), str);
            }

            Utils.playButtonSound("c_get");
            message(str);
        }
    },

    // 冒险每一层结算数据
    openAdventureFloorResultWindow:function(status, data){
        if(!status){
            if(this.floor_result_window){
                this.floor_result_window.close();
                this.floor_result_window = null;
            }
        }else{
            if(data == null || data.items_list == null)return;
            if(this.floor_result_window == null){
                this.floor_result_window = Utils.createClass("adventure_floor_result_window",this);
            }
            if(this.floor_result_window && this.floor_result_window.isOpen() == false){
                this.floor_result_window.open(data);
            }
        }
    },

    //  服务端主动推送的结算界面
    handle20606:function(data){
        this.openAdventureFloorResultWindow(true, data);
    },

    // ==============================--
    // desc:请求技能信息
    // @return 
    // ==============================--
    send20609:function(){
        this.SendProtocal(20609, {});
    },

    // ==============================--
    // desc:使用3个技能
    // @skill_id:
    // @val:
    // @return 
    // ==============================--
    send20607:function(skill_id, val){
        var protocal = {};
        protocal.skill_id = skill_id;
        protocal.val = val;
        this.SendProtocal(20607, protocal);
    },

    // ==============================--
    // desc:使用技能
    // time:2019-01-24 04:57:32
    // @data:
    // @return 
    // ==============================--
    handle20607:function(data){
        message(data.msg);
        if(data.code == 1){
            this.openAdventureShotKillWindow(false);
            this.openAdventureUseHPWindow(false);
        }
    },

    //  请求技能信息,这里就不缓存了
    send20609:function(data){
        this.SendProtocal(20609, {});
    },

    //  技能信息
    handle20609:function(data){
        if(data){
            gcore.GlobalEvent.fire(AdventureEvent.UpdateSkillInfo, data.skill_list);
        }
    },

    requestSelectPartner:function(id){
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(20610, protocal);
    },

    //  选中伙伴返回
    handle20610:function(data){
        // -- message(data.msg)
        if(data.code == 1){
            this.model.updateSelectPartnerID(data.id);
        }
    },

    //  设置怪物血量
    handle20624:function(data){
        gcore.GlobalEvent.fire(AdventureEvent.UpdateMonsterHP, data.hp_per);
    },

    // ==============================--
    // desc: 请求一击必杀的信息列表
    // @return 
    // ==============================--
    send20611:function(){
        this.SendProtocal(20611, {});
    },
    
    handle20611:function(data){
        gcore.GlobalEvent.fire(AdventureEvent.UpdateShotKillInfo, data.room_list);
    },

    // ==============================--
    // desc:请求神秘商店总览
    // @return 
    // ==============================--
    requestShopTotal:function(){
        this.SendProtocal(20632, {});
    },

    // ==============================--
    // desc:神秘商店总览
    // @data:
    // @return 
    // ==============================--
    handle20632:function(data){
        gcore.GlobalEvent.fire(AdventureEvent.UpdateShopTotalEvent, data.list);
    },

    // ==============================--
    // desc:请求购买商店总店
    // @id:
    // @return 
    // ==============================--
    requestBuyShopItem:function(id){
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(20633, protocal);
    },

    // ==============================--
    // desc:购买神秘商店
    // @data:
    // @return 
    // ==============================--
    handle20633:function(data){
        message(data.msg);
        if(data.code == 1){
            gcore.GlobalEvent.fire(AdventureEvent.UpdateShopItemEvent, data.id);
        }
    },

    // 宝箱奖励展示
    send20634:function(){
        this.SendProtocal(20634,{});
    },

    handle20634:function(data){
        this.model.setAdventureBoxStatus(data);
        gcore.GlobalEvent.fire(AdventureEvent.UpdateBoxTeskEvent,data);
    },

    // 领取宝箱
    send20635:function(id){
        var proto = {};
        proto.id = id;
        this.SendProtocal(20635,proto);
    },

    handle20635:function(data){
        message(data.msg);
    },

    // 打开宝箱界面
    openAdventureBoxRewardView:function(status,kill_master){
        if(status == true){
            if(this.box_reward_window == null){
                this.box_reward_window = Utils.createClass("adventure_box_reward_window",this);
            }
            if(this.box_reward_window && this.box_reward_window.isOpen() == false){
                this.box_reward_window.open(kill_master);
            }
        }else{
            if(this.box_reward_window){
                this.box_reward_window.close();
                this.box_reward_window = null;
            }
        }
    },

    // ==============================--
    // desc:获得技能
    // @data:
    // @return 
    // ==============================--
    handle20625:function(data){
        gcore.GlobalEvent.fire(AdventureEvent.GetSkillForEffectAction,data.id, data.skill_id);
    },

    // ==============================--
    // desc:冒险重置,这里需要判断是不是在当前界面,是不是在战斗中
    // @data:
    // @return 
    // ==============================--
    handle20612:function(data){
        var ui_fight_type = MainuiController.getInstance().getUIFightType();
        if(ui_fight_type == MainuiConst.ui_fight_type.sky_scene){
            var is_in_fight = BattleController.getInstance().isInFight();
            if(is_in_fight){//如果是在战斗中,则等战斗结束之后,弹出提示
                if(this.battle_exit_event == null){
                    this.battle_exit_event = gcore.GlobalEvent.bind(EventId.EXIT_FIGHT,(function(combat_type){
                        if(combat_type == BattleConst.Fight_Type.Adventrue){
                            this.showAdventureReset();
                        }
                    }).bind(this))
                }
            }else{
                this.showAdventureReset();
            }
        }
    },

    showAdventureReset:function(){
        if(this.battle_exit_event){
            gcore.GlobalEvent.unbind(this.battle_exit_event);
            this.battle_exit_event = null;
        }
        MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene);   
        gcore.Timer.set(function () {
            var msg = Utils.TI18N("神界冒险已重置，是否重新进入？");
            var CommonAlert = require("commonalert");
            CommonAlert.show(msg, Utils.TI18N("确定"),function(){
                this.requestEnterAdventure();
            }.bind(this), Utils.TI18N("取消"))
        }.bind(this), 200, 1);
    },

});

module.exports = AdventureController;