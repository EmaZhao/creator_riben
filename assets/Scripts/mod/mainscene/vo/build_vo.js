var BuildVo = cc.Class({
	extends: gcore.BaseEvent,

	properties: {
		config: {                      // mainscene_data中的配置数据
			default: {}
		},
		is_loack: false,               // 没有通关指定的剧情副本，则为锁定状态
		activare: [],                  // 开启条件
	    tips_list: {                   // 红点状态，因为一个建筑可能有多个红点状态		
	    	default: {}
	    },
	    tips_status: false,            // 是否有红点
		desc: "",                      // 描述
		in_fight: false,
		fight_status_list: {
			default: {}
		},
		group_id: 0,
	},

	ctor: function() {
	    this.config = arguments[0];           
	    this.is_lock = arguments[1];     
	    this.activate = arguments[2];    
	    this.desc = arguments[3];
	},

	setLockStatus: function(status) {
		if (this.is_lock !== status) {
			this.is_lock = status;
			this.fire(this.Update_self_event, "lock_status");
		}
	},

	// 
	getTipsStatus: function() {
		for(var i in this.tips_list){
			if(this.tips_list[i] == true){
				return true;
			}
		}
		return this.tips_status;
	},

	setTipsStatus: function(data) {
		var need_update = false
		if(data == null){
			data = !this.tips_status;
		}

		if(data instanceof Array){
			for(var i in data){
				var v = data[i];
				if(v.bid != null){
					if(this.tips_list[v.bid] != v.status){
						need_update = true;
						this.tips_list[v.bid] = v.status;
					}
				}
			}
		}else if (typeof(data) == "object") {
			if(data.bid != null){
				if(this.tips_list[data.bid] != data.status){
					need_update = true;
	                this.tips_list[data.bid] = data.status;
				}
			}
	    }else {
	        if (this.tips_status !== data) {
	            need_update = true;
	            this.tips_status = data;
	        }
	    } 
	    if (need_update == true) {
	        this.fire(this.Update_self_event, "tips_status")
	    }
	},

	setFightStatus: function(status_list) {
		// cc.log("vvvvvvvvvvvvvvv");
		// cc.log(status_list);
		if (!status_list) return;

	    var old_status = false;
	    for (var stauts_i in this.fight_status_list) {
	        if (this.fight_status_list[stauts_i]) {
	            old_status = true;
	        }
	    }

	    var cur_status = false;
	    for (var stauts_i in status_list) {
	        if (status_list[stauts_i]) {
	            cur_status = true;
	        }
	    }

	    if (old_status == cur_status) return;
	    this.fight_status_list = status_list;
        this.fire(this.Update_self_event, "fight_status")
	},

	getFightStatus: function() {
		for (var status_i in this.fight_status_list) {
			if (this.fight_status_list[status_i])
				return true;
		}
		return false;
	},

});

BuildVo.prototype.Update_self_event = "Update_self_event";

module.exports = BuildVo;