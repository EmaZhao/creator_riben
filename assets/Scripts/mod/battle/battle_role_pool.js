// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      战斗中需要的对象的对象池,区分真假战斗
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var BattleRolePool = cc.Class({
    extends: BaseClass,
    statics: {
        instance: null
    },

    initConfig:function(){
        this.realPools = new cc.NodePool();         // 战斗对象的预制体缓存对象池
        this.effectPools = new cc.NodePool();       // 战斗特效缓存对象池
        this.fontPools = new cc.NodePool();         // 战斗中的程序字缓存,主要是被动或者buff播报
        this.buffpools = new cc.NodePool();         // 战斗中的buff图标缓存

        this.dmgPoolsList = {};                     // 战斗中伤害具体区分的对象池
    },

    // 返回这个对象池
    getRealPools:function(){
        return this.realPools;
    },

    // 战斗对象丢到对象池中
    pushBackRole:function(role){
        this.realPools.put(role);
    },

    // 获取特效对象池
    getEffectPools:function(){
        return this.effectPools;
    },

    // 回收特效对象池
    pushBackEffect:function(effect){
        this.effectPools.put(effect);
    },

    // 返回文字对象
    getFontPools:function(){
        return this.fontPools;
    },

    // 回收文字对象
    pushBackFont:function(font){
        this.fontPools.put(font)
    },

    // bufficon对象
    getBuffPools:function(){
        return this.buffpools;
    },

    // 回收buff对象
    pushBackBuffPools:function(buff){
        this.buffpools.put(buff);
    },

    // 战斗治疗和伤害数字节点对象池
    getDmgPools:function(type){
        var pool = this.dmgPoolsList[type];
        if(pool == null){
            pool = new cc.NodePool();
            this.dmgPoolsList[type] = pool;
        }
        return pool;
    },

    // 回收伤害数字
    pushBackDmgPools:function(type, dmg){
        var pool = this.dmgPoolsList[type];
        if (pool == null) {
            pool = new cc.NodePool();
            this.dmgPoolsList[type] = pool;
        }
        pool.put(dmg);
    },
});

BattleRolePool.getInstance = function () {
    if (!BattleRolePool.instance) {
        BattleRolePool.instance = new BattleRolePool();
        BattleRolePool.instance.initConfig();
    }
    return BattleRolePool.instance;
}

module.exports = BattleRolePool;
