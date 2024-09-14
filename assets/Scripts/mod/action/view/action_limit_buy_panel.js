// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     每日抢购
// <br/>Create: 2019-04-24 09:59:52
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var TimeTool = require("timetool")
var CommonScrollView = require("common_scrollview");
var ActionLimitBuyItem = require("action_limit_buy_item")
var ActionLimitBuyPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_limit_buy_panel");
        this.ctrl =  ActionController.getInstance()
        this.holiday_bid = arguments[0]
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        let x = this.getPositionX()
        self.setPosition(x,-50)
        self.main_container = self.root_wnd.getChildByName("main_container")
        self.title_con = self.main_container.getChildByName("title_con")
        self.time_val = self.title_con.getChildByName("time_val").getComponent(cc.Label)
        self.time_title = self.title_con.getChildByName("time_title")
        self.charge_con = self.main_container.getChildByName("charge_con")
        
        self.title_img = self.title_con.getChildByName("title_img")
        if(self.holiday_bid != null || self.holiday_bid != 0 && self.action_type != null || self.action_type != 0){
            let tab_vo = self.ctrl.getActionSubTabVo(self.holiday_bid)
            if(tab_vo){
                if(tab_vo.aim_title == ""){
                    tab_vo.aim_title = "txt_cn_action_limit_title"
                }
                let path = PathTool.getUIIconPath("bigbg/action",tab_vo.aim_title)
                this.loadRes(path,function(res){
                    self.title_img.getComponent(cc.Sprite).spriteFrame = res;
                }.bind(this))
            }
        }
        let scroll_view_size = self.charge_con.getContentSize()
        let setting = {
            item_class : ActionLimitBuyItem, //-- 单元类
            start_x : 10, //-- 第一个单元的X起点
            space_x : 0, //-- x方向的间隔
            start_y : 0, //-- 第一个单元的Y起点
            space_y : 0, //-- y方向的间隔
            item_width : 679, //-- 单元的尺寸width
            item_height : 164, //-- 单元的尺寸height
            row : 0, //-- 行数，作用于水平滚动类型
            col : 1 //-- 列数，作用于垂直滚动类型
        }
        self.item_scrollview = new CommonScrollView()
        self.item_scrollview.createScroll(self.charge_con,cc.v2(0, 0),ScrollViewDir.vertical,ScrollViewStartPos.top,scroll_view_size,setting)
        Utils.getNodeCompByPath("main_container/title_con/time_title", this.root_wnd, cc.Label).string = Utils.TI18N("剩余时间：");
    },  

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if(data.bid == this.holiday_bid){
                this.createList(data)
            }
        }.bind(this))
        this.ctrl.cs16603(this.holiday_bid)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    createList(data){
        if(!data){
            return
        }
        let item_list = []
        this.everyday_data = null
        for(let i=0;i<data.aim_list.length;++i){
            let v = data.aim_list[i]
            // --99是和后端 运营协议好的数字  99 为每日礼的
            if(v.aim == 99 ){ 
                this.everyday_data = v
            }else{
                v.sort_index = 1
                if(v.status == 1){
                    v.sort_index = 0
                }else if(v.status == 2){
                    v.sort_index = 2
                }
                item_list.push(v)

            }
        }
        let sort_func = Utils.tableLowerSorter(["sort_index", "aim"])
        item_list.sort(sort_func)
        this.item_scrollview.setData(item_list)
        this.setLessTime(data.remain_sec)

        // --每日礼的红点
        // if self.everyday_data and self.everyday_data.status ~= 2 then
        //     addRedPointToNodeByStatus(self.everyday_btn, true)
        // else
        //     addRedPointToNodeByStatus(self.everyday_btn, false)
        // end
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
        this.rest_time = time
        if(time > 0){
            this.time_val.string = TimeTool.getTimeFormatDayIIIIII(time);
        }else{
            this.time_val.string = "00:00:00";
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})