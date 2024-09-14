
window.RedIds = {
	PartnerSummon: 1,
	Endless: 2,
	StoneDungeon: 3,
	Primus:4,
	Heroexpedit:5,
	StarTower:6,
	Hallow:7,
	NewfirstchargeModel:8,

	HeroAll: 21,
	RefuseHero: 22,

	GuildDonate:10,		//公会捐献
	GuildActive:11,		//公会活跃
	GuildBoss:12,		//公会副本
	GuildSkill:13,		//公会技能

	Ladder:101,			//跨服天梯
};

window.RedMgr = cc.Class({
	ctor: function() {
		this.handler_queue = [];

        // this.mainloop_timer = gcore.Timer.set(this.mainloop.bind(this), 1000, -1);		
	},

	addCalHandler: function(handler, id) {
		if (!handler) return;

		if (id) {
			var handler_data = {};
			handler_data.handler = handler;
			handler_data.id = id;

			var had_in_queue = false;
			for (var handler_i in this.handler_queue) {
				if (typeof this.handler_queue[handler_i] == "object") {
					if (this.handler_queue[handler_i].id === id) {
						had_in_queue = true;
						break;
					}
				}
			}

			if (had_in_queue) {
				return;
			} else {
				handler = handler_data;
			}
		}

		this.handler_queue.push(handler);

		if (!this.mainloop_timer)
	        this.mainloop_timer = gcore.Timer.set(this.mainloop.bind(this), 1000, -1);
	},

	mainloop: function() {
		var cur_handler = this.handler_queue.shift();
		if (cur_handler) {
			if (typeof cur_handler == "function") {
				cur_handler();
			} else {
				if (cur_handler = cur_handler.handler) 
					cur_handler();
			}
		}

		if (this.handler_queue.length == 0) {
			if (this.mainloop_timer) {
				gcore.Timer.del(this.mainloop_timer);
				this.mainloop_timer = null;
			}
		}
	},

});

RedMgr.getInstance = function () {
    if (!RedMgr.instance) {
        RedMgr.instance = new RedMgr();
    }
    return RedMgr.instance;
}

module.exports = RedMgr;