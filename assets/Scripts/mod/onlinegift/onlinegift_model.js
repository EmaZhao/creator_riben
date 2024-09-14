// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-05 10:37:58
// --------------------------------------------------------------------
var OnlinegiftModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.onlinegift_data = [];
        this.online_time = 0;
    },

    properties: {
    },

    initConfig: function () {
    },

    updateData : function(data){
        this.online_time = data.time;
        this.onlinegift_data = data.list;
    },

    getOnlineGiftData : function(){
        return this.onlinegift_data;
    },

    getOnlineTime : function(){
        return this.online_time;
    }
});
