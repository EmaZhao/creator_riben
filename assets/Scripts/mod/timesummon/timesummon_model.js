// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-07-08 20:48:58
// --------------------------------------------------------------------
var TimesummonConst = require("timesummon_const")
var TimesummonModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
    },
    getEffectAction( award_list ){
        let index = 1
        for(let i=0;i<award_list.length;++i){
            let v = award_list[i]
            let item_cfg = Utils.getItemConfig(v.base_id)
            if(item_cfg){
                if(item_cfg.type == 102){  // 碎片
                    if(item_cfg.eqm_jie == 4 && index < 2){
                        index = 2
                    }else if(item_cfg.eqm_jie == 5 && index < 3){
                        index = 3
                    }
                }else{
                    if(item_cfg.eqm_jie == 3 && index <= 1){
                        index = 1
                    }else if(item_cfg.eqm_jie == 4 && index < 4){
                        index = 4
                    }else if(item_cfg.eqm_jie == 5 && index < 5){
                        index = 5
                    }
                }
            }
        }

        let action_list = TimesummonConst.Action_Group[index]
        return [action_list[0], action_list[1]]
    }
});