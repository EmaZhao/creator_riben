// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var LoaderManager = require("loadermanager")
var RoleController = require("role_controller");
var ExchangeController = require("exchange_controller");
var ExchangeEvent = require("exchange_event");
var TimeTool = require("timetool");

var ExchangeWindow = cc.Class({
    extends: BaseView,
    ctor:function(){
        this.prefabPath = PathTool.getPrefabPath("exchange", "exchange_main_win");
        this.viewTag = SCENE_TAG.dialogue;
    },

    openCallBack: function () { 
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.background = this.root_wnd.getChildByName("background");
        this.bg = this.root_wnd.getChildByName("bg").getComponent(cc.Sprite);
        LoaderManager.getInstance().loadRes(PathTool.getBigBg("bigbg_65", "png"), (function (spriteFrame) {
            this.bg.spriteFrame = spriteFrame;
        }).bind(this))
        this.objects = {};
        for(let i=1; i<=3; i++){
            var item = {};
            item.remain = this.main_container.getChildByName("remain_text_" + i).getComponent(cc.Label);
            item.btn = this.main_container.getChildByName("btn_" + i);
            item.get = this.main_container.getChildByName("get_" + i);
            item.gold = item.btn.getChildByName("label").getComponent(cc.Label);
            item.coin = this.main_container.getChildByName("coin_" + i).getChildByName("label").getComponent(cc.Label);
            this.objects[i] = item;
            LoaderManager.getInstance().loadRes(PathTool.getItemRes("1"), (function (res) {
                this.main_container.getChildByName("coin_" + i).getChildByName("icon").getComponent(cc.Sprite).spriteFrame = res
            }).bind(this))
            if(this.main_container.getChildByName("btn_" + i).getChildByName("icon")){
                LoaderManager.getInstance().loadRes(PathTool.getItemRes("3"), (function (res) {
                    this.main_container.getChildByName("btn_" + i).getChildByName("icon").getComponent(cc.Sprite).spriteFrame = res
                }).bind(this))
                
            }
        }
        this.textTime = this.main_container.getChildByName("textTime").getComponent(cc.Label);
        Utils.getNodeCompByPath("main_container/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("刷新时间:");
    },

    registerEvent: function () {
        this.background.on(cc.Node.EventType.TOUCH_END, function(event){
            Utils.playButtonSound(2)
            ExchangeController.getInstance().openExchangeMainView(false);
        }, this);

        for(let i in this.objects){
            this.objects[i].btn.on(cc.Node.EventType.TOUCH_END, function(event){
                Utils.playButtonSound(1)
                if (this.objects[i].v){
                    ExchangeController.getInstance().send23607(this.objects[i].v.id);
                }
            }, this)
        }

        this.addGlobalEvent(ExchangeEvent.Extra_Reward, function(data){
            this.updateData(data);
        }, this);
    },

    openRootWnd: function(){
        ExchangeController.getInstance().send23606();
    },

    updateData: function(data){
        this.data = data
        this.setLessTime();
        for(let i in data.list){
            var v = data.list[i];
            var item = this.objects[v.id];
            item.v = v;
            item.remain.string = Utils.TI18N("残り：" + Math.max(0, v.max-v.num));
            item.coin.string = v.gain;
            if(v.num >= v.max){
                item.btn.active = false;
                item.get.active = true;
            }else{
                item.btn.active = true;
                item.get.active = false;
                if(v.price == 0){
                    item.gold.string = Utils.TI18N("免费获取");
                }else{
                    item.gold.string = v.price + Utils.TI18N("获取");
                }
            }
        }
    },

    setLessTime : function(){
        if(!cc.isValid(this.textTime) || !this.data){
            return;
        }
        let lesstime = this.data.ref_time - gcore.SmartSocket.getTime();
        // Log.info("====>>>", lesstime, this.data, gcore.SmartSocket.getTime());
        if(lesstime > 0){
            this.textTime.string = TimeTool.getTimeFormat(lesstime);
            this.timer = gcore.Timer.set((function(){
                this.setLessTime();
                this.timer = null;
            }).bind(this), 1000, 1);
        }else{
            this.textTime.string = "00:00:00";
        }
    },

    closeCallBack: function () {
        ExchangeController.getInstance().openExchangeMainView(false);
        if(this.timer){
            gcore.Timer.del(this.timer);
        }
        LoaderManager.getInstance().deleteRes(PathTool.getBigBg("bigbg_65", "png"));
    }
});

module.exports = ExchangeWindow;