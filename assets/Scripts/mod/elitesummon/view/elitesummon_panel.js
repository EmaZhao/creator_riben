// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-09 15:58:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var EliteSummonEvent = require("elitesummon_event")
var ElitesummonController = require("elitesummon_controller")
var RoleController = require("role_controller")
var BackpackController = require("backpack_controller")
var BackpackEvent = require("backpack_event")
var BackPackConst = require("backpack_const")
var SummonEvent = require("partnersummon_event");
var MainUiController = require("mainui_controller")
var PartnersummonController = require("partnersummon_controller")
var ActionEvent = require("action_event")
var ActionConst = require("action_const")
var TimeTool = require("timetool")
var ElitesummonPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_summon_panel");
        this.holiday_bid = arguments[0]
        this.ctrl = ElitesummonController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this._summon_type_1 = 1 	 // 单抽的抽取类型(1免费 3钻石 4道具)
        this._summon_type_10 = 3 	 // 十连抽抽取类型(3钻石 4道具)
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.arard_data = Config.recruit_holiday_elite_data.data_award
        this.const_data = Config.recruit_holiday_elite_data.data_const
        this.summon_item_bid = this.const_data["common_s"].val
        this.summon_data = Config.recruit_holiday_elite_data.data_summon
        this.action_config = Config.recruit_holiday_elite_data.data_action
        this.status = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.setPosition(0,0)
        let main_container = this.root_wnd.getChildByName("main_container")
        //伴随礼包
        this.accompanyGift_btn = main_container.getChildByName("accompanyGift");
        this.progress_txt = main_container.getChildByName("progress_txt").getComponent(cc.Label)
        this.image_bg_sp = main_container.getChildByName("image_bg").getComponent(cc.Sprite)
        //this.image_bg_sp.node.scale = FIT_SCALE
        //this.progress = main_container.getChildByName("progress").getComponent(cc.ProgressBar)
        this.baodi_bg = main_container.getChildByName("baodi_bg")
        this.tipnode = main_container.getChildByName("tipNode");
        // let str_bg = "txt_cn_elitesummon_1";
        // let tab_vo = ActionController.getInstance().getActionSubTabVo(this.holiday_bid)
        // if(tab_vo && tab_vo.aim_title != "" && tab_vo.aim_title){
        //     str_bg = tab_vo.aim_title
        // }
        // let path = PathTool.getBigBg(str_bg,"jpg","timesummon")
        // this.loadRes(path,function(res){
        //     image_bg_sp.spriteFrame = res
        // }.bind(this))
        this.item_num_txt = main_container.getChildByName("item_num_txt").getComponent(cc.Label)
        this.award_btn = main_container.getChildByName("award_btn")
        //this.award_btn.getChildByName("label").getComponent(cc.Label).string = "奖励预览"
        main_container.getChildByName("preview_btn").active = false
        this.summon_btn_1 = main_container.getChildByName("summon_btn_1")
        this.summon_btn_1.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("招募1次")
        this.summon_txt_1_rt = this.summon_btn_1.getChildByName("summon_txt_1").getComponent(cc.RichText)
        this.summon_prop_1_nd = this.summon_btn_1.getChildByName("summon_prop")
        this.summon_prop_num_lb = this.summon_prop_1_nd.getChildByName("summon_prop_num").getComponent(cc.Label)

        this.summon_btn_10 = main_container.getChildByName("summon_btn_10")
        this.summon_btn_10.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("招募10次")
        this.summon_prop_10_nd = this.summon_btn_10.getChildByName("summon_prop");
        this.summon_prop_sp = this.summon_prop_10_nd.getChildByName("summon_prop_item").getComponent(cc.Sprite)
        this.summon_10_num_lb = this.summon_prop_10_nd.getChildByName("summon_prop_num").getComponent(cc.Label)

        this.time_txt = main_container.getChildByName("time_txt").getComponent(cc.Label)
        // this.time_txt.node.setPosition(357.7,227.2)
        // this.time_txt.node.color = new cc.Color(255,252,187);
        // let line = this.time_txt.node.addComponent(cc.LabelOutline);
        // line.color = new cc.Color(112,18,18);
        // line.width = 2;
        // this.time_txt.lineHeight = 30;
        // this.time_txt.node.active = false;

        //适配位置
        this.baodi_text_rt = this.seekChild("baodi_text",cc.RichText);
        this.baodi_bg.setPosition(23,-0.7);
        this.baodi_bg.setContentSize(404,54.3);
        this.baodi_text_rt.node.setPosition(19,2);
        this.award_item = ItemsPool.getInstance().getItem("backpack_item")
        this.award_item.setParent(main_container);
        this.award_item.setPosition(525, 980)
        this.award_item.initConfig(false, 0.46, false, false);
        this.award_item.show();
        this.award_item.addCallBack(this._onClickAwardItem.bind(this))

        let item_config = Utils.getItemConfig(this.summon_item_bid)
        let path1 = PathTool.getItemRes(item_config.icon)
        this.loadRes(path1,function(res){
            this.summon_prop_1_nd.getChildByName("summon_prop_item").getComponent(cc.Sprite).spriteFrame = res;
            main_container.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))
        // this.baodi_bg.getChildByName("tip").active = true;
        // this.btn_rule = this.baodi_bg.getChildByName("tip")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(EliteSummonEvent.EliteSummon_Message,function(data){
            if(!data) return;
            let status = this.ctrl.getModel().isHolidayHasID(data.camp_id)
            if(status){
                this.setData(data)
            }
        }.bind(this))
        // --物品道具增加
		this.addGlobalEvent(BackpackEvent.ADD_GOODS,function(bag_code,data_list){
            this.updateItemNum(bag_code,data_list)
        }.bind(this))
        //物品道具删除
        this.addGlobalEvent(BackpackEvent.DELETE_GOODS,function(bag_code,data_list){
            this.updateItemNum(bag_code,data_list)
        }.bind(this))
        //物品道具改变
        this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM,function(bag_code,data_list){
            this.updateItemNum(bag_code,data_list)
        }.bind(this))
        // 召唤成功
        this.addGlobalEvent(SummonEvent.PartnerSummonSuccess, function() {
          if(!this.status){
            return;
          }
            this.playRecruitEffect();
        }.bind(this));
        this.award_btn.on("click",function(){
            if(this.data && this.data.camp_id){
                let config = this.action_config[this.data.camp_id]
                if (config){
                    var TimesummonController = require("timesummon_controller")
                    TimesummonController.getInstance().openTimeSummonAwardView(true,config.group_id, this.data,true)
                }
            }

        },this)
        this.baodi_bg.on('click',function(event){
            if(this.data && this.data.camp_id){
                let config = this.action_config[this.data.camp_id]
                if(config){
                    let pos = this.tipnode.convertToWorldSpaceAR(cc.v2(0, 0))
                    require("tips_controller").getInstance().showCommonTips(config.desc,pos,null,null,500)
                }
            }
        },this)
        this.summon_btn_1.on('click',function(){
            Utils.playButtonSound(1)
            if(this.checkHeroBagIsFull(1)) return;
            if(this.last_time && gcore.SmartSocket.getTime() - this.last_time < 2){
                return
            }
            this.last_time = gcore.SmartSocket.getTime()
            if(this._summon_type_1 == 3){
                if(this.data && this.data.camp_id){
                    let group_id = this.action_config[this.data.camp_id].group_id
                    let config = this.summon_data[group_id]
                    let num = config.loss_gold_once[0][1]
                    let call_back = function (){
                        this.ctrl.send23221( 1, this._summon_type_1 )
                    }
                    let item_icon_2 = Utils.getItemConfig(config.loss_gold_once[0][0]).icon
                    let val_str = Utils.getItemConfig(config.gain_once[0][0]).name || ""
                    let val_num = config.gain_once[0][1]
                    let call_num = 1
                    this.showGoldTips(item_icon_2,num,call_num,val_num,val_str,call_back)
                }
                  
            }else{
                this.ctrl.send23221( 1, this._summon_type_1 )
            }
        },this)
        this.summon_btn_10.on("click",function(){
            Utils.playButtonSound(1)
            if(this.checkHeroBagIsFull(10)) return;
            if(this.last_time && Math.abs(gcore.SmartSocket.getTime() - this.last_time) < 0.5){
                return
            }
            this.last_time = gcore.SmartSocket.getTime()
            if(this._summon_type_10 == 3){
                if(this.data && this.data.camp_id){
                    let group_id = this.action_config[this.data.camp_id].group_id
                    let config = this.summon_data[group_id]
                    let num = config.loss_gold_ten[0][1]
                    let call_back = function (){
                        this.ctrl.send23221( 10, this._summon_type_10 )
                    }
                    let item_icon_2 = Utils.getItemConfig(config.loss_gold_ten[0][0]).icon
                    let val_str = Utils.getItemConfig(config.gain_ten[0][0]).name || ""
                    let val_num = config.gain_ten[0][1]
                    let call_num = 10
                    this.showGoldTips(item_icon_2,num,call_num,val_num,val_str,call_back)
                }
            }else{
                this.ctrl.send23221( 10, this._summon_type_10 )
            }
        },this)
        this.ctrl.send23220()
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(!data||!this.status)return;
            if(data.bid == ActionConst.ActionRankCommonType.elite_summon){
                this.holiday_data = data;
                //礼包存在
                if(this.holiday_data.aim_list.length>0&&this.holiday_data.aim_list[0].item_list.length>0){
                    this.accompanyGift_btn.active = true;
                    var current_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageCurCount, this.holiday_data.aim_list[0].aim_args);
                    var totle_list = Utils.keyfind('aim_args_key', ActionConst.ActionExtType.RechageTotalCount, this.holiday_data.aim_list[0].aim_args);
                    this.current_count = current_list.aim_args_val || 0;
                    this.totle_count = totle_list.aim_args_val || 0;
                    if(this.current_count>=this.totle_count){
                        this.accompanyGift_btn.getChildByName("button").active = true;
                        this.accompanyGift_btn.getChildByName("skeleton").active = false;
                        return;
                    }
                    this.accompanyGift_btn.getChildByName("button").active = false;
                    this.accompanyGift_btn.getChildByName("skeleton").active = true;
                    var component = this.accompanyGift_btn.getChildByName("skeleton").getComponent(sp.Skeleton);
                    this.loadRes("spine/E31329/action.atlas", function(skeleton_data) {
                        component.skeletonData = skeleton_data;
                        component.setAnimation(0, "action",true);
                    }.bind(this));
                }else{
                    this.accompanyGift_btn.active = false;
                }
            }
        }.bind(this));
        require("action_controller").getInstance().cs16603(ActionConst.ActionRankCommonType.elite_summon)//请求伴随礼包数据
        this.accompanyGift_btn.on("click",()=>{
            //打开礼包界面
            // var data = this.holiday_data.aim_list[0];
            if(this.holiday_data){
                require("action_controller").getInstance().openSummonGiftWindow(true,this.holiday_data);
            }
        })

        this.addGlobalEvent(ActionEvent.GIFT_BUY_EVENT, function (bid) {
            if(this.holiday_data.bid == bid){
                this.accompanyGift_btn.getChildByName("button").active = true;
                this.accompanyGift_btn.getChildByName("skeleton").active = false;
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
          this.status =true;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){
          this.status = false;
    },
    setData(data){
        this.data = data
        this.updateSummonBtnStatus()
        this.nextRewardLevel()
        this.updateItemNum()
        let str_time = cc.js.formatStr("%s-%s",TimeTool.getYMD5(data.start_time),TimeTool.getYMD5(data.end_time))
        this.time_txt.string = str_time;
        this.baodi_text_rt.string =  cc.js.formatStr(Utils.TI18N("<color=#ffffff><outline color=#000000 width=2>剩余</outline></color><color=#5fde46><outline color=#000000 width=2>%d</outline></color><color=#ffffff><outline color=#000000 width=2>次招募内必出UP英雄</outline></color>"), data.must_count)
        //更新背景图
        this.updateImageBg();
    
    },
    updateImageBg(){
        let group_id = this.action_config[this.data.camp_id].group_id;
        let config = this.summon_data[group_id];
        if(config && config.res_id && (!this.cur_res_id || this.cur_res_id != config.res_id)){
            let path = PathTool.getBigBg("txt_cn_elitesummon_" + config.res_id,"jpg","timesummon")
            this.loadRes(path,function(res){
                this.image_bg_sp.spriteFrame = res
            }.bind(this))
            this.cur_res_id = config.res_id
        }
    },
    updateSummonBtnStatus(){
        if(this.data && this.data.camp_id){
            let config = this.action_config[this.data.camp_id]
            let data = this.summon_data[config.group_id]
            let summon_have_num = BackpackController.getInstance().getModel().getItemNumByBid(this.summon_item_bid)
            // -- 单抽
            let cur_time = gcore.SmartSocket.getTime()
            if(this.data.free_time == 0 && this.data.free_time <= cur_time){
                let txt_str_1 = Utils.TI18N("<color=#ffffff>免费召唤</color>")
                this._summon_type_1 = 1
                this.openSummonFreeTimer(false)
                this.summon_txt_1_rt.node.active = true;//免费 或者 倒计时
                this.summon_prop_1_nd.active = false;//道具
                this.summon_txt_1_rt.string = txt_str_1;
            }else if(summon_have_num >= 1){
                this._summon_type_1 = 4
                this.openSummonFreeTimer(false)
                this.summon_txt_1_rt.node.active = false;//免费 或者 倒计时
                this.summon_prop_1_nd.active = true;//道具
                this.summon_prop_num_lb.string = 1;
            }else if(this.data.free_time){
                this.left_time = this.data.free_time - cur_time
                this.summon_txt_1_rt.node.active = true;//免费 或者 倒计时
                this.summon_prop_1_nd.active = false;//道具
                this._summon_type_1 = 3
                this.openSummonFreeTimer(true)
            }

            // -- 十连抽
            if(summon_have_num >= 10){
                let item_config = Utils.getItemConfig(this.summon_item_bid);
                if(item_config){
                    let path = PathTool.getItemRes(item_config.icon);
                    this.summon_10_num_lb.string = 10;
                    this.summon_prop_sp.node.scale = 0.4
                    this.loadRes(path,function(res){
                        this.summon_prop_sp.spriteFrame = res;
                    }.bind(this))
                }
                this._summon_type_10 = 4
            }else{
                let bid = data.loss_gold_ten[0][0]
                let num = data.loss_gold_ten[0][1]
                let path = PathTool.getItemRes(bid)
                this.summon_prop_sp.node.scale = 0.3
                this.loadRes(path,function(res){
                    this.summon_prop_sp.spriteFrame = res;
                }.bind(this))
                this.summon_10_num_lb.string = num;
                this._summon_type_10 = 3
            }
        }
    },
    openSummonFreeTimer(status){
        if(status){
            if(this.left_time > 0 && this.summon_txt_1_rt){
                if(!this.summon_timer){
                    this.setTimeFormatString()
                    this.summon_timer = gcore.Timer.set(function(){
                        this.setTimeFormatString()
                    }.bind(this),1000,-1)
                }
            }else{
                if(this.summon_timer){
                    gcore.Timer.del(this.summon_timer);
                    this.summon_timer = null
                }
            }
        }else{
            if(this.summon_timer != null){
                gcore.Timer.del(this.summon_timer);
                this.summon_timer = null;
            }
        }
    },
    setTimeFormatString(){
        if(this.data && (this.data.free_time - gcore.SmartSocket.getTime()) > 0){
            this.left_time = this.data.free_time - gcore.SmartSocket.getTime()
            this.summon_txt_1_rt.string =  cc.js.formatStr(Utils.TI18N("<color=#35ff14>%s</color><color=#ffffff>后免费</color>"), TimeTool.getTimeFormat(this.left_time))
            this._summon_type_1 = 3
        }else{
            this.summon_txt_1_rt.string = Utils.TI18N("<color=#ffffff>免费召唤</color>")
            this._summon_type_1 = 1
            if(this.summon_timer){
                gcore.Timer.del(this.summon_timer);
                this.summon_timer = null
            }
        }
    },
    nextRewardLevel(){
        let count = this.nextCount(this.data.times)
        if(this.arard_data[this.data.camp_id] && this.arard_data[this.data.camp_id][count]){
            let data = this.arard_data[this.data.camp_id]
            let _award_is_over = false
            if(this.award_item){
                let bid = data[count].reward[0][0]
                let num = data[count].reward[0][1]
                this.award_item.setData({bid:bid, num:num})
                let obj = this.getBaoDIStatus()
                this.is_can_award = obj.status
                let can_id = obj.id 
                if(this.is_can_award == true){
                    if(can_id){
                        let bid = data[can_id].reward[0][0]
                        let num = data[can_id].reward[0][1]
                        this.award_item.setData({bid:bid, num:num})
                    }
                    this.award_item.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1)
                }else{
                    this.award_item.showItemEffect(false)
                }
                // --全部领取完毕的时候
                if(this.is_can_award == false && this.data.times >= data[Utils.getArrLen(data)].times){
                    // setChildUnEnabled(true, this.award_item)
                    this.award_item.setReceivedIcon(true)
                    _award_is_over = true;
                }
            }
            let num_times = data[count].times
            let label = ""
            if(_award_is_over){
                label = Utils.TI18N("招募次数") +" "+ this.data.times + "/" + num_times
            }else{ 
                label = Utils.TI18N("下一阶段") +" "+this.data.times+"/"+num_times
            }
            this.progress_txt.string = label
            let cur_num = 0
            let totle_num = num_times
            if(count == 1){
                cur_num = this.data.times
            }else{
                cur_num = this.data.times - data[count-1].times
                totle_num = num_times-data[count-1].times
            }
            // let percent = cur_num / totle_num
            // if(this.data.times >= data[Utils.getArrLen(data)].times){
            //     percent = 1
            // }
            //this.progress.progress = percent
        }
    },
    _onClickAwardItem(){
        if(this.data){
            if(this.is_can_award){
                this.ctrl.send23222()
            }else{
                var TimesummonController = require("timesummon_controller")
                TimesummonController.getInstance().openTimeSummonProgressView(true, this.data.times, this.data.camp_id)
            }
        }
    },
    // --根据当前阶段计算下一次奖励
    nextCount(cur_num){
        let count = 1
        let data = this.arard_data[this.data.camp_id]
        if(this.arard_data && data){
            let len = Utils.getArrLen(data)
            if(cur_num >= data[len].times){
                return data[len].id
            }

            for(let i in data){
                let m = i+1
                if(m >= len){
                    m = len
                }
                if(data[i].times > cur_num && cur_num <= data[m].times){
                    count = data[i].id
                    break
                }
            }
        }
        return count
    },
    // --领取保底状态
    getBaoDIStatus(){
        let status = false
        let id = null
        if(this.data){
            if(this.arard_data[this.data.camp_id]){
                for(let i in this.arard_data[this.data.camp_id]){
                    let v = this.arard_data[this.data.camp_id][i]
                    let cur_status = false
                    let cur_id = null
                    if(this.data.times >= v.times){
                        cur_status = true
                        cur_id = v.id
                    }
                    let true_status = true
                    if(cur_status == true){
                        for(let j=0;j<this.data.reward_list.length;++j){
                            let k = this.data.reward_list[j]
                            if(k.id == cur_id){
                                true_status = false
                                break
                            }
                        }
                    }
                    if(cur_id && true_status == true){
                        status = true
                        id = cur_id
                    }
                }
            }
        }
        return {status:status,id:id}
    },
    updateItemNum(bag_code, data_list){
        if(this.summon_item_bid){
            if(bag_code && data_list){
                if(bag_code == BackPackConst.Bag_Code.BACKPACK){
                    for(let i in data_list){
                        let v = data_list[i]
                        if(v && v.base_id && this.summon_item_bid == v.base_id){
                            let summon_have_num = BackpackController.getInstance().getModel().getItemNumByBid(this.summon_item_bid)
                            this.item_num_txt.string = summon_have_num;
                            this.updateSummonBtnStatus()
                            break
                        }
                    }
                }
            }else{
                let summon_have_num = BackpackController.getInstance().getModel().getItemNumByBid(this.summon_item_bid)
                this.item_num_txt.string = summon_have_num;
            }
        }
    },
    checkHeroBagIsFull(times){
        // 判断英雄背包空间
        var HeroController = require("hero_controller");
        var hero_model = HeroController.getInstance().getModel();
        var hero_bag_info = hero_model.getHeroMaxCount();
        var limit_num = hero_bag_info.max_count - hero_bag_info.have_coutn;
        if (times > limit_num) {
            var str = Utils.TI18N("英雄列表已满，可通过提升贵族等级或购买增加英雄携带数量，是否前往购买？")
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), function() {
                var MainuiConst = require("mainui_const")
                var ActionController = require("action_controller")
                // MainUiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner)
                var hero_controller = require("hero_controller").getInstance();
                hero_controller.openHeroBagWindow(true);
                ActionController.getInstance().openActionSummonView(false);
            }, Utils.TI18N("取消"), function() {
            })
            return true
        }     
        return false;   
    },
    showGoldTips(good_res_path,need_num,call_num,val_num,val_str,call_back){
        //图标 买几次 购买经验 回调函数
        if(this.alert){
            this.alert.close()
            this.alert = null;
        }
        let hvae_num = this.role_vo.getTotalGold();
        let buy_ori = cc.js.formatStr(Utils.TI18N("是否使用<img src='%s' /><color=#289b14>%s</color><color=#764519>(拥有:</color><color=#289b14>%s</color><color=#764519>)</color>"), good_res_path, need_num, hvae_num);
        // let get_ori = cc.js.formatStr(Utils.TI18N("<color=#764519>购买</color><color=#289b14>%s</color><color=#764519></color><color=#d95014>%s</color><color=#764519>(同时附赠</color><color=#289b14>%s</color><color=#764519>次招募)</color>"),  val_num, val_str,call_num);
        let des_str = buy_ori;
        var frame_arrays = [];
        var good_path = PathTool.getIconPath("item", "3");
        frame_arrays.push(good_path);

        var CommonAlert = require("commonalert");
        this.alert = CommonAlert.show(des_str, Utils.TI18N("确认"), call_back.bind(this), Utils.TI18N("取消"), null, null, null, {resArr: frame_arrays,maxWidth:500,align:cc.macro.TextAlignment.LEFT});
    },
    playRecruitEffect(){
        let config_data = this.summon_data
        if(this.summonBg == null){ 
            this.summonBg = new cc.Node().addComponent(cc.Sprite)
            this.summonBg.type = cc.Sprite.Type.SLICED;
            this.summonBg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            ViewManager.getInstance().addToSceneNode(this.summonBg.node,SCENE_TAG.dialogue)
            this.summonBg.node.setContentSize(720,1280)
            this.summonBg.node.scale = FIT_SCALE;
            this.summonBg.node.setPosition(0, 0);
            // let group_id = this.action_config[this.data.camp_id].group_id
            // let path = PathTool.getBigBg("timesummon/"+ config_data[group_id].call_bg_card,"jpg")
            // this.loadRes(path,function(res){
            //     this.summonBg.spriteFrame = res;
            //     this.summonBg.node.setContentSize(cc.size(720,1280))
            // }.bind(this))
            this.summonBg.node.on("touchend",function(){
                this.summonBg.node.active = !this.summonBg.node.active;
                if(this.light_effect){
                    this.light_effect.paused = true;
                }
                this.animaComplete()
            },this)
        }else{
            this.summonBg.node.active = !this.summonBg.node.active;
        }
        let data = PartnersummonController.getInstance().getModel().getRecruitData()
        var TimesummonController =require("timesummon_controller")
        let rewards = TimesummonController.getInstance().getModel().getEffectAction(data.rewards)
        this.floor_action = rewards[0]
        this.light_action = rewards[1]
        let config = config_data[data.group_id]
        let action_name = "action";
        if (config){
            action_name = config.action_name;
        }
        // 播放音效
        let music_name = "recruit_" + action_name;
        Utils.playEffectSound(AUDIO_TYPE.Recruit, music_name);
        // this.handleFloorEffect()
        this.handleLightEffect()
        // this.handleBookEffect()
        //MainUiController.getInstance().setMainUIBottomStatus(false);
        MainUiController.getInstance().setMainUITopStatus(false);    
    },
 
    handleLightEffect(){
        if(this.summonBg && this.light_effect == null){
            this.light_effect = new cc.Node().addComponent(sp.Skeleton)
            this.summonBg.node.addChild(this.light_effect.node)
            this.light_effect.node.setPosition(0,0)
            this.light_effect.node.scale = 2.8;
            var model = PartnersummonController.getInstance().getModel();
            var recruit_data = model.getRecruitData();
            if (!recruit_data) return;
            var b = false;
            for(let index in recruit_data.partner_bids){
              let info = recruit_data.partner_bids[index]
              if(info){
                if(info.init_star ==5 ){
                  b = true;
                  break;
                }
              }
            }
            var effect_path = "";
            if(b){
              effect_path = "spine/E80002/action.atlas";
            }else{
              effect_path = "spine/E80001/action.atlas";
            }
            this.light_effect.setCompleteListener(this.animaComplete.bind(this))
            this.light_effect.node.active = true;
            this.loadRes(effect_path,function(recruit_sk){
                this.light_effect.skeletonData = recruit_sk;
                this.light_effect.setAnimation(0, "action");
            }.bind(this))
        }else if(this.light_effect){
            this.light_effect.setToSetupPose()
            this.light_effect.paused = false
            this.light_effect.setAnimation(0, "action");
        }
    },
    
    animaComplete(){
        this.summonBg.node.active = false;
        //MainUiController.getInstance().setMainUIBottomStatus(true);  
        this.light_effect.clearTracks();    
        this.light_effect.node.active = false;
        this.light_effect = null;   
        MainUiController.getInstance().setMainUITopStatus(true);   
        var PartnersummonController = require("partnersummon_controller")
        // this.status = true;     
        PartnersummonController.getInstance().openSummonGainWindow(true);
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.award_item){
            this.award_item.deleteMe()
            this.award_item = null;
        }
        if(this.summon_timer){
            gcore.Timer.del(this.summon_timer);
            this.summon_timer = null
        }
    },
})