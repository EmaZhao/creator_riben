// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版查看好友
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var FriendConst = require("friend_const");
var RoleEvent = require("role_event");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var HeroVo = require("hero_vo")
var BattleController = require("battle_controller")
var ChatController = require("chat_controller")
var ChatConst = require("chat_const")
var FriendCheckInfoWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_check_info");
        var FriendController = require("friend_controller");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = FriendController.getInstance();
        this.model = this.ctrl.getModel();
        this.item_list = {};
    },

    openCallBack: function() {
        Utils.getNodeCompByPath("main_panel/info_con/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("段位：");
        Utils.getNodeCompByPath("main_panel/info_con/guild_title", this.root_wnd, cc.Label).string = Utils.TI18N("公会：");
        Utils.getNodeCompByPath("main_panel/main_container/fight_title", this.root_wnd, cc.Label).string = Utils.TI18N("战斗阵容");
        Utils.getNodeCompByPath("main_panel/title_container/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("个人信息");
        // Utils.getNodeCompByPath("main_panel/report_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("举报");
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.friend_btn = this.main_panel.getChildByName("friend_btn");
        this.friend_btn.active = false;
        this.black_btn = this.main_panel.getChildByName("black_btn");
        this.pk_btn = this.main_panel.getChildByName("pk_btn");
        this.pk_btn.x = 190;
        this.pk_btn_label = this.pk_btn.getChildByName("Label").getComponent(cc.Label);
        this.friend_btn_label = this.friend_btn.getChildByName("Label").getComponent(cc.Label);
        this.black_btn_label = this.black_btn.getChildByName("Label").getComponent(cc.Label);
        // this.report_btn = this.main_panel.getChildByName("report_btn")
        this.pk_btn_label.string = Utils.TI18N("切磋");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.info_con = this.main_panel.getChildByName("info_con");
        this.name_lb = this.info_con.getChildByName("name").getComponent(cc.Label);

        this.rank_lb = this.info_con.getChildByName("rank").getComponent(cc.Label);
        this.rank_lb.string = Utils.TI18N("暂无");
        this.guild_lb = this.info_con.getChildByName("guild").getComponent(cc.Label);
        this.guild_lb.string = Utils.TI18N("暂无");

        this.glory_btn = this.info_con.getChildByName("glory_btn");
        this.glory_btn.active = false;//屏蔽
        this.at_btn = this.info_con.getChildByName("at_btn");
        this.at_btn.active = false;
        this.country = this.info_con.getChildByName("country");

        this.main_container = this.main_panel.getChildByName("main_container");

        //头像
        if (this.head == null) {
            this.head = new PlayerHead();
            this.head.setParent(this.info_con);
            this.head.show()
            this.head.setPosition(-227, 50);
        }

        this.vip_label_cr = this.seekChild(this.main_panel, "vip_label").getComponent("CusRichText");
        this.fight_label_cr = this.seekChild(this.main_container, "fight_label").getComponent("CusRichText");

        this.scrollCon_nd = this.seekChild("scrollCon");
        this.scrollCon_content_nd = this.seekChild(this.scrollCon_nd, "content");
        this.scroll_view_size = this.scrollCon_nd.getContentSize();
        this.scroll_view_sv = this.scrollCon_nd.getComponent(cc.ScrollView);
        // this.scrollCon_content_nd.setContentSize(cc.size(this.scroll_view_size.width - 10,this.scroll_view_size.height))
    },

    registerEvent: function() {
        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                this.ctrl.openFriendCheckPanel(false);
                Utils.playButtonSound(2)
            }).bind(this));
        }
        if (this.glory_btn) {
            this.glory_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                Utils.playButtonSound(1)
                this.ctrl.openFriendGloryWindow(true, this.data);
            }).bind(this));
        }

        if (this.friend_btn) {
            this.friend_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                Utils.playButtonSound(1)
                if (this.model.isFriend(this.data.srv_id, this.data.rid)) {
                    ChatController.getInstance().openChatPanel(ChatConst.Channel.Friend, "friend", this.data)
                    this.ctrl.openFriendCheckPanel(false);
                } else {
                    this.ctrl.openFriendCheckPanel(false);
                    this.ctrl.addOther(this.data.srv_id, this.data.rid);
                }
            }).bind(this));
        }

        if (this.pk_btn) {
            this.pk_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                Utils.playButtonSound(1)
                if (this.data) {
                    if (!BattleController.getInstance().getWatchReplayStatus() && !BattleController.getInstance().getModel().getFightStatus()) {
                        BattleController.getInstance().csBattlePk(this.data.rid, this.data.srv_id)
                    } else {
                        message(Utils.TI18N("正在观看录像或者切磋中,请先退出"));
                    }
                }
            }).bind(this));
        }

        if (this.black_btn) {
            this.black_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                Utils.playButtonSound(1)
                if (this.model.isBlack(this.data.rid, this.data.srv_id)) {
                    ChatController.getInstance().closeChatPanel()
                    this.ctrl.openFriendCheckPanel(false);
                    this.ctrl.openFriendWindow(true, FriendConst.Type.BlackList);
                } else {
                    this.ctrl.addToBlackList(this.data.rid, this.data.srv_id);
                    this.ctrl.openFriendCheckPanel(false);
                }
            }).bind(this))
        }

        // if (this.report_btn) {
        //     this.report_btn.on("click", (function() {
        //         Utils.playButtonSound(1)
        //         this.onClickReportBtn()
        //     }).bind(this))
        // }
        //接受数据
        cc.log(this.updateEvent, "this.updateEvent")
        if (this.updateEvent == null) {
            this.updateEvent = gcore.GlobalEvent.bind(RoleEvent.DISPATCH_PLAYER_VO_EVENT, function(data) {
                if (data.rid == this.rid && data.srv_id == this.srv_id) {
                    this.updateData(data);
                }
            }.bind(this))
        }

        if (this.at_btn) {
            this.at_btn.on(cc.Node.EventType.TOUCH_END, (function() {
                Utils.playButtonSound(1)
                if (this.data && this.data.name) {
                    ChatController.getInstance().chatAtPeople(this.data.name, this.data.srv_id);
                    this.ctrl.openFriendCheckPanel(false);
                }

            }).bind(this));
        }


    },

    openRootWnd: function(data) {
        if (data == null) return
        this.rid = data.rid;
        this.srv_id = data.srv_id;
        this.flag = data.flag;
        this.channel = data.channel; //从聊天窗口打开时需要显示@按钮
        if (data && data.rid != null && data.srv_id != null) {
            RoleController.getInstance().requestRoleInfo(data.rid, data.srv_id)
        }

        // if (data.channel)//屏蔽
            // this.at_btn.active = true;
    },



    updateData: function(data) {
        this.data = data;
        this.name_lb.string = Utils.transformNameByServ(data.name, data.srv_id);
        this.country.x = this.name_lb.node.x + this.name_lb.node.width + 5;
        this.head.setHeadRes(data.face_id);
        this.head.setLev(data.lev);
        this.head.setSex(data.sex, cc.v2(20, -50))

        if (data.gname != "")
            this.guild_lb.string = data.gname;

        //头像框
        var vo = gdata("avatar_data", "data_avatar", [data.avatar_bid]);
        if (vo) {
            var res_id = vo.res_id || 0;
            var res = PathTool.getHeadcircle(res_id);
            this.head.setFrameRes(res);
        }

        this.vip_label_cr.setNum(data.vip_lev);
        this.fight_label_cr.setNum(data.power);

        if (this.model.isFriend(data.srv_id, data.rid)){
          this.friend_btn_label.string = Utils.TI18N("私聊");
          this.friend_btn.active = false;
          this.pk_btn.x = 190;
        } else{
          this.pk_btn.x = 0;
          this.friend_btn.active = true;
          this.friend_btn_label.string = Utils.TI18N("加为好友");
        }
            


        if (this.model.isBlack(data.rid, data.srv_id))
            this.black_btn_label.string = Utils.TI18N("黑名单");
        else
            this.black_btn_label.string = Utils.TI18N("加黑名单");


        this.createPartnerList(data.partner_list);
    },

    createPartnerList: function(list) {
        var temp = [];
        for (var k in list) {
            var v = list[k]
            var vo = new HeroVo();
            vo.updateHeroVo(v);
            temp.push(vo);
        }
        var p_list_size = temp.length;
        var total_width = p_list_size * 104 + (p_list_size - 1) * 6;
        var start_x = 8;
        var partner_item = null;
        var max_width = Math.max(total_width, this.scroll_view_size.width);
        this.scrollCon_content_nd.setContentSize(cc.size(max_width, this.scroll_view_size.height));

        for (var i = 0; i < temp.length; ++i) {
            var v = temp[i];
            if (this.item_list[i] == null) {
                partner_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
                partner_item.setRootScale(0.8);
                partner_item.show();
                partner_item.setPosition(start_x + 104 * 0.5 + (i) * (104 + 6), this.scroll_view_size.height * 0.5);
                partner_item.setData(v);
                partner_item.setParent(this.scrollCon_content_nd);
                this.item_list[i] = partner_item;
                partner_item.addCallBack(function(item) {
                    var vo = item.getData();
                    if (vo && Utils.next(vo) != null) {
                        var partner_id = vo.partner_id;
                        if (partner_id == 0) {
                            partner_id = vo.id;
                        }
                        var rid = this.data.rid;
                        var srv_id = this.data.srv_id;
                        require("look_controller").getInstance().sender11061(rid, srv_id, partner_id);
                    }
                }.bind(this))
            }
        }
    },
    onClickReportBtn() {
        if (!this.data) return;
        let role_lv_cfg = Config.role_data.data_role_const.role_reported_lev_limit
        let role_vo = RoleController.getInstance().getRoleVo() || {}
        let lev = role_vo.lev || 0
        if (role_lv_cfg && lev < role_lv_cfg.val) {
            message(role_lv_cfg.val + Utils.TI18N("级开放举报功能"))
            return
        }
        RoleController.getInstance().openRoleReportedPanel(true, this.data.rid, this.data.srv_id, this.data.name)
    },
    closeCallBack: function() {

        for (var k in this.item_list) {
            var v = this.item_list[k];
            v.deleteMe();
            v = null
        }
        this.item_list = null;

        if (this.head)
            this.head.deleteMe();
        this.head = null;
        if (this.updateEvent) {
            gcore.GlobalEvent.unbind(this.updateEvent);
            this.updateEvent = null;
        }
        this.ctrl.openFriendCheckPanel(false);
    },
});

module.exports = FriendCheckInfoWindow;