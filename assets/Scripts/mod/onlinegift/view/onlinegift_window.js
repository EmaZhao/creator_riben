// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-05 10:46:42
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var OnlinegiftController = require("onlinegift_controller");
var TimeTool = require("timetool");

var OnlinegiftWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("onlinegift", "onlinegift_windows");
        this.viewTag = SCENE_TAG.dialogue;
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "background");
        this.bg = this.seekChild(this.root_wnd, "bg", cc.Sprite);
        this.textTime = this.seekChild(this.bg.node, "textTime", cc.Label);
        this.content = this.seekChild(this.bg.node, "content");
        this.loadRes(PathTool.getBigBg("action/txt_cn_online_gift"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));
        var y = 0;
        for(let i in Config.misc_data.data_get_time_items){
            let config = Config.misc_data.data_get_time_items[i];
            let item = ItemsPool.getInstance().getItem("backpack_item");
            item.setParent(this.content);
            item.initConfig(null, 0.9, false, false);
            item.setData({bid:config.items[0][0], num:config.items[0][1]});
            item.show();
            item.config = config;
            let idx = config.index - 1;
            y = -(parseInt(idx / 4) * 125 + 55);
            item.setPosition(idx % 4 * 124 + 62, y);
            this.item_list[config.index] = item;
            // item.addCallBack((function(obj){
            //     OnlinegiftController.getInstance().send10927(config.index);
            // }).bind(this));
        }
        this.content.height = 55 - y;
        Utils.getNodeCompByPath("bg/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("下档奖励:");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, function(event){
            Utils.playButtonSound("c_close");
            OnlinegiftController.getInstance().openOnlineGiftView(false);
        }, this);
        var OnlineGiftEvent = require("onlinegift_event");
        this.addGlobalEvent(OnlineGiftEvent.Get_Data, (function(data){
            this.updateData(data);
        }).bind(this));
        this.addGlobalEvent(OnlineGiftEvent.Update_Data, (function(time){
            for(let i in this.item_list){
                var item = this.item_list[i];
                if(item && item.config.time == time){
                    item.setExtendTag(true, Utils.TI18N("已领取"));
                    item.showItemEffect(false);
                    break;
                }
            }
        }).bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        OnlinegiftController.getInstance().send10926()
    },

    updateData : function(data){
        var gift_data = OnlinegiftController.getInstance().getModel().getOnlineGiftData();
        var time = OnlinegiftController.getInstance().getModel().getOnlineTime();
        var has_list = {};
        for(let i in gift_data){
            has_list[gift_data[i].time] = gift_data[i];
        }
        Log.info(gift_data, has_list);
        var lesstime = 0;
        for(let i in this.item_list){
            var item = this.item_list[i];
            var t = item.config.time;
            let index = item.config.index
            if(has_list[t]){
                item.setExtendTag(true, Utils.TI18N("已领取"));
                item.setItemIconUnEnabled(true)
                item.showItemEffect(false);
                item.addCallBack((function(obj){
                    OnlinegiftController.getInstance().send10927(index);
                }).bind(this));
                item.is_show_tips = false
            }else if(time >= t){
                // item.setExtendTag(false);
                item.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1);
                item.addCallBack((function(obj){
                    OnlinegiftController.getInstance().send10927(index);
                }).bind(this));
                item.is_show_tips = false
            }else{
                lesstime = lesstime || item.config.time - time;
                // item.setExtendTag(false);
                item.showItemEffect(false);
                item.is_show_tips = true
            }
        }
        this.textTime.string = "";
        if(lesstime > 0){
            this.ref_time = lesstime
            if(this.timer){
                gcore.Timer.del(this.timer);
                this.timer = null;
            }
            this.setLessTime();
        }else{
            this.textTime.string = TimeTool.getTimeFormat(0);
        }
    },

    setLessTime : function(){
        if(!cc.isValid(this.textTime) || !this.ref_time){
            return;
        }
        this.ref_time -= 1
        let lesstime = this.ref_time
        // Log.info("====>>>", lesstime, this.data, gcore.SmartSocket.getTime());
        if(lesstime > 0){
            this.textTime.string = TimeTool.getTimeFormat(lesstime);
            this.timer = gcore.Timer.set((function(){
                if(this.timer){
                    gcore.Timer.del(this.timer);
                    this.timer = null;
                }
                this.setLessTime();
            }).bind(this), 1000, 1);
        }else{
            this.textTime.string = "";
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(let k in this.item_list){
            this.item_list[k].deleteMe();
        }
        this.item_list = null;
        if(this.timer){
            gcore.Timer.del(this.timer);
            this.timer = null;
        }
        OnlinegiftController.getInstance().openOnlineGiftView(false);
    },
})
