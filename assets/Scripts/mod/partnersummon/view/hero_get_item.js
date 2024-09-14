var PartnersSummonItem = cc.Class({
    extends: ViewClass,

    properties: {
    	bid_info: null,
    	index: null,
    	finish_cb: null,
    },

    ctor: function () {
    	this.bid_info = arguments[0];
    	this.index = arguments[1];
    	this.finish_cb = arguments[2];
    	this.prefabPath = PathTool.getPrefabPath("partnersummon", "hero_get_item");
    	this.initConfig();
    	this.initWindRoot();
    },

    initConfig: function() {
    	if (!this.bid_info) return;
    	this.item_config = Utils.getItemConfig(this.bid_info.base_id);
        // this.par_star_config = gdata("partner_data", "data_partner_star", bid_info.partner_bid.toString() + "_" + bid_info.init_star.toString()); 
    },

    initWindRoot: function() {
        LoaderManager.getInstance().loadRes(this.prefabPath, function(res_object) {
            this.root_wnd = res_object;
            if (this.finish_cb) this.finish_cb(this.index, this);
            this.initWidgets();
        }.bind(this))
    },

    initWidgets: function() {
		this.star_item_nd       = this.seekChild("star_item");
		this.stars_container_nd = this.seekChild("stars_container");
		this.head_icon_sp       = this.seekChild("head_icon", cc.Sprite);
		this.comp_type_sp       = this.seekChild("comp_type", cc.Sprite);
		this.background_sp      = this.seekChild("background", cc.Sprite);
        this.effect_sk          = this.seekChild("effect", sp.Skeleton);
		this.updateWidgets();
    },

    updateWidgets: function() {
        if (!this.item_config) return;
        if(this.root_wnd == null) return
    	// 星星
    	for (var star_i = 0; star_i < this.item_config.eqm_jie - 1; star_i++) {
    		var star_item_nd = cc.instantiate(this.star_item_nd);
    		this.stars_container_nd.addChild(star_item_nd);
    	}

    	var icon_path = PathTool.getItemRes(this.item_config.icon);
    	this.loadRes(icon_path, function(icon_sf) {
            if(this.head_icon_sp)
    		this.head_icon_sp.spriteFrame = icon_sf;
    	}.bind(this));

        var camp_path = PathTool.getHeroCampRes(this.item_config.lev)
        var common_res_path = PathTool.getCommonIcomPath(camp_path);
        this.loadRes(common_res_path, function(sf_obj){
            if(this.comp_type_sp)
            this.comp_type_sp.spriteFrame = sf_obj;      // 阵容
        }.bind(this))

        var quality_sf_n = PathTool.getItemQualityBG(this.item_config.quality);
        var common_res_path = PathTool.getCommonIcomPath(quality_sf_n);
        this.loadRes(common_res_path, function(sf_obj){
            if(this.background_sp)
    		this.background_sp.spriteFrame = sf_obj;
        }.bind(this))
    },

    playShowAction: function(index) {
        this.root_wnd.scale = 1.2;
        this.root_wnd.opacity =0 ;
        var fade_act = cc.fadeIn(0.1);
        var scale_act = cc.scaleTo(0.1, 1);
        var delay_act = cc.delayTime(0.1 * index || 0);     
        var fun_act = cc.callFunc(function (){
            // if (this.item_config.is_effect)
                this.showEffect();
        }.bind(this))
        var show_act = cc.sequence(delay_act, fun_act, cc.spawn(fade_act, scale_act));
        this.root_wnd.runAction(show_act);
    },

    showEffect: function() {
        var effect_res = PathTool.getEffectRes(156);
        var spine_path = PathTool.getSpinePath(effect_res);
        this.loadRes(spine_path, function(effect_sd) {
            if(!this.effect_sk)return
            this.effect_sk.skeletonData = effect_sd;
            this.effect_sk.setAnimation(0, "action3", false);
            if(this.item_config && this.item_config.is_effect && this.item_config.is_effect == 1){
                let action = PlayerAction.action_2
                if(this.item_config.quality >= 4){
                    action = PlayerAction.action_1
                }
                this.startUpdate(1, function () {
                    if(!this.effect_sk)return
                    this.effect_sk.setAnimation(0, action, true);
                }.bind(this),200)
            }
        }.bind(this));
    },
    deleteMe:function(){
        if(this.effect_sk){
            this.effect_sk.skeletonData = null;
            this.effect_sk.setToSetupPose();
            this.effect_sk.clearTracks();
            this.effect_sk = null;
        }
        this._super()
    },
})