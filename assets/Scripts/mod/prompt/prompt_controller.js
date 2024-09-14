// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-16 15:45:17
// --------------------------------------------------------------------

var PromptController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var PromptModel = require("prompt_model");

        this.model = new PromptModel();
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
        this.RegisterProtocal(16800, this.hander16800);
    },

    hander16800: function (data) {
        var PromptTypeConst = require("prompt_type_const");
        if (data.type == PromptTypeConst.Join_guild) {
            require("guild_controller").getInstance().setApplyListStatus(data);
        // }else if(data.type == PromptTypeConst.World_boss || data.type == PromptTypeConst.Escort){
        //     this.model.addPromptData(data)
        // }
        }else if( data.type == PromptTypeConst.Private_chat ||data.type == PromptTypeConst.At_notice ){
            // GlobalTimeTicket:getInstance():add(function (  )
                this.model.addPromptData(data)
            // end, 2, 1)
        }else if( data.type == PromptTypeConst.Endless_trail ){
            var BattleController = require("battle_controller")
            let is_infight = BattleController.getInstance().isInFight()
            let cur_fight_type = BattleController.getInstance().getModel().getCombatType()
            var BattleConst = require("battle_const")
            // -- 不在无尽试炼的战斗中,才需要显示这个
            if(is_infight == false ||cur_fight_type != BattleConst.Fight_Type.Endless ){
                this.model.addPromptData(data)
            }
        }
        // else if( data.type == PromptTypeConst.GuileMuster ){
        //     this.model.addPromptData(data)
        // }else if( data.type == PromptTypeConst.Challenge ){
        //     this.model.addPromptData(data)
        // }else if( data.type == PromptTypeConst.Guild 
        //     ||data.type == PromptTypeConst.Guild_war 
        //     ||data.type == PromptTypeConst.Guild_voyage 
        //     ||data.type == PromptTypeConst.BBS_message 
        //     ||data.type == PromptTypeConst.BBS_message_reply 
        //     ||data.type == PromptTypeConst.BBS_message_reply_self  
        //     ||data.type == PromptTypeConst.Mine_defeat ){ 
        //     this.model.addPromptData(data)
        // }
    },
});

module.exports = PromptController;