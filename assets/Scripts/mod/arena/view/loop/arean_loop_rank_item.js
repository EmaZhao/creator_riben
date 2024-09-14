// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:34:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");

var ArenaLoopRankItem = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arean_loop_rank_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.data_avatar = Config.avatar_data.data_avatar;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/role_name", this.root_wnd, cc.Label).string = Utils.TI18N("玩家名字");
        Utils.getNodeCompByPath("container/duanwei_con/duanwei_title", this.root_wnd, cc.Label).string = Utils.TI18N("段位积分：");
        this.rank_img_nd = this.seekChild("rank_img");
        this.rank_img_sp = this.seekChild("rank_img", cc.Sprite);
        this.rank_txt_nd = this.seekChild("rank_txt");
        this.rank_txt_ct = this.rank_txt_nd.getComponent("CusRichText");
        this.loadRes(PathTool.getIconPath("num", "type1", "plist"), function(atlas) {
            this.rank_txt_ct.fontAtlas = atlas
        }.bind(this))

        this.head_nd = this.seekChild("head");
        this.role_name_lb = this.seekChild("role_name", cc.Label);
        this.role_power_lb = this.seekChild("role_power", cc.Label);
        this.wish_num_lb = this.seekChild("wish_num", cc.Label);
        this.duanwei_num_lb = this.seekChild("duanwei_num", cc.Label);

        this.wish_container_sp = this.seekChild("wish_container", cc.Sprite);
        this.finger_sp = this.seekChild("finger", cc.Sprite);
        this.wish_container_btn = this.seekChild("wish_container", cc.Button);
        this.wish_container_nd = this.seekChild("wish_container");

        this.role_head = new PlayerHead();
        this.role_head.setParent(this.head_nd);
        this.role_head.show();

        this.wish_container_nd.on(cc.Node.EventType.TOUCH_END, this.onClickWishBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        if (this.role_data)
            this.updageWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },

    initRankList: function() {

    },

    setExtendData: function() {

    },

    addCallBack: function(click_cb) {
        this.click_cb = click_cb;
    },

    setData: function(data) {
        this.role_data = data;
        if (this.root_wnd)
            this.updageWidgets();
    },

    updageWidgets: function() {
        this.role_name_lb.string = this.role_data.name;
        this.role_power_lb.string = this.role_data.power;
        this.wish_num_lb.string = this.role_data.worship;
        this.duanwei_num_lb.string = this.role_data.score;

        this.role_head.setHeadRes(this.role_data.face)
        this.role_head.setLev(this.role_data.lev);
        // 头像
        if (this.data_avatar) {
            var avatar_cfg = this.data_avatar[this.role_data.avatar_id];
            var res_id = avatar_cfg.res_id || 0;
            var res_path = PathTool.getIconPath("headcircle", "txt_cn_headcircle_" + res_id);
            this.role_head.showBg(res_path);
        }

        if (this.role_data.rank <= 3) {
            this.rank_img_nd.active = true;
            this.rank_txt_nd.active = false;
            var icon_path = PathTool.getUIIconPath("common", "common_200" + this.role_data.rank)
            this.loadRes(icon_path, function(rank_sf) {
                this.rank_img_sp.spriteFrame = rank_sf;
            }.bind(this))
        } else {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = true;
            this.rank_txt_ct.setNum(this.role_data.rank);
        }

        // 点赞
        if (this.role_data.worship_status) {
            this.wish_container_sp.setState(cc.Sprite.State.GRAY);
            this.finger_sp.setState(cc.Sprite.State.GRAY)
            this.wish_container_btn.interactable = false;
        } else {
            this.wish_container_btn.interactable = true;
            this.wish_container_sp.setState(cc.Sprite.State.NORMAL);
            this.finger_sp.setState(cc.Sprite.State.NORMAL);
        }
    },

    onClickWishBtn: function() {
        RoleController.getInstance().sender10316(this.role_data.rid, this.role_data.srv_id, this.role_data.rank);
        // if (this.click_cb)
        //     this.click_cb();
    }
})