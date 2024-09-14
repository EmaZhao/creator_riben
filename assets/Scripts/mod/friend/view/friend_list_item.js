// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      竖版好友列表子项
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var FriendController = require("friend_controller");
var FriendConst = require("friend_const");
var PlayerHead = require("playerhead");
var FriendVo = require("friend_vo");
var TimeTool = require("timetool")

var FriendListItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("friend", "friend_item");
        this.ctrl = FriendController.getInstance();
        this.size = cc.size(610, 114);
        this.width = 610;
        this.height = 114;
        this.is_del = false;
        this.item_list = {};
        this.vo = null;
        this.open_type = arguments[0] && arguments[0].open_type || FriendConst.Type.MyFriend;
    },

    initPanel: function () {
        this.root_wnd.setContentSize(this.size);
        this.main_panel = this.root_wnd.getChildByName("main_panel");

        //名字
        this.role_name = this.main_panel.getChildByName("role_name").getComponent(cc.Label);
        this.role_power = this.main_panel.getChildByName("role_power").getComponent(cc.Label);
        this.is_online = this.main_panel.getChildByName("is_online").getComponent(cc.Label);

        this.img_btn = this.main_panel.getChildByName("img");
        this.img_btn.x = 230;
        this.img = this.main_panel.getChildByName("img").getComponent(cc.Sprite);
        this.button = this.main_panel.getChildByName("add_btn");
        this.button.active = false;
        this.btn_label = this.button.getChildByName("Label").getComponent(cc.Label);
        this.btn_label_lo = this.button.getChildByName("Label").getComponent(cc.LabelOutline);
        this.del_btn = this.main_panel.getChildByName("del_btn");
        this.del_btn.active = false

        //头像
        this.head_con = this.main_panel.getChildByName("head_con")
        this.play_head = new PlayerHead();
        this.play_head.setParent(this.head_con);
        this.play_head.show()
        this.play_head.addCallBack((function () {
            this.ctrl.openFriendCheckPanel(true, this.vo);
        }).bind(this))
    },

    setExtendData: function (open_type) {
        this.open_type = open_type;
    },

    clickHandler: function () {
        if (this.call_fun)
            this.call_fun(this.vo);
    },

    setTouchFuncL: function (value) {
        this.call_fun = value;
    },

    addCallBackL: function (value) {
        this.call_fun = value;
    },



    registerEvent: function () {
        this.button.on(cc.Node.EventType.TOUCH_END, function () {
            if (!this.vo)
                return
            if (!this.button.getComponent(cc.Button).interactable)
                return
            if (this.my_friend) {
                //私聊
                var ChatController = require("chat_controller");
                var ChatConst = require("chat_const");
                let vo = {
                    avatar_bid: this.vo.avatar_bid
                    , career: this.vo.career
                    , dun_id: this.vo.dun_id
                    , face_id: this.vo.face_id
                    , gid: this.vo.gid
                    , gift_status: this.vo.gift_status
                    , gname: this.vo.gname
                    , group_id: this.vo.group_id
                    , gsrv_id: this.vo.gsrv_id
                    , intimacy: this.vo.intimacy
                    , is_awake: this.vo.is_awake
                    , is_cross: this.vo.is_cross
                    , is_draw: this.vo.is_draw
                    , is_moshengren: this.vo.is_moshengren
                    , is_online: this.vo.is_online
                    , is_present: this.vo.is_present
                    , is_used: this.vo.is_used
                    , is_vip: this.vo.is_vip
                    , lev: this.vo.lev
                    , login_out_time: this.vo.login_out_time
                    , login_time: this.vo.login_time
                    , main_partner_id: this.vo.main_partner_id
                    , name: this.vo.name
                    , partner_bid: this.vo.partner_bid
                    , partner_lev: this.vo.partner_lev
                    , partner_star: this.vo.partner_star
                    , power: this.vo.power
                    , rid: this.vo.rid
                    , sex: this.vo.sex
                    , srv_id: this.vo.srv_id
                    , talk_time: this.vo.talk_time
                };
                ChatController.getInstance().openChatPanel(ChatConst.Channel.Friend, "friend", vo);
            }
            if (this.award_panel) {
                this.ctrl.sender_13316(0, this.vo.rid, this.vo.srv_id)
            }
            if (this.apply_panel) {
                this.ctrl.accept(this.vo.srv_id, this.vo.rid, 1);
            }
            if (this.black_panel) {
                this.ctrl.deleteBlackList(this.vo.rid, this.vo.srv_id);
            }
            if (this.del_friend_btn) { //删除好友
            }
            if (this.recommend_panel) {
                this.ctrl.addOther(this.vo.srv_id, this.vo.rid);
                this.btn_label.string = Utils.TI18N("等待同意");
                this.button.getComponent(cc.Button).interactable = false;
                this.button.getComponent(cc.Button).enableAutoGrayEffect = true;
                this.btn_label_lo.color = new cc.Color(0x79, 0x79, 0x79, 0xff)
            }
            if (this.is_del) {  //删除好友
                this.ctrl.delOther(this.vo.srv_id, this.vo.rid);
            }
        }, this)
        this.del_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (!this.vo)
                return
            this.ctrl.accept(this.vo.srv_id, this.vo.rid, 0);
        }, this)
        this.img_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (!this.vo)
                return
            if (!this.img_btn.getComponent(cc.Button).interactable)
                return
            if (this.my_friend) {
                this.ctrl.sender_13316(0, this.vo.rid, this.vo.srv_id);
            }
            if (this.award_panel) {
                this.ctrl.sender_13316(1, this.vo.rid, this.vo.srv_id)
            }
        }, this)
    },

    setData: function (data) {
        if (data == null)
            return
        this.unBindEvent();
        this.vo = data;
        if (this.root_wnd != null)
            this.onShow();
    },

    onShow: function () {
        if (this.vo == null)
            return
        var data = this.vo;

        gcore.Timer.set(function () {
            this.updateMessage();
        }.bind(this), 60, 1)


        if (data.face_id)
            this.play_head.setHeadRes(data.face_id);
        if (data.lev != null) {
            this.play_head.setLev(data.lev);
        }

        if (data.name != null) {
            this.role_name.string = data.name || "";
        }
        if (data.power != null) {
            var power = data.power || 0;
            this.role_power.string = Utils.TI18N("战力：") + power;
        }

        this.updateOnlineTime();
        this.addVoBindEvent();
    },

    // 更新在线时间
    updateOnlineTime: function () {
        if (!this.vo || !this.is_online) return;
        let str = "";
        if (this.vo.is_online != null && this.vo.is_online == 0) {
            let time = 0;
            if (this.vo.login_out_time == 0) {
                time = TimeTool.day2s() * 4;
            } else {
                let srv_time = gcore.SmartSocket.getTime();
                time = srv_time - this.vo.login_out_time;
            }
            str = TimeTool.getTimeFormatFriendShowTime(time);
        } else {
            str = Utils.TI18N("在线");
        }
        this.is_online.string = str;
    },

    addVoBindEvent: function () {
        // 直接用数据去监听这样避免了刷新的频繁
        if (this.vo && this.vo != null && this.vo.bind) {
            if (this.item_update_event == null) {
                this.item_update_event = this.vo.bind(FriendVo.UPDATE_FRIEND_ATTR_LOGIN_OUT_TIME, function (vo) {
                    this.updateOnlineTime();
                }, this)
            }
        }
    },

    unBindEvent: function () {
        if (this.vo) {
            if (this.item_update_event != null) {
                this.vo.unbind(this.item_update_event);
                this.item_update_event = null;
            }
            this.vo = null;
        }
    },

    //根据类型创建显隐相关控件
    updateMessage: function () {
        this.hideAllPanel();
        if (this.open_type == FriendConst.Type.MyFriend) {
            this.is_del = this.vo.del_status
            this.updateMyFriend();
        } else if (this.open_type == FriendConst.Type.Award) {
            this.is_del = false;
            this.updateAwardPanel();
        } else if (this.open_type == FriendConst.Type.ApplyList) {
            this.is_del = false;
            this.updateApplyPanel();
        } else if (this.open_type == FriendConst.Type.BlackList) {
            this.is_del = false;
            this.updateBlackPanel();
        } else if (this.open_type == 5) {
            this.is_del = false;
            this.updateRecommendPanel();
        }
    },


    hideAllPanel: function () {
        if (this.my_friend)
            this.my_friend = false;
        if (this.award_panel)
            this.award_panel = false;
        if (this.apply_panel)
            this.apply_panel = false;
        if (this.black_panel)
            this.black_panel = false;
        if (this.del_friend_btn)
            this.del_friend_btn = false;
        if (this.recommend_panel)
            this.recommend_panel = false;
    },

    //更新好友列表的控件
    updateMyFriend: function () {
        if (!this.my_friend) {
            //赠送按钮

            this.loadRes(PathTool.getUIIconPath("friend", "friend_" + 5), function (sf_obj) {
                this.img.spriteFrame = sf_obj;
            }.bind(this))

            this.btn_label.string = Utils.TI18N("私聊");
            this.button.width = 96;
            this.del_btn.active = false;
            this.my_friend = true;
        }
        this.button.active = false;
        this.img.node.active = true;
        this.button.getComponent(cc.Button).interactable = true;
        this.button.getComponent(cc.Button).enableAutoGrayEffect = false;
        if (this.vo == null)
            return
        if (this.vo.is_present != null && this.vo.is_present == 1) {
            this.img_btn.getComponent(cc.Button).interactable = false;
            this.img_btn.getComponent(cc.Button).enableAutoGrayEffect = true;
        }
        else {
            this.img_btn.getComponent(cc.Button).interactable = true;
            this.img_btn.getComponent(cc.Button).enableAutoGrayEffect = false;
        }
        if (this.is_del)
            this.setDelStatus(this.is_del)
    },

    //更新赠送的控件
    updateAwardPanel: function () {
        if (!this.award_panel) {
            //友情点标志

            if (this.path == null) {

                this.loadRes(PathTool.getUIIconPath("friend", "friend_" + 2), function (sf_obj) {
                    this.img.spriteFrame = sf_obj;
                }.bind(this))
            } else {
                this.img.spriteFrame = this.res_object.getSpriteFrame("friend_" + 2);
            }
            this.btn_label.string = Utils.TI18N("回礼");
            this.award_panel = true;
        }

        this.img_btn.active = true;
        this.del_btn.active = false;
        this.img_btn.getComponent(cc.Button).interactable = true;
        this.img_btn.getComponent(cc.Button).enableAutoGrayEffect = false;
        this.btn_label_lo.color = new cc.Color(173, 100, 67, 0xff)
        if (!this.vo)
            return
            // this.button.active = true;
        if (this.vo.is_present != null && this.vo.is_present == 1) {
            this.button.getComponent(cc.Button).interactable = false;
            this.button.getComponent(cc.Button).enableAutoGrayEffect = true;
            this.btn_label_lo.color = new cc.Color(121, 121, 121, 0xff)
        }
        if (this.vo.is_draw != null && this.vo.is_draw == 0) {
            this.img_btn.getComponent(cc.Button).interactable = false;
            this.img_btn.getComponent(cc.Button).enableAutoGrayEffect = true;
        }
    },

    //更新申请列表的控件
    updateApplyPanel: function () {
        if (!this.apply_panel) {
            this.img.node.active = false;
            this.del_btn.active = true;
            this.apply_panel = true;
            this.btn_label.string = Utils.TI18N("接受");
            this.button.active  = true;
            this.button.setContentSize(cc.size(130, 54));
            this.button.getComponent(cc.Button).interactable = true;
        }
    },

    //更新黑名单的控件
    updateBlackPanel: function () {
        if (!this.black_panel) {
            this.button.active = true
            this.img.node.active = false;
            this.del_btn.active = false;
            this.btn_label.string = Utils.TI18N("移除");
            this.black_panel = true;
            this.button.setContentSize(cc.size(130, 54));
            this.button.getComponent(cc.Button).interactable = true;
        }
    },

    //更新推荐好友的控件
    updateRecommendPanel: function () {
        if (!this.recommend_panel) {
            this.button.active = true;
            this.button.getComponent(cc.Button).interactable = true;
            this.img.node.active = false;
            this.del_btn.active = false;
            this.button.setContentSize(cc.size(127, 53));
            this.recommend_panel = true;
            this.btn_label.string = Utils.TI18N("加为好友")
        }
    },

    isHaveData: function () {
        if (this.vo)
            return true
        else
            return false
    },

    setDelStatus: function (bool) {
        if (bool == true)
            this.hideAllPanel();

        this.is_del = bool;
        if (!this.button && bool == false)
            return
        if (this.button) {
            this.button.active =true;
            if (bool) {
                this.button.setContentSize(cc.size(127, 53));
                this.btn_label.string = Utils.TI18N("删除好友")
                this.img.node.active = false;
            } else {
                this.button.setContentSize(cc.size(96, 53));
            }
        }

        if (bool == false)
            this.updateMyFriend();
    },

    getData: function () {
        return this.vo
    },

    OnDelete: function () {
        this.unBindEvent();
        this.vo = null;
        if (this.play_head)
            this.play_head.deleteMe();
        this.play_head = null;


    },

    setCallFun: function (call_fun) {
        this.call_fun = call_fun;
    },

    setVisibleStatus: function (bool) {
        if (this.root_wnd == null)
            return
        this.root_wnd.active = bool;
    },
});

module.exports = FriendListItem;