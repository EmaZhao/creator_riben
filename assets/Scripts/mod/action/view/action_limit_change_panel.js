// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-19 13:56:56
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionConst = require("action_const");
var ActionEvent = require("action_event");
var RoleController = require("role_controller")
var TimeTool = require("timetool")
var MallController = require("mall_controller")
var RoleEvent = require("role_event")
var color_data = {
    [1] : [0xe7,0xd4,0x99,0xff],
    [2] : [0xdc,0xfc,0xff,0xff],
    [3] : [0xf6,0xe4,0xad,0xff],
    [4] : [0xff,0xcf,0x90,0xff],
    [5] : [0x64,0x32,0x23,0xff],
}
var color_has_title = {
    [1] : [0xb5,0xaa,0xd4,0xff],
    [2] : [0xaf,0xf8,0xff,0xff],
    [3] : [0xff,0xff,0xff,0xff],
    [4] : [0xff,0xcf,0x90,0xff],
    [5] : [0x64,0x32,0x23,0xff],
}
var ActionLimitChangePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_change_panel");
        this.ctrl =  ActionController.getInstance()
        this.role_vo = RoleController.getInstance().getRoleVo()
        // --此活动的兑换id 后端会传过来 先默认 80101
        this.action_item_id = 80101;
        this.rewardList = null
        this.holiday_bid = arguments[0];
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        let x = this.getPositionX()
        this.setPosition(x,-20)
        this.viewContent = this.seekChild("content")
        self.main_container = self.root_wnd.getChildByName("main_container");
        self.title_img = self.main_container.getChildByName("title_img");
        let limit_change_const = Config.function_data.data_limit_change_const
        let config_data = limit_change_const[this.holiday_bid]
        let str = "txt_cn_action_limit_change_panel"
        if(config_data){
            str = config_data.bg_name 
        }
        let path = PathTool.getUIIconPath("bigbg/action",str)
        this.loadRes(path,function(res){
            self.title_img.getComponent("cc.Sprite").spriteFrame =  res;
        }.bind(this))
        self.dec_title = self.main_container.getChildByName("dec_title")
        self.item_scrollview = self.main_container.getChildByName("item_scrollview")
        this.dec_val = self.main_container.getChildByName("dec_val")
        let item_dec_label = self.main_container.getChildByName("item_dec_label")
        let rule_color_1 = "ffcf90"
        if(config_data){
            rule_color_1 = config_data.title_color
        }
        let color = new cc.Color().fromHEX(rule_color_1)
        self.dec_val.color = color
        self.dec_title.color = color
        let has_color = "ffcf90";
        if(config_data){
            has_color = config_data.has_prop_color
        }
        item_dec_label.color = new cc.Color().fromHEX(has_color)
        // --道具
        self.item_icon = self.main_container.getChildByName("item_icon")
        self.item_count =  self.main_container.getChildByName("item_count")
        let time_color
        if(config_data){
            time_color = config_data.time_color1
        }
        self.time_val_rt =  self.main_container.getChildByName("time_val").getComponent(cc.RichText)
        self.time_val_rt.node.color =  new cc.Color().fromHEX(time_color)
        self.comfirm_btn = self.main_container.getChildByName("comfirm_btn")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(data && data.bid == this.holiday_bid){
                this.setData(data);
                this.setLessTime(data.remain_sec - 2*24*60*60)
            }
        }.bind(this))
        this.comfirm_btn.on('click',this.onComfirmBtn,this)
        if (!this.role_lev_event && this.role_vo){
            this.role_lev_event =  this.role_vo.bind(RoleEvent.UPDATE_ROLE_ACTION_ASSETS, function(id, value){
                if (id && id == this.action_item_id && this.role_vo){ 
                    let count = this.role_vo.getActionAssetsNumByBid(this.action_item_id)
                    this.item_count.getComponent(cc.Label).string = count;
                }
            }.bind(this))
        }
        this.ctrl.cs16603(this.holiday_bid)
    },
    // --前往兑换
    onComfirmBtn(){
        Utils.playButtonSound(1)
        MallController.getInstance().openMallActionWindow(true, this.holiday_bid)
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setVisibleStatus(bool){
        bool = bool || false
        this.setVisible(bool) 
    },
    setLessTime(less_time){
        var self = this
        if(!self.time_val_rt) return;
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
        if (time > 0){
            let str = "終了時間：<color=#00ff0c>"+TimeTool.getTimeFormatDayIIIIII(time)+"</color>";
            if (this.holiday_bid == ActionConst.ActionChangeCommonType.limit_yuanzhen || this.holiday_bid == ActionConst.ActionChangeCommonType.limit_yuanzhen1){
                str = "終了時間：<color=#249003>"+TimeTool.getTimeFormatDayIIIIII(time)+"</color>";
            }
            this.time_val_rt.string = str;
        }else{
            let str = "終了時間：<color=#00ff0c>既に終了</color>";
            if(this.holiday_bid == ActionConst.ActionChangeCommonType.limit_yuanzhen || this.holiday_bid == ActionConst.ActionChangeCommonType.limit_yuanzhen1){
                str = "終了時間：<color=#249003>既に終了</color>";
            }
            this.time_val_rt.string = str;
        }
    },
    setData(data){
        var self = this;
        let text = data.client_reward
        text = text.replace("（", "(")
        text = text.replace("）", ")")
        self.dec_val.getComponent(cc.Label).string = text;

        // --物品id
        let item_id
        let item_list = Utils.keyfind('aim_args_key', 4, data.aim_list[0].aim_args) || null
        if (item_list){
            item_id = item_list.aim_args_val
        }

        if (item_id){
            self.action_item_id = item_id
            let config = Utils.getItemConfig(item_id)
            if (config && self.item_icon){
                let head_icon = PathTool.getItemRes(config.icon)
                self.item_icon.setScale(0.4)       
                this.loadRes(head_icon,function(res){
                    self.item_icon.getComponent(cc.Sprite).spriteFrame = res;
                }.bind(this))
            }
            let count = self.role_vo.getActionAssetsNumByBid(item_id)
            self.item_count.getComponent(cc.Label).string = count;
        }

        if (self.rewardList) return 
        self.rewardList = [];
        // --道具列表
        let scale = 0.9
        let meter = 120
        for(let i=0;i<data.item_effect_list.length;++i){
            let v = data.item_effect_list[i]
            let node = new cc.Node()
            node.width = meter*scale
            node.height = meter*scale
            let item_node = ItemsPool.getInstance().getItem("backpack_item")
            item_node.setDefaultTip()
            item_node.setParent(node);
            item_node.initConfig(false, scale, false, true);
            item_node.show();
            item_node.setData({bid:v.bid, num:1})
            if(v.effect_1>0){
                let itemConfig = Utils.getItemConfig(v.bid)
                if(itemConfig && itemConfig.quality >= 4){
                    item_node.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1)
                }else{
                    item_node.showItemEffect(true, 263, PlayerAction.action_2, true, 1.1)
                }
            }
            this.rewardList.push(item_node)
            this.viewContent.addChild(node) 
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        this.action_item_id = null;
        this.rewardList = null;
        this.holiday_bid = null;
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.rewardList){
            for(let i=0;i<this.rewardList.length;++i){
                if(this.rewardList[i].deleteMe){
                    this.rewardList[i].deleteMe()
                }
            }
        }
        if(this.role_lev_event){
            this.role_vo.unbind(this.role_lev_event)
            this.role_lev_event = null
        }
    },
})