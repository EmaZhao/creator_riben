// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-15 19:50:20
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");

var Arena_champion_cur_rankPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_rank_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("duanwei_con/duanwei_title", this.root_wnd, cc.Label).string = Utils.TI18N("选拔赛积分：");
        this.rank_img_nd = this.seekChild("rank_img");
        this.rank_img_sp = this.rank_img_nd.getComponent(cc.Sprite);

        this.rank_txt_nd = this.seekChild("rank_txt");
        this.rank_txt_rt = this.rank_txt_nd.getComponent("CusRichText");

        this.role_name_lb = this.seekChild("role_name", cc.Label);
        this.role_power_lb = this.seekChild("role_power", cc.Label);
        this.worship_num_lb = this.seekChild("num", cc.Label);
        this.head_con_nd = this.seekChild("head_con");
        this.score_num_lb = this.seekChild("score_num", cc.Label);

        this.finger_img_sp = this.seekChild("finger_img", cc.Sprite);
        this.wish_container_nd = this.seekChild("wish_container");
        this.wish_container_btn = this.seekChild("wish_container", cc.Button);
        this.wish_container_sp = this.seekChild("wish_container", cc.Sprite);

        var PlayerHead = require("playerhead");
        this.role_head = new PlayerHead();
        this.role_head.setParent(this.head_con_nd);
        this.role_head.show();

        this.wish_container_nd.on(cc.Node.EventType.TOUCH_END, this.onClickWorshipBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },

    setData: function(data) {
        this.rank_data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        if (!this.rank_data) return;
        var rank_data = this.rank_data
        if (rank_data.rank <= 3) {
            this.rank_img_nd.active = true;
            this.rank_txt_nd.active = false;
            var rank_img_path = PathTool.getUIIconPath("common", cc.js.formatStr("common_300%s", rank_data.rank));
            this.loadRes(rank_img_path, function(rank_sf) {
                this.rank_img_sp.spriteFrame = rank_sf;
            }.bind(this));
        } else {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = true;
            this.rank_txt_rt.setNum(rank_data.rank);
        }

        this.role_name_lb.string = rank_data.name;
        this.role_power_lb.string = rank_data.power;
        this.worship_num_lb.string = rank_data.worship;
        this.score_num_lb.string = rank_data.score;

        this.role_head.setHeadRes(rank_data.face)
        this.role_head.setLev(rank_data.lev);

        // 点赞
        if (this.rank_data.worship_status) {
            this.wish_container_sp.setState(cc.Sprite.State.GRAY);
            this.wish_container_btn.interactable = false;
            this.finger_img_sp.setState(cc.Sprite.State.GRAY)
        } else {
            this.wish_container_btn.interactable = true;
            this.wish_container_sp.setState(cc.Sprite.State.NORMAL);
            this.finger_img_sp.setState(cc.Sprite.State.NORMAL);
        }
    },

    onClickWorshipBtn: function() {
        RoleController.getInstance().sender10316(this.rank_data.rid, this.rank_data.srv_id, this.rank_data.rank);
    },
})