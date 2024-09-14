// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-09-10 09:45:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LimitExerciseEvent = require("limitexercise_event")
var TimeTool = require("timetool")
var LimitExerciseConstants = require("limitExercise_const")
var LimitExerciseChangeItem = require("limitexercise_change_item_panel")
var MainuiController = require("mainui_controller")
var Limitexercise_changeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("limitexercise", "limitexercise_change_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
        this.model = this.ctrl.getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.reward_list = Config.holiday_boss_new_data.data_lev_reward_list
        this.change_boss_list = Config.holiday_boss_new_data.data_change_boss_list
        this.cur_order_type = null
        this.cur_order_id = null
        this.cur_box_status = null
        this.scrollview_bar = null
        this.item_list_panel = []
        this.pos_interval = [[0,320],[320,1047],[1047,1500]]
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        let main_container = this.root_wnd.getChildByName("main_container")
        let load_bg = main_container.getChildByName("bg").getComponent(cc.Sprite)
        load_bg.node.scale = FIT_SCALE
        let bg_res = PathTool.getUIIconPath("bigbg/limitexercise", "limit_exercise_bg1","jpg")
        this.loadRes(bg_res,function(res){
            load_bg.spriteFrame = res;
        })
        main_container.getChildByName("Text_10").getComponent(cc.Label).string = (Utils.TI18N("本轮挑战剩余："))
        this.ramain_time = main_container.getChildByName("ramain_time").getComponent(cc.Label)
        this.ramain_time.string = ("")
        this.level_area_text = main_container.getChildByName("level_area_text").getComponent(cc.Label)
        this.level_area_text.string = ("")
    
        // --左边滑动
        this.left_scrollview_pos = {}
        for(let i=1;i<=3;++i){
            let spr = main_container.getChildByName("sroll_spr_"+i)
            this.left_scrollview_pos[i] = spr.y
        }
        this.sroll_main_spr = main_container.getChildByName("sroll_main_spr")
        this.sroll_main_spr.opacity = (0)
        // --难度
        this.level_num = main_container.getChildByName("level_num").getComponent(cc.Label)
        this.level_num.string = ("")
        main_container.getChildByName("level_area_text_0_0").getComponent(cc.Label).string = (Utils.TI18N("难度"))
    
        this.item_area = main_container.getChildByName("item_area")
        // --关卡信息
        this.level_msg = main_container.getChildByName("level_msg")
        this.btn_change = this.level_msg.getChildByName("btn_change")
        this.btn_change_btn = this.btn_change.getComponent(cc.Button)
        this.btn_change_text = this.btn_change.getChildByName("Text_4").getComponent(cc.Label)
        this.btn_change_text.string = (Utils.TI18N("挑战"))
        this.change_outline = this.btn_change.getChildByName("Text_4").getComponent(cc.LabelOutline)
        this.btn_box = this.level_msg.getChildByName("btn_box")
        this.box_sprite = this.btn_box.getChildByName("box_sprite").getComponent(cc.Sprite)
        // this.box_sprite:setAnchorPoint(0.5,0.5)
        // this.box_sprite:setPositionY(49)
        this.level_msg.getChildByName("Text_8").getComponent(cc.Label).string = (Utils.TI18N("下一阶段奖励"))
        this.level_text = this.level_msg.getChildByName("level_text").getComponent(cc.Label) //第几关
        this.level_text.string = ("")
    
        this.level_msg.getChildByName("level_tips_text").getComponent(cc.Label).string = (Utils.TI18N("关卡效果"))
        this.level_effect_desc = this.level_msg.getChildByName("level_effect_desc").getComponent(cc.Label)
        this.power = this.level_msg.getChildByName("power").getComponent(cc.Label)
        this.power.string = (Utils.TI18N("推荐战力："))
        this.change_item = this.level_msg.getChildByName("change_item")
        this.change_item_content = this.change_item.getChildByName("content")
        // this.change_item:setScrollBarEnabled(false)
        
        this.btn_rule = main_container.getChildByName("btn_rule")
        let bottom_panel = main_container.getChildByName("bottom_panel")
        bottom_panel.getChildByName("count_title").getComponent(cc.Label).string = (Utils.TI18N("挑战次数:"))
        this.remain_count = bottom_panel.getChildByName("remain_count").getComponent(cc.Label)
        this.remain_count.string = ("剩余购买次数：")
        this.change_count = bottom_panel.getChildByName("count_label").getComponent(cc.Label)
        this.change_count.string = ("")
    
        this.add_btn = bottom_panel.getChildByName("add_btn")
        this.btn_close = bottom_panel.getChildByName("btn_close")
        this.item_scrollview = this.item_area.getComponent(cc.ScrollView)

        this.item_area.on('scrolling', this.updateSlideShowByVertical, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.btn_change.on('click',function(){
            var HeroController = require("hero_controller")
            var PartnerConst = require("partner_const")
            HeroController.getInstance().openFormGoFightPanel(true,PartnerConst.Fun_Form.LimitExercise)
        },this)
        this.btn_box.on('click',function(){
            if(this.model.getBoxStatus() == 1){
                this.ctrl.send25412()
            }else{
                this.ctrl.openLimitExerciseRewardView(true)
            }
        },this)
        this.btn_rule.on('click',function(){
            MainuiController.getInstance().openCommonExplainView(true,Config.holiday_boss_new_data.data_explain,Utils.TI18N("规则说明"))
        },this)
        this.btn_close.on("click",function(){
            this.ctrl.openLimitExerciseChangeView(false)
            Utils.playButtonSound(2)
        },this)
        this.add_btn.on('click',function(){
            Utils.playButtonSound(1)
            let const_data = Config.holiday_boss_new_data.data_const
            if(!const_data) return;
            let cur_count = this.model.getDayBuyCount()
            let max_count = const_data.fight_buy_max_count.val
            if(cur_count >= max_count){
                message(Utils.TI18N("已达今日购买最大值"))
                return
            }
            var CommonAlert = require("commonalert");
            var str = cc.js.formatStr("是否花费<img src='%s' scale=0.3 />%s购买一次挑战次数？", Config.item_data.data_assets_label2id.gold,const_data.action_num_espensive.val)
            var res = PathTool.getItemRes(Config.item_data.data_assets_label2id.gold)
            var call_back = function(){
                this.ctrl.send25411()
            }.bind(this)
            CommonAlert.show(str, Utils.TI18N("确认"), call_back, Utils.TI18N("取消"), null, 2, null, { resArr: [res] })
        },this)
        this.addGlobalEvent(LimitExerciseEvent.LimitExercise_Message_Event,function(data){
            this.setRoundHero(data.difficulty,data.count)
            this.remainBuyCount(data.buy_count)
            this.setCountDownTime(this.ramain_time,data.endtime - gcore.SmartSocket.getTime())
            this.levelBoxStatus(data.status,data.order)
            this.showBossMessageItem(data.difficulty)
            this.getLevelMessage(data.order_type,data.order)
        }.bind(this))
        this.addGlobalEvent(LimitExerciseEvent.LimitExercise_BuyCount_Event,function(data){
            if(data){
                let difficulty = this.model.getCurrentDiff()
                this.setRoundHero(difficulty,data.count)
                this.remainBuyCount(data.buy_count)
            }
        }.bind(this))
        this.addGlobalEvent(LimitExerciseEvent.LimitExercise_GetBox_Event,function(data){
            if(data){
                if(data.code == 1){
                    this.levelBoxStatus(2,15)
                }
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        if(this.model.getLimitExerciseData() == null){
            this.ctrl.send25410()
        }else{
            let data = this.model.getLimitExerciseData()
            this.setRoundHero(data.difficulty,data.count)
            this.remainBuyCount(data.buy_count)
            this.setCountDownTime(data.endtime -gcore.SmartSocket.getTime())
            this.levelBoxStatus(data.status,data.order)
            this.showBossMessageItem(data.difficulty)

            let container_y = this.item_scrollview.content.y
            let cur_pos = this.getCurrentPos(Math.abs(container_y))
            this.scrollviewSprintBar(cur_pos)
        }
        this.ctrl.send25414()
    },
    createAreaList(){
        if(this.item_list_panel.length == 0){
            this.timer =  this.startUpdate(this.area_list.length,function(index){
                let item = new LimitExerciseChangeItem()
                item.setParent(this.item_scrollview.content)
                item.show()
                item.setPosition(0,index*item.HeightItem)
                item.setData(this.area_list[index])
                item.addCallBack(function(cell,order_type,order_id,index){
                    this.onCellTouched(cell,order_type,order_id,index)
                }.bind(this))
                this.item_list_panel.push(item)
            }.bind(this),100)
        }else{
            for(let i=0;i<this.area_list.length;++i){
                let item = this.item_list_panel[i]
                if(!item){
                    let item = new LimitExerciseChangeItem()
                    item.setParent(this.item_scrollview.content)
                    item.show()
                    item.setPosition(0,index*item.HeightItem)
                    item.addCallBack(function(cell,order_type,order_id,index){
                        this.onCellTouched(cell,order_type,order_id,index)
                    }.bind(this))
                    this.item_list_panel[i] = item;
                }
                item.setData(this.area_list[i])
                item.setItemIndex()
            }
        }
        this.item_scrollview.content.height = this.area_list.length * 568
    },
    setRoundHero(change_id,count){
        this.level_num.string = (change_id || 1)
        this.change_count.string = (count || 0)
    },
    //剩余购买次数
    remainBuyCount(buy_count){
        buy_count = buy_count || 0
        if(this.remain_count){
            let count = 0
            let const_data = Config.holiday_boss_new_data.data_const.fight_buy_max_count
            if(const_data && const_data.val){
                count = const_data.val - buy_count
                if(count <= 0){
                    count = 0
                }
                this.remain_count.string = ("剩余购买次数："+count)
            }
        }
    },
    setCountDownTime(less_time){
        if(this.ramain_time){
            if(this.time_tichet){
                gcore.Timer.del(this.time_tichet);
                this.time_tichet = null;
            }
            if(less_time > 0){
                this.setTimeFormatString(less_time)
                this.time_tichet = gcore.Timer.set(function(){
                    less_time-- 
                    if(less_time < 0){
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                        this.ramain_time.string = ("00:00:00")
                    }else{
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this),1000,-1)
            }else{
                this.setTimeFormatString(less_time)
            }
        }
    },
    setTimeFormatString(time){
        if(time > 0){
            this.ramain_time.string = (TimeTool.getTimeFormatDay(time))
        }else{
            this.ramain_time.string = ("00:00:00")
        }
    },
    //宝箱状态
    levelBoxStatus(status,ord_id){
        if(this.cur_box_status == status) return;

        this.cur_box_status = status

        let id = this.getBoxRewardID(ord_id)
        this.loadRes(PathTool.getUIIconPath("limitexercise","limitexercise_box"+id),function(res){
            this.box_sprite.spriteFrame = res
        }.bind(this))

        if(status == 1){
            this.box_sprite.node.stopAllActions()
            let skewto_1 = cc.rotateTo(0.1, 10)
            let skewto_2 = cc.rotateTo(0.1, -10)
            let skewto_3 = cc.rotateTo(0.1, 0)
            let seq = cc.sequence(skewto_1,skewto_2, skewto_1,skewto_2, skewto_1,skewto_2,skewto_3,cc.delayTime(1))
            let repeatForever = cc.repeatForever(seq)
            this.box_sprite.node.runAction(repeatForever)
        }else if(status == 2){
            this.box_sprite.node.stopAllActions()
        }
    },
    getBoxRewardID(ord_id){
        let diff = this.model.getCurrentDiff(ord_id)
        let count = 1
        if(this.reward_list[diff]){
            for(let i=1;i<=3;++i){
                if(ord_id <= this.reward_list[diff][1].order_id){
                    count = 1
                }else if(ord_id > this.reward_list[diff][1].order_id && ord_id <= this.reward_list[diff][2].order_id){
                    count = 2
                }else if(ord_id > this.reward_list[diff][2].order_id){
                    count = 3
                }
            }
        }
        return count
    },
    //显示boss信息  轮次，难度
    showBossMessageItem(diff){
        let round = this.model.getCurrentRound()
        diff = diff || 1
        if(this.item_scrollview){
            if(this.change_boss_list[round] && this.change_boss_list[round][diff]){
                this.area_list = []
                for(let i in this.change_boss_list[round][diff]){
                    let v = this.change_boss_list[round][diff][i]
                    this.area_list.push(v)
                }
                cc.log(this.area_list)
                let level_type = this.model.getCurrentType()
                let count = 1
                if(level_type){
                    count = level_type
                }
                this.item_scrollview.content.y = (count - 1) * -568
                this.sroll_main_spr.y = (this.left_scrollview_pos[count])
            }
        }
        this.createAreaList()
    },
    //关卡信息  (关卡类型、关卡id)
    getLevelMessage(ord_type,ord_id){
        ord_type = ord_type || 1
        ord_id = ord_id || this.model.getCurrentChangeID()
        if(this.cur_order_type == ord_type && this.cur_order_id == ord_id){
            return
        }
        let round = this.model.getCurrentRound()
        let diff = this.model.getCurrentDiff()
        if(!round) return;

        this.level_area_text.string = (LimitExerciseConstants.type[ord_type])

        if(this.change_boss_list[round] && this.change_boss_list[round][diff]){
            let lev_data = this.change_boss_list[round][diff]
            if(ord_id >= 15) {
                ord_id = 15
            }  
            if(lev_data[ord_type] && lev_data[ord_type][ord_id]){
                let lev_count = lev_data[ord_type][ord_id].order_id
                this.level_text.string = (Utils.TI18N("第")+lev_count+Utils.TI18N("关"))

                if(lev_count == this.model.getCurrentChangeID()){
                    this.btn_change_btn.interactable = true;
                    this.btn_change_btn.enableAutoGrayEffect = false;
                    this.change_outline.enabled = true;
                }else{
                    this.btn_change_btn.interactable = false;
                    this.btn_change_btn.enableAutoGrayEffect = true;
                    this.change_outline.enabled = false
                }

                let str = ""
                let desc = lev_data[ord_type][ord_id].add_skill_decs || []
                for(let i=0;i<desc.length;++i){
                    str = str+desc[i]+"\n"
                }
                this.level_effect_desc.string = (str)
                let power = lev_data[ord_type][ord_id].power || 0
                this.power.string = (Utils.TI18N("お勧め戦力:")+power)

                if(this.cur_order_type != ord_type){
                    let count = this.getBoxRewardID(ord_id)
                    if(this.reward_list[diff] && this.reward_list[diff][count]){
                    //获取奖励
                        let data_list = this.reward_list[diff][count].reward || []
                        let setting = {}
                        setting.scale = 0.6
                        setting.max_count = 3
                        setting.is_center = true
                        setting.show_effect_id = 263
                        this.level_item_list = Utils.commonShowSingleRowItemList(this.change_item, this.level_item_list, data_list, setting,this.change_item_content)
                    }
                }
            }
        }
        this.cur_order_type = ord_type
        this.cur_order_id = ord_id
    },
    onCellTouched(cell,order_type,order_id,index){
        if(this.touch_kuang == null){ 
            this.touch_kuang = new cc.Node()
            let image = this.touch_kuang.addComponent(cc.Sprite)
            image.type = cc.Sprite.Type.SLICED;
            image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            this.touch_kuang.setContentSize(110,110)
            this.item_scrollview.content.addChild(this.touch_kuang,99)
            this.loadRes(PathTool.getUIIconPath("common","common_90019"),function(res){
                image.spriteFrame = res
            }.bind(this))
        }
        let item = cell.getBtnMaster(index)
        if(item){
            let worldPos = item.convertToWorldSpaceAR(cc.v2(0,0))
            let pos = this.item_scrollview.content.convertToNodeSpace(worldPos)
            this.touch_kuang.setPosition(pos.x-25,pos.y-4)
        }
        this.getLevelMessage(order_type,order_id)
    },
    updateSlideShowByVertical(){
        let container_y = this.item_scrollview.content.y
        if(this.item_scrollview){
            let cur_pos = this.getCurrentPos(Math.abs(container_y))
            this.scrollviewSprintBar(cur_pos)
            this.level_area_text.string = LimitExerciseConstants.type[cur_pos]
        }
    },
    //判断当前位置
    getCurrentPos(pos){
        let cur_pos = 1
        if(pos >= this.pos_interval[0][0] && pos <= this.pos_interval[0][1]){
            cur_pos = 1
        }else if(pos >= this.pos_interval[1][0] && pos <= this.pos_interval[1][1]){
            cur_pos = 2
        }else if(pos >= this.pos_interval[2][0] && pos <= this.pos_interval[2][1]){
            cur_pos = 3
        }
        return cur_pos
    },
    //滑动的动作处理
    scrollviewSprintBar(cur_pos){
        if(this.scrollview_bar == cur_pos) return;
        this.scrollview_bar = cur_pos
        this.sroll_main_spr.stopAllActions()
        // doStopAllActions(this.sroll_main_spr)

        let fadeout = cc.fadeOut(0.3)
        let fadein = cc.fadeIn(0.3)
        let move_to = cc.moveTo(0.1,cc.v2(-319, this.left_scrollview_pos[cur_pos]))
        let scaleto1 = cc.scaleTo(0.1, 1.2)
        let scaleto2 = cc.scaleTo(0.1, 1)
        let spawn = cc.spawn(fadein,move_to)
        let seq = cc.sequence(fadeout,spawn,scaleto1,scaleto2)
        this.sroll_main_spr.runAction(seq)
    },
    setItemIndex(){
        //默认点击
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.timer){
            this.stopUpdate(this.timer)
            this.timer = null
        }
        if(this.item_list_panel){
            for(let i=0;i<this.item_list_panel.length;++i){
                if(this.item_list_panel[i]){
                    this.item_list_panel[i].deleteMe()
                    this.item_list_panel[i] = null;
                }
            }
            this.item_list_panel = null;
        }
        if(this.level_item_list){
            for(let i=0;i<this.level_item_list.length;++i){
                if(this.level_item_list[i]){
                    this.level_item_list[i].deleteMe()
                    this.level_item_list[i] = null;
                }
            }
            this.level_item_list = null;
        }
        this.ctrl.openLimitExerciseChangeView(false)
    },
})