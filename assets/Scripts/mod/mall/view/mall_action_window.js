// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-19 16:53:47
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MallController = require("mall_controller")
var MallEvent = require("mall_event")
var CommonScrollView = require("common_scrollview");
var RoleController = require("role_controller")
var TimeTool = require("timetool")
var MallItem = require("mall_item");
var MallConst = require("mall_const")
var RoleEvent = require("role_event")
var MallActionWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mall", "mall_action_window");
        // this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = MallController.getInstance()
        this.role_vo = RoleController.getInstance().getRoleVo()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tab_list = {}
        this.cur_tab = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        if (self.background != null){
            this.loadRes(PathTool.getUIIconPath("bigbg","bigbg_2","jpg"),function(res){
                self.background.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
        }
        self.background.scale = FIT_SCALE
        self.mainContainer = self.root_wnd.getChildByName("main_container")

        self.main_panel = self.mainContainer.getChildByName("main_panel")

        self.tableContainer = self.main_panel.getChildByName("tab_container")
        
        for(let i=1;i<5;++i){
            let tab_btn = self.tableContainer.getChildByName("tab_btn_"+i)
            tab_btn.getChildByName("tab_tips").active = false;
            tab_btn.getChildByName("red_num").active = false;
            tab_btn.getChildByName("select_bg").active = false;;
            tab_btn.active = false;
            self.tab_list[i] = tab_btn
        }

        self.container = self.main_panel.getChildByName("container")
        self.btn = self.container.getChildByName("btn")
        self.btn_label = self.btn.getChildByName("txt")
        self.btn.active = false;
        self.coin_bg = self.container.getChildByName("Image_50")
        self.coin = self.container.getChildByName("coin")
        self.count = self.container.getChildByName("count")
        self.add_btn = self.container.getChildByName("add_btn")
        self.add_btn.active = false
        self.refresh_count = self.container.getChildByName("refresh_count")
        self.refresh_count.getComponent(cc.Label).string = "";
        self.tips_btn = self.container.getChildByName('tips_btn')
        self.tips_btn.active = false
        self.time = self.container.getChildByName("time").getComponent(cc.Label);
        self.time.node.active = false

        self.good_cons = self.container.getChildByName("good_cons")

        self.winTitle = self.main_panel.getChildByName("win_title")
        self.winTitle.getComponent(cc.Label).string = "イベントショップ";

        self.close_btn = self.main_panel.getChildByName("close_btn")
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(MallEvent.Update_Action_event,function(data){
            this.updateData(data)
        }.bind(this))
        // --获取所有活动数据
        this.addGlobalEvent(MallEvent.Buy_Action_Shop_Success_event, function(data){
            if (!this.action_data_list) return 
            if (this.cur_index && this.action_data_list[this.cur_index]){
                if (this.action_data_list[this.cur_index].bid == data.bid){
                    let exchange_list = this.action_data_list[this.cur_index].exchange_list
                    let list = this.common_scrollview.data_list
                    for(let i=0;i<list.length;++i){
                        let cell = list[i]
                        if (cell.index && exchange_list[cell.index].aim == data.aim){
                            exchange_list[cell.index].buy_count = data.buy_count
                            if(this.common_scrollview){
                                this.common_scrollview.updateItemData(cell.index,this.convertItemInfo(exchange_list[cell.index]))
                            }
                        }
                    }
                }
            }
        }.bind(this))
        if(this.role_assets_event == null){
            this.role_assets_event = this.role_vo.bind(RoleEvent.UPDATE_ROLE_ACTION_ASSETS, function(key, value){
                if (!this.action_data_list) return
                if (this.cur_index && this.action_data_list[this.cur_index]){
                    if (key == this.action_data_list[this.cur_index].need_id){
                        this.count.getComponent(cc.Label).string = value;
                    }
                }
            }.bind(this))
        }
        for(let i in this.tab_list){
            let tab_btn = this.tab_list[i]
            tab_btn.on('click',function(){
                this.changeTabView(i,true)
            },this)
        }
        this.close_btn.on('click',function(){
            Utils.playButtonSound(2)
            this.onCloseBtn()
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.first_bid = params 
        this.ctrl.send16660()
    },
    updateData(data){
        var self = this;
        if(!data)return;
        if (data.holiday_exchanges && Utils.next(data.holiday_exchanges) == null)  return 
        // --记录道具信息
        self.dic_item_config = {}
        // --商城数据
        self.action_data_list = {}
        self.cur_index = 1
        data.holiday_exchanges.sort(function(a,b){
            return a.bid  - b.bid 
        })
        for(let i=0;i<data.holiday_exchanges.length;++i){
            let v = data.holiday_exchanges[i]
            let index = i + 1
            if (self.tab_list[index]){
                self.tab_list[index].getChildByName("title").getComponent(cc.Label).string = v.exchange_name;
                self.tab_list[index].active = this
                if (self.first_bid && self.first_bid == v.bid){
                    self.cur_index = index
                }
            }
            v.exchange_list.sort(function(a,b){
                return a.aim - b.aim
            })
            self.action_data_list[index] = v
        }

        self.changeTabView(self.cur_index)
    },
    changeTabView( index , is_check){
        index = Number(index)
        var self = this;
        if (is_check && self.cur_index == index) return
        if (self.cur_tab != null){
            if (self.cur_tab){
                self.cur_tab.getChildByName("title").color.fromHEX(Config.color_data.data_color16[2])
            }
            self.cur_tab.getChildByName("select_bg").active = false; 
        }
        self.cur_index = index
        self.cur_tab = self.tab_list[index]
        
        if (self.cur_tab != null){
            let label = self.cur_tab.getChildByName("title")
            label.color.fromHEX(Config.color_data.data_color16[2])
            self.cur_tab.getChildByName("select_bg").active = true;
        }

        self.tips_btn.active = false;

        self.updateScrollviewList();

        self.updateInfo();
    },
    updateScrollviewList(){
        var self = this
        if (self.common_scrollview == null){
            let scroll_view_size = self.good_cons.getContentSize()
            let setting = {
                item_class : MallItem,
                start_x : 4,                     //-- 第一个单元的X起点
                space_x : 0,                     //-- x方向的间隔
                start_y : 5,                     //-- 第一个单元的Y起点
                space_y : 0,                     //-- y方向的间隔
                item_width : 306,                //-- 单元的尺寸width
                item_height : 147,               //-- 单元的尺寸height
                row : 1,                         //-- 行数，作用于水平滚动类型
                col : 2,                         //-- 列数，作用于垂直滚动类型
                delay : 4,                       //-- 创建延迟时间
                once_num : 1,                    //-- 每次创建的数量
            }
            self.common_scrollview = new CommonScrollView() 
            self.common_scrollview.createScroll(self.good_cons, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0, 0))

        }
        let itemInfo = []
        for(let i=0;i<self.action_data_list[self.cur_index].exchange_list.length;++i){
            let item = self.action_data_list[self.cur_index].exchange_list[i]
            itemInfo.push(this.convertItemInfo(item)) 
        }
        self.common_scrollview.setData(itemInfo, function (cell) {
            this.ctrl.openMallBuyWindow(true,cell)
        }.bind(this))
    },
    convertItemInfo(data){
        return {
            item_id:data.item_list[0].bid,
            item_num:data.item_list[0].num,
            price:data.expend_num,
            pay_type:data.expend_id,
            shop_type:MallConst.MallType.ActionShop,
            aim : data.aim,
            is_show_limit_label:false,
            limit_count:data.limit_buy,
            name:data.aim_str,
            has_buy:data.buy_count,
            bid : this.action_data_list[this.cur_index].bid, //--子活动编号
            lable : data.lable,
        };
    },
    // --更新主界面信息
    updateInfo(){
        var self = this
        let need_id = self.action_data_list[self.cur_index].need_id
        let config = Utils.getItemConfig(need_id)
        if (config && need_id != 0){
            let res = PathTool.getItemRes(config.icon)
            if (self.record_cost_res == null || self.record_cost_res != res){
                this.loadRes(res,function(SpriteFrame){
                    this.coin.getComponent(cc.Sprite).spriteFrame = SpriteFrame;
                }.bind(this))
            }
            self.coin_bg.active = true;
            self.coin.active = true; 
            self.count.active = true;
        }else{
            self.coin_bg.active = false;
            self.coin.active = false;
            self.count.active = false;
        }
        let count = self.role_vo.getActionAssetsNumByBid(need_id);
        self.count.getComponent(cc.Label).string = count;

        self.time.node.active = true;
        let time = self.action_data_list[self.cur_index].end_time - gcore.SmartSocket.getTime()
        if (time < 0){
            time = 0
        }
        self.setLessTime(time)
    },
    setLessTime(less_time){
        if(!this.time)return
        if (less_time > 0){
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
        this.rest_time = time
        if (time > 0){
            this.time.string = "残り時間："+TimeTool.getTimeFormatDayIIIIII(time)
        }else{
            this.time.string = "残り時間： 0";
        }
    },
    onCloseBtn(){
        this.ctrl.openMallActionWindow(false) //--关闭
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if (this.common_scrollview){
            this.common_scrollview.deleteMe();
            this.common_scrollview = null;
        }
        if(this.role_assets_event){
            this.role_vo.unbind(this.role_assets_event)
            this.role_assets_event = null
        }
        this.ctrl.openMallActionWindow(false) //--关闭
    },
})