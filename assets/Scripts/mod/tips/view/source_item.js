var PartnersSummonItem = cc.Class({
    extends: ViewClass,

    ctor: function() {
    	this.parent = arguments[0];
    	this.bid = arguments[1];
    	this.need_item_list = arguments[2];

    	this.prefabPath = PathTool.getPrefabPath("tips", "source_item");
    	this.createRootWind();
    },

    createRootWind: function() {
	    LoaderManager.getInstance().loadRes(this.prefabPath, function(res_object) {
            this.root_wnd = res_object;
            this.root_wnd.parent = this.parent;
            this.initWidgets();
        }.bind(this))
    },

    initWidgets: function() {
		this.recom_tag_nd  = this.seekChild("recom_tag");
		this.desc_txt_lb   = this.seekChild("desc_txt", cc.Label);
		this.goto_btn_nd   = this.seekChild("goto_btn");
		this.btn_title_lb  = this.seekChild("btn_title", cc.Label);
		this.unlock_txt_nd = this.seekChild("unlock_txt");
		this.unlock_txt_lb = this.seekChild("unlock_txt", cc.Label);

		this.goto_btn_nd.on(cc.Node.EventType.TOUCH_END, this.didClickGotoBtn, this);
		if (this.source_info) this.updagetWidgets();
    },

    setData: function(source_info) {
    	this.source_info = source_info;
    	if (this.root_wnd) this.updagetWidgets();
    },

    updagetWidgets: function() {
			this.data = this.source_info.infon_data;
			this.desc_txt_lb.string = this.data.name;
			
			if(this.source_info[1]!=null){
				if(this.source_info[1] == 0){//不推荐
					this.recom_tag_nd.active = false;
				}else{
					this.recom_tag_nd.active = true;
				}
			}
			this.btn_title_lb.string = Utils.TI18N("前往");
			this.unlock_txt_lb.string = Utils.TI18N("未开启");
			

			if (this.source_info.is_lock) {
				this.goto_btn_nd.active = false;
				this.unlock_txt_nd.active = true;
				this.unlock_txt_lb.string = this.source_info.des;
			} else {
				this.goto_btn_nd.active = true;
				this.unlock_txt_nd.active = false;
			}

			this.root_wnd.y = - this.root_wnd.height * this.source_info.index;
    },

    didClickGotoBtn: function() {
			var BackPackCtrl = require("backpack_controller");
    	if (this.close_callback) {
    		this.close_callback();
    	} else {
    		BackPackCtrl.getInstance().openTipsSource(false);
    	}
			BackPackCtrl.getInstance().gotoItemSources(this.data.evt_type, this.data.extend, this.bid, this.need_item_list);
			
			require("hero_controller").getInstance().openHeroBreakPanel(false);//特殊处理，如果进阶界面还存在，关闭它。
			require("hero_controller").getInstance().openArtifactListWindow(false);//特殊处理，如果符文列表还存在，关闭它。
		},
})