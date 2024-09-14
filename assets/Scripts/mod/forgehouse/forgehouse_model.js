// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-03 10:09:32
// --------------------------------------------------------------------
var ForgehouseModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.eqm_data_list = {};
    },

    // 根据装备类型获取配置数据
    getBackEquipsData: function (type) {
        if (this.eqm_data_list[type]) {
            return this.eqm_data_list[type]
        }

        this.eqm_data_list[type] = []
        const list = Config.partner_eqm_data.data_eqm_compose_id[type]
        for (var key in list) {
            const element = list[key]
            // if (element.type == type){
            this.eqm_data_list[type].push(element)
            // }
        }
        this.eqm_data_list[type].sort(function (a, b) {
            return a.id - b.id
        })
        return this.eqm_data_list[type]
    },

    setCompSendID: function (id) {
        this.comp_send_id = id;
    },

    getCompSendID: function () {
        return this.comp_send_id || null
    }
});
