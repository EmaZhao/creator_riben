// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     二维码分享
// <br/>Create: 2019-04-25 16:44:35
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var WelfareEvent = require("welfare_event");

var Qrcode_shardPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "qrcode_shard_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("welfare_controller").getInstance();
        this.item_list = {};
        this.is_shate = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.shrh_container = this.seekChild("shrh_container");
        this.shrh_container.active = PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK";
        this.main_container.active = PLATFORM_TYPR != "SH_RH" && PLATFORM_TYPR != "SH_SDK";

        this.bg_sp = this.seekChild(this.main_container, "bg", cc.Sprite);
        this.loadRes(PathTool.getIconPath("welfare/welfare_banner", "txt_cn_welfare_bg1"), function (res) {
            this.bg_sp.spriteFrame = res
        }.bind(this))
        this.savePhoto = this.seekChild(this.main_container, "savePhoto");
        this.copyURL = this.seekChild(this.main_container, "copyURL");
        this.textURL_lb = this.seekChild("textURL", cc.Label);
        this.textURL_lb.string = Utils.TI18N("获取链接失败");

        this.erweima_img_sp = this.seekChild("er_wei_ma", cc.Sprite);

        // var apk_data = require("role_controller").getInstance().getApkData();
        // if (apk_data) {
        //     SDK_.download_qrcode_png(apk_data.message.qrcode_url, function (img) {
        //         var spriteFrame = new cc.SpriteFrame();
        //         spriteFrame.setTexture(img);
        //         this.erweima_img_sp.spriteFrame = spriteFrame;
        //         this.erweima_img_sp.node.scale = 260 / this.erweima_img_sp.node.width;
        //         this.qrCodeImg = spriteFrame;
        //     }.bind(this))

        //     this.copyData = apk_data;
        //     if (apk_data.success == true && apk_data.message) {
        //         if (apk_data.message.url) {
        //             this.textURL_lb.string = apk_data.message.url;
        //         }
        //     } else {
        //         this.textURL_lb.string = Utils.TI18N("获取链接失败");
        //     }
        // }

        if (USE_SDK) {
            // SDK.download_qrcode_png(function(qrcod_sf) {
            //     if (qrcod_sf)
            //         this.erweima_img_sp.spriteFrame = spriteFrame;                    
            // }.bind(this))
        }

        //shrh--------------
        this.item_container = this.seekChild(this.shrh_container, "item_container");
        this.bg_sp_2 = this.seekChild(this.shrh_container, "bg_2", cc.Sprite);
        this.loadRes(PathTool.getBigBg("welfare/txt_cn_shrh_share"), function (res) {
            this.bg_sp_2.spriteFrame = res
        }.bind(this))
        this.go_btn = this.seekChild(this.shrh_container, "go_btn");
        this.go_btn_lb = this.seekChild(this.go_btn, "label", cc.Label);
        this.go_btn_lb.string = Utils.TI18N("前往邀请");
        this.go_btn_lo = this.seekChild(this.go_btn, "label", cc.LabelOutline);
        this.go_btn_btn = this.seekChild(this.shrh_container, "go_btn", cc.Button);

        if (PLATFORM_TYPR == "SH_RH" && window.SH_RH_IS_SHARE == true) {
            this.go_btn_lb.string = Utils.TI18N("领取奖励")
        }
        if (this.ctrl.getModel().getShareAwardStatus() == 1) {
            this.go_btn_lb.string = Utils.TI18N("已领取");
            this.go_btn_lo.enabled = false;
            Utils.setGreyButton(this.go_btn_btn)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.savePhoto, function () {
            this.setShardGame();
        }.bind(this), 1)


        Utils.onTouchEnd(this.copyURL, function () {
            if (this.copyData && this.copyData.success == true && this.copyData.meesage && this.copyData.message.url) {
                var copyStr = this.copyData.message.url;
                message(Utils.TI18N("复制链接失败"))
            } else {
                message(Utils.TI18N("复制链接失败"))
            }
        }.bind(this), 1)

        this.go_btn.on("click", function () {
            Utils.playButtonSound(1);
            if (PLATFORM_TYPR == "SH_RH") {//深海融合
                // console.log("调用深海分享--");
                // console.log('当前分享状态==>', window.SH_RH_IS_SHARE)
                if (window.SH_RH_IS_SHARE == true) {
                    if (this.ctrl.getModel().getShareAwardStatus() == 0) {
                        this.ctrl.send16692(0);
                    }
                } else {
                    SDK.share({ apiType: "setShare" });
                }
            }else if(PLATFORM_TYPR == "SH_SDK"){//深海小程序
                this.clickGoBtnBySHWX();
            }
        }.bind(this))

        this.addGlobalEvent(WelfareEvent.Update_get_SHRH_share_award_status, function (status) {
            // meesage(status)
            if (status == 2) {
                this.go_btn_lb.string = Utils.TI18N("领取奖励")
            }
            else if (status == 1) {
                this.go_btn_lb.string = Utils.TI18N("已领取");
                this.go_btn_lo.enabled = false;
                Utils.setGreyButton(this.go_btn_btn)
            }
        }.bind(this))
    },

    clickGoBtnBySHWX:function(){
        if(this.is_shate == true){
            if(this.ctrl.getModel().getShareAwardStatus() == 0){
                this.ctrl.send16692(1);
            }
        }else{
            SDK.goShare();
            if(!this.share_time){
                this.share_time = gcore.Timer.set(function () {
                    this.is_shate = true;
                    this.go_btn_lb.string = Utils.TI18N("领取奖励");
                }.bind(this), 3500, 1)
            } 
        }
    },

    //分享游戏下载和邀请码
    setShardGame: function () {
        if (!this.qrCodeImg) {
            message(Utils.TI18N("二维码正在生成中......"));
            return
        }
        //如果存在不处理
        if (this.poste_picture) return
        var container = require("viewmanager").getInstance().getSceneNode(SCENE_TAG.loading);
        this.poste_picture = Utils.createImage(container, null, 0, 0, cc.v2(0.5, 0.5));
        this.poste_picture.type = cc.Sprite.Type.SIMPLE;
        this.poste_picture.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.poste_picture.node.setContentSize(720, 1280)
        this.poste_picture.node.scale = FIT_SCALE;

        this.layout = new cc.Node();
        this.layout.setParent(this.poste_picture.node);
        this.layout.setPosition(0, 0)

        var role_vo = require("role_controller").getInstance().getRoleVo();
        this.head = new PlayerHead();
        this.head.show();
        this.head.setPosition(-258, -573);
        this.head.setHeadRes(role_vo.face_id);
        this.head.setParent(this.layout);

        var role_name = Utils.createLabel(30, new cc.Color(0xb9, 0xee, 0xff, 0xff), new cc.Color(0x00, 0x00, 0x00, 0xff), -200, -550, Utils.TI18N(role_vo.name), this.layout, 2, cc.v2(0, 0.5))
        var server_name = Utils.createLabel(30, new cc.Color(0xb9, 0xee, 0xff, 0xff), new cc.Color(0x00, 0x00, 0x00, 0xff), 310, -550, Utils.TI18N("服务器: ") + role_vo.srv_id, this.layout, 2, cc.v2(1, 0.5));
        var login_data = require("login_controller").getInstance().getModel().getLoginData();
        if (login_data) {
            server_name.string = Utils.TI18N("服务器：" + login_data.srv_name);
        }

        var shard_text = Utils.createLabel(26, new cc.Color(0xb9, 0xee, 0xff, 0xff), new cc.Color(0x00, 0x00, 0x00, 0xff), -200, -600, Utils.TI18N("我的分享码: "), this.layout, 2, cc.v2(0, 0.5))
        var invite_code = require("invitecode_controller").getInstance().getModel().getInviteCode();
        shard_text.string = cc.js.formatStr(Utils.TI18N("我的分享码: %s"), invite_code);

        this.loadRes(PathTool.getIconPath("welfare/welfare_banner", "txt_cn_welfare_bg2"), function (res) {
            this.poste_picture.spriteFrame = res;

            var logo_spr = Utils.createImage(this.poste_picture.node, null, 0, 500, cc.v2(0.5, 0.5));
            this.loadRes(PathTool.getLogoRes(), function (sp) {
                logo_spr.spriteFrame = sp;
            }.bind(this))
            logo_spr.type = cc.Sprite.Type.SIMPLE;
            logo_spr.sizeMode = cc.Sprite.SizeMode.CUSTOM;

            if (this.time_2) {
                gcore.Timer.del(this.time_2);
                this.time_2 = null;
            }
            this.time_2 = gcore.Timer.set(function () {
                var logo_spr = Utils.createImage(this.poste_picture.node, null, 0, 500, cc.v2(0.5, 0.5));
                this.loadRes(PathTool.getLogoRes(), function (sp) {
                    logo_spr.spriteFrame = sp;
                }.bind(this))
                logo_spr.type = cc.Sprite.Type.SIMPLE;
                logo_spr.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }.bind(this), 100, 1)

            // var erweimabg = Utils.createImage(this.poste_picture.node, null, -120, 335, cc.v2(0.5, 0.5));
            // this.loadRes(PathTool.getIconPath("welfare/welfare_banner", "txt_cn_welfare_bg3"), function (sp) {
            //     erweimabg.spriteFrame = sp;
            // }.bind(this))

            var erweima = Utils.createImage(this.poste_picture.node, null, -145, -145, cc.v2(0.5, 0.5));
            erweima.spriteFrame = this.qrCodeImg;
            erweima.node.scale = 340 / erweima.node.width;

            var name = "game_shard";
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
                }
                if (this.head) {
                    this.head.deleteMe();
                    this.head = null;
                }
            }.bind(this), 1000, 1)

            // }.bind(this));
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.setItemList();
    },

    setItemList: function () {
        if (PLATFORM_TYPR == "SH_RH" || PLATFORM_TYPR == "SH_SDK") {
            var bind_data = this.ctrl.getModel().getShareAward();
            if (bind_data == null) return
            var index = 0;
            for (var i in bind_data) {
                const v = bind_data[i];
                if (!this.item_list[i]) {
                    const item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, 0.7, false, true);
                    item.show();
                    item.setParent(this.item_container);
                    item.setData({ bid: v.bid, num: v.num });
                    item.setPosition(index * 110 - 110, 80);
                    this.item_list[i] = item;
                    index = index + 1;
                }
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.poste_picture) {
            this.poste_picture.node.removeFromParent();
            this.poste_picture = null;
            this.layout = null;
        }
        if (this.head) {
            this.head.deleteMe();
            this.head = null;
        }
        if (this.time_1) {
            gcore.Timer.del(this.time_1);
            this.time_1 = null;
        }
        if (this.time_2) {
            gcore.Timer.del(this.time_2);
            this.time_2 = null;
        }

        if (this.share_time) {
            gcore.Timer.del(this.share_time);
            this.share_time = null;
        }

        this.is_shate = false;

        if (this.item_list) {
            for (var k in this.item_list) {
                this.item_list[k].deleteMe();
                this.item_list[k] = null;
            }
            this.item_list = null;
        }
    },
})