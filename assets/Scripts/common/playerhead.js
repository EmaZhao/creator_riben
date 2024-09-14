// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      圆形头像
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var PlayerHead = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mainui", "head_item");
    },

    initPanel: function () {
        // 头像部分
        this.container = this.root_wnd.getChildByName("container");
        this.icon = this.container.getChildByName("icon").getComponent(cc.Sprite);

        // 头像框
        this.frame = this.root_wnd.getChildByName("frame").getComponent(cc.Sprite);

        // 等级部分
        this.lev_container = this.root_wnd.getChildByName("lev_container");
        this.lev_container.active = false;
        this.lev = this.lev_container.getChildByName("lev").getComponent(cc.Label);

        this.click_icon = this.root_wnd.getChildByName("click");
        if (this.lev_value != null) {
            this.lev.string = this.lev_value;
            this.lev_container.active = true;
        }
        if (this.head_res) {
            this.loadHeadRes(this.head_res);
        }
        if (this.frame_res != null) {
            this.loadFrameRes(this.frame_res,this.frame_scale);
        }
        if (this.scale_value != null) {
            this.setScale(this.scale_value)
        }
        if (this.grey_bool != null) {
            this.setLockStatus(this.grey_bool);
        }
    },

    registerEvent: function () {
        if (this.call_back) {
            this.click_icon.on(cc.Node.EventType.TOUCH_END, function () {
                this.call_back(this);
            }, this);
        }
    },

    onShow: function () {

    },

    onHide: function () {

    },

    // 点击事件
    addCallBack: function (call_back) {
        this.call_back = call_back;
    },

    // 设置头像资源
    setHeadRes: function (res) {
        if (this.root_wnd) {
            this.loadHeadRes(res);
        } else {
            this.head_res = res;
        }
    },

    // 设置头像框资源
    setFrameRes: function (res,scale) {
        if (this.root_wnd) {
            this.loadFrameRes(res,scale);
        } else {
            this.frame_res = res;
            this.frame_scale = scale;
        }
    },

    // 设置等级显示
    setLev: function (lev) {
        if (this.root_wnd) {
            this.lev.string = lev;
            this.lev_container.active = true;
        } else {
            this.lev_value = lev;
        }
    },

    // 设置锁定状态
    setLockStatus: function (bool) {
        this.grey_bool = bool;
        if (this.root_wnd == null) return
        if (bool) {
            this.icon.setState(cc.Sprite.State.NORMAL);
            this.frame.setState(cc.Sprite.State.NORMAL);
        } else {
            this.icon.setState(cc.Sprite.State.GRAY);
            this.frame.setState(cc.Sprite.State.GRAY);
        }
    },

    // 加载资源,这里可能需要判断一下加载回来的是不是我需要的资源,私有方法 不能外部调用,外部滴啊用请用 setHeadRes
    loadHeadRes: function (res_id) {
        var res_path = PathTool.getHeadRes(res_id);
        this.loadRes(res_path, function (resObject) {
            this.icon.spriteFrame = resObject;
        }.bind(this))
    },

    // 加载资源,这里可能需要判断一下加载回来的是不是我需要的资源,私有方法 不能外部调用,外部滴啊用请用 setFrameRes
    //scale默认比例是大部分需要缩放所以用了100/117，其他情况结合自己界面修改scale值
    loadFrameRes: function (bid,scale) {
        if(scale == null){
            scale = 100/117;
        }
        if(typeof (bid) == "number"){
            var config = Config.avatar_data.data_avatar[bid];
            if (!config) {
                return;
            }

            var res_path = PathTool.getHeadcircle(config.res_id);
            this.loadRes(res_path, function (resObject) {
                this.frame.spriteFrame = resObject;
            }.bind(this))
            this.frame.node.scale = scale;
            if(bid == 1000){
                this.frame.node.y = 0;
            }else{
                this.frame.node.y = 5;
            }
        }else{
            this.loadRes(bid, function (resObject) {
                this.frame.spriteFrame = resObject;
            }.bind(this))
            this.frame.node.scale = scale;
        }
    },

    setScale: function (value) {
        this.scale_value = value;
        if (this.root_wnd)
            this.root_wnd.scale = value;
    },

    //背景框
    showBg:function(res,scale){
        this.setFrameRes(res,scale);
    },

    setSex:function(sex,pos){
        if(sex == null || typeof(sex) != "number")return
        if(sex >= 2)return
        if(this.sex_icon_sp == null){
            this.sex_icon_sp = Utils.createImage(this.root_wnd, null, 0, 0, cc.v2(0,0));
        }
        this.loadRes(PathTool.getUIIconPath("common","common_sex"+sex),function(sp){
            this.sex_icon_sp.spriteFrame = sp;
        }.bind(this))
        if(pos != null && this.sex_icon_sp != null){
            this.sex_icon_sp.node.setPosition(pos);
        }
    },

    onDelete: function () {
        // this.container.off(cc.Node.EventType.TOUCH_END, function () {}, this);
    },

    clearHead: function() {
         this.icon.spriteFrame = null;
    },
});