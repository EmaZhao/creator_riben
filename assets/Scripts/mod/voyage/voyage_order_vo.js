/*-----------------------------------------------------+
 * 远航订单数据
 * @author zys
 +-----------------------------------------------------*/
var VoyageConst = require("voyage_const");

var VoyageOrderVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.order_id = 0 	// 订单唯一id
        this.order_bid = 0 	// 订单bid
        this.status = VoyageConst.Order_Status.Finish  // 订单状态
        this.end_time = 0 	// 订单结束时间（接取后生效）
        this.assign_ids = {} // 订单派遣的英雄id列表
        this.config = {} 	// 订单配置表数据
        this.old_status = 0
    },

    updateData: function (data) {
        this.old_status = this.status;
        for (var key in data) {
            var value = data[key];
            this[key] = value;
            if (key == "order_bid") {
                this.config = Config.shipping_data.data_order[value] || {}
            }
        }
        this.fire(require("voyage_event").UpdateOrderDataEvent)
    },



    _delete: function () {

    },


});

module.exports = VoyageOrderVo;