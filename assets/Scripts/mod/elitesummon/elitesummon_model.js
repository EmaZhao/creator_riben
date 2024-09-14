// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-08-09 15:54:22
// --------------------------------------------------------------------
var ElitesummonModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
    },
    isHolidayHasID(id){
        let status = false
        let config = Config.recruit_holiday_elite_data.data_action
        if(config){
            for(let i in config){
                let v = config[i]
                if(id == v.camp_id){
                    status = true
                    break
                }
            }
        }
        return status
    },
});