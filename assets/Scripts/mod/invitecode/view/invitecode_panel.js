// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-27 17:53:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var InviteCodeEvent = require("invitecode_event");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");

var InvitecodePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "invitecode_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("invitecode_controller").getInstance();
        this.cur_index = null;
        this.view_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");

        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("action/action_invitecode"), function (res) {
            this.bg_sp.spriteFrame = res
        }.bind(this))

        this.btn_tips_nd = this.seekChild("btn_tips");
        this.btn_copy_nd = this.seekChild("btn_copy");
        this.btn_shard_nd = this.seekChild("btn_shard");
        var Image_17 = this.seekChild("Image_17");
        this.invite_code_lb = this.seekChild(Image_17, "invite_code", cc.Label);
        this.invite_code_lb.string = "";
        this.text_invitecode_lb = this.seekChild("text_invitecode", cc.Label);
        this.text_invitecode_lb.string = "";
        this.tab_tilte = {};
        var title_text = [Utils.TI18N("我的推荐码"), Utils.TI18N("已推荐好友")]
        for (var i = 1; i <= 2; i++) {
            var tab = {};
            tab.btn = this.seekChild("tab_" + i);
            tab.normal = this.seekChild(tab.btn, "normal");
            tab.select = this.seekChild(tab.btn, "select");
            tab.title = this.seekChild(tab.btn, "title", cc.Label);
            tab.select.active = false;
            tab.title.node.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff);
            tab.title.string = title_text[i - 1];
            tab.index = i;
            tab.redpoint = this.seekChild(tab.btn, "redpoint");
            tab.redpoint.active = false;
            this.tab_tilte[i] = tab;
        }
        this.tabChangeView(1);

        //
        this.edit_box = this.seekChild("edit",cc.EditBox);

        Utils.getNodeCompByPath("main_container/btn_copy/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("复制");
        Utils.getNodeCompByPath("main_container/btn_shard/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("分享");
        Utils.getNodeCompByPath("main_container/text_title", this.root_wnd, cc.Label).string = Utils.TI18N("我的推荐码：");
        //Utils.getNodeCompByPath("main_container/edit/PLACEHOLDER_LABEL", this.root_wnd, cc.Label).string = Utils.TI18N("获取邀请码失败");

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(InviteCodeEvent.Get_InviteCode_Event, function () {
            this.getInviteCodeData();
        }, this)
        this.addGlobalEvent(InviteCodeEvent.InviteCode_BindRole_Event, function () {
            this.getAlreadyFriendNum();
        }, this)
        this.addGlobalEvent(InviteCodeEvent.InviteCode_BindRole_Updata_Event, function () {
            this.getAlreadyFriendNum();
        }, this)
        this.btn_tips_nd.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            var desc = StringUtil.parse(Config.invite_code_data.data_const.tips.desc)
            require("tips_controller").getInstance().showCommonTips(desc, pos, null, null, 500);
        });

        Utils.onTouchEnd(this.btn_copy_nd, function () {
            this.copyCode();
        }.bind(this), 1)
        Utils.onTouchEnd(this.btn_shard_nd, function () {
            this.setShardGame();
        }.bind(this), 1)
        for (var i in this.tab_tilte) {
            const v = this.tab_tilte[i];
            Utils.onTouchEnd(v.btn, function () {
                this.tabChangeView(v.index);
            }.bind(this), 1)
        }

        this.addGlobalEvent(InviteCodeEvent.InviteCode_My_Event, function () {
            let status = require("invitecode_controller").getInstance().getModel().inviteRedPoint()
            if(this.tab_tilte[1] && this.tab_tilte[1].redpoint){
                this.tab_tilte[1].redpoint.active = status
            }
        }, this)
        this.edit_box.node.on("editing-did-ended",function(edit_box){
            this.edit_box.string = this.invite_code;
        },this)
        this.edit_box.node.on("text-changed",function(edit_box){
            this.edit_box.string = this.invite_code;
        },this)
    },

    tabChangeView: function (index) {
        index = index || 1;
        if (this.cur_index == index) return
        if (this.cur_tab != null) {
            this.cur_tab.select.active = false;
            this.cur_tab.title.node.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff);
        }
        this.cur_index = index;
        this.cur_tab = this.tab_tilte[this.cur_index];
        if (this.cur_tab != null) {
            this.cur_tab.select.active = true;
            this.cur_tab.title.node.color = new cc.Color(0xff, 0xed, 0xd6, 0xff);
        }
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus) {
                this.pre_panel.setVisibleStatus(false);
            }
        }
        this.pre_panel = this.createSubPanel(this.cur_index);
        if (this.pre_panel != null) {
            if (this.pre_panel.setVisibleStatus) {
                this.pre_panel.setVisibleStatus(true);
            }
        }
    },

    createSubPanel: function (index) {
        var panel = this.view_list[index];
        if (panel == null) {
            if (index == 1) { //自己的邀请码
                panel = Utils.createClass("invitecode_my_panel");
            } else if (index == 2) {  //已邀请好友
                panel = Utils.createClass("invitecode_friend_panel");
            }
            panel.setParent(this.main_container);
            panel.setPosition(-360, -404);
            panel.show();
            this.view_list[index] = panel;
        }
        return panel
    },

    getInviteCodeData: function () {
        var invite_code = this.ctrl.getModel().getInviteCode();
        if (invite_code) {
            this.invite_code_lb.string = invite_code;
            this.invite_code = invite_code;
            this.edit_box.string = invite_code;
        } else {
            message(Utils.TI18N("获取邀请码失败"))
        }
    },

    //邀请人数
    getAlreadyFriendNum: function () {
        if (this.text_invitecode_lb) {
            var num = this.ctrl.getModel().getFirendNum();
            var str = cc.js.formatStr(Utils.TI18N("已邀请好友：%s人"), num || 0);
            this.text_invitecode_lb.string = str;
        }
    },

    //分享游戏下载和邀请码
    setShardGame: function () {
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
        var apk_data = require("role_controller").getInstance().getApkData();
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

            if(this.time_2){
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

            var erweima = Utils.createImage(this.poste_picture.node,null, -145, -145, cc.v2(0.5, 0.5));
            // if(apk_data){
            //     SDK_.download_qrcode_png(apk_data.message.qrcode_url, function (img) {
            //         var spriteFrame = new cc.SpriteFrame();
            //         spriteFrame.setTexture(img);
            //         erweima.spriteFrame = spriteFrame;
            //         erweima.node.scale = 340 / erweima.node.width;
            //     }.bind(this))
            // }

            if (USE_SDK) {
                SDK.download_qrcode_png(function(qrcod_sf) {
                    if (qrcod_sf)
                        this.erweima_img_sp.spriteFrame = spriteFrame;                    
                }.bind(this))
            }

            var name = "game_shard";
            // SDK.CaptureScreenSaveImg(name,function(bool){
            //     if(bool==true){

            //     }else{
            //         message(Utils.TI18N("保存失败"));
            //     }
            if(this.time_1){
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

    //复制邀请码
    copyCode: function () {
        var invite_code = this.ctrl.getModel().getInviteCode();
        if (invite_code) {
            message(Utils.TI18N("复制失败"))
        } else {
            message(Utils.TI18N("复制推荐码失败"))
        }
    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool);
        if (bool == true) {
            this.ctrl.requestProto();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.getInviteCodeData();
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
        if(this.time_1){
            gcore.Timer.del(this.time_1);
            this.time_1 = null;
        }
        if(this.time_2){
            gcore.Timer.del(this.time_2);
            this.time_2 = null;
        }
        for(let i in this.view_list){
            this.view_list[i].deleteMe()
            this.view_list[i] = null
        }
        this.view_list = null;
    },
})