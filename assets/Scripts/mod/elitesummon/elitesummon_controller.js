// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-08-09 15:54:22
// --------------------------------------------------------------------
var EliteSummonEvent = require("elitesummon_event")
var ElitesummonController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var ElitesummonModel = require("elitesummon_model");

        this.model = new ElitesummonModel();
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
        this.RegisterProtocal(23220, this.handle23220)
        this.RegisterProtocal(23221, this.handle23221)
        this.RegisterProtocal(23222, this.handle23222)

        // --预言召唤协议
        // this.RegisterProtocal(16690, this.handle16690)
        // this.RegisterProtocal(16691, this.handle16691)
        // this.RegisterProtocal(16692, this.handle16692)
        // this.RegisterProtocal(16693, this.handle16693)
        // this.RegisterProtocal(16694, this.handle16694)
    },
    send23220(){
        this.SendProtocal(23220)
    },
    send23222(){
        this.SendProtocal(23222)
    },
    send23221(times,recruit_type){
        let proto = {}
        proto.times = times
        proto.recruit_type = recruit_type
        this.SendProtocal(23221,proto)
    },
    handle23220(data){
        gcore.GlobalEvent.fire(EliteSummonEvent.EliteSummon_Message,data)
    },
    handle23221(data){
        message(data.msg)
    },
    handle23222(data){
        message(data.msg)
    },
    handle16690(data){

    },
    handle16691(data){

    },
    handle16692(data){

    },
    handle16693(data){

    },
    handle16694(data){

    },
});

module.exports = ElitesummonController;