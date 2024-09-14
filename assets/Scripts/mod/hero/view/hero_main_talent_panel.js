var HeroEvent = require("hero_event");
var HeroCalculate = require("hero_calculate")
var BackpackEvent = require("backpack_event")
var BackPackConst = require("backpack_const")
var HeroConst = require("hero_const")
var HeroVo = require("hero_vo")
var HeroMainTalenPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_tab_talent_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    initConfig: function () { 
    	this.talent_pos_cfg = Config.partner_skill_data.data_partner_skill_pos;
    },

    initPanel: function () { 
		this.up_btn_nd   = this.seekChild("up_btn");
		this.up_btn_txt  = this.seekChild("up_btn_txt", cc.Label);
		this.shop_btn_nd = this.seekChild("shop_btn");
		this.tip_bnt_nd  = this.seekChild("tip_bnt");

    	var skill_bnts = this.skill_bnts = {};
    	for (var skill_i = 1; skill_i <=2; skill_i++) {
			var btn_info  = this.skill_bnts[skill_i] = {};
			var btn_nd = btn_info["btn_nd"] = this.seekChild("skill_btn_" + skill_i);
			btn_nd.skill_tag = skill_i;
			btn_info["lev_bg_nd"]     = this.seekChild(btn_nd, "lev_bg");
			btn_info["lev_lb"]        = this.seekChild(btn_nd, "lev", cc.Label);
			btn_info["red_con_nd"]    = this.seekChild(btn_nd, "red_con");
			btn_info["skill_icon_nd"] = this.seekChild(btn_nd, "skill_icon");
			btn_info["skill_icon_sp"] = this.seekChild(btn_nd, "skill_icon", cc.Sprite);
			btn_info["add_icon_nd"]   = this.seekChild(btn_nd, "add_icon");
			btn_info["tip_nd"]        = this.seekChild(btn_nd, "tip_nd");
			btn_info["tip_title_lb"]  = this.seekChild(btn_nd, "tip_title", cc.Label);
			btn_info["lock_icon_nd"]  = this.seekChild(btn_nd, "lock_icon");
			btn_info["add_icon_nd"]   = this.seekChild(btn_nd, "add_icon");

    		// btn_info["add_icon_nd"].on(cc.Node.EventType.TOUCH_END, this.onClickAddBtn, this);
    		btn_info["btn_nd"].on(cc.Node.EventType.TOUCH_END, this.onClickSkillBnt, this);
    	}

    	this.tip_bnt_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTipBtn, this);
    	this.up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickUpBtn, this);
		this.shop_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickShopBtn, this);

		Utils.getNodeCompByPath("up_btn/up_btn_txt", this.root_wnd, cc.Label).string = Utils.TI18N("技能预览");
		Utils.getNodeCompByPath("shop_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("技能商店");
    },

    registerEvent: function () { 
		// --物品道具增加 判断红点
		this.addGlobalEvent(BackpackEvent.ADD_GOODS,function(bag_code,temp_add){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
				for(let i in temp_add){
					let item = temp_add[i]
					if(Utils.getItemConfig(item.base_id)){
						this.checkSkillLevelUpRedpoint()
						break
					}
					if(item.base_id == this.model.talent_skill_cost_id){
						this.checkSkillLevelUpRedpoint()
						break
					}
				}
			}
		}.bind(this))
		// --物品道具删除 判断红点
		this.addGlobalEvent(BackpackEvent.DELETE_GOODS,function(bag_code,temp_del){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
				for(let i in temp_del){
					let item = temp_del[i]
					if(Utils.getItemConfig(item.base_id)){
						this.checkSkillLevelUpRedpoint()
						break
					}
					if(item.base_id == this.model.talent_skill_cost_id){
						this.checkSkillLevelUpRedpoint()
						break
					}
				}
			}
		}.bind(this))
		//物品道具改变 判断红点
		this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM,function(bag_code,temp_list){
			if(bag_code != BackPackConst.Bag_Code.EQUIPS){ 
				for(let i in temp_list){
					let item = temp_list[i]
					if(Utils.getItemConfig(item.base_id)){
						this.checkSkillLevelUpRedpoint()
						break
					}
					if(item.base_id == this.model.talent_skill_cost_id){
						this.checkSkillLevelUpRedpoint()
						break
					}
				}
			}
		}.bind(this))
		//遗忘技能返回
		this.addGlobalEvent(HeroEvent.Hero_Forget_Talent_Event,function(data){
			if(!data)  return;
            if(!this.hero_vo) return 
            if(data.partner_id == this.hero_vo.partner_id){
				this.hero_vo = data
                this.updateWidget();
			}
		}.bind(this))
		//技能升级
		this.addGlobalEvent(HeroEvent.Hero_Level_Up_Talent_Event,function(data){
			if(!data)  return;
            if(!this.hero_vo) return 
            if(data.partner_id == this.hero_vo.partner_id){
				this.hero_vo = data
				// message(Utils.TI18N("技能升级成功"))
                this.updateWidget();
			}
		}.bind(this))
		//获取到天赋信息
		this.addGlobalEvent(HeroEvent.Hero_Get_Talent_Event,function(list){
			if(!list)  return;
            if(!this.hero_vo) return 
            for(let i=0;i<list.length;++i){
				let v = list[i]
                if(v.partner_id == this.hero_vo.partner_id){
					this.hero_vo = Utils.deepCopy1(this.model.getHeroById(v.partner_id)) 
                    this.updateWidget()
                    // this.checkSkillLevelUpRedpoint()
				}
			}
		}.bind(this))
		//领悟天赋技能
		this.addGlobalEvent(HeroEvent.Hero_Learn_Talent_Event,function(data){
			if(!data)  return;
            if(!this.hero_vo) return 
            if(data.partner_id == this.hero_vo.partner_id){
				this.hero_vo = data
				this.updateWidget();
				// this.checkSkillLevelUpRedpoint()
			}
		}.bind(this))
    },

    onShow: function (params) {
		this.hero_vo = params;
		if(this.hero_vo.is_open_talent){
			// --移除6星开启天赋
			this.hero_vo.is_open_talent = null
			// --移除那边的
			this.hero_vo.fire(HeroVo.UPDATE_Partner_ATTR,this.hero_vo)
			// --更新一下主角按钮的红点
			HeroCalculate.getInstance().checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPTalent)
		}
    	this.updateWidget();
    },

    onHide: function () { 

    },

    onDelete: function () { 

    },

    // 界面hero_vo更新
    updateHeroInfo: function(hero_vo) {
    	this.hero_vo = hero_vo;
    	if (this.root_wnd)
    		this.updateWidget();
    },

    onClickSkillBnt: function(event) {
		Utils.playButtonSound(1)
    	if (this.hero_vo.ishaveTalentData()) {
    		var skill_index = event.target.skill_tag;
	    	var is_open = this.checkOpenByIndex(skill_index, true);
	    	if (is_open) {
	    		if (this.hero_vo.talent_skill_list[skill_index]) {
	    			this.ctrl.openHeroTalentSkillLevelUpPanel(true, this.hero_vo, this.hero_vo.talent_skill_list[skill_index], skill_index);
	    		} else {
	    			this.ctrl.openHeroTalentSkillLearnPanel(true, this.hero_vo, skill_index);
	    		}
	    	}
    	}
    },

    updateWidget: function() {
		if(this.hero_vo.talent_skill_list == null)return
    	var talent_info = this.hero_vo.talent_skill_list;
    	for (var cfg_i in this.talent_pos_cfg) {
    		var cur_cfg = this.talent_pos_cfg[cfg_i];

    		var is_open = this.checkOpenByIndex(cur_cfg.pos);
    		if (is_open) {
    			var skill_info = talent_info[cur_cfg.pos];
	    		if (skill_info) {
	    			this.skill_bnts[cur_cfg.pos]["add_icon_nd"].active = false;
	    			this.skill_bnts[cur_cfg.pos]["skill_icon_nd"].active = true;

	    			var skill_data = gdata('skill_data', 'data_get_skill', skill_info);
	    			if (skill_data) {
	    				var icon_path = PathTool.getIconPath("skillicon", skill_data.icon);
	    				this.loadRes(icon_path, function(index, icon_sf) {
	    					this.skill_bnts[index]["skill_icon_sp"].spriteFrame = icon_sf;
	    				}.bind(this, cur_cfg.pos));
		    			this.skill_bnts[cur_cfg.pos]["tip_nd"].active = true;	
		    			this.skill_bnts[cur_cfg.pos]["tip_title_lb"].string = skill_data.name;
		    			this.skill_bnts[cur_cfg.pos]["lev_bg_nd"].active = true;
		    			this.skill_bnts[cur_cfg.pos]["lev_lb"].string = skill_data.level;		    			
	    			}
	    		} else {
	    			this.skill_bnts[cur_cfg.pos]["lev_bg_nd"].active = false;	    			
	    			this.skill_bnts[cur_cfg.pos]["tip_nd"].active = false;	    			
	    			this.skill_bnts[cur_cfg.pos]["add_icon_nd"].active = true;
	    			this.skill_bnts[cur_cfg.pos]["skill_icon_nd"].active = false;	    			
	    		}
    			this.skill_bnts[cur_cfg.pos]["lock_icon_nd"].active = false;	    		
    		} else {
    			this.skill_bnts[cur_cfg.pos]["lock_icon_nd"].active = true;
				this.skill_bnts[cur_cfg.pos]["add_icon_nd"].active = false;
				this.skill_bnts[cur_cfg.pos]["tip_title_lb"].string = `★${cur_cfg.pos_limit[1]}で開放`;	
				this.skill_bnts[cur_cfg.pos]["tip_nd"].active = true;	
				this.skill_bnts[cur_cfg.pos]["lev_bg_nd"].active = false;
				this.skill_bnts[cur_cfg.pos]["skill_icon_nd"].active = false;
    		}
		}
		this.checkSkillLevelUpRedpoint()
    },

    checkOpenByIndex: function(index, shwo_tip) {
    	if (!index) return;
    	var cur_cfg = this.talent_pos_cfg[index];
    	if(!cur_cfg) return;

    	if(cur_cfg.pos_limit[0] == "star") {
    		if(this.hero_vo.star >= cur_cfg.pos_limit[1]) {
    			return true;
    		} else {
    			if (shwo_tip)
	    			message(`★${cur_cfg.pos_limit[1]}で開放`);
    		}
    	}
    	return false
    },

    onClickTipBtn: function(event) {
		Utils.playButtonSound(3)
        var tip_des = Config.partner_skill_data.data_partner_skill_const.skill_rule;
	    var pos = event.touch.getLocation();
        require("tips_controller").getInstance().showCommonTips(tip_des.desc, pos);    	
    },

    onClickUpBtn: function() {
    	this.ctrl.openArtifactSkillWindow(true, 2);
    },

    onClickShopBtn: function() {
	    var MallController = require("mall_controller");
        var MallConst      = require("mall_const");
	    MallController.getInstance().openMallPanel(true, MallConst.MallType.SkillShop)
	},
	
	//检查升级的红点 
	checkSkillLevelUpRedpoint(){
		if(!this.hero_vo.talent_skill_list) return;
		for(let i in this.talent_pos_cfg){
			let v = this.talent_pos_cfg[i]
			if(this.hero_vo.talent_skill_list[v.pos]){
				let is_redpoint = HeroCalculate.getInstance().checkSingleTalentSkillLevel(this.hero_vo.talent_skill_list[v.pos])
				this.skill_bnts[i].red_con_nd.active = is_redpoint;
			}else{
				this.skill_bnts[i].red_con_nd.active = false;
			}
		}

	},
})