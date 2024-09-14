// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-28 11:19:23
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PartnerConst = require("partner_const");
var HeroConst = require("hero_const");
var HeroEvent = require("hero_event");
var GuideController = require("guide_controller");
var GuideEvent = require("guide_event");
const gcore = require("../../../sys/game-core-js-min");

var FormGoGightPanel = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "form_go_fight_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.camp_btns = {};                           // camp节点
        this.nine_station_bg = [];                         // 战位节点

        this.pos_name_list = {};                       // 五个编队各自的站位类型
        this.hero_item_list = {};                      // 五个编队英雄Item
        this.five_hero_vo = {};                        // 五个编队英雄hero_vo
        this.hava_drag_item = false;                     // 当前正在拖拽的五个item之一

        this.cur_camp = 0;
        this.cur_role_list = null;
        
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    openCallBack:function() {
        this.close_btn_nd           = this.seekChild("close_btn"); 
        this.no_vedio_image_nd      = this.seekChild("no_vedio_image");
        this.mask_nd                = this.seekChild("mask");

        // camps
        this.camp_node_nd           = this.seekChild("camp_node");
        this.camp_layout_nd         = this.seekChild("lay_scrollview");
        this.img_select_nd          = this.seekChild("img_select");
        this.save_btn_nd            = this.seekChild("save_btn");
        this.key_up_btn_nd          = this.seekChild("key_up_btn");
        this.fight_btn_nd           = this.seekChild("fight_btn");

        this.form_icon_sp           = this.seekChild("form_icon", cc.Sprite);
        this.form_change_btn_nd     = this.seekChild("form_change_btn");
        this.move_item_nd           = this.seekChild("move_item");
        this.main_container_nd      = this.seekChild("main_container");

        // 光环
        this.halo_icon_sp           = this.seekChild("halo_icon", cc.Sprite);
        this.halo_txt_nd            = this.seekChild("halo_txt");
        this.halo_effect_sp         = this.seekChild("halo_effect", cc.Sprite);
        this.halo_effect_nd         = this.seekChild("halo_effect");
        this.halo_btn_nd = this.seekChild("halo_btn");
        this.halo_top_nd = this.halo_btn_nd.getChildByName("top_sp")
        this.halo_top_num = this.halo_top_nd.getChildByName("top_num_txt").getComponent(cc.Label);
        this.halo_bottom_nd = this.halo_btn_nd.getChildByName("bottom_sp")
        this.halo_bottom_num = this.halo_bottom_nd.getChildByName("bottom_num_txt").getComponent(cc.Label);
        this.halo_lb = this.halo_btn_nd.getChildByName("halo_txt").getComponent(cc.Label);
        
        // 神器
        this.hallow_btn_nd          = this.seekChild("hallow_btn");
        this.hallow_redPoint        = this.hallow_btn_nd.getChildByName("redPoint");
        this.hallow_txt_nd          = this.seekChild("hallow_txt");
        this.hallow_txt_lb          = this.seekChild("hallow_txt", cc.Label);

        this.hallows_item = ItemsPool.getInstance().getItem("backpack_item");
        this.hallows_item.initConfig(false,1,false,false);
        this.hallows_item.setParent(this.hallow_btn_nd);
        this.hallows_item.show();
        this.hallow_redPoint.zIndex = 10;

        this.background             = this.seekChild("background");
        this.background.scale       = FIT_SCALE;

        // 战力
        this.power_val_nd          = this.seekChild("power_val");
        this.power_val_cus         = this.power_val_nd.getComponent("CusRichText");
        this.power_val_cus.setNum(100);
        
        for (var camp_i = 0; camp_i < 6; camp_i++) {
            this.camp_btns[camp_i]  = this.camp_node_nd.getChildByName("camp_btn" + camp_i);
            this.camp_btns[camp_i].camp_tag = camp_i;
            var camp_sp = this.camp_btns[camp_i].getComponent(cc.Sprite);
            var common_res_path = PathTool.getCommonIcomPath("common_" + (90066 + camp_i));
            this.loadRes(common_res_path, function(camp_sp, sf_obj){
                camp_sp.spriteFrame = sf_obj;
            }.bind(this, camp_sp))

            this.camp_btns[camp_i].on(cc.Node.EventType.TOUCH_END, this.didClickCamp, this);
        }

        // team
        this.fight_hero_node_nd     = this.seekChild("fight_hero_node");
        for (var hero_i = 1; hero_i <= 9; hero_i++) {
            this.nine_station_bg[hero_i]  = this.fight_hero_node_nd.getChildByName("hero_info_21_" + hero_i);
            this.nine_station_bg[hero_i].camp_tag = hero_i;
            // this.nine_station_bg[hero_i].on(cc.Node.EventType.TOUCH_END, this.didClickCampBtn, this);
        }

        // hero_items
        for (var hero_i = 1; hero_i <= 5; hero_i++) {
            this.hero_item_list[hero_i] = ItemsPool.getInstance().getItem("hero_exhibition_item");;
            this.hero_item_list[hero_i].setParent(this.fight_hero_node_nd);
            this.hero_item_list[hero_i].is_allow_select = false;
            this.hero_item_list[hero_i].show();
            this.hero_item_list[hero_i].addTouchCb(this.onClickHeroItem.bind(this));
            this.hero_item_list[hero_i].hero_index = hero_i;
            this.hero_item_list[hero_i].setExtendData({from_type: HeroConst.ExhibitionItemType.eFormFight});
        }

        // move_item
        this.move_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.move_item.setParent(this.move_item_nd);
        this.move_item.setData(null);
        this.move_item.show();
        this.move_item_nd.active = false;

        this.mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.save_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSaveBtn, this);
        this.key_up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickKeyUpBtn, this);
        this.form_change_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickChangeForm, this);

        this.fight_hero_node_nd.on(cc.Node.EventType.TOUCH_CANCEL, this.onClickFightHeroNode, this);
        this.fight_hero_node_nd.on(cc.Node.EventType.TOUCH_MOVE, this.onClickFightHeroNode, this);
        this.fight_hero_node_nd.on(cc.Node.EventType.TOUCH_END, this.onClickFightHeroNode, this);

        this.fight_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickFightBtn, this)

        this.hallows_item.addCallBack(function (){
            this.onClickHallowsBtn();
        }.bind(this));

        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("英雄出战");
        Utils.getNodeCompByPath("main_container/no_vedio_image/no_vedio_label", this.root_wnd, cc.Label).string = Utils.TI18N("暂无该类型英雄");
        Utils.getNodeCompByPath("main_container/tab_btn/tab_btn_1/label", this.root_wnd, cc.Label).string = Utils.TI18N("队伍");
        Utils.getNodeCompByPath("main_container/form_change_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("更换");
        Utils.getNodeCompByPath("main_container/halo_btn/halo_txt", this.root_wnd, cc.Label).string = Utils.TI18N("阵营");
        Utils.getNodeCompByPath("main_container/save_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("保存布阵");
        Utils.getNodeCompByPath("main_container/key_up_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("一键上阵");
        Utils.getNodeCompByPath("main_container/fight_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("开 战");
        Utils.getNodeCompByPath("main_container/fight_hero_node/pos_label_1", this.root_wnd, cc.Label).string = Utils.TI18N("前");
        Utils.getNodeCompByPath("main_container/fight_hero_node/pos_label_2", this.root_wnd, cc.Label).string = Utils.TI18N("中");
        Utils.getNodeCompByPath("main_container/fight_hero_node/pos_label_3", this.root_wnd, cc.Label).string = Utils.TI18N("后");
        Utils.getNodeCompByPath("main_container/fight_hero_node/pos_tips", this.root_wnd, cc.Label).string = Utils.TI18N("从列表选择英雄");

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        // if (!this.create_role_event) {
            this.create_role_event = this.addGlobalEvent(HeroEvent.Update_Save_Form, function (data) {
                if (this.form_show_type == HeroConst.FormShowType.eFormFight) {
                    this.gotoFight();
                } else {
                    message(Utils.TI18N("保存布阵成功"))
                    if(this.setting.key && this.setting.key == "battle"){
                      require("battle_controller").getInstance().send20060(3);
                    }
                    if (data && data.type != PartnerConst.Fun_Form.Drama && data.type != PartnerConst.Fun_Form.Arena) {
                        this.onClickCloseBtn()
                    }
                }
            }.bind(this));            
        // }

        this.addGlobalEvent(HeroEvent.Update_Fun_Form, function(from_data) {
            if (!from_data) return
            this.updateOtherFormation(from_data);
        }.bind(this))
        //  
        // gcore.GlobalEvent.fire(HeroEvent.Update_Fun_Form, data) 
        this.halo_btn_nd.on("touchend",function(){
            let BattleController = require("battle_controller")
            BattleController.getInstance().openBattleCampView(true,this.halo_form_id)
        },this)       
    },

    closeCallBack: function() {
        for (var item_i in this.hero_item_list) {
            this.hero_item_list[item_i].deleteMe();
            this.hero_item_list[item_i] = null;
        }

        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null
        }

        if (this.move_item){
            this.move_item.deleteMe();
            this.move_item = null;
        }

        if(this.hallows_item){
            this.hallows_item.deleteMe();
            this.hallows_item = null;
        }

        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);

        gcore.GlobalEvent.fire(HeroEvent.Filter_Hero_Update);
        this.ctrl.openFormGoFightPanel(false);
    },

    openRootWnd: function(params) {
        this.fun_form_type = params.fun_form_type || PartnerConst.Fun_Form.Drama;
        this.form_show_type = params.show_type || HeroConst.FormShowType.eFormFight;
        this.setting = params.setting || {};

        this.initListView();
        this.updateCamp();
        this.initFormatInfo();
        this.updateHallowRedPoint();
    },

    updateHallowRedPoint(){
      this.hallow_redPoint.active = require("hero_controller").getInstance().getModel().isHallowNew();
    },

    onClickCloseBtn: function() {
        if(this.hallows_item){
            this.hallows_item.deleteMe();
        }
        this.hallows_item = null;

        this.ctrl.openFormGoFightPanel(false);
    },

    didClickCamp: function(event) {
        var cur_camp = event.target.camp_tag;
        if (cur_camp === this.cur_camp) return;
        this.cur_camp = cur_camp;
        this.img_select_nd.parent = this.camp_btns[cur_camp];
        this.updateCamp();
    },

    updateCamp: function() {
        this.cur_role_list = this.model.getDeepHeroListByCamp(this.cur_camp);

        if(this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight){
            var HeroExpeditController = require("heroexpedit_controller");
            var employData = HeroExpeditController.getInstance().getModel().getExpeditEmployData();
            var partner_config = Config.partner_data.data_partner_base;
            // 增加雇佣的英雄进入出征
            for(var i in employData){
                var v = employData[i];
                var tab = {}
                tab.bid = v.bid
                tab.partner_id = v.id+100000;//因为援助id与自己英雄id会冲突，所以就行特殊处理
                tab.star = v.star
                tab.power = v.power
                tab.camp_type = partner_config[v.bid].camp_type
                tab.rid = v.rid
                tab.srv_id = v.srv_id
                tab.is_used = v.is_used
                tab.lev = v.lev
                tab.ext_data = v.ext_data;
                // 支援的人物使用过之后就放到最后
                if(v.is_used == 0){
                    this.cur_role_list.unshift(tab);
                }else{
                    this.cur_role_list.push(tab);
                }
            }
        }else if(this.fun_form_type == PartnerConst.Fun_Form.EndLess){
            var list = this.setting.has_hire_list || {};
            var partner_config = Config.partner_data.data_partner_base;
            for(var i in list){
                var v = list[i]
                var config  = partner_config[v.bid];
                if(this.cur_camp == 0 || (this.cur_camp == config.camp_type)){
                    var tab = {};
                    tab.bid = v.bid;
                    tab.partner_id = v.id+100000;//因为援助id与自己英雄id会冲突，所以就行特殊处理
                    tab.star = v.star;
                    tab.power = v.power;
                    tab.camp_type = config.camp_type;
                    tab.rid = v.rid;
                    tab.srv_id = v.srv_id;
                    tab.lev = v.lev;
                    tab.ext_data = v.ext_data;
                    tab.is_endless = true; //是否无尽试炼雇佣兵
                    this.cur_role_list.unshift(tab);
                }
            }
        }
        
        // from_type:from_type
        if (this.cur_role_list.length > 0) {
            this.no_vedio_image_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
        }

        var boold_type = null;
        var from_type = HeroConst.ExhibitionItemType.eFormFight;
        if(this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight){//远征
            from_type = HeroConst.ExhibitionItemType.eExpeditFight;
            boold_type = true;
        }else if(this.fun_form_type == PartnerConst.Fun_Form.EndLess){//无尽试炼
            from_type = HeroConst.ExhibitionItemType.eEndLessHero
        }

        this.item_scrollview.setData(this.cur_role_list, this.onClickHeroExhibiton.bind(this), {can_click: true, from_type: from_type,boold_type:boold_type});
        this.updateListSelectItem();
    },

    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.camp_layout_nd.width, this.camp_layout_nd.height)
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
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.camp_layout_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))


        if (GuideController.getInstance().isInGuide())
            this.item_scrollview.setClickEnabled(false);

    },

    onClickHeroExhibiton: function(click_item) {
        if (!click_item) return;
        if (this.is_play_item_action) return;
        this.selectHero(click_item);
    },

    // 更换阵型
    didClickFormChangeBtn: function() {

    },

    initFormatInfo: function() {
        // 视图类型
        if (this.form_show_type  == HeroConst.FormShowType.eFormSave) {
            this.key_up_btn_nd.active = true;
            this.save_btn_nd.active = true;
            this.fight_btn_nd.active = false;
        } else {
            this.key_up_btn_nd.active = false;
            this.save_btn_nd.active = false;
            this.fight_btn_nd.active = true;                            
        }

        if (this.fun_form_type == PartnerConst.Fun_Form.Drama) {
            this.upateDramaFormation();
            this.updateHallowsIcon();
        } else {
            if (this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight) {
                var HeroExpeditController = require("heroexpedit_controller");
                HeroExpeditController.getInstance().sender24409();
            }
            // 其他的都根据协议获取阵容
            this.ctrl.sender11211(this.fun_form_type)
        }
    },

    // 更新剧情布阵
    upateDramaFormation: function() {
        this.is_form_back = true;
        this.formation_type = this.model.use_formation_type;
        this.hallows_id = this.model.use_hallows_id;

        this.formation_config = Config.formation_data.data_form_data[this.formation_type];
        var pos_list =  this.model.getMyPosList();
        if (!this.formation_config) return;

        this.updateFormationStation(this.formation_config);
        this.updateFiveHeroItem(pos_list, this.formation_config);
    },

    updateOtherFormation: function(from_data) {
        this.formation_type = from_data.formation_type;
        this.hallows_id = from_data.hallows_id;

        this.formation_config = Config.formation_data.data_form_data[this.formation_type];
        this.updateFormationStation(this.formation_config);
        this.updateFiveHeroItem(from_data.pos_info, this.formation_config);
        this.updateHallowsIcon();
        this.updateCamp()
    },

    // 更新战位信息
    updateFormationStation: function(formation_config) {
        // 显示所有背景框
        for (var bg_i in this.nine_station_bg) {
            this.nine_station_bg[bg_i].active = true;
        }

        for (var pos_i in formation_config.pos) {
            var index = formation_config.pos[pos_i][0];
            var pos_i = formation_config.pos[pos_i][1];
            if (pos_i <= 3) {
                this.pos_name_list[index] = 1;      // 位置 前
            } else if (pos_i > 3 && pos_i <= 6) {
                this.pos_name_list[index] = 2;      // 位置 中
            } else {
                this.pos_name_list[index] = 3;      // 位置 后
            }

            // 更新位置
            this.hero_item_list[index].setRootPosition(this.nine_station_bg[pos_i].getPosition());
            // 隐藏背景框
            this.nine_station_bg[pos_i].active = false;
        }

        this.updateFormationIcon();
    },

    // 更新上阵英数据
    updateFiveHeroItem: function(pos_info, formation_config) {
        for (var pos_i in pos_info) {
            var hero_vo = this.model.getHeroById(pos_info[pos_i].id);
            this.five_hero_vo[pos_info[pos_i].pos] =  hero_vo;
        }

        // 更新英雄item数据
        for (var item_i in this.hero_item_list) {
            if (this.five_hero_vo[item_i]) {
                // this.five_hero_vo[item_i].is_ui_select = true;
                this.hero_item_list[item_i].setData(this.five_hero_vo[item_i]);
            }else{
                this.hero_item_list[item_i].setData(null);
            }
        }

        this.updateListSelectItem();
        this.updateFightPower();            // 更新战力
    },

    // 更新item_list信息
    updateListSelectItem: function() {
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var list_index = this.getCurListIndexByParId(this.five_hero_vo[hero_i].partner_id);
                if (list_index >= 0) {            
                    this.cur_role_list[list_index].is_ui_select = true;
                    this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);
                }
            }
        }
    },

    // 更新战力
    updateFightPower: function() {
        var power = 0;
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i])
                power = power + this.five_hero_vo[hero_i].power || 0;
        }
        this.power_val_cus.setNum(power);
        this.calculateCampHaloType();
    },

    // 更新阵法图标
    updateFormationIcon: function() {
        var form_icon_path = PathTool.getUIIconPath("form", "form_icon_" + this.formation_config.type);
        this.loadRes(form_icon_path, function(form_sf) {
            this.form_icon_sp.spriteFrame = form_sf;
        }.bind(this));
    },

    // 选择英雄
    selectHero: function(click_item) {
        if (this.running_move_act) return;
        var select_hero_vo = this.cur_role_list[click_item.tmp_index];

        if(this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight){
            var is_used = select_hero_vo.is_used || 0; //--expedit_model:getHireHeroIsUsed(select_hero_vo.partner_id, select_hero_vo.rid, select_hero_vo.srv_id)
            if(is_used == 1){
                message(Utils.TI18N("雇佣的英雄只能使用一次哦"));
                return;
            }
        }

        // 英雄死亡就不可能点击
        if(this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight){
            var HeroExpeditController = require("heroexpedit_controller");
            var blood = HeroExpeditController.getInstance().getModel().getHeroBloodById(select_hero_vo.partner_id, select_hero_vo.rid, select_hero_vo.srv_id);
            if(blood <= 0){
                return;
            }
        }

        // 是否已经选中
        var select_index = -1;
        for (var five_i in this.five_hero_vo) {
            if (this.five_hero_vo[five_i] && this.five_hero_vo[five_i].partner_id === select_hero_vo.partner_id) {
                select_index = five_i;
                break;
            }
        }

        if (select_index !== -1) {     // 已在选中队列则取消选中
            select_hero_vo.is_ui_select = false;
            // 播放下阵动画
            this.hero_item_list[select_index].setData(null);
            delete this.five_hero_vo[select_index];
            var end_pos = click_item.getWorldPos();
            var start_pos = this.hero_item_list[select_index].getWorldPos();
            this.playStationAction(select_hero_vo, start_pos, end_pos, function() {
                this.item_scrollview.updateItemData(click_item.tmp_index, select_hero_vo);
                this.updateFightPower();
            }.bind(this));
        } else {                       // 分配战队位置
            var have_num = 0;
            for (var hero_i in this.five_hero_vo) {
                if (this.five_hero_vo[hero_i]) {
                    if (select_hero_vo.bid == this.five_hero_vo[hero_i].bid) {
                        message(Utils.TI18N("不能同时上阵2个相同英雄"));
                        return;
                    }
                    have_num ++;                    
                }
            }

            if (have_num >= 5) {
                message(Utils.TI18N("上阵人数已满"));
                return                
            }

            // 同bid不能上阵
            var best_index = this.getTheBestPos(select_hero_vo);
            if (best_index < 0) {                  // 没有上阵位置
                message(Utils.TI18N("没有上阵位置"));
                return;
            }

            // 播放上阵动画
            var start_pos = click_item.getWorldPos();
            var end_pos = this.hero_item_list[best_index].getWorldPos();
            this.playStationAction(select_hero_vo, start_pos, end_pos, function() {
                this.five_hero_vo[best_index] = select_hero_vo;
                select_hero_vo.is_ui_select = true;
                this.hero_item_list[best_index].setData(select_hero_vo);
                this.item_scrollview.updateItemData(click_item.tmp_index, select_hero_vo);                 

                this.updateFightPower();
            }.bind(this));            
        }
    },

    // 播放上阵下阵动画
    playStationAction: function(hero_vo, start_pos, end_pos, finif_cb) {
        start_pos = this.main_container_nd.convertToNodeSpaceAR(start_pos);
        end_pos = this.main_container_nd.convertToNodeSpaceAR(end_pos);

        this.running_move_act = true;
        this.move_item.setData(hero_vo);
        this.move_item_nd.setPosition(start_pos);
        this.move_item_nd.active = true;

        var move_act = cc.moveTo(0.15, end_pos);
        var finish_cb = cc.callFunc(function() {
            this.move_item_nd.active = false;
            this.running_move_act = false;
            if (finif_cb)
                finif_cb();
        }, this);
        var node_act = cc.sequence(move_act, finish_cb);
        this.move_item_nd.runAction(node_act);
    },

    // 获取最佳上阵位置
    getTheBestPos: function(hero_vo) {
        if (hero_vo.pos_type == 3) {      // 从3到1
            for (var pos_i = 4; pos_i > 0; pos_i--) {
                if (!this.five_hero_vo[pos_i])
                    return pos_i;
            }
        } else if (hero_vo.pos_type == 2) {                          // 中间2 
            for (var pos_i in this.pos_name_list) {
                if (hero_vo.pos_type == this.pos_name_list[pos_i] && !this.five_hero_vo[pos_i])
                    return pos_i;
            }
        };

        for (var pos_i in this.pos_name_list) {
            if (!this.five_hero_vo[pos_i])
                return pos_i;
        }
                                         // 从1到3
        return -1
    },

    onClickSaveBtn: function() {
        this.onFightDrama();
    },

    onClickKeyUpBtn: function() {
        if (this.running_move_act) return;
        var hero_list = this.model.getDeepHeroListByCamp(HeroConst.CampType.eNone);
        if (hero_list.length == 0) {
            message(Utils.TI18N("没有英雄"))
            return
        }

        // 清空选中
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {            
                var list_index = this.getCurListIndexByParId(this.five_hero_vo[hero_i].partner_id);
                if (list_index >= 0) {            
                    this.cur_role_list[list_index].is_ui_select = false;
                    this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);
                }
                this.hero_item_list[hero_i].setData(null,true);
                delete this.five_hero_vo[hero_i];
            }
        }

        var up_num = 0;
        var heor_i = 0;
        while(up_num < 5) {
            var hero_vo = hero_list[heor_i];
            var hero_pos = this.allocateHeroPos(hero_vo);
            if (hero_pos >= 0) {
                up_num ++
            }
            heor_i ++;
            if (heor_i == hero_list.length)
                break;
        }
        this.updateFightPower();
    },

    allocateHeroPos: function(hero_vo) {
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                if (hero_vo.bid == this.five_hero_vo[hero_i].bid) {
                    return -1;
                }
            }
        }

        // 同bid不能上阵
        var best_index = this.getTheBestPos(hero_vo);
        if (best_index < 0) { // 没有上阵位置
            return -1;
        }

        this.five_hero_vo[best_index] = hero_vo;
        this.hero_item_list[best_index].setData(hero_vo);

        var list_index = this.getCurListIndexByParId(this.five_hero_vo[best_index].partner_id);
        if (list_index >= 0) {            
            this.cur_role_list[list_index].is_ui_select = true;
            this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);
        }

        return best_index
    },


    // 保存上阵信息
    saveForm: function() {
        var pos_info = [];
        var pos_n = 0;
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var pos_item = {};
                pos_item.pos = hero_i;
                pos_item.id = this.five_hero_vo[hero_i].partner_id;
                pos_info.push(pos_item);
                pos_n++;
            }
        }
        if (pos_n <= 0)
            message(Utils.TI18N("至少需要上阵一个英雄"));
        
        this.ctrl.sender11212(this.fun_form_type, this.formation_type, pos_info, this.hallows_id);
    },


    getCurListIndexByParId: function(partner_id) {
        for (var role_i in this.cur_role_list) {
            if (this.cur_role_list[role_i].partner_id === partner_id)
                return role_i;
        }
    },

    onClickChangeForm: function(event) {
        this.ctrl.openFormationSelectPanel(true,  this.formation_type, this.updageFormType.bind(this));
    },

    updageFormType: function(form_type) {
        this.formation_type = form_type;
        this.formation_config = Config.formation_data.data_form_data[this.formation_type];
        this.updateFormationStation(this.formation_config);
    },

    onClickFightHeroNode: function(event) {
        var touch_pos = this.fight_hero_node_nd.convertToNodeSpace(event.touch.getLocation());

        if (event.type == cc.Node.EventType.TOUCH_CANCEL) {       // 如果取消，则下阵
            var item_w = this.fight_hero_node_nd.width  / 3;
            var item_h = this.fight_hero_node_nd.height / 3;
            var line_num = Math.ceil(touch_pos.x / item_w);
            var list_num = Math.ceil(touch_pos.y / item_h);
            // var select_pos = (3 - line_num) * 3 + list_num;
            var select_pos = null;
            if ((1 <= line_num && 3 >= line_num) &&　(1 <= list_num && 3 >= list_num)) {
                select_pos = (3 - line_num) * 3 + list_num;
            }

            if (this.hava_drag_item.hero_index) {            
                this.selectStation(this.hava_drag_item.hero_index, select_pos, this.hava_drag_data);
                this.hava_drag_item = null;
            }
            this.move_item_nd.active = false;
        }

        if (event.type === cc.Node.EventType.TOUCH_MOVE) {
            if (this.hava_drag_item) {
                var touch_word_pos = this.fight_hero_node_nd.convertToWorldSpaceAR(touch_pos);
                var item_parent_pos = this.main_container_nd.convertToNodeSpaceAR(touch_word_pos);
                this.move_item_nd.active = true; 
                this.move_item_nd.setPosition(item_parent_pos);
                this.hava_drag_item.setData(null);
                this.move_item.setData(this.hava_drag_data);
            }
        }

        if (event.type === cc.Node.EventType.TOUCH_END) {           // 如果结束则判断位置
            if (this.hava_drag_item) {
                this.move_item_nd.active = false;
                this.selectStationHero(this.hava_drag_data);
                this.hava_drag_item = null;
                // this.selectHero();
            }
        }
    },

    onClickHeroItem: function(item) {
        if (item) {
            this.hava_drag_item = item;
            this.hava_drag_data = item.data;
        }
    }, 

    selectStation: function(cur_index, select_pos, hero_vo) {
        // 确定该位置在五个位置中的索引
        if (!select_pos) {
            this.five_hero_vo[cur_index] = null;
            this.hero_item_list[cur_index].setData(this.five_hero_vo[cur_index]);   
            var list_index = this.getCurListIndexByParId(hero_vo.partner_id);
            this.cur_role_list[list_index].is_ui_select = false;
            this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);
            return
        }

        var five_index = null;
        for (var pos_i in this.formation_config.pos) {
            if (this.formation_config.pos[pos_i][1] == select_pos) {
                five_index = this.formation_config.pos[pos_i][0];
                break;
            }
        }

        if (five_index !== null) {                           // 选定合法战位 
            if (this.five_hero_vo[five_index]) {             // 交换战位置
                this.five_hero_vo[cur_index] = this.five_hero_vo[five_index];
                this.five_hero_vo[five_index] = hero_vo;
                this.hero_item_list[cur_index].setData(this.five_hero_vo[cur_index]);
                this.hero_item_list[five_index].setData(this.five_hero_vo[five_index]);
            } else {                                         // 空战位
                this.five_hero_vo[cur_index] = null;
                this.five_hero_vo[five_index] = hero_vo;
                this.hero_item_list[cur_index].setData(this.five_hero_vo[cur_index]);
                this.hero_item_list[five_index].setData(this.five_hero_vo[five_index]);                
            }
        } else {
            this.five_hero_vo[cur_index] = hero_vo;
            this.hero_item_list[cur_index].setData(this.five_hero_vo[cur_index]);
        }
    },

    selectStationHero: function(hero_vo, star_pos, end_pos) {
        // 是否已经选中
        var select_index = -1;
        for (var five_i in this.five_hero_vo) {
            if (this.five_hero_vo[five_i] && this.five_hero_vo[five_i].partner_id === hero_vo.partner_id)
                select_index = five_i;
        }


        if (select_index !== -1) {     // 已在选中队列则取消选中
            // 播放下阵动画
            var list_index = this.getCurListIndexByParId(this.five_hero_vo[select_index].partner_id);
            var cur_list_item = this.item_scrollview.getItem(list_index);
            if (list_index >= 0) {
                this.cur_role_list[list_index].is_ui_select = false;
            }

            var start_pos = this.hero_item_list[select_index].getWorldPos();
            var end_pos = cur_list_item ? cur_list_item.getWorldPos() : this.camp_layout_nd.convertToWorldSpaceAR(cc.v2(0, 0));
            this.playStationAction(hero_vo, start_pos, end_pos, function() {
                this.item_scrollview.updateItemData(list_index, this.cur_role_list[list_index]);                
                this.updateFightPower();
            }.bind(this));

            this.hero_item_list[select_index].setData(null);
            delete this.five_hero_vo[select_index];
        }
    },

    // 计算光环类型
    calculateCampHaloType: function() {
        var dic_camp = {};
        for (var heor_i in this.five_hero_vo) {
            if (this.five_hero_vo[heor_i]) {
                if (!dic_camp[this.five_hero_vo[heor_i].camp_type]) {
                    dic_camp[this.five_hero_vo[heor_i].camp_type] = 1;
                } else {
                    dic_camp[this.five_hero_vo[heor_i].camp_type] ++;
                }
            }
        }

        var halo_cfg = Config.combat_halo_data.data_halo;
        // var form_id, halo_item_cfg = null;
        let form_id_list = []
        for (var halo_i in halo_cfg) {
            var halo_info = halo_cfg[halo_i];
            var is_match = true;
            for (var pos_i=0;pos_i<halo_info.pos_info.length;++pos_i) {
                var pos_item = halo_info.pos_info[pos_i];
                if (!dic_camp[pos_item[0]] || dic_camp[pos_item[0]] !== pos_item[1]) {
                    is_match = false;
                    // break;
                }
            }
            if (is_match) {
                form_id_list.push(halo_info.id)
                // form_id = halo_info.id;
                // halo_item_cfg = halo_info;
            }
        }
        let BattleController = require("battle_controller")
        let halo_icon_config = BattleController.getInstance().getModel().getCampIconConfigByIds(form_id_list)
        // cc.log(halo_icon_config)
        this.halo_form_id = form_id_list;
        var halo_icon_path = null;
        if (halo_icon_config) {              // 匹配到光环
            halo_icon_path = PathTool.getUIIconPath("campicon", "campicon_" + halo_icon_config.icon);
            this.halo_txt_nd.active = false;            
            this.updateHaloEffect(true);      
            this.halo_lb.string = ""    
            this.halo_top_nd.active = true;
            let v = halo_icon_config.nums 
            let top_num = v[0]
            let bottom_num = v[1]
            if(top_num != null && top_num > 0){
                this.halo_top_num.string  = top_num
                this.halo_top_nd.active = true;
            }else{
                this.halo_top_nd.active = false;
            }
            if(bottom_num != null && bottom_num > 0){
                this.halo_bottom_num.string  = bottom_num
                this.halo_bottom_nd.active = true;
            }else{
                this.halo_bottom_nd.active = false;
            }
        } else {                          // 没有匹配到光环
            halo_icon_path = PathTool.getUIIconPath("campicon", "campicon_" + "1000");
            this.halo_txt_nd.active = true;
            this.updateHaloEffect(false);
            this.halo_lb.string = "陣形"
            this.halo_top_nd.active = false;
            this.halo_bottom_nd.active = false;
        }
        if (halo_icon_path) {
            this.loadRes(halo_icon_path, function(icon_sf) {
                this.halo_icon_sp.spriteFrame = icon_sf;
            }.bind(this));
        }
    },

    updateHaloEffect: function(status, icon_sf) {
        if (status) {
            this.halo_effect_nd.scale = 0.8;
            this.halo_effect_nd.active = true;
            var effect_path = PathTool.getUIIconPath("common", "common_1101");
            this.loadRes(effect_path, function(effect_sp) {
                this.halo_effect_sp.spriteFrame = effect_sp;
            }.bind(this));
            var fadein_act = cc.fadeIn(0.6);
            var fadeout_act = cc.fadeOut(0.6);
            var halo_act = cc.sequence(fadein_act, fadeout_act);
            var halo_act2 = cc.repeatForever(halo_act);
            this.halo_effect_nd.runAction(halo_act2);
        } else {
            this.halo_effect_nd.active = false;
            this.halo_effect_nd.stopAllActions();
        }
    },

    onClickHallowsBtn: function() {
        this.ctrl.openFormHallowsSelectPanel(true, this.hallows_id, this.updateHallow.bind(this));
    },

    updateHallow: function(hallow_vo) {
        if (!!hallow_vo) {    // 装配
            this.hallows_id = hallow_vo.id;
        } else {              // 取消装配
            this.hallows_id = 0;
        }

        this.updateHallowRedPoint();
        this.updateHallowsIcon();
    },

    updateHallowsIcon: function() {
        
        if (this.hallows_id === 0) {
            this.hallow_txt_nd.active = true;
            this.hallow_txt_lb.string = Utils.TI18N("点击装配");

            this.hallows_item.setData();
            // this.hallows_item.setMagicIcon(false); //幻化---暂时屏蔽
            this.hallows_item.showAddIcon(true);
        } else {
            var hallow_cfg = Config.hallows_data.data_base[this.hallows_id];
            this.hallow_txt_lb.string = Utils.TI18N("点击更换");      
            
            this.hallows_item.showAddIcon(false);
            // var hallows_vo = HallowsController.getInstance().getModel().getHallowsById(this.hallows_id);  有幻化功能后开启---暂时屏蔽
            // if(hallows_vo && hallows_vo.look_id != 0){
            //     var magic_cfg = Config.HallowsData.data_magic[hallows_vo.look_id];
            //     if(magic_cfg){
            //         this.hallows_item.setData(magic_cfg.item_id)
            //         this.hallows_item.setMagicIcon(true)
            //     }else{
            //         this.hallows_item.setData(hallows_config.item_id)
            //         this.hallows_item.setMagicIcon(false)
            //     }
            // }else{
            //     this.hallows_item.setData(hallows_config.item_id)
            //     this.hallows_item.setMagicIcon(false)
            // }
            this.hallows_item.setData(hallow_cfg.item_id);
        }
    },

    onClickFightBtn: function(event) {
        if(window.TASK_TIPS)
        gcore.GlobalEvent.fire(GuideEvent.TaskNextStep,"fight_btn");//任务引导用到

        var pos_info = [];
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var pos_item = {};
                pos_item.pos = hero_i;
                pos_item.id = this.five_hero_vo[hero_i].partner_id;
                pos_info.push(pos_item);
            }
        }

        if (pos_info.length <= 0) {
            message(Utils.TI18N("至少需要上阵一个英雄"));
            return;
        }

        if (this.fun_form_type == PartnerConst.Fun_Form.Expedit_Fight) {
            // 远征
            this.onFightExpedit();
        } else if (this.fun_form_type == PartnerConst.Fun_Form.EndLess) {
            // 无尽试炼
            this.onFightEndLess();
        } else if (this.fun_form_type == PartnerConst.Fun_Form.GuildDun_AD) {
            //  联盟副本
            this.onFightGuildDun(pos_info);
        } else if(this.fun_form_type == PartnerConst.Fun_Form.LimitExercise){
            // 试炼之境
            this.onFightLimitExercise()
        }else {
            // 默认剧情通关
            this.onFightDrama(pos_info);
        }

    },

    gotoFight: function() {
        if( this.fun_form_type != PartnerConst.Fun_Form.LimitExercise){
            this.onClickCloseBtn();
        }
        if (this.fun_form_type === PartnerConst.Fun_Form.Drama) {
            var BattleDramaController = require("battle_drama_controller");
            BattleDramaController.getInstance().send13003(0);
        }else if(this.fun_form_type == PartnerConst.Fun_Form.Startower){
            // 试练塔 --星命塔
            this.onFightStarTower();
        }
        // this.ctrl.openFormGoFightPanel(false);
    },

    onFightExpedit: function() {
        var pos_info = [];
        for(var i in this.five_hero_vo){
            if(this.five_hero_vo[i]){
                var tab = {};
                tab.pos = i;
                tab.owner_id = this.five_hero_vo[i].rid;
                tab.owner_srv_id = this.five_hero_vo[i].srv_id;
                
                if(this.five_hero_vo[i].partner_id>100000){
                    tab.id = this.five_hero_vo[i].partner_id-100000;
                }else{
                    tab.id = this.five_hero_vo[i].partner_id;
                }
                pos_info.push(tab);
            }
        }
        var HeroExpeditController = require("heroexpedit_controller");
        HeroExpeditController.getInstance().sender24403(this.formation_type, pos_info, this.hallows_id)
        this.onClickCloseBtn()
    },

    onFightEndLess: function() {
        var pos_info = [];
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var pos_item = {};
                pos_item.pos = hero_i;
                if(this.five_hero_vo[hero_i].partner_id>100000){
                    pos_item.id = this.five_hero_vo[hero_i].partner_id-100000;
                }else{
                    pos_item.id = this.five_hero_vo[hero_i].partner_id;
                }
                
                pos_item.owner_id = this.five_hero_vo[hero_i].rid;
                pos_item.owner_srv_id = this.five_hero_vo[hero_i].srv_id;
                pos_info.push(pos_item);
            }
        }
        
        var EndlessTrailController = require("endless_trail_controller");
        EndlessTrailController.getInstance().send23901(this.formation_type, pos_info, this.hallows_id);
        this.onClickCloseBtn()
    },

    // 发送试练塔
    onFightStarTower:function(){
        var tower = this.setting.tower_lev || 0;
        var StartowerController = require("startower_controller");
        StartowerController.getInstance().sender11322(tower)
    },

    onFightGuildDun: function(pos_info) {
        var boss_id = this.setting.boss_id;
        require("guildboss_controller").getInstance().send21308(boss_id,this.formation_type,pos_info,this.hallows_id);
        this.onClickCloseBtn();
    },

    onFightDrama: function() {
        var pos_info = [];
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var pos_item = {};
                pos_item.pos = hero_i;
                pos_item.id = this.five_hero_vo[hero_i].partner_id;
                pos_info.push(pos_item);
            }
        }
        if (pos_info.length <= 0) {
            message(Utils.TI18N("至少需要上阵一个英雄"));
            return
        }

        this.ctrl.sender11212(this.fun_form_type, this.formation_type, pos_info, this.hallows_id);
    },
    //试炼之境的出战
    onFightLimitExercise(){
        // if(!this.five_hero_vo[this.select_team_index]) return;
        // if(!this.tab_list[this.select_team_index]) return;
        let pos_info = []
        for (var hero_i in this.five_hero_vo) {
            if (this.five_hero_vo[hero_i]) {
                var pos_item = {};
                pos_item.pos = hero_i;
                pos_item.id = this.five_hero_vo[hero_i].partner_id;
                pos_info.push(pos_item);
            }
        }
        if (pos_info.length <= 0) {
            message(Utils.TI18N("至少需要上阵一个英雄"));
            return
        }
        this.ctrl.sender11212(PartnerConst.Fun_Form.LimitExercise,this.formation_type ,pos_info, this.hallows_id)
    },


})