// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     关注公众号
// <br/>Create: {DATE}
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareEvent = require("welfare_event");
var RoleController = require("role_controller")

var SubscriptionWechatPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "subscription_wechat_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.item_list = [];
        this.item_list_2 = [];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        if (PLATFORM_TYPR == "SH_RH" && window.SH_RH_IS_SUBSCRIBE == false) {
            SDK.subscribe({ apiType: 'isSubscribe' });
        }

        this.main_container = this.seekChild("main_container");
        this.shrh_container = this.seekChild("shrh_container");
        // PLATFORM_TYPR = "SH_SDK";
        this.shrh_container.active = PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK";
        this.main_container.active = PLATFORM_TYPR != "SH_RH" && PLATFORM_TYPR != "SH_SDK";

        this.item_container = this.seekChild("item_container")

        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_subscription_wechat","jpg"), function (res) {
            this.bg_sp.spriteFrame = res
        }.bind(this))

        this.code_sprite = this.seekChild("code_sprite", cc.Sprite);
        this.loadRes(PathTool.getIconPath("welfare/welfare_banner", "txt_cn_welfare_bg4"), function (res) {
            this.code_sprite.spriteFrame = res
        }.bind(this))

        this.save_btn = this.seekChild("save_btn");

        //shrh
        this.bg_2 = this.seekChild(this.shrh_container, "bg_2", cc.Sprite);;
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_shrh_subscription","jpg"), function (res) {
            this.bg_2.spriteFrame = res
        }.bind(this))
        this.item_container_2 = this.seekChild(this.shrh_container, "item_container_2");
        this.go_btn = this.seekChild(this.shrh_container, "go_btn");
        this.get_btn = this.seekChild(this.shrh_container, "get_btn");
        this.get_btn_btn = this.seekChild(this.shrh_container, "get_btn", cc.Button);
        this.get_btn_lo = this.seekChild(this.get_btn, "Text_6", cc.LabelOutline);
        this.get_btn_lb = this.seekChild(this.get_btn, "Text_6", cc.Label);
        this.desc  = this.seekChild(this.shrh_container, "txt_2",cc.Label);
        this.desc.string = Utils.TI18N("1.点击下方“前往关注”按钮前往公众号\n2.点击关注并进入公众号\n3.关注获取更多游戏最新活动讯息\n4.关注后即可领取下方奖励");
        this.copy_btn = this.seekChild(this.shrh_container, "copy_btn");
        this.copy_btn_2 = this.seekChild(this.shrh_container, "copy_btn_2");
        this.input = this.shrh_container.getChildByName("editbox").getComponent(cc.EditBox);
        

        if(PLATFORM_TYPR == "SH_SDK"){
            this.go_btn.active = false;
            this.copy_btn.active = this.copy_btn_2.active = this.input.node.active = true;
            this.get_btn.x = 360;
            this.desc.string = Utils.TI18N("1.微信搜索【剑魂之光H5】\n2.可搜索公众号：“jianhun236”\n3.点击【剑魂之光H5】并 关注\n4.点击菜单栏 福利礼包-关注礼包 领取礼包");
        }else if(PLATFORM_TYPR == "SH_RH"){
            if (window.SH_RH_IS_SUBSCRIBE) {
                this.get_btn_lo.enabled = true;
                Utils.setGreyButton(this.get_btn_btn, false);
            } else {
                Utils.setGreyButton(this.get_btn_btn);
                this.get_btn_lo.enabled = false;
            }
        }

       

        if (this.ctrl.getModel().getSubscriptionAwardStatus() == 1) {
            Utils.setGreyButton(this.get_btn_btn);
            this.get_btn_lo.enabled = false;
            this.get_btn_lb.string = Utils.TI18N("已领取");
        }

        if (PLATFORM_TYPR != "SH_RH" && PLATFORM_TYPR != "SH_SDK") {
            this.ctrl.tellServerWechatStatus();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.save_btn, function () {
            this.savePhotoPicture();
        }.bind(this), 1)

        Utils.onTouchEnd(this.go_btn, function () {
            if (PLATFORM_TYPR == "SH_RH") {//深海融合
                // console.log("调用深海关注--");
                SDK.subscribe({ apiType: "askShow" });
                // SDK.subscribe({ apiType: 'isSubscribe' });
            }
        }.bind(this), 1)

        this.get_btn.on("click", function () {
            Utils.playButtonSound(1);
            if(PLATFORM_TYPR == "SH_RH"){
                if(window.SH_RH_IS_SUBSCRIBE){
                    this.ctrl.send16694(0);
                }
            }else if(PLATFORM_TYPR == "SH_SDK"){
                var str = this.input.string;
                str = str.replace('\n', '');
                if(str == ""){
                    message(Utils.TI18N("请输入兑换码"));
                }else{
                    RoleController.getInstance().sender10945(str);
                }
            }
        }.bind(this))

        Utils.onTouchEnd(this.copy_btn, function () {
           if(SDK && SDK.setClipboardData){
               SDK.setClipboardData("剑魂之光H5");
           }
        }.bind(this), 1);

        Utils.onTouchEnd(this.copy_btn_2, function () {
           if(SDK && SDK.setClipboardData){
               SDK.setClipboardData("jianhun236");
           }
        }.bind(this), 1);

        this.addGlobalEvent(WelfareEvent.Update_SHRH_Award_Status, function (status) {
            Utils.setGreyButton(this.get_btn_btn);
            this.get_btn_lo.enabled = false;
            this.get_btn_lb.string = Utils.TI18N("已领取");
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.setItemList()
    },

    //保存图片
    savePhotoPicture: function () {
        if (this.poste_picture) return
        var container = require("viewmanager").getInstance().getSceneNode(SCENE_TAG.loading);
        this.poste_picture = Utils.createImage(container, null, 0, 0, cc.v2(0.5, 0.5));
        this.poste_picture.type = cc.Sprite.Type.SIMPLE;
        this.poste_picture.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.poste_picture.node.setContentSize(720, 1280)
        this.poste_picture.node.scale = FIT_SCALE;

        this.savePhotoText(this.poste_picture.node, false);

        this.loadRes(PathTool.getBigBg("welfare/txt_cn_subscription_wechat_1"), function (res) {
            this.poste_picture.spriteFrame = res;
            if (this.save_layout) {
                this.save_layout.active = true;
            }
            var name = "poste_wechat";
            // SDK.CaptureScreenSaveImg(name,function(bool){
            //     if(bool==true){

            //     }else{
            //         message(Utils.TI18N("保存失败"));
            //     }
            if (this.time_1) {
                gcore.Timer.del(this.time_1);
                this.time_1 = null;
            }
            this.time_1 = gcore.Timer.set(function () {
                if (this.poste_picture) {
                    this.poste_picture.node.removeFromParent();
                    this.poste_picture = null;
                    if (this.item_list_2) {
                        for (var k in this.item_list_2) {
                            if (this.item_list_2[k]) {
                                this.item_list_2[k].deleteMe();
                                this.item_list_2[k] = null;
                            }
                        }
                    }
                }
            }.bind(this), 1000, 1)

            // }.bind(this));
        }.bind(this))
    },

    //截图保存的内容
    savePhotoText: function (node, visible) {
        if (!node) return
        this.save_layout = new cc.Node();
        this.save_layout.setPosition(0, 0);
        this.save_layout.setContentSize(cc.size(100, 100));
        this.save_layout.setParent(node);
        this.save_layout.active = visible;

        var search = Utils.createLabel(24, new cc.Color(0xf7, 0xfd, 0xff, 0xff), new cc.Color(0x14, 0x35, 0x6c, 0xff), -300, 90, Utils.TI18N("微信搜索:"), this.save_layout, 2, cc.v2(0, 0.5))
        var str_wechat = cc.js.formatStr(Utils.TI18N("%s (%s)公众号"), WECHAT_SUBSCRIPTION_NAME, WECHAT_SUBSCRIPTION);
        var wechat_text = Utils.createLabel(24, new cc.Color(0xf7, 0xfd, 0xff, 0xff), new cc.Color(0x14, 0x35, 0x6c, 0xff), -300, 50, str_wechat, this.save_layout, 2, cc.v2(0, 0.5));
        var attent_text = Utils.createLabel(24, new cc.Color(0xf7, 0xfd, 0xff, 0xff), new cc.Color(0x14, 0x35, 0x6c, 0xff), -300, 10, Utils.TI18N("关注点击「福利补给」领取礼包码"), this.save_layout, 2, cc.v2(0, 0.5));
        //二维码图片
        var erweima_bg = Utils.createImage(this.save_layout, null, 0, -340, cc.v2(0.5, 0.5));
        this.loadRes(PathTool.getIconPath("welfare/welfare_banner", "txt_cn_welfare_bg4"), function (res) {
            erweima_bg.spriteFrame = res
        }.bind(this))
        //奖励
        var reward_node = new cc.Node();
        reward_node.setPosition(-215, -160);
        reward_node.setAnchorPoint(0, 0)
        reward_node.setContentSize(cc.size(430, 174));
        reward_node.setParent(node);
        this.setCopyItemList(reward_node);
    },

    setCopyItemList: function (node) {
        var bind_data = this.ctrl.getWechatData();
        if (this.item_list_2 == null) {
            this.item_list_2 = [];
        }
        if (bind_data == null || bind_data == null) return
        var index = 0;
        for (var i in bind_data.items) {
            const v = bind_data.items[i];
            if (!this.item_list_2[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 1, false, true);
                item.show();
                item.setParent(node);
                item.setData({ bid: v.bid, num: v.num });
                item.setPosition(index * 134 + 85, 77);
                this.item_list_2[i] = item;
                index = index + 1;
            }
        }
    },

    //--desc:创建展示物品
    setItemList: function () {
        if (PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK") {
            var bind_data = this.ctrl.getModel().getSubscriptionAward();
            if (bind_data == null) return
            var index = 0;
            for (var i in bind_data) {
                const v = bind_data[i];
                if (!this.item_list[i]) {
                    const item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 0.8, false, true);
                    item.show();
                    item.setParent(this.item_container_2);
                    item.setData({ bid: v.bid, num: v.num });
                    item.setPosition(index * 120 - 120, 80);
                    this.item_list[i] = item;
                    index = index + 1;
                }
            }
        } else {
            var bind_data = this.ctrl.getWechatData();
            if (bind_data == null || bind_data.items == null) return
            var index = 0;
            for (var i in bind_data.items) {
                const v = bind_data.items[i];
                if (!this.item_list[i]) {
                    const item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 1, false, true);
                    item.show();
                    item.setParent(this.item_container);
                    item.setData({ bid: v.bid, num: v.num });
                    item.setPosition(index * 134 + 85, 77);
                    this.item_list[i] = item;
                    index = index + 1;
                }
            }
        }
    },

    setVisibleStatus: function (status) {
        this.setVisible(status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
        if (this.item_list_2) {
            for (var k in this.item_list_2) {
                if (this.item_list_2[k]) {
                    this.item_list_2[k].deleteMe();
                    this.item_list_2[k] = null;
                }
            }
            this.item_list_2 = null;
        }
        if (this.poste_picture) {
            this.poste_picture.node.destroy();
            this.poste_picture = null;
        }
        if (this.time_1) {
            gcore.Timer.del(this.time_1);
            this.time_1 = null;
        }
    },
})