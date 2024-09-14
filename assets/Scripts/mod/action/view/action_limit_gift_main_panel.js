// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-25 17:10:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool")
var ActionLimitGiftMainPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_gift_main_panel");
        this.data = arguments[0]
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        var self = this;
        self.main_container = self.root_wnd.getChildByName("main_container")
        let x = this.getPositionX()
        this.setPosition(x, -20)
        self.title_img = self.main_container.getChildByName("title_img")
        self.is_level_gift = false
        if (self.data && self.data.config) {
            let title = self.data.config.res_1 || "txt_cn_action_limit_gift_level"
            let path = PathTool.getUIIconPath("bigbg/limit_gift", title)
            this.loadRes(path, function(res) {
                self.title_img.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            if (self.data.config.codition && self.data.config.codition[0] != null) {
                self.level_img = self.main_container.getChildByName("level_img")
                if (self.data.config.codition[0] == "lev") {
                    // --说明是等级礼包
                    self.is_level_gift = true
                    let level
                    if (self.data.config.res_2 == null || self.data.config.res_2 == "") {
                        level = "action_limit_gift_level_18"
                    } else {
                        level = self.data.config.res_2
                    }
                    let path1 = PathTool.getUIIconPath("bigbg/limit_gift", level)
                    this.loadRes(path1, function(res) {
                        self.level_img.getComponent(cc.Sprite).spriteFrame = res
                    }.bind(this))
                }
            }
        }


        self.item_scrollview = self.main_container.getChildByName("item_scrollview")
        self.content = self.item_scrollview.getChildByName("content")
            // self.item_scrollview:setScrollBarEnabled(false)
            // -- self.item_scrollview:setSwallowTouches(false)

        self.comfirm_btn = self.main_container.getChildByName("comfirm_btn");
        self.sprite_nd = self.comfirm_btn.getChildByName("sprite")
        self.comfirm_label = self.comfirm_btn.getChildByName("label")


        self.time_val = self.main_container.getChildByName("time_val").getComponent(cc.Label)
            // --和后端协议好..活动结束后会有两天兑换时间..这里把时间减去了
        let time = self.data.end_time
        self.setLessTime(time)

        self.value = self.main_container.getChildByName("value")
        if (self.is_level_gift) {
            self.time_val.node.y = -51
            self.item_scrollview.width = 240;
            self.item_scrollview.y = -97;
            self.content.y = -self.item_scrollview.width / 2
                // self.item_scrollview:setContentSize(cc.size(469,240))
        }
        // self.item_scrollview_size = self.item_scrollview:getContentSize()

        self.setData(this.data)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.comfirm_btn.on('click', function() {
            Utils.playButtonSound(1)
            this.onComfirmBtn()
        }, this)
    },
    onComfirmBtn() {
        var self = this;
        if (!self.data) return;
        if (!self.data.config) return;
        let charge_id = self.data.config.package_id || 0
        let charge_config = Config.charge_data.data_charge_data[charge_id]
        if (charge_config) {
            SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image)
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },
    setData(data) {
        var self = this
        if (!data) return;
        if (!data.config) return;
        this.data = data
        let num = self.data.num || 0
        self.value.getComponent(cc.Label).string = Utils.TI18N("残り: ") + num;
        if (self.item_list) return
        let config = Config.charge_data.data_charge_data[self.data.config.package_id]
        if (config) {
            self.sprite_nd.active = true;
            let str = config.val;
            self.comfirm_label.getComponent(cc.Label).string = str;
        }else{
            self.sprite_nd.active = false;
        } 

        // --物品id
        let reward = self.data.config.reward || []
        let scale = 0.9
        self.item_list = {}
        for (let i = 0; i < reward.length; ++i) {
            Utils.delayRun(self.content, i / 30, function() {
                let node = new cc.Node()
                node.setContentSize(120 * scale, 120 * scale)
                self.content.addChild(node)
                if (!self.item_list[i]) {
                    let bid = reward[i][0]
                    let num = reward[i][1]
                    let item = ItemsPool.getInstance().getItem("backpack_item")
                    item.setDefaultTip(true, false);
                    item.setParent(node);
                    item.initConfig(false, scale, false, true);
                    item.show();
                    self.item_list[i] = item
                    item.setData({ bid: bid, num: num });
                }
            }.bind(this))
        }

    },
    setLessTime(less_time) {
        var self = this;
        if (!self.time_val) {
            return
        }
        less_time = less_time || 0
        if (less_time > 0) {
            this.setTimeFormatString(less_time)
            if (this.time_tichet == null) {
                this.time_tichet = gcore.Timer.set(function() {
                    less_time--
                    this.setTimeFormatString(less_time)
                    if (less_time < 0) {
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            this.setTimeFormatString(less_time)
        }
    },
    setTimeFormatString(time) {
        if (time > 0) {
            let str = Utils.TI18N("剩余时间:") +" "+ TimeTool.getTimeFormatDayIIIIII(time)
            this.time_val.string = str;
        } else {
            this.time_val.string = "";
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if (this.item_list) {
            for (let i in this.item_list) {
                this.item_list[i].deleteMe()
            }
        }
    },

})