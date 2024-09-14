var TipsController = require("tips_controller")
var SkillItem = cc.Class({
	extends: ViewClass,

	ctor: function () {
		this.prefabPath = PathTool.getPrefabPath("hero", "skill_item");
		this.initRootWnd()
		this.data = null;
		this.position = null;
		this.sp_state = null;
		this.visible = true;
		this.is_show_tips = null
		this.bg_status = true;
		this.btn_status  = true;
	},

	initRootWnd: function () {
		if (!this.prefabPath) return;
		LoaderManager.getInstance().loadRes(this.prefabPath, function (root_prefab) {
			this.root_wnd = root_prefab;
			if (this.scale)
				this.setScale(this.scale)
			if (this.parent)
				this.parent.addChild(this.root_wnd);
			if (this.position)
				this.root_wnd.position = this.position;
			this.initWidget();
			this.root_wnd.active = this.visible;
			if (this.data)
				this.setData(this.data);
			if (this.lev_status != null) {
				this.setLeveStatus(this.lev_status)
			}
			if(this.recommondStatus != null){
				this.showRecommondIcon(this.recommondStatus.bool,this.recommondStatus.qian_type)
			}
			if(this.bottomName != null){
				this.showName(this.bottomName.bool,this.bottomName.name,this.bottomName.pos,this.bottomName.fontSize,this.bottomName.is_bg)
			}
			this.showBG(this.bg_status);
		}.bind(this))
	},

	initWidget: function () {
		this.background_sp = this.seekChild("background", cc.Sprite);
		this.skill_icon_sp = this.seekChild("skill_icon", cc.Sprite);
		this.level_bg_sp   = this.seekChild("level_bg", cc.Sprite);
		this.level_lb      = this.seekChild("level", cc.Label);
		this.btn = this.root_wnd.getComponent(cc.Button)
		this.registerEvent()
	},

	setData: function (skill_data) {
		if (!skill_data) {
			if (this.root_wnd){
				// this.root_wnd.active = false;
				this.skill_icon_sp.node.active = false;
			}
		}
		this.data = skill_data;
		if (this.root_wnd){
			this.updateWidget();
			this.spriteUnabled()
			this.buttonEnabled()
		}
	},

	setPosition: function (newPosOrX,y) {
		let x;
		if (y === undefined) {
            x = newPosOrX.x;
            y = newPosOrX.y;
        }else{
			x = newPosOrX;
		}
		let pos = cc.v2(x,y)
		this.position = pos;
		if (this.root_wnd)
			this.root_wnd.position = pos;
	},

	setScale: function (scale) {
		this.scale = scale;
		if (this.root_wnd){
			this.root_wnd.scale = scale;
		}

	},
	setShowTips(bool){
		this.is_show_tips = bool|| false
	},

	updateWidget: function () {

		this.skill_config = gdata("skill_data", "data_get_skill",  this.data)
		if (!this.skill_config) return;

		var skill_icon_path = PathTool.getIconPath("skillicon", this.skill_config.icon);
		this.loadRes(skill_icon_path, function (icon_sf) {
			if(!this.root_wnd || !this.root_wnd.isValid)return
			this.skill_icon_sp.spriteFrame = icon_sf;
		}.bind(this));
		this.skill_icon_sp.node.active = true;
		this.level_lb.string = this.skill_config.level;

		this.upateStatu();
	},
	addCallBack(callback){
		this.callback = callback
	},
	setVisible: function (visible) {
		this.visible = visible;
		if (this.root_wnd)
			this.root_wnd.active = visible;
	},

	// setSpStatus: function (state) {
	// 	this.sp_state = cc.Sprite.State.NORMAL;
	// 	if (!state)
	// 		this.sp_state = cc.Sprite.State.GRAY
	// 	if (this.root_wnd) {
	// 		this.upateStatu();
	// 	}
	// },


	upateStatu: function () {
		if (this.sp_state === null) return;
		this.background_sp.setState(this.sp_state);
		this.skill_icon_sp.setState(this.sp_state);
		this.level_bg_sp.setState(this.sp_state);
		this.sp_state = null;
	},

	setLeveStatus: function (status) {
		this.lev_status = status;
		if (this.root_wnd) {
			this.level_lb.node.active = status;
			this.level_bg_sp.node.active = status;
		}
	},
	//变灰
	showUnEnabled(bool){
		this.is_unabled = bool
	},
	spriteUnabled(){
		if(this.is_unabled){
			this.background_sp.setState(cc.Sprite.State.GRAY);
			this.skill_icon_sp.setState(cc.Sprite.State.GRAY);  
			this.level_bg_sp.setState(cc.Sprite.State.GRAY);
		}else{
			this.background_sp.setState(cc.Sprite.State.NORMAL);
			this.skill_icon_sp.setState(cc.Sprite.State.NORMAL);  
			this.level_bg_sp.setState(cc.Sprite.State.NORMAL);
		}

	},
	registerEvent(){
		if(this.root_wnd){
			this.root_wnd.on("click",function(event){
				if(this.is_show_tips){
					// if (event.type === cc.Node.EventType.TOUCH_END) {
					// 	this.root_wnd.scale = this.scale || 1;     
						if (this.skill_config){
							TipsController.getInstance().showSkillTips(this.skill_config, this.is_unabled || false, false, self.tips_hide_flag)
						}
					// }
				}
				if(this.callback){
					this.callback()
				}
			},this)
		}
	},

	showBG: function(status) {
		this.bg_status = status;
		if (this.root_wnd) {
			if (this.bg_status)  {
				this.background_sp.node.active = true;
			} else {
				this.background_sp.node.active = false;				
			}
		}
	},
	buttonEnabled:function() {
		this.btn.enabled = this.btn_status 
	},
	// --推荐标签
	showRecommondIcon(bool,qian_type){
		var self = this
		this.recommondStatus = {
			bool : bool,
			qian_type : qian_type,
		}
		if(this.root_wnd == null) return;
		if(bool == false && self.recommond_icon_sp == null)  return;
		if(!self.recommond_icon_sp){
			self.recommond_icon_sp = Utils.createImage(self.root_wnd,null,-30,27.5,cc.v2(0.5,0.5),true,10,true)
			self.recommond_lb = Utils.createLabel(18,new cc.Color(255,255,255),new cc.Color(10,15,15),-11.1,12.8,"",self.recommond_icon_sp.node,2, cc.v2(0.5,0.5))
			self.recommond_lb.node.setRotation(-45)
			this.recommond_icon_sp.node.setContentSize(74,72)
		}
		if(bool == true){
			self.recommond_icon_sp.node.active = true;
			qian_type = qian_type || 1
			let str 
			let res 
			if(qian_type == 1){
				str = Utils.TI18N("推荐")
				res = PathTool.getUIIconPath("common","common_30016") //--紫色
				self.recommond_lb.node.getComponent(cc.LabelOutline).color.fromHEX("#5C1B77")  //= new cc.Color(0x5c,0x1b,0x77)
			}else if(qian_type == 2){
				str = Utils.TI18N("已领悟")
				res = PathTool.getUIIconPath("common","common_30013") //--红色
				self.recommond_lb.node.getComponent(cc.LabelOutline).color.fromHEX("#8E2B00")
		// 	}elseif qian_type ==3 then
		// 		str = Utils.TI18N("神器")
		// 		res = PathTool.getUIIconPath("common","common_90015") --位置不同的红色
		// 		self.recommond_icon:setPosition(34,89)
		// 		self.recommond_label:setPosition(29,25)
		// 		self.recommond_label:enableOutline(cc.c4b(0x95,0x0f,0x00,0xff), 2)
		// 	elseif qian_type == 4 then
		// 		str = Utils.TI18N("觉")
		// 		res = PathTool.getUIIconPath("common","common_90015")--位置不同的红色
		// 		self.recommond_icon:setPosition(34,89)
		// 		self.recommond_label:setPosition(29,25)
		// 		self.recommond_label:enableOutline(cc.c4b(0x95,0x0f,0x00,0xff), 2)
			}else if(qian_type == 5){
				str = Utils.TI18N("可领悟")
				res = PathTool.getUIIconPath("common","common_30015") //--蓝色
				self.recommond_lb.node.getComponent(cc.LabelOutline).color.fromHEX("#0055A6")
			}else{
				// --无效类型 自行打印
				self.recommond_icon.active = false;
			}
			this.loadRes(res,function(SpriteFrame){
				this.recommond_icon_sp.spriteFrame = SpriteFrame
			}.bind(this))
			self.recommond_lb.string = str;
		}else{
			self.recommond_icon_sp.node.active = false;     
		}
	},
	//显示下方的名字
	showName(bool,name,pos,fontSize, is_bg){
		this.bottomName = {
			bool:bool,
			name:name,
			pos:pos,
			fontSize:fontSize, 
			is_bg:is_bg
		}
		if(this.root_wnd == null)return
		var self = this;
		if(bool == false && !self.name) return;
		if(!self.name){ 
			if(is_bg && self.name_bg == null){
				let res = PathTool.getUIIconPath("common","common_2028")
				self.name_bg = Utils.createImage(self.root_wnd, null , 0,-75, cc.v2(0.5,0.5), true, 0, true)
				self.name_bg.node.setContentSize(108,30)
				this.loadRes(res,function(SpriteFrame){
					this.name_bg.spriteFrame = SpriteFrame
				}.bind(this))
			}
			fontSize = fontSize || 24
			self.name = Utils.createLabel(fontSize,null,null,0,-75,"",self.root_wnd,1, cc.v2(0.5,0.5))
      self.name.overflow = cc.Label.Overflow.SHRINK;
      self.name.node.width = self.name_bg.node.width;
		}
		name = name || ""
		self.name.string = name;
		self.name.node.active = bool;
		if(pos){ 
			self.name.node.setPosition(pos)
		}
	},
	// --desc:设置选中状态
	setSelected(status){
		var  self = this
		if(self.root_wnd == null || !self.select_bg && status == false) return 

		if(!self.select_bg){ 
			let res= PathTool.getSelectBg()
			self.select_bg = Utils.createImage(self.root_wnd, null , 0,0, cc.v2(0.5,0.5), true,null,true)
			this.loadRes(res,function(SpriteFrame){
				self.select_bg.spriteFrame = SpriteFrame
			}.bind(this))
			self.select_bg.node.setContentSize(self.root_wnd.getContentSize())
		}
		self.select_bg.node.active = status;
	},


});