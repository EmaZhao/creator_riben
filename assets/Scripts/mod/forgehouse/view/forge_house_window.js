// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     锻造主界面
// <br/>Create: 2019-03-29 17:25:15
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ForgeHouseController = require("forgehouse_controller")
var HeroController = require("hero_controller");
var HeroEvent = require("hero_event");

var Forge_houseWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forge_house_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.panel_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("top_container/tab_btn_1/title", this.root_wnd, cc.Label).string = Utils.TI18N("装备锻造");
        Utils.getNodeCompByPath("top_container/tab_btn_2/title", this.root_wnd, cc.Label).string = Utils.TI18N("符文锻造");
        //Utils.getNodeCompByPath("btn_return/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        this.close_btn = this.seekChild("btn_return")
        this.container = this.seekChild("container")
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_64"), function(sp) {
                this.background.getComponent(cc.Sprite).spriteFrame = sp;
            }.bind(this))
            //顶部标签页
        this.top_container = this.seekChild("top_container");
        this.top_tab_list = {};
        for (let index = 0; index < 2; index++) {
            var object = {}
            var new_index = index + 1
            object.btn = this.top_container.getChildByName("tab_btn_" + new_index) //获取主节点
            object.tab_btn = object.btn.getComponent(cc.Button)
            object.tips = object.btn.getChildByName("tips") //红点
            object.index = new_index
            if (new_index == 2) {
                object.tips.active = HeroController.getInstance().getModel().getArtifactLuckyRedStatus()
            }
            this.top_tab_list[new_index] = object;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.close_btn.on(cc.Node.EventType.TOUCH_END, (function(event) {
            ForgeHouseController.getInstance().openForgeHouseView(false)
        }).bind(this))

        //符文祝福红点
        this.addGlobalEvent(HeroEvent.Artifact_Lucky_Red_Event, function() {
            var object = this.top_tab_list[2];
            if (object) {
                object.tips.active = HeroController.getInstance().getModel().getArtifactLuckyRedStatus();
            }
        }, this)

        for (var key in this.top_tab_list) {
            const element = this.top_tab_list[key]
            if (element.btn) {
                element.btn.on(cc.Node.EventType.TOUCH_END, (function() {
                    Utils.playButtonSound(ButtonSound.Tab);
                    this.changeSelectedTab(element.index)
                }).bind(this))
            }
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(index) {
        index = index || 1;
        this.changeSelectedTab(index);
    },

    //切换顶部标签页
    //index:1为装备锻造；2为符文锻造
    changeSelectedTab: function(index) {
        if (this.top_tab_object != null && this.top_tab_object.index == index) return
        if (this.top_tab_object) {
            this.top_tab_object.tab_btn.interactable = false;
        }

        this.top_tab_object = this.top_tab_list[index];
        if (this.top_tab_object) {
            this.top_tab_object.tab_btn.interactable = true;
        }

        if (index == 2) this.top_tab_list[1].tab_btn.interactable = false;

        if (this.cur_panel) {
            this.cur_panel.setVisible(false);
        }
        if (this.panel_list[index] == null) {
            var panel = null;
            if (index == 1) {
                var ForgeEquipPanel = require("forge_equip_panel");
                panel = new ForgeEquipPanel();
            } else if (index == 2) {
                var ForgeArtifactPanel = require("forge_artifact_panel");
                panel = new ForgeArtifactPanel();
            }
            if (panel) {
                panel.show();
                panel.setParent(this.container);
                this.panel_list[index] = panel;
            }
        }
        this.cur_panel = this.panel_list[index];
        this.cur_panel.setVisible(true);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        Utils.playButtonSound(ButtonSound.Close);
        if (this.panel_list) {
            for (var k in this.panel_list) {
                if (this.panel_list[k]) {
                    this.panel_list[k].deleteMe();
                    this.panel_list[k] = null;
                }
            }
            this.panel_list = null;
        }
        this.cur_panel = null;

        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        ForgeHouseController.getInstance().openForgeHouseView(false)
    },
})