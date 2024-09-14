// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗BUFF
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var BattleBuffData = cc.Class({
    extends: BaseClass,
    properties: {
        target: 0,          //buff的目标
        buff_bid: 0,        //buff bid
        remain_round: 0,    //剩余回合
        end_round:0,        //结束的回合
        action_type:0,      //作用类型 1 加buff 2 移除buff 3 生效
        change_type:0,      //改变的数值类型 1 血量
        change_value:0,     //改变的数值, 数值代表的意义跟类型绑定
        is_dead: 0,         //是否死亡 1 死亡 0 没有死亡
        id: 0,              //buff 唯一id
    },

    updateData: function (data) {
        for (var k in data) {
            this.setBaseDataByKey(k, data[k]);
        }
    },

    // 设置基础属性
    setBaseDataByKey: function (key, value) {
        if (this[key] != value) {
            this[key] = value;
        }
    }
});

module.exports = BattleBuffData;