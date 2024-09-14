// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-21 17:06:17
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var TimeTool = require("timetool")
var ActionConst = require("action_const");
var ActionEvent = require("action_event");
var CommonScrollView = require("common_scrollview");
var ActionLimitCommonItem = require("action_limit_common_item")
var TaskConst = require("task_const")
var ActionLimitYuanZhenPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_yuanzhen_panel");
        this.holiday_bid = arguments[0]
        this.ctrl = ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        // --根据任务id 保存的列表
        this.dic_task_list = {}
        // --scrollview列表
        this.dic_limit_list = {}
        this.limit_list = []

        this.action_yuanzhen_id = 13005
        this.action_summer_id = 25013
        this.action_wolf_id = 26002
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        let x = this.getPositionX()
        this.setPosition(x,-10)
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.main_container_size = this.main_container.getContentSize()
    
        let title_con = this.main_container.getChildByName("title_con")
        this.title_desc_lb = title_con.getChildByName("title_desc").getComponent(cc.Label)
        this.title_desc_lb.node.active = false;
        title_con.getChildByName("time_title").getComponent(cc.Label).string = Utils.TI18N("剩余时间:")
        this.time_val = title_con.getChildByName("time_val").getComponent(cc.Label)
        this.goods_con = this.main_container.getChildByName("goods_con")
    
        // -- 横幅图片
        let title_img = title_con.getChildByName("title_img").getComponent(cc.Sprite)
        let title_str = "txt_cn_welfare_banner17"
        this.activity_id = 0
        let tab_vo = Utils.deepCopy(this.ctrl.getActionSubTabVo(this.holiday_bid))
        if(tab_vo){
            // --网络传过来的优先拿网络的
            if(tab_vo.reward_title != null && tab_vo.reward_title != ""){
                title_str = tab_vo.reward_title
            }
            this.activity_id = tab_vo.camp_id
        }
        let Path = PathTool.getWelfareBannerRes(title_str)
        this.loadRes(Path,function(res){
            title_img.spriteFrame = res
        })
        // -- 活动剩余时间
        let time = 0
        if(tab_vo){
            time = tab_vo.remain_sec || 0
        }
        if(time < 0){
            time = 0
        }
        this.setLessTime(time)
        // --左边按钮
        this.common_btn = title_con.getChildByName("common_btn")
        if(this.holiday_bid == ActionConst.ActionRankCommonType.action_wolf || this.holiday_bid == ActionConst.ActionRankCommonType.exercise_1 ||
           this.holiday_bid == ActionConst.ActionRankCommonType.exercise_2 || this.holiday_bid == ActionConst.ActionRankCommonType.exercise_3){
            this.common_btn.active = false;
        }else{
            this.common_btn.active = true;
        }
        if(this.holiday_bid == ActionConst.ActionRankCommonType.yuanzhen_adventure){
            this.ctrl.sender24810()
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_1){
            this.ctrl.sender24813()
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_2){
            this.ctrl.sender24815()
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.exercise_3){
            this.ctrl.sender24817()
        }else{
            this.ctrl.cs16603(this.holiday_bid)
        }

        let scroll_view_size = this.goods_con.getContentSize()
        let setting = {
            item_class : ActionLimitCommonItem,
            start_x : 0,                     //-- 第一个单元的X起点
            space_x : 0,                     //-- x方向的间隔
            start_y : 0,                     //-- 第一个单元的Y起点
            space_y : 0,                     //-- y方向的间隔
            item_width : 688,                //-- 单元的尺寸width
            item_height : 152,               //-- 单元的尺寸height
            row : 1,                         //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            once_num : 1,                    ///-- 每次创建的数量
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.goods_con,cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0, 0))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.common_btn.on('click',this.onCommonBtn,this)
        this.addGlobalEvent(ActionEvent.YUAN_ZHEN_DATA_EVENT,function(data){
            if(!data) return;
            if(data.camp_id == this.activity_id){
                let sort_func = Utils.tableLowerSorter(["id"])
                data.quest_list.sort(sort_func)
                this.action_id = data.camp_id
                this.initUI()
                this.initYuanZhenData(data.quest_list, true)
            }
        }.bind(this))

        this.addGlobalEvent(ActionEvent.YUAN_ZHEN_UPDATA_EVENT,function(data){
            if(!data) return;
            this.initYuanZhenData([data])
        }.bind(this))

        this.addGlobalEvent(ActionEvent.YUAN_ZHEN_TASK_EVENT,function(data){
            if(!data) return;
            if(!this.action_id) return;
            // --后端要求我模拟完成条件
            let key = Utils.getNorKey(this.action_id, data.id)
            let config = Config.holiday_lanterm_adventure_data.data_lanterm_adventure[key]
            if(config && this.dic_limit_list[config.f_id]){
                this.dic_limit_list[config.f_id].status = TaskConst.task_status.completed
                this.dic_limit_list[config.f_id].sort = TaskConst.task_status.completed

                let config_list = Config.holiday_lanterm_adventure_data.data_lanterm_adventure_task_list[this.action_id][config.f_id]
                // --如果有下一个任务档次
                if(config_list[config.s_id + 1]){
                    let key = Utils.getNorKey(this.action_id, config_list[config.s_id + 1].id)
                    let new_config = Config.holiday_lanterm_adventure_data.data_lanterm_adventure[key]
                    if(new_config && this.dic_task_list[new_config.id]){
                        this.initYuanZhenData([this.dic_task_list[new_config.id]])
                    }else{   
                        this.sortYuanZhenInfo()
                    }
                }else{
                    this.sortYuanZhenInfo()
                }
            }
        }.bind(this))
    },
    onCommonBtn(){
        if(this.holiday_bid == ActionEvent.ActionRankCommonType.yuanzhen_adventure){
            Utils.playButtonSound(1)
            // --元宵冒险
            var MallController = require("mall_controller")
            MallController.getInstance().openMallActionWindow(true, this.holiday_bid)
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(data){
        
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setLessTime(less_time){
        if(!this.time_val){
            return
        }
        less_time =  less_time || 0;
        if (less_time > 0){
            this.setTimeFormatString(less_time)
            if(this.time_tichet == null){
                this.time_tichet = gcore.Timer.set(function(){
                    less_time-- 
                    this.setTimeFormatString(less_time)
                    if(less_time <=0 ){
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                    }
                }.bind(this),1000,-1)
            }
        }else{
            this.setTimeFormatString(less_time)
        }
    },
    setTimeFormatString( time ){
        if (time > 0){
            let str = TimeTool.getTimeFormatDayIIIIIIII(time);
            this.time_val.string = str;
        }else{
            this.time_val.string = "00:00:00";
        }
    },
    initUI(){
        if(this.action_id == this.action_yuanzhen_id){
            let icon = this.common_btn.getChildByName("icon").getComponent(cc.Sprite)
            if(icon){
                let path = PathTool.getIconPath("welfare/action_icon","welfare_icon_99")
                this.loadRes(path,function(res){
                    icon.spriteFrame = res
                }.bind(this))
            }
            this.common_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("花灯集市")
            this.title_desc_lb.node.active = false;
            this.title_desc_lb.string = Utils.TI18N("活动期间完成任务获取元宵花灯等限时奖励")
        }else if(this.action_id == this.action_summer_id){
            this.common_btn.active = false;
        }
    },
    initYuanZhenData(quest_list){
        if(!this.action_id)  return;
        if(!quest_list) return;
    
        for(let i=0;i<quest_list.length;++i){
            let v = quest_list[i]
            this.dic_task_list[v.id] = v
            let key = Utils.getNorKey(this.action_id, v.id)
            let config = Config.holiday_lanterm_adventure_data.data_lanterm_adventure[key]
            if(config && v.finish != TaskConst.task_status.over){
                let task = this.dic_limit_list[config.f_id] ///--父类id
                if(task == null){
                    task = {}
                    task.holiday_bid = this.holiday_bid
                    this.dic_limit_list[config.f_id] = task
                    this.limit_list.push(task)
                }
                let is_chang = true
                if(task.config){
                    if(config.s_id > task.config.s_id){
                        // --当前 序号比记录大 那么如果记录 未领取奖励 不能替换 
                        if(task.status != TaskConst.task_status.completed){
                            is_chang = false
                        }
                    }else if(config.s_id < task.config.s_id){
                        // --当前 序号比记录小  如果 当前已领取奖励 不能替换
                        if(v.finish == TaskConst.task_status.completed){
                            is_chang = false
                        }
                    }
                }
                if(is_chang){
                    task.config = config
                    task.f_id = config.f_id
                    if(v.finish == TaskConst.task_status.finish){
                        task.sort = 0
                    }else if(v.finish == TaskConst.task_status.un_finish){
                        task.sort = 1
                    }else{
                        task.sort = v.finish
                    }
                    
                    task.status = v.finish //--总状态 (0:未完成 1:已完成 2:已奖励, 3:已过期)"}
                    task.title = config.title
                    task.desc = config.desc
                    //--目标值当前值(x/n)
                    let target_val 
                    let value
                    if(v.progress[0]){
                        target_val = v.progress[0].target_val
                        value = v.progress[0].value
                    }
                    task.goal = cc.js.formatStr("(%s/%s)",value, target_val)
                    task.end_time = v.end_time 
                    task.item_list = config.award
                }
            } 
        }
    
        this.sortYuanZhenInfo()
    
    },
    sortYuanZhenInfo(){
        let sort_func = Utils.tableLowerSorter(["sort","f_id"])
        this.limit_list.sort(sort_func)
        if(this.item_scrollview.getItemList().length){
            this.item_scrollview.resetAddPosition(this.limit_list)  
        }else{
            this.item_scrollview.setData(this.limit_list)
        }
        

    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.item_scrollview){
            this.item_scrollview.deleteMe()
            this.item_scrollview = null;
        }
    },
})