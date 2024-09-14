// var HeroController = require("hero_controller");
var HeroEvent          = require("hero_event");
var HeroConst          = require("hero_const");
var BackpackController = require("backpack_controller");
var MainuiController   = require("mainui_controller")
var MainuiConst        = require("mainui_const");


var HeroCalculate = cc.Class({
	extends: BaseClass,

	ctor: function() {
		
	},

	//---------------------------英雄升级升阶的红点逻辑-------------------------
	//是足够需要条件
	//@limit 限制条件
	//@ hero_vo 英雄信息
	isEnoughCondition: function(limit, hero_vo) {
	    var isNeed = true;
	    for (var limit_i in limit) {
	        if (limit[limit_i][0] == "star")
	            if (hero_vo.star < limit[limit_i][1]) {
	                isNeed = false;
	                break;
	            }
        }

	    return isNeed;
	},

	calculatePower: function(attr_list) {
	    var total_power = 0;
	    if (!attr_list || attr_list.length === 0) 
	        return total_power
	    
	    var key = null, value = null;
	    for (var attr_i in attr_list) {
	    	var arrt_item = attr_list[attr_i];
	    	if (typeof arrt_item == "array") {
	    		key = arrt_item[0];
	    		value = arrt_item[1];
	    	} else {
	    		key = attr_i;
	    		value = arrt_item;
	    	}
	    	var radio = Config.attr_data.data_power[key];
	    	if (radio) {
	            total_power = total_power + value * radio * 0.001;
	    	}
	    }

	    return Math.ceil(total_power);
	},


	// 检查所有有效英雄红点 
	checkAllHeroRedPoint: function() {
	    var redpoint_data1 = this.checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPLevelUp, true)
	    var redpoint_data2 = this.checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPEquip, true)
	    var redpoint_data3 = this.checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPStar, true)
	    var redpoint_data4 = this.checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPNewPlot, true)

	    var data = [redpoint_data1, redpoint_data2, redpoint_data3, redpoint_data4];
	    //MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.partner, data);
		var HeroController = require("hero_controller");
		HeroController.getInstance().getModel().setHeroMainRedPointData(HeroConst.FunctionTab.eHeroInfo,data);
	    // var data = [redpoint_data1, redpoint_data2, redpoint_data3, redpoint_data4];
	    gcore.GlobalEvent.fire(HeroEvent.All_Hero_RedPoint_Event, data);
	},


	//检查单个英雄的红点信息
	checkSingleHeroRedPoint: function(hero_vo) {
	    var is_redpoint = false;
	    //升级 升阶红点
	    is_redpoint = this.checkSingleHeroLevelUpRedPoint(hero_vo);
	    if (is_redpoint) return true;
	    //装备红点
	    is_redpoint = this.checkSingleHeroEquipRedPoint(hero_vo)
	    if (is_redpoint) return true;
	    //升星红点
	    is_redpoint = this.checkSingleHeroUpgradeStarRedPoint(hero_vo)
	    if (is_redpoint) return true;
	    //天赋红点
	    is_redpoint = this.checkSingleHeroTalentSkillRedPoint(hero_vo)
		if(is_redpoint) return true;
		// 解锁新成人剧情红点
		is_redpoint = this.checkSingleHeroNewPlotRedPoint(hero_vo);
	    return is_redpoint;
	},

	// 计算升星红点红点根据升星表
	// @is_ignore_master_card 是否忽视主卡(6星以上的升星逻辑)
	// @partner_id 忽视主卡的 唯一id
	checkSingleStarFuseRedPointByStarConfig: function(star_config, is_ignore_master_card, partner_id) {
	    if (!star_config) return false;
	    var hero_item_data_list = {};
	    var index = 1;
	    var expend = star_config.expend1[0];
	    // 特定条件数据 结构 dic_the_conditions[bid][星级] = 数量
	    var dic_the_conditions = {};
	    // 随机条件 dic_random_conditions[阵营][星级] = 数量
	    var dic_random_conditions = {};
	    // 标志已用
	    var dic_hero_id = {};
	    var need_count = 0;
	    if (!is_ignore_master_card) {
	        if (expend) {
	            // 指定的 {10402,4,1} : 10402: 表示bid, 4: 表示星级 1:表示数量
	            var bid = expend[0];
	            var star = expend[1];
	            var count = expend[2];

	            dic_the_conditions[bid] = {};
	            dic_the_conditions[bid][star] = count;
	            need_count = need_count + count;
	        }
	        index = index + 1;	    	
	    } else {
	        dic_hero_id[partner_id] = 1;
	    }

	    for (var expend_i = 0;expend_i< star_config.expend2.length;++expend_i) {
	        // 指定的 {10402,4,1} : 10402: 表示bid, 4: 表示星级 1:表示数量
	    	var expend = star_config.expend2[expend_i];

            var bid = expend[0];
            var star = expend[1];
            var count = expend[2];

	        if (!dic_the_conditions[bid])
	            dic_the_conditions[bid] = {};

	        if (!dic_the_conditions[bid][star]) {
	            dic_the_conditions[bid][star] = count;
	        } else {
	            dic_the_conditions[bid][star] = dic_the_conditions[bid][star] + count;
	        }
	        need_count = need_count + count;
	        index = index + 1;
	    }

	    // 4是和策划说好了最多4个
	    if (index <= 4) {
	        // 随机的 {1,4,2} : 1 表示阵营  4: 表示星级 2表示数量
		    for (var expend_i=0;expend_i<star_config.expend3.length;++expend_i) {
		    	var expend = star_config.expend3[expend_i];
	            var camp = expend[0];
	            var star = expend[1];
	            var count = expend[2];

	            if (!dic_random_conditions[camp])
	                dic_random_conditions[camp] = {};

	            if (!dic_random_conditions[camp][star]) {
	                dic_random_conditions[camp][star] = count;
	            } else {
	                dic_random_conditions[camp][star] = dic_random_conditions[camp][star] + count;
	            }

	            need_count = need_count + count; 
	            index = index + 1;
	            if (index > 4)
	                break;
		    }
	    }

	    // 获取列表
	    var HeroController = require("hero_controller");
	    var model = HeroController.getInstance().getModel();
	    var total_count = model.getHeroListByMatchInfo(dic_the_conditions, dic_random_conditions, dic_hero_id);
	    var is_redpoint = total_count >= need_count;
	    var result = {is_redpoint: is_redpoint, need_count: need_count, total_count: total_count};
	    return result;
	},

	//检测符文类型的红点
	//@equip_vo 符文对象..如果为空说明没有符文
	checkSingleArtifactRedPoint:function(equip_vo){
		var backpack_model = require("backpack_controller").getInstance().getModel();
		var BackPackConst = require("backpack_const")
		var equip_score_list = backpack_model.getAllEquipListByType(BackPackConst.item_type.ARTIFACTCHIPS)

		if(equip_vo == null){
			if(equip_score_list && Utils.next(equip_score_list)){
				return true
			}
		}
		return false
	},

	// 根据红点类型 清空红点记录 
	// @red_point_type 参考 HeroConst.RedPointType
	// @is_delay 是否延迟检测
	clearAllHeroRecordByRedPointType: function(red_point_type, is_delay) {
	    // 马上清除
	    var HeroController = require("hero_controller");
	    var model = HeroController.getInstance().getModel();
	    var hero_list = model.getHeroList();

	    for (var hero_i in hero_list) {
	    	hero_list[hero_i].red_point[red_point_type] = null;
	    }

		this.checkHeroRedPointByRedPointType(red_point_type);
		if(red_point_type == HeroConst.RedPointType.eRPLevelUp || red_point_type == HeroConst.RedPointType.eRPTalent){
            // --目前升级 和 天赋 用到延迟
            model.is_delay_redpoint_update[red_point_type] = false
		}
	},


	// 根据红点类型 清检测红点记录 
	// @red_point_type 参考 HeroConst.RedPointType
	// @ 是否只是返回 红点数据就好
	checkHeroRedPointByRedPointType: function(red_point_type, is_return) {
	    var HeroController = require("hero_controller");		
	    var hero_list = HeroController.getInstance().getModel().getHeroList();
	    var redpoint_data = {};
	    redpoint_data.bid = red_point_type;
	    redpoint_data.status = false;

	    for (var hero_i in hero_list) {
	    	var hero_vo = hero_list[hero_i];
	        if (this.isCheckHeroRedPointByHeroVo(hero_vo)) {      //等级
	            if (red_point_type == HeroConst.RedPointType.eRPLevelUp) {
	                redpoint_data.status = this.checkSingleHeroLevelUpRedPoint(hero_vo);
	                if (redpoint_data.status)
	                    break;	            	
	            } else if (red_point_type == HeroConst.RedPointType.eRPEquip) {   //装备
	                redpoint_data.status = this.checkSingleHeroEquipRedPoint(hero_vo);
	                if (redpoint_data.status)
	                    break;
	            } else if (red_point_type == HeroConst.RedPointType.eRPStar) {   //升星
	                redpoint_data.status = this.checkSingleHeroUpgradeStarRedPoint(hero_vo);
	                if (redpoint_data.status) 
	                    break;
	            } else if (red_point_type == HeroConst.RedPointType.eRPTalent) {   //天赋
	                redpoint_data.status = this.checkSingleHeroTalentSkillRedPoint(hero_vo);
	                if (redpoint_data.status) 
	                    break;
	            } else if (red_point_type == HeroConst.RedPointType.eRPNewPlot) {   //成人剧情
					redpoint_data.status = this.checkSingleHeroNewPlotRedPoint(hero_vo);
					if (redpoint_data.status)
						break;
				}
	        }

	    }

	    if (is_return) {
	        return redpoint_data
	    } else {
		    //MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.partner, [redpoint_data]);
			var HeroController = require("hero_controller");
			HeroController.getInstance().getModel().setHeroMainRedPointData(HeroConst.FunctionTab.eHeroInfo,[redpoint_data]);	        
    	    gcore.GlobalEvent.fire(HeroEvent.All_Hero_RedPoint_Event, [redpoint_data]);
	    }
	},

	//是否需要检测红点
	isCheckHeroRedPointByHeroVo: function(hero_vo) {
	    //  3 以后走配置表 
	    // 等于 > 3级 和 上阵的英雄需要检查红点 注意: hero_vo.lev > 3 暂时不要
	    // hero_vo.is_in_form < 10 因为 is_in_form.改成 布阵类型 *10 + 序号了
	    if (!hero_vo) return;

	    if (hero_vo.isFormDrama())
	        return true
	    return false;
	},

	// 检查单个英雄升级红点 及进阶红点
	checkSingleHeroLevelUpRedPoint: function(hero_vo) {	    
		cc.log("checkSingleHeroLevelUpRedPoint");
		if (!hero_vo) return false;

		if(hero_vo.red_point && hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] != null){
			return hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] == true
		}
	    var status = this.getHeroShowLevelStatus(hero_vo);
	    var is_redpoint = false;

	    if (status == 1) {  //升级
	        var lev_config = Config.partner_data.data_partner_lev[hero_vo.lev];
	        if (lev_config) {
	            var up_cost = lev_config.expend || [];
	            var lev_redpoint = true;
	            for (var cost_i = 0 ;cost_i < up_cost.length;++cost_i) {
	            	var cost = up_cost[cost_i];
					var count = BackpackController.getInstance().getModel().getItemNumByBid(cost[0]);
	                if (count < cost[1]){
						lev_redpoint = false;
					}
	            }
				is_redpoint = lev_redpoint;
	        }
	    } else if (status == 2) { // 升阶
	        var key = Utils.getNorKey(hero_vo.type, hero_vo.break_id, hero_vo.break_lev);
	        var break_config = Config.partner_data.data_partner_brach[key];
	        if (break_config) {
	            var cost_list = break_config.expend || [];
	            var break_redpoint = true;
	            for (var cost_i=0;cost_i < cost_list.length;++cost_i) {
	            	var cost = cost_list[cost_i];
					var count = BackpackController.getInstance().getModel().getItemNumByBid(cost[0]);

	                if (count < cost[1])
	                    break_redpoint = false;
				}
	            is_redpoint = break_redpoint;
	        }
	    }
		if(hero_vo.red_point){
			hero_vo.red_point[HeroConst.RedPointType.eRPLevelUp] = is_redpoint 
		}
	    return is_redpoint		
	},

	// 检查单个英雄装备红点
	checkSingleHeroEquipRedPoint: function(hero_vo) {
		cc.log("checkSingleHeroEquipRedPoint");
		if (!hero_vo) return false;

	    if (typeof hero_vo.red_point[HeroConst.RedPointType.eRPEquip] == "boolean") {
	        return hero_vo.red_point[HeroConst.RedPointType.eRPEquip] == true
	    }

	    var is_redpoint = false;
	    var HeroController = require("hero_controller");
	    var model = HeroController.getInstance().getModel()
	    // 装备
	    var equip_list = model.getHeroEquipList(hero_vo.partner_id);
	    var equip_type_list = HeroConst.EquipPosList || {};

	    for (var equip_type_i in equip_type_list) {

	        is_redpoint = this.checkSingleHeroEachPosEquipRedPoint(equip_type_list[equip_type_i], equip_list[equip_type_i])
	        if (is_redpoint)
	            break
	    }

	    hero_vo.red_point[HeroConst.RedPointType.eRPEquip] = is_redpoint;
	    return is_redpoint;
	},


	// 检测装备类型的红点
	// @equip_type 装备类型
	// @equip_vo 装备对象..如果为空说明没有装备
	checkSingleHeroEachPosEquipRedPoint: function(equip_type, equip_vo) {
	    var equip_type = equip_type || 1;
	    var backpack_model = BackpackController.getInstance().getModel();
	    var equip_score_list = backpack_model.getAllEquipListByType(equip_type);

	    if (!equip_vo) {
	        // 没有装备..判断是否有对应类型的装备
	        if (equip_score_list && Utils.next(equip_score_list)) {
	            // 有红点
	            return true
	        }
	    } else {
	        // 如果没有分数..算一个 ..
	        if (!equip_vo.all_score || equip_vo.all_score == 0) {
	            equip_vo.setEnchantScore(0);
	        }
	        var score = equip_vo.all_score || 0;
	        if (equip_score_list) {
	            // 要判断当前装备比背包的装备评分底才显示红点
	            for (var equip_i in equip_score_list) {
	            	var equip_item = equip_score_list[equip_i]
	                if (equip_item && equip_item.all_score && equip_item.all_score > score) {
	                    return true
	                }
	            }
	        }
	    }
	    
	    return false
	},

	// 检查单个英雄升星红点 
	checkSingleHeroUpgradeStarRedPoint: function(hero_vo) {
		cc.log("checkSingleHeroUpgradeStarRedPoint");
		if (!hero_vo) return false;

	    // if (typeof hero_vo.red_point[HeroConst.RedPointType.eRPStar] == "boolean") {
	    //     return hero_vo.red_point[HeroConst.RedPointType.eRPStar] == true;
	    // }
	    
	    var star = hero_vo.star || 1;
	    var next_key = Utils.getNorKey(hero_vo.bid, star + 1);
	    var next_star_config = gdata("partner_data", "data_partner_star", next_key);
	    if (!next_star_config) {
	        // 说明满星了
	        hero_vo.red_point[HeroConst.RedPointType.eRPStar] = false;
	        return false;
	    }
	    
	    var star_config = next_star_config;
	    var is_redpoint = false;
	    var HeroController = require("hero_controller");
	    var model =  HeroController.getInstance().getModel();
	    if (star == model.hero_info_upgrade_star_param2) {
	        // 10级升11有世界等级要求
	        is_redpoint = model.checkOpenStar11();
	    } else {
	        is_redpoint = true;
	    }

	    if (is_redpoint) {
	        if (star_config) {
	        	var star_result = this.checkSingleStarFuseRedPointByStarConfig(star_config, true, hero_vo.partner_id);
	            is_redpoint = star_result.is_redpoint;
	            // 计算消耗    
	            if (is_redpoint && star_config.other_expend.length > 0) {
	                var count = BackpackController.getInstance().getModel().getItemNumByBid(star_config.other_expend[0][0]);
	                if (count < star_config.other_expend[0][1])
	                   is_redpoint = false;
	            }
	        } else {
	            is_redpoint = false;
	        }
	    }

	    hero_vo.red_point[HeroConst.RedPointType.eRPStar] = is_redpoint;
	    return is_redpoint
	},

	// 检查单个天赋技能红点
	checkSingleHeroTalentSkillRedPoint: function(hero_vo) {
		cc.log("checkSingleHeroTalentSkillRedPoint")
		if (!hero_vo) return false;
		// --首次升级到6星记录
		if(hero_vo.is_open_talent == true){
			return true
		}
		if(hero_vo.red_point[HeroConst.RedPointType.eRPTalent] != null){
			return hero_vo.red_point[HeroConst.RedPointType.eRPTalent] == true
		}

		if(!hero_vo.ishaveTalentData())return false;
		let is_redpoint = false
		var HeroController = require("hero_controller")
		let dic_hero_talent_skill_learn_redpoint = HeroController.getInstance().getModel().getTalentRedpointRecord()
		let dic_skill_id = {}
		for(let pos in hero_vo.talent_skill_list){
			let id = hero_vo.talent_skill_list[pos]
			dic_skill_id[id] = pos
		}	
		for(let i in Config.partner_skill_data.data_partner_skill_pos){
			let v = Config.partner_skill_data.data_partner_skill_pos[i]
			if(hero_vo.talent_skill_list[v.pos]) {
				// --已装备技能 只需判断能否升级
				is_redpoint = this.checkSingleTalentSkillLevel(hero_vo.talent_skill_list[v.pos])
				if(is_redpoint){
					break
				}
			}else{
				// --未装备 先判断是否解锁位置 
				let is_lock = false
				if(v.pos_limit[0] == 'star'){
					is_lock = (hero_vo.star >= v.pos_limit[1])
				}
				if(is_lock){
					for(let id in dic_hero_talent_skill_learn_redpoint){ 
						if(dic_skill_id[id] == null){
							is_redpoint = true
							break
						}
					}
					if(is_redpoint){
						break
					}
				}
			}
		}
		hero_vo.red_point[HeroConst.RedPointType.eRPTalent] = is_redpoint
		return is_redpoint
	},	

	// 检查是否解锁新成人剧情红点
	checkSingleHeroNewPlotRedPoint: function(hero_vo) {
		cc.log("checkSingleHeroNewPlotRedPoint")
		if(!hero_vo) {
			return false; 
		} 

	    const HeroController = require("hero_controller");		
		if(HeroController.getInstance().getModel().isWatchOverPlot(hero_vo)) {
			return false;
		}

		return true;
	},
	// --判断天赋技能能否升级 @skill_id 技能id
	checkSingleTalentSkillLevel(skill_id){
		let config = Config.partner_skill_data.data_partner_skill_level[skill_id]
		if(config){
			let is_enough = true
			for(let i=0;i<config.expend.length;++i){
				let cost = config.expend[i]
				let have_num = BackpackController.getInstance().getModel().getItemNumByBid(cost[0])
				if(have_num < cost[1]){
					is_enough = false
					break
				}
			}
			return is_enough
		}
		return false
	},

	// 获取等级显示状态 
	// @ return 0:表示满级  1: 表示可以升级 : 2:表示可以进阶  -1 表示出错了
	getHeroShowLevelStatus: function(hero_vo) {
	    var key = hero_vo.type + "_" + hero_vo.break_id + "_" + hero_vo.break_lev;
	    var break_config = Config.partner_data.data_partner_brach[key];
	    if (!break_config) return -1;
	    var next_key = hero_vo.type + "_" + hero_vo.break_id + "_" + (hero_vo.break_lev + 1);
	    var next_break_config = Config.partner_data.data_partner_brach[next_key];

	    var lev_max = break_config.lev_max;
	    var status = 0;

	    if (!next_break_config) {
	        var key = hero_vo.bid + "_" + hero_vo.star
	        var star_config = gdata("partner_data", "data_partner_star", key);
	        if (star_config && lev_max < star_config.lev_max) {
	            lev_max = star_config.lev_max
	        }

	        if (hero_vo.lev >= lev_max) {
	            //  都满了  满级状态
	            status = 0;
	        } else {
	            // 等级不足 需要升级
	            status = 1;
	        }
	    } else {
	        if (next_break_config.limit && next_break_config.limit.length > 0) {
	            if (hero_vo.lev >= break_config.lev_max) {
	                // 进阶有要求 需要升星
	                var is_enough = this.isEnoughCondition(next_break_config.limit, hero_vo)
	                if (is_enough) {
	                    // 可以进阶了
	                    status = 2;
	                } else {
	                    // 不满足条件.显示满级状态
	                    status = 0;
	                }
	            } else {
	                status = 1;
	            }
	        } else {
	            // 没有限制
	            if (hero_vo.lev >= break_config.lev_max) {
	                // 可以进阶了
	                status = 2;
	            } else {
	                 // 等级不足 需要升级
	                status = 1;
	            }
	        }
	    }
	    return status
	},

	/***************************计算祭坛的红点信息*******************************/

	// 消除融合红点
	clearAllStarFuseRedpointRecord: function() {
	    var HeroController = require("hero_controller")
	    var dic_fuse_info =  HeroController.getInstance().getModel().getStarFuseList();
	    if (!dic_fuse_info) return false;

	    // 0表示全部英雄 
	    // var camp_fuse_info = dic_fuse_info[0]
	    for (var data_i in dic_fuse_info) {
	    	var fuse_data = dic_fuse_info[data_i];
	        fuse_data.cur_redpoint = null;
	    }	    

	    // 计算主界面熔炼祭坛的红点
	    // this.checkAllStarFuseRedpoint();

		RedMgr.getInstance().addCalHandler(this.checkAllStarFuseRedpoint.bind(this), RedIds.RefuseHero);

	},

	// 计算熔炼红点
	checkAllStarFuseRedpoint: function() {
	    var HeroController = require("hero_controller");
	    var dic_fuse_info =  HeroController.getInstance().getModel().getStarFuseList();
	    if (!dic_fuse_info) return false;
	    // 0表示全部英雄 
	    // var camp_fuse_info = dic_fuse_info[0];

	    var is_redpoint = this.checkCampStarFuseRedpoint(dic_fuse_info)

		var MainSceneController = require("mainscene_controller");
		var SceneConst          = require("scene_const");
	    MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.fuse, is_redpoint);
		HeroController.getInstance().getModel().setHeroMainRedPointData(HeroConst.FunctionTab.eFusion,is_redpoint);
	    return is_redpoint
	},


	//计算熔炼祭坛各阵营红点
	checkCampStarFuseRedpoint: function(camp_fuse_info) {
	    if (!camp_fuse_info) return false;
	    var is_all_redpoint = false;
	    var is_redpoint = false;

	    for (var data_i in camp_fuse_info) {
	    	var fuse_data = camp_fuse_info[data_i];
	        is_redpoint = this.checkSingleStarFuseRedPoint(fuse_data);
	        if (!is_all_redpoint && is_redpoint)
	            is_all_redpoint = true;
	    }

	    return is_all_redpoint		
	},

	// 计算单个英雄数据红点 
	checkSingleStarFuseRedPoint: function(fuse_data) {
	    //cur_redpoint == nil 就是没有计算过红点的
	    if (fuse_data.cur_redpoint)
	        return fuse_data.cur_redpoint == 1;

	    if (!fuse_data.star_config) return;
	    // var is_redpoint, need_count, total_count 
	    var result = this.checkSingleStarFuseRedPointByStarConfig(fuse_data.star_config)

	    if (result.is_redpoint) {
	        // 有红点 类型 1  因为融合祭坛那边排序问题 这样定义 
	        result.cur_redpoint = 1;
		    fuse_data.cur_redpoint = 1;
	    } else {
	        // 没有红点 类型 2
	        result.cur_redpoint = 2;
		    fuse_data.cur_redpoint = 2;	        
	    }
	    fuse_data.need_count = result.need_count || 0;
	    fuse_data.total_count = result.total_count || 0;

	    return result.is_redpoint;
	},

});


// 实例化单利
HeroCalculate.getInstance = function() {
    if (!this.instance) {
        this.instance = new this();
    }
    return this.instance;
}


module.exports = HeroCalculate;