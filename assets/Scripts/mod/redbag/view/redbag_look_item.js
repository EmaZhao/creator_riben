// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-06-27 10:47:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var TimeTool = require("timetool")

var Redbag_lookPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_look_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.size = cc.size(455, 93);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        this.bg_nd = this.seekChild("bg");
        this.me_bg_nd = this.seekChild("me_bg");
        this.me_bg_nd.active = false;

        this.head_icon = new PlayerHead();
        this.head_icon.show();
        this.head_icon.setParent(this.main_panel);
        this.head_icon.setPosition(-180, 0);
        this.head_icon.setScale(0.7);
        this.head_icon.addCallBack(function () {
            var roleVo = RoleController.getInstance().getRoleVo();
            if (roleVo.rid == this.data.rid && roleVo.srv_id == this.data.srv_id)
                return
            require("chat_controller").getInstance().openFriendInfo(this.data)
        }.bind(this))

        this.me_icon_nd = this.seekChild("me_icon");
        this.me_icon_nd.active = false;

        this.role_name_rt = this.seekChild("role_name", cc.RichText);

        this.get_time_lb = this.seekChild("get_time", cc.Label);

        this.money_label_rt = this.seekChild("money_label", cc.RichText);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var vo = this.data;

        this.showFirstIcon(false);
        if (vo.index != null && vo.index % 2 == 1) {
            this.bg_nd.active = true;
        } else {
            this.bg_nd.active = false;
        }
        if (vo.index != null && vo.index == 0) {
            this.showFirstIcon(true);
        }

        this.head_icon.setHeadRes(vo.face_id);
        this.head_icon.setFrameRes(vo.avatar_bid);

        var name = vo.name || "";
        var post_num = vo.post || 3;
        var post_config = Config.guild_data.data_position[post_num];
        if (post_config) {
            var post = post_config.name || "";
            var str = cc.js.formatStr("%s(%s)", name, post);
            this.role_name_rt.string = str;
            this.me_icon_nd.x = this.role_name_rt.node.x + this.role_name_rt.node.width + 10;
        }
        var get_time = TimeTool.getYMDHMS(vo.time || 0);
        this.get_time_lb.string = get_time;
        if (!this.extend_data) return
        var coin = this.extend_data.assets;
        var val = vo.val || 0;
        var item_id = Config.item_data.data_assets_label2id[coin] || "";
        var item_config = Utils.getItemConfig(item_id);
        if (item_config) {
            var res = item_config.icon;
            var str = cc.js.formatStr(Utils.TI18N("%s <img src='%s' />"), val, res);
            this.money_label_rt.string = str;
            this.loadRes(PathTool.getItemRes(item_config.icon), (function (resObject) {
                this.money_label_rt.addSpriteFrame(resObject);
            }).bind(this));
        }

        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo.rid == vo.rid && role_vo.srv_id == vo.srv_id) {
            this.me_icon_nd.active = true;
            this.me_bg_nd.active = true;
        } else {
            this.me_bg_nd.active = false;
            this.me_icon_nd.active = false;
        }
    },

    setExtendData: function (data) {
        if (!data) return
        this.extend_data = data;
    },

    showFirstIcon: function (bool) {
        if (bool == false && !this.first_icon) {
            return
        }
        if (!this.first_icon) {
            var res = PathTool.getUIIconPath("redbag", "txt_cn_redbag_4");
            this.first_icon = Utils.createImage(this.root_wnd, null, -191, 24, cc.v2(0.5, 0.5));
            this.loadRes(res, function (sp) {
                this.first_icon.spriteFrame = sp;
            }.bind(this))
        }
        this.first_icon.node.active = bool;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.first_icon){
            this.first_icon.node.destroy();
            this.first_icon = null;
        }
        if(this.head_icon){
            this.head_icon.deleteMe();
            this.head_icon = null;
        }
    },
})