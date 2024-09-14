// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     首页皮肤购买
// <br/>Create: 2019-09-18 14:33:15
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var mainUiController = require("mainui_controller")
var MainuiConst = require("mainui_const");
var ActionEvent = require("action_event");
var TimeTool = require("timetool")
var CommonScrollView = require("common_scrollview");
var ActionBuySkinWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_buy_skin_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.touch_buy_skin = true
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background")
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.bg_sp = this.main_container.getChildByName("bg").getComponent(cc.Sprite)
        this.attr_msg_rt = this.main_container.getChildByName("attr_msg").getComponent(cc.RichText)
        this.buy_btn = this.main_container.getChildByName("btn_buy")
        this.btn_fight = this.main_container.getChildByName("btn_fight")
        this.btn_fight.getChildByName("Label").getComponent(cc.Label).string = (Utils.TI18N("皮肤预览"))
        this.btn_buy_text = this.buy_btn.getChildByName("label").getComponent(cc.Label)
        this.time_text = this.main_container.getChildByName("time_text").getComponent(cc.Label)
        this.time_text.string = ("")
        this.goods_list = this.main_container.getChildByName("goods_list")
        this.close_btn = this.main_container.getChildByName("close_btn")
        let scroll_size = this.goods_list.getContentSize()
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 10,                  // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 8,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120 * 0.9,   // 单元的尺寸width
            item_height: 120 * 0.9, // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            scale:0.9
        }
        this.item_scroll_view = new CommonScrollView();
        this.item_scroll_view.createScroll(this.goods_list, cc.v2(-scroll_size.width/2,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_size, setting);
        this.setAttrGoodsData()
        this.setData()
        let vo = mainUiController.getInstance().getFunctionIconById(MainuiConst.icon.skin)
        let remain_sec = vo.end_time - gcore.SmartSocket.getTime();
        this.setLessTime(remain_sec)
        this.ctrl.sender30101()

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.SKIN_INFO_EVENT,function(data){
            if(data.code == 2){
                let btn = this.buy_btn.getComponent(cc.Button)
                btn.interactable = false;
                btn.enableAutoGrayEffect = true;
                this.buy_btn.getChildByName("label").getComponent(cc.LabelOutline).enabled = false;
                this.btn_buy_text.string = "已购买";
            }
        }.bind(this))
        this.close_btn.on('click',function(){
            Utils.playButtonSound(2)
            this.ctrl.openBuySkinWindow(false)
        },this)
        this.btn_fight.on('click',function(){
            Utils.playButtonSound(1)
            this.ctrl.sender30100()
        },this)
        this.buy_btn.on('click',function(){
            Utils.playButtonSound(1)
            this.setCheckHasHeroSkin()
        },this)
    },
    setCheckHasHeroSkin(){
        if(!this.touch_buy_skin) return;
        if(!this.cur_skin_id) return;

        this.setChargeSkin()
    },
    setChargeSkin(){
        Utils.delayRun(this.root_wnd,3,function(){
            this.touch_buy_skin = true
        }.bind(this))
        this.touch_buy_skin = false;
        if(this.buy_charge_id){
            let charge_config = Config.charge_data.data_charge_data[this.buy_charge_id]
            if(charge_config){
                SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image) 
            }
        }
    },
    setLessTime(less_time){
        if(!this.time_text){
            return
        }
        less_time =  less_time || 0
        if(less_time > 0){
            this.setTimeFormatString(less_time)
            if(this.time_tichet == null){
                this.time_tichet = gcore.Timer.set(function(){
                    less_time-- 
                    this.setTimeFormatString(less_time)
                    if(less_time <0 ){
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this),1000,-1)
            }
        }else{
            this.setTimeFormatString(less_time)
        }
    },
    setTimeFormatString(time){
        if(time > 0){
            this.time_text.string = TimeTool.getTimeForFunction(time);
        }else{
            this.time_text.string = "00:00:00";
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },
    setAttrGoodsData(){
        let config = Config.charge_data.data_constant["skin_award"]
        let item_list = config.val
        let skin_attr = Config.partner_skin_data.data_skin_info
        if(skin_attr && skin_attr[config.id]){
            let skinInfo =  skin_attr[config.id]
            this.cur_skin_id = skinInfo.skin_id
            this.loadRes(PathTool.getUIIconPath("bigbg",skinInfo.hero_info_bg_res),function(res){
                this.bg_sp.spriteFrame = res
            }.bind(this))
            let res = [];
            let str = "<outline color=#000000 width = 2>属性加成：</outline>";
            for(let i=0;i<skinInfo.skin_attr.length;++i){
                let v = skinInfo.skin_attr[i]
                let value = Utils.commonGetAttrInfoByKeyValue(v[0],v[1])
                res.push(value.res)
                str += "<img src='"+ value.icon +"'/> <color=#89FF83><outline color=#000000 width=2>" + value.attr_name + "+" + value.attr_val + "</outline></color> "
            }
            // <outline color=red width=4>A label with outline</outline>
            // let icon = PathTool.getAttrIconByStr("hp")
            // var res = [PathTool.getUIIconPath("common",icon)];
    
            // let str = cc.js.formatStr("<img src='%s'/>钻石<img src='%s'/>","3",icon)
            this.attr_msg_rt.string = str
            for(let i=0;i<res.length;++i){
                this.loadRes(res[i], (function (item,resObject) {
                    item.addSpriteFrame(resObject);
                }).bind(this,this.attr_msg_rt));
            }
        }

        if(item_list && item_list.length){
            let list = []
            for(let i=0;i<item_list.length;++i){
                let vo = {}
                vo.bid = item_list[i][0];
                vo.num = item_list[i][1];
                list.push(vo)
            }
            var item_count = list.length;
            var scroll_size = this.goods_list.getContentSize();
            if(item_count > 4){
                this.item_scroll_view.setClickEnabled(true);
                if(this.item_scroll_view.root_wnd){
                    this.item_scroll_view.root_wnd.x = -scroll_size.width/2;
                }
                
            }else{
                this.item_scroll_view.setClickEnabled(false);
                if(this.item_scroll_view.root_wnd){
                    this.item_scroll_view.root_wnd.x = -scroll_size.width/2+(5 - item_count) * 10 + (4 - item_count) * 55;
                }
            }
            this.item_scroll_view.setData(list);
            this.item_scroll_view.addEndCallBack(function(){
                var list = this.item_scroll_view.getItemList();
                for(var i in list){
                    list[i].setDefaultTip();
                }
            }.bind(this));
        }
    },
    setData(){
        let config = Config.charge_data.data_constant["skin_package_id"]
        if(config){
            this.buy_charge_id = config.val || 0
            let charge = Config.charge_data.data_charge_data[config.val]
            if(charge && charge.val){
                this.btn_buy_text.string = Utils.TI18N("￥" + charge.val) 
            }
        }

    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.item_scroll_view){
            this.item_scroll_view.deleteMe()
            this.item_scroll_view = null;
        }
        this.ctrl.openBuySkinWindow(false)
    },
})