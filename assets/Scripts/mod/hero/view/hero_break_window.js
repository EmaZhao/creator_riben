// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-10 10:03:31
// --------------------------------------------------------------------
var PathTool           = require("pathtool");
var HeroEvent          = require("hero_event");
var BackpackController = require("backpack_controller");
var SkillItem          = require("skill_item");

var HeroBreakWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_break_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;                     //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.mask_bg_nd     = this.seekChild("mask_bg");
        this.attr_panel_nd  = this.seekChild("attr_panel");
        this.break_btn_nd   = this.seekChild("break_btn");
        this.empty_panel_nd = this.seekChild("empty_panel");
        
        // skill
        this.skill_panel_nd = this.seekChild("skill_panel");
        this.skill_name_lb  = this.seekChild("skill_name", cc.Label);
        this.skill_con_nd   = this.seekChild("skill_con");

        this.skill_item = new SkillItem();
        this.skill_item.setParent(this.skill_con_nd);
        this.skill_item.setScale(0.8);
        this.skill_item.setShowTips(true);

        this.mask_bg_nd.scale = FIT_SCALE;

        this.const_items = {};
        for (var item_i = 1; item_i <= 2; item_i++) {
            var const_item = this.const_items[item_i] = {};
            var const_panel = const_item["const_panel"] = this.seekChild("item_cost_panel" + item_i);
            const_item["iten_icon"]   = this.seekChild(const_panel, "item_icon", cc.Sprite);
            const_item["iten_num_nd"] = this.seekChild(const_panel, "label");                        
            const_item["iten_num"]    = this.seekChild(const_panel, "label", cc.Label);            
        }

        this.attr_items = {};
        for (var attr_i = 1; attr_i <= 5; attr_i++) {
            var attr_item = this.attr_items[attr_i] = {};
            attr_item["attr_icon"]        = this.seekChild(this.attr_panel_nd, "attr_icon" + attr_i, cc.Sprite);
            attr_item["attr_label_key"]   = this.seekChild(this.attr_panel_nd, "attr_label_key" + attr_i, cc.Label);
            attr_item["attr_label_left"]  = this.seekChild(this.attr_panel_nd, "attr_label_left" + attr_i, cc.Label);
            attr_item["attr_label_right"] = this.seekChild(this.attr_panel_nd, "attr_label_right" + attr_i, cc.Label);
        }

        this.break_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickBreakBtn, this);
        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMask, this);

        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("进阶");
        Utils.getNodeCompByPath("main_container/skill_panel/skill_title", this.root_wnd, cc.Label).string = Utils.TI18N("解锁技能");
        Utils.getNodeCompByPath("main_container/break_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("进 阶");
        Utils.getNodeCompByPath("main_container/empty_panel/skill_name", this.root_wnd, cc.Label).string = Utils.TI18N("什么都没有");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(HeroEvent.Next_Break_Info_Event, function(data) {
            if (data)
                this.updateWidgets(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if (!params) return;
        this.hero_vo = params;
        this.ctrl.sender11016(this.hero_vo.partner_id);
        // this.updateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openHeroBreakPanel(false);
    },

    onClickBreakBtn: function() {
        if (this.hero_vo) {
            if (this.need_items.length > 0) {
                var expend_item_cfg = gdata("item_data", "data_unit1", this.need_items[0], false);
                message(Utils.TI18N("物品") + expend_item_cfg.name + Utils.TI18N("不足"));
                BackpackController.getInstance().openTipsSource(true, this.need_items[0]);               
            } else {
                this.ctrl.sender11004(this.hero_vo.id);
                this.ctrl.openHeroBreakPanel(false);                
            }
        }
    },

    onClickMask: function() {
        this.ctrl.openHeroBreakPanel(false);
    },

    updateWidgets: function(next_data) {
        var cur_break_key  = this.hero_vo.type + "_" + this.hero_vo.break_id + "_" + this.hero_vo.break_lev;
        var next_break_key = this.hero_vo.type + "_" + this.hero_vo.break_id + "_" + (this.hero_vo.break_lev + 1);
        var cur_break_cfg  = Config.partner_data.data_partner_brach[cur_break_key];
        var next_break_cfg = Config.partner_data.data_partner_brach[next_break_key];
        if (!cur_break_cfg || !next_break_cfg) return;

        // 属性
        for (var attr_i = 1; attr_i <= 5; attr_i++) {
            var attr_item = this.attr_items[attr_i];
            if (attr_i == 1) {
                attr_item["attr_label_left"].string = cur_break_cfg.lev_max;
                attr_item["attr_label_right"].string = next_break_cfg.lev_max;
            } else {
                var attr = next_break_cfg.all_attr[attr_i-2];
                if (attr) {
                    // icon
                    var attr_str = attr[0];
                    var attr_res = PathTool.getAttrIconByStr(attr_str);
                    var attr_res_path = PathTool.getUIIconPath("common", attr_res);
                    this.loadRes(attr_res_path, function(icon_sp, icon_sf) {
                        icon_sp.spriteFrame = icon_sf;
                    }.bind(this, attr_item["attr_icon"]));
                    // name
                    var attr_name = Config.attr_data.data_key_to_name[attr_str];
                    attr_item["attr_label_key"].string = attr_name;
                    // attr
                    if (attr_str == "hp_max") attr_str = "hp";
                    var left_attr = this.hero_vo[attr_str];
                    var right_attr = next_data[attr_str] || 0;
                    attr_item["attr_label_left"].string = left_attr;
                    attr_item["attr_label_right"].string = right_attr;
                }
            }
        }

        // 消耗
        this.need_items = [];
        if (cur_break_cfg.expend == 0) {
            this.const_items["1"].const_panel.active = false;
            this.const_items["2"].const_panel.active = false;
        } else {
            for (var item_i = 1; item_i <= 2; item_i++) {
                var const_item = this.const_items[item_i];
                var const_info = cur_break_cfg.expend[item_i - 1];
                if (const_info) {
                    var item_cfg = Utils.getItemConfig(const_info[0]);
                    cc.log(item_cfg);
                    var item_icon_path = PathTool.getIconPath("item", item_cfg.icon);
                    this.loadRes(item_icon_path, function(item_sp, item_sf) {
                        item_sp.spriteFrame = item_sf;
                    }.bind(this, const_item["iten_icon"]));
                    var have_num = BackpackController.getInstance().getModel().getItemNumByBid(const_info[0]);
                    var num_str = cc.js.formatStr("%s/%s", Utils.getMoneyString(have_num), Utils.getMoneyString(const_info[1]));
                    const_item["iten_num"].string = num_str;
                    if (have_num < const_info[1]) {
                        var text_color = new cc.Color(0xff, 0x59, 0x43, 0xff);
                        const_item["iten_num_nd"].color = text_color;
                        this.need_items.push(const_info[0]);
                    }
                } else {
                    const_item.const_panel.active = false;
                }
            }
        }

        // 技能
        if (next_break_cfg.skill_num > cur_break_cfg.skill_num) {
            var star_key = this.hero_vo.bid + "_" + this.hero_vo.star;
            var star_cfg = gdata("partner_data", "data_partner_star", star_key);
            if (star_cfg) {
                var skill_id = null;
                for (var skill_i in star_cfg.skills) {
                    if (star_cfg.skills[skill_i][0] == next_break_cfg.skill_num)
                        skill_id = star_cfg.skills[skill_i][1];
                }

                if (skill_id) {
                    var skill_cfg = gdata('skill_data', 'data_get_skill', skill_id);
                    this.skill_panel_nd.active = true;
                    this.skill_name_lb.string = skill_cfg.name;
                    this.skill_item.setData(skill_id);
                } else {
                    this.showNoneSkillInfo();                    
                }
            } else {
                this.showNoneSkillInfo();                
            }
        } else {          // 什么都没有
            this.showNoneSkillInfo();
        }
    },

    showNoneSkillInfo: function() {
        this.skill_panel_nd.active = false;
        this.empty_panel_nd.active = true;
    },
})