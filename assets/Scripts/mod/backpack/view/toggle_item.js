var ToggleItem = cc.Class({
	extends: ViewClass,

	ctor: function () {
		this.prefabPath = PathTool.getPrefabPath("backpack", "toggle_item");
		this.initRootWnd()
		this.data = null;
	},

	initRootWnd: function () {
		if (!this.prefabPath) return;
		LoaderManager.getInstance().loadRes(this.prefabPath, function (root_prefab) {
			this.root_wnd = root_prefab;
			if (this.parent)
				this.parent.addChild(this.root_wnd);
			if (this.position)
				this.setPosition(this.position)
			if (this.scale)
				this.root_wnd.scale = this.scale;
			this.initWidget();
			this.root_wnd.active = this.visible;
			if (this.is_select != null) {
				this.setSelected(this.is_select)
			}
		}.bind(this))
	},

	initWidget: function () {
		this.toggle_tg = this.seekChild("toggle", cc.Toggle);
		this.toggle_tg.node.on(cc.Node.EventType.TOUCH_END, function () {
			if (this.call_back) {
				if (this.data) {
					this.call_back(!this.data.select);
					this.data.select = !this.data.select;

				} else {
					this.call_back(this.toggle_tg.isChecked);
				}
			}
		}, this)
	},

	setData: function (data) {
		this.data = data;
		if (this.root_wnd)
			this.updateWidget();
	},

	updateWidget: function () {
		if (this.data == null) return
	},

	setPosition: function (pos) {
		this.position = pos;
		if (this.root_wnd)
			this.root_wnd.setPosition(pos.x - 60, pos.y - 60)
	},

	setScale: function (scale) {
		this.scale = scale;
		if (this.root_wnd)
			this.root_wnd.scale = scale;
	},

	setSelected: function (bool) {
		this.is_select = bool;
		if (this.toggle_tg) {
			Utils.delayRun(this.toggle_tg.node, 1 / 60, function () {
				if (bool) {
					this.toggle_tg.check();
				} else {
					this.toggle_tg.uncheck();
				}
			}.bind(this))
		}
	},

	isSelected: function () {
		return !this.toggle_tg.isChecked
	},

	addClickCallBack: function (func) {
		this.call_back = func;
	},

	setVisible: function (visible) {
		this.visible = visible;
		if (this.root_wnd)
			this.root_wnd.active = visible;
	},

});