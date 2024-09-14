// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-18 17:58:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool")
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var RoleController = require("role_controller")
var ActionAccLevelUpGiftPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_acc_level_up_gift_panel");
        this.ctrl =  ActionController.getInstance()
        this.holiday_bid = arguments[0]
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        // --列表数据
        this.cell_data_list = [];
        // --预制
        this.cell_list = {};
        this.rewardList = []
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this
        self.main_container = self.root_wnd.getChildByName("main_container")

        self.title_con = self.main_container.getChildByName("title_con")
        self.title_img = self.title_con.getChildByName("title_img")
        let tab_vo = self.ctrl.getActionSubTabVo(self.holiday_bid)
        if (tab_vo){
            if (tab_vo.aim_title == null || tab_vo.aim_title == ""){
                tab_vo.aim_title = "txt_cn_action_acc_level_up_gift"
            }
            let path = PathTool.getUIIconPath("bigbg/action",tab_vo.aim_title)
            this.loadRes(path,function(res){
                self.title_img.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
        }
    
        self.charge_con_sv =  this.seekChild("charge_con",cc.ScrollView)
        let dec =  self.title_con.getChildByName("dec");
        dec.active = false;
        dec.getComponent(cc.Label).string = "イベント期間中、ランクに対応した報酬を受け取れます\n期間・数量限定の報酬なので、お早目に受け取ってください";
        this.time_rt = self.title_con.getChildByName("time_node").getChildByName("time_lab").getComponent(cc.RichText)
        self.setLessTime(tab_vo.remain_sec)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_LEVEL_UP_GIFT,function(data){
            if(data){
                this.setData(data);
            }
        }.bind(this))
        this.ctrl.send21200()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData(data){
        this.cell_data_list = [];
        var self = this
        let is_redpoint = false
        for(let i=0;i<data.gifts.length;++i){
            let v = data.gifts[i]
            let config = gdata("lev_gift_data", "data_level_welfare", v.id)
            if (config){
                let data = {}
                data.id = v.id
                data.config = config
                self.cell_data_list.push(data) 
            }
            //--status 0:不能领取, 1:可领取, 2:已领取
            if (self.cell_data_list[i]){
                if (v.status == 1 &&  v.num >= self.cell_data_list[i].config.num){
                    // --已领数量已经满了 也算不能领取
                    v.status = 4        
                }
                if (v.status == 0){ //--不可领取
                    self.cell_data_list[i].order = 2
                }else if (v.status == 4){ //--可领取但是已经没有得领取了
                    self.cell_data_list[i].order = 3
                    v.status = 0
                }else if(v.status == 2){// --已领取
                    self.cell_data_list[i].order = 4
                }else{ // --可领取
                    self.cell_data_list[i].order = 1
                }
                self.cell_data_list[i].status = v.status //--状态
                // --判定是否有红点
                if (!is_redpoint && v.status == 1){
                    is_redpoint = true
                }
                self.cell_data_list[i].num = v.num //--全服数量
            }
        }
        self.cell_data_list.sort(Utils.tableLowerSorter(["order"],["id"]))
        this.ctrl.setHolidayStatus(self.holiday_bid, is_redpoint)
        self.updateScrollviewList()
    },
    updateScrollviewList(){
        this.charge_con_sv.content.height = this.cell_data_list.length * 150
        for(let i=0;i<this.cell_data_list.length;++i){
            let k = this.cell_data_list[i]
            if(this.cell_list[k.id] == null){
                Utils.delayRun(this.charge_con_sv.content,i/30,function(){
                    this.loadRes(PathTool.getPrefabPath("action", "action_acc_level_up_gift_item"),function(Prefab){
                        let node = Prefab;
                        this.charge_con_sv.content.addChild(node);
                        let cellView = node.getChildByName("main_container").getChildByName("item_scrollview").getComponent(cc.ScrollView)
                        let offsetX = 10
                        let scale = 0.8
                        let width = 120
                        cellView.content.widht = (width*scale * k.config.reward.length) + (k.config.reward.length-1 * offsetX)
                        let item_count = k.config.reward.length
                        if(item_count <= 4){
                            cellView.enabled = false;
                        }else{
                            cellView.enabled = true;
                        }
                        node.getChildByName("main_container").getChildByName("btn_go").on("click",function(){
                            Utils.playButtonSound(1)
                            this.setCellTouched(k.id)
                        },this)
                        let arr = []
                        for(let j=0;j<k.config.reward.length;++j){
                            let v = k.config.reward[j]
                            let item_node = ItemsPool.getInstance().getItem("backpack_item")
                            item_node.setDefaultTip()
                            item_node.setPosition(width/2 + j*(width+offsetX) * scale,0)
                            item_node.setParent(cellView.content);
                            item_node.initConfig(false, scale, false, true);
                            item_node.show();
                            item_node.setData({bid:v[0], num:v[1]})
                            arr.push(item_node)
                        }
                        this.cell_list[k.id] = node;
                        this.setCellByIndex(node,k)
                        this.updateCellByIndex(node,i);
                        this.rewardList.push(arr)
                    }.bind(this))
                }.bind(this))
            }else{
                this.updateCellByIndex(this.cell_list[k.id],i)
            }
            
        }
    },
    setCellTouched(id){
        for(let i=0;i<this.cell_data_list.length;++i){
            let v = this.cell_data_list[i]
            if(v.id == id){
                if(v.status == 1){
                    this.ctrl.send21201(id)    
                }
                break
            }
        }
    },
    setCellByIndex(cell, data){
        let cell_data = data
        if (!cell_data) return
        let config = cell_data.config

        // --角色等级
        let role_vo = RoleController.getInstance().getRoleVo()
        let lev = role_vo && role_vo.lev || 0;
        let levStr 
        let main_container = cell.getChildByName("main_container")
        let title = main_container.getChildByName("title")
        if (lev >= config.lev){ 
            title.color = new cc.Color(44,125,8)
            //levStr = "达到"+config.lev+"级 ("+ config.lev+"/"+config.lev+")";
            levStr = cc.js.formatStr("レベル%sに到達 （%s/%s）",config.lev,config.lev,config.lev);
        }else{
            title.color = new cc.Color(90,58,51)
            //levStr = "达到"+config.lev+"级 ("+ lev + "/" + config.lev + ")";
            levStr = cc.js.formatStr("レベル%sに到達 （%s/%s）",config.lev,lev ,config.lev);
        }
        title.getComponent(cc.Label).string = levStr;


    },
    updateCellByIndex(cell,index){
        cell.y = (-cell.height/2) - (index * cell.height);
        let cell_data = this.cell_data_list[index]
        let btn_go = cell.getChildByName("main_container").getChildByName("btn_go")
        let pic_has = cell.getChildByName("main_container").getChildByName("pic_has")
        let config = cell_data.config
        // --按钮
        if (cell_data.status == 0){
            // --不可领取
            btn_go.active = true;
            pic_has.active = false;
            Utils.setGreyButton(btn_go.getComponent(cc.Button),true);
        }else if(cell_data.status == 1){
            // --可以领取
            btn_go.active = true;
            pic_has.active = false;
            Utils.setGreyButton(btn_go.getComponent(cc.Button),false);
        }else{
            // --已领取
            btn_go.active = false;
            pic_has.active = true;
        }

        let portion_count = cell.getChildByName("main_container").getChildByName("portion_count")
        // --领取数量
        let count = config.num - cell_data.num
        if (count < 0){
            count = 0
        }
        portion_count.getComponent(cc.Label).string = "残り"+count+"個";
    },
    setVisibleStatus(bool){
        bool = bool || false
        this.setVisible(bool) 
    },
    setLessTime(less_time){
        if(!this.time_rt){
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
        var self = this
        if (time > 0){
            let str = "残り時間：<color=#14ff32>"+TimeTool.getTimeFormatDayIIIIII(time)+"</color>";
            self.time_rt.string = str;
        }else{
            self.time_rt.string = "";
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.cell_list){
            for(let i=0;i<this.rewardList.length;++i){
                for(let j=0;j<this.rewardList[i].length;++j){
                    if(this.rewardList[i][j].deleteMe){
                        this.rewardList[i][j].deleteMe()
                    }
                }
            }
        }
    },
})