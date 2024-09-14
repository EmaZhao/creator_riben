// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-30 14:24:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArtifactSKillItem = require("artifact_skill_item");
var HeroController = require("hero_controller");
var CommonScrollView = require("common_scrollview");

var Artifact_skillWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "artifact_skill_window");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.show_type = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.tab_list = {};
        this.ctrl = HeroController.getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("技能预览");
        Utils.getNodeCompByPath("main_container/tab_container/title_1", this.root_wnd, cc.Label).string = Utils.TI18N("低级技能");
        Utils.getNodeCompByPath("main_container/tab_container/title_2", this.root_wnd, cc.Label).string = Utils.TI18N("中级技能");
        Utils.getNodeCompByPath("main_container/tab_container/title_3", this.root_wnd, cc.Label).string = Utils.TI18N("高级技能");

        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");
        this.explain_btn = this.seekChild("explain_btn");
        this.close_btn = this.seekChild("close_btn");

        var tab_container = this.seekChild("tab_container");

        if (this.show_type == 2) {
            this.explain_btn.active = false;
        }
        for (var i = 1; i <= 3; i++) {
            var object = {};
            var tab_btn = this.seekChild(tab_container, "tab_btn_" + i);
            if (tab_btn) {
                var title_lb = this.seekChild(tab_container, "title_" + i, cc.Label);
                var btn = tab_btn.getComponent(cc.Button);
                object.tab_btn = tab_btn;
                object.btn = btn;
                object.title_lb = title_lb;
                object.index = i;
                this.tab_list[i] = object;
            }
        }

        var skill_panel = this.seekChild(this.main_container, "skill_panel");
        var tab_size = skill_panel.getContentSize();
        var setting = {
            item_class: ArtifactSKillItem, // 单元类
            start_x: 0, // 第一个单元的X起点
            space_x: 33, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 12, // y方向的间隔
            item_width: 119, // 单元的尺寸width
            item_height: 149, // 单元的尺寸height
            row: 0, // 行数，作用于水平滚动类型
            col: 4, // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(skill_panel, cc.v2(0, 0), ScrollViewDir.vertical,
            ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5));
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.close_btn, function() {
            this.ctrl.openArtifactSkillWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function() {
            this.ctrl.openArtifactSkillWindow(false)
        }.bind(this), 2)
        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(Config.partner_artifact_data.data_artifact_const.recastskill_rule.desc, pos);
        });
        for (var k in this.tab_list) {
            const object = this.tab_list[k];
            object.tab_btn.on(cc.Node.EventType.TOUCH_END, function() {
                Utils.playButtonSound(1);
                this.changeSelectedTab(object.index);
            }, this)
        }
    },

    changeSelectedTab: function(index) {
        if (this.tab_object && this.tab_object.index == index) return
        if (this.tab_object) {
            this.tab_object.btn.interactable = false;
            this.tab_object.title_lb.node.color = new cc.Color(0xff, 0xff, 0xff)
        }
        this.tab_object = this.tab_list[index];
        if (this.tab_object) {
            this.tab_object.btn.interactable = true;
            this.tab_object.title_lb.node.color = new cc.Color(0xff, 0xff, 0xff)
        }

        var skill_list = Config.partner_artifact_data.data_artifact_skill[index] || {}
        var skill_data = [];
        for (var i in skill_list) {
            var skill_cfg = gdata("skill_data", "data_get_skill", [skill_list[i]]);
            if (skill_cfg) {
                skill_data.push(skill_cfg);
            }
        }
        this.item_scrollview.setData(skill_data);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function() {
        this.changeSelectedTab(1)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        this.ctrl.openArtifactSkillWindow(false)
    },
})