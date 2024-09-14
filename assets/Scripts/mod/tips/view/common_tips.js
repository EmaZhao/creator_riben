var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")

var CommonTips = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "common_tips")
        this.delay = arguments[0] || 30;
        this.initConfig()
    },

    initConfig: function () {

        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
            var view = res_object;
            this.createRootWnd(view);
        }).bind(this))
    },

    createRootWnd: function (view) {
        this.root_wnd = view;
        this.root_wnd.setAnchorPoint(cc.v2(0.5, 0.5));
        // this.root_wnd.setContentSize(cc.size(SCREEN_WIDTH, display.height))
        this.root_wnd.setContentSize(cc.size(SCREEN_WIDTH, 1280));
        // this.root_wnd.setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5);
        this.root_wnd.setPosition(0, 0);

        ViewManager.getInstance().addToSceneNode(this.root_wnd, SCENE_TAG.msg);


        this.main_nd = this.root_wnd.getChildByName("main");
        this.bg_nd = this.main_nd.getChildByName("bg");
        this.border = this.main_nd.getChildByName("border");
        this.label_rt = this.main_nd.getChildByName("label").getComponent(cc.RichText);

        this.registerEvent()

        if (this.str != null) {
            this.showTips(this.str, this.width, this.font_size);
        }
    },

    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            require("tips_controller").getInstance().closeAllTips();
        }, this)
    },

    setPosition: function (x, y) {
        // this.main_nd.setAnchorPoint(cc.v2(1, 0));
        this.main_nd.setPosition(cc.v2(x, y));
    },

    addToParent: function (parent, zindex) {
        cc.log("common_tips")
    },

    setPos: function (x, y) {
        this.main_nd.setPosition(cc.v2(x, y));
    },

    getBgContentSize: function () {
        if (this.root_wnd) {
            return this.main_nd.getContentSize();
        }
    },

    getScreenBg: function () {
        return this.root_wnd
    },

    addCallBack: function (fun) {
        this.callback = fun;
        if (this.root_wnd) {
            this.callback();
        }
    },

    showTips: function (str, width, font_size) {
        if (this.root_wnd == null) {
            this.str = str;
            this.width = width;
            this.font_size = font_size;
            return
        }
        var font_size = font_size || 6;
        this.recoutTextFieldSize(str, width, font_size);
        var size = this.label_rt.node.getContentSize();
        var size_width = Math.max(80 + size.width, this.bg_nd.getContentSize().width);
        var size_height = Math.max(70 + size.height, this.bg_nd.getContentSize().height);

        this.main_nd.setContentSize(cc.size(size_width, size_height));
        this.bg_nd.setContentSize(cc.size(size_width, size_height));
        this.border.setContentSize(cc.size(this.bg_nd.width + 5, this.bg_nd.height + 5));

        // this.label_rt.node.setPosition(cc.v2(37, size_height - 30));

        if (this.callback) {
            this.callback()
        }
    },

    //从新计算文本的大小
    recoutTextFieldSize: function (str, width, font_size) {
        this.label_rt.maxWidth = width;
        this.label_rt.fontSize = font_size;
        this.label_rt.lineHeight = font_size + 4;
        this.label_rt.string = str;
    },

    setAnchorPoint: function (pos) {
        if (this.root_wnd) {
            this.root_wnd.setAnchorPoint(pos);
        }
    },

    open: function () {
        gcore.Timer.set(function () {
            require("tips_controller").getInstance().closeAllTips();
        }, this.delay * 1000, 1, "close")
    },

    close: function () {
        if (this.root_wnd) {
            this.root_wnd.destroy();
            this.root_wnd = null;
        }
        LoaderManager.getInstance().releasePrefab(this.prefabPath);
        gcore.Timer.del("close")
    }
});