var PathTool = require("pathtool");
var HeroController = require("hero_controller");

var PlotHistoryItem = cc.Class({
	extends: BasePanel,

	ctor() {
		this.prefabPath = PathTool.getPrefabPath("hero", "plotHistory_item");
		this.data = null;
	},

	initPanel() {
		if(window.IS_PC) {
			this.root_wnd.rotation = -90;
		}
		this.headIcon_sp   = this.seekChild("headIcon", cc.Sprite);
		this.voice_btn_nd  = this.seekChild("voice");
		this.label_lb      = this.seekChild("label", cc.Label);
	},

	registerEvent(){
		 Utils.onTouchEnd(this.voice_btn_nd, ()=> {
			if(!this.data) return;
			const heroController = HeroController.getInstance();
			if(window.IS_PLOT_LOCAL) {
				heroController.onPlayPlotHeroVoice(this.data.hero_voice);
			} else {
				heroController.onPlayPlotHeroVoice(heroController.getRemoteRes(this.data.hero_voice));
			}
        }, 1);
	},

	onShow() {
		if(!this.data) return;
		this.label_lb.string = this.data.dialog_txt;
		const head_Path = PathTool.getHeadRes(this.data.hero_id);
		this.loadRes(head_Path, (res)=> {
			this.headIcon_sp.spriteFrame = res;
		});
	},

	setData(data) {
		this.data = data;
	},
	
	getData() {
		return this.data;
	},

	onHide() {
		
	},

	onDelete() {
	}
});

module.exports = PlotHistoryItem;