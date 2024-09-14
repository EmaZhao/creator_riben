// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-29 11:43:16
// --------------------------------------------------------------------
var BattleDramaController = require("battle_drama_controller")
var GuildController = require("guild_controller")
var RoleController = require("role_controller")
var StrongerModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.scroe_list = {} //-- 我的伙伴评分数据
        this.max_list = {}   //-- 本服最强评分数据
    },
    // --设置伙伴的评分数据
    setDataByBid( data ){
        var self = this
        if (!self.scroe_list[data.partner_bid]){
            self.scroe_list[data.partner_bid] = {}	
        }
        self.scroe_list[data.partner_bid] = data.partner_score //--伙伴评分

        if(!self.max_list[data.partner_bid]){ 
            self.max_list[data.partner_bid] = {}	
        }
        self.max_list[data.partner_bid] = data.stronger_partner_score //--最强伙伴评分
    },
    //--返回英雄的总评/本服最强
    getTotalAndMaxValByBid(bid){
        var self = this
        let total = 0
        if (self.scroe_list[bid]){ 
            for(let k=0;k<self.scroe_list[bid].length;++k){
                let v = self.scroe_list[bid][k]
                total += v.val
            }
        }

        let max = 0
        if (self.max_list[bid]){ 
            for(let k=0;k<self.max_list[bid].length;++k){
                let v = self.max_list[bid][k]
                max += v.val
            }
        }
        return {total:total,max:max}
    },
    // -- 根据英雄bid获取变强相关数据
    getStrongerValByBid( bid, stronger_id ){
        let scroe_data = this.scroe_list[bid] || {}
        let max_data = this.max_list[bid] || {}
        let scroe_val = 0
        let max_val = 0
        for (let k=0;k<scroe_data.length;++k){ 
            let v = scroe_data[k]
            if (v.id_2 == stronger_id){
                scroe_val = v.val
                break
            }
        }
        for(let k=0;k<max_data.length;++k){
            let v = max_data[k]
            if (v.id_2 == stronger_id){
                max_val = v.val
                break
            }
        }
        return {scroe_val:scroe_val, max_val:max_val}
    },
    // -- 判断变强item是否开启
    checkStrongItemIsOpen( data ){
        let is_open = false
        if (data) {
            if (data[0] && data[0] == 'dugeon' ){//then --关卡的
                let drama_data = BattleDramaController.getInstance().getModel().getDramaData()
                if (drama_data && data[1]) {
                    let dungeon_id = data[1]
                    if (drama_data.max_dun_id >= dungeon_id){
                        is_open = true
                    }
                }
            }else if (data[0] && data[0] == 'lev'){ //then -- 等级的
                let role_vo = RoleController.getInstance().getRoleVo()
                if (role_vo && data[1]) {
                    let lev = data[1]
                    if (role_vo.lev >= lev ){
                        is_open = true
                    }
                }
            }else if (data[0] && data[0] == 'guild'){ //then --公会等级
                let role_vo = RoleController.getInstance().getRoleVo()
                if (role_vo && role_vo.gid != 0 && role_vo.gsrv_id != ''){ // then --表示有公会
                    let guild_info = GuildController.getInstance().getModel().getMyGuildInfo()
                    if (guild_info) {
                        let lev = data[1]
                        if (guild_info.lev >= lev ){
                            is_open = true
                        }
                    }
                }
            }
        }
        return is_open
    }
});