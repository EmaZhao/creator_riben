// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-28 19:06:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event")
var ActionOpenServerGiftItem = require("action_open_server_gift_item_panel")
var ActionOpenServerGiftWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_open_server_gift_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
        this.model = this.ctrl.getModel()
        this.open_server_charge_id = 0 //--当前充值ID
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.item_gift = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.time_text = this.main_container.getChildByName("label_time").getComponent(cc.Label)	//--活动倒计时
        this.time_text.string = "";
        this.btn_close = this.main_container.getChildByName("btn_close");
        this.panel_item = this.main_container.getChildByName("panel_item");
        this.main_container.active = false;
        this.loadRes(PathTool.getBigBg("action/txt_cn_action_open_server_gift"),function(res){
            this.main_container.getChildByName("img_bg").getComponent(cc.Sprite).spriteFrame = res;
            this.main_container.active = true;
        }.bind(this))
        this.loadRes(PathTool.getUIIconPath("aciontopenserver","aciontopenserver_4"),function(res){
            this.main_container.getChildByName("img_gift").getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(data.bid == this.holiday_bid){
                this.setData(data)
            }
        }.bind(this))
        this.btn_close.on('click',function(){
            Utils.playButtonSound(2)
            this.ctrl.openActionOpenServerGiftWindow(false)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(bid){
        if(bid){
            this.holiday_bid = bid
            this.ctrl.cs16603(this.holiday_bid)
            var MainuiController = require("mainui_controller")
            var MainuiConst = require("mainui_const")
            MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.open_server_recharge, false)
        }
    },
    setData(data){
        this.data = data
        let time = data.remain_sec || 0
        this.model.setCountDownTime(this.time_text, time)

        // -- status 0为可购买，2为买完（放后面）
        let sortFunc = function( objA, objB ){
            if(objA.status == objB.status){
                let price_a = 0 //-- 价格
                let price_b = 0
                for(let k=0;k<objA.aim_args.length;++k){
                    let v = objA.aim_args[k]
                    if(v.aim_args_key == 27){
                        price_a = v.aim_args_val
                    }
                }
                for(let k=0;k<objB.aim_args.length;++k){
                    let v = objB.aim_args[k]
                    if(v.aim_args_key == 27){
                        price_b = v.aim_args_val
                    }
                }
                return price_a - price_b
            }else{
                return objA.status - objB.status
            }
        }
        data.aim_list.sort(sortFunc)
        for(let i=0;i<data.aim_list.length;++i){
            let v = data.aim_list[i]
            let item = this.item_gift[v.aim]
            if(item == null){
                item = new ActionOpenServerGiftItem()
                item.setParent(this.panel_item)
                item.show()
                this.item_gift[v.aim] = item
            }
            let y = 2 + (284 * i) 
            item.setData(v)
            item.setPosition(0,-y)
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_gift){
            for(let i in this.item_gift){
                if(this.item_gift[i]){
                    this.item_gift[i].deleteMe()
                    this.item_gift[i] = null;
                }
            }
            this.item_gift = null;
        }
        this.ctrl.openActionOpenServerGiftWindow(false)
    },
})