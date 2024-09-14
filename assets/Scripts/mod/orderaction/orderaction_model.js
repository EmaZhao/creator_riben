// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      战令数据处理模块
// <br/>Create: 2019-08-10 16:19:12
// --------------------------------------------------------------------
var MainUIController = require("mainui_controller");
var OrderactionConst = require("orderaction_const");


var OrderactionModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.initTaskData();
    },

    initTaskData:function(){
        this.day_task_list = []; //每日任务
        this.week_task_list = []; //每周任务
        this.period_task_list = []; //周期任务
    },

    // 任务归类
    setTaskInduct:function(period,day,index){
		if(index == 1){
			var day_list = Config.holiday_war_order_data.data_day_task_list;
			if(day_list && day_list[period]){
				for(var i in day_list[period]){
					if(day_list[period][i].day == day){
						this.day_task_list.push(day_list[period][i]);
					}
				}
				this.day_task_list.sort(function(a,b){
					return a.goal_id - b.goal_id;
				});
			}
		}else if(index == 2){
			var week_list = Config.holiday_war_order_data.data_week_task_list;
			if(week_list && week_list[period]){
				for(var i in week_list[period]){
					if(day >= week_list[period][i].min_day && day <= week_list[period][i].max_day){
						this.week_task_list.push(week_list[period][i]);
					}
				}
				this.week_task_list.sort(function(a,b){
					return a.goal_id - b.goal_id;
				})
			}
		}else if(index == 3){
			var period_list = Config.holiday_war_order_data.data_period_task_list;
			if(period_list && period_list[period]){
				for(var i in period_list[period]){
					this.period_task_list.push(period_list[period][i]);
				}
				this.period_task_list.sort(function(a,b){
					return a.goal_id - b.goal_id;
				});
			}
		}
    },

	getTaskInduct:function(index){
		var list;
		if(index == 1){
			list = this.day_task_list;
		}else if(index == 2){
			list = this.week_task_list;
		}else if(index == 3){
			list = this.period_task_list;
		}
		if(list && Utils.next(list) != null){
			return list;
		}
		return null;
	},

	// 当前经验
	setCurExp:function(exp){
		this.cur_exp = exp;
	},

	getCurExp:function(){
		if(this.cur_exp){
			return this.cur_exp;
		}
		return 1
	},

	// 当前周期
	setCurPeriod:function(period){
		this.cur_period = period;
	},

	getCurPeriod:function(){
		if(this.cur_period){
			// 存在在线时0点更新的时候出现断线会有周期替换的周期数不正确，，这时要判断主城图标来判断周期数
			var order_icon_2 = MainUIController.getInstance().getFunctionIconById(OrderactionConst.OrderActionEntranceID.entrance_id);
			if(order_icon_2){
				this.cur_period = 1;
			}
			return this.cur_period;
		}
		return 1;
	},

	// 当前天数
	setCurDay:function(day){
		this.cur_day = day;
	},

	getCurDay:function(){
		if(this.cur_day!=null){
			return this.cur_day;
		}
		return 1;
	},

	// 当前等级
	setCurLev:function(lev){
		this.cur_lev = lev;
	},

	getCurLev:function(){
		if(this.cur_lev!=null){
			return this.cur_lev;
		}
		return 1;
	},

	
	// 是否激活特权
	setRMBStatus:function(status){
		this.rmb_status = status;
	},

	getRMBStatus:function(){
		if(this.rmb_status!=null){
			return this.rmb_status;
		}
		return 0
	},

	// 是否领取额外礼包
	setExtraStatus:function(status){
		this.extra_status = status;
	},

	getExtraStatus:function(){
		if(this.extra_status!=null){
			return this.extra_status;
		}
		return 0
	},

	// 是否已购买礼包
	setGiftStatus:function(data){
		if(data && Utils.next(data) == null){
			this.gift_status = null;
		}
		if(this.gift_status!=null && this.gift_status == 1)return 1;
		var charge_list = Config.charge_data.data_charge_data;
		var card_list = Config.holiday_war_order_data.data_advance_card_list;
		var period = this.getCurPeriod();
		if(card_list && card_list[period] && card_list[period][1]){
			var charge_id = card_list[period][1].id || null;
			if(charge_id){
				for(var i in data){
					if(charge_id == data[i].id){
						this.gift_status = data[i].status;
					}
				}
			}
		}
	},

	getGiftStatus:function(){
		if(this.gift_status!=null){
			return this.gift_status;
		}
		return 0;
	},

	// 等级奖励展示
	setLevShowData:function(data){
		this.lev_show_data = {};
		for(var i in data){
			this.lev_show_data[data[i].id] = data[i];
		}
		this.setRewardLevRedPoint();
	},

	getLevShowData:function(lev){
		if(this.lev_show_data && this.lev_show_data[lev]){
			return this.lev_show_data[lev];
		}
		return null;
	},

	// 计算等级奖励的红点
	setRewardLevRedPoint:function(){
		var status = false;
		var reward_list = Config.holiday_war_order_data.data_lev_reward_list;
		var cur_lev = this.getCurLev();
		var cur_period = this.getCurPeriod();
		if(this.lev_show_data && reward_list[cur_period]){
			for(var i in reward_list[cur_period]){
				var v = reward_list[cur_period][i];
				if(v.lev <= cur_lev){
					var status1 = false;
					var data = this.getLevShowData(v.lev);
					if(data){
						if(this.getRMBStatus() == 1){
							if(data.rmb_status == 1 && data.status == 1){
								status1 = false;
							}else{
								status1 = true;
							}
						}
					}else{
						if(reward_list[cur_period][v.lev] && reward_list[cur_period][v.lev].reward && reward_list[cur_period][v.lev].reward[1]){
							status1 = true;
						}
					}

					if(status1 == true){
						status = true;
						break;
					}
				}
			}
		}
		this.reward_red_point = status;
		this.setMainTipsStatus(OrderactionConst.OrderActionView.reward_panel,status);
	},

	getRewardLevRedPoint:function(){
		if(this.reward_red_point){
			return this.reward_red_point;
		}
		return false;
	},

	// 任务的
	setInitTaskData:function(data){
		this.initConfig();
		this.init_task_data = {};
		for(var i in data){
			this.init_task_data[data[i].id] = data[i];
		}
		this.setTaskRedPoint();
	},

	getInitTaskData:function(id){
		if(this.init_task_data && this.init_task_data[id]){
			return this.init_task_data[id];
		}
		return null;
	},

	// 任务更新
	updataTeskData:function(data){
		if(data && data.list){
			for(var i in data.list){
				if(this.init_task_data && this.init_task_data[data.list[i].id]){
					this.init_task_data[data.list[i].id] = data.list[i];
				}
			}
		}
		this.setTaskRedPoint();
	},

	// 计算任务的红点
	setTaskRedPoint:function(){
		var status = false;
		if(this.init_task_data){
			for(var i in this.init_task_data){
				if(this.init_task_data[i].finish == 1){
					status = true;
					break;
				}
			}
		}
		this.task_red_point = status;

		var lev = this.getCurLev();
		var rmb_status = this.getRMBStatus();
		var conf = gdata("holiday_war_order_data", "data_constant", "war_order_levmax");
		if(conf){
			if(lev >= conf.val && rmb_status == 1){
				status = false;
			}
		}
		this.setMainTipsStatus(OrderactionConst.OrderActionView.tesk_panel,status);
	},

	getTaskRedPoint:function(){
		if(this.task_red_point){
			return this.task_red_point;
		}
		return false;
	},

	// 主城红点
	setMainTipsStatus:function(id,status){
		var num = 0;
		if(status){
			num = 1;
		}
		var vo = {
			bid: id, 
			num: num
		}
		var main_id = OrderactionConst.OrderActionEntranceID.entrance_id;
	
		MainUIController.getInstance().setFunctionTipsStatus(main_id, vo);
	},

	sortTeskItemList:function(list){
		var tempsort = {
			[0]: 2,  // 0 未完成
			[1]: 1,  // 1 已完成
			[2]: 3,  // 2 已提交
		}
		var sortFunc = function(objA,objB){
			if(objA.status != objB.status){
				if(tempsort[objA.status] && tempsort[objB.status]){
					return tempsort[objA.status] - tempsort[objB.status];
				}else{
					return false;
				}
			}else{
				return objA.goal_id - objB.goal_id;
			}
		}
		list.sort(sortFunc);
	},

});