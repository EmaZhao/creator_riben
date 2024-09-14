// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-11 19:42:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var RoleEvent = require("role_event");
var CommonScrollView = require("common_scrollview");
var RankItem = require("arena_champion_rank_item");
var RoleEvent = require("role_event");

var Arena_champion_rankWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_rank_window");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        var RoleController = require("role_controller");
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("排行榜");
        Utils.getNodeCompByPath("container/main_panel/empty_tips/desc", this.root_wnd, cc.Label).string = Utils.TI18N("暂无任何排名");
        Utils.getNodeCompByPath("container/main_panel/my_item/my_rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("我的排名");

        this.items_container_nd = this.seekChild("items_container");
        this.empty_tips_nd = this.seekChild("empty_tips");

        this.rank_img_nd = this.seekChild("rank_img");
        this.rank_img_sp = this.rank_img_nd.getComponent(cc.Sprite);

        this.rank_txt_nd = this.seekChild("rank_txt");
        this.rank_txt_rt = this.rank_txt_nd.getComponent("CusRichText");

        this.role_name_lb = this.seekChild("role_name", cc.Label);
        this.role_power_lb = this.seekChild("role_power", cc.Label);
        this.worship_num_lb = this.seekChild("num", cc.Label);
        this.head_con_nd = this.seekChild("head_con");

        this.close_btn_nd = this.seekChild("close_btn");
        this.mask_bg_nd = this.seekChild("mask_bg");
        this.mask_bg_nd.scale = FIT_SCALE;

        var PlayerHead = require("playerhead");
        this.role_head = new PlayerHead();
        this.role_head.setParent(this.head_con_nd);
        this.role_head.show();

        this.initRankList();

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateChampionRankEvent, function(data) {
            if (data)
                this.updateRankList(data);
        }.bind(this));

        this.addGlobalEvent(RoleEvent.WorshipOtherRole, function(data) {
            if (data)
                this.updateOtherWorship(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(params) {
        this.ctrl.sender20281();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        if (this.activity_sv)
            this.activity_sv.deleteMe();
        this.activity_sv = null;
    },

    initRankList: function() {
        var scorll_size = this.items_container_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: RankItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 630,
            item_height: 140,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.activity_sv = new CommonScrollView();
        this.activity_sv.createScroll(this.items_container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0.5, 0.5));
    },


    updateRankList: function(rank_data) {
        var rank_list = this.rank_list = rank_data.rank_list;
        this.activity_sv.setData(rank_list);
        if (rank_list.length === 0) {
            this.empty_tips_nd.active = true;
        } else {
            this.empty_tips_nd.active = false;
        }

        this.updateMyInfo(rank_data);
    },

    updateMyInfo: function(rank_data) {
        if (!rank_data) return;
        if (rank_data.rank <= 3 && 　rank_data.rank > 0) {
            this.rank_img_nd.active = true;
            this.rank_txt_nd.active = false;
            var rank_img_path = PathTool.getUIIconPath("common", cc.js.formatStr("common_300%s", rank_data.rank));
            this.loadRes(rank_img_path, function(rank_sf) {
                this.rank_img_sp.spriteFrame = rank_sf;
            }.bind(this));
        } else if (rank_data.rank === 0) {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = false;
        } else {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = true;
            this.rank_txt_rt.setNum(rank_data.rank);
        }

        this.role_name_lb.string = this.role_vo.name;
        this.role_power_lb.string = this.role_vo.power;
        this.worship_num_lb.string = rank_data.worship;
        // this.score_num_lb.string = rank_data.score;

        this.role_head.setHeadRes(this.role_vo.face_id)
        this.role_head.setLev(this.role_vo.lev);
    },

    updateOtherWorship: function(data) {
        var update_index = data.idx - 1;
        var update_item = this.rank_list[update_index];

        update_item.worship += 1;
        update_item.worship_status = 1;
        this.activity_sv.updateItemData(update_index, update_item);
    },

    onClickCloseBtn: function() {
        this.ctrl.openArenaChampionRankWindow(false);
    },
})