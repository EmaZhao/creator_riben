// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-08 21:18:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimesummonEvent = require("timesummon_event")
var TimesummonController = require("timesummon_controller")
var BackpackController = require("backpack_controller")
var TimeTool = require("timetool")
var BackPackConst = require("backpack_const")
var HeroController = require("hero_controller")
var RoleController = require("role_controller")
var SummonEvent = require("partnersummon_event");
var PartnersummonController = require("partnersummon_controller")
var MainUiController = require("mainui_controller")
var BackpackEvent = require("backpack_event")
var ActionEvent = require("action_event")
var ActionConst = require("action_const")
var ActionConst = require("action_const")
var ActionTimeSummonPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.summonType = arguments[0]||ActionConst.ActionRankCommonType.time_summon;
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_summon_panel");
        let item_bid_cfg = Config.recruit_holiday_data.data_const["common_s"]
        this.ctrl = TimesummonController.getInstance()
        if(item_bid_cfg){
            this.summon_item_bid = item_bid_cfg.val // 召唤道具bid
        }
    
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
       
        this._summon_type_1 = 1 	 // 单抽的抽取类型(1免费 3钻石 4道具)
        this._summon_type_10 = 3 	 // 十连抽抽取类型(3钻石 4道具)
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.arard_data = Config.recruit_holiday_data.data_award;
        // this.status = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let x = this.getPositionX()
        this.setPosition(x,0)
        var self = this
        let main_container = this.root_wnd.getChildByName("main_container")
        //伴随礼包
        this.accompanyGift_btn = main_container.getChildByName("accompanyGift");
        self.image_bg_sp = main_container.getChildByName("image_bg").getComponent(cc.Sprite)
        //self.image_bg_sp.node.scale = FIT_SCALE
        self.progress_txt = main_container.getChildByName("progress_txt").getComponent(cc.Label)
        self.item_num_txt = main_container.getChildByName("item_num_txt").getComponent(cc.Label)
        //self.progress = main_container.getChildByName("progress").getComponent(cc.ProgressBar)
    
        self.baodi_bg = main_container.getChildByName("baodi_bg")
    
        self.award_btn = main_container.getChildByName("award_btn")
        self.preview_btn = main_container.getChildByName("preview_btn")
        self.preview_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("战斗预览")
    
        self.summon_btn_1 = main_container.getChildByName("summon_btn_1")
        self.summon_btn_1.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("招募1次")
        self.summon_txt_1_rt = self.summon_btn_1.getChildByName("summon_txt_1").getComponent(cc.RichText)
        self.summon_prop_1_nd = self.summon_btn_1.getChildByName("summon_prop")
        self.summon_prop_num_lb = self.summon_prop_1_nd.getChildByName("summon_prop_num").getComponent(cc.Label)
        let item_config = Utils.getItemConfig(self.summon_item_bid)
        let path = PathTool.getItemRes(item_config.icon)
        this.loadRes(path,function(res){
            this.summon_prop_1_nd.getChildByName("summon_prop_item").getComponent(cc.Sprite).spriteFrame = res
            main_container.getChildByName("item_icon").getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))

        
        self.summon_btn_10 = main_container.getChildByName("summon_btn_10")
        self.summon_btn_10.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("招募10次")
        self.summon_prop_10_nd = self.summon_btn_10.getChildByName("summon_prop");
        self.summon_prop_sp = self.summon_prop_10_nd.getChildByName("summon_prop_item").getComponent(cc.Sprite)
        self.summon_10_num_lb = self.summon_prop_10_nd.getChildByName("summon_prop_num").getComponent(cc.Label)

        self.time_txt = main_container.getChildByName("time_txt").getComponent(cc.Label)

        this.baodi_text_rt = this.seekChild("baodi_text",cc.RichText);
        this.baodi_bg = this.seekChild("baodi_bg");
        this.baodi_bg.setPosition(57,-1);
        this.baodi_bg.setContentSize(360,54.3);
        this.baodi_text_rt.node.setPosition(72,2);

        self.award_item = ItemsPool.getInstance().getItem("backpack_item")
        self.award_item.setParent(main_container);
        this.award_item.setPosition(525, 980)
        this.award_item.initConfig(false, 0.46, false, false);
        self.award_item.show();
        self.award_item.addCallBack(this._onClickAwardItem.bind(this))
        // self.limit_btn = this.seekChild("limitsummon_btn");
        // self.elite_btn = this.seekChild("elitesummon_btn");
        // self.select = this.seekChild("summon_select")
        // let openlimit = true;
        // let openelite = true;
        // self.limit_btn.active = openlimit;
        // self.elite_btn.active = openelite;
       
        // if(openelite && openlimit){
        //     self.limit_btn.x = -120;
        //     self.elite_btn.x = 118;
        // }else if(openlimit){
        //     self.limit_btn.x = 0;
        // }else if(openelite){
        //     self.elite_btn.x = 0;
        // }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(TimesummonEvent.Update_Summon_Data_Event,function(data){
            this.setData(data)
        },this)
        // 召唤成功
        this.addGlobalEvent(SummonEvent.PartnerSummonSuccess, function() {
          if(!this.status){
            return;
          }
            this.playRecruitEffect();
        }.bind(this));
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
        this.preview_btn.on('click',function(){
            this.ctrl.send23219(ActionConst.ActionRankCommonType.time_summon)
            this.ctrl.send23219(ActionConst.ActionRankCommonType.old_time_summon)
        },this)
        this.summon_btn_1.on('click',function(){
            Utils.playButtonSound(1)
            if(this.checkHeroBagIsFull(1)) return;
            cc.log(this.last_time,gcore.SmartSocket.getTime())
            if(this.last_time && gcore.SmartSocket.getTime() - this.last_time < 2){
                return
            }
            this.last_time = gcore.SmartSocket.getTime()
            if(this._summon_type_1 == 3 && this.config){
                let num = this.config.loss_gold_once[0][1]
                let call_back = function (){
                    this.ctrl.requestTimeSummon( 1, this._summon_type_1 )
                }
                let item_icon_2 = Utils.getItemConfig(this.config.loss_gold_once[0][0]).icon
                let val_str = Utils.getItemConfig(this.config.gain_once[0][0]).name || ""
                let val_num = this.config.gain_once[0][1]
                let call_num = 1
                this.showGoldTips(item_icon_2,num,call_num,val_num,val_str,call_back)
            }else{
                this.ctrl.requestTimeSummon( 1, this._summon_type_1 )
            }
        },this)
        this.summon_btn_10.on("click",function(){
            Utils.playButtonSound(1)
            if(this.checkHeroBagIsFull(10)) return;
            if(this.last_time && Math.abs(gcore.SmartSocket.getTime() - this.last_time) < 0.5){
                return
            }
            this.last_time = gcore.SmartSocket.getTime()
            if(this._summon_type_10 == 3 && this.config){
                let num = this.config.loss_gold_ten[0][1]
                let call_back = function (){
                    this.ctrl.requestTimeSummon( 10, this._summon_type_10 )
                }
                let item_icon_2 = Utils.getItemConfig(this.config.loss_gold_ten[0][0]).icon
                let val_str = Utils.getItemConfig(this.config.gain_ten[0][0]).name || ""
                let val_num = this.config.gain_ten[0][1]
                let call_num = 10
                this.showGoldTips(item_icon_2,num,call_num,val_num,val_str,call_back)
            }else{
                this.ctrl.requestTimeSummon( 10, this._summon_type_10 )
            }
        },this)
        this.award_btn.on("click",function(){
            this.ctrl.openTimeSummonAwardView(true, this.config.group_id, this.data)
        },this)
        this.baodi_bg.on(cc.Node.EventType.TOUCH_END,this.clickBaodiBtn,this)
        this.baodi_bg.on(cc.Node.EventType.TOUCH_START, this.clickBaodiBtn, this);
        this.baodi_bg.on(cc.Node.EventType.TOUCH_CANCEL, this.clickBaodiBtn, this);
        // this.limit_btn.on('click',function(){
        //     this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.time_summon)
        // },this)
        // this.elite_btn.on('click',function(){
        //     this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.elite_summon)
        // },this)
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(!data||!this.status)return;
            if(data.bid == ActionConst.ActionRankCommonType.time_summon){
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
        require("action_controller").getInstance().cs16603(ActionConst.ActionRankCommonType.time_summon)//请求伴随礼包数据
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

    clicksummonTypeBtn(summontype){
        this.summonType = summontype;
        if(this.summonType == ActionConst.ActionRankCommonType.time_summon||this.summonType == ActionConst.ActionRankCommonType.old_time_summon){
            this.select.parent = this.limit_btn;
        }else{
            this.select.parent = this.elite_btn;
        }
        this.select.index = 0;
        this.select.active = true;
       //刷新面板显示
    },
    _onClickAwardItem(){
        if(this.data){
            if(this.is_can_award){
                this.ctrl.requestSummonGetAward()
            }else{
                this.ctrl.openTimeSummonProgressView(true, this.data.times, this.data.camp_id)
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
                // var MainuiConst = require("mainui_const")
                var ActionController = require("action_controller")
                // MainUiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner)
                var hero_controller = require("hero_controller").getInstance();
                hero_controller.openHeroBagWindow(true);
                ActionController.getInstance().openActionSummonView(false);
            }, Utils.TI18N("取り消し"), function() {
            })
            return true
        }     
        return false;   
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.status = true;
        this.ctrl.requestTimeSummonData()
    },
    setVisibleStatus(status){
        if(this.root_wnd && status){
            this.ctrl.requestTimeSummonData()
        }
        status = status|| false
        this.setVisible(status);
    },
    setData(data){
        if(!data)return;
        this.data = data;
        let action_cfg = Config.recruit_holiday_data.data_action[this.data.camp_id]
        if(action_cfg && action_cfg.group_id){
            this.config = Config.recruit_holiday_data.data_summon[action_cfg.group_id]
        }
        // this._can_get_award = false;
        // this._award_is_over = false;
        // this._cur_award_data = {};
        // let award_config = Config.recruit_holiday_data.data_award[this.data.camp_id];
        // if(award_config){
        //     let temp_data = [] //-- 次数达到要求的阶段数据
        //     for(let k in award_config){
        //         let v = award_config[k]
        //         if(v.times && v.times <= this.data.times){
        //             temp_data.push(v)
        //         }
        //     }
        //     this.data.reward_list = this.data.reward_list || []
        //     if(temp_data.length > this.data.reward_list.length){  // 有可领取的奖励
        //         this._can_get_award = true
        //         for(let i=0;i< temp_data.length;++i){
        //             this._cur_award_data = temp_data[temp_data.length-1]  // 取最靠后的阶段展示
        //         }
        //     }else if(Utils.next(temp_data) == null){
        //         this._cur_award_data = award_config[1]
        //     }else{
        //         let last_data = temp_data[temp_data.length-1]
        //         let id = last_data.id + 1
        //         if(award_config[id]){
        //             this._cur_award_data = award_config[id]
        //         }else{
        //             this._award_is_over = true
        //             this._cur_award_data = award_config[last_data.id]
        //         }
        //     }
            this.time_txt.string = TimeTool.getYMD5(this.data.start_time) + "~" + TimeTool.getYMD5(this.data.end_time)
            this.nextRewardLevel()
            this.updateImageBg()
            this.updateSummonBtnStatus()
            // this.updateProgress()
            this.updateItemNum()
            this.updateBaodiCount()
        // }
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
                label = Utils.TI18N("招募次数") + " "+this.data.times + "/" + num_times
            }else{ 
                label = Utils.TI18N("下一阶段") + " "+this.data.times+"/"+num_times
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
            let percent = cur_num / totle_num
            if(this.data.times >= data[Utils.getArrLen(data)].times){
                percent = 1
            }
            //this.progress.progress = percent
        }
    },
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
    updateImageBg(){
        if(this.config && this.config.res_id && (!this.cur_res_id || this.cur_res_id != this.config.res_id)){
            let path = PathTool.getBigBg("timesummon/txt_cn_timesummon_bigbg_" + this.config.res_id,"jpg")
            this.loadRes(path,function(res){
                this.image_bg_sp.spriteFrame = res
            }.bind(this))
            this.cur_res_id = this.config.res_id
        }
    },
    updateSummonBtnStatus(){
        if(this.data && this.config && this.summon_item_bid){
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
                let bid = this.config.loss_gold_ten[0][0]
                let num = this.config.loss_gold_ten[0][1]
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
    // -- 刷新进度条显示
    updateProgress( ){
        if(this.data && this._cur_award_data && Utils.next(this._cur_award_data) != null){
            let reward = this._cur_award_data.reward[0]
            let bid = reward[0]
            let num = reward[1]
            this.award_item.setData({bid:bid, num:num})

            //let percent = this.data.times/this._cur_award_data.times
            //this.progress.progress = percent

            if(this._award_is_over){
                this.progress_txt.string = Utils.TI18N("招募次数") +" "+ this.data.times + "/" + this._cur_award_data.times
                this.award_item.setReceivedIcon(true)
            }else{
                this.progress_txt.string = Utils.TI18N("下一阶段") +" "+ this.data.times + "/" + this._cur_award_data.times
                this.award_item.setReceivedIcon(false)
            }

            // -- 有奖励可领时显示特效
            if(this._can_get_award == true){
                this.award_item.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1)
            }else{
                this.award_item.showItemEffect(false)
            }
        }
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
    // -- 刷新保底次数显示
    updateBaodiCount(  ){
        if(!this.baodi_bg || !this.data) return;

        if(!this.data.item_id || this.data.item_id == 0){
            this.baodi_bg.active = false
            return
        }
        this.baodi_bg.active = true
        if(!this.baodi_item){
            this.baodi_item = ItemsPool.getInstance().getItem("backpack_item")
            this.baodi_item.setParent(this.baodi_bg);
            this.baodi_item.initConfig(false, 0.35, false, true);
            this.baodi_item.setPosition(50,2.5)
            this.baodi_item.show();
        }
        if(!this.cur_show_bid || this.cur_show_bid != this.data.item_id){
            this.baodi_item.setData({bid:this.data.item_id, num:this.data.item_num})
            this.cur_show_bid = this.data.item_id
        }

        let count = this.data.must_count || 0;
        this.baodi_text_rt.string =  cc.js.formatStr("<color=#ffffff><outline width=2 color=#000000>あと</outline></color><color=#5fde46><outline width=2 color=#000000>%d</outline></color><color=#ffffff><outline width=2 color=#000000>回召喚で必ず出現</outline></color>", count)
    },

    clickBaodiBtn(event){
        if(this.baodi_item){
            this.baodi_item.onClickRootWnd(event);
        }
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
        let des_str = buy_ori ;
        var frame_arrays = [];
        var good_path = PathTool.getIconPath("item", "3");
        frame_arrays.push(good_path);

        var CommonAlert = require("commonalert");
        this.alert = CommonAlert.show(des_str, "決定", call_back.bind(this), "取り消し", null, null, null, {resArr: frame_arrays,maxWidth:500,align:cc.macro.TextAlignment.LEFT});
    },
    playRecruitEffect(){
        if(this.summonBg == null){ 
            this.summonBg = new cc.Node().addComponent(cc.Sprite)
            ViewManager.getInstance().addToSceneNode(this.summonBg.node,SCENE_TAG.dialogue)
            this.summonBg.node.scale = FIT_SCALE;
            this.summonBg.node.setPosition(0, 0)
            this.summonBg.node.setContentSize(cc.size(720,1280))
            // let resources_id = "timesummon_bg"
            // if(this.config && this.config.res_id){
            //     resources_id = "timesummon_bg_"+this.config.res_id
            // }
            // let path = PathTool.getBigBg("timesummon/"+ resources_id,"jpg")
            // this.loadRes(path,function(res){
            //     this.summonBg.spriteFrame = res;
            //    
            // }.bind(this))
            this.summonBg.node.on("touchend",function(){
                this.summonBg.node.active = !this.summonBg.node.active;
                // if(this.floor_effect){
                //     this.floor_effect.paused = true;
                // }
                // if(this.book_effect){
                //     this.book_effect.paused = true;
                // }
                if(this.light_effect){
                    this.light_effect.paused = true;
                }
                this.animaComplete()
            },this)
        }else{
            this.summonBg.node.active = !this.summonBg.node.active;
        }
        let data = PartnersummonController.getInstance().getModel().getRecruitData()
        let rewards = this.ctrl.getModel().getEffectAction(data.rewards)
        this.floor_action = rewards[0]
        this.light_action = rewards[1]
        let config_data = Config.recruit_holiday_data.data_summon
        let config = config_data[data.group_id]
        let action_name = "action";
        if (config){
            action_name = config.action_name;
        }
        // 播放音效
        let music_name = "recruit_" + action_name;
        Utils.playEffectSound(AUDIO_TYPE.Recruit, music_name);
        this.handleLightEffect()
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
        cc.log("animaComplete")
        this.summonBg.node.active = false;
        //MainUiController.getInstance().setMainUIBottomStatus(true);
        MainUiController.getInstance().setMainUITopStatus(true); 
        this.light_effect.clearTracks();   
        this.light_effect.node.active = false;
        this.light_effect = null; 
          
        var PartnersummonController = require("partnersummon_controller")     
        PartnersummonController.getInstance().openSummonGainWindow(true);
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){
          this.status = false;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.summon_timer){
            gcore.Timer.del(this.summon_timer);
            this.summon_timer = null
        }
        if(this.award_item){
            this.award_item.deleteMe()
            this.award_item = null;
        }
        if(this.summonBg){
            this.summonBg.node.destroy()
            this.summonBg = null;
        }
    },
})