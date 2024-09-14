// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-10 11:02:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");

var ArenaLoopChallengeItem = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arean_loop_challenge_item");

        this.ctrl = require("arena_controller").getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("container/challenge_btn/btn_title", this.root_wnd, cc.RichText).string = Utils.TI18N("<outline color=#2B610D width=2>免费挑战</outline>");
        Utils.getNodeCompByPath("container/role_score_0", this.root_wnd, cc.Label).string = Utils.TI18N("积分:");

        this.challenge_btn_nd = this.seekChild("challenge_btn");
        this.role_name_lb = this.seekChild("role_name", cc.Label);
        this.role_score_lb = this.seekChild("role_score", cc.Label);
        this.role_power_lb = this.seekChild("role_power", cc.Label);
        this.head_container_nd = this.seekChild("head_container");

        // btn
        this.icon_title_con_nd = this.seekChild("icon_title_con");
        this.btn_title_nd = this.seekChild("btn_title");
        this.btn_img_title_rt = this.seekChild("btn_img_title", cc.RichText);
        this.icon_title_sp = this.seekChild("icon_title", cc.Sprite);

        this.role_head = new PlayerHead();
        this.role_head.setParent(this.head_container_nd);
        this.role_head.show();

        this.challenge_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickChallengeBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.role_head.addCallBack(function() {
            if (this.role_data != null) {
                if (this.role_data.score == 0) {
                    message(Utils.TI18N("神秘高手不肯透露信息哦!"))
                } else {
                    this.ctrl.requestLoopChallengeRoleInfo(this.role_data.rid, this.role_data.srv_id)
                }
            }
        }.bind(this))
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
        if (this.role_head) {
            this.role_head.deleteMe()
        }
    },

    setExtendData: function(params) {
        this.has_num = params.has_num;
        this.free_num = params.free_num;
    },

    setData: function(data) {
        if (!data) return;
        this.role_data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    // 添加回调方法
    addCallBack: function() {

    },

    updateWidgets: function() {
        // 挑战类型
        if (this.free_num > 0) {
            this.icon_title_con_nd.active = false;
            this.btn_title_nd.active = true;
        } else {
            this.icon_title_con_nd.active = true;
            this.btn_title_nd.active = false;
            if (this.has_num > 0) {
                this.btn_img_title_rt.string = Utils.TI18N("<outline color=#2B610D width=2>1 挑战</outline>");
            } else {
                this.btn_img_title_rt.string = Utils.TI18N("<outline color=#ba3b3b width=2>1 </outline> <outline color=#2B610D width=2>挑战</outline>");
            }
        }

        this.challenge_btn_nd.ui_tag = 1000 + this.role_data.idx;

        if (!this.icon_title_sp.spriteFrame) {
            var item_id = Config.arena_data.data_const.arena_ticketcost.val[0][0];
            var item_config = gdata("item_data", "data_unit1", item_id, false);
            var item_path = PathTool.getIconPath("item", item_config.icon);
            this.loadRes(item_path, function(item_sf) {
                this.icon_title_sp.spriteFrame = item_sf;
            }.bind(this));
        }

        this.role_name_lb.string = this.role_data.name;

        if (this.role_data.power === 0) {
            this.role_power_lb.string = "???";
        } else {
            this.role_power_lb.string = this.role_data.power;
        }

        if (this.role_data.score === 0) {
            this.role_score_lb.string = "???";
        } else {
            this.role_score_lb.string = this.role_data.score;
        }

        this.role_head.setHeadRes(this.role_data.face)
        this.role_head.setLev(this.role_data.lev);

        // this.updatePowerColor();
    },

    onClickChallengeBtn: function() {
        if (this.role_data)
            this.ctrl.sender20203(this.role_data.rid, this.role_data.srv_id);
    },

    updatePowerColor: function() {
        var RoleController = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();

        var _color = this.role_power_lb.node.color;
        var hex = Config.color_data.data_color16[180];
        if (this.role_data.power > (1.2 * role_vo.power)) {
            hex = Config.color_data.data_color16[11];
        }
        _color.fromHEX(hex);
        this.role_power_lb.node.color = _color;
    },

})