// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 20:34:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var HeroEvent = require("hero_event");

var Hero_library_plot_window= cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_library_plot_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.panel = this.seekChild("panel");
        this.background_nd = this.seekChild("bg");
        this.panelBg_nd = this.seekChild(this.panel, "bg");
        this.name_label = this.seekChild(this.panel, "name_label", cc.Label);
        this.pic_top = this.seekChild("pic_top");
        this.pic_down = this.seekChild("pic_down");
        this.lock_1_nd = this.seekChild(this.pic_top, "lock");
        this.lock_2_nd = this.seekChild(this.pic_down, "lock");
        this.play_1_nd = this.seekChild(this.pic_top, "play");
        this.play_2_nd = this.seekChild(this.pic_down, "play");
        this.headIconTop_sp = this.seekChild(this.pic_top, "headIcon", cc.Sprite);
        this.headIconDown_sp = this.seekChild(this.pic_down, "headIcon", cc.Sprite);
        this.topReward_nd = this.seekChild(this.pic_top, "reward");
        this.downReward_nd = this.seekChild(this.pic_down, "reward");
        this.topHaveReward_nd = this.seekChild(this.pic_top, "haveGetReward");
        this.downHaveReward_nd = this.seekChild(this.pic_down, "haveGetReward");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent () {
        Utils.onTouchEnd(this.background_nd, function () {
            this.ctrl.openHeroPlotPanel(false);
        }.bind(this), 1);
        
        this.addGlobalEvent(HeroEvent.Hero_Get_Reward_Status, (data)=> {
            this.setRewardStatus(data.plot_list);
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd (hero_bid) {
        // console.error(`${hero_bid}`);
        
        this.name_label.string = Config.partner_data.data_partner_base[hero_bid].name;

        this.plot_config = Config.adult_data.data_plot_unlock[hero_bid];
        if(!this.plot_config) {
            // console.error("该英雄没有剧情配置");
            return;
        }

        this.ctrl.sender11125(this.plot_config.plot_id_list);

        // 英雄头像
		const head_Path = PathTool.getHeadRes(hero_bid);
		this.loadRes(head_Path, (res)=> {
			this.headIconTop_sp.spriteFrame = res;
		});
		this.loadRes(head_Path, (res)=> {
			this.headIconDown_sp.spriteFrame = res;
		});
        
        const isHave = this.model.getHadHeroStarBybid(hero_bid) == null ? false : true;
        this.lock_1_nd.active = !isHave;
        this.play_1_nd.active = !this.lock_1_nd.active;
       
        const isTwo = this.plot_config.plot_id_list.length == 2;
        // this.setBgHeigth(isTwo);
        this.pic_top.y = isTwo ? 69 : 0;
        this.pic_down.active = isTwo;
        this.pic_top.on(cc.Node.EventType.TOUCH_END, ( (event)=> {
            if(!isHave) {
                return;
            }
            this.onCusClickEvt(hero_bid, this.plot_config.plot_id_list[0]);
        }));

        if(isTwo) {
            const info = this.model.getTopLevHeroInfoByBid(hero_bid);
            const plot_id = this.plot_config.plot_id_list[1];
            const isGreaterThan100 = info.lev >= 100 || this.model.isUnlockPlotByPlotId(hero_bid, plot_id);
            this.play_2_nd.active = isGreaterThan100;
            this.lock_2_nd.active = !this.play_2_nd.active;
            this.pic_down.on(cc.Node.EventType.TOUCH_END, ( (event)=> {
                if(!this.plot_config || !isGreaterThan100) return;
                this.onCusClickEvt(hero_bid, plot_id);
            }));
        }

    },
    
    onCusClickEvt(hero_bid, plot_id) {
        const confirm_callback = ()=>{
            // console.log("播放剧情");
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openHeroPlotWindow(true, hero_bid, plot_id);
            this.ctrl.openHeroPlotPanel(false);
        };
        const cancel_callback = ()=> {
            Utils.playButtonSound(ButtonSound.Normal);
            // console.log("取消播放剧情");
        };
        this.CommonAlert = require("commonalert").show(Utils.TI18N("是否前往观看剧情"), Utils.TI18N("确定"),confirm_callback, Utils.TI18N("取消"), cancel_callback, null, null, null);
    },
    
    // 设置领取状态
    setRewardStatus(plot_list) {
        this.topReward_nd.active = true;
        this.topHaveReward_nd.active = false;
        this.downReward_nd.active = true;
        this.downHaveReward_nd.active = false;

        for(let i = 0, len = this.plot_config.plot_id_list.length; i < len; i++) {
            for(let j = 0, len = plot_list.length; j < len; j++) {
                const plotId = this.plot_config.plot_id_list[i];
                const result = plot_list[j];
                if(plotId == result.plot_id && result.val == 1) { // 0未领取 1已领取
                    const n = plotId.substring(plotId.lastIndexOf("_") + 1, plotId.length);
                    if(n == "1") {
                        this.topReward_nd.active = false;
                        this.topHaveReward_nd.active = true;
                    } else if(n == "2") {
                        this.downReward_nd.active = false;
                        this.downHaveReward_nd.active = true;
                    }
                    break;
                }
            }
        }
    },
    
    setBgHeigth(isTwo) {
        if(isTwo) {
            this.panelBg_nd.height = 710;
        } else {
            this.panelBg_nd.height = 452;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack () {
        this.headIconDown_sp.spriteFrame = null;
        this.headIconTop_sp.spriteFrame = null;
        this.ctrl.openHeroPlotPanel(false);
    },
})