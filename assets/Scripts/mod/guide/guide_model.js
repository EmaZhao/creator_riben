// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-15 14:38:52
// --------------------------------------------------------------------
var GuideModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
    },


    getGuideLastPos: function() {
        // this.last_guide_pos = pos;
        return this.last_guide_pos; 
    },

    setGuideLastPos: function(pos) {
        this.last_guide_pos = pos;
    },
    
    getTaskGuideLastPos:function(){
        return this.task_last_guide_pos;
    },

    setTaskGuideLastPos:function(pos){
        this.task_last_guide_pos = pos;
    }
});