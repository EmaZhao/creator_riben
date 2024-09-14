// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-21 10:11:26
// --------------------------------------------------------------------
var SeerpalaceModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.change_flag = false  //-- 标记是否为置换英雄
        this.change_partner_id = 0 //-- 当前已置换但未保存的英雄id,0为无
        this.change_info = null // --英雄转换信息
    },
    // -- 设置当前已置换但未保存的英雄id
    setChangePartnerId( partner_id ){
        this.change_partner_id = partner_id || 0
    },
    // setChangeInfo(data){
    //     this.change_info = data
    // },
    setChangeFlag(flag){
        this.change_flag = flag
    },
    getChangeFlag(){
        return this.change_flag
    },

    //  记录最后一次召唤的组id
    setLastSummonGroupId:function( group_id ){
        this.last_summon_group_id = group_id;
    },

    getLastSummonGroupId:function(  ){
        return this.last_summon_group_id;
    },

});
module.exports = SeerpalaceModel;