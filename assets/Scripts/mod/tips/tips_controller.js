// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-28 09:23:39
// --------------------------------------------------------------------

var TipsConst = require("tips_const");

var TipsController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var TipsModel = require("tips_model");

        this.model = new TipsModel();
        this.model.initConfig();

        this.tips_list = {};            // tips列表对象
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.re_link_game == null) {
            this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, (function () {
                this.closeAllTips()
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
    },

    closeTIpsByType: function (type) {
        var tips = this.tips_list[type]
        if (tips) {
            tips.close()
        }
        this.tips_list[type] = null
    },

    // 关掉所有tips
    closeAllTips: function () {
        for (var key in this.tips_list) {
            var tips = this.tips_list[key]
            if (tips && tips.close) {
                tips.close()
                tips = null;
            }
        }
        this.tips_list = {}
    },

    // 显示通用物品tips
    showGoodsTips: function (data, is_show_btn , is_special_source) {
        if (data == null) return;
        if(this.tips_list[TipsConst.type.GOODS] == null){
            var BackPackTips = require("backpack_tips");
            var tips = new BackPackTips()
            tips.open({ data: data, show: is_show_btn , is_special_source: is_special_source})
            this.tips_list[TipsConst.type.GOODS] = tips
        }

    },

    showEquipTips: function (data, type, partner) {
        if (data == null) return;
        if(this.tips_list[TipsConst.type.EQUIP] == null){
            var EquipTips = require("equip_tips");
            var tips = new EquipTips()
            tips.open({ data: data, type: type, partner: partner })
            this.tips_list[TipsConst.type.EQUIP] = tips
        }
    },

    showHeadCircleTips: function (data) {
        if (data == null) return;
        this.closeTIpsByType(TipsConst.type.HEAD_CIRCLE);
        var HeadCircleTips = require("head_circle_tips");
        var tips = new HeadCircleTips();
        tips.open(data);
        this.tips_list[TipsConst.type.HEAD_CIRCLE] = tips;
    },

    //普通tips
    showCommonTips: function (tips, point, font_size, delay, width, adjustY = true) {
        if (this.common_tips != null) {
            this.common_tips.close();
            this.common_tips = null;
        }
        width = width || 400;
        var CommonTips = require("common_tips");
        this.common_tips = new CommonTips(delay);
        this.common_tips.open();
        this.common_tips.showTips(tips, width, (font_size || 24));
        this.common_tips.addCallBack(function () {
            this.adjustTipsPosition(this.common_tips, point, null, adjustY);
        }.bind(this))
        this.tips_list[TipsConst.type.COMMON] = this.common_tips;
        return this.common_tips
    },

    //  神界冒险的tips
    showAdventureBuffTips:function(buff_list, point, holiday_buff_list){
        if(this.adventure_buff_tips){
            this.adventure_buff_tips.close();
            this.adventure_buff_tips = null;
        }
        var AdventureBuffTips = require("adventure_buff_tips");
        this.adventure_buff_tips = new AdventureBuffTips(buff_list, holiday_buff_list);
        this.adventure_buff_tips.open();
        this.adventure_buff_tips.showTips();
        this.adventure_buff_tips.addCallBack(function () {
            this.adjustAdventureBuffTipsPosition(this.adventure_buff_tips, point);
        }.bind(this))
        this.tips_list[TipsConst.type.ADVENTURE_BUFF] = this.adventure_buff_tips;
        return this.adventure_buff_tips;
    },

    //显示碎片合成
    showBackPackCompTips:function(status,base_id){
        if(status == true){
            if(!this.comp_tips){
                this.comp_tips = Utils.createClass("backpack_comp_tips_window",this);
            }
            this.comp_tips.open(base_id);
        }else{
            if(this.comp_tips){
                this.comp_tips.close();
                this.comp_tips = null;
            }
        }
    },

    //显示碎片合成选择
    showCompChooseTips:function(status,base_id){
        if(status == true){
            if(!this.choose_tips){
                this.choose_tips = Utils.createClass("comp_choose_tips_window",this);
            }
            this.choose_tips.open(base_id);
        }else{
            if(this.choose_tips){
                this.choose_tips.close();
                this.choose_tips = null;
            }
        }
    },


    //位置调整(现在默认为显示的tips的anchorPoint的为cc.p(0.5, 0.5))
    adjustAdventureBuffTipsPosition: function (target, point, view_size, adjustY = true) {
        var win_size = cc.size(SCREEN_WIDTH, SCREEN_HEIGHT);         //父节点的尺寸
        var temp_size = view_size || target.getBgContentSize();      //获取内部背景随动的节点尺寸
        var size = cc.size(temp_size.width, temp_size.height)

        var parent = ViewManager.getInstance().getSceneNode(SCENE_TAG.msg);
        var local_pos = parent.convertToNodeSpaceAR(point);
        var start_y = local_pos.y - size.height / 2;
        var start_x = 0;
        if(adjustY){
            if (start_y > win_size.height / 2) {
                start_y = win_size.height / 2;
            } else if (start_y - size.height < - win_size.height / 2) {
                start_y = start_y + size.height
            }
        }
        target.setPosition(start_x, start_y);
    },

    //位置调整(现在默认为显示的tips的anchorPoint的为cc.p(0.5, 0.5))
    adjustTipsPosition: function (target, point, view_size, adjustY = true) {
        var win_size = cc.size(SCREEN_WIDTH, SCREEN_HEIGHT);         //父节点的尺寸
        var temp_size = view_size || target.getBgContentSize();      //获取内部背景随动的节点尺寸
        var size = cc.size(temp_size.width, temp_size.height)

        var parent = ViewManager.getInstance().getSceneNode(SCENE_TAG.msg);
        var local_pos = parent.convertToNodeSpaceAR(point);
        var start_x = local_pos.x;
        var start_y = local_pos.y - size.height / 2;
        if (start_x + size.width / 2 > win_size.width / 2) {
            start_x = start_x - size.width / 2;
        } else if (start_x - size.width / 2 < -win_size.width / 2) {
            start_x = start_x + size.width / 2;
        }
        if (start_x + size.width / 2 > win_size.width / 2) {
            start_x = start_x - size.width / 2;
        } else if (start_x - size.width / 2 < -win_size.width / 2) {
            start_x = start_x + size.width / 2;
        }
        if(adjustY){
            if (start_y > win_size.height / 2) {
                start_y = win_size.height / 2;
            } else if (start_y - size.height < - win_size.height / 2) {
                start_y = start_y + size.height
            }
        }
        target.setPosition(start_x, start_y);
    },
    // --技能tips
    showSkillTips( skill_vo, is_lock, not_show_next, hide_flag ){
        if (typeof(skill_vo) == "number"){
            skill_vo = Config.skill_data.data_get_skill[skill_vo]
        }
        let SkillTips = require("skill_tips_window")
        let skill_tips = new SkillTips()//SkillTips.New()
        let data = {
            skill_vo:skill_vo,
            is_lock:is_lock,
            not_show_next:not_show_next, 
            hide_flag:hide_flag
        }
        skill_tips.open(data)
        this.tips_list[TipsConst.type.SKILL] = skill_tips;
        // table.insert(this.tips_list,skill_tips)
        // return skill_tips
    },

    getCompTipsRoot: function() {
        if (this.comp_tips)
            return this.comp_tips.root_wnd;
    },
    showFirstCharge: function(callFunc){
        var NewfirstchargeController = require("newfirstcharge_controller")
        if(NewfirstchargeController.getInstance().getNewFirstChargeView()){
            callFunc()
            return
        }
        var RoleController = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();
        if(role_vo.vip_exp * 0.1 >= 6){
            callFunc()
            return 
        }
        var CommonAlert = require("commonalert")
        CommonAlert.show(Utils.TI18N("您有4倍充值返利未使用，是否前往?"),Utils.TI18N('立即前往'),function(){
            NewfirstchargeController.getInstance().openNewFirstChargeView(true)
        },Utils.TI18N("继续充值"),callFunc)
    },
    showWeekCardTips(status,data){
        if(status == true){
            if(!this.weekcard_tips){
                var WeekCardTips = require("week_card_tips_window")
                this.weekcard_tips = new WeekCardTips(this)
            }
            this.weekcard_tips.open(data)
        }else{
            if(this.weekcard_tips){
                this.weekcard_tips.close()
                this.weekcard_tips = null
            }
        }
    },
});

module.exports = TipsController;
