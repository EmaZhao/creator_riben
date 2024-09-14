// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     签到子项
// <br/>Create: 2019-03-06 15:27:39
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Sign_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "sign_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container_nd = this.seekChild("main_container");
        this.get_nd = this.seekChild(this.main_container_nd, "get");
        this.get_nd.active = false;
        this.get2_nd = this.seekChild(this.main_container_nd, "get2");
        this.get2_nd.active = false;

        var goodcon = this.seekChild("goodcon")
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.show();
        this.goods_item.initConfig(false, 0.9, false, false);
        this.goods_item.setPosition(107 / 2, 107 / 2);
        this.goods_item.setParent(goodcon);

        this.touch_nd = this.seekChild("touch");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.touch_nd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.callback) {
                this.callback(this)
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
        this.touch_nd.name = "sign_btn_" + this.data.day;

        if (this.data == null) return
        var data = this.data;
        //引导需要
        if (data.index) {

        }
        var vo = {};
        vo = Utils.deepCopy(Utils.getItemConfig(data.rewards[0][0]));
        vo.quantity = data.rewards[0][1];
        vo.num = vo.quantity;
        vo.bid = vo.id;
        this.goods_item.setData(vo);
        if (data.status != null) {
            if (data.status == 0) {   //没领
                if (data.now_day == data.day) {   //是今天
                    if (this.effect == null) {
                        this.effect = this.seekChild(this.main_container_nd, "effect", sp.Skeleton);
                        var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(262))
                        this.loadRes(res, function (res_object) {
                            this.effect.skeletonData = res_object;
                            this.effect.setAnimation(0, "action", false)
                        }.bind(this))
                    }
                    this.effect.node.active = true
                } else {
                    if (this.effect) {
                        this.effect.node.active = false;
                    }
                }
                this.root_wnd.resumeSystemEvents(true);
                this.get2_nd.active = false;
                this.get_nd.active = false;
            } else if (data.status == 1) {    //领取普通奖励
                if (this.effect) {
                    this.effect.node.active = false;
                }
                this.get2_nd.active = true;
                this.get_nd.active = false;
                this.root_wnd.resumeSystemEvents(true);
            } else if (data.status == 2) {
                if (this.effect) {
                    this.effect.node.active = false;
                }
                this.get2_nd.active = false;
                this.get_nd.active = true;
                this.root_wnd.pauseSystemEvents(true)
            }
        }

        if (data.is_show!=null) {
            if (data.is_show == 1) {
                this.goods_item.showItemEffect(true, 263, PlayerAction.action_2, true, 1.1);
            } else {
                this.goods_item.showItemEffect(false);
            }
        }

    },

    addCallBack: function (value) {
        if (this.callback == null)
            this.callback = value;
    },

    getData: function () {
        return this.data
    },

    getItemPosition: function () {
        if (this.root_wnd) {
            return this.root_wnd.getPosition();
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.goods_item) {
            this.goods_item.deleteMe();
            this.goods_item = null;
        }
        if (this.effect) {
            this.effect.setToSetupPose();
            this.effect.clearTracks();
        }
    },
})