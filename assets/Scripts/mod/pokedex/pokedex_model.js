// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-08 10:31:20
// --------------------------------------------------------------------
var PokedexModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.all_data = {}
    },
    getAllData(){
        if(this.all_data){
            return this.all_data
        }
    },
});