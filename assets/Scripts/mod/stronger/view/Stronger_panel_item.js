var StrongerController = require("stronger_controller")
var StrongerPanelItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stronger", "stronger_panel_item");
        this.ctrl = StrongerController.getInstance()
    },
    initConfig:function(){
    },
    initPanel(){
        var self = this
        self.name_lb = this.seekChild("name",cc.Label)
        self.desc_lb = this.seekChild("desc_label",cc.Label)
        self.goods_icon_sp = this.seekChild("goods_icon",cc.Sprite)
    
        self.loadingbar = this.seekChild("loadingbar")
        self.loadingbar_exp_lb = this.seekChild("loadingbar_exp",cc.Label)
        
        self.go_btn = this.seekChild("go_btn")
        this.seekChild("label", cc.Label).string = Utils.TI18N("前往")
        this.seekChild("score_title", cc.Label).string = Utils.TI18N("评分/本服最高")
        this.loading_bg_pb = this.seekChild("loading_bg",cc.ProgressBar)
        if (this.data) {
            this.setData(this.data);
        }
    },
    registerEvent(){
        this.go_btn.on('click',this._onClickGoBtn,this)
    },
    _onClickGoBtn(){
        Utils.playButtonSound(1)
        if (this.data && this.data.evt_type){ 
            this.ctrl.clickCallBack(this.data.evt_type)
        }
    },
    setData( data ){
        var self = this
        this.data = data
        if(!this.root_wnd) return
        if (data) {
            self.go_btn.name = "go_btn_" + this.data.id;
            
            // -- 引导需要
            if (data._index){
                // self.go_btn:setName("go_btn_" .. data._index)
            }

            self.data = data
            self.name_lb.string = data.name
            self.desc_lb.string = data.desc
            let percent = data.score_val/data.max_val
            // self.loadingbar:setPercent(percent)
            this.loading_bg_pb.progress = percent
            self.loadingbar_exp_lb.string =data.score_val + "/" + data.max_val

            let res = PathTool.getIconPath("strongericon","stronger_"+data.icon)
            this.loadRes(res, function(sf_obj){
                this.goods_icon_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
    },
})
module.exports = StrongerPanelItem;