// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      背包内出售物品的面板
// <br/>Create: 2018-12-24 16:50:14
// --------------------------------------------------------------------
var BackPackConst = require("backpack_const");
var MainuiController = require("mainui_controller");
var MainuiConst = require("mainui_const");
var BackpackEvent = require("backpack_event");
var JumpController = require("jump_controller");
var TipsController = require("tips_controller")
var GuideController = require("guide_controller");

var BackpackController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var BackpackModel = require("backpack_model");
        this.model = new BackpackModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.login_event_success == null) {
            this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () {
                this.requestInitProto()
            }).bind(this))
        }

        if (this.re_link_game == null) {
            this.re_link_game = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, (function () {
                var GuideController = require("guide_controller");
                if (!GuideController.getInstance().isInGuide())
                    this.openMainWindow(false)  // 断线重连先关掉背包窗体

                // this.requestInitProto()
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(10500, this.on10500);
        this.RegisterProtocal(10501, this.on10501);
        this.RegisterProtocal(10510, this.on10510);    //增加物品通知
        this.RegisterProtocal(10511, this.on10511);    //删除物品通知
        this.RegisterProtocal(10512, this.on10512);    //刷新物品通知
        this.RegisterProtocal(10515, this.handle10515);//使用物品
        this.RegisterProtocal(10522, this.handle10522);//出售背包物品
        this.RegisterProtocal(10523, this.handle10523);
        this.RegisterProtocal(11008, this.handle11008);
        
        
    },

    // 请求角色道具初始数据
    requestInitProto: function () {
        // this.sender10500()
        // this.sender10501()
    },

    sender10500: function () {
        this.SendProtocal(10500, {});
    },

    sender10501: function () {
        this.SendProtocal(10501, {});
    },

    // 初始化道具背包
    on10500: function (data) {
        data.bag_code = BackPackConst.Bag_Code.BACKPACK
        this.model.initItemList(data)
    },

    // 初始化装备被曝
    on10501: function (data) {
        data.bag_code = BackPackConst.Bag_Code.EQUIPS
        this.model.initItemList(data)
    },

    // 增加一个物品
    on10510: function (data) {
        cc.log("增加一个物品",data)
        this.model.updateBagItemsNum(data)
    },

    // 删除一个物品
    on10511: function (data) {
        cc.log("删除一个物品",data)
        this.model.deleteBagItems(data)
    },

    // 刷新一个物品
    on10512: function (data) {
        this.model.updateBagItemsNum(data, true)
    },

    // ==============================
    // desc:出售物品
    // @storage:
    // @args:
    // @return 
    // ==============================
    sender10522:function(storage,args){
        var protocal ={};
        protocal.storage = storage;
        protocal.args = args;
        this.SendProtocal(10522,protocal);
    },

    handle10522:function(data){
        message(data.msg)   
        if(this.batch_use) {
            this.openBatchUseItemView(false);
        }
        if(this.sell_window){//出售成功之后关闭出售面板
            this.openSellWindow(false);
        }
        this.closeGiftSelectPanel();
        gcore.GlobalEvent.fire(BackpackEvent.Sell_Goods_Success);
    },

    // ==============================
    // desc:使用物品
    // @id:
    // @quantity:
    // @args:
    // @return 
    // ==============================
    sender10515:function(id,quantity,args){
        var protocal ={}
        protocal.id = id
        protocal.quantity = quantity
        protocal.args = args || {};
        this.SendProtocal(10515,protocal)
    },

    handle10515:function(data){
        message(data.msg);
        if(data.flag == 1){
            this.openBatchUseItemView(false);
            this.closeGiftSelectPanel();
        }
    },

    sender10523:function(id,num){
        var protocal ={};
        protocal.id = id;
        protocal.num = num;
        this.SendProtocal(10523,protocal);
    },
     
    handle10523:function(data){
        message(data.msg);
        if(data.flag == 1){
            gcore.GlobalEvent.fire(BackpackEvent.Compose_Goods_Success);
            TipsController.getInstance().showBackPackCompTips(false);
        }
    },

    //背包碎片合成
    sender11008:function(bid,num){
        var proto = {};
        proto.bid = bid;
        proto.num = num;
        this.SendProtocal(11008, proto);
    },

    handle11008:function(data){
        gcore.GlobalEvent.fire(BackpackEvent.Compose_BackPack_Success);
        message(data.msg);
        TipsController.getInstance().showBackPackCompTips(false);
        TipsController.getInstance().showCompChooseTips(false);
        if(data.result == 1){
            var items = [];
            for(var i in data.partners){
                var v = data.partners[i];
                var info = Config.partner_data.data_partner_base[v.partner_bid];
                items[parseInt(i)] = {};
                items[parseInt(i)].bid = v.partner_bid;
                items[parseInt(i)].star = info.init_star;
                items[parseInt(i)].camp_type = info.camp_type;
                items[parseInt(i)].show_type = MainuiConst.item_exhibition_type.partner_type;
            }
            MainuiController.getInstance().openGetItemView(true, items, 0)
        }
    },

    /**
     * 打开背包主入口
     * @param {*} status 
     * @param {*} params 
     */
    openMainWindow: function (status, params) {
        if (!status) {
            if (this.backpack_win) {
                this.backpack_win.close();
                this.backpack_win = null;
            }
        } else {
            if (this.backpack_win == null) {
                this.backpack_win = Utils.createClass("backpack_window")
            }
            this.backpack_win.open(params)
        }
    },

    /**
     * 显示道具提示信息
     * @author zhanghuxing 2019-01-21
     * @param  {[type]} status      [description]
     * @param  {[type]} data        可以是bid, 或者配置表条目
     * @param  {[type]} extend_data [description]
     * @param  {[type]} item_list   需要的物品列表
     * @return {[type]}             [description]
     */
    openTipsSource: function (status, data, extend_data, item_list) {
        if (status) {
            if(GuideController.getInstance().isInGuide())return;

            if(typeof(data) == "number"){
                data = Utils.getItemConfig(data)
            }
            if(data == null) return;
            if (!this.tips_source) {
                var TipsSource = require("tips_source_window");
                this.tips_source = new TipsSource(this);
            }
            // if (typeof data == "number") {
            //     data = Utils.getItemConfig(data);
            // }
            var open_params = {};
            open_params.data = data;
            open_params.extend_data = extend_data;
            open_params.item_list = item_list;
            this.tips_source.open(open_params);
        } else {
            if (this.tips_source) {
                this.tips_source.close();
                this.tips_source = null;
            }
        }
    },

    /**
     * desc:出售物品  
     */
    openItemSellPanel:function(status, goods_vo, bag_code){
        if(status == false){
            if(this.item_sell_panel != null){
                this.item_sell_panel.close();
                this.item_sell_panel = null;
            }
        }else{
            var bag_code = bag_code || BackPackConst.Bag_Code.BACKPACK;
            if(this.item_sell_panel == null){
                this.item_sell_panel = Utils.createClass("item_sell_panel_window",this);
            }
            if(this.item_sell_panel.isOpen() == false){
                this.item_sell_panel.open([goods_vo, bag_code]);
            }
        }
    },

    // --==============================--
    // --desc:打开批量使用物品窗口
    // --@item:必须是物品真是数据
    // --@type:出售或者使用
    // --@select_vo :自选礼包点击批量使用要传选中的物品id列表过来
    // --@return 
    // --==============================--
    openBatchUseItemView:function(status, item, type,select_vo){
        if(status == false){
            if(this.batch_use != null){
                this.batch_use.close();
                this.batch_use = null;
            }
        }else{
            if(item == null || item.config == null)return;
            if(this.batch_use == null){
                this.batch_use = Utils.createClass("backpack_batchuse_window",this);
            }
            if(this.batch_use && this.batch_use.isOpen() == false){
                this.batch_use.open([item, type,select_vo]);
            }
        }
    },

    /**
     * 打开出售物品界面展示
     * author:{author}
     * @status:
     * @list: 
     * return
     */
    openSellWindow:function(status, bag_code, list){
        if(status == false){
            if(this.sell_window != null){
                this.sell_window.close();
                this.sell_window = null;
            }
        }else{
            bag_code = bag_code || BackPackConst.Bag_Code.BACKPACK;
            if(list == null || Utils.next(list) == null)return;
            if(this.sell_window == null){
                this.sell_window = Utils.createClass("backpack_sell_window",this);
            }
            if(this.sell_window.isOpen() == false){
                this.sell_window.open(bag_code, list);
            }
        }
    },

    openGiftSelectPanel:function(gift_vo){
        if(this.gift_panel == null){
            this.gift_panel = Utils.createClass("gift_select_window",this);
        }
        if(this.gift_panel && this.gift_panel.isOpen() == false){
            this.gift_panel.open(gift_vo);
        }
    },

    closeGiftSelectPanel:function(){
        if(this.gift_panel != null){
            this.gift_panel.close();
            this.gift_panel = null;
        }
    },

    //跳转物品来源的
    gotoItemSources: function (evt_type, extend, bid, need_item_list) {
        if (evt_type == null || extend == null) return
        if (evt_type == "evt_partner_call") {   //召唤
            JumpController.getInstance().jumpViewByEvtData([1]);
        }else if(evt_type == "evt_mall_buy"){//商城
            if(extend[0]){
                JumpController.getInstance().jumpViewByEvtData([15, extend[0], bid]);
            }
        }else if(evt_type == "evt_vip"){//vip
            JumpController.getInstance().jumpViewByEvtData([7, VIPTABCONST.VIP, extend[0]]);
        }else if(evt_type == "evt_boss"){//个人BOSS挑战

        }else if(evt_type == "evt_world_boss"){//世界boss

        }else if(evt_type == "evt_tower"){//星命塔
            JumpController.getInstance().jumpViewByEvtData([12]);
        }else if(evt_type == "evt_divination"){//占卜
            // AuguryController:getInstance():openMainView(true)
        }else if(evt_type == "evt_dun_chapter"){//剧情副本
            JumpController.getInstance().jumpViewByEvtData([5]);
        }else if(evt_type == "evt_gold_market"){//金币市场

        }else if(evt_type == "evt_silver_market"){//银币市场

        }else if(evt_type == "evt_arena"){//竞技场挑战
            JumpController.getInstance().jumpViewByEvtData([3]);
        }else if(evt_type == "evt_arena_box"){//竞技场宝箱
            JumpController.getInstance().jumpViewByEvtData([3]);
        }else if(evt_type == "evt_bag_eqm"){//装备背包
            JumpController.getInstance().jumpViewByEvtData([8, BackPackConst.item_tab_type.EQUIPS]);
        }else if(evt_type == "evt_bag_partner"){//英雄背包
            JumpController.getInstance().jumpViewByEvtData([8, BackPackConst.item_tab_type.HERO]);
        }else if(evt_type == "evt_dun_stone"){//宝石副本
            JumpController.getInstance().jumpViewByEvtData([17]);
        }else if(evt_type == "evt_bag_star_life"){//特殊背包
            JumpController.getInstance().jumpViewByEvtData([8, BackPackConst.item_tab_type.SPECIAL]);
        }else if(evt_type == "evt_friend"){//好友
            JumpController.getInstance().jumpViewByEvtData([4]);
        }else if (evt_type == "evt_league") {
            JumpController.getInstance().jumpViewByEvtData([14]);
        } else if (evt_type == "evt_league_dungeon") {    //公会副本
            JumpController.getInstance().jumpViewByEvtData([31]);
        } else if (evt_type == "evt_league_donate") {     //公会捐献
            JumpController.getInstance().jumpViewByEvtData([13]);
        }else if(evt_type == "evt_league_sail"){//公会远航
            JumpController.getInstance().jumpViewByEvtData([18]);
        }else if (evt_type == "evt_league_skill") {     //公会技能
            JumpController.getInstance().jumpViewByEvtData([32]);
        } else if (evt_type == "evt_league_shop") {     //公会商店
            var MallConst = require("mall_const");
            JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.UnionShop]);
        } else if (evt_type == "evt_league_redpacket") {     //公会红包
            JumpController.getInstance().jumpViewByEvtData([33]);
        }else if(evt_type == "evt_league_war"){//公会战
            JumpController.getInstance().jumpViewByEvtData([21]);
        }else if(evt_type == "evt_god_world"){//神界冒险
            JumpController.getInstance().jumpViewByEvtData([34]);
        }else if(evt_type == "evt_league_help"){//帮内求助

        }else if(evt_type == "evt_exchange"){//兑换
            JumpController.getInstance().jumpViewByEvtData([35]);
        }else if(evt_type == "evt_arena_champion"){//冠军赛
            JumpController.getInstance().jumpViewByEvtData([36]);
        }else if(evt_type == "evt_endless"){//无尽试炼
            JumpController.getInstance().jumpViewByEvtData([43]);
        }else if(evt_type == "evt_partner_power"){//神将召唤
            // var PartnersummonController = require("partnersummon_controller");
            // PartnersummonController.getInstance().openGodPartnerSummonView(true)
        }else if(evt_type == "evt_hero"){//神将召唤

        }else if(evt_type == "evt_pet"){//萌宠
            var MainuiController    = require("mainui_controller");
            var BattleConst         = require("battle_const");
            MainuiController.getInstance().requestOpenBattleRelevanceWindow(BattleConst.Fight_Type.Escort);
        }else if(evt_type == "evt_shengqi"){//圣器
            JumpController.getInstance().jumpViewByEvtData([20]);
        }else if(evt_type == "evt_xingming"){//星命
            JumpController.getInstance().jumpViewByEvtData([12]);
        }else if(evt_type == "evt_primus"){
            // var PrimusController = require("primus_controller");
            // PrimusController.getInstance().openPrimusMainWindow(true);
            JumpController.getInstance().jumpViewByEvtData([27]);
        }else if(evt_type == "evt_skyladder"){
            JumpController.getInstance().jumpViewByEvtData([29]);
        }else if(evt_type == "evt_skyshop"){
            JumpController.getInstance().jumpViewByEvtData([37]);
        }else if(evt_type == "evt_change"){//充值
            JumpController.getInstance().jumpViewByEvtData([7]);
        }else if(evt_type == "evt_yueke"){//月卡

        }else if(evt_type == "evt_invest"){//投资计划
            JumpController.getInstance().jumpViewByEvtData([38]);
        }else if(evt_type == "evt_growfund"){//成长资金
            JumpController.getInstance().jumpViewByEvtData([39]);
        }else if(evt_type == "evt_partner"){//打开英雄界面
            JumpController.getInstance().jumpViewByEvtData([19]);
        }else if(evt_type == "evt_partner_gemstone"){//打开宝石界面

        }else if(evt_type == "evt_lucky_treasure" || evt_type == "evt_treasure"){//打开幸运探宝
            JumpController.getInstance().jumpViewByEvtData([40]);
        }else if(evt_type == "evt_recruit_high"){//先知召唤 先知殿
            var SeerpalaceConst = require("seerpalace_const")
            JumpController.getInstance().jumpViewByEvtData([24, SeerpalaceConst.Tab_Index.Summon]);
        }else if(evt_type == "evt_hero_conversion"){//先知召唤 英雄转换
            var SeerpalaceConst = require("seerpalace_const")
            JumpController.getInstance().jumpViewByEvtData([24, SeerpalaceConst.Tab_Index.Change]);
        }else if(evt_type == "evt_partner_synthesis"){//融合祭坛
            JumpController.getInstance().jumpViewByEvtData([23]);
        }else if(evt_type == "evt_partner_decompose"){//祭祀小屋
            JumpController.getInstance().jumpViewByEvtData([22]);
        }else if(evt_type == "evt_partner_eqm_synthesis"){//锻造屋
            JumpController.getInstance().jumpViewByEvtData([26]);
        }else if(evt_type == "evt_expedition"){//英雄远征
            JumpController.getInstance().jumpViewByEvtData([25]);
        }else if(evt_type == "evt_grocery_store"){//杂货店
            JumpController.getInstance().jumpViewByEvtData([6]);
        }else if(evt_type == "evt_daily_quest"){//日常任务进度宝箱获得！
            JumpController.getInstance().jumpViewByEvtData([41]);
        }else if(evt_type == "evt_achievement"){//完成成就任务获得！
            var TaskConst = require("task_const");
            JumpController.getInstance().jumpViewByEvtData([41, TaskConst.type.feat]);
        }else if(evt_type == "evt_rune_synthesis"){
            var ForgeHouseConst = require("forgehouse_const");
            JumpController.getInstance().jumpViewByEvtData([26, ForgeHouseConst.Tab_Index.Artifact])
        }else if(evt_type == "evt_skillshop"){
            var MallConst = require("mall_const");
            JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.SkillShop]);
        }else if(evt_type == "evt_eliteshop"){
            var MallConst = require("mall_const");
            JumpController.getInstance().jumpViewByEvtData([15, MallConst.MallType.EliteShop]);
        }else if(evt_type == "evt_elitematch"){//精英赛
            JumpController.getInstance().jumpViewByEvtData([28]);
        }else if(evt_type == "evt_element_temple"){//元素圣殿
            JumpController.getInstance().jumpViewByEvtData([42]);
        }else {
            message(Utils.TI18N("暂无跳转，或者还没添加！"))
        }
    },

    getBackpackRoot: function() {
        if (this.backpack_win)
            return this.backpack_win.root_wnd;
    },
});

module.exports = BackpackController;
