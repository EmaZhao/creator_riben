//---------------------------@ item
var SeerpalaceController = require("seerpalace_controller")
var SeerpalaceConst = require("seerpalace_const")
var SeerpalaceSummonItem = cc.Class({
    extends: BasePanel,

    ctor:function(){
        var self = this
        this.ctrl = SeerpalaceController.getInstance();
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_summon_item");
        self._is_select = false //-- 是否选中了
        let data = arguments[0]
        this._clickCallBack = data.parent
        this.index = data.index
        // self.configUI()
    },
    initConfig:function(){
    
       
    },
    initPanel(){
        var self = this
        self.effect_node = this.seekChild("effect_node") 
        self.summon_layer = this.seekChild("summon_layer")
        self.check_layer = this.seekChild("check_layer")
        if(this.index){
            this.setIndex()
        }
    },
    setIndex(  ){
        let index = this.index
        let self = this
        let group_id = SeerpalaceConst.Index_To_GroupId[index]
        let config = Config.recruit_high_data.data_seerpalace_data[group_id]
        if (config && config.item_once) {
            self.summon_cost = config.item_once // 召唤所需道具id和数量
            self.group_id = group_id
            let effect_id = SeerpalaceConst.Book_EffectId[group_id]
            let effect_pos = SeerpalaceConst.Effect_Pos[group_id]
            if (effect_id && effect_pos && effect_id != 0) {
                self.handleCardEffect(true, effect_id, effect_pos)
            }
        }

        // 引导需要
        self.summon_layer.name = "guide_card_" + index;
    },

    // 获取召唤所需道具id和数量
    getSummonCostItem(  ){
        return this.summon_cost
    },

    // 获取先知殿配置的组id
    getSummonGroupId(  ){
        return this.group_id
    },

    // -- 卡牌特效
    handleCardEffect( status, effect_id, effect_pos ){
        var self = this
        if (status == false) {
            if (self.card_effect) {
                this.card_effect.skeletonData = null
                self.card_effect.clearTracks()
                self.card_effect.removeFromParent()
                self.card_effect = null
            }
        }else{
            if (self.effect_node && !self.card_effect) {
                let effect = new cc.Node();
                effect.setAnchorPoint(0.5, 0.5);
                effect.addComponent(sp.Skeleton);
                self.effect_node.addChild(effect)
                self.card_effect = effect.getComponent(sp.Skeleton)
                let effectPath = PathTool.getSpinePath(Config.effect_data.data_effect_info[effect_id],"action")
                this.loadRes(effectPath, function (res_object) {
                    this.card_effect.skeletonData = res_object;
                    this.card_effect.setAnimation(0, "action1", true)
                }.bind(this))
                // 设置位置
                self.effect_node.setPosition(effect_pos.x, effect_pos.y);
            }
        }
    },

    registerEvent(  ){
        this.check_layer.on("touchend",this._onClickCheckLayer,this)
        this.summon_layer.on("touchend",this._onClickSummonLayer,this)

        // "guide_card_"
    },

    // -- 点击查看
    _onClickCheckLayer(  ){
        Utils.playButtonSound(1)
        var self = this
        if (self.index){
            this.ctrl.openSeerpalacePreviewWindow(true, self.index)
        }  
    },

    // -- 点击选中
    _onClickSummonLayer(  ){
        Utils.playButtonSound(1)
        var self= this
        if(self._is_select == false) {
            if (self._clickCallBack) {
                self._clickCallBack._onClickSummonCard(self)
            }  
        }
    },

    setSelectStatus( status ){
        var self = this
        if (status == true){
            // self.summon_layer.y = 30
            self.check_layer.y = -70
            self.card_effect.setAnimation(0, "action2", true)
            self.card_effect.setToSetupPose()
        }else{
            // self.summon_layer.y = -100
            self.check_layer.y = -100
            self.card_effect.setAnimation(0, "action1", true)
            self.card_effect.setToSetupPose()
        }
        self._is_select = status
    },

    // function SeerpalaceSummonItem:DeleteMe(  )
    //     self:handleCardEffect(false)
    //     self.container:stopAllActions()
    //     self:removeAllChildren()
    //     self:removeFromParent()
    // end
    
})
module.exports = SeerpalaceSummonItem;