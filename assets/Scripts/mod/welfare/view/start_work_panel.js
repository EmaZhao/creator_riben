// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-20 16:17:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event");
var TimeTool = require("timetool");
var ActionController = require("action_controller");

var Start_workPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "start_work_panel");
        this.holiday_bid = arguments[0];
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.btn_reward_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        var main_container = this.seekChild("main_container");
        var bg = this.seekChild("bg");
        // bg.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("welfare/welfare_startwork"), function (sp) {
            bg.getComponent(cc.Sprite).spriteFrame = sp;
        }.bind(this))

        this.holiday_time_lb = this.seekChild(main_container, "Text_7", cc.Label);
        this.holiday_time_lb.string = Utils.TI18N("活动时间：");
        this.seekChild(main_container, "Text_8", cc.Label).string = Utils.TI18N("活动说明：周六、周日、周一登录可领取");

        for (let i = 1; i < 4; i++) {
            let tab = {};
            tab.btn = this.seekChild(main_container, "week_gift_" + i);
            tab.flag = tab.btn.getChildByName("flag");
            tab.flag_sp = tab.btn.getChildByName("flag").getComponent(cc.Sprite);
            tab.round = tab.btn.getChildByName("Sprite_2");
            tab.round_sp = tab.btn.getChildByName("Sprite_2").getComponent(cc.Sprite);
            tab.flag.active = false;
            tab.text_1 = tab.btn.getChildByName("reward_bg").getChildByName("text_1").getComponent(cc.Label);
            tab.text_2 = tab.btn.getChildByName("reward_bg").getChildByName("text_2").getComponent(cc.Label);
            this.btn_reward_list[i] = tab;
        }

        this.list_index = 1;
        this.startUpdate(3, function () {
            let index = this.list_index;
            if (this.btn_reward_list[index]) {
                if (this.btn_reward_list[index].round_sp) {
                    this.creatImage(index);
                }
            }
            this.list_index += 1;
        }.bind(this), 1000 / 30)
    },

    creatImage: function (index) {
        this.loadRes(PathTool.getUIIconPath("startwork", "startwork0" + (index + 1)), function (sp) {
            this.btn_reward_list[index].round_sp.spriteFrame = sp;
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE, function (data) {
            if (data.bid == this.holiday_bid) {
                this.data = data;
                this.signReward(data);
                this.holidayTime(data);
            }
        }, this)
        for (let i in this.btn_reward_list) {
            let v = this.btn_reward_list[i];
            v.btn.on(cc.Node.EventType.TOUCH_END, function () {
                Utils.playButtonSound(1);
                let index = Number(i) - 1;
                if (!this.data) return
                if (this.data.aim_list[index] && this.data.aim_list[index].aim != null) {
                    ActionController.getInstance().cs16604(this.holiday_bid, this.data.aim_list[index].aim);
                }
            }, this)
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.holiday_bid = params.bid;
        ActionController.getInstance().cs16603(this.holiday_bid);
    },

    setVisibleStatus: function (status) {
        status = status || false;
        this.setVisible(status);
        if (status == true) {
            ActionController.getInstance().cs16603(this.holiday_bid);
        }
    },

    //--签到奖励
    //--0：未激活 1：已激活 2：已领取 3：已过期
    signReward: function (data) {
        if (!data.aim_list || Utils.next(data.aim_list) == null) return
        this.stopRoundAction();
        for (let j in data.aim_list) {
            let v = data.aim_list[j];
            let i = Number(j) + 1;
            if (v.status == 1) {
                this.btn_reward_list[i].flag.active = false;
                var skewto_1 = cc.skewTo(0.3, 3, 0);
                var skewto_2 = cc.skewTo(0.3, -3, 0);
                var skewto_3 = cc.skewTo(0.4, 0, 0);
                var seq = cc.sequence(skewto_1, skewto_2, skewto_3, cc.delayTime(1));
                this.btn_reward_list[i].round.runAction(cc.repeatForever(seq));
            } else if (v.status == 2) {
                this.btn_reward_list[i].flag.active = true;
                this.loadRes(PathTool.getUIIconPath("startwork", "txt_cn_startwork02"), function (sp) {
                    this.btn_reward_list[i].flag_sp.spriteFrame = sp;
                }.bind(this))
            } else if (v.status == 3) {
                this.btn_reward_list[i].flag.active = true;
                this.loadRes(PathTool.getUIIconPath("startwork", "txt_cn_startwork01"), function (sp) {
                    this.btn_reward_list[i].flag_sp.spriteFrame = sp;
                }.bind(this))
            } else {
                this.btn_reward_list[i].flag.active = false;
            }

            if (v.item_list) {
                for (let k in v.item_list) {
                    let item = v.item_list[k];
                    if (k == 1) {
                        let item_config = Utils.getItemConfig(item.bid);
                        if (item_config) {
                            let str = cc.js.formatStr("%s*%s", item_config.name, item.num);
                            this.btn_reward_list[i].text_1.string = str;
                        }
                    } else {
                        let item_config = Utils.getItemConfig(item.bid);
                        if (item_config) {
                            let str = cc.js.formatStr("%s*%s", item_config.name, item.num);
                            this.btn_reward_list[i].text_2.string = str;
                        }
                    }
                }
            }
        }
    },

    stopRoundAction: function () {
        for (let i in this.btn_reward_list) {
            let v = this.btn_reward_list[i];
            if (v.round) {
                v.round.stopAllActions();
            }
        }
    },

    //活动时间
    holidayTime: function (data) {
        if (data.args) {
            var start_time, end_time
            for (let i in data.args) {
                let v = data.args[i];
                if (v.args_key == 1) {
                    start_time = v.args_val;
                } else {
                    end_time = v.args_val;
                }
            }

            if (start_time && end_time) {
                var time_str = cc.js.formatStr(Utils.TI18N("活动时间：%s 至 %s"), TimeTool.getYMD4(start_time), TimeTool.getYMD4(end_time))
                this.holiday_time_lb.string = time_str;
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        this.stopRoundAction();
    },
})