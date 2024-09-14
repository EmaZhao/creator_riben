// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-16 17:49:51
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Hero_library_main_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_library_main_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        this.hero_icon_sp = this.seekChild("hero_icon", cc.Sprite);
        this.camp_icon_sp = this.seekChild("camp_icon", cc.Sprite);
        this.profession_icon_sp = this.seekChild("profession_icon", cc.Sprite);
        this.name_lb = this.seekChild("name", cc.Label);
        this.background_icon_sp = this.seekChild("background", cc.Sprite);

        this.size = this.root_wnd.getContentSize();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.root_wnd, function () {
            if (this.callback) {
                this.callback();
            }
        }.bind(this), 1)
    },

    addCallBack: function (callback) {
        this.callback = callback;
    },

    setData: function (data ,state) {
        this.config = data;
        this.state = state;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.config == null) return
        this.background_icon_sp.node.active = this.state;
        var res_id = PathTool.getBigBg("partnercard_" + this.config.bid, null, "partnercard");
        if (this.record_res_id == null || this.record_res_id != res_id) {
            this.record_res_id = res_id;
            this.loadRes(res_id, function (bg_sf) {
                this.hero_icon_sp.spriteFrame = bg_sf;
            }.bind(this));
        }

        //阵营
        var camp_res = PathTool.getCommonIcomPath(PathTool.getHeroCampRes(this.config.camp_type));
        if (this.record_camp_res == null || this.record_camp_res != camp_res) {
            this.record_camp_res = camp_res;
            this.loadRes(camp_res, function (bg_sf) {
                this.camp_icon_sp.spriteFrame = bg_sf;
            }.bind(this));
        }

        //职业
        var type = this.config.type || 4;
        var res = PathTool.getPartnerTypeIcon(type);
        if (this.record_type_res == null || this.record_type_res != res) {
            this.record_type_res = res;
            this.loadRes(res, function (bg_sf) {
                this.profession_icon_sp.spriteFrame = bg_sf;
            }.bind(this));
        }

        this.name_lb.string = this.config.name;

        this.timer = gcore.Timer.set(function () {
            var icon_size = this.profession_icon_sp.node.getContentSize();
            var name_size = this.name_lb.node.getContentSize();
            var offset = 5;
            var total_width = icon_size.width + offset + name_size.width;
            var x = (this.size.width - total_width) * 0.5;
            this.profession_icon_sp.node.x = -this.size.width / 2 + x + icon_size.width * 0.5;
            this.name_lb.node.x = this.profession_icon_sp.node.x + icon_size.width * 0.5 + name_size.width * 0.5 + offset;
        }.bind(this), 60, 1)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.timer) {
            gcore.Timer.del(this.timer);
            this.timer = null;
        }
    },
})