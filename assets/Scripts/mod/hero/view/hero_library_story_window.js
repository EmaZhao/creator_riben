// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 20:34:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");

var Hero_library_storyWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_library_story_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.main_container = this.seekChild("main_container");
        this.attr_name_lb = this.seekChild("attr_name", cc.Label);
        this.content_scrollview = this.seekChild("content_scrollview");
        this.content_scrollview_sv = this.seekChild("content_scrollview", cc.ScrollView);
        this.content_scrollview_size = this.content_scrollview.getContentSize();
        this.content_nd = this.seekChild(this.content_scrollview, "content");
        this.rich_label_rt = this.seekChild(this.content_nd,"rich_label", cc.RichText);
        this.background.scale = FIT_SCALE;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            HeroController.getInstance().openHeroLibraryStoryPanel(false)
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        if (data.name == null && data.content == null) return
        this.attr_name_lb.string = data.name || "";
        this.rich_label_rt.string = data.content || "";

        this.timer = gcore.Timer.set(function () {
            var size = this.rich_label_rt.node.getContentSize();
            if (size.height < this.content_scrollview_size.height) {
                this.content_scrollview_sv.vertical = false;
            }
            var scroll_height = Math.max(this.content_scrollview_size.height, size.height);
            this.content_nd.setContentSize(cc.size(this.content_scrollview_size.width, scroll_height));
        }.bind(this), 60, 1)
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        HeroController.getInstance().openHeroLibraryStoryPanel(false)
        if (this.timer) {
            gcore.Timer.del(this.timer);
            this.timer = null;
        }
    },
})