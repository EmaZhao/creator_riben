// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的 (先知圣殿)
// <br/>Create: 2019-03-22 15:05:34
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SeerpalaceSummonItem = require("seerpalace_summon_Item")
var SeerpalaceController = require("seerpalace_controller")
var BackpackController = require("backpack_controller")
var SeerpalaceConst = require("seerpalace_const")
var Seerpalace_summonPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_summon_panel");
        this.is_playing = false // 是否正在播放召唤特效
        this.summon_list = {}
        this.summon_pos = {}
        this.ctrl = SeerpalaceController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        Utils.getNodeCompByPath("main_container/image_stage/btn_summon/btn_summon_label", this.root_wnd, cc.Label).string = Utils.TI18N("召唤");
        var self = this
        this.npc_sk = this.seekChild("npcAni", sp.Skeleton) //npc动画
        this.ball_effect_sk = this.seekChild("pos_ball").getChildByName("action").getComponent(sp.Skeleton) //水晶球动画
            //-- NPC
        this.handleNPCEffect(true)
            //-- 水晶球（常驻）
        this.handleBallEffect(true)
        for (let i = 1; i < 5; ++i) {
            let pos_node = this.seekChild("main_container").getChildByName("image_stage").getChildByName("pos_node_" + i)
            if (pos_node) {
                Utils.delayRun(pos_node, i * 3 / 60, function() {
                    let summon_icon = self.summon_list[i]
                    if (!summon_icon) {
                        summon_icon = new SeerpalaceSummonItem({
                            parent: self,
                            index: i,
                        })
                        summon_icon.setParent(pos_node);
                        summon_icon.show()
                        self.summon_list[i] = summon_icon
                    }
                })
                self.summon_pos[i] = pos_node
            }
        }
        self.btn_summon_nd = this.seekChild("btn_summon")
        self.btn_summon_lb = this.seekChild("btn_summon_label", cc.Label)
        self.btn_summon_sp = this.seekChild("icon", cc.Sprite)
        let path = PathTool.getIconPath("item", SeerpalaceConst.Good_ZhiHui)
        this.loadRes(path, function(SpriteFrame) {
            this.btn_summon_sp.spriteFrame = SpriteFrame
        }.bind(this))
        this.btn_summon_sp.node.active = false;
        let desk_sp = this.seekChild("desk", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_77"), function(res) {
            desk_sp.spriteFrame = res
        })
    },



    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.btn_summon_nd.on("touchend", this._onClickSummonBtn, this)
        this.ball_effect_sk.setCompleteListener((function() {
            if (this.is_playing == false) return
            this._onSummonAniCallBack()
            this.handleBallEffect()
        }.bind(this)))
        this.npc_sk.setCompleteListener((function() {
            if (this.npc_ani_status == 1) return
            this._onNPCAniCallBack()
        }.bind(this)))
    },

    addToParent(status) {
        status = status || false
        if (status) {
            this.show()
        } else {
            this.hide()
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        this.ball_effect_sk.skeletonData = null;
        this.npc_sk.skeletonData = null;
    },
    handleNPCEffect(status) {
        var self = this
        self.npc_ani_status = 1 // 标识当前npc的动作类型
        var sketon_path = PathTool.getSpinePath("E24110", "action");
        this.loadRes(sketon_path, function(skeleton_data) {
            this.npc_sk.skeletonData = skeleton_data;
            this.npc_sk.setAnimation(0, "action1", true);
        }.bind(this));

    },
    handleBallEffect() {
        var self = this
        var sketon_path = PathTool.getSpinePath("E24111", "action");
        this.loadRes(sketon_path, function(skeleton_data) {
            this.ball_effect_sk.skeletonData = skeleton_data;
            this.ball_effect_sk.setAnimation(0, "action", true);
        }.bind(this));
    },
    // -- 水晶球召唤特效
    handleSummonEffect() {
        var self = this
        if (this.ball_effect_sk) {
            let sketon_path = PathTool.getSpinePath("E24112", "action");
            this.loadRes(sketon_path, function(skeleton_data) {
                this.ball_effect_sk.skeletonData = skeleton_data;
                this.ball_effect_sk.setAnimation(0, "action", false);
            }.bind(this));
        }
    },
    // -- 水晶球召唤特效完毕再请求召唤协议
    _onSummonAniCallBack() {
        let group_id = this.select_card.getSummonGroupId()
        this.ctrl.requestSeerpalaceSummon(group_id)
        this.is_playing = false
    },
    // -- npc的召唤特效播放完再请求召唤协议
    _onNPCAniCallBack() {
        var self = this
        if (self.npc_sk && self.npc_ani_status == 2) {
            this.npc_sk.setAnimation(0, "action1", true);
            self.npc_ani_status = 1
        }
    },
    //-- 点击了卡牌
    _onClickSummonCard(card) {
        var self = this
        if (self.is_playing) return // -- 播放召唤特效中不让切换选择卡牌
        if (self.select_card) {
            self.select_card.setSelectStatus(false)
        }
        if (card) {
            self.select_card = card
            self.select_card.setSelectStatus(true)
        }
        self.updateSummonBtnLabel()
        this.btn_summon_sp.node.active = true;
    },
    updateSummonBtnLabel() {
        var self = this
        if (self.select_card) {
            let summon_cost = self.select_card.getSummonCostItem()
            if (summon_cost) {
                let bid = summon_cost[0][0]
                let num = summon_cost[0][1]
                let item_config = Utils.getItemConfig(bid)
                if (item_config) {
                    this.loadRes(PathTool.getItemRes(bid), function(SpriteFrame) {
                        this.btn_summon_lb.spriteFrame = SpriteFrame;
                    }.bind(this));
                    self.btn_summon_lb.string = num + " " +Utils.TI18N("召唤");
                }
            }
        } else {
            // self.btn_summon_label.setString(TI18N("<div outline=2,#4a2606>召唤</div>"))
        }
    },
    _onClickSummonBtn() {
        Utils.playButtonSound(1)
        var self = this
        if (self.is_playing) return
        if (self.select_card) {
            let summon_cost = self.select_card.getSummonCostItem()
            if (summon_cost) {
                let bid = summon_cost[0][0]
                let num = summon_cost[0][1]
                let have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid)
                    // -- 背包物品足够则先播放召唤特效再请求召唤协议，不足则直接请求协议（弹出物品来源和提示）
                if (have_num >= num && self.npc_sk) {
                    self.npc_ani_status = 2
                    self.is_playing = true
                    this.npc_sk.setAnimation(0, "action2", false);
                    self.handleSummonEffect()
                } else {
                    let group_id = self.select_card.getSummonGroupId()
                    this.ctrl.requestSeerpalaceSummon(group_id)
                }
            }
        } else {
            message(Utils.TI18N("请先选择一种卡牌"))
        }
    },

})
module.exports = Seerpalace_summonPanel;