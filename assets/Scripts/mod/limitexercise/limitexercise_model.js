// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-09-09 19:11:57
// --------------------------------------------------------------------
var LimitexerciseModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        
    },
    // --轮次
    getCurrentRound(){
        if(this.limitexercise_data && this.limitexercise_data.round){ 
            let round_data = Config.holiday_boss_new_data.data_round_list
            if(round_data && round_data[this.limitexercise_data.round]){
                return round_data[this.limitexercise_data.round].unit_round
            }
        }
        return 1
    },
    setLimitExerciseData(data){
        this.limitexercise_data = data
    },
    setChangeCount(count,buy_count){
        if(this.limitexercise_data && this.limitexercise_data.count != null && this.limitexercise_data.buy_count != null ){
            this.limitexercise_data.count = count
            this.limitexercise_data.buy_count = buy_count
        }
    },
    setHeroUseId(data){
        this.hero_use_list = {}
        for(let i=0;i<data.length;++i){
            let v = data[i]
            this.hero_use_list[v.id] = v.count
        }
    },
    getHeroUseId(id){
        if(this.hero_use_list && this.hero_use_list[id]){
            return this.hero_use_list[id]
        }
        return 0
    },
    //难度
    getCurrentDiff(){
        if(this.limitexercise_data){
            return this.limitexercise_data.difficulty || 1
        }
        return 1
    },
    //正在挑战的关卡id
    getCurrentChangeID(){
        if(this.limitexercise_data){
            return this.limitexercise_data.order || 1
        }
        return 1
    },
    //当前关卡的血量
    getCurrentBossHp(){
        if(this.limitexercise_data){
            return this.limitexercise_data.hp_per || 0
        }
        return null
    },
    //宝箱状态
    getBoxStatus(){
        if(this.limitexercise_data){
            return this.limitexercise_data.status || 0
        }
        return 0
    },
    //关卡类型
    getCurrentType(){
        if(this.limitexercise_data){
            return this.limitexercise_data.order_type || 0
        }
        return null
    },
    //获取今日购买次数
    getDayBuyCount(){
        if(this.limitexercise_data){
            return this.limitexercise_data.buy_count || 0
        }
        return 0
    },
    //剩余挑战次数
    getReaminCount(){
        if(this.limitexercise_data){
            return this.limitexercise_data.count || 0
        }
        return 0
    },
    //获取基本数据
    getLimitExerciseData(){
        if(this.limitexercise_data){
            return this.limitexercise_data
        }
        return null
    },
});