// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var HeroConst = require("hero_const");
var PartnerConst = require("partner_const");
var HeroEvent = require("hero_event");
var PartnerCalculate = require("partner_calculate");
var HeroCalculate = require("hero_calculate");
var HeroController = require("hero_controller")
var BackpackController = require("backpack_controller")
var MainuiController = require("mainui_controller")
var MainuiConst = require("mainui_const");
const gcore = require("../../sys/game-core-js-min");
const TimeTool = require("../../util/timetool");
var HeroModel = cc.Class({
	extends: BaseClass,
	ctor: function () {
		this.ctrl = arguments[0];
	},

	properties: {
	},

	initConfig: function () {
		// 伙伴数据列表 (id :英雄唯一标识)
		// 结构 this.hero_list[id] = hero_vo
		this.hero_list = {};
		//  伙伴bid列表的  
		// 结构 this.hero_bid_list[bid] = {hero_vo1,hero_vo2}
		this.hero_bid_list = {};
		// 伙伴数据数组形式存储，便于排序
		this.hero_array = [];

		// 标志第一次初始
		this.is_init = true;

		// 英雄上限
		this.hero_max_count = 0;
		// 英雄已激活上限次数 
		this.buy_num = 0;

		//皮肤数据  结构: self.hero_skin_list[皮肤id] = 皮肤结束时间   (如果时间 == 0 表永久)
		this.hero_skin_list = null;

		// 英雄图书馆信息
		this.dic_pokedex_info = null;
		// 英雄图书馆信息 [bid] = 数据
		this.dic_pokedex_bid = {};

		// 熔炼祭坛的列表
		this.dic_fuse_info = null;

		// 已拥过有英雄id [bid] = 1
		this.dic_had_hero_info = {};

		// 布阵站位信息 this.pos_list[布阵类型][pos] = id
		this.pos_list = {};

		this.expedit_list = null;
		// 阵法类型
		this.use_formation_type = 1;
		// 使用的圣器id
		this.use_hallows_id = 0;

		// 装备红点背包已更新 记录
		this.is_equip_redpoint_bag_update = true;
		// 装备红点英雄已更新 记录
		this.is_equip_redpoint_hero_update = true;

		// 是否延迟红点更新中 例子:this.is_delay_redpoint_update[HeroConst.RedPointType.eRPLevelUp] = true
		// 目前只有升级红点用
		this.is_delay_redpoint_update = {};

		// 进阶和升星材料消耗 只能写死 如果策划改了.跟着改吧
		this.upgrade_star_cost_id = 10001;

		// 升星红点背包已更新 记录
		this.is_upgradestar_redpoint_bag_update = true;
		// 升星红点英雄已更新 记录
		this.is_upgradestar_redpoint_hero_update = true;

		// 阵法 红点 (一次性的)
		this.is_redpoint_form = false;
		// 圣器 红点 (一次性的)
		this.is_redpoint_hallows = false;

		// 记录登陆时候角色的等级 判断阵法是否新解锁用
		this.record_login_lev = 0;

		// 符文解锁条件信息
		// var artifact_one        = Config.partner_data.data_partner_const["artifact_one"].val; 
		// var artifact_two        = Config.partner_data.data_partner_const["artifact_two"].val;
		// this.artifact_lock_list = {"1":artifact_one, "2":artifact_two};
		this.artifact_lucky = 0; // 符文祝福值
		this.artifact_lucky_red = false; // 祝福值红点

		// 英雄信息界面 升星页签的参数  6星才限时页签(后面策划要求熔炼祭坛的也加入)
		this.hero_info_upgrade_star_param = 6;

		this.hero_info_upgrade_star_param2 = 10;		
		this.hero_info_upgrade_star_param3 = 11;

		// --英雄信息界面 天赋页签的参数  6星才限时页签
		this.hero_info_talent_skill_param =  Config.partner_skill_data.data_partner_skill_const["skill_slot"].val   
		
		// --天赋技能升星的材料
		this.talent_skill_cost_id = 10450
		// --天赋技能可学习的列表 用于红点 结构 self.dic_hero_talent_skill_learn_redpoint[skill_id] = 1
		this.dic_hero_talent_skill_learn_redpoint  = {}
	
		this.is_need_update_talent_redpoint = true

		// 记录解锁剧情英雄
		this.plot_hero_list = this.ctrl.getHeroPlotInfo();
		
		// 当前剧情播放顺序
		this.plot_play_num = 1;
		//红点状态信息
		this.hero_main_rp_status = {};
		//红点基础数据信息
		this.hero_main_rp_data = {};
		// 远程加载的成人剧情所有资源 对应英雄
        this.loadedRemoteRes = null;
		// 远程加载的成人剧情资源url 对应英雄
		this.remoteUrls = [];
		// 是否在成人剧情状态
		this.is_adult_story_state = true;

    //上阵英雄bid
    this.five_hero_bid_List = [];
    this.embattleRedPointState = false;
	},

  //上阵红点设置
  setEmbattleRedPoint(){
    var list = this.getHeroListByCamp(0);
    var num = 0;
    var count = 0;

    this.five_hero_bid_List = []
    for(let info of list){
      if(info && info.isFormDrama){
        if(info.isFormDrama()){
          this.five_hero_bid_List.push(info.bid)
          num ++;
        }
        var b = false;
        if(info.bid && this.five_hero_bid_List){
          for(let index in this.five_hero_bid_List){
            let bid = this.five_hero_bid_List[index]
            if((info.bid == bid)){
              b = true;
            }
          }
        }
        if(!b){
          count++;
        }
        if(num == 5){
          break;
        }
      }
    }

    if(num<5 && ((5-num<= count && list.length>=5) || (list.length<5 && count> 0))){
      this.embattleRedPointState = true;
    }else{
      this.embattleRedPointState = false;
    }
    gcore.GlobalEvent.fire(HeroEvent.Filter_Hero_Update)
  },

  getEmbattleRedPoint(){
    return this.embattleRedPointState ||this.isHallowNew();
  },

  isHallowNew(){
    var config = Config.hallows_data.data_base;
    var b = false;
    var HallowsModel = require("hallows_controller").getInstance().getModel();
    for(let index in config){
      var data = HallowsModel.getHallowsById(index);
      if(!data){
        continue;
      }
      var state = this.getHallowsRedPointState(index);
      if(state != "false" && data){
        if(state == null){
          this.setHallowsRedPointState(index,"true");
        }
        b = true;
      }
    } 
    return b;
  },

  setHallowsRedPointState(id,status){
    var config = Config.hallows_data.data_base;
    var model = require("login_controller").getInstance().getModel();
    var login_info = model.getLoginData()
    var key = login_info.account+config[id].id+"_"+config[id].name;
    if(this.getHallowsRedPointState(id) == "false") return;
    gcore.SysEnv.set(key,status);
  },

  getHallowsRedPointState(id){
    var config = Config.hallows_data.data_base;
    var model = require("login_controller").getInstance().getModel();
    var login_info = model.getLoginData();
    var key = login_info.account+config[id].id+"_"+config[id].name;
    return gcore.SysEnv.get(key);
  },

	setHeroMaxCount: function (max_count) {
		if (typeof max_count == "number") {
			this.hero_max_count = max_count;
		}
	},

	// 获取英雄上上限
	getHeroMaxCount: function () {
		var max_count = this.hero_max_count || 0;
		var have_coutn = this.hero_array.length;
		return { max_count: max_count, have_coutn: have_coutn };
	},

	setHeroBuyNum: function (buy_num) {
		this.buy_num = Number(buy_num);
	},

	getHeroBuyNum: function () {
		return this.buy_num || 0;
	},

	/**
	 * 更新英雄列表
	 * @author zhanghuxing 2019-01-24
	 * @param  {[type]}  not_show_power 不显示战力变化提示
	 */
	updateHeroList: function (hero_list, is_add, not_show_power) {
		if (!hero_list) return;
		for (var hero_i in hero_list) {
			this.updateHeroVo(hero_list[hero_i], not_show_power);
		}

		// 熔炼祭坛的红点 新增需要重新算红点
		if (is_add) {
	        HeroCalculate.getInstance().clearAllStarFuseRedpointRecord();
			gcore.GlobalEvent.fire(HeroEvent.Hero_Data_Add, hero_list);
		}

    setTimeout(()=>{this.setEmbattleRedPoint()},500)
		this.is_init = false;
	},

	/**
	 * 更新单个英雄信息，如果没有则是新增；
	 */
	updateHeroVo: function (info, not_show_power) {
		if (!info) return;
		info.id = info.partner_id;
		var bid = info.partner_bid || info.bid;
		if (!bid && this.hero_list[info.id])
			bid = this.hero_list[info.id].bid;

		var par_cfg = Config.partner_data.data_partner_base[bid];
		if (!par_cfg) return;

		var is_add = false;
		var hero_vo = this.hero_list[info.id];
		if (!hero_vo) {
			is_add = true;
			var HeroVo = require("hero_vo");
			hero_vo = this.hero_list[info.id] = new HeroVo();

			for (var config_k in par_cfg) {
				if (config_k !== "skills")
					info[config_k] = par_cfg[config_k];
			}

			// 设置角色id
			var RoleController = require("role_controller");
			var role_vo = RoleController.getInstance().getRoleVo();
			if (role_vo) {
				info.rid = role_vo.rid;
				info.srv_id = role_vo.srv_id;
			}
		}

		// 旧数据
		var old_vo = null;
		var open_type = 0
		if (!is_add) {
			// 处理战力提升特效
			if (!not_show_power && hero_vo.power < info.power) {
				GlobalMessageMgr.getInstance().showPowerMove(info.power - hero_vo.power, null, hero_vo.power);
			}

			// 处理升星、进阶
			if (info.star && hero_vo.star < info.star) {                           // 升星
				open_type = 1;
				old_vo = Utils.deepCopy(hero_vo);
				if(hero_vo.star == this.hero_info_talent_skill_param[1] - 1){
					hero_vo.is_open_talent = true;
				}
			} else if (info.break_lev && hero_vo.break_lev < info.break_lev) {     // 进阶
				open_type = 2;
				old_vo = Utils.deepCopy(hero_vo);
			}
		} else {

		}

		// 更新最大星级
		var cur_star = info.star || par_cfg.init_star;
		if (this.dic_had_hero_info[bid]) {
			if (this.dic_had_hero_info[bid] < cur_star)
				this.dic_had_hero_info[bid] = cur_star;
		} else {
			this.dic_had_hero_info[bid] = cur_star;
		}
		hero_vo.updateHeroVo(info);
		if (is_add) {
			this.hero_array.push(hero_vo);
			if(!this.hero_bid_list[hero_vo.bid]){
				this.hero_bid_list[hero_vo.bid] = []
			}
			this.hero_bid_list[hero_vo.bid].push(hero_vo)
		} else {
			if (open_type == 1 && old_vo) {          // 打开升星成功界面
				this.ctrl.openHeroUpgradeStarExhibitionPanel(true, old_vo, hero_vo);
				HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPStar)
			} else if (open_type == 2 && old_vo) {   // 打开进阶成功界面
				this.ctrl.openBreakExhibitionWindow(true, old_vo, hero_vo);
			}
			gcore.GlobalEvent.fire(HeroEvent.Hero_Data_Update, hero_vo);
		}
		HeroCalculate.getInstance().checkHeroRedPointByRedPointType(HeroConst.RedPointType.eRPLevelUp)
		cc.log("updateHeroVo")
	},

	// 获取单个伙伴数据,id
	// @id 是英雄唯一标识id 
	getHeroById: function (partner_id) {
		if (!this.hero_list) return;
		if (!partner_id || typeof partner_id != "number") return;
		return this.hero_list[partner_id] || {}
	},

	// 删除英雄 
	delHeroDataList: function (list) {
		if (!list) return;
		cc.log("delHeroDataList")
		for (var hero_i in list) {
			let v = list[hero_i]
			let temp_bid = this.hero_list[v.partner_id].bid
			delete this.hero_list[list[hero_i].partner_id]
			// --同时从bid英雄列表删除该英雄记录
			let bidlist = this.hero_bid_list[temp_bid]
			if(bidlist){
				for(let i=0;i<bidlist.length;++i){
					let hero_vo = bidlist[i]
					if(hero_vo.partner_id == v.partner_id){
						bidlist.splice(i,1)
					}
				}
			}
		}
		
		this.hero_array = [];
		for (var hero_i in this.hero_list) {
			this.hero_array.push(this.hero_list[hero_i]);
		}

	    // 消除熔炼祭坛的红点 删除也要重新算
	    HeroCalculate.getInstance().clearAllStarFuseRedpointRecord();

	    // 升星红点
	    this.is_upgradestar_redpoint_hero_update = true
	    this.checkUpgradeStarRedPointUpdate()

		gcore.GlobalEvent.fire(HeroEvent.Del_Hero_Event, list);
	},
	// --更新天赋信息
	updateHeroVoTalent(data_list, is_not_check){
		let is_team = false
		var self = this
		for(let i=0;i<data_list.length;++i){
			let v = data_list[i]
			if(self.hero_list[v.partner_id]){
				self.hero_list[v.partner_id].updateSkill(v.dower_skill)
				if(!is_team){
					if(self.hero_list[v.partner_id].isFormDrama()){
						is_team = true
					}
				}
			}
		}
		if(is_team && !is_not_check){
			// --如果有剧情阵容的英雄..需要检查红点
			// --检测红点
			HeroCalculate.getInstance().checkAllHeroRedPoint()    
		}
	},
	getHeroList: function () {
		return this.hero_list || {}
	},

	getAllHeroArray: function () {
		return this.hero_array;
	},

	// 根据阵容获取英雄列表
	getHeroListByCamp: function (camp) {
		if (typeof camp !== "number") return;
		var hero_list = [];

		for (var hero_i in this.hero_array) {
			if (camp === HeroConst.CampType.eNone || camp === this.hero_array[hero_i].camp_type) {
				// hero_list.push(Utils.deepCopy(this.hero_array[hero_i]));
				hero_list.push(this.hero_array[hero_i]);
			}
		}

		var hero_sort = this.getHeroSortFunc();
		return hero_list.sort(hero_sort);
	},

	// 根据阵容获取英雄列表
	getDeepHeroListByCamp: function (camp) {
		if (typeof camp !== "number") return;
		var hero_list = [];

		for (var hero_i in this.hero_array) {
			if (camp === HeroConst.CampType.eNone || camp === this.hero_array[hero_i].camp_type) {
				// hero_list.push(Utils.deepCopy(this.hero_array[hero_i]));
				hero_list.push(this.hero_array[hero_i]);
			}
		}

		var hero_sort = this.getHeroSortFunc();
		return Utils.deepCopy(hero_list.sort(hero_sort));
	},

	getRestHeroListByCamp: function (camp) {
		if (typeof camp !== "number") return;
		var hero_list = [];
		for (var hero_i in this.hero_array) {
			if (camp === HeroConst.CampType.eNone || camp === this.hero_array[hero_i].camp_type) {
				hero_list.push(this.hero_array[hero_i]);
			}
		}

		var rest_hero_list = Utils.deepCopy(hero_list);
		for (var hero_i in rest_hero_list) {
			var hero_vo = rest_hero_list[hero_i];
			if (hero_vo.is_in_form > 0 || hero_vo.is_lock) {
				hero_vo.is_ui_lock = true;
			}
		}

		var hero_sort = function (role_vo1, role_vo2) {
			if ((!role_vo1.is_ui_lock && !role_vo2.is_ui_lock) || (role_vo1.is_ui_lock && role_vo2.is_ui_lock)) {
				if (role_vo1.star === role_vo2.star) {
					if (role_vo1.power == role_vo2.power) {
						if (role_vo1.lev == role_vo2.lev) {
							return role_vo2.sort_order - role_vo1.sort_order;
						} else {
							return role_vo1.lev - role_vo2.lev;
						}
					} else {
						return role_vo1.power - role_vo2.power;
					}
				} else {
					return role_vo1.star - role_vo2.star;
				}
			} else {
				if (role_vo1.is_ui_lock)
					return 1;
				return -1;
			}
		}

		return rest_hero_list.sort(hero_sort);
	},

	setHadHeroInfo: function (list) {
		if (!list) return;
		for (var hero_i in list)
			this.dic_had_hero_info[list[hero_i].partner_id] = list[hero_i].max_star;
	},

	// 初始化图鉴数据
	getHeroPokedexList: function (camp) {
		if (!this.dic_pokedex_info) {
			this.dic_pokedex_info = {};
			for (var camp_i in HeroConst.CampType) {
				if (camp_i !== "eNone")
					this.dic_pokedex_info[HeroConst.CampType[camp_i]] = [];
			}
			var pokedex_cfg = Config.partner_data.data_partner_pokedex;
			if (pokedex_cfg) {
				for (var bid in pokedex_cfg) {
					var par_cfg = Config.partner_data.data_partner_base[bid];
					for (var star_i in pokedex_cfg[bid]) {
						var star = pokedex_cfg[bid][star_i].star;
						var key = bid + "_" + star;
						var info = this.getHeroPokedexByBid(key);    
						if (info) {
              if(info.start_time && info.start_time.length>0){
                var time = gcore.SmartSocket.getTime();
                var start_time = TimeTool.getTimeStamp(info.start_time);
                if(time < start_time){
                  continue;
                }
              }
							this.dic_pokedex_info[info.camp_type].push(info);
						}
					}
				}
			}

			var sort_function = function (dic_pokedex_1, dic_pokedex_2) {
				if (dic_pokedex_1.star === dic_pokedex_2.star) {
					return dic_pokedex_1.bid - dic_pokedex_2.bid;
				} else {
					return dic_pokedex_1.star - dic_pokedex_2.star;
				}
			}
			// 排序
			for (var dic_pokedex_i in this.dic_pokedex_info) {
				this.dic_pokedex_info[dic_pokedex_i].sort(sort_function);
			}
		}

		return this.dic_pokedex_info[camp]
	},

	getHeroPokedexByBid: function (key) {
		if (this.dic_pokedex_bid[key]) return this.dic_pokedex_bid[key];

		var par_show_cfg = gdata("partner_data", "data_partner_show", key);
		if (!par_show_cfg) {
			return null
		}

		var par_base_cfg = Config.partner_data.data_partner_base[par_show_cfg.bid];
		if (par_base_cfg) {
			var break_lev = this.getHeroMaxBreakCountByInitStar(par_show_cfg.star);
			par_show_cfg.hp_max = par_show_cfg.hp                               // 为了计算战力用的 
			par_show_cfg.power = PartnerCalculate.calculatePower(par_show_cfg);
			par_show_cfg.camp_type = par_base_cfg.camp_type;
			par_show_cfg.name = par_base_cfg.name;
			par_show_cfg.init_star = par_base_cfg.init_star;
			par_show_cfg.type = par_base_cfg.type;
			par_show_cfg.break_id = par_base_cfg.break_id;
			par_show_cfg.break_lev = break_lev;
			par_show_cfg.partner_id = par_show_cfg.bid * 10 + par_show_cfg.star;          // 定义一个唯一id	  
			par_show_cfg.is_pokedex = true;  // 是不是图鉴  	
			this.dic_pokedex_bid[key] = par_show_cfg;
			return this.dic_pokedex_bid[key];
		}
		return null
	},
  
  getHerofuseByBid(key){//融合神殿
    // if (this.dic_pokedex_bid[key]) return this.dic_pokedex_bid[key];

		var par_show_cfg = gdata("partner_data", "data_partner_fuse", key);
		if (!par_show_cfg) {
			return null
		}

		var par_base_cfg = Config.partner_data.data_partner_base[par_show_cfg.bid];
		if (par_base_cfg) {
			var break_lev = this.getHeroMaxBreakCountByInitStar(par_show_cfg.star);
			par_show_cfg.hp_max = par_show_cfg.hp                               // 为了计算战力用的 
			par_show_cfg.power = PartnerCalculate.calculatePower(par_show_cfg);
			par_show_cfg.camp_type = par_base_cfg.camp_type;
			par_show_cfg.name = par_base_cfg.name;
			par_show_cfg.init_star = par_base_cfg.init_star;
			par_show_cfg.type = par_base_cfg.type;
			par_show_cfg.break_id = par_base_cfg.break_id;
			par_show_cfg.break_lev = break_lev;
			par_show_cfg.partner_id = par_show_cfg.bid * 10 + par_show_cfg.star;          // 定义一个唯一id	  
			par_show_cfg.is_pokedex = true;  	
			return par_show_cfg
		}
		return null
  },

	// 根据初始星级 或者对应英雄最大进阶次数
	getHeroMaxBreakCountByInitStar: function (init_star) {
		if (!this.dic_max_break) {
			var val = Config.partner_data.data_partner_const.advanced_limit.val
			this.dic_max_break = {}
			for (var val_i in val) {
				this.dic_max_break[val[val_i][0]] = val[val_i][1];
			}
		}
		return this.dic_max_break[init_star] || 0
	},

	// 根据品质获取默认头像
	getRandomHeroHeadByQuality: function (quality) {
		if (!this.dic_random_hero_head) {
			var val = Config.partner_data.data_partner_const.random_hero_icon.val;
			this.dic_random_hero_head = {}
			for (var val_i in val) {
				var item_config = gdata("item_data", "data_unit5", val[val_i][1]);
				if (item_config)
					this.dic_random_hero_head[val[val_i][0]] = item_config.icon;
			}
		}

		var quality = quality || 0;
		if (quality > 5)
			quality = 5;
		return this.dic_random_hero_head[quality]
	},

	getHadHeroInfo: function () {
		return this.dic_had_hero_info || {}
	},

	getHadHeroStarBybid: function (bid) {
		if (this.dic_had_hero_info && this.dic_had_hero_info[bid]) {
			return this.dic_had_hero_info[bid]
		}
		return null
	},


	isOpenTanlentByHerovo(hero_vo){
		if(hero_vo[this.hero_info_talent_skill_param[0]]){
			if(hero_vo[this.hero_info_talent_skill_param[0]] >= this.hero_info_talent_skill_param[1]){
				return true
			}
		}
		return false
	},
	/************阵法相关************/
	setFormList: function (data) {
		var form_type = data.type >= 0 ? data.type : PartnerConst.Fun_Form.Drama;
		if (this.pos_list[form_type]) {
		    for (var form_i in this.pos_list[form_type]) {
		        var vo = this.getHeroById(this.pos_list[form_type][form_i].id)
		        if (vo && vo.updateFormPos) {
		            vo.updateFormPos(0, form_type)
		        }
		    }
		}

		this.pos_list[form_type] = {}
		for (var pos_i in data.pos_info) {
			this.pos_list[form_type][data.pos_info[pos_i].pos] = data.pos_info[pos_i];
			var vo = this.getHeroById(data.pos_info[pos_i].id)
			// 容错处理  bugly出现说  updateFormPos 这个是 (a nil value)
			if (vo && vo.updateFormPos)
				vo.updateFormPos(data.pos_info[pos_i].pos, form_type);
		}

		// 剧情阵法逻辑
		if (form_type == PartnerConst.Fun_Form.Drama) {
			this.form_power = data.power || 0;
			// 阵法类型
			this.use_formation_type = data.formation_type;
			// 使用的圣器id
			this.use_hallows_id = data.hallows_id;

			// GlobalEvent:getInstance():Fire(HeroEvent.Form_Drama_Event,data)
			var calculate = HeroCalculate.getInstance();
			RedMgr.getInstance().addCalHandler(calculate.checkAllHeroRedPoint.bind(calculate), RedIds.HeroAll);

			// 检测红点
			// HeroCalculate.getInstance().checkAllHeroRedPoint();
			let list = []
			for(let k in this.pos_list[form_type]){
				let v = this.pos_list[form_type][k]
				list.push({partner_id : v.id})
			}
			// --请求天赋的
			HeroController.getInstance().sender11099(list)
		}
	},

	// 获取最高战力的英雄战力
	getMaxFight: function () {
		if (this.hero_array) {
			this.hero_array.sort(Utils.tableUpperSorter(["power"]));
			var hero_vo = this.hero_array[0];
			if (hero_vo) {
				return hero_vo.power
			}
		}
		return 0
	},
	//通过bid获取等级最高的英雄信息
	getTopLevHeroInfoByBid(bid){
		if (!bid) return ;
		let list = this.hero_bid_list[bid]
		if (list){
			list.sort(Utils.tableUpperSorter(["lev", "power"]))
			return list[0]
		}
		return null
	},
	//雇佣的
	getExpeditHeroData: function () {
		var hero_list = this.getAllHeroArray();
		var list = [];
		for (var i = 0; i < hero_list.length; i++) {
			var tab = {}
			tab.power = hero_list[i].power;
			tab.name = hero_list[i].name;
			tab.bid = hero_list[i].bid;
			tab.index = i;

			tab.rid = hero_list[i].rid;
			tab.srv_id = hero_list[i].srv_id;
			tab.id = hero_list[i].id;
			tab.star = hero_list[i].star;
			tab.lev = hero_list[i].lev;
			tab.use_skin = hero_list[i].use_skin;
			
			list.push(tab);
		}
		list.sort(function (a, b) {
			return b.power < a.power;
		});
		return list
	},

	// 获取自己的队伍阵法站位
	getMyPosList: function () {
		return this.pos_list[PartnerConst.Fun_Form.Drama] || {}
	},

	getHeroSortFunc: function () {
		var hero_sort = function (role_vo1, role_vo2) {
			if (role_vo1.star === role_vo2.star) {
				if (role_vo1.power == role_vo2.power) {
					if (role_vo1.lev == role_vo2.lev) {
						return role_vo1.sort_order - role_vo2.sort_order;
					} else {
						return role_vo2.lev - role_vo1.lev
					}
				} else {
					return role_vo2.power - role_vo1.power
				}
			} else {
				return role_vo2.star - role_vo1.star
			}
		}
		return hero_sort
	},

	isMaxStarHero: function (bid, star) {
		if (!bid || !star) return false;
		var max_star = Config.partner_data.data_partner_max_star[bid];
		if (max_star && star >= max_star) {
			return true
		}
		if (star >= this.hero_info_upgrade_star_param){
			if(star == this.hero_info_upgrade_star_param2){
            	// --10级升11有世界等级要求
				// return !this.checkOpenStar11()
				return false;
			}
		}
		return false;
	},

	getStarFuseList: function (camp_type) {
		camp_type = camp_type || 0;
		var camp_fuse_list = [];
		var fuse_cfg = Config.partner_data.data_partner_fuse_star;
		if (!fuse_cfg) return
		for (var cfg_i in fuse_cfg) {
			var fuse_cfg_item = fuse_cfg[cfg_i];
			var base_config = Config.partner_data.data_partner_base[cfg_i];
			for (var item_i in fuse_cfg_item) {
				var star = fuse_cfg_item[item_i].star;
				var key = cfg_i + "_" + star;
				var star_config = gdata("partner_data", "data_partner_star", key);
				// Config.partner_data.data_partner_star[key];

				if (base_config && (base_config.camp_type == camp_type || camp_type === 0)) {
					if (base_config && star_config && star_config.expend1.length > 0) {
						var fuse_data = {};
						fuse_data.base_config = base_config;
						fuse_data.star_config = star_config;
						fuse_data.camp_type = base_config.camp_type;
						fuse_data.bid = cfg_i;
						fuse_data.star = star;
						camp_fuse_list.push(fuse_data);
					}
				}
			}
		}

		return camp_fuse_list
	},

	// --根据bid 获取一个模拟herovo对象..属性都是1级的
	getMockHeroVoByBid(bid) {
		let base_config = Config.partner_data.data_partner_base[bid]
		let attr_config = Config.partner_data.data_partner_attr[bid]
		if (!base_config || !attr_config) {
			return
		}

		let hero_vo = Utils.deepCopy(base_config)
		hero_vo.star = base_config.init_star //--默认星数
		hero_vo.break_lev = 0 //--默认进阶
		for (let k in attr_config) { // k,v in pairs(attr_config) do
			let v = attr_config[k]
			if (!hero_vo[k]) {
				hero_vo[k] = v
			}
		}
		hero_vo.hp = attr_config.hp_max //--血量等于最大血量
		hero_vo.power = PartnerCalculate.calculatePower(hero_vo)
		return hero_vo
	},
	/****************装备相关******************/
	updateHeroEquipList: function (data) {
		var partner_id = data.partner_id;
		if (partner_id && this.hero_list[partner_id]) {
			var hero_vo = this.hero_list[partner_id];
			if (hero_vo.power < data.power)
				GlobalMessageMgr.getInstance().showPowerMove(data.power - hero_vo.power, null, hero_vo.power);
			// 判断战力变化
			this.hero_list[partner_id].updateHeroVo(data);
		}
	},

	getHeroEquipList: function (parener_id) {
		if (this.hero_list[parener_id]) {
			return this.hero_list[parener_id].eqm_list;
		}
	},


	//----------------------------符文锻造相关------------------------


	//获取符文祝福红点状态
	getArtifactLuckyRedStatus: function () {
		return this.artifact_lucky_red
	},

	//符文祝福值
	setArtifactLucky: function (value) {
		this.artifact_lucky = value;
		RedMgr.getInstance().addCalHandler(this.updateArtifactLuckyRed.bind(this))
	},

	getArtifactLucky: function () {
		return this.artifact_lucky || 0
	},

	//祝福值红点
	updateArtifactLuckyRed: function () {
		var max_lucky = 0;
		var lucky_cfg = Config.partner_artifact_data.data_artifact_const["change_condition"];
		if (lucky_cfg && lucky_cfg.val != null) {
			max_lucky = lucky_cfg.val;
		}
		if (this.artifact_lucky >= max_lucky) {
			this.artifact_lucky_red = true;
		} else {
			this.artifact_lucky_red = false;
		}
		gcore.GlobalEvent.fire(HeroEvent.Artifact_Lucky_Red_Event);
		var SceneConst = require("scene_const");
		require("mainscene_controller").getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.mall, this.artifact_lucky_red);
		require("mall_controller").getInstance().getModel().setMallMainRedPointData(require("mall_const").MallFunc.Mall,this.artifact_lucky_red);
	},

	updatePartnerArtifactList: function (data) {
		var id = data.partner_id || 0;
		if (this.hero_list[id]) {
			var hero_vo = this.hero_list[id];
			if (hero_vo) {
				if (hero_vo.power < data.power) {
					GlobalMessageMgr.getInstance().showPowerMove(data.power-hero_vo.power ,null,hero_vo.power)
				}
				this.hero_list[id].updateHeroVo(data);
				gcore.GlobalEvent.fire(HeroEvent.Artifact_Update_Event, hero_vo);
		        // let is_artifact =  PartnerCalculate.getIsCanClothArtifact(hero_vo.bid);				
				// hero_vo.updateRedPoint(PartnerConst.Vo_Red_Type.Artifact,false)
			}
		}
	},

	getPartnerArtifactList: function (id) {
		if (this.hero_list[id]) {
			return this.hero_list[id].artifact_list || []
		}
		return []
	},

	//---------------------------符文锻造相关end-------------------------

	setLockByPartnerid: function (partner_id, is_lock) {
		if (this.hero_list[partner_id]) {
			this.hero_list[partner_id].is_lock = is_lock || 0;
		}
	},

	// 活动英雄列表 根据匹配信息 熔炼祭坛用
	// @dic_the_conditions 指定匹配 dic_the_conditions[bid][star] = 数量
	// @dic_random_conditions 随机阵容匹配 dic_the_conditions[camp][star] = 数量
	// @dic_hero_id 标志已用
	// return
	// @ count 拥有不重复英雄总数量
	getHeroListByMatchInfo: function (dic_the_conditions, dic_random_conditions, dic_hero_id) {
		// 找不重复的数量
		var count = 0;
		var dic_hero_id = dic_hero_id || {};
		var dic_count = {};

		var _setDicCount = function (partner_id, str, max) {
			// 判断是否重复
			if (!dic_hero_id[partner_id]) {
				if (!dic_count[str])
					dic_count[str] = 0;
				if (dic_count[str] < max) {
					dic_count[str] = dic_count[str] + 1;
					count = count + 1;
					dic_hero_id[partner_id] = 1;
				}
			}
		}

		for (var hero_i in this.hero_list) {
			var hero = this.hero_list[hero_i];
			if (dic_the_conditions && dic_the_conditions[hero.bid] && dic_the_conditions[hero.bid][hero.star]) {
				var str = cc.js.formatStr("%s%s", hero.bid, hero.star);
				_setDicCount(hero.partner_id, str, dic_the_conditions[hero.bid][hero.star]);
			}

			if (dic_random_conditions) {
				// 0表示所有阵营的合适
				if (dic_random_conditions[0] && dic_random_conditions[0][hero.star]) {
					// if (dic_random_conditions[0][hero.star]) {
						var str = cc.js.formatStr("_%s%s", 0, hero.star)
						_setDicCount(hero.partner_id, str, dic_random_conditions[0][hero.star]);
					// }
				} else {
					if (dic_random_conditions[hero.camp_type] && dic_random_conditions[hero.camp_type][hero.star]) {
						var str = cc.js.formatStr("_%s%s", hero.camp_type, hero.star);
						_setDicCount(hero.partner_id, str, dic_random_conditions[hero.camp_type][hero.star]);
					}
				}
			}
		}

		return count
	},

	/***********************************红点检查********************************/



	// 检测升级红点更新
	checkLevelRedPointUpdate: function() {
	    // GlobalEvent:getInstance():Fire(HeroEvent.Level_RedPoint_Event) 

	    // if (this.is_delay_redpoint_update[HeroConst.RedPointType.eRPLevelUp])
	    //     return

	    // this.is_delay_redpoint_update[HeroConst.RedPointType.eRPLevelUp] = true;
	    // 清除升级红点记录
	    HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPLevelUp, true)
	},

	// 检查阵法解锁 
	checkUnlockFormRedPoint: function() {

	},

	// 设置更新equip红点的记录
	setEquipUpdateRecord: function (bool) {
		this.is_equip_redpoint_bag_update = bool;
		this.is_equip_redpoint_hero_update = bool;
	},

	// 检查装备红点 
	checkEquipRedPointUpdate: function() {
	    // 需要 背包 返回 和 英雄更新返回 才处理红点计算
	    if (this.is_equip_redpoint_bag_update && this.is_equip_redpoint_hero_update) {
	        //清除装备红点记录
	        HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPEquip);
	        gcore.GlobalEvent.fire(HeroEvent.Equip_RedPoint_Event);
	    }
	},

	// 设置更新升星红点的记录
	setUpgradeStarUpdateRecord: function(bool) {
	    this.is_upgradestar_redpoint_bag_update = bool;
	    this.is_upgradestar_redpoint_hero_update = bool;
	},

	// 升星红点检查
	checkUpgradeStarRedPointUpdate: function() {
		// 需要 背包 返回 和 英雄更新返回 才处理红点计算
		if (this.is_upgradestar_redpoint_bag_update && this.is_upgradestar_redpoint_hero_update) {
	        HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPStar);
		} 
	},

	// 检查圣器解锁
	checkUnlockHallowsRedPoint: function() {

	},

	checkOpenStar11: function() {
		let config = Config.partner_data.data_partner_const.staropen11_world_lev
		if(config){
			if(config.val[0] == "world_lev"){
				var RoleController = require("role_controller");
				let world_lev = RoleController.getInstance().getModel().getWorldLev() || 0
				if(world_lev < config.val[1]){
					return false
				}
			}
		}
	
		return true
	},
	//---------------------天赋技能---------------------------
	// --设置更新天赋红点
	setUpdateTalentRedpoint(){
    	this.is_need_update_talent_redpoint = true
	},
	getTalentRedpointRecord(){
		var self = this
		if(self.is_need_update_talent_redpoint){
			let dic_config = Config.partner_skill_data.data_partner_skill_learn
			if(dic_config){
				let is_enough
				for(let k in dic_config){
					let config = dic_config[k]
					self.dic_hero_talent_skill_learn_redpoint[config.id] = null
					is_enough = true
					for(let i=0;i<config.expend.length;++i){
						let v = config.expend[i]
						let count = BackpackController.getInstance().getModel().getItemNumByBid(v[0])
						if(count < v[1]){
							is_enough = false
							break
						}
					}
					if(is_enough){
						self.dic_hero_talent_skill_learn_redpoint[config.id] = config.id
					}
				}
			}
		}
		self.is_need_update_talent_redpoint = false
		if(!Utils.next(self.dic_hero_talent_skill_learn_redpoint)){
			self.dic_hero_talent_skill_learn_redpoint = {}
		}
		return self.dic_hero_talent_skill_learn_redpoint
	},
	// --检测天赋红点更新
	checkTalentRedPointUpdate(){ 
		if(this.is_delay_redpoint_update[HeroConst.RedPointType.eRPTalent]){
			return
		}
		this.is_delay_redpoint_update[HeroConst.RedPointType.eRPTalent] = true
		// --清除天赋红点记录
		HeroCalculate.getInstance().clearAllHeroRecordByRedPointType(HeroConst.RedPointType.eRPTalent, true)
		
	},
	// --增加详细信息
	updateHeroVoDetailedInfo(info){
		if(!info)return
		if(this.hero_list[info.partner_id]){
			cc.log(this.hero_list[info.partner_id],info)
			for(let k in info){
				let v = info[k]
				this.hero_list[info.partner_id][k] = v
			}
			this.hero_list[info.partner_id].is_had_detailed = true
			gcore.GlobalEvent.fire(HeroEvent.Hero_Vo_Detailed_info, this.hero_list[info.partner_id])
		}
	},


	//初始化皮肤 信息英雄皮肤 
	initHeroSkin:function(data){
		if(!data) return
		//判定是否要显示卡片展示界面
		if(this.hero_skin_list){
			let show_skin_id = null;
			for(let i in data.partner_skins){
				let v = data.partner_skins[i];
				if(this.hero_skin_list[v.id] == null){
					show_skin_id = v.id;
					break
				}
			}
			if(show_skin_id){
				//显示
				let skin_config = Config.partner_skin_data.data_skin_info[show_skin_id];
				if(skin_config){
					let setting = {};
					setting.partner_bid = skin_config.bid;
					setting.is_chips = 1;
					setting.init_star = 5;
					setting.status = 1;
					setting.show_type = require("partnersummon_const").Gain_Show_Type.Skin_show;
					setting.skin_id = show_skin_id;
					require("partnersummon_controller").getInstance().openSummonGainShowWindow(true, [setting],null, 2)
				}
			}
		}

		this.hero_skin_list = {};

		for(let i in data.partner_skins){
			let v = data.partner_skins[i];
			this.hero_skin_list[v.id] = v.end_time;
		}

		gcore.GlobalEvent.fire(HeroEvent.Hero_Skin_Info_Event, data);
	},

	//根据皮肤id 返回皮肤数据  
	//@return 皮肤有效时间点..  如果永久返回 0 如果返回nil 表示 没有解锁该皮肤
	getHeroSkinInfoBySkinID:function(skin_id){
		if(this.hero_skin_list && this.hero_skin_list[skin_id] != null){
			return this.hero_skin_list[skin_id]
		}
	},

	//--是否解锁该皮肤
	//is_check_time:判断是否过期
	isUnlockHeroSkin:function(skin_id, is_check_time){
		if(this.hero_skin_list && this.hero_skin_list[skin_id] != null){
			if(is_check_time){
				if(this.hero_skin_list[skin_id] > 0){
					return false
				}
			}
			return true
		}
		return false
	},

	// 是否已经解锁成人剧情 
	isUnlockPlotByHeroBid(bid) {
		const isFind = this.plot_hero_list.find(ob => { return ob.bid == bid });
		console.log("isFind isUnlockPlotByHeroBid 成人剧情");
		return true;
		return isFind;
	},

	// 是否看完成人剧情
	isWatchOverPlot(hero_vo) {
    var bid = hero_vo.bid;
    var lev = hero_vo.lev;
		const plotData = Config.adult_data.data_plot_unlock[bid];
		if(!plotData) {
			return;
		}
		for(let i = 0; i < this.plot_hero_list.length; i++) {
			if(this.plot_hero_list[i].bid == bid) {
				// 已看剧情列表 == 配置剧情列表
        var len = plotData.plot_id_list.length
        if(len >1&&lev <100){
          len --;
        }
				return len == this.plot_hero_list[i].haveWatchPlotIds.length;
			}
		}

		// 不存在就设置看完
		return true;
	},
	
	// 是否解锁某个成人剧情
	isUnlockPlotByPlotId(hero_id, plot_id) {
		for(let i = 0; i < this.plot_hero_list.length; i++) {
			let plot_hero = this.plot_hero_list[i];
			if(plot_hero.bid == hero_id) {
				const isUnlock = plot_hero.unLockPlotIds.find(plotId=>{return plotId == plot_id});
				return isUnlock;
			}
		}
		return false;
	},

	 // 看完成人剧情隐藏按钮
    // onShowPlotBtn(hero_id) {
    //     if(hero_id == ""){
    //         return false;
    //     }
    //     for(let i=0; i<this.plot_hero_list.length; i++) {
    //         let ob=this.plot_hero_list[i];
    //         if(ob.bid==hero_id) {
    //             const plot_cfg = Config.adult_data.data_plot_unlock[ob.bid];
    //             const plot_length=plot_cfg.plot_id_list.length;
    //             // 全部剧情看完
    //             if(ob.haveWatchPlotIds.length==plot_length){
    //                 return false;
    //             }
                
    //             // 部分剧情已解锁但都看完
    //             if(ob.haveWatchPlotIds.length==ob.unLockPlotIds.length){
    //                 return false;
    //             }
    //         }
    //     }
	// 	return true;
    // },

	setHeroMainRedPointData(bid,data){
		this.hero_main_rp_data[bid] = data;
		var status = false;
		if(data==null) {
			status = false;
		}
		else{
			switch(bid){
				case HeroConst.FunctionTab.eHeroInfo:
					for(var i in data){
						status = data[i].status;
						if(status) break;
					}
					break;
				case HeroConst.FunctionTab.eFusion:
					status = data;
				case HeroConst.FunctionTab.eArtifact:
					for(var i in data){
						if(data[i]){
							status = true
							break
						}
					}
			}
		}
		this.hero_main_rp_status[bid] = status;
		var hasred = false;
		for(var item in this.hero_main_rp_status){
			if(this.hero_main_rp_status[item] == true){
				hasred = true;
			}
		}
		MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.partner, hasred);
		gcore.GlobalEvent.fire(HeroEvent.Hero_Main_RedPoint_Event);
	},
	getHeroMainRedPointData(){
 		return this.hero_main_rp_status;
	},

	setAdultStoryState(bool) {
	    this.is_adult_story_state = bool;
      if(bool == false){
        gcore.GlobalEvent.fire(EventId.GUIDE_TO_CONTINUE);
      }
	},
	
	isAdultStoryState() {
	    return this.is_adult_story_state;
	},
});