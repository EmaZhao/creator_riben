// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 17:21:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Vip_main_tabPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vip", "vip_tab_btn");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.size = cc.size(155, 130);

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {

        var container = this.seekChild("container");

        this.tips_nd = this.seekChild(container, "tab_tips");
        this.tips_nd.active = false;
        this.red_num_lb = this.seekChild(container, "red_num", cc.Label);
        this.red_num_lb.node.active = false;
        this.select_bg_sp = this.seekChild(container, "select_bg", cc.Sprite);
        this.select_bg_sp.node.active = false;
        this.unselect_bg_sp = this.seekChild(container, "unselect_bg", cc.Sprite);
        this.title_lb = this.seekChild(container, "title", cc.Label);
        this.title_img_sp = this.seekChild(container, "title_img", cc.Sprite);
        this.title_img_sp.node.active = false;

        if(this.status!=null){
            this.setSelect(this.status);
        }
        if(this.red_status != null){
            this.showRedTips(this.red_status,this.num)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.tab_type && this.callback) {
                this.callback(this.tab_type)
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        this.tab_type = this.data.index;
        this.title_lb.string = this.data.label;
        // self:setTouchEnabled(self.data.status)

        var unselect_res, select_res, title_res
        if (this.tab_type == VIPTABCONST.CHARGE) {
            unselect_res = PathTool.getUIIconPath("vip", "vip_tab10");
            select_res = PathTool.getUIIconPath("vip", "vip_tab1");
            title_res = PathTool.getUIIconPath("vip", "txt_cn_vip_tab1");
        } else if (this.tab_type == VIPTABCONST.ACC_CHARGE) {
            unselect_res = PathTool.getUIIconPath("vip", "vip_tab20")
            select_res = PathTool.getUIIconPath("vip", "vip_tab2")
            title_res = PathTool.getUIIconPath("vip", "txt_cn_vip_tab2")
        } else if (this.tab_type == VIPTABCONST.VIP) {
            unselect_res = PathTool.getUIIconPath("vip", "vip_tab30")
            select_res = PathTool.getUIIconPath("vip", "vip_tab3")
            title_res = PathTool.getUIIconPath("vip", "txt_cn_vip_tab3")
        } else if (this.tab_type == VIPTABCONST.DAILY_GIFT) {
            unselect_res = PathTool.getUIIconPath("vip", "vip_tab40")
            select_res = PathTool.getUIIconPath("vip", "vip_tab4")
            title_res = PathTool.getUIIconPath("vip", "txt_cn_vip_tab4")
        } else if (this.tab_type == VIPTABCONST.PRIVILEGE) {
            unselect_res = PathTool.getUIIconPath("vip", "vip_tab50")
            select_res = PathTool.getUIIconPath("vip", "vip_tab5")
            title_res = PathTool.getUIIconPath("vip", "txt_cn_vip_tab5")
        }
        if (unselect_res) {
            this.loadRes(unselect_res, function (sf_obj) {
                this.unselect_bg_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
        if (select_res) {
            this.loadRes(select_res, function (sf_obj) {
                this.select_bg_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
        if (title_res) {
            this.loadRes(title_res, function (sf_obj) {
                this.title_img_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
    },

    setSelect: function (status) {
        this.status = status;
        if(this.root_wnd== null)return
        this.select_bg_sp.node.active = status;
        this.unselect_bg_sp.node.active = !status;
        this.title_img_sp.node.active = status;
        this.title_lb.node.active = !status;
    },

    showRedTips: function (status, num) {
        this.red_status = status;
        this.num = num;
        if(this.root_wnd== null)return
        this.red_tips_status = status;
        this.tips_nd.active = status;
        if (num && num > 0) {
            this.red_num_lb.node.active = true;
            this.red_num_lb.string = num;
        } else {
            this.red_num_lb.node.active = false;
        }
    },

    getRedTipsStatus: function () {
        return this.red_tips_status
    },

    addCallBack:function(callback){
        this.callback = callback;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})