// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      商城的model
// <br/>Create: 2018-12-18 17:12:27
// --------------------------------------------------------------------
// var HeroController = require("hero_controller");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller")
var MallConst = require("mall_const")
var MallModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        var MailController = require("mall_controller");
        this.ctrl = MailController.getInstance();
    },

    properties: {
    },

    initConfig: function () {
        this.buy_list = {};
        this.shop_list = {};
        this.mall_main_rp_status = {};
        this.mall_main_rp_data = {};
    },

    setBuyList: function (data) {
        this.buy_list = data;
    },

    getBuyList: function () {
        return this.buy_list
    },

    getScoreBuyList: function (shop_type) {
        if (this.shop_list[shop_type] && Utils.next(this.shop_list[shop_type]) != null) {
            return this.shop_list[shop_type]
        }
        return null
    },

    //检查当前神格商店中是否存在上阵的的伙伴碎片
    checkHeroChips: function (item_id) {
        var is_has = false;
        var pos_list = [];
        // var pos_list = HeroController.getInstance().getModel().getMyPosList();
        if (pos_list != null && Utils.next(pos_list || {}) != null) {
            for (var k in pos_list) {
                var v = pos_list[k];
                var partner_data = PartnerController.getInstance().getModel().getPartnerById(v.id);
                if (partner_data && partner_data.chips_id == item_id) {
                    is_has = true;
                }
            }
            return is_has
        }
        return false
    },

    //根据商店类型以及支付类型和单价来判断能够买多少个
    checkMoenyByType: function (pay_type, price) {
        var role_vo = RoleController.getInstance().getRoleVo();
        var is_can_buy_num = 0;
        if (role_vo != null) {
            var config = Utils.deepCopy(Config.item_data.data_assets_label2id)
            if (typeof (pay_type) == "number") {
                if (pay_type == config.hero_soul) { //神格
                    var hero_soul = role_vo.hero_soul;
                    is_can_buy_num = Math.floor(hero_soul / price);
                }
                else if (pay_type == config.silver_coin) {
                    var silver_coin = role_vo.silver_coin;
                    is_can_buy_num = Math.floor(silver_coin / price);
                }
                else if (pay_type == config.red_gold_or_gold) {
                    var sum_gold = role_vo.red_gold + role_vo.getTotalGold();
                    is_can_buy_num = Math.floor(sum_gold / price);
                }
                else if (pay_type == config.arena_guesscent) {
                    var arena_guesscent = role_vo.arena_guesscent;
                    is_can_buy_num = Math.floor(arena_guesscent / price);
                }
                else if (pay_type == config.star_point) {
                    var star_point = role_vo.star_point;
                    is_can_buy_num = Math.floor(star_point / price);
                }
                else if (pay_type == config.gold) {
                    var sum_gold = role_vo.getTotalGold();
                    is_can_buy_num = Math.floor(sum_gold / price);
                }
                else if (pay_type == config.coin) {
                    var coin = role_vo.coin;
                    is_can_buy_num = Math.floor(coin / price);
                }
                else{
                    let count = BackpackController.getInstance().getModel().getItemNumByBid(pay_type)
                    is_can_buy_num = Math.floor(count / price)
                }
            } else {
                if (pay_type == "gold") {
                    var gold = role_vo.getTotalGold();
                    is_can_buy_num = Math.floor(gold / price);
                }
                else if (pay_type == "red_gold_or_gold") {
                    var sum_gold = role_vo.red_gold + role_vo.getTotalGold();
                    is_can_buy_num = Math.floor(sum_gold / price);
                }
                else if (pay_type == "arena_cent") {
                    var arena_cent = role_vo.arena_cent;
                    is_can_buy_num = Math.floor(arena_cent / price);
                }
                else if (pay_type == "friend_point") {
                    var friend_point = role_vo.friend_point
                    is_can_buy_num = Math.floor(friend_point / price)
                }
                else if (pay_type == "guild") {
                    var guild = role_vo.guild
                    is_can_buy_num = Math.floor(guild / price)
                }
                else if (pay_type == "boss_point") {
                    var boss_point = role_vo.boss_point
                    is_can_buy_num = Math.floor(boss_point / price)
                }
                else if (pay_type == "arena_guesscent") {
                    var arena_guesscent = role_vo.arena_guesscent
                    is_can_buy_num = Math.floor(arena_guesscent / price)
                }
                else if (pay_type == "star_point") {
                    var star_point = role_vo.star_point
                    is_can_buy_num = Math.floor(star_point / price)
                }
                else if (pay_type == "sky_coin") {
                    var sky_coin = role_vo.sky_coin
                    is_can_buy_num = Math.floor(sky_coin / price)
                }
                else if (pay_type == "recruithigh_hero") {
                    var recruithigh_hero = role_vo.recruithigh_hero
                    is_can_buy_num = Math.floor(recruithigh_hero / price)
                }
                else if (pay_type == "expedition_medal") {
                    var expedition_medal = role_vo.expedition_medal
                    is_can_buy_num = Math.floor(expedition_medal / price)
                }
                else if (pay_type == "coin") {
                    var coin = role_vo.coin
                    is_can_buy_num = Math.floor(coin / price)
                }
                else if (pay_type == "silver_coin") {
                    var silver_coin = role_vo.silver_coin
                    is_can_buy_num = Math.floor(silver_coin / price)
                }
            }
        }
        return is_can_buy_num
    },

    checkActionMoenyByType:function(pay_type,price){
        var role_vo = RoleController.getInstance().getRoleVo();
        var is_can_buy_num = 0;
        if (role_vo){
            var count = role_vo.getActionAssetsNumByBid(pay_type);
            is_can_buy_num = Math.floor(count/price);
        }
        return is_can_buy_num;
    },
    //设置商城主界面红点
    setMallMainRedPointData(bid,data){
        switch(bid){
            case MallConst.MallFunc.Welfare:
                if(this.mall_main_rp_data[bid]){
                    var haskey =false;
                for(var item in this.mall_main_rp_data[bid]){
                    if(this.mall_main_rp_data[bid][item].bid == data.bid){
                        this.mall_main_rp_data[bid][item] = data;
                        haskey = true;
                    }
                }
                if(!haskey) this.mall_main_rp_data[bid].push(data);
                }else{
                    this.mall_main_rp_data[bid] = [data];
                }
                break;
            default:
                this.mall_main_rp_data[bid] = data;
                break;
        }
        if(typeof(data) == "boolean")
        {
            this.mall_main_rp_status[bid] = data;
        }else if(typeof(data) == "object"){
            var rp = false;
            for(var rpdata in this.mall_main_rp_data[bid]){
                if(this.mall_main_rp_data[bid][rpdata].num > 0){
                    rp = true;
                    break;
                }
            }
            this.mall_main_rp_status[bid] = rp;
        }
        var hasred = false;
        for(var item in this.mall_main_rp_status){
			if(this.mall_main_rp_status[item] == true){
				hasred = true;
			}
		}
        require("mainui_controller").getInstance().setBtnRedPoint(require("mainui_const").new_btn_index.shop, hasred);
		gcore.GlobalEvent.fire(require("mall_event").Mall_Main_RedPoint_Event);
    },
    //获取红点数据
    getMallMainRedPointData(){
        return this.mall_main_rp_status;
    }

});

module.exports = MallModel;