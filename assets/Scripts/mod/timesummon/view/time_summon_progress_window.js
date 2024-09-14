// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-11 16:53:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeSummonProgressView = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_summon_progress");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.award_item_list = {}  // 奖励item列表
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        let container = this.root_wnd.getChildByName("container")
        this.container = container
    
        let win_title = container.getChildByName("win_title").getComponent(cc.Label)
        win_title.string = Utils.TI18N("查看奖励")
    
        this.close_btn = container.getChildByName("close_btn")
        this.summon_num_txt = container.getChildByName("title_txt_1").getComponent(cc.Label)
    
        this.progress = container.getChildByName("progress").getComponent(cc.ProgressBar)
        
        let time_label = container.getChildByName("time_label").getComponent(cc.Label)
        time_label.string = Utils.TI18N("限定召唤期间达到指定招募次数可获对应奖励");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on("click",function(){
            Utils.playButtonSound(2)
            this.ctrl.openTimeSummonProgressView(false)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.cur_times = params.times
        this.camp_id = params.camp_id
        this.setData()
    },
    setData(){
        if(this.cur_times == null|| this.camp_id == null){
            return
        }
        this.summon_num_txt.string = cc.js.formatStr(Utils.TI18N("当前已招募次数：%d"), this.cur_times)
        let award_config = Config.recruit_holiday_data.data_award[this.camp_id]
        var EliteSummonController = require("elitesummon_controller")
        let status = EliteSummonController.getInstance().getModel().isHolidayHasID(this.camp_id)
        if(status){
            award_config = Config.recruit_holiday_elite_data.data_award[this.camp_id]
        }
        let start_x = 100
        let distance_x = 523
        if(award_config){
            let offset_x = (distance_x - start_x + 60.5)/(Utils.getArrLen(award_config)-1)
            for(let i in award_config){
                let v = award_config[i]
                let item = this.award_item_list[i]
                if(item == null){
                    item = this.creatorTimeSummonProgressItem()
                    this.container.addChild(item)
                    this.award_item_list[i] = item
                }
                item.active = true
                let reward = v.reward[0]
                item.award_item.setData({bid:reward[0],num:reward[1]})
                item.times_txt.string = v.times
                if(v.times<=this.cur_times){
                    item.award_item.setReceivedIcon(true)
                }else{
                    item.award_item.setReceivedIcon(false)
                }
                let pos_x = start_x + (i-1)*offset_x
                item.setPosition(cc.v2(-(this.container.width/2) + pos_x, -65))
            }

            // -- 计算进度条
            let last_times = 0
            let progress_width = 523
            let first_off = start_x-60.5 // 0到第一个的距离
            let distance = 0
            for(let i in award_config){
                let v = award_config[i]
                if(i == 1){
                    if(this.cur_times <= v.times){
                        distance = (this.cur_times/v.times)*first_off
                        break
                    }else{
                        distance = first_off
                    }
                }else{
                    if(this.cur_times <= v.times){
                        distance = distance + ((this.cur_times-last_times)/(v.times-last_times))*offset_x
                        break
                    }else{
                        distance = distance + offset_x
                    }
                }
                last_times = v.times
            }
            this.progress.progress = distance/progress_width;
        }
    },
    creatorTimeSummonProgressItem(){
        let size = cc.size(84, 122)
        let node = new cc.Node();
        node.setContentSize(size)
        node.setAnchorPoint(cc.v2(0.5, 0))
        let award_item = ItemsPool.getInstance().getItem("backpack_item")
        award_item.initConfig(false, 0.7, true, true);
        award_item.setPosition(0,-119/2*0.7+size.height) 
        award_item.setParent(node)
        award_item.show()
        node.award_item = award_item
        node.times_txt = Utils.createLabel(22,new cc.Color(100,50,35),null,0,-5,"1",node,null,cc.v2(0.5,1))
        let arrow = Utils.createImage(node,null,0, size.height-86,cc.v2(0.5, 1))
        let line = Utils.createImage(node,null,0, 0, cc.v2(0.5,0))
        this.loadRes(PathTool.getUIIconPath("timesummon","timesummon_1004"),function(res){
            arrow.spriteFrame = res
        }.bind(this))
        this.loadRes(PathTool.getUIIconPath("timesummon","timesummon_1005"),function(res){
            line.spriteFrame = res
        }.bind(this))
        return node
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.award_item_list){
            for(let i in this.award_item_list){
                if(this.award_item_list[i].award_item){
                    this.award_item_list[i].award_item.deleteMe();
                    this.award_item_list[i].award_item = null;
                }
            }
        }
        this.award_item_list = null;
        this.ctrl.openTimeSummonProgressView(false)
    },
})