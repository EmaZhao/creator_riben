var ArenaEvent = require("arena_loop_challenge_vo");

var ChallengeVo = cc.Class({
	extends: gcore.BaseEvent,

	ctor: function() {
	    this.idx        = 0;           // 编号
	    this.rid        = 0;           // 角色id
	    this.srv_id     = "";          // 角色服务器id
	    this.name       = "";          // 角色名字
	    this.lev        = 0;           // 等级
	    this.sex        = 0;           // 性别
	    this.face       = 0;           // 头像
	    this.power      = 0;           // 战力
	    this.score      = 0;           // 积分
	    this.get_score  = 0;           // 胜利获得积分
	    this.status     = 0;           // 状态（0：未挑战 1：已挑战）		
	},

	updatetAttributeData: function(data) {
		if (!data) return;
		for (var attr_i in data) {
			this.setAttribute(attr_i, data[attr_i]);
		}
	},

	setAttribute: function(key, value) {
		if (this[key] !== value) {
			this[key] = value;
			// this.fire(ArenaEvent.UpdateLoopChallengeListItem, key, value);
		}
	},

})