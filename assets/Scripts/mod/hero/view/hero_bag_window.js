// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-23 10:25:14
// --------------------------------------------------------------------
var HeroConst = require("hero_const");
var HeroEvent = require("hero_event");
var HeroCalculate = require("hero_calculate")
var PathTool = require("pathtool");
var GuideController = require("guide_controller");

var HeroBagWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_bag_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_index = 1;                         // 当前选中的标签页
        this.cur_camp  = 0;                         // 当前阵容 
        this.camp_btns = {};
        this.cur_role_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        // 装备tap
        this.tab_btn_1_nd           = this.seekChild("tab_btn_1");
        this.tab_btn_1_normal_nd    = this.tab_btn_1_nd.getChildByName("normal_img");
        this.tab_btn_1_select_nd    = this.tab_btn_1_nd.getChildByName("select_img");
        this.tab_btn_1_label_nd     = this.tab_btn_1_nd.getChildByName("label");
        this.tab_btn_1_label_nd.getComponent(cc.Label).string = Utils.TI18N("英雄");
        this.tab_btn_1_red_point_nd = this.tab_btn_1_nd.getChildByName("red_point");
        this.background = this.seekChild("background");
        this.loadRes(PathTool.getBigBg("hero/hero_bag_bg"),function(sp){
            this.background.getComponent(cc.Sprite).spriteFrame = sp;
        }.bind(this))

        // 图鉴
        this.tab_btn_2_nd           = this.seekChild("tab_btn_2");
        this.tab_btn_2_normal_nd    = this.tab_btn_2_nd.getChildByName("normal_img");
        this.tab_btn_2_select_nd    = this.tab_btn_2_nd.getChildByName("select_img");
        this.tab_btn_2_label_nd     = this.tab_btn_2_nd.getChildByName("label");
        this.tab_btn_2_label_nd.getComponent(cc.Label).string = Utils.TI18N("图鉴");
        this.tab_btn_2_red_point_nd = this.tab_btn_2_nd.getChildByName("red_point");

        // camps
        this.camp_node_nd           = this.seekChild("camp_node");
        this.camp_layout_nd         = this.seekChild("camp_layout");
        this.img_select_nd          = this.seekChild("img_select");

        this.no_vedio_image_nd      = this.seekChild("no_vedio_image");
        this.close_btn_nd       = this.seekChild("close_btn");

        for (var camp_i = 0; camp_i < 6; camp_i++) {
            this.camp_btns[camp_i]  = this.camp_layout_nd.getChildByName("camp_btn" + camp_i);
            this.camp_btns[camp_i].camp_tag = camp_i;
            this.camp_btns[camp_i].on(cc.Node.EventType.TOUCH_END, this.didClickCampBtn, this);
        }

        this.volume_lb              = this.seekChild("volume", cc.Label);
        this.add_btn_nd             = this.seekChild("add_btn");
        this.embattle_btn_nd        = this.seekChild("embattle_btn");
        this.embattle_redPoint      = this.embattle_btn_nd.getChildByName("red_point");
        this.listview_container_nd  = this.seekChild("lay_scrollview");

        this.tab_btn_1_red_point_nd.active = false;
        this.tab_btn_2_red_point_nd.active = false;

        this.add_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAddBtn, this);
        this.tab_btn_1_nd.on(cc.Node.EventType.TOUCH_END, this.didClickTabBtn, this);
        this.tab_btn_2_nd.on(cc.Node.EventType.TOUCH_END, this.didClickTabBtn, this);
        this.embattle_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickEmbattleBtn, this)

        this.initListView();
        this.time_ticket = gcore.Timer.set((function () {
            gcore.Timer.del(this.time_ticket)
            this.updageTapIndex();
        }).bind(this), 100, 1)

        this.background.scale = FIT_SCALE;

        Utils.getNodeCompByPath("main_container/container/no_vedio_image/no_vedio_label", this.root_wnd, cc.Label).string = Utils.TI18N("一个英雄都没有哦，快去召唤吧");

    },



    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, function(event){
          Utils.playButtonSound(ButtonSound.Close);
          this.ctrl.openHeroBagWindow(false);
        }.bind(this));
        this.addGlobalEvent(HeroEvent.Buy_Hero_Max_Count_Event, function() {
            this.updateBagVal();
        }.bind(this));

        this.addGlobalEvent(HeroEvent.All_Hero_RedPoint_Event, function(status_data) {
            this.updateHeroBagRedpoint(status_data);
        }.bind(this));

        this.addGlobalEvent(HeroEvent.Del_Hero_Event, function() {
            this.updageTapIndex();
            this.updateBagVal()
        }.bind(this));

        this.addGlobalEvent(HeroEvent.Hero_Data_Add, function() {
            this.updageTapIndex();
            this.updateBagVal()
        }.bind(this));

        this.addGlobalEvent(HeroEvent.Filter_Hero_Update,()=>{
            this.updateEmbattleRedPoint();
        })
    },

    updateEmbattleRedPoint(){
      this.embattle_redPoint.active =require("hero_controller").getInstance().getModel().getEmbattleRedPoint();
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.updateBagVal();
        HeroCalculate.getInstance().checkAllHeroRedPoint()
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openHeroBagWindow(false);
    },

    // 点击阵容标签
    didClickCampBtn: function(event) {
        var cur_camp = event.target.camp_tag;
        if (cur_camp === this.cur_camp) return;
        this.img_select_nd.parent = this.camp_btns[cur_camp];
        this.cur_camp = cur_camp;
        this.updageTapIndex();
    },

    didClickTabBtn: function(event) {
        Utils.playButtonSound(ButtonSound.Tab);
        var cur_index = 1;
        if (event.target.name == "tab_btn_2")
            cur_index = 2
        if (cur_index === this.cur_index) return;

        this["tab_btn_" + cur_index + "_normal_nd"].active = false;
        this["tab_btn_" + cur_index + "_select_nd"].active = true;
        // var cur_color = this["tab_btn_" + cur_index + "_label_nd"].color;
        // cur_color.fromHEX("#6c402c");
        // this["tab_btn_" + cur_index + "_label_nd"].color = cur_color;

        this["tab_btn_" + this.cur_index + "_normal_nd"].active = true;
        this["tab_btn_" + this.cur_index + "_select_nd"].active = false;
        // var cur_color_l = this["tab_btn_" + this.cur_index + "_label_nd"].color;
        // cur_color_l.fromHEX("#dda880");
        // this["tab_btn_" + this.cur_index + "_label_nd"].color = cur_color_l;

        if (cur_index === 2) {
            if (this.cur_index === 1) {
                this.cur_camp = 1;
                this.img_select_nd.parent = this.camp_btns[1];
            }
            this.camp_btns[0].active = false;
        } else {
            if (this.cur_index === 2) {
                this.cur_camp = 0;
                this.img_select_nd.parent = this.camp_btns[0];
            }
            this.camp_btns[0].active = true;
        }

        this.cur_index = cur_index;
        this.updageTapIndex();
    },

    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.listview_container_nd.width, this.listview_container_nd.height)
        var setting = {
            item_class: "hero_exhibition_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 150,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            col: 4,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.listview_container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))


        if (GuideController.getInstance().isInGuide())
            this.item_scrollview.setClickEnabled(false);
    },

    updageTapIndex: function() {
        this.cur_role_list = [];
        var from_type = HeroConst.ExhibitionItemType.eNone;
        if (this.cur_index == HeroConst.BagTab.eBagHero) {
            from_type = HeroConst.ExhibitionItemType.eHeroBag;
            this.cur_role_list = this.model.getHeroListByCamp(this.cur_camp);
        } else if (this.cur_index == HeroConst.BagTab.eBagPokedex) {
            from_type = HeroConst.ExhibitionItemType.ePokedex;
            this.cur_role_list = this.model.getHeroPokedexList(this.cur_camp);
        }

        if (this.cur_role_list.length > 0) {
            this.no_vedio_image_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
        }
        // for(let info of this.cur_role_list){
        //   if(info){
        //     var b = info.isFormDrama();
        //     console.error(b)
        //   }
        // }
        this.updateEmbattleRedPoint();
        this.item_scrollview.setData(this.cur_role_list, this.setlectHeroExhibiton.bind(this), {can_click: true, from_type:from_type});

    },

    setlectHeroExhibiton: function(select_item) {
        var show_model_type = this.cur_index || HeroConst.BagTab.eBagHero
        this.ctrl.openHeroMainInfoWindow(true, select_item.data, this.cur_role_list, {show_model_type: show_model_type})
    },

    // 布阵
    didClickEmbattleBtn: function(event) {
        // this.ctrl.openFormMainWindow(true, null,  null, HeroConst.FormShowType.eFormSave);
        this.ctrl.openFormMainWindow(true);
    },

    onClickAddBtn: function() {
        var buy_num = this.model.getHeroBuyNum();
        var buy_cfg = Config.partner_data.data_partner_buy[buy_num + 1];
        if (buy_cfg) {
            var item_id = buy_cfg.expend[0][0] || 3;
            var count = buy_cfg.expend[0][1];
            // var item_cfg = 
            var str = Utils.TI18N(cc.js.formatStr("聖竜石%s<img src='%s'/> 個を消費して英雄の所持容量を%s個増やしますか？", count,3, buy_cfg.add_num));
            var CommonAlert = require("commonalert");
            var res =  PathTool.getItemRes(3);
            CommonAlert.show(str, Utils.TI18N("确定"), function() {
                this.ctrl.sender11009();
            }.bind(this), Utils.TI18N("取消"), null,2, null, {resArr:[res]});

        } else {
            message(Utils.TI18N("购买次数已达上限"));
        }
    },

    updateBagVal: function() {
        var hero_num_info = this.model.getHeroMaxCount();
        var val_str = hero_num_info.have_coutn + "/" + hero_num_info.max_count;
        this.volume_lb.string = val_str;
        // var hero_num;
    },

    updateHeroBagRedpoint: function(status_data) {
        if (!this.redpoint_status)
            this.redpoint_status = {};

        for (var data_i in status_data) {
            var data = status_data[data_i];
            this.redpoint_status[data.bid] = data.status;
        }

        var is_redpoint = false;
        for (var statu_i in this.redpoint_status) {
            if (this.redpoint_status[statu_i]) {
                is_redpoint = true;
                break;
            }
        }

        if (is_redpoint) {
            this.tab_btn_1_red_point_nd.active = true;
        } else {
            this.tab_btn_1_red_point_nd.active = false;
        }

        if (this.cur_index == HeroConst.BagTab.eBagHero) {
            // 更新一下英雄红点
            this.item_scrollview.resetCurrentItems();
        }
    },
})