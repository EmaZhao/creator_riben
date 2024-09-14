var PartnerConst = require("partner_const");
var HeroConst = require("hero_const")
var HeroConst    = require("hero_const");
var GoodsVo      = require("goods_vo");

var HeroVo = cc.Class({
	extends: gcore.BaseEvent,

	ctor: function() {
		this.partner_id          = 0;     //  此英雄的唯一标识id
		this.id                  = 0;     //  已废弃用上面的, 如果有 那么一定是和 partner_id相等.
		this.bid                 = 0;     //  此配置表对应英雄id
		
		this.camp_type           = 1;     // 阵营 配置表有
		
		this.rare_type           = 0;     // 伙伴类型 1：N 2：R 3：SR 4：SSR
		this.name                = "";
		this.type                = 0;     // 职业； [3]=TI18N("魔法"),[4]=TI18N("戦士"),[5]=TI18N("タンク"),[6]=TI18N("補助")
		this.face_id             = 0;     // 头像id;
		this.lev                 = 0;
		this.exp                 = 0;     //  经验;
		this.break_lev           = 0;     // 突破等级
		this.max_exp             = 0;     // 经验上限
		this.star_step           = 0;     // 星星阶段
		this.star                = 0;     // 星数
		this.quality             = 0;     // 品质
		this.looks               = {};
		this.body_res            = "";
		this.res_id              = "";
		this.power               = 0;     // 战力
		this.rid                 = 0;
		this.srv_id              = "";
		this.recruit_type        = 1;     //  卡库 
		this.chips_id            = 0;     //  碎片id
		this.chips_num           = 0;     //  初始碎片数
		
		this.clothes_id          = 0;     // 时装id
		
		this.other_form          = 0;
		
		this.fetter              = {};    //  绑定的星命,多个      
		
		this.fetter_power        = 0;     // 星命加成战力 
		
		this.fetter_atk          = 0;     // 星命攻击加成
		this.fetter_hp           = 0;     // 星命生命加成
		this.fetter_speed        = 0;     // 星命速度加成
		this.fetter_def          = 0;     // 星命防御加成
		
		// 属性部分
		this.atk                 = 0;     //  攻击;
		this.def_p               = 0;     //  物防;
		this.def_s               = 0;     //  法防;
		this.hp                  = 0;     //  气血;
		this.speed               = 0;     //  速度;
		this.def                 = 0;     //  防御
		
		this.hit_rate            = 0;     //  命中
		this.dodge_rate          = 0;     //  闪避
		this.crit_rate           = 0;     //  暴击率;
		this.crit_ratio          = 0;     //  暴击伤害;
		this.hit_magic           = 0;     //  效果命中;
		this.dodge_magic         = 0;     //  效果抵抗;
		
		// 对应的属性列表
		this.group_attr          = {};    // 成长值
		
		this.skills              = {};    // "技能列表{[1] = {skill_bid = xx}}
		this.break_skills        = {};    // 突破技能列表
		this.eqm_list            = {};    // 伙伴装备列表
		this.artifact_list       = {};    // 神器列表
		
		this.awaken_count        = 0;     //  觉醒次数,如果是0 就是没有觉醒
		this.awaken_skills       = {};
		
		this.form_param     	 = 100    // 布阵的参数
		this.is_in_form          = 0;     // 是否在阵上，是的话为阵上位置 其值的 :逻辑是 PartnerConst.Fun_Form.xxx * 10 + pos
		this.dic_in_form         = {};    // 在那个布阵信息 如: this.dic_in_form[PartnerConst.Fun_Form.Drama] = pos
		
		this.sort_order          = 0;     // 排序用
		this.show_order          = 0;
		this.order               = 0;
		//  this.dispather_order = 0
		
		this.is_lock             = 0;     // 是否锁定..只要 this.dic_locks 列表中有一个被锁定.此值都是锁定的
		// 判定是否锁定..尽量用 HeroVo:isLock()方法
		this.dic_locks           = {};    // 锁定信息 this.dic_locks[锁定类型] = 0 
		this.red_point           = {};    // 红点列表 HeroConst.Red_Point_Type	
		
		// 天赋技能列表  self.talent_skill_list[位置] = skill_id
    	this.talent_skill_list = null;
	},

	setAttr: function(key, val) {
		this[key] = val;
	},

	updateHeroVo: function(hero_info) {
		if (!hero_info) return;

		for (var info_k in hero_info) {
			this.setAttr(info_k, hero_info[info_k]);

			if (info_k == "show_order")
				this.sort_order = hero_info[info_k];
			if (info_k == "eqms")
				this.updateEqmList(hero_info[info_k]);
			if (info_k == "artifacts")
				this.updateArtifactList(hero_info[info_k]);
			if (info_k == "is_lock")
				this.updateLock(hero_info[info_k]);
			if (info_k == "dower_skill")
				this.updateSkill(hero_info[info_k])
		}
		this.fire(this.UPDATE_PARTNER_ATTR, this);
		// 发出更新事件
	},
	updateSkill(list){
		this.talent_skill_list = {}
		for(let i=0;i<list.length;++i){
			let v = list[i]
			this.talent_skill_list[v.pos] = v.skill_id
		}
	},
	updateEqmList: function(equips) {
		if (!equips) return;
		for (var equip_i in equips) {
			var new_info = equips[equip_i];
			var goods_vo = this.eqm_list[new_info.type];
			if (!goods_vo)
				this.eqm_list[new_info.type] = goods_vo = new GoodsVo();
			goods_vo.setBaseId(new_info.base_id);
			goods_vo.initAttrData(new_info);
			goods_vo.setEnchantScore(0);
		}

		// 刪除处理
		for (var goods_i in this.eqm_list) {
			if (this.eqm_list[goods_i]) {
				var cur_info = this.eqm_list[goods_i];
				var is_delete = true;
				for (var new_i in equips) {
					if (equips[new_i].base_id === cur_info.base_id) {
						is_delete = false;
					}
				}
				if (is_delete) {
					this.eqm_list[goods_i] = null;
				}
			}
		}
 	},

	updateArtifactList: function(data) {
		var list = data || {};
		var dic_pos = {};
		for(var i in list){
			dic_pos[list[i].artifact_pos] = list[i];
		}
		//写死只有两个神器 (神器位置类型: 1, 2 )
		for(var i = 1;i <= 2;i++){
			var artifact_data = dic_pos[i];
			var goods_vo = this.artifact_list[i];
			if(artifact_data && goods_vo){
				if( goods_vo["initAttrData"]){
					goods_vo.initAttrData(artifact_data);
				}
			}else if (artifact_data && goods_vo == null){
				goods_vo = new GoodsVo();
				goods_vo.setBaseId(artifact_data.base_id);
				if(goods_vo["initAttrData"]){
					goods_vo.initAttrData(artifact_data);
				}
				this.artifact_list[i] = goods_vo;
			}else if (artifact_data == null && goods_vo){
				this.artifact_list[i] = null;
				goods_vo = null;
			}
			
		}
	},

	updateLock: function(datas) {
	    this.is_lock = 0
	    for (var data_i in datas) {
	    	var data = datas[data_i]
	    	this.dic_locks[data.lock_type] = data.is_lock;
	    	if (this.is_lock == 0) {
	    		this.is_lock = data.is_lock;
	    	}
	    }
	},

	isLock: function() {
		for (var lock_i in this.dic_locks) {
			if (this.dic_locks[lock_i] > 0)
				return true;
		}
		return false;
	},

	// 更新阵法
	updateFormPos: function(pos, fun_form_type) {
	    fun_form_type = fun_form_type || PartnerConst.Fun_Form.Drama;
	    pos = pos || 0;
	    this.is_in_form = 0;
	    if (pos == 0) {
	    	delete this.dic_in_form[fun_form_type];
	        // this.dic_in_form[fun_form_type] = null;
	    } else {
	        this.dic_in_form[fun_form_type] = pos;
	    }
		// for(let _type in this.dic_in_form){
		// 	let _pos = this.dic_in_form[_type]
		// 	let cur_pos = _type * 10 + _pos
		// 	if (this.is_in_form == 0){
		// 	    this.is_in_form = cur_pos
		// 	}else{
		// 	    if (this.is_in_form > cur_pos){
		// 			this.is_in_form = cur_pos
		// 		}
		// 	}
		// }
	    // for _type, _pos in pairs(this.dic_in_form) do
	    //     local cur_pos = _type * 10 + _pos
	    //     if self.is_in_form == 0 then
	    //         self.is_in_form = cur_pos
	    //     else
	    //         if self.is_in_form > cur_pos then
	    //             self.is_in_form = cur_pos

	    for (var pos_i in this.dic_in_form) {
	    	var cur_pos = pos_i * 10 + this.dic_in_form[pos_i];
	    	if (this.is_in_form == 0 || this.is_in_form > cur_pos) {
	    		this.is_in_form = cur_pos;
	    	}
	    }

	    this.updateHeroVo("is_in_form", this.is_in_form);
	},
	// --检查英雄锁定tips
	// -- is_all 是否全部判定
	// -- lock_type_list 需要检查的锁定类型 参考HeroConst.LockType
	checkHeroLockTips:function(is_all, lock_type_list){
		if (is_all){
			lock_type_list = {
				[1] : HeroConst.LockType.eFormLock, //--优先判定已上阵
				[2] : HeroConst.LockType.eHeroLock, 
				[3] : HeroConst.LockType.eHeroChangeLock, 
			}
		}else{
			lock_type_list = lock_type_list || {} 
		}

		for (let i in lock_type_list){
			let lock_type = lock_type_list[i]
			if (lock_type == HeroConst.LockType.eFormLock){
				if (this.is_in_form > 0 ){
					let fun_form_type =  Math.floor(this.is_in_form/this.form_param)
					if (fun_form_type == PartnerConst.Fun_Form.Drama){
						message(Utils.TI18N("该英雄已上阵，请前往英雄-布阵界面下阵"))
					}else if (fun_form_type == PartnerConst.Fun_Form.Arena){
						message(Utils.TI18N("该英雄在竞技场防守阵容中已上阵"))
					}else if (fun_form_type == PartnerConst.Fun_Form.EliteMatch || fun_form_type == PartnerConst.Fun_Form.EliteKingMatch ){
						message(Utils.TI18N("该英雄在精英赛阵容中已上阵"))
					}
					return true
				}
			}else{
				if (this.dic_locks[lock_type] && this.dic_locks[lock_type] > 0 ){
					if (lock_type == HeroConst.LockType.eHeroLock){
						message(Utils.TI18N("该英雄已锁定，请前往英雄界面解锁"))
					}else if (lock_type == HeroConst.LockType.eHeroChangeLock){
						message(Utils.TI18N("该英雄转换中，请前往先知圣殿解除"))
					}
					return true
				}
			}
		}
	},

	isFormDrama: function() {
	    if (this.is_in_form > 0) {
	        var fun_form_type =  Math.floor(this.is_in_form / this.form_param);
	        if (fun_form_type == PartnerConst.Fun_Form.Drama)
	            return true
	    }
	    return false
	},

	ishaveTalentData: function() {
		if (!this.talent_skill_list)
			return false;
		return true
	},

	updateRedPoint:function(index,bool){
		if(bool != null){
			if(this.red_point[index] != bool){
				this.red_point[index] = bool;
				this.fire(HeroVo.UPDATE_Partner_ATTR,this);
			}
		}
	},
})

HeroVo.prototype.UPDATE_PARTNER_ATTR = "UPDATE_PARTNER_ATTR";

module.exports = HeroVo;