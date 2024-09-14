// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-21 10:13:24
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");
var SeerpalaceConst = require("seerpalace_const")
var SeerpalaceController = require("seerpalace_controller")
var BackPackConst = require("backpack_const")
var BackpackEvent = require("backpack_event")
var RoleController = require("role_controller")
var RoleEvent = require("role_event")
var SeerpalaceMainWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_main_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = SeerpalaceController.getInstance();
        this.cur_index = null

        // this.model = SeerpalaceController.getInstance().getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.label_list = {}
        this.role_vo = RoleController.getInstance().getRoleVo()
        this.panel_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        //Utils.getNodeCompByPath("main_container/close_btn/close_btn_label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("main_container/btn_shop/shop_label", this.root_wnd, cc.Label).string = Utils.TI18N("先知商店");
        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("先知圣殿");
        Utils.getNodeCompByPath("main_container/tab_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("英雄转换");

        this.container = this.seekChild("container")
        this.score_bg1_nd = this.seekChild("score_bg_1") //先知水晶
        this.score_bg2_nd = this.seekChild("score_bg_2") //先知精华p
        this.score_bg3_nd = this.seekChild("score_bg_3") //先知结晶
        this.shopBtn_nd = this.seekChild("btn_shop") //商店buttom
        this.close_btn = this.seekChild("close_btn")
        this.background_sp = this.root_wnd.getChildByName("background").getComponent(cc.Sprite)
        this.background_sp.node.scale = this.background_sp.node.scale * FIT_SCALE
        this.btnToggle_tg = [this.seekChild("tab_btn_1", cc.Toggle), this.seekChild("tab_btn_2", cc.Toggle)]
        this.tip_nd = this.seekChild("explain_btn")
        this.tips_lb = this.seekChild("tips_label", cc.Label)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        var self = this
            // -- 道具数量更新
        self.addGlobalEvent(BackpackEvent.ADD_GOODS, function(bag_code, data_list) {
            self.refreshGoodNums(bag_code, data_list)
        }, this)
        self.addGlobalEvent(BackpackEvent.DELETE_GOODS, function(bag_code, data_list) {
            self.refreshGoodNums(bag_code, data_list)
        }, this)
        self.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM, function(bag_code, data_list) {
                self.refreshGoodNums(bag_code, data_list)
            })
            // // -- 积分资产更新
        if (self.role_vo) {
            if (!self.role_assets_event) {
                self.role_assets_event = self.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value) {
                    if (key == "recruithigh_hero" && self.label_list[3]) {
                        self.label_list[3].string = value
                    }
                })
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.tips_lb.string = Utils.TI18N("随机召唤4~5星英雄或其英雄碎片");
        this.updagePropConst()
        this.onClickEvent()
        let path1 = PathTool.getIconPath("item", SeerpalaceConst.Good_ZhiHui)
        this.loadRes(path1, function(SpriteFrame) {
            this.score_bg1_nd.getChildByName("score_image").getComponent(cc.Sprite).spriteFrame = SpriteFrame
        }.bind(this))
        let path2 = PathTool.getIconPath("item", SeerpalaceConst.Good_XianZhi)
        this.loadRes(path2, function(SpriteFrame) {
            this.score_bg2_nd.getChildByName("score_image").getComponent(cc.Sprite).spriteFrame = SpriteFrame
        }.bind(this))
        let path3 = PathTool.getIconPath("item", SeerpalaceConst.Good_JieJing)
        this.loadRes(path3, function(SpriteFrame) {
            this.score_bg3_nd.getChildByName("score_image").getComponent(cc.Sprite).spriteFrame = SpriteFrame
        }.bind(this))
        let index = SeerpalaceConst.Tab_Index.Summon
        this.changeSelectedTab(index)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        var self = this
        for (let i in self.panel_list) {
            self.panel_list[i].deleteMe()
        }
        self.panel_list = null
        if (self.role_vo) {
            if (self.role_assets_event) {
                self.role_vo.unbind(self.role_assets_event)
                self.role_assets_event = null
                self.role_vo = null
            }
        }
        this.ctrl.openSeerpalaceMainWindow(false)
    },
    updagePropConst() {
        let zhiHui = BackpackController.getInstance().getModel().getBackPackItemNumByBid(SeerpalaceConst.Good_ZhiHui);
        let xianZhi = BackpackController.getInstance().getModel().getBackPackItemNumByBid(SeerpalaceConst.Good_XianZhi);
        let jieJin = this.role_vo.recruithigh_hero
        this.score_bg1_nd.getChildByName("score_label").getComponent("cc.Label").string = zhiHui;
        this.score_bg2_nd.getChildByName("score_label").getComponent("cc.Label").string = xianZhi;
        this.score_bg3_nd.getChildByName("score_label").getComponent("cc.Label").string = jieJin;
        this.label_list[1] = this.score_bg1_nd.getChildByName("score_label").getComponent("cc.Label")
        this.label_list[2] = this.score_bg2_nd.getChildByName("score_label").getComponent("cc.Label")
        this.label_list[3] = this.score_bg3_nd.getChildByName("score_label").getComponent("cc.Label")
    },
    onClickEvent() {
        this.tip_nd.on("touchend", function(event) {
            Utils.playButtonSound(3)
            let config
            let pos = event.touch.getLocation();
            if (this.btnToggle_tg[0].isChecked) {
                config = Config.recruit_high_data.data_seerpalace_const.game_rule1
                pos.y -= 820;
            } else {
                config = Config.recruit_high_data.data_seerpalace_const.game_rule2
            }
            require("tips_controller").getInstance().showCommonTips(config.desc, pos)
        }, this)
        this.shopBtn_nd.on("touchend", function(event) {
            Utils.playButtonSound(1)
            this.ctrl.openShop(true)
        }, this)
        this.close_btn.on("touchend", function() {
            Utils.playButtonSound(2)
            this.ctrl.openSeerpalaceMainWindow(false)
        }, this)
        for (let i = 0; i < this.btnToggle_tg.length; ++i) {
            this.btnToggle_tg[i].node.on("touchend", function(event) {
                Utils.playButtonSound(ButtonSound.Tab)
                this.changeSelectedTab(i + 1)
            }, this)
        }
    },
    //切换标签
    changeSelectedTab(index) {
        var self = this
        if (index == this.cur_index) return
        this.cur_index = index
        let bigId
        if (index == SeerpalaceConst.Tab_Index.Summon) {
            self.tips_lb.node.active = true
            bigId = "bigbg_66"
        } else if (index == SeerpalaceConst.Tab_Index.Change) {
            self.tips_lb.node.active = false
            bigId = "bigbg_67"
        }
        if (self.select_panel) {
            self.select_panel.addToParent(false)
            self.select_panel = null
        }
        self.select_panel = self.panel_list[index]
        if (!self.select_panel) {
            if (index == SeerpalaceConst.Tab_Index.Summon) {
                let SummonPanel = require("seerpalace_summon_panel")
                self.select_panel = new SummonPanel()
            } else if (index == SeerpalaceConst.Tab_Index.Change) {
                let ChangePanel = require("seerpalace_change_panel")
                self.select_panel = new ChangePanel()
            }
            if (self.select_panel) {
                self.select_panel.setParent(this.container)
                self.panel_list[index] = self.select_panel
                self.select_panel.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5)
                self.select_panel.addToParent(true)
            }
        }
        if (self.select_panel) {
            self.select_panel.addToParent(true)
        }
        this.loadRes(PathTool.getBigBg(bigId), (function(resObject) {
            this.background_sp.spriteFrame = resObject;
        }).bind(this));

    },
    refreshGoodNums(bag_code, data_list) {
        var self = this
        if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
            for (let i in data_list) {
                let v = data_list[i]
                if (v && v.base_id) {
                    if (v.base_id == SeerpalaceConst.Good_ZhiHui && self.label_list[2]) {
                        let cur_num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(SeerpalaceConst.Good_ZhiHui)
                        self.label_list[1].string = cur_num
                    } else if (v.base_id == SeerpalaceConst.Good_XianZhi && self.label_list[3]) {
                        let cur_num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(SeerpalaceConst.Good_XianZhi)
                        self.label_list[2].string = cur_num
                    }
                }
            }
        }
    }
})
module.exports = SeerpalaceMainWindow;