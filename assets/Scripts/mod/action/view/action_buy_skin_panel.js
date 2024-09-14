// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动皮肤购买
// <br/>Create: 2019-09-25 09:52:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var CommonScrollView = require("common_scrollview");
var ActionEvent = require("action_event");
var TimeTool = require("timetool")
var ActionConst = require("action_const")
var ActionBuySkinPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_buy_skin_panel");
        this.holiday_bid = arguments[0]
        this.ctrl =  ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.touch_buy_skin = true
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let x = this.getPositionX()
        this.setPosition(x,-25)
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.holiday_bg = this.main_container.getChildByName("bg").getComponent(cc.Sprite)
        this.setHolidayBG()
        
        this.btn_fight = this.main_container.getChildByName("btn_fight")
        this.attr_msg_rt = this.main_container.getChildByName("attr_msg").getComponent(cc.RichText)
        this.btn_fight.getChildByName("Text_1").getComponent(cc.Label).string = (Utils.TI18N("皮肤预览"))
    
        this.btn_buy = this.main_container.getChildByName("btn_buy").getComponent(cc.Button)
        this.btn_buy_text = this.btn_buy.node.getChildByName("Text_4").getComponent(cc.Label)
        this.btn_buy_text.string = ("")
        this.time_text = this.main_container.getChildByName("time_text").getComponent(cc.Label)
        this.time_text.string = ("")
    
        this.goods_list = this.main_container.getChildByName("goods")
        let scroll_view_size = this.goods_list.getContentSize()

        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 10,                    // x方向的间隔
            start_y: 8,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120 * 0.9,   // 单元的尺寸width
            item_height: 120 * 0.9, // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            scale:0.9
        }
        this.item_scroll_view = new CommonScrollView();
        this.item_scroll_view.createScroll(this.goods_list, cc.v2(-scroll_view_size.width/2,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
    },
    setHolidayBG(){
        let str_bg = "txt_cn_hero_skin_buy"
        let tab_vo = this.ctrl.getActionSubTabVo(this.holiday_bid)
        if(tab_vo && tab_vo.aim_title != "" && tab_vo.aim_title){
            str_bg = tab_vo.aim_title
        }
        let path = PathTool.getUIIconPath("bigbg/action", str_bg , "jpg")
        this.loadRes(path,function(res){
            this.holiday_bg.spriteFrame = res;
        }.bind(this))
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE, function (data) {
            if (data.bid == this.holiday_bid) {
                this.setData(data)
                this.setLessTime(data.remain_sec)
            }
        }.bind(this))
        this.btn_fight.on('click',function(){
            Utils.playButtonSound(1)
            var TimesummonController = require("timesummon_controller")
            TimesummonController.getInstance().send23219(ActionConst.ActionRankCommonType.action_skin_buy)
        },this)
        this.btn_buy.node.on('click',function(){
            Utils.playButtonSound(1)
            this.setCheckHasHeroSkin()
        },this)
        this.ctrl.cs16603(this.holiday_bid)
    },
    setCheckHasHeroSkin(){
        if(!this.touch_buy_skin) return;
        if(!this.cur_skin_id) return;

        //判断皮肤是否拥有
        var HeroController = require("hero_controller")
        let is_has_skin = HeroController.getInstance().getModel().isUnlockHeroSkin(this.cur_skin_id, true)
        if(is_has_skin){
            let skin_info = Config.partner_skin_data.data_skin_info
            if(skin_info && skin_info[this.cur_skin_id]){
                let data = skin_info[this.cur_skin_id].diamond_num
                if(data && data[0]){
                    let item_config = Utils.getItemConfig(data[0][0])
                    let icon_src = PathTool.getIconPath("item",item_config.icon)
                    let str = cc.js.formatStr(Utils.TI18N("您已拥有当前皮肤的永久使用权，再次购买后使用将会转化成 <img src='%s'/><color=#289b14> *%d </color>，是否继续购买？"),item_config.icon,data[0][1])
                    let call_back = function(){
                        this.setChargeSkin()
                    }.bind(this)
                    let other_args = {}
                    other_args.align = cc.macro.TextAlignment.LEFT;
                    other_args.resArr = [icon_src]
                    var CommonAlert = require("commonalert");
                    CommonAlert.show(str, Utils.TI18N("确定"), call_back, Utils.TI18N("取消"), null, null, null,other_args)
                    return
                }
            }
        }
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
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },
    setData(data_list){
        let data = data_list.aim_list || null

        if(data && data[0] && data[0].aim_args){
            let skin_list = Utils.keyfind('aim_args_key', 35, data[0].aim_args) || null
            let skin_count
            if(skin_list){
                skin_count = skin_list.aim_args_val || 0
            }
            if(skin_count){
                this.cur_skin_id = skin_count
                this.setAttrGoodsData(skin_count,data[0].item_list)
            }

            if(data_list.finish != 0){
                // setChildUnEnabled(true, this.btn_buy)
                this.btn_buy_text.string = (Utils.TI18N("已购买"))
                this.btn_buy_text.node.getComponent(cc.LabelOutline).enabled = false;
                this.btn_buy.interactable = false;
                this.btn_buy.enableAutoGrayEffect = true;
            }else{
            //     --现价
                let new_list = Utils.keyfind('aim_args_key', 33, data[0].aim_args) || null
                let buy_charge_id
                if(new_list){
                    buy_charge_id = new_list.aim_args_val || 0
                }
                if(buy_charge_id){
                    this.buy_charge_id = buy_charge_id
                    let charge_data = Config.charge_data.data_charge_data
                    if(charge_data[buy_charge_id]){
                        this.btn_buy_text.string = Utils.TI18N(charge_data[buy_charge_id].val)
                    }
                }
            }
        }
    },
    setAttrGoodsData(bid, item_list){
        let skin_attr = Config.partner_skin_data.data_skin_info
        if(skin_attr && skin_attr[bid]){
            let skinInfo =  skin_attr[bid]
            let res = [];
            let str = "<outline color=#000000 width = 2>属性加成：</outline>";
            for(let i=0;i<skinInfo.skin_attr.length;++i){
                let v = skinInfo.skin_attr[i]
                let value = Utils.commonGetAttrInfoByKeyValue(v[0],v[1])
                res.push(value.res)
                str += "<img src='"+ value.icon +"'/> <color=#89FF83><outline color=#000000 width=2>" + value.attr_name + "+" + value.attr_val + "</outline></color> "
            }
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
                vo.bid = item_list[i].bid;
                vo.num = item_list[i].num;
                list.push(vo)
            }
            var item_count = list.length;
            var scroll_size = this.goods_list.getContentSize();
            this.item_scroll_view.setData(list);
            this.item_scroll_view.addEndCallBack(function(){
                var list = this.item_scroll_view.getItemList();
                for(var i in list){
                    list[i].setDefaultTip();
                }
                if(item_count > 5){
                    this.item_scroll_view.setClickEnabled(true);
                    if(this.item_scroll_view.root_wnd){
                        this.item_scroll_view.root_wnd.x = -scroll_size.width/2;
                    }
                }else{
                    this.item_scroll_view.setClickEnabled(false);
                    if(this.item_scroll_view.root_wnd){ 
                        this.item_scroll_view.root_wnd.x = -scroll_size.width/2 +  (( 5 - item_count) * (120 * 0.9) + (5 - item_count) * 10)/2;
                    }
                }
            }.bind(this));
        }
    },
    setLessTime(less_time){
        if(!this.time_text){
            return
        }
        less_time =  less_time || 0;
        if (less_time > 0){
            this.setTimeFormatString(less_time)
            if(this.time_tichet == null){
                this.time_tichet = gcore.Timer.set(function(){
                    less_time-- 
                    if(less_time < 0){
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                    }else{
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
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if (this.item_scroll_view){
            this.item_scroll_view.deleteMe();
            this.item_scroll_view = null;
        }
    },
})