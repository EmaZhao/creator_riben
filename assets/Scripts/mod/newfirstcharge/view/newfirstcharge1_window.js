// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-15 17:44:42
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var NewFirstChargeEvent = require("newfirstcharge_event");
var RoleController = require("role_controller");
var Newfirstcharge1Window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("newfirstcharge", "newfirstcharge1_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.effect_list = []
        this.cur_node = null
        this.item_list = {}
        this.recharge_list = {}
        this.select = new cc.Color().fromHEX("#AB382B")
        this.notSelect = new cc.Color().fromHEX("#EC9A3B")
        this.item_reward_list = [];
        for(var i = 1;i<=3;i++){
            this.item_reward_list[i] = {};
        }
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        let bg_sp = this.seekChild("bg",cc.Sprite)
        this.loadRes(PathTool.getBigBg("action/txt_cn_action_bigbg_30506"),function(res){
            bg_sp.spriteFrame = res
        }.bind(this))
        this.close_btn = this.seekChild("newfirstcharge_btn_close");
        this.btn_recharge = this.seekChild("newfirstcharge_btn_bottom")
        this.loadRes(PathTool.getUIIconPath("newfirstcharge","newfirstcharge_btn_bottom"),function(res){
            this.btn_recharge.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        this.recharge_6_nd = this.seekChild("toggle1");
        this.recharge_6_lb = this.seekChild(this.recharge_6_nd,"Label",cc.Label)
        this.recharge_100_nd = this.seekChild("toggle2");
        this.recharge_100_lb = this.seekChild(this.recharge_100_nd,"Label",cc.Label)
        this.text_rt = this.seekChild("Text",cc.RichText)
        this.text_rt.string = Utils.TI18N("<color=#643223>机会仅</color><color=#157e22>1</color><color=#643223>次！以下仅可选择一个充值档位获得</color><color=#157e22>四倍</color><color=#643223>钻石！</color>")
        this.recharge_6_lb.string = Utils.TI18N("首充赠礼")
        this.recharge_100_lb.string = Utils.TI18N("2000DMMポイント")
        this.tab_view = [this.recharge_6_nd,this.recharge_100_nd]
        this.remain_charge = this.seekChild("recharge_num",cc.Label)
        this.remain_charge.string = cc.js.formatStr(Utils.TI18N("已累充: %d"),Math.floor(this.role_vo.vip_exp));
        for(let i=0;i<this.tab_view.length;++i){
            this.tab_view[i].index = i;
            this.tab_view[i].on("toggle",function(event){
                this.changeTabView(i)
            },this)
        }
        this.model.setFirstRechargeNewData();
        this.recharge_info_nd = this.seekChild("rechargeInfo")
        this.help_nd = this.seekChild(this.recharge_info_nd,"help")
        for(var i = 1;i<=3;i++){
            var item = this.recharge_info_nd.getChildByName("item_"+i);
            if(item){
                var object = {}
                object.scroll = item.getChildByName("scroll").getChildByName("content");
                object.finish_icon = item.getChildByName("finish_icon")
                object.finish_icon.active = false;
                object.title = item.getChildByName("title").getComponent(cc.Label);
                object.title.string = Utils.TI18N("第")+i+Utils.TI18N("天免费领");
                object.list = {}
                this.item_list[i] = object;
            }
        }
        this.btn_label = this.btn_recharge.getChildByName("Label").getComponent(cc.Label)
        this.btn_label.string = (Utils.TI18N("前往充值"))
        let chargeBtn = this.seekChild("newfirstcharge_effect")
        for(let i=1;i<5;++i){
            let obj = {}
            obj.node = chargeBtn.getChildByName("charge_item_"+i)
            obj.node.active = false;
            obj.bg = obj.node.getComponent(cc.Sprite)
            obj.node.getChildByName("title_img").getChildByName("num").getComponent(cc.Label).string = Utils.TI18N("4倍")
            obj.rmbNum = obj.node.getChildByName("layout").getChildByName("rmb").getComponent(cc.Label);
            obj.goldNum = obj.node.getChildByName("layout").getChildByName("goldIcon").getChildByName("goldNum").getComponent(cc.Label);
            obj.referral = obj.node.getChildByName("referral")
            obj.referral.active = false;
            this.recharge_list[i] = obj;
            let icon_sp = obj.node.getChildByName("layout").getChildByName("goldIcon").getChildByName("gold").getComponent(cc.Sprite)
            this.loadRes(PathTool.getItemRes("3"),function(res){
                icon_sp.spriteFrame = res
            })
            obj.node.on('click',function(){
                Utils.playButtonSound(1)
                let config = Config.charge_data.data_quadruple_rebate[i]
                let charge_config = Config.charge_data.data_charge_data[config.charge_id]
                SDK.pay(config.val,1,config.charge_id,charge_config.name,charge_config.product_desc,null,null,charge_config.pay_image)
            },this)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(NewFirstChargeEvent.New_First_Charge_Event,function(data){
            this.updata_charge_data = data
            let role_vo = RoleController.getInstance().getRoleVo()
            let totle_str = cc.js.formatStr(Utils.TI18N("已累充: %d"),Math.floor((role_vo.vip_exp)))
            this.remain_charge.string = totle_str
            this.setRedPointTab()
            this.updateData(data)
        }.bind(this));

        // this.addGlobalEvent(WelfareEvent.Update_Yueka, function (data) {}.bind(this));
        this.close_btn.on("click",function(){
            Utils.playButtonSound(2)
            this.ctrl.openNewFirstChargeView(false);
        },this)
        this.btn_recharge.on('click',function(){
            let first_data = this.model.getFirstRechargeData(this.cur_node.index+1)
            if(this.get_gift_id == 0){
                this.setVisible(false)
                VipController.getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE,null,function(){
                    this.setVisible(true)
                }.bind(this))
            }else if(this.get_gift_id == 1){
                if(first_data[this.gift_index]){
                    this.ctrl.sender21001(first_data[this.gift_index].id)
                }
            }else{
                this.ctrl.openNewFirstChargeView(false)
            }
        },this)
        this.help_nd.on("click",function(event){
            Utils.playButtonSound(3)
            var config = Config.holiday_client_data.data_constant.shouchong_rules
            let pos = event.node.convertToWorldSpaceAR(cc.v2(0, 0))
            require("tips_controller").getInstance().showCommonTips(config.desc,pos)
        },this)
        
        if (this.role_assets_event == null) {
            this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                if (key == "vip_exp") {
                    let totle_str = cc.js.formatStr(Utils.TI18N("已累充: %d"),Math.floor((value)))
                    this.remain_charge.string = totle_str
                    this.updateData()
                }
                // else if(key == "gold_acc"){
                //   let totle_str = cc.js.formatStr(Utils.TI18N("已累充: %d"),Math.floor(value*2));
                //   this.gold_acc = value;
                //   this.remain_charge.string = totle_str;
                // }
            }.bind(this))
        }
        
        
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(index){
        index = index || 1;
        this.tab_view[index-1].getComponent(cc.Toggle).check()
        if(index == 1){
            this.changeTabView(index-1)
        }
        this.ctrl.sender21000();
    },
    changeTabView(index){
        let temp = this.cur_node
        if(temp){
            temp.getChildByName("Label").color = this.notSelect 
        }else{
            for(let i=0;i<this.tab_view.length;++i){
                this.tab_view[i].getChildByName("Label").color = this.notSelect 
            }
        }
        this.cur_node = this.tab_view[index]
        this.cur_node.getChildByName("Label").color = this.select
        let first_data = this.model.getFirstRechargeData(index+1)
        this.fillItemList(first_data)
        if(this.updata_charge_data){
            this.updateData(this.updata_charge_data)
        }
    },
    updateData(){
        var status_list = [[1,2,3],[4,5,6]];
        var charge_list = [];
        let index = this.cur_node.index
        for(let i=0;i<status_list[index].length;++i){
            let status = this.model.getFirstBtnStatus(status_list[index][i]);
            charge_list[i] = status;
            this.item_list[parseInt(i)+1].finish_icon.active = status==2;
        }

        this.gift_index = 0 //领取的位置
        var totle = 0;
        this.get_gift_id = 10;
        for(var i=0;i<charge_list.length;++i){
            totle = totle + charge_list[i];
            if(charge_list[i] == 1){
                this.get_gift_id = 1;
			    this.gift_index = i;
            }
        }
        this.btn_recharge.active = false;
        let role_vo = RoleController.getInstance().getRoleVo()
        if(role_vo.vip_exp*0.2 < 6){
            for(let i in this.recharge_list){
                let config = Config.charge_data.data_quadruple_rebate[i]
                let obj = this.recharge_list[i]
                obj.node.active = true;
                obj.rmbNum.string = config.val;
                obj.goldNum.string = config.gold
                if(config.star == 1){
                    obj.referral.active = true;
                    this.loadRes(PathTool.getUIIconPath("newfirstcharge","newfirstcharge_btn_top"),function(res){
                        obj.bg.spriteFrame = res
                    }.bind(this))
                }else{
                    obj.referral.active = false;
                    this.loadRes(PathTool.getUIIconPath("newfirstcharge","newfirstcharge_btn_bottom"),function(res){
                        obj.bg.spriteFrame = res
                    }.bind(this))
                }
            }
        }else{
            this.text_rt.string = Utils.TI18N("<color=#643223>累計2000DMMポイント消費して豪華報酬を手に入れよう！</color>")
            for(let i in this.recharge_list){
                let obj = this.recharge_list[i]
                obj.node.active = false
            }
            this.btn_recharge.active = true;
            if(totle == 0){
                this.get_gift_id = 0;
                this.btn_label.string = Utils.TI18N("前往充值");
            }else if(totle == 1 || totle == 3 || totle == 5){
                this.btn_label.string = Utils.TI18N("领取奖励");
            }else if(totle == 2 || totle == 4){
                this.btn_label.string = Utils.TI18N("明日再来");
            }else if(totle == 6){
                this.btn_label.string = Utils.TI18N("领取完毕");
            }
        }
    },
    setRedPointTab(){
        var status_1 = false;
        for(var i = 1;i<=3;i++){
            var get_data = this.model.getFirstBtnStatus(i);
            if(get_data){
                if(get_data == 1){
                    status_1 = true;
				    break;
                }
            }
        }
        Utils.addRedPointToNodeByStatus(this.tab_view[0],status_1)
        var status_2 = false;
        for(var i = 4;i<=6;i++){
            var get_data = this.model.getFirstBtnStatus(i);
            if(get_data){
                if(get_data == 1){
                    status_2 = true;
				    break;
                }
            }
        }
        Utils.addRedPointToNodeByStatus(this.tab_view[1],status_2)
    },
    fillItemList:function(list){
        var scale = 0.7;
        var size = 119 * scale;
        var create_index = 1;
        for(let i=0;i<list.length;i++){
            var object = this.item_list[i+1];
            var num = list[i].item_list.length;
            object.scroll.setContentSize(cc.size(size*num + (list.length - 1)*10, object.scroll.getContentSize().height));
            for(let k=0;k<num;k++){
                var _x = size * (k+1) - size * 0.5 +(k * 10);
                var _y = size * 0.5;
                if(!this.item_reward_list[i+1][k]){
                    this.item_reward_list[i+1][k] = ItemsPool.getInstance().getItem("backpack_item");
                    this.item_reward_list[i+1][k].setParent(object.scroll);
                    this.item_reward_list[i+1][k].setExtendData({scale: scale,is_show_tips:true});
                    this.item_reward_list[i+1][k].show();
                    if(list[i].effect_list){
                        let spine = new cc.Node().addComponent(sp.Skeleton)
                        object.scroll.addChild(spine.node,6+create_index)
                        this.effect_list[create_index-1] = spine
                        spine.node.active = false;
                    }

                }
                if(this.item_reward_list[i+1][k]){
                    this.item_reward_list[i+1][k].setPosition(_x, _y)
                    this.item_reward_list[i+1][k].setData({bid:list[i].item_list[k][0],num:list[i].item_list[k][1]})
                    this.effect_list[create_index-1].node.active = true
                    this.effect_list[create_index-1].node.setPosition(_x, _y)
                    if(list[i].effect_list){
                        let effect_action = "action"
                        let scale1 = 1.0
                        if(list[i].effect_list[0][k] == 263){
                            effect_action = "action1"
                            scale1 = 1.1
                        }
                        this.effect_list[create_index-1].node.scale = scale * scale1
                        let index = create_index-1
                        this.loadRes(PathTool.getSpinePath(PathTool.getEffectRes(list[i].effect_list[0][k])),function(res){
                            this.effect_list[index].skeletonData = res;
                            this.effect_list[index].setAnimation(0, effect_action, true);
                        }.bind(this))
                    }
                }

                create_index = create_index + 1
            }
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_reward_list){
            for(var i= 1;i<=3;i++){
                for(var j in this.item_reward_list[i]){
                    this.item_reward_list[i][j].deleteMe();
                    this.item_reward_list[i][j] = null;
                }
                this.item_reward_list[i] = null;
            }
            this.item_reward_list = null;
        }
        if (this.role_vo != null) {
            if (this.role_assets_event != null) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
        }
        if(this.effect_list){
            for(let i=0;i<this.effect_list.length;++i){
                if(this.effect_list[i]){
                    this.effect_list[i].destroy()
                    this.effect_list[i] = null;
                }
            }
            this.effect_list = null;
        }
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect)
        this.ctrl.openNewFirstChargeView(false);
    },
})