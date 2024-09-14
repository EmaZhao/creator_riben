// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HERO_WIDTH = 120;
var HeroConst = require("hero_const");
var HeroCalculate = require("hero_calculate");
var HeroEvent      = require("hero_event");
var UpgradeStarPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_tab_upgrade_star_panel");
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();        
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.need_heros = {};          // 英雄合成材料
        this.hero_item_cache = [];     // 英雄item缓存
        this.selcet_hero_data = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.left_star_node         = this.seekChild("left_star_node");
        this.right_star_node        = this.seekChild("right_star_node");
        this.left_skill_item_nd     = this.seekChild("left_skill_item");
        this.right_skill_item_nd    = this.seekChild("right_skill_item");
        this.skill_arrow_nd         = this.seekChild("skill_arrow");
        this.skill_container_nd     = this.seekChild("skill_container");
        this.attr_container_nd      = this.seekChild("attr_container");
        this.star_arrow_nd          = this.seekChild("star_arrow");
        this.attr_ori_pos           = this.attr_container_nd.x;
        this.hero_item_container_nd = this.seekChild("hero_item_container");
        
        // 按钮显示
        this.up_btn_nd              = this.seekChild("up_btn");
        this.btn_title_nd           = this.seekChild("btn_title");
        this.btn_title_lb           = this.seekChild("btn_title", cc.Label);
        this.btn_item_nd            = this.seekChild("btn_item");
        this.item_icon_sp           = this.seekChild("item_icon", cc.Sprite);
        this.item_txt_lb            = this.seekChild("item_txt", cc.Label);
        this.fuse_btn_nd            = this.seekChild("fuse_btn");
        this.item_num_nd            = this.seekChild("item_num");
        this.item_num_icon_sp       = this.seekChild("item_num_icon", cc.Sprite);
        this.item_have_lb           = this.seekChild("item_have", cc.Label);
        this.btn_red_nd             = this.seekChild("btn_red");

        this.left_stars             = {};
        this.right_stars            = {};
        for (var star_i = 0; star_i < 5; star_i ++) {
            this.left_stars[star_i]  = this.left_star_node.getChildByName("star_item_" + star_i);
            this.right_stars[star_i] = this.right_star_node.getChildByName("star_item_" + star_i);            
        }

        this.common_9005_nd = this.seekChild("common_9005");

        // 技能
        var SkillItem = require("skill_item");
        this.max_skill_item   = new SkillItem();
        this.max_skill_item.setParent(this.skill_arrow_nd);
        this.max_skill_item.setScale(0.8);
        this.left_skill_item  = new SkillItem();
        this.left_skill_item.setParent(this.left_skill_item_nd);
        this.left_skill_item.setScale(0.8);
        this.left_skill_item.setShowTips(true);
        this.right_skill_item = new SkillItem();
        this.right_skill_item.setParent(this.right_skill_item_nd);
        this.right_skill_item.setScale(0.8);
        this.right_skill_item.setShowTips(true);

        this.attri_items = {};
        for (var attr_i = 0; attr_i < 3; attr_i++) {
            this.attri_items[attr_i] = {};
            this.attri_items[attr_i]["item_nd"]  = this.seekChild("param" + (attr_i + 1));
            this.attri_items[attr_i]["key_nd"]   = this.seekChild(this.attri_items[attr_i]["item_nd"], "key");
            this.attri_items[attr_i]["left_nd"]  = this.seekChild(this.attri_items[attr_i]["item_nd"], "left");
            this.attri_items[attr_i]["right_nd"] = this.seekChild(this.attri_items[attr_i]["item_nd"], "right");
            this.attri_items[attr_i]["arrow_nd"] = this.seekChild(this.attri_items[attr_i]["item_nd"], "arrow_icon");
        }

        this.up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickUpBtn, this);

        Utils.getNodeCompByPath("tab_panel/fuse_btn/RICHTEXT_CHILD", this.root_wnd, cc.Label).string = Utils.TI18N("前往融合神殿");
        Utils.getNodeCompByPath("tab_panel/label_tip", this.root_wnd, cc.Label).string = Utils.TI18N("(100%返还材料英雄升级、进阶消耗的金币、经验和进阶石)");
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(HeroEvent.Del_Hero_Event, function () {
            this.updateWidgets()
        }, this)
        this.fuse_btn_nd.on(cc.Node.EventType.TOUCH_END,function(){
            if(this.hero_vo){
                require("hero_controller").getInstance().openHeroUpgradeStarFuseWindow(true, this.hero_vo)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if (!params) return
        this.hero_vo = params;
        this.updateWidgets();
    },

    updateHerovo: function(hero_vo) {
        this.hero_vo = hero_vo;
        if (!this.root_wnd) return;
        this.updateWidgets();        
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        for (var select_index in this.selcet_hero_data) {
            var select_heros = this.selcet_hero_data[select_index];
            for (var hero_i in select_heros) {
                select_heros[hero_i].is_ui_select = false;
                select_heros[hero_i].is_ui_lock = false;
            }
        }
        if(this.max_skill_item){
            this.max_skill_item.deleteMe()
        }
        if(this.left_skill_item){
            this.left_skill_item.deleteMe()
        }
        if(this.right_skill_item){
            this.right_skill_item.deleteMe()
        }
        for(let i in this.need_hero_items){
            if(this.need_hero_items[i]){
                this.need_hero_items[i].getRootWnd(function(root_wnd){
                    root_wnd.nameLabel.node.destroy()
                    root_wnd.nameLabel = null;
                }.bind(this)) 
                this.need_hero_items[i].deleteMe()
                this.need_hero_items[i] = null;
            }
        }
    },


    updateWidgets: function() {
        if (!this.root_wnd) return;
        if (!this.hero_vo) return;
        var cur_star_key   = this.hero_vo.bid + "_" + this.hero_vo.star;
        var next_satr_key  = this.hero_vo.bid + "_" + (this.hero_vo.star + 1);
        this.cur_star_cfg  = gdata("partner_data", "data_partner_star", cur_star_key);
        this.next_star_cfg = gdata("partner_data", "data_partner_star", next_satr_key);

        if (this.next_star_cfg) {   // 满星

        } else {

        }

        this.updageStars();
        this.updagetAttrs()
        // 技能
        var skill_info_items = this.getDifferenceSkill();
        this.max_skill_item.setVisible(false);
        this.left_skill_item.setVisible(false);
        this.right_skill_item.setVisible(false);
        if (skill_info_items.length == 1) {
            this.max_skill_item.setVisible(true);
            this.max_skill_item.setData(skill_info_items[0]);            
        } else if (skill_info_items.length == 2) {
            this.left_skill_item.setVisible(true);
            this.right_skill_item.setVisible(true);
            this.left_skill_item.setData(skill_info_items[0]);            
            this.right_skill_item.setData(skill_info_items[1]);
        }
        if(this.hero_vo.star >= this.model.hero_info_upgrade_star_param && this.hero_vo.star < this.model.hero_info_upgrade_star_param3){
            if (skill_info_items.length == 0) {
                this.attr_container_nd.scale = 1;   
                this.skill_container_nd.active = false;
                this.attr_container_nd.x = this.star_arrow_nd.x;
            } else {
                this.skill_container_nd.active = true;
                this.attr_container_nd.anchorX = 0;     
                this.attr_container_nd.scale = 0.9;       
                this.attr_container_nd.x = this.attr_ori_pos;
            }
        }else{
            this.attr_container_nd.scale = 1;   
            this.skill_container_nd.active = false;
            this.attr_container_nd.x = this.star_arrow_nd.x;
        }
        


        // 升星英雄材料
        for (var select_index in this.selcet_hero_data) {
            var select_heros = this.selcet_hero_data[select_index];
            for (var hero_i in select_heros) {
                select_heros[hero_i].is_ui_select = false;
            }
        }

        this.selcet_hero_data = {};    // 选择的英雄列表
        this.hero_need_data = [];      // 英雄需求数据
        this.need_hero_items = {};

        for (var hero_i in this.need_heros) {
            this.need_heros[hero_i].setVisible(false);
            this.hero_item_cache.push(this.need_heros[hero_i]);
            delete this.need_heros[hero_i];
        }

        // 按钮显示
        this.fuse_btn_nd.active  = true;
        this.btn_item_nd.active  = false;
        this.item_num_nd.active     = false;
        this.btn_title_nd.active = true;    
        this.is_item_enough = true;            
        if (!this.next_star_cfg) {
            this.btn_title_nd.active = true;
            this.btn_item_nd.active = false;
            this.btn_title_lb.stirng =Utils.TI18N("已满级");
        } else {
            if (this.hero_vo.star >= this.model.hero_info_upgrade_star_param) {  // 六星以上逻辑
                if (this.next_star_cfg.other_expend) {
                    this.btn_item_nd.active  = true;
                    this.item_num_nd.active     = true;
                    this.btn_title_nd.active = false;

                    var BackpackController = require("backpack_controller");
                    var item_data = gdata("item_data", "data_unit1", this.next_star_cfg.other_expend[0][0]);
                    var have_count = BackpackController.getInstance().getModel().getBackPackItemNumByBid(item_data.id);
                    if (have_count >= this.next_star_cfg.other_expend[0][1]) {
                        this.is_item_enough = true;
                    } else {
                        this.is_item_enough = false;
                    }
                    var count_str = Utils.getMoneyString(have_count);
                    var num_str = count_str + "/" + this.next_star_cfg.other_expend[0][1];
                    this.item_have_lb.string = num_str;

                    var btnm_title_str = this.next_star_cfg.other_expend[0][1] + Utils.TI18N("升星");
                    var item_res_path = PathTool.getIconPath("item", item_data.icon);
                    this.item_txt_lb.string = btnm_title_str;
                    this.loadRes(item_res_path, function(item_sf) {
                        this.item_icon_sp.spriteFrame = item_sf;
                        this.item_num_icon_sp.spriteFrame = item_sf;
                    }.bind(this)); 
                } else {
                    this.btn_title_lb.string = Utils.TI18N("升星");
                }
                this.fuse_btn_nd.active = false;
                this.common_9005_nd.active = true;
            } else {                                                             // 4、5星逻辑
                this.btn_title_lb.string = Utils.TI18N("升星");
                this.fuse_btn_nd.active  = true;
                this.common_9005_nd.active = false;
            }
        }

        // 按钮红点
        var is_redpoint = HeroCalculate.getInstance().checkSingleHeroUpgradeStarRedPoint(this.hero_vo);
        this.btn_red_nd.active = !!is_redpoint;

        this.updateNeedHerosInfo();
        this.updateCenterRedpoint();
    },

    // 更新升星材料
    updateNeedHerosInfo: function() {
        if (!this.next_star_cfg) return;
        // 随机的{1,4,2} : 1 表示阵营  4: 表示星级 2表示数量
        // 指定的 {10402,4,1} : 10402: 表示bid, 4: 表示星级 1:表示数量
        // 指定的
        var item_data_index = 0;
        var need_index = 0;
        this.hero_need_data = [];
        this.need_index_type = {};
        for (var hero_i = 0; hero_i < this.next_star_cfg.expend2.length; hero_i++) { 
            if (!this.selcet_hero_data[need_index]) {
                this.selcet_hero_data[need_index]  = [];
            }
            this.need_index_type[need_index] = 1;
            var expendinfo = this.next_star_cfg.expend2[hero_i];
            this.hero_need_data.push(this.getHeroData(expendinfo[0], null, expendinfo[1], expendinfo[2], this.selcet_hero_data[need_index].length, need_index));
            need_index ++;
        }
        // 随机的
        for (var hero_i = 0; hero_i < this.next_star_cfg.expend3.length; hero_i++) {
            if (!this.selcet_hero_data[need_index]) {
                this.selcet_hero_data[need_index] = [];
            }
            this.need_index_type[need_index] = 2;
            var expendinfo = this.next_star_cfg.expend3[hero_i];
            this.hero_need_data.push(this.getHeroData(null, expendinfo[0], expendinfo[1], expendinfo[2], this.selcet_hero_data[need_index].length, need_index));
            need_index ++;            
        }

        for (let hero_i = 0; hero_i < this.hero_need_data.length; hero_i++) {
            var item_x = (HERO_WIDTH * 0.8 + 10) * hero_i;
            var hero_item = null;
            if (!this.need_hero_items[hero_i]) {
                if (this.hero_item_cache.length > 0) {
                    hero_item = this.hero_item_cache.shift();
                    hero_item.setVisible(true);
                } else {
                    hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
                    hero_item.setParent(this.hero_item_container_nd);
                    hero_item.setScale(0.8);
                    hero_item.setExtendData({from_type: HeroConst.ExhibitionItemType.eUpStar, scale: 0.8});
                }
                this.need_hero_items[hero_i] = hero_item;
                hero_item.setPosition(item_x, 0);
                var default_head_id = this.model.getRandomHeroHeadByQuality(this.hero_need_data[hero_i].star);
                var default_head_path = PathTool.getIconPath("item", default_head_id);
                hero_item.setDefaultHead(default_head_path);
                hero_item.addCallBack(this.onClickHeroItem.bind(this));
                this.need_heros[hero_i] = hero_item;
                hero_item.need_index = hero_i;
            } else {
                hero_item = this.need_hero_items[hero_i];
            }

            hero_item.setData(this.hero_need_data[hero_i]);
            hero_item.show();
            hero_item.getRootWnd(function(root_wnd){
                let data = this.hero_need_data[hero_i]
                let text
                if(data.bid){
                    text = Config.partner_data.data_partner_base[data.bid].name
                }else{
                    text = `★${data.star}英雄`
                }
                if(root_wnd.nameLabel == null){
                    let label = new cc.Node().addComponent(cc.Label)
                    label.node.y = -(root_wnd.height/2) - 25;
                    label.node.color = new cc.Color(100,50,35)
                    label.fontSize = 22;
                    label.lineHeight = 23
                    label.horizontalAlign = cc.macro.TextAlignment.CENTER;
                    label.verticalAlign = cc.macro.TextAlignment.CENTER;
                    root_wnd.nameLabel = label;
                    root_wnd.addChild(label.node)
                }
                root_wnd.nameLabel.string = text;
            }.bind(this))
        }
    },

    onClickHeroItem: function(hero_item) {
        this.ctrl.openHeroUpgradeStarSelectPanel(true, hero_item.data, this.selcet_hero_data, 2, null, this.updateNeedHero.bind(this, hero_item.need_index), this.hero_vo);
    },

    getHeroData: function(bid, camp_type, star, count, select_count, need_index) {
        var data = {};
        data.star = star;
        data.count = count || 0;
        data.lev = cc.js.formatStr("%s/%s", select_count || 0, count);
        data.need_index = need_index;
        data.select_count = select_count;
        if (select_count > 0) {
            data.head_gray = false;
        } else {

            data.head_gray = true;
        }

        if (!bid) {
            data.bid = 0;
            data.camp_type = camp_type;
        } else {
            var base_cofig = Config.partner_data.data_partner_base[bid];
            if (base_cofig) {
                data.bid = bid;
                data.camp_type = base_cofig.camp_type;
            } else {
                return null
            }
        }

        return data;
    },

    // 更新属性显示
    updagetAttrs: function() {
        if (!this.next_star_cfg) return;
        // cc.log(this.next_star_cfg);
        // cc.log(this.next_star_cfg.attr_show);
        var attri_info = this.next_star_cfg.attr_show;

        for (var arrt_i = 0; arrt_i < 3; arrt_i++) {
            var attr_item = this.attri_items[arrt_i];
            if (attri_info[arrt_i]) {
                attr_item["item_nd"].active = true;
                if (attri_info[arrt_i][0]) {
                    attr_item["key_nd"].active = true;
                    attr_item["key_nd"].getComponent(cc.Label).string = attri_info[arrt_i][0];
                }

                if (attri_info[arrt_i][1]) {
                    attr_item["left_nd"].active = true;
                    attr_item["left_nd"].getComponent(cc.Label).string = attri_info[arrt_i][1];
                } else {
                    attr_item["left_nd"].active = false;
                    attr_item["arrow_nd"].active = false;
                }

                if (attri_info[arrt_i][2]) {
                    attr_item["right_nd"].active = true;
                    attr_item["right_nd"].getComponent(cc.Label).string = attri_info[arrt_i][2];
                } else {
                    attr_item["right_nd"].active = false;
                }
            } else {
                attr_item["item_nd"].active = false;
            }
        }
    },

    // 更新星星显示
    updageStars: function() {
        var cur_star       = this.hero_vo.star;
        var next_star      = this.hero_vo.star + 1;
        var cur_star_info  = this.getStarInfo(cur_star);
        var next_star_info = this.getStarInfo(next_star);

        for (var star_i = 0; star_i < 5; star_i++) {
            if (star_i < cur_star_info.star_num) {
                this.left_stars[star_i].active = true;
                this.left_stars[star_i].scale = cur_star_info.star_scale;
                var star_sp = this.left_stars[star_i].getComponent(cc.Sprite);
                var star_path = PathTool.getUIIconPath("common", cur_star_info.star_res);
                this.loadRes(star_path, function(star_sp, star_sf) {
                    star_sp.spriteFrame = star_sf;
                }.bind(this, star_sp));
                if(cur_star_info.star_label){
                    let starNum = this.left_stars[star_i].starNum
                    if(starNum == null){
                        let node = new cc.Node() 
                        node.y = -1
                        let lab = node.addComponent(cc.Label)
                        lab.fontSize = 15;
                        lab.lineHeight = 16;
                        lab.horizontalAlign = cc.macro.TextAlignment.CENTER;
                        lab.verticalAlign = cc.macro.TextAlignment.CENTER;
                        node.addComponent(cc.LabelOutline).color = new cc.color(0,0,0);
                        this.left_stars[star_i].addChild(node)
                        this.left_stars[star_i].starNum = lab;
                        starNum = this.left_stars[star_i].starNum;
                    } 
                    starNum.string = cur_star_info.star_label;
                }
            } else {
                this.left_stars[star_i].active = false;
            }

            if (star_i < next_star_info.star_num) {
                this.right_stars[star_i].active = true;
                this.right_stars[star_i].scale = next_star_info.star_scale;
                var star_sp = this.right_stars[star_i].getComponent(cc.Sprite);
                var star_path = PathTool.getUIIconPath("common", next_star_info.star_res);
                this.loadRes(star_path, function(star_sp, star_sf) {
                    star_sp.spriteFrame = star_sf;
                }.bind(this, star_sp));
                if(next_star_info.star_label){
                    let starNum = this.right_stars[star_i].starNum
                    if(starNum == null){
                        let node = new cc.Node() 
                        node.y = -1
                        let lab = node.addComponent(cc.Label)
                        lab.fontSize = 15;
                        lab.horizontalAlign = cc.macro.TextAlignment.CENTER;
                        lab.verticalAlign = cc.macro.TextAlignment.CENTER;
                        node.addComponent(cc.LabelOutline).color = new cc.color(0,0,0);
                        this.right_stars[star_i].addChild(node)
                        this.right_stars[star_i].starNum = lab;
                        starNum = this.right_stars[star_i].starNum;
                    }
                    starNum.string = next_star_info.star_label;
                }
            } else {
                this.right_stars[star_i].active = false;
            }
        }
    },

    getStarInfo: function(star_num) {
        var star_info = {};
        var star_res  = "";
        var star_scal = 1;
        if (star_num > 0 && star_num <= 5) {
            star_res = "common_90074";
        } else if (star_num > 5 && star_num <= 9) {
            star_num = star_num - 5;
            star_res = "common_90075";
        } else if (star_num > 9) {
            star_res  = "common_90073";
            star_scal = 1.2;
            if(star_num - 10){
                star_info["star_label"] = star_num - 10;
            }
            star_num  = 1//star_num - 9;
        }

        star_info["star_num"]   = star_num;
        star_info["star_scale"] = star_scal;
        star_info["star_res"]   = star_res;

        return star_info;
    },

    // 获取第一组不同的技能，满星返回一个
    getDifferenceSkill: function() {
        var skill_info = [];
        if (!this.next_star_cfg) {
            if (this.cur_star_cfg && this.cur_star_cfg.skills.length > 0) {
                skill_info.push(this.cur_star_cfg.skills[0][1]);
                return skill_info
            }
        }

        if (this.cur_star_cfg && this.next_star_cfg) {
            for (var skill_i in this.cur_star_cfg.skills) {
                if (this.cur_star_cfg.skills[skill_i][1] !== this.next_star_cfg.skills[skill_i][1]) {
                    skill_info.push(this.cur_star_cfg.skills[skill_i][1]);
                    skill_info.push(this.next_star_cfg.skills[skill_i][1]);
                    return skill_info                   
                }
            }
        }

        return skill_info
    },

    updateNeedHero: function(need_index, select_info) {
        this.selcet_hero_data = select_info;
        this.updateNeedHerosInfo();
        this.updateCenterRedpoint();
    },

    onClickUpBtn: function() {
        var is_hero_enough = this.isHeroEnough();

        if (is_hero_enough && this.is_item_enough) {
            var request_date = this.getNeedHeroInfo();

            this.ctrl.sender11005(this.hero_vo.partner_id, request_date.hero_list, request_date.random_list);
        } else {
            message(Utils.TI18N("所需材料不足"));
        }
        this.model.setUpgradeStarUpdateRecord(false);
    },

    isHeroEnough: function() {
        for (var need_i in this.hero_need_data) {
            if (this.hero_need_data[need_i].select_count < this.hero_need_data[need_i].count)
                return false
        }

        return true;
    },

    getNeedHeroInfo: function() {
        var hero_list = [];
        var random_list = [];
        for (var type_i in this.need_index_type) {
            var select_hero_list = this.selcet_hero_data[type_i];
            for (var hero_i in select_hero_list) {
                var hero_data = {};
                hero_data.partner_id = select_hero_list[hero_i].partner_id;
                if (this.need_index_type[type_i] === 1) {
                    hero_list.push(hero_data);
                } else {
                    random_list.push(hero_data);
                }
            }
        }
        return {hero_list: hero_list, random_list: random_list};
    },

    updateCenterRedpoint: function() {
        var  can_compose = true;
        for (var item_i=0;item_i <  this.hero_need_data.length;++item_i) {
            var is_red = false;
            var item_info = this.hero_need_data[item_i];
            if (item_info.count != item_info.select_count) {
                can_compose = false;
                is_red = this.haveCanSelect(this.hero_need_data[item_i])
            }
            this.need_hero_items[item_i].showRedPoint(is_red);
        }
        
        if (can_compose && this.is_item_enough) {
            this.btn_red_nd.active = true;
        } else {
            this.btn_red_nd.active = false;
        }

    },
 
    haveCanSelect: function(select_hero) {
        var all_hero_list = Utils.deepCopy(this.model.getAllHeroArray());
        this.hero_list = [];
        if (select_hero.bid === 0) {               // 不是指定英雄
            for (var hero_i=0;hero_i<all_hero_list.length;++hero_i) {
                if (all_hero_list[hero_i].camp_type === select_hero.camp_type || select_hero.camp_type === 0) {
                    if (all_hero_list[hero_i].star === select_hero.star && (this.hero_vo && all_hero_list[hero_i].partner_id !== this.hero_vo.partner_id)) {
                        if (!this.isOtherSelect(all_hero_list[hero_i]))
                            this.hero_list.push(all_hero_list[hero_i]);
                    }
                }
            }
        } else {                    // 指定英雄
            for (var hero_i=0;hero_i<all_hero_list.length;++hero_i) {
                if (all_hero_list[hero_i].bid === select_hero.bid && (this.hero_vo && all_hero_list[hero_i].partner_id !== this.hero_vo.partner_id)) {
                    if (all_hero_list[hero_i].star === select_hero.star) {
                        if (!this.isOtherSelect(all_hero_list[hero_i]))                        
                            this.hero_list.push(all_hero_list[hero_i]);
                    }
                }
            }
        }

        // 是否已经选择
        for (var hero_i=0;hero_i<this.hero_list.length;++hero_i) {
            for (var select_i in this.selcet_hero_data) {
                for (var select_hero_i=0;select_hero_i<this.selcet_hero_data[select_i].length;++select_hero_i) {
                    if (this.selcet_hero_data[select_i][select_hero_i].partner_id == this.hero_list[hero_i].partner_id) {
                        // this.hero_list.shift(hero_i, 1);
                        this.hero_list[hero_i].is_ui_select = true;
                        continue;
                    }
                }
            }
        }
        var num = 0;
        for (var hero_i=0;hero_i< this.hero_list.length;++hero_i) {
            if (!this.hero_list[hero_i].is_ui_select)
                num ++;
        }

        if (num >= select_hero.count)
            return true

        return false;

        // 是否已经上阵或者已经锁定
        // for (var hero_i in this.hero_list) {
        //     if (this.hero_list[hero_i].is_in_form || this.hero_list[hero_i].is_lock) {
        //         this.hero_list[hero_i].is_ui_lock = true;
        //     }
        // }

    },


    isOtherSelect: function(hero_vo) {
        for (var select_i in this.selcet_hero_data) {
            for (var hero_i=0;hero_i < this.selcet_hero_data[select_i].length;++hero_i) {
                var selcet_hero = this.selcet_hero_data[select_i][hero_i];
                if (hero_vo.partner_id === selcet_hero.partner_id) {
                    return true;
                }
            }
        }

        return false;
    },

})