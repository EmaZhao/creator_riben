// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-30 16:21:08
// --------------------------------------------------------------------
var HeroController = require("hero_controller")
var LookController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var LookModel = require("look_model");

        this.model = new LookModel();
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
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(11061, this.handle11061)     //--查看对方英雄信息
        this.RegisterProtocal(11062, this.handle11062)     //--查看对方分享英雄信息
    },
    sender11061(r_rid,r_srvid,partner_id){
        let protocal ={}
        protocal.r_rid = r_rid
        protocal.r_srvid = r_srvid
        protocal.partner_id = partner_id
        this.SendProtocal(11061,protocal)
    },
    handle11061( data ){
        message(data.msg)
        if(data.bid != 0){
            let config = Config.partner_data.data_partner_base[data.bid]
            let camp_type = 1
            if(config){
                camp_type = config.camp_type
            }
            data.camp_type = camp_type
            HeroController.getInstance().openHeroTipsPanel(true, data)
        }
    },
    // --查看对方分享英雄信息
    sender11062(id, srv_id){
        let protocal ={}
        protocal.id = id
        protocal.srv_id = srv_id
        this.SendProtocal(11062,protocal)
    },
    handle11062( data ){
        message(data.msg)
        if(data.bid != 0){
            let config = Config.partner_data.data_partner_base[data.bid]
            let camp_type = 1
            if(config){
                camp_type = config.camp_type
            }
            data.camp_type = camp_type
            HeroController.getInstance().openHeroTipsPanel(true, data)
        }
    },
});

module.exports = LookController;