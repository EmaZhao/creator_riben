// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗角色数据
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var BattleRoleData = cc.Class({
    extends: BaseClass,
    properties: {
        pos: 0,             // 位置唯一id
        group: 0,           // 分组
        owner_id:0 ,        // 拥有者id
        owner_srv_id:"",    // 拥有者服务器id
        object_type:0,      // 单位类型 1 角色 2 伙伴 3 怪物
        object_id:0,        // 角色id 或 伙伴 怪物 id
        object_bid:0,       // 伙伴 怪物 bid
        object_name: "",    // 名字
        is_awake: 0,        // 伙伴是否觉醒 1 觉醒 0 没有
        star:0 ,            // 伙伴星星
        camp_type: 0,       // 阵营
        sex: 0,             // 性别
        career: 0,          // 职业
        lev: 0,             // 等级
        hp:0 ,              // 血量
        hp_max: 0,          // 最大血量
        face_id: 0,         // 头像
        round: 0,           // 第几回合，每个单位的回合数自己单独算
        skills: [],         // 拥有技能,这个时候需要去加载资源的 skill_bid, end_round
        extra_data: [],     // 额外数据, extra_key:1 光环 extra_value: 值

        hallows_val: 0,
        hallows_max: 0,
    },

    updateData:function(data){
        for (var k in data) {
            this.setBaseDataByKey(k, data[k]);
        }
    },

    // 设置基础属性
    setBaseDataByKey: function (key, value){
        if (this[key] != value) {
            this[key] = value;
        }
    }
});
module.exports = BattleRoleData;
