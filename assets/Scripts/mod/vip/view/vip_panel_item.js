// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 16:04:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");

var Vip_panel_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_panel_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.role_vo = require("role_controller").getInstance().getRoleVo();
        this.ctrl = VipController.getInstance();
        this.select_index = null;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container_nd = this.seekChild("container");
        this.text_vip_lb = this.seekChild(this.container_nd, "VIP", cc.Label);
        this.text_reward_lb = this.seekChild(this.container_nd, "text_reward", cc.Label);

        this.normal_nd = this.seekChild(this.container_nd, "normal");
        this.select_nd = this.seekChild(this.container_nd, "select");
        this.select_nd.active = false;

        this.red_point_nd = this.seekChild(this.container_nd, "red_point");
        this.red_point_nd.active = false;

        this.select_index = this.role_vo.vip_lev;

        if(this.data){
            if (this.role_vo.vip_lev == this.data.lev) {
                this.setSelect(true);
                this.setNormal(false);
                this.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(24, 65, 32, 255))
            } else {
                this.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(247, 216, 94, 255))
            }
    
            var status = this.ctrl.getPrivilegeRedpoint(this.data.lev + 1);
            if (status == true) {
                status = true;
            } else {
                status = false
            }
            var isBuy = this.ctrl.getModel().checkGiftList(this.data.lev);
            if (this.data.lev == this.role_vo.vip_lev || isBuy == true) {
                status = false
            }
            this.setVisibleRedStatus(status);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.callback) {
                this.callback(this);
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        
        if (this.select_index != null) {
            if (this.select_index == this.data.lev) {
                this.setSelect(true);
                this.setNormal(false);
                this.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(24, 65, 32, 255))
            } else {
                this.setSelect(false);
                this.setNormal(true);
                this.setTextColor(new cc.Color(255, 255, 255, 255), new cc.Color(247, 216, 94, 255))
            }
        }
        this.text_vip_lb.string = "VIP" + data.lev;
        if (data.desc) {
            this.text_reward_lb.string = data.desc;
        }else{
            this.text_reward_lb.string = "";
        }
    },

    setNormal: function (_bool) {
        this.normal_nd.active = _bool;
    },

    setSelect: function (_bool) {
        this.select_nd.active = _bool;
    },

    setTextColor: function (color1, color2) {
        this.text_vip_lb.node.color = color1;
        this.text_reward_lb.node.color = color2;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    addCallBack: function (value) {
        this.callback = value;
    },

    getData: function () {
        return this.data
    },

    setVisibleRedStatus: function (status) {
        this.red_point_nd.active = status;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})