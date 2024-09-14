// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-18 18:01:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroCalculate = require("hero_calculate");
var HeroConst = require("hero_const");
var SKILL_ITEM_WIDTH = 130 * 0.8;
var BackpackController = require("backpack_controller");
var RoleController = require("role_controller")
var RoleEvent = require("role_event")
var BackPackConst = require("backpack_const")
var BackpackEvent = require("backpack_event")
var HeroEvent = require("hero_event");
var HeroMianTrainPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_tab_train_panel");
        this.rleasePrefab = false;
        
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.attr_list = {"0":"atk", "1":"hp", "2":"def","3":"speed"};
        this.skill_items = {};
        this.skill_item_cache = [];
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.totalCount = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.advanced_node      = this.seekChild("advanced_node");
        this.upgrade_nd         = this.seekChild("upgrade");
        this.max_level_nd       = this.seekChild("max_level");
        this.lev_btn_title_lb   = this.seekChild("lev_btn_title", cc.Label);
        this.btn_red_nd         = this.seekChild("btn_red");
        
        this.item_icon1_sp      = this.seekChild("item_icon1", cc.Sprite);
        this.item_icon2_sp      = this.seekChild("item_icon2", cc.Sprite);        
        this.level_up_cost1_lb  = this.seekChild("level_up_cost1", cc.Label);
        this.level_up_cost2_lb  = this.seekChild("level_up_cost2", cc.Label);
        
        this.level_lb           = this.seekChild("level", cc.Label);
        this.profession_icon_sp = this.seekChild("profession_icon", cc.Sprite);
        this.profession_name_lb = this.seekChild("profession_name", cc.Label);
        this.look_btn_nd        = this.seekChild("look_btn");
        this.level_up_btn_nd    = this.seekChild("level_up_btn");
        this.skill_container_nd = this.seekChild("skill_container");

        // 升级消耗
        this.advanced_icons     = {}
        for (var advanced_icon_i = 1; advanced_icon_i <= 6; advanced_icon_i++) {
            this.advanced_icons[advanced_icon_i] = this.seekChild(this.advanced_node, "advanced_icon_" + advanced_icon_i);
            this.advanced_icons[advanced_icon_i].active = false;
        }

        // 当前属性
        this.attr_item = {};
        for (var attr_i = 0; attr_i < 4; attr_i++) {
            this.attr_item[attr_i] = {};
            this.attr_item[attr_i]["attr_icon_sp"] = this.seekChild("attr_icon" + (attr_i + 1), cc.Sprite);
            this.attr_item[attr_i]["attr_label_lb"] = this.seekChild("attr_label" + (attr_i + 1), cc.Label);            
        }
        this.level_up_btn_nd.on(cc.Node.EventType.TOUCH_START, this.upBtnStart, this);
        this.level_up_btn_nd.on(cc.Node.EventType.TOUCH_CANCEL, this.upBtnEnd,this ) 
        this.level_up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.upBtnEnd, this);

        // this.level_up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLevelUpBtn, this);

        this.look_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLookBtn, this);

        Utils.getNodeCompByPath("tab_panel/levelKey", this.root_wnd, cc.Label).string = Utils.TI18N("Lv：");
        Utils.getNodeCompByPath("tab_panel/levelupKey", this.root_wnd, cc.Label).string = Utils.TI18N("升级:");
        Utils.getNodeCompByPath("tab_panel/advancedKey", this.root_wnd, cc.Label).string = Utils.TI18N("进阶:");

        var advancedKey_nd = this.seekChild("advancedKey");
        var posX = advancedKey_nd.x + advancedKey_nd.getContentSize().width;
        this.advanced_node.x = posX;
        var levelKey_nd = this.seekChild("levelKey");
        this.seekChild("level").x = levelKey_nd.x + levelKey_nd.getContentSize().width;
        Utils.getNodeCompByPath("tab_panel/level_up_btn/lev_btn_title", this.root_wnd, cc.Label).string = Utils.TI18N("升 级");
        // this.initSkills();
    },
    upBtnStart(){
        this.startUpdate()
    },
    upBtnEnd(){
        this.stopUpdate();
        if(this.totalCount < this.updateInterval){
            //小于1秒时
            this.leveUp();
        }
        this.totalCount = 0;
        this.updateTimer = 0;
    },
    update(dt){
        if(this.level_up_btn_nd.active == false ||  (this.lev_status == 2)){
            this.totalCount = 0;
            this.updateTimer = 0;
            this.stopUpdate()
            if(this.lev_status == 2){
                this.leveUp()
            }
            return
        }
        this.updateTimer += dt
        this.totalCount += dt
        if(this.updateTimer >= this.updateInterval){
            this.updateTimer = 0;
            this.leveUp()
        }
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        // --物品道具增加 判断红点
		this.addGlobalEvent(BackpackEvent.ADD_GOODS,function(bag_code,temp_add){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
                for(let i in temp_add){
                    let item = temp_add[i]
                    if(item.base_id == this.model.upgrade_star_cost_id){
                        this.hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] = null 
                        this.updateLevelUpRedPoint()
                    }
                }
			}
		}.bind(this))
		// --物品道具删除 判断红点
		this.addGlobalEvent(BackpackEvent.DELETE_GOODS,function(bag_code,temp_del){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
                for(let i in temp_del){
                    let item = temp_del[i]
                    if(item.base_id == this.model.upgrade_star_cost_id){
                        this.hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] = null 
                        this.updateLevelUpRedPoint()
                    }
                }
			}
		}.bind(this))
		//物品道具改变 判断红点
		this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM,function(bag_code,temp_list){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
                for(let i in temp_list){
                    let item = temp_list[i]
                    if(item.base_id == this.model.upgrade_star_cost_id){
                        this.hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] = null 
                        this.updateLevelUpRedPoint()
                    }
                }
			}
		}.bind(this))

        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value){
            if(!this.hero_vo) return
            let status = HeroCalculate.getInstance().getHeroShowLevelStatus(this.hero_vo)
            if(status == 1){
                if(key == "coin" || key == "hero_exp"){
                    this.updateCostInfo();
                    this.updateLevelUpRedPoint()
                }
            }
            
        }.bind(this))

        this.addGlobalEvent(HeroEvent.Hero_Data_Update, function (hero_vo) {
            if (!this.hero_vo || !hero_vo) return
            if(hero_vo.partner_id == this.hero_vo.partner_id){
                this.updateHerovo(hero_vo)
                this.setUpdateRedPointInfo()
                // 判断是否解锁成人剧情
                console.log("成人剧情")
                this.ctrl.checkUnlockHeroPlot(hero_vo);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if (!params) return;
        this.hero_vo = params;
        this.updateWidgets();
    },

    updateHerovo: function(hero_vo) {
        this.hero_vo = hero_vo;
        if (!this.root_wnd) return;
        this.limit_lev_max = null;
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function() {
        for(let i in this.skill_items){
            this.skill_items[i].deleteMe()
            this.skill_items[i] = null
        }
        this.skill_items = null;
        this.stopUpdate()
        if (this.role_assets_event){
            this.role_vo.unbind(this.role_assets_event)
            this.role_assets_event = null
        }
    },

    updateWidgets: function() {
        var star_key = this.hero_vo.bid + "_" + this.hero_vo.star;
        this.star_cfg = gdata("partner_data", "data_partner_star", star_key);

        this.cur_break_cfg =  Config.partner_data.data_partner_brach[this.hero_vo.type + "_" + this.hero_vo.break_id + "_" + this.hero_vo.break_lev];
        var next_break_cfg = Config.partner_data.data_partner_brach[this.hero_vo.type + "_" + this.hero_vo.break_id + "_" + (this.hero_vo.break_lev + 1)];
        if (!this.cur_break_cfg) return;

        this.level_up_btn_nd.active = true;
        this.max_level_nd.active = false;
        this.upgrade_nd.active = true;
        this.btn_red_nd.active = false;
        this.lev_btn_title_lb.string = Utils.TI18N("升级");   

        var lev_max = this.cur_break_cfg.lev_max;
        this.limit_lev_max = lev_max;
        this.lev_status = 0;
        if (!next_break_cfg) {                // 升级
            if (this.star_cfg && lev_max < this.star_cfg.lev_max)
                lev_max = this.star_cfg.lev_max;
                this.limit_lev_max = lev_max
            if (this.hero_vo.lev >= lev_max) {
                this.max_level_nd.active = true;
                this.upgrade_nd.active = false;
                this.level_up_btn_nd.active = false;
                this.lev_status = 0;
            } else {
                this.max_level_nd.active = false;
                this.upgrade_nd.active = true;
                this.lev_status = 1;
                this.updateCostInfo()
            }
        } else {                              // 进阶
            if (next_break_cfg.limit) {       // 进阶有要求
                // if (this.hero_vo)
                if (this.hero_vo.lev >= this.cur_break_cfg.lev_max) {    // 等级满足
                    // 进阶有要求，需要升星
                    var is_enouth = HeroCalculate.getInstance().isEnoughCondition(next_break_cfg.limit, this.hero_vo);
                    if (is_enouth) {                                // 可以进阶了
                        this.level_up_btn_nd.active = true;
                        this.lev_btn_title_lb.string = Utils.TI18N("进阶"); 
                        this.lev_status = 2;      
                    } else {                                        // 显示满级状态
                        this.level_up_btn_nd.active = false;
                        this.lev_status = 0;
                    }
                    this.upgrade_nd.active = false;
                    this.max_level_nd.active = true;
                } else {                                            // 等级不满足升级
                    // this.lev_btn_title_lb.string = Utils.TI18N("升级");
                    this.lev_status = 1;
                    this.updateCostInfo()
                }
            } else {                          // 没有限制
                this.level_up_btn_nd.active = true;
                if (this.hero_vo.lev >= this.cur_break_cfg.lev_max) {
                    this.lev_btn_title_lb.string = Utils.TI18N("进阶");
                    this.lev_status = 2;     
                } else {
                    // this.lev_btn_title_lb.string = Utils.TI18N("升级"); 
                    this.lev_status = 1;
                    this.updateCostInfo() 
                }
            }
        }

        // 阶数
        for (var advance_i in this.advanced_icons)
            this.advanced_icons[advance_i].active = false;

        var max_break =  this.model.getHeroMaxBreakCountByInitStar(this.hero_vo.star);
        var cur_barek =  this.hero_vo.break_lev;

        for (var break_i = 1; break_i <= max_break; break_i++) {
            this.advanced_icons[break_i].active = true;
            var advanced_icon_res = PathTool.getUIIconPath("hero", "hero_info_1");
            if (break_i > cur_barek) {
                advanced_icon_res = PathTool.getUIIconPath("hero", "hero_info_2");
            }

            var advanced_icon_sp = this.advanced_icons[break_i].getComponent(cc.Sprite);
            this.loadRes(advanced_icon_res, function (advanced_icon_sp, advanced_icon_sf) {
                advanced_icon_sp.spriteFrame = advanced_icon_sf;
            }.bind(this, advanced_icon_sp));
        }

       


        // 等级
        this.level_lb.string = cc.js.formatStr("%s/%s", this.hero_vo.lev, lev_max);

        // 职业
        var hero_type = this.hero_vo.type || 4
        var prof_res = PathTool.getUIIconPath("common", "common_900" + (45 + hero_type));
        var prof_name = HeroConst.CareerName[hero_type] || Utils.TI18N("无");
        this.loadRes(prof_res, function(prof_sf) {
            this.profession_icon_sp.spriteFrame = prof_sf;
        }.bind(this));
        this.profession_name_lb.string = prof_name;

        this.updateAttrt();
        // 技能
        this.updateSkills();

        // 按钮红点
        this.updateLevelUpRedPoint();
    },
    updateCostInfo(){
        if(!this.hero_vo) return;
        if(!this.limit_lev_max)return;
        var lev_max = this.limit_lev_max;
        let max_lev_num = 1
        if(this.hero_vo.lev < 60){
            max_lev_num = 10;
        }
        let can_upgrade_max_lev = this.hero_vo.lev
        let dic_cost_list = {}
        function _checkEnough(up_cost){
            let cur_cost_list = {}
            let is_enough = true
            for(let i=0;i<up_cost.length;++i){
                let cost = up_cost[i]
                if(dic_cost_list[cost[0]] == null){
                    dic_cost_list[cost[0]] = 0
                } 
                cur_cost_list[cost[0]] = dic_cost_list[cost[0]] + cost[1]
                let count = BackpackController.getInstance().getModel().getItemNumByBid(cost[0])
                if(count < cur_cost_list[cost[0]]){
                    // --不够了
                    is_enough = false
                }
            }
    
            return {is_enough:is_enough, cur_cost_list:cur_cost_list}
        }
        // --升级消耗
        for(let i=1;i<=max_lev_num;++i){
            let lev = this.hero_vo.lev + i - 1
            if(lev >= lev_max){
                break
            }
            let lev_config = Config.partner_data.data_partner_lev[lev]
            if(lev_config){
                let up_cost = lev_config.expend || []
                let checkEnough = _checkEnough(up_cost)
                let is_enough = checkEnough.is_enough
                let cost_list = checkEnough.cur_cost_list
    
                if(is_enough){
                    dic_cost_list = cost_list
                    can_upgrade_max_lev = lev
                }else{
                    if(i == 1){
                        dic_cost_list = cost_list
                    }
                    break
                }
            }
        }
        this.setLevName(this.hero_vo, can_upgrade_max_lev - this.hero_vo.lev + 1)

        // 所缺资源
        this.need_items = [];
        // 升级消耗
        var lev_config = Config.partner_data.data_partner_lev[this.hero_vo.lev];
        if (lev_config && lev_config.expend && this.lev_status) {
            for (var expend_i=0;expend_i < lev_config.expend.length;++expend_i) {
                var expend_info = lev_config.expend[expend_i];
                var expend_item_cfg = gdata("item_data", "data_unit1", expend_info[0], false);
                var item_res_path = PathTool.getIconPath("item", expend_item_cfg.icon);
                this.loadRes(item_res_path, function(expend_i, item_sf) {
                    this["item_icon" + (parseInt(expend_i) + 1) + "_sp"].spriteFrame = item_sf;
                }.bind(this, expend_i))

                // 数量
                
                var need_count = dic_cost_list[expend_info[0]]//expend_info[1];
                this["level_up_cost" + (parseInt(expend_i) + 1) + "_lb"].string = need_count;
                var have_count = 0;
                have_count = BackpackController.getInstance().getModel().getItemNumByBid(expend_info[0]);

                var out_line_color = cc.Color.WHITE;
                if (have_count < need_count) {
                    out_line_color = cc.Color.RED;
                    this.need_items.push(expend_info[0]);
                }
                this["level_up_cost" + (parseInt(expend_i) + 1) + "_lb"].node.color = out_line_color;
            }
        }
    },
    setLevName(hero_vo, lev){
        if(!hero_vo)return;
        if(lev > 1){
            this.lev_btn_title_lb.string = Utils.TI18N(cc.js.formatStr(Utils.TI18N("升%s级"), lev)) 
        }else{
            this.lev_btn_title_lb.string = Utils.TI18N("升 级")
        }
    },
    updateUpLevelUse: function() {

    },
    setUpdateRedPointInfo(){
        // if self.is_update_res_info and self.is_update_hero_info then
        //     --清空红点记录
            this.hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] = null 
            this.updateLevelUpRedPoint()
        // end
    },

    updateLevelUpRedPoint: function() {
        var is_redpoint = HeroCalculate.getInstance().checkSingleHeroLevelUpRedPoint(this.hero_vo)
        this.btn_red_nd.active = !!is_redpoint; 
        // addRedPointToNodeByStatus( self.level_up_btn, is_redpoint, 5, 5)
    },

    updateAttrt: function() {
        for (var arrt_i in this.attr_list) {
            var attr_lb = this.attr_item[arrt_i]["attr_label_lb"];
            var attr_val = this.hero_vo[this.attr_list[arrt_i]];
            attr_lb.string = attr_val;
        }
    },

    updateSkills: function() {
        if (!this.star_cfg) return;
        for (var last_skill_i in this.skill_items) {
            this.skill_item_cache.push(this.skill_items[last_skill_i]);
            this.skill_items[last_skill_i].setVisible(false);
            delete this.skill_items[last_skill_i];
        }

        this.skill_container_nd.width = SKILL_ITEM_WIDTH * (this.star_cfg.skills.length - 1);
        for (var skill_i = 1; skill_i < this.star_cfg.skills.length; skill_i++) {
            var skill_i_x = (skill_i - 0.5) * SKILL_ITEM_WIDTH;
            if (this.skill_item_cache.length > 0) {
                this.skill_items[skill_i] = this.skill_item_cache.shift();
                this.skill_items[skill_i].setVisible(true);
            } else {
                var SkillItem = require("skill_item")
                this.skill_items[skill_i] = new SkillItem();
                this.skill_items[skill_i].setParent(this.skill_container_nd);
                this.skill_items[skill_i].setScale(0.8);
                this.skill_items[skill_i].setShowTips(true);
            }

            var sp_status = false;
            if (this.star_cfg.skills[skill_i][0] > this.cur_break_cfg.skill_num){
                sp_status = true
            }
            this.skill_items[skill_i].showUnEnabled(sp_status)
            // this.skill_items[skill_i].setSpStatus(sp_status);
            this.skill_items[skill_i].setPosition(cc.v2(skill_i_x, 0));
            this.skill_items[skill_i].setData(this.star_cfg.skills[skill_i][1]);
        }
    },

    onClickLevelUpBtn: function() {
        this.leveUp();
    },

    leveUp: function() {
        if (!this.hero_vo) return;

        if (this.lev_status === 1) {
            if (this.need_items.length > 0) {
                var expend_item_cfg = gdata("item_data", "data_unit1", this.need_items[0], false);
                message(Utils.TI18N(expend_item_cfg.name + "不足"));
                BackpackController.getInstance().openTipsSource(true, this.need_items[0]);
            } else {
                this.ctrl.sender11003(this.hero_vo.id);
            }
        } else if (this.lev_status === 2){
            this.ctrl.openHeroBreakPanel(true, this.hero_vo);
        }
    },


    onClickLookBtn: function() {
        if (this.hero_vo)
            this.ctrl.openHeroTipsAttrPanel(true, this.hero_vo,true);
    },
})