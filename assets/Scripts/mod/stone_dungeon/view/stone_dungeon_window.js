// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-08 12:01:56
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StoneDungeonController = require("stone_dungeon_controller");
var CommonScrollView = require("common_scrollview");
var StoneDungeonEvent = require("stone_dungeon_event");
var RoleController      = require("role_controller");
var MainuiController    = require("mainui_controller");

var Stone_dungeonWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("stonedungeon", "stone_dungeon_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.first_come_in = true
        this.cur_index = 1
        this.tab_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        
        this.background_img = this.main_container.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1003"), (function(resObject){
            this.background_img.spriteFrame = resObject;
        }).bind(this));

        this.Image_2_0 = this.main_container.getChildByName("Image_2_0").getComponent(cc.Sprite);
        this.Image_2 = this.main_container.getChildByName("Image_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1013"), (function(resObject){
            this.Image_2_0.spriteFrame = resObject;
            this.Image_2.spriteFrame = resObject;
        }).bind(this));

        this.Image_3 = this.main_container.getChildByName("Image_3").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("activity","activity_8"), (function(resObject){
            this.Image_3.spriteFrame = resObject;
        }).bind(this));
        
        this.Image_1 = this.main_container.getChildByName("Image_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1036"), (function(resObject){
            this.Image_1.spriteFrame = resObject;
        }).bind(this));

        this.textCount = this.main_container.getChildByName("textCount").getComponent(cc.Label);
        this.banner_node = this.main_container.getChildByName("banner");
        this.banner_node.scale = 1;
        this.banner = this.banner_node.getComponent(cc.Sprite);
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.btnRule = this.main_container.getChildByName("btnRule");
        this.scoreView = this.main_container.getChildByName("scoreView");
        this.scoreView_img = this.scoreView.getChildByName("background").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1037"), (function(resObject){
            this.scoreView_img.spriteFrame = resObject;
        }).bind(this));

        this.tab_container = this.main_container.getChildByName("tab_container");

        var StoneDungeonTab = require("stone_dungeon_tab");
        var setting = {
            item_class: StoneDungeonTab,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 32,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                        // 列数，作用于垂直滚动类型
        };
        var scroll_view_size = this.tab_container.getContentSize();
        this.tabScrollview = new CommonScrollView()
        this.tabScrollview.createScroll(this.tab_container, cc.v2(0, 0), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);

        var StoneDungeonItem = require("stone_dungeon_item");
        var setting = {
            item_class: StoneDungeonItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 616,               // 单元的尺寸width
            item_height: 125,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            once_num:5,
        };
        var scroll_view_size = cc.size(616, 490);
        this.itemScrollview = new CommonScrollView()
        this.itemScrollview.createScroll(this.scoreView, cc.v2(0, -255), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5));

        Utils.getNodeCompByPath("main_container/Text_12", this.root_wnd, cc.Label).string = Utils.TI18N("日常副本");
        //Utils.getNodeCompByPath("main_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            Utils.playButtonSound("c_close");
            StoneDungeonController.getInstance().openStoneDungeonView(false);
        }, this);

        this.addGlobalEvent(StoneDungeonEvent.Update_StoneDungeon_Data, (function(data){
            this.changeDungeonData(this.cur_index,1);
            this.first_come_in = false;
            this.redPointStatus();
        }).bind(this));
        this.btnRule.on(cc.Node.EventType.TOUCH_END, function (event) {
            var config = Config.dungeon_stone_data.data_const.desc_rule;
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos);
        }, this)
    },

    // 红点
    redPointStatus:function(){
        var status = []
        var length = Config.dungeon_stone_data.data_type_open_length;
        var list = Config.dungeon_stone_data.data_const.dungeon_type.val;
        for(var i = 0;i<length;i++){
            var count = this.model.getChangeSweepCount(list[i]);
            status[list[i]] = false
            var bool = MainuiController.getInstance().checkIsOpenByActivate(Config.dungeon_stone_data.data_type_open[list[i]].activate);
            if(count < 2 && bool == true){
                status[list[i]] = true
            }
            var item = this.tab_list[i];
            if(item){
                item.setSelectRedPoint(status[list[i]] || false);
            }
        }
        var bool = false
        for(var i = 1;i<=length;i++){
            bool = bool || (status[i] || false)
        }
        return bool;
    },

    changeDungeonData:function(index,flag){
        index = Config.dungeon_stone_data.data_type_open[index].id || 1;
        var change_count = this.model.getChangeSweepCount(index);
        var str = "";
        var free_count = 1; //1:还有次数

        if(change_count >= 2){
            free_count = 0;
            if(change_count >= Config.dungeon_stone_data.data_buy[index].length){
                str = cc.js.formatStr(Utils.TI18N("今日已无次数"))
            }else{
                var vip_count = 1;
                for(var i in Config.dungeon_stone_data.data_buy[index]){
                    if(Config.dungeon_stone_data.data_buy[index][i].vip <= this.role_vo.vip_lev){
                        vip_count = i;
                    }
                }
                var remain_num = vip_count - change_count;
                if(remain_num <= 0){
                    remain_num = 0
                }
                str = cc.js.formatStr(Utils.TI18N("今日剩余次数: %d"),remain_num)
            }
        }else{
            str = cc.js.formatStr(Utils.TI18N("今日免费次数: %d"),Config.dungeon_stone_data.data_const.free_num.val-change_count)
        }
        this.textCount.string = str;

        if(this.itemScrollview){
            var data_info = [];
            for(var i in Config.dungeon_stone_data.data_award_list){
                if(Config.dungeon_stone_data.data_award_list[i].dun_type == index){
                    data_info.push(Config.dungeon_stone_data.data_award_list[i]);
                }
            }
            data_info.sort(function(a,b){
                return a.id - b.id;
            });

            var title_pos = this.getPoerTitle(data_info)      
            change_count = change_count + 1;
            var temp_arr = Object.keys(Config.dungeon_stone_data.data_buy[index]);
            if(change_count >= temp_arr.length){
                change_count = temp_arr.length;
            }

            var tab =  {
                title_pos: title_pos, //推荐位置
                count: free_count, //免费次数
                expend: Config.dungeon_stone_data.data_buy[index][change_count].cost, //消耗钻石
            }
            
            var list_item = this.itemScrollview.getItemList();
            if(flag == 1 && this.first_come_in == false){
                for(var i in list_item){
                    list_item[i].setExtendData(tab);
                    list_item[i].setChangeData(data_info[i]);
                }
            }else{
                this.itemScrollview.setData(data_info,null,tab)
                this.itemScrollview.jumpToMove(cc.v2(0,125 * (title_pos-1)), 0.2);
            }
        }
    },

    // 获取推荐角标
    getPoerTitle:function(data){
        var num = -1;
        var totle = data.length;
        for(var i in data){
            var clearance = this.model.getPassClearanceID(data[i].id);
            if(this.role_vo.max_power >= data[i].power){
                if(clearance && clearance.status == 1){
                    num = parseInt(i);
                }
            }
        }

        if(num+1 >= totle){
            num = totle;
        }else{
            if(data[num+1] && this.role_vo.max_power >= data[num+1].power && this.role_vo.lev >= data[num+1].lev_limit){
                num = num + 2;
            }else{
                return num+1;
            }
        }
        return num;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.send13030();
        var list = Config.dungeon_stone_data.data_const.dungeon_type.val
        var tab = [];
        for(var i=0;i<list.length;i++){
            tab.push({id:list[i]});
        }
        var res = PathTool.getIconPath("activity/activity_big", "activity_banner_1", false, false)
        this.loadRes(res, (function(resObject){
            this.banner.spriteFrame = resObject;
        }).bind(this));
        var click_callback = function(cell){
            var bool = MainuiController.getInstance().checkIsOpenByActivate(Config.dungeon_stone_data.data_type_open[cell.getData().id].activate);
            if(bool == false){
                message(Config.dungeon_stone_data.data_type_open[cell.getData().id].desc);
                return;
            }
            if(this.cur_index == cell.getData().id)return;
            var list_item = this.tabScrollview.getItemList();
            for(var i in list_item){
                if(list_item[i].getData().id == cell.getData().id){
                    list_item[i].setSelect(true)
                }else{
                    list_item[i].setSelect(false)
                }
            }
            this.cur_index = cell.getData().id;
            this.changeDungeonData(cell.getData().id)
            var res = PathTool.getIconPath("activity/activity_big", "activity_banner_"+Config.dungeon_stone_data.data_type_open[cell.getData().id].id, false, false)
            this.loadRes(res, (function(resObject){
                this.banner.spriteFrame = resObject;
            }).bind(this));
        }.bind(this);

        this.tabScrollview.setData(tab,click_callback);

        if(this.tabScrollview){
            this.tabScrollview.addEndCallBack(function(){
                var list_item = this.tabScrollview.getItemList();
                for(var i in list_item){
                    this.tab_list.push(list_item[i]);
                }
                this.redPointStatus();
            }.bind(this));
        }

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        StoneDungeonController.getInstance().openStoneDungeonView(false);
        if (this.tabScrollview){
            this.tabScrollview.DeleteMe()
            this.tabScrollview = null
        }
        
        if (this.itemScrollview){
            this.itemScrollview.DeleteMe()
            this.itemScrollview = null
        }

        for(var i in this.tab_list){
            if(this.tab_list[i].deleteMe){
                this.tab_list[i].deleteMe();
                this.tab_list[i] = null;
            }
        }
        this.tab_list = [];
        
    },
})
