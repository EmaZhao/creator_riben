// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     公会副本挑战结算面板
// <br/>Create: 2019-04-18 11:42:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildBossController = require("guildboss_controller");

var Guildboss_resultWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_result_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = GuildBossController.getInstance();
        this.label_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var container = this.seekChild("container");

        this.title_container = this.seekChild("title_container");
        this.special_sk = this.title_container.getComponent(sp.Skeleton);

        // this.dps_list_btn = this.seekChild("dps_list_btn");
        this.harm_btn = this.seekChild("harm_btn");
        // this.harm_btn

        this.partner_item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.partner_item.setPosition(-200, 8)
        this.partner_item.show();
        this.partner_item.setParent(container);

        this.dps_value_lb = this.seekChild("dps_value", cc.Label);
        this.container = container;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openGuildbossResultWindow(false)
        }.bind(this), 2)
        // Utils.onTouchEnd(this.dps_list_btn, function () {
        //     this.ctrl.openGuildbossResultDpsRankWindow(true, this.data)
        // }.bind(this), 1)
        Utils.onTouchEnd(this.harm_btn, function () {
            if (this.data && Utils.next(this.data) != null) {
                require("battle_controller").getInstance().openBattleHarmInfoView(true, this.data);
            }
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        Utils.playButtonSound("c_win");
        this.handleEffect(true);
        if (data != null) {
            this.data = data;
            this.dps_value_lb.string = cc.js.formatStr(Utils.TI18N("总伤害：%s"), data.all_dps);
            var hero_vo = require("hero_controller").getInstance().getModel().getHeroById(data.best_partner);
            this.partner_item.setData(hero_vo);
            this.createRewardsList(data.award_list);
            this.harm_btn.active = true;
        }
    },

    //创建奖励
    createRewardsList: function (award_list) {
        if (award_list == null) return
        var _y = 0;
        var item_config = null;
        var index = 1;
        var item_name = "";
        for (var i in award_list) {
            var v = award_list[i];
            item_config = Utils.getItemConfig(v.bid);
            if (item_config) {
                _y = 36 - (index - 1) * 50;
                const rich_label = Utils.createRichLabel(24, new cc.Color(0x35,0xff,0x14,0xff), cc.v2(0, 0.5), cc.v2(-100, _y), null, 500, this.container);
                rich_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
                if (item_config.id == Config.item_data.data_assets_label2id.guild) {
                    item_name = Utils.TI18N("贡献")
                } else {
                    item_name = item_config.name;
                }
                rich_label.string = cc.js.formatStr("%s%s：<img src='%s' scale=0.4 /> +%s", Utils.TI18N("獲得"), item_name, item_config.icon, v.num);
                var res = PathTool.getItemRes(item_config.icon);
                this.loadRes(res, (function (resObject) {
                    rich_label.addSpriteFrame(resObject);
                }).bind(this));
                index = index + 1;
                this.label_list.push(rich_label)
            }
        }
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
            }
        } else {
            if (this.special_sk) {
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(103))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action_2, false)
                }.bind(this))
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.ctrl.openGuildbossResultWindow(false)
        this.handleEffect(false)
        if (this.partner_item) {
            this.partner_item.deleteMe();
            this.partner_item = null;
        }
        if(this.label_list){
            for(var k in this.label_list){
                var v = this.label_list[k];
                if(v){
                    v.node.destroy();
                    v = null
                }
            }
            this.label_list = null;
        }
    },
})