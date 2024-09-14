/*-----------------------------------------------------+
圣器数据
 +-----------------------------------------------------*/

 var HallowsVo = cc.Class({
     extends: gcore.BaseEvent,
     ctor: function () {
         this.initData();
     },
 
     //初始化数据
     initData: function () {
        this.id = 0                     // 圣器id
        this.step = 1                   // 圣器阶数
        this.lucky = 0                  // 当前幸运值
        this.lucky_endtime = 0          // 幸运值清零时间
        this.power = 0                  // 圣器战力
        this.seal = 0                   // 当前圣印数量
        this.add_attr = {}              // 总属性加成 attr_id attr_val 
        this.reward = {}                // 奖励列表
        this.skill_bid = 0              // 神器技能id
        this.skill_lev = 1              // 神器技能等级

        this.is_update = false

        this.red_status_list = {}       // 红点状态
     },
 
    initAttributeData:function(data){
        this.is_update = true;
        for(var k in data){
            if (this[k] != null) {
                this.updateSingleData(k,data[k]);
            }

            if(k == "add_attr"){
                this.updateAddAttr(data[k]);
            }else if(k == "skill"){
                this.updateSkill(data[k]);
            }

        }
    },
    
    updateSingleData: function (key, value) {
        if (this[key] != value) {
            this[key] = value;
        }
    },

    //总属性
    updateAddAttr:function(value){
        this.add_attr = value || {};
    },

    //计算红点状态
    checkRedStatus:function(force){
        if(this.is_update || force){
            this.is_update = false;
            this.red_status_list = {};
            return false

            // -- 旧的红点逻辑，可能加回来，暂时保留。
            // --[[local is_can_upgrade = self:checkCanUpgrade()
            // local is_can_trace = self:checkCanUseTrace()
            // local is_can_skill = self:checkCanUpgradeSkill()
    
            // self.red_status_list[HallowsConst.red_type.advance] = is_can_upgrade
            // self.red_status_list[HallowsConst.red_type.rewards] = is_can_rewards 
            // self.red_status_list[HallowsConst.red_type.trace] = is_can_trace 
            // self.red_status_list[HallowsConst.red_type.skill] = is_can_skill 
            // return is_can_upgrade or is_can_rewards or is_can_trace or is_can_skill--]]
        }else{
            for(var i in this.red_status_list){
                if(this.red_status_list[i]){
                    return true;
                }
            }
        }
        return false
    },

    
    getRedStatus:function(type){
        return this.red_status_list[type];
    },

    // 是否可以进阶(暂时屏蔽)
    checkCanUpgrade:function(){
        return false
    },

    // 判断是否可以使用圣印(暂时屏蔽)
    checkCanUseTrace:function(){
        return false;
        // --[[if self.step < 3 then return false end   --小于三阶不可以吃圣印
        //     local trace_config = Config.hallows_data.data_trace_cost(getNorKey(self.id, self.step))
        //     if trace_config == nil then return false end
        //     if self.seal >= trace_config.num then return false end
        
        //     local bid = 72003
        //     local backpack_model = BackpackController:getInstance():getModel()
        //     local sum = backpack_model:getBackPackItemNumByBid(bid)
        //     return sum > 0--]]
    },

    //判断是否可以升技能(暂时屏蔽)
    checkCanUpgradeSkill:function(){
        return false;
        // --[[
        //     local bid = 72002
        //     local backpack_model = BackpackController:getInstance():getModel()
        //     local red_status = false
            
        //     return red_status--]]
    },

    //更新圣技属性
    updateSkill:function(data){
        if(data[0]){//圣技只有一个技能，写死读取列表第一个
            this.skill_bid = data[0].skill_bid
            this.skill_lev = data[0].lev
        }
    },

    //判断一个阶数奖励是否已经领取过了
    checkRewardsIsOver:function(step){
        return this.reward[step]
    },

     _delete: function () {
 
     }
 });
 
 module.exports = HallowsVo;