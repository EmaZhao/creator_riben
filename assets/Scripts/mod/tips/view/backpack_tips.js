// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      普通物品的tips,区分背包中和其他
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TipsConst = require("tips_const");
var GoodsVo = require("goods_vo");
var BackPackConst = require("backpack_const");
var StringUtil = require("string_util");
var BackpackController = require("backpack_controller");

var BackPackTips = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "backpack_tips");
        this.viewTag = SCENE_TAG.msg;
        this.win_type = WinType.Tips;
    },

    initConfig: function(){
        this.tips_controller = require("tips_controller").getInstance()
        this.btn_list = {}
    },

    openCallBack:function(){
        this.background = this.seekChild("background")
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.container = this.seekChild("container")
        this.container_init_height = this.container.height

        this.close_btn = this.seekChild("close_btn")

        this.base_panel = this.seekChild(this.container, "base_panel")
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item")
        this.goods_item.setParent(this.base_panel)
        this.goods_item.initConfig(false, 1, false, false)
        this.goods_item.setPosition(-134, -68)
        this.goods_item.show()

        this.name = this.seekChild(this.base_panel, "name")
        this.equip_type = this.seekChild(this.base_panel, "equip_type", cc.Label)
        this.extend_desc = this.seekChild(this.base_panel, "extend_desc", cc.RichText)

        this.usedesc_panel = this.seekChild(this.container, "usedesc_panel")
        this.use_desc = this.seekChild(this.usedesc_panel, "desc", cc.Label)
        this.usedesc_panel_height = this.usedesc_panel.height

        this.desc_panel = this.seekChild(this.container, "desc_panel")
        this.desc_panel_height = this.desc_panel.height
        this.scroll_view = this.seekChild(this.desc_panel, "content")
        this.desc_label = this.seekChild(this.scroll_view, "desc_label")

        this.tab_panel = this.seekChild(this.container, "tab_panel")
        this.tab_panel_height = this.tab_panel.height
        for (let index = 0; index < 3; index++) {
            var btn = this.seekChild(this.tab_panel, "tab_btn_" + (index + 1))
            if (btn){
                var object = {}
                object.btn = btn
                object.label = btn.getChildByName("Label").getComponent(cc.Label)
                this.btn_list[(index+1)] = object
            }
        }
    },

    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, (function (event) {
            this.tips_controller.closeTIpsByType(TipsConst.type.GOODS)
        }).bind(this))

        this.close_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            Utils.playButtonSound("c_close");
            this.tips_controller.closeTIpsByType(TipsConst.type.GOODS)
        }).bind(this))
    },

    openRootWnd:function(object){
        object = object || {}
        var data = object.data
        var is_show_btn = object.show
        this.is_special_source = object.is_special_source

        this.item_config = null
        if(typeof(data) == "number"){
            this.item_config = Utils.getItemConfig(data)
        }else if(data instanceof GoodsVo){
            this.item_config = data.config
        }else{
            this.item_config = data
        }
        if (this.item_config == null) {
            this.tips_controller.closeTIpsByType(TipsConst.type.GOODS)
            return
        }
        this.data = data

        this.goods_item.setData(this.item_config)
        this.resetLayout(is_show_btn)
    },

    // 重设布局
    resetLayout:function(is_show_btn){
        is_show_btn = is_show_btn || false
        var target_height = this.container_init_height
        // 是否显示按钮
        if(!is_show_btn){
            this.tab_panel.active = false
            target_height -= this.tab_panel_height
        }

        // 是否显示描述
        var show_use_desc = true
        if(this.item_config.use_desc == null || this.item_config.use_desc == ""){
            show_use_desc = false
            this.usedesc_panel.active = false
            target_height -= this.usedesc_panel_height
        }

        // 只需要改变一下尺寸就好了
        if (this.container_init_height != target_height){
            this.container.height = target_height
            if(show_use_desc){
                this.usedesc_panel.y = this.base_panel.y - this.base_panel.height
                this.desc_panel.y = this.usedesc_panel.y - this.usedesc_panel.height
            }else{
                this.desc_panel.y = this.base_panel.y - this.base_panel.height
            }
        }
        if(is_show_btn){
            this.updateBtnList()
        }
        this.setBaseInfo()
    },

    // 设置按钮
    updateBtnList:function(){
        if(this.item_config == null) return;
        let type = this.item_config.type || 0
        for(var key in this.btn_list){
            var object = this.btn_list[key]
            if(object.btn){
                object.btn.active = false
            }
        }
        let btn_list = []
        if(this.is_special_source){  // 强制显示某一些按钮
            if(this.is_special_source == 1){  // 强制只显示来源
                btn_list.push(BackPackConst.tips_btn_type.source)
            }else if(this.is_special_source == 2){  // 强制显示神装图鉴
                btn_list.push(BackPackConst.tips_btn_type.heaven_book)
            }
        }else{
            btn_list = this.item_config.tips_btn || []
        }
        // var btn_list = this.item_config.tips_btn || []
        var btn_sum = btn_list.length
        if (btn_sum == 1){
            var object_1 = this.btn_list[1]
            var object_3 = this.btn_list[3]
            object_1.btn.x = object_3.btn.x
        }else if(btn_sum == 2){
            var object_1 = this.btn_list[1]
            var object_2 = this.btn_list[2]
            object_1.btn.x = -110
            object_2.btn.x = 110 
        }

        for (let index = 0; index < btn_list.length; index++) {
            if (index > 2) return;
            var object = this.btn_list[(index+1)]
            if (object && object.btn){
                const element = btn_list[index];
                var title = BackPackConst.tips_btn_title[element] || "";
  
                object.btn.active = true
                object.label.string = title;
                object.btn.on(cc.Node.EventType.TOUCH_END, (function (element,event) {
                    this.gotoSources(element)
                }).bind(this,element))
            }
        }
    },

    // 跳转对应标签
    gotoSources:function(index){
        if(!this.item_config)return;
        
        this.tips_controller.closeTIpsByType(TipsConst.type.GOODS);


        if(index == BackPackConst.tips_btn_type.source){//来源
            if(this.item_config.source.length>0){
                BackpackController.getInstance().openTipsSource(true,this.data);
            }else{
                message(Utils.TI18N("暂时没有来源"));
            }
        }else if(index == BackPackConst.tips_btn_type.sell){//金币市场道具出售
            if(this.data.quantity<=1){
                // MarketController:getInstance():sender23502( this.data.id,this.data.quantity )
            }else{
                if(!this.sell_vo)return;
                BackpackController.getInstance().openBatchUseItemView(true, this.data, BackPackConst.ItemConsumeType.sell,{type:1,value_list:this.sell_vo});
            }
        }else if(index == BackPackConst.tips_btn_type.goods_use){//普通物品使用
            var use_type = this.item_config.use_type || 1;
            if(this.data && this.data.id && use_type == BackPackConst.item_use_type.BATCH_USE){
                var quantity = this.data.quantity || 0;
                if(this.item_config.type == BackPackConst.item_type.FREE_GIFT){
                    BackpackController.getInstance().openGiftSelectPanel(this.data);
                }else if(quantity ==1){
                    BackpackController.getInstance().sender10515(this.data.id || 0,quantity);
                }else{
                    BackpackController.getInstance().openBatchUseItemView(true,this.data)
                }
            }
        }else if(index == BackPackConst.tips_btn_type.boss_source){//跳转世界boss界面

        }else if(index == BackPackConst.tips_btn_type.drama_new_source){//跳转剧情副本最新的关卡页面
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.drama_scene);
        }else if(index == BackPackConst.tips_btn_type.drama_source){//跳转剧情副本界面
            var MainuiController    = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.drama_scene);
        }else if(index == BackPackConst.tips_btn_type.hero_source){//跳转英雄信息界面
            // var MainuiController    = require("mainui_controller");
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner);
            var hero_controller = require("hero_controller").getInstance();
            hero_controller.openHeroBagWindow(true);
        }else if(index == BackPackConst.tips_btn_type.skill_source){//跳转英雄技能界面
            var HeroController = require("hero_controller");
            HeroController.getInstance().openHeroBagWindow(true);
        }else if(index == BackPackConst.tips_btn_type.form_source){//跳转编队阵法界面
            // var MainuiController    = require("mainui_controller");
            // var MainuiConst = require("mainui_const");
            // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner);
            var hero_controller = require("hero_controller").getInstance();
            hero_controller.openHeroBagWindow(true);
        }else if(index == BackPackConst.tips_btn_type.call_source){//跳转召唤界面
            var PartnersummonController = require("partnersummon_controller");
            PartnersummonController.getInstance().openPartnerSummonWindow(true);
        }else if(index == BackPackConst.tips_btn_type.artifact_source){

        }else if(index == BackPackConst.tips_btn_type.seerpalace_summon){//先知召唤
            var SeerpalaceController = require("seerpalace_controller")
            var SeerpalaceConst = require("seerpalace_const")
            SeerpalaceController.getInstance().openSeerpalaceMainWindow(true, SeerpalaceConst.Tab_Index.Summon);
        }else if(index == BackPackConst.tips_btn_type.seerpalace_change){//先知转换
            var SeerpalaceController = require("seerpalace_controller")
            var SeerpalaceConst = require("seerpalace_const")
            SeerpalaceController.getInstance().openSeerpalaceMainWindow(true, SeerpalaceConst.Tab_Index.Change);
        }else if(index == BackPackConst.tips_btn_type.hecheng2){//神器合成,统一一个合成窗口了
            // var config = this.data.config;
            // if(config && config.effect && config.effect[1] && config.effect[1].effect_type == 24){
            //     var item_id = config.effect[1].val || 0;
            //     BackpackController.getInstance().openBackPackComposeWindow(true, {bid=item_id});
            // }
        }else if(index == BackPackConst.tips_btn_type.fenjie){//英雄碎片分解
            var list = [];
            list.push({id: this.data.id, bid: this.data.base_id, num: this.data.quantity});
            BackpackController.getInstance().openBatchUseItemView(true, this.data, BackPackConst.ItemConsumeType.resolve);
        }else if(index == BackPackConst.tips_btn_type.redbag){//公会红包
            var RoleController      = require("role_controller");
            var role_vo = RoleController.getInstance().getRoleVo();
            if(role_vo && role_vo.gid !=0 && role_vo.gsrid !=""){
                var id = 1; //默认这个跳转1
                if(this.data && this.data.config && this.data.config.client_effect && Utils.next(this.data.config.client_effect || {}) != null && this.data.config.client_effect[0]){
                    id = this.data.config.client_effect[0];
                }
                var RedbagController = require("redbag_controller");
                RedbagController.getInstance().openMainView(true,id);
            }else{
                message(Utils.TI18N("未加入公会不能发红包哦！"));
            }
        }else if(index == BackPackConst.tips_btn_type.head){//个人设置头像
            var RoleController      = require("role_controller");
            RoleController.getInstance().openRoleDecorateView( true,2)
        }else if(index == BackPackConst.tips_btn_type.chenghao){//个人设置称号
            var RoleController      = require("role_controller");
            RoleController.getInstance().openRoleDecorateView( true,4);
        }else if(index == BackPackConst.tips_btn_type.partner_character){//跳转个人形形象设置
            var config = this.data.config;
            if(config){
                var setting = {};
                setting.id = this.data.config.id;
                var RoleController      = require("role_controller");
                RoleController.getInstance().openRoleDecorateView( true, 3, setting);
            }
        }else if(index == BackPackConst.tips_btn_type.arena_source){//跳转竞技场
            var ArenaController = require("arena_controller");
            ArenaController.getInstance().requestOpenArenaLoopMathWindow(true);
        }else if(index == BackPackConst.tips_btn_type.stone_upgrade){//跳转宝石升级界面

        }else if(index == BackPackConst.tips_btn_type.upgrade_star){//伙伴直升卡,升星

        }else if(index == BackPackConst.tips_btn_type.low_treasure){//跳转幸运探宝
            var ActionController = require("action_controller");
            ActionController.getInstance().openLuckyTreasureWin(true);
        }else if(index == BackPackConst.tips_btn_type.high_treasure){//跳转高级探宝
            var ActionController = require("action_controller");
            ActionController.getInstance().openLuckyTreasureWin(true,2);
        }else if(index == BackPackConst.tips_btn_type.halidom){//跳转圣物
            // var open_cfg = Config.HalidomData.data_const["halidom_open_lev"]
            // var role_vo = RoleController:getInstance():getRoleVo()
            // if open_cfg and role_vo and role_vo.lev >= open_cfg.val then
            //     MainuiController:getInstance():changeMainUIStatus(MainuiConst.new_btn_index.partner, HeroConst.BagTab.eHalidom)
            // elseif open_cfg then
            //     message(open_cfg.desc)
            // end
        }else if(index == BackPackConst.tips_btn_type.item_sell){ //道具出售 --目前是符石
            BackpackController.getInstance().openItemSellPanel(true, this.data, BackPackConst.Bag_Code.BACKPACK)
            
        }
        // this.tips_controller.closeTIpsByType(TipsConst.type.GOODS);

    },

    // 设置基础数据
    setBaseInfo:function(){
        if(this.item_config == null) return;
        this.extend_desc.string = ""
        var hex = BackPackConst.quality_color(this.item_config.quality)
        var color = this.name.color
        color.fromHEX(hex)
        this.name.color = color
        this.name.getComponent(cc.Label).string = this.item_config.name
        this.equip_type.string = Utils.TI18N("类型:") + this.item_config.type_desc
        this.use_desc.string = this.item_config.use_desc || ""

        if(this.item_config.desc){
            this.desc_label.getComponent(cc.RichText).string = "<color=#413333>"+StringUtil.parse(this.item_config.desc)+"</c>"
        }else{
            this.desc_label.getComponent(cc.RichText).string = "";
        }
        
        this.scroll_view.height = this.desc_label.height
    },

    closeCallBack: function () {
        if (this.goods_item) {
            this.goods_item.deleteMe();
        }
        this.goods_item = null;
        this.tips_controller.closeTIpsByType(TipsConst.type.GOODS)
    },
})