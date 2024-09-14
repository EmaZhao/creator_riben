/*-----------------------------------------------------+
 * 主角色数据模块
 * @author whjing2012@163.com
 +-----------------------------------------------------*/

 var RoleModel = cc.Class({
    
    ctor:function(){
        this.role_vo = null;
    },

    initConfig:function(){
        this.open_srv_day = 0;          // 开服天数.
        this.world_lev = 0;
    },

    // -- 设世界等级
    setWorldLev(lev){
        this.world_lev = lev;
    },

    // -- 获取世界等级
    getWorldLev(){
        return this.world_lev;
    },

    // 初始化角色基础数据
    initRoleBaseData : function(data){
        this.initAttribute(data);
        this.role_vo.dispatchUpdateBaseAttr();
    },

    // 资产信息变化
    initRoleAssetsData : function(data){
        this.initAttribute(data);
    },

    // 更新角色所有属性
    initAttribute : function(data){
        if(!this.role_vo){
            var RoleVo = require("role_vo");
            this.role_vo = new RoleVo();
        }
        this.role_vo.initAttributeData(data);
    },

    // 更新角色单个属性
    setRoleAttribute : function(key, value){
        if(this.role_vo){
            this.role_vo.setRoleAttribute(key, value);
        }
    },

    // 特权礼包
    setPrivilegeData:function(data_list){
        this.privilege_data = data_list;
    },

    /**
     * 监测当前的特权状态
     * @param {*} id 1快速作战特权 2远航普通特权 3远航高级特权
     */
    checkPrivilegeStatus:function(id){
        var status = false;
        if(this.privilege_data){
            for (let index = 0; index < this.privilege_data.length; index++) {
                const element = this.privilege_data[index];
                if (element.id == id){
                    status = (element.status == 1);
                    break;
                }
            }
        }
        return status;
    },

    getRoleVo:function(){
        return this.role_vo;
    },

    // 设置开服天数
    setOpenSrvDay:function(day){
        this.open_srv_day = day;
        this.setRoleAttribute("open_day", day);

        gcore.GlobalEvent.fire(EventId.OPEN_SRV_DAY, day);
    },

    getOpenSrvDay:function(){
        return this.open_srv_day;
    },

    //是否在本服里面
    isTheSame:function(srv_id){
        if(this.serverList && srv_id){
            return this.serverList[srv_id] != null
        }
        return true
    },
    // --活动资产信息改变
    initRoleActionAssetsData(holiday_assets, is_update){
        if (!this.role_vo){
            var RoleVo = require("role_vo");
            this.role_vo = new RoleVo();
        }
        if (holiday_assets){
            this.role_vo.initActionAssetsData(holiday_assets, is_update)
        }
    },
 });