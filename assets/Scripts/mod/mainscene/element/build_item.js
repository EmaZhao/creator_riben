var SceneConst = require("scene_const");
var PathTool = require("pathtool")

var BuildItem　= cc.Class({
	extends: BaseClass,

	properties: {
		data: null,
		build_is_lock: null,
		can_click: false,
		isBuild: false,
		config: null,
		build_type: null,
		root_wnd: cc.Node,
		iconSP: cc.Sprite,
		red_state: null,
		red_nd: cc.Node,
	},

	ctor: function() {
		this.data = arguments[0];
		this.type = arguments[1];

		this.createRootWind();

		if (this.type == SceneConst.BuildItemType.build) {
			this.build_type = this.data.config.type;
			this.isBuild = (this.build_type == SceneConst.BuildItemType.build);
			this.config = this.data.config;
			this.createIcon();
		} else if (this.type == SceneConst.BuildItemType.effect) {
			this.createEffect();
		} else if (this.type == SceneConst.BuildItemType.npc) {
			this.createNPC();
		}
	},

	createRootWind: function() {
		this.con_size = cc.v2(83, 80);
		var build_name = "";
		if (this.type == SceneConst.BuildItemType.build) {
			build_name = "guidesign_build_" + this.data.config.bid;
		} else if(this.type == SceneConst.BuildItemType.effect) {
			build_name = "effectType_" + this.data.bid;
		}

		this.root_wnd = new cc.Node(build_name);
		this.root_wnd.setContentSize(83, 80);
		this.root_wnd.setAnchorPoint(0.5, 0);

		var root_x = (typeof this.data.x == "number") ? this.data.x : this.data.config.x;
		var root_y = (typeof this.data.y == "number") ? this.data.y : this.data.config.y;
		this.root_wnd.setPosition(root_x, root_y);
	},

	createIcon: function() {
		// this.iconSP = this.root_wnd.addComponent(cc.Sprite);
		var sp_nd = new cc.Node();
		sp_nd.setAnchorPoint(0.5, 0);
		this.iconSP = sp_nd.addComponent(cc.Sprite);
		this.root_wnd.addChild(sp_nd);

		this.button = this.root_wnd.addComponent(cc.Button);
		this.button.interactable = true;
		this.button.transition = cc.Button.Transition.SCALE;
		this.button.duration = 0.1;
		this.button.zoomScale = 0.9;

		if (this.isBuild) {
			this.createBuild();
		}
		//　红点
		this.red_nd = new cc.Node();
		this.red_nd.position = cc.v2(this.root_wnd.width * 0.3, this.root_wnd.height * 0.8);
		this.root_wnd.addChild(this.red_nd);
		this.red_sp = this.red_nd.addComponent(cc.Sprite);
		var red_res = PathTool.getUIIconPath("centerscene", "scene_0");
		LoaderManager.getInstance().loadRes(red_res, function (red_sf) {
			this.red_sp.spriteFrame = red_sf;
		}.bind(this))
		this.red_nd.active = false;
		this.setTipStatus();
	},

	registerEvent: function() {
		if(this.data && this.isBuild) {
			this.root_wnd.on(cc.Node.EventType.TOUCH_END, function(event) {
				var tochInfo = event.touch;
				var startPos = event.touch.getStartLocation();
				var localPos = event.touch.getLocation();
				var dis = Math.sqrt(Math.pow(startPos.x - localPos.x, 2) + Math.pow(startPos.y - localPos.y, 2));
				if (dis < 40) this.clickBbuildItem();
			}.bind(this));

			this.build_vo_update = this.data.bind(this.data.Update_self_event, function(key){
				if (key == "lock_status") {
					this.setLockStatus();
				} else if (key == "tips_status") {
					this.setTipStatus();
				} else if (key == "fight_status") {
					this.fightStatus();
				}
			}.bind(this));
		}
	},
 
	createBuild: function() {
		var iconName = 	"scene_" + this.config.res;
		var atlasPath = "ui_res/centerscene/" + iconName + ".png";
		LoaderManager.getInstance().loadRes(atlasPath, function (res_object) {
			this.iconSP.spriteFrame = res_object;
		}.bind(this))

		this.setLockStatus();
		this.registerEvent();
	},

	createEffect: function() {
		var sp_node = new cc.Node("");
		sp_node.position = cc.v2(0, this.con_size.y * 0.5);		
		this.root_wnd.addChild(sp_node);
        this.spine = sp_node.addComponent(sp.Skeleton);
        this.spinePath = PathTool.getSpinePath(this.data.res, "action")

        LoaderManager.getInstance().loadRes(this.spinePath, (function (res) {
            this.spine.skeletonData = res;
            this.spine.setAnimation(0, "action", true);
        }).bind(this));
	},

	createNPC: function() {
		var sp_node = new cc.Node("");
		sp_node.setContentSize(cc.v2(90, 90));
		sp_node.position = cc.v2(0, this.con_size.y * 0.5);
		if (this.data.bid !== 102 && this.data.bid !== 152) {
			// sp_node.addComponent(cc.BlockInputEvents);
			sp_node.on(cc.Node.EventType.TOUCH_END, this.onTouchNpc.bind(this), this);
		}
		sp_node.test_res = this.data;
		this.root_wnd.addChild(sp_node);

        this.spine = sp_node.addComponent(sp.Skeleton);
        this.spinePath = PathTool.getSpinePath(this.data.res, "action")
        this.spine.setEndListener(this.animaComplete.bind(this));

        LoaderManager.getInstance().loadRes(this.spinePath, (function (res) {
            this.spine.skeletonData = res;
            this.spine.setAnimation(0, "action1", true);
        }).bind(this));
	},

	onTouchNpc: function(event) {
		// cc.log(event);
		// cc.log("TTTTTTTTTTTTTTTTTTTTTTTTTTT");
	},

	animaComplete: function(tes1, tes2) {
		// cc.log("IIIIIIIIIIIIIIIIIIIII");
		// cc.log(tes1);
		// cc.log(tes2);
	},

	setLockStatus: function() {
		if (this.build_is_lock === null || this.build_is_lock !== this.data.is_lock) {		
			this.build_is_lock = this.data.is_lock;
			if (!this.data.is_lock) {
				this.iconSP.setState(cc.Sprite.State.NORMAL);
				// 解锁的时候设置下红点
			} else {
				this.iconSP.setState(cc.Sprite.State.GRAY);
			}
		}
	},

	clickBbuildItem: function() {
		if (!this.data) return;
		if (this.data.is_lock) {
			message(this.data.desc);
		} else {
			if (this.data.group_id != 0) {

			}
			// message(Utils.TI18N(this.data.config.name + "未开发"));
			var mainSceneController = require("mainscene_controller").getInstance();
			mainSceneController.openBuild(this.data.config.bid);
		}
	},

	setRedPoint: function() {
		if (this.data.is_lock || !this.data) return;
		var tipInfo = this.data.getTipsStatus();
	},

	setTipStatus: function() {
		if (this.data.is_lock || !this.data)  {
			this.red_nd.active = false;
			return;
		}

		var status = this.data.getTipsStatus();
		this.red_nd.active = status;
	},

	deleteMe: function() {
		if (this.type = SceneConst.BuildItemType.effect) {
			this.root_wnd.destroy();
			LoaderManager.getInstance().releaseRes(this.spinePath);
		}
	},
	
	fightStatus: function() {
		var status = this.data.getFightStatus()
		if (status) {
			if (!this.fight_nd) {
				this.initFightEffent();
			} else {
				this.fight_nd.active = true;
			}
		} else {
			if (this.fight_nd)
				this.fight_nd.active = false;
		}
	},

	initFightEffent: function() {
		var fight_nd = this.fight_nd = new cc.Node();
		fight_nd.y = this.root_wnd.height;
		this.root_wnd.addChild(fight_nd);
		this.fight_effect = fight_nd.addComponent(sp.Skeleton);

		var effect_res = PathTool.getEffectRes(186);
		var effect_path = PathTool.getSpinePath(effect_res);
		LoaderManager.getInstance().loadRes(effect_path, function (effect_sd) {
			this.fight_effect.skeletonData = effect_sd;
            this.fight_effect.setAnimation(0, "action", true);
		}.bind(this))
	}

});

module.exports = BuildItem　