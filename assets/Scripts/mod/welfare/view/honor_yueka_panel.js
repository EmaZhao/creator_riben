// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     荣耀月卡
// <br/>Create: 2019-03-13 19:46:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var WelfareController = require("welfare_controller");
var WelfareEvent = require("welfare_event");
var TimeTool = require("timetool");

var HonorYuekaPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "yueka_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = WelfareController.getInstance();
        this.card_data = Config.charge_data.data_constant;
        this.card2_add_count = this.card_data.month_card2_sun.val;
        this.item_bid_1 = this.card_data.month_card2_items.val[0][0];
        this.item_num_1 = this.card_data.month_card2_items.val[0][1];
        this.add_get_day_1 = this.card_data.month_card2_cont_day.val;
        this.current_day = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        var bg = this.seekChild(this.main_container, "bg", cc.Sprite);
        var res_id = PathTool.getBigBg("txt_cn_welfare_yueka_bg2", null, "welfare");
        this.loadRes(res_id, function (res_object) {
            bg.spriteFrame = res_object;
        }.bind(this))

        this.btn_1_nd = this.seekChild(this.main_container, "btn_1");
        this.seekChild(this.btn_1_nd, "Text_1", cc.Label).string = Utils.TI18N("充值激活");
        this.bar_pb = this.seekChild(this.main_container, "bar", cc.ProgressBar);
        this.bar_pb.progress = 0;
        this.current_change_lb = this.seekChild("current_change", cc.Label);
        this.btn_rule_nd = this.seekChild("btn_rule");
        this.btn_rule_nd.active = false;

        this.image_get_nd = this.seekChild("image_get");
        this.image_get_nd.active = false;
        this.seekChild("Text_3").active = false;

        this.text_day_lb = this.seekChild(this.image_get_nd, "text_day", cc.Label);
        this.text_day_lb.string = "";
        this.text_time_lb = this.seekChild(this.image_get_nd, "text_time", cc.Label);
        this.btn_get_nd = this.seekChild(this.image_get_nd, "btn_get");
        this.btn_get_btn = this.seekChild(this.image_get_nd, "btn_get", cc.Button);
        this.btn_get_lb = this.seekChild(this.btn_get_nd, "Text_4", cc.Label);
        this.btn_get_lo = this.seekChild(this.btn_get_nd,"Text_4",cc.LabelOutline);
        this.btn_get_lb.string = Utils.TI18N("领取");

        var image_0_1_nd = this.seekChild(this.main_container, "Image_1_0")
        this.text_1_rt = this.seekChild(image_0_1_nd, "text_1", cc.RichText);
        this.text_2_rt = this.seekChild(this.main_container, "text_2", cc.RichText);
        this.text_3_rt = this.seekChild(this.main_container, "text_3", cc.RichText);

        this.text_1_rt.node.active = false;
        this.text_2_rt.node.active = false;
        this.text_3_rt.node.active = false;
        // this.text_1_rt.string = cc.js.formatStr(
        //     Utils.TI18N("<outline width=1 color=#110800>任意累计充值达到</outline><color=#ffb502> %d元 </c><outline width=1,color=#110800>即可激活</outline>"),
        //     this.card2_add_count)


        var item_config = Utils.getItemConfig(this.card_data.month_card2_return.val[0][0]);
        // this.text_2_rt.string = cc.js.formatStr(
        //     "<outline width=1 color=#110800>チャージすると月間カードもらえる、</outline><outline width=1 color=#000000><color=#ffb502 > 変換%d </c></outline><img src=%s visible=true scale=0.30 />",
        //     this.card_data.month_card2_return.val[0][1], PathTool.getItemRes(item_config.icon))

        var item_config = Utils.getItemConfig(this.item_bid_1);
        // this.text_3_rt.string = cc.js.formatStr(
        //     "<outline width=1 color=#110800>毎日</outline><color=#ffb502 ><outline width=1 color=#000000> %d</outline> </c>獲得<img src=%s visible=true scale=0.30 /><outline width=1 color=#110800>持続 </outline><color=#ffb502 ><outline width=1 color=#000000>%d日</outline></c>",
        //     this.item_num_1, PathTool.getItemRes(item_config.icon), this.add_get_day_1)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(WelfareEvent.Update_Yueka, function (data) {
            var add_count = 100, acc_count = 100;
            var item_bid = null, item_num = null;
            var get_day = 0, day = 0, end_time = 0;
            if (data.card2_is_reward == 0) {
                this.image_get_nd.active = false;
                this.btn_1_nd.active = true;
                add_count = this.card2_add_count;
                acc_count = data.card2_acc;
            } else if (data.card2_is_reward == 1 || data.card2_is_reward == 2) {
                item_bid = this.item_bid_1;
                item_num = this.item_num_1;
                day = data.card2_days;
                get_day = this.add_get_day_1;
                end_time = data.card2_end_time;

                this.current_day = day;
                this.image_get_nd.active = true;
                this.btn_1_nd.active = false;
                if (data.card2_is_reward == 1) {
                    Utils.setGreyButton(this.btn_get_btn, false)
                    this.btn_get_lb.string = Utils.TI18N("领取");
                    this.btn_get_lo.enabled = true;
                } else if (data.card2_is_reward == 2) {
                    Utils.setGreyButton(this.btn_get_btn, true)
                    this.btn_get_lb.string = Utils.TI18N("已领取");
                    this.btn_get_lo.enabled = false;
                }

                //领取时间
                var start_time = end_time - 86400 * get_day;
                var str = cc.js.formatStr("%s - %s", TimeTool.getYMD5(start_time), TimeTool.getYMD5(end_time - 1))
                this.text_time_lb.string = str;
            }
            this.bar_pb.progress = acc_count / add_count;
            var str = cc.js.formatStr(Utils.TI18N("当前充值：%d / %d"), acc_count, add_count);
            this.current_change_lb.string = str;
            if (item_bid && item_num) {
                if (!this.reward_item) {
                    this.reward_item = ItemsPool.getInstance().getItem("backpack_item");
                    this.reward_item.initConfig(null, 1, false, true);
                    this.reward_item.show();
                    this.reward_item.setPosition(-260, 0)
                    this.reward_item.setParent(this.image_get_nd);

                }
                if (this.reward_item) {
                    this.reward_item.setData({ bid: item_bid, num: item_num });
                }
            }
            this.text_day_lb.string = this.current_day;
        }, this)

        this.addGlobalEvent(WelfareEvent.Update_Get_Yueka, function (_type) {
            if (_type == 2) {
                Utils.setGreyButton(this.btn_get_btn, true)
                this.btn_get_lb.string = Utils.TI18N("已领取");
                this.btn_get_lo.enabled = false;
                this.current_day = this.current_day + 1;
                this.text_day_lb.string = this.current_day;
            }
        }, this)

        Utils.onTouchEnd(this.btn_1_nd, function () {
            require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
        }.bind(this), 1)
        Utils.onTouchEnd(this.btn_get_nd, function () {
            this.ctrl.sender16706(2)
        }.bind(this), 1)


        this.ctrl.sender16705();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    setVisibleStatus: function (bool) {
        bool = bool || false;
        this.setVisible(bool)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.reward_item) {
            this.reward_item.deleteMe();
            this.reward_item = null;
        }
    },
})