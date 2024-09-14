/*-----------------------------------------------------+
 * 角色数据模块
 * @author whjing2012@163.com
 +-----------------------------------------------------*/
 var RoleEvent = require("role_event");
 var RoleVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor:function(){
        this.rid = 0;
        this.srv_id = "";
        this.name = "";
        this.lev = 0;
        this.exp = 0;
        this.exp_max = 0;
        this.sex = 0;
        this.gold = 0;//免费钻石
        this.gold_hard = 0;//付费钻石
        this.coin = 0;
        this.vip_lev = 0;
        this.vip_exp = 0;
        this.is_vip = 0;//是否激活vip;
        this.face_id = 0; // 头像
        this.avatar_base_id = 0; // 头像框
        this.face_list = []; // 头像列表 
        this.title_id = 0; // 使用称号ID
        this.title_list = []; // 已获得称号列表
        this.reg_time = 0;//注册时间

        this.gid = 0;//公会id
        this.gsrv_id = "";//公会服务器id
        this.position = 0;//公会职位
        this.gname = "";//所属帮派的名字
        this.guild_lev = 0;//公会等级
        this.guild_quit_time = 0;//上次退帮时间
        this.friend_point = 0;//友情点

        this.power = 0;//战力
        this.max_power = 0;//最高战力

        this.open_day = 0;      // 开服天数

        this.energy = 0;//远航情报
        this.energy_max = 0;//远航情报上限

        this.dic_action_assets= {}                   // --活动资产信息 self.dic_action_assets[资产id] = 数量

        this.recruithigh_hero= 0                    // -- 先知殿积分

        this.vip_card_exp = 0;

        this.draw_id = 10401;//默认
        this.gold_acc = 0;
    },

    // 更新角色数据
    initAttributeData : function(data){
        for(var k in data){
            this.setRoleAttribute(k, data[k]);
        }
    },

    // 设置单个属性信息
    setRoleAttribute : function(key, value){
        if(key == "srv_id"){
            let str = "srv_id" + gcore.SysEnv.get("user_name");
            gcore.SysEnv.set(str,value);
            // console.log("key===",key,value,str);
            // console.log("存储的服务器", gcore.SysEnv.get(str))
        }
        if(this[key] != value){
            this[key] = value;
            this.dispatchUpdateAttrByKey(key, value);
            if(key == "lev" && (PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK")){
                SDK.roleUpLevel(value);
            }
        }
    },
    // 派发单个属性变化事件
    dispatchUpdateAttrByKey(key, value){
        this.fire(EventId.UPDATE_ROLE_ATTRIBUTE, key, value);
        if(key == "lev" && window.IS_PC){
          gcore.GlobalEvent.fire(RoleEvent.RefreshRoleLev,key,value);
        }
    },

    // 角色基础数据变化 
    dispatchUpdateBaseAttr : function(){
        this.fire(EventId.ROLE_EVENT_BASE_ATTR);
    },

    //判断是否有加入宗派
    isHasGuild:function() {
        return this.gid != 0
    },
    // --[[角色活动资产信息]]
    // --@is_update 是否数据更新
    initActionAssetsData(holiday_assets, is_update){
        holiday_assets = holiday_assets || []
        for(let i=0;i<holiday_assets.length;++i){
            let v = holiday_assets[i]
            this.dic_action_assets[v.id] = v.val
            if (is_update){
                this.fire(RoleEvent.UPDATE_ROLE_ACTION_ASSETS, v.id, v.val)
            }
        }
    },
    // --获取活动资产数量
    getActionAssetsNumByBid(bid){
        var self = this
        if (self.dic_action_assets && self.dic_action_assets[bid]){
            return self.dic_action_assets[bid]
        }else{
            return 0
        }
    },

    setPower: function(value) {
        var old_value = this.power;
        this.power = value || 0;
        if(this.is_show_power == true){
            if(old_value < value){
                GlobalMessageMgr.getInstance().showPowerMove(value - old_value, null,old_value);
            }
        }
        if (this.power != old_value) {
            this.fire(EventId.UPDATE_ROLE_ATTRIBUTE, "power", this.power);
        }
        this.showPower(false)
    },
    showPower(bool){
        this.is_show_power= bool
    },
    //设置最高战力
    setMaxPower:function(value){
        var old_value = this.max_power;
        this.max_power = value || 0;
        if(this.max_power != old_value){
            this.fire(EventId.UPDATE_ROLE_ATTRIBUTE, "max_power", this.max_power);
        }
    },
    getTotalGold:function(){
        return (this.gold + this.gold_hard)||0;
    }

 });