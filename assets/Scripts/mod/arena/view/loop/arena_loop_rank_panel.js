// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:34:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RandItem = require("arean_loop_rank_item");
var ArenaEvent = require("arena_event");
var CommonScrollView = require("common_scrollview");
var PlayerHead = require("playerhead");
var RoleEvent = require("role_event");

var Arena_loop_rankPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_rank_panel");

        this.ctrl = arguments[0];
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        var RoleController = require("role_controller");
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        Utils.getNodeCompByPath("my_container/my_rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("我的排名");
        Utils.getNodeCompByPath("my_container/duanwei_con/duanwei_title", this.root_wnd, cc.Label).string = Utils.TI18N("段位积分：");

        this.container_nd = this.seekChild("item_container");
        this.role_name_lb = this.seekChild("role_name", cc.Label);
        this.role_power_lb = this.seekChild("role_power", cc.Label);
        this.wish_num_lb = this.seekChild("wish_num", cc.Label);

        this.rank_img_nd = this.seekChild("rank_img");
        this.rank_img_sp = this.seekChild("rank_img", cc.Sprite);
        this.rank_txt_nd = this.seekChild("rank_txt");
        this.rank_txt_ct = this.rank_txt_nd.getComponent("CusRichText");
        this.head_nd = this.seekChild("head");
        this.duanwei_num_bl = this.seekChild("duanwei_num", cc.Label);


        this.role_head = new PlayerHead();
        this.role_head.setParent(this.head_nd);
        this.role_head.show();

        this.initRankList();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateLoopChallengeRank, function(data) {
            if (!data) return;
            this.rank_data = data;
            this.updateRankList();
            this.updateWidgets();
        }.bind(this));

        this.addGlobalEvent(RoleEvent.WorshipOtherRole, function(data) {
            if (data)
                this.updateOtherWorship(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.ctrl.sender20221(); // 请求排行榜数据
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.role_head) {
            this.role_head.deleteMe()
            this.role_head = null;
        }
        if (this.rank_sv) {
            this.rank_sv.deleteMe()
            this.rank_sv = null;
        }
    },

    initRankList: function() {
        var scorll_size = this.container_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: RandItem,
            start_x: 0,
            space_x: 0,
            start_y: 10,
            space_y: 0,
            item_width: 614,
            item_height: 125,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.rank_sv = new CommonScrollView();
        this.rank_sv.createScroll(this.container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0, 0.5));
    },

    updateRankList: function() {
        var rank_list = this.rank_list = this.rank_data.rank_list;
        this.rank_sv.setData(rank_list);
    },

    updateWidgets: function() {
        if (!this.root_wnd) return;
        if (this.rank_data.rank > 0 && this.rank_data.rank <= 3) {
            this.rank_img_nd.active = true;
            this.rank_txt_nd.active = false;
            var icon_path = PathTool.getUIIconPath("common", "common_200" + this.rank_data.rank)
            this.loadRes(icon_path, function(rank_sf) {
                this.rank_img_sp.spriteFrame = rank_sf;
            }.bind(this))
        } else if (this.rank_data.rank > 3) {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = true;
            this.rank_txt_ct.setNum(this.rank_data.rank);
        } else {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = false;
        }

        this.role_name_lb.string = this.role_vo.name;
        this.role_power_lb.string = this.role_vo.power;
        this.wish_num_lb.string = this.rank_data.worship;
        this.duanwei_num_bl.string = this.rank_data.score;

        this.role_head.setHeadRes(this.role_vo.face_id);
        this.role_head.setLev(this.role_vo.lev);
    },

    updateOtherWorship: function(data) {
        var update_index = data.idx - 1;
        var update_item = this.rank_list[update_index];

        update_item.worship += 1;
        update_item.worship_status = 1;
        this.rank_sv.updateItemData(update_index, update_item);
    },

    updatePanelInfo: function() {
        this.updateWidgets();
    },

})