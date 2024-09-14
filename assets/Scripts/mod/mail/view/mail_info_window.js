// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      竖版邮件/公告详情
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TimeTool = require("timetool");
var MailController = require("mail_controller");
var MailEvent = require("mail_event");

var MailInfoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mail", "mail_info_window");
        this.win_type = WinType.Big;
        this.data = null;
        this.ctrl = MailController.getInstance();
        this.model = MailController.getInstance().getModel();
        this.goods_list = [];
    },


    openCallBack: function () {
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.main_panel = this.main_container.getChildByName("main_panel");
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = Utils.TI18N("邮件");


        this.title_container = this.main_panel.getChildByName("title_container");
        this.title = this.title_container.getChildByName("title").getComponent(cc.Label);
        this.time = this.title_container.getChildByName("time").getComponent(cc.Label);
        this.icon = this.title_container.getChildByName("icon").getComponent(cc.Sprite);

        this.info_container = this.main_panel.getChildByName("info_container");
        this.content = this.info_container.getChildByName("ScrollView").getChildByName("view").getChildByName("content").getChildByName("RichText").getComponent(cc.RichText);

        this.youxiao = this.info_container.getChildByName("youxiao").getComponent(cc.Label);

        this.goods_container = this.info_container.getChildByName("goods_container");
        this.goods_title = this.goods_container.getChildByName("goods_title").getComponent(cc.Label);
        this.goods_title.string = Utils.TI18N("领取奖励");

        this.goods_scroll = this.goods_container.getChildByName("ScrollView");
        this.goods_scroll_content = this.goods_scroll.getChildByName("view").getChildByName("content");
        this.goods_scroll_size = this.goods_scroll.getContentSize();


        this.take_label = this.goods_container.getChildByName("take_label").getComponent(cc.Label);
        this.take_label.node.active = false;

        this.btn = this.main_panel.getChildByName("btn");
        this.btn_label = this.btn.getChildByName("Label").getComponent(cc.Label);
        this.btn_label_lo = this.btn.getChildByName("Label").getComponent(cc.LabelOutline);
        // this.btn_img = this.btn.getComponent(cc.Sprite);
        this.close_btn = this.main_panel.getChildByName("close_btn");

        this.onShow()
    },

    createPanel: function (panel) {
        this.panel_bg = panel;
        this.panel_bg.setParent(this.main_container)
    },


    registerEvent: function () {
        if (this.close_btn) {
            this.close_btn.on(cc.Node.EventType.TOUCH_END, (function () {
                this.ctrl.openMailInfo(false);
            }).bind(this))
        }
        if (this.btn) {
            this.btn.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data && this.data.status) {//邮件
                    if (this.data.assets && this.data.items) {
                        if (Utils.getArrLen(this.data.assets) > 0 || Utils.getArrLen(this.data.items) > 0 && this.data.type == 1) { //领取
                            this.ctrl.getGoods(this.data.id, this.data.srv_id);
                        } else if (Utils.getArrLen(this.data.assets) <= 0 || Utils.getArrLen(this.data.items) <= 0 && this.data.type == 1) {
                            var ids = [{ id: this.data.id, srv_id: this.data.srv_id }];
                            this.ctrl.deletMailSend(ids);
                            this.ctrl.openMailInfo(false);
                        }
                    }
                }
            }, this)
        }
        if (this.background) {
            this.background.on(cc.Node.EventType.TOUCH_END, function () {
                this.ctrl.openMailInfo(false);
            }, this)
        }
        this.addGlobalEvent(MailEvent.GET_ITEM_ASSETS, function (key) {
            if (this.data) {
                var item_key = Utils.getNorKey(this.data.id || 0, this.data.srv_id || "");
                if (key == item_key) {
                    this.removeAsset(key);
                }
            }
        }, this)
    },

    //必要添加的数据传入方法
    setData: function (data) {
        this.data = data;
        this.onShow()
    },

    onShow: function () {
        // return
        if (this.data == null)
            return
        if (this.root_wnd == null)
            return
        var data = this.data;
        // var str2 = data.content;
        // str2 = string.gsub(str2,"&lt;","<");
        // str2 = string.gsub(str2,"&gt;",">");
        // str2 = string.gsub(str2, "&#039;", "'")
        // str2 = string.gsub(str2, "&quot;", '"')
        // str2 = WordCensor.getInstance().relapceAssetsTag(str2);
        // this.content.string = str2;
        var str2 = data.content;
        str2 = str2.replace(/&lt/g, "<");
        str2 = str2.replace(/&gt/g, ">");
        str2 = str2.replace(/&#039/g, "'");
        str2 = str2.replace(/&quot/g, '"');

        str2 = StringUtil.parseStr(str2).string

        this.content.string = "<color=#ffffff >" + str2 + "</c>";

        if (data.status != null) {
            this.title.string = data.subject;
            this.time.active = true;
            this.youxiao.active = true;
            if (data.assets && data.items) {
                if (Utils.getArrLen(data.assets) > 0 || Utils.getArrLen(data.items) > 0 && data.type == 1) {
                    this.btn.active = true;
                    this.changeButtonStatus(true);
                    this.goods_container.active = true;
                    this.createGoodsList();
                } else if (Utils.getArrLen(data.assets) <= 0 || Utils.getArrLen(data.items) <= 0 && data.type == 1) {
                    this.btn.active = true;
                    this.changeButtonStatus(false);
                    this.goods_container.active = false;
                } else {
                    this.btn.active = false;
                    this.goods_container.active = false;
                }
            }

            var show_time = TimeTool.getDayOrHour(gcore.SmartSocket.getTime() - this.data.send_time);
            if (show_time != null) {
                this.time.string = show_time + "前";
            } else {
                this.time.string = "";
            }

            show_time = TimeTool.getDayOrHour(data.time_out - gcore.SmartSocket.getTime());
            if (show_time != null) {
                this.youxiao.string = "有效期" + show_time;
            } else {
                this.youxiao.string = "";
            }

            this.changeIcon(data.status);
            this.ctrl.read(data.id, data.srv_id);
        } else if (data.flag != null) {
            this.title.string = data.title;
            this.btn.active = false;
            this.goods_container.active = false;
            this.time.node.active = false;
            this.youxiao.node.active = false;
            this.changeIcon(data.flag);
            this.ctrl.readNotice(data.id);
        }


    },

    removeAsset: function () {
        if (this.goods_list) {
            for (var k in this.goods_list) {
                if (this.goods_list[k] != null) {
                    this.goods_list[k].deleteMe();
                    this.goods_list[k] = null;
                }
            }
            this.goods_list = null;
        }
        this.goods_container.active = false;
        this.data.assets = {};
        this.data.status = 2;
        this.data.items = {};
        this.changeIcon(this.data.status);
        this.changeButtonStatus(false);
    },

    createGoodsList: function () {
        if (this.data.status == 2) { //领了的就不创建了
            return
        }

        var show_list = [];
        for (var k in this.data.assets) {
            var v = this.data.assets[k];
            if (Utils.deepCopy(Utils.getItemConfig(v.label || v.base_id)).id != null)
                show_list.push(this.data.assets[k]);
        }
        for (var k in this.data.items) {
            var v = this.data.items[k];
            if (Utils.deepCopy(Utils.getItemConfig(v.label || v.base_id)).id != null)
                show_list.push(this.data.items[k]);
        }

        // if (this.data.items.length > 0) {
            // this.take_label.string = "占用背包空间：" + this.data.items.length;
            // this.take_label.node.active = true;
        // }

        var max_width = Math.max((BackPackItem.Width + 10) * show_list.length, this.goods_scroll_size.width);
        this.goods_scroll_content.setContentSize(cc.size(max_width, this.goods_scroll_size.height));
        for (var i = 0; i < show_list.length; i++) {
            var v = show_list[i];
            var config = Utils.deepCopy(Utils.getItemConfig(v.label || v.base_id));
            config.bid = v.label || v.base_id
            if (config.id != null) {
                config.num = v.val || v.quantity;
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.setParent(this.goods_scroll_content)
                item.initConfig(false, 1, false, false)
                if (max_width > this.goods_scroll_size.width) {
                    item.setPosition(i * (BackPackItem.Width + 8) - max_width / 2 + BackPackItem.Width / 2, 0)
                } else {
                    item.setPosition(i * (BackPackItem.Width + 8) - (show_list.length - 1) * BackPackItem.Width / 2, 0)
                }
                item.show();
                item.setData(config);
                this.goods_list[i] = item;
            }
        }
    },

    changeButtonStatus: function (status) {
        if (status == true) {
            // this.loadRes(PathTool.getCommonIcomPath("common_1017"), function (sf_obj) {
            //     this.btn_img.spriteFrame = sf_obj;
            // }.bind(this))
            this.btn_label.string = Utils.TI18N("领取");
            // this.btn_label_lo.color = new cc.Color(0x6c, 0x2b, 0x00, 0xff)
        } else {
            this.btn_label.string = Utils.TI18N("删除");
            // this.btn_label_lo.color = new cc.Color(0x2b, 0x61, 0x0d, 0xff)
            // this.loadRes(PathTool.getCommonIcomPath("common_1018"), function (sf_obj) {
            //     this.btn_img.spriteFrame = sf_obj;
            // }.bind(this))
        }
    },

    changeIcon: function (status) {
        if (status != null) {
            if (status == 1) { //已读
                if ((this.data.assets && this.data.items) && (Utils.getArrLen(this.data.assets) > 0 || Utils.getArrLen(this.data.items) > 0)) { //读了没领
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon4"), function (res_object) {
                        this.res_object = res_object;
                        this.icon.spriteFrame = res_object;
                    }.bind(this))
                } else {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon3"), function (res_object) {
                        this.res_object = res_object;
                        this.icon.spriteFrame = res_object;
                    }.bind(this))
                }
            } else if (status == 2) { //领了
                this.loadRes(PathTool.getUIIconPath("mail", "mail_icon3"), function (res_object) {
                    this.res_object = res_object;
                    this.icon.spriteFrame = res_object;
                }.bind(this))
            } else if (status == 0) { //未读
                if ((this.data.assets && this.data.items) && (Utils.getArrLen(this.data.assets) > 0 || Utils.getArrLen(this.data.items) > 0)) {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon2"), function (res_object) {
                        this.res_object = res_object;
                        this.icon.spriteFrame = res_object;
                    }.bind(this))
                } else {
                    this.loadRes(PathTool.getUIIconPath("mail", "mail_icon1"), function (res_object) {
                        this.res_object = res_object;
                        this.icon.spriteFrame = res_object;
                    }.bind(this))
                }

            }
        }
    },

    close_callback: function () {
        if (this.goods_list != null) {
            for (var k in this.goods_list) {
                if (this.goods_list[k] != null) {
                    this.goods_list[k].deleteMe();
                    this.goods_list[k] = null;
                }
            }
            this.goods_list = null;
        }
        this.ctrl.openMailInfo(false)
    },

    onHide: function () {

    },

    onDelete: function () {

    }

});

module.exports = MailInfoWindow;