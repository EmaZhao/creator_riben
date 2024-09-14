// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-27 16:42:36
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RankConstant = require("rank_constant");
var RankController = require("rank_controller");
var RoleController = require("role_controller");
var StartowerEvent = require("startower_event");
var CommonAlert = require("commonalert");
var StarTowerList = require("star_tower_list");


var Star_tower_windowWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tab_list = {};
        this.select_type = 1; //伙伴类型选择,默认全部为1
        this.view_list = {};
        this.is_change = false;
        this.top3_item_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.mainContainer = this.root_wnd.getChildByName("main_container");
        this.container = this.mainContainer.getChildByName("container");
        this.topBg = this.root_wnd.getChildByName("bg");
        this.topBg.scale = FIT_SCALE;
        // this.topBg.y = 315*FIT_SCALE;
        
        this.top_panel = this.root_wnd.getChildByName("top_panel");
        this.top_panel.top = this.topBg.top+this.topBg.height/2*FIT_SCALE;
        this.btnRule = this.top_panel.getChildByName("btnRule");
        var title_lab = this.top_panel.getChildByName("title").getComponent(cc.Label);
        title_lab.string = Utils.TI18N("试练塔");

        this.black_bg = this.mainContainer.getChildByName("black_bg");
        // this.black_bg.y = -509*FIT_SCALE;
        this.close_btn = this.black_bg.getChildByName("close_btn");
        //var label = this.close_btn.getChildByName("label").getComponent(cc.Label);
        //label.string = Utils.TI18N("返回");

        this.cost_panel =  this.black_bg.getChildByName("cost_panel");
        this.add_btn = this.cost_panel.getChildByName("add_btn");
        
        this.less_label =  Utils.createRichLabel(24,new cc.Color(0xff,0xff,0xff,0xff),cc.v2(0,1),cc.v2(0, 65),30,220);
        this.less_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.cost_panel.addChild(this.less_label.node);

        this.award_btn = this.mainContainer.getChildByName("award_btn");
        var label = this.award_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("奖励");

        this.rank_btn = this.mainContainer.getChildByName("rank_btn");
        var label = this.rank_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("排行");
        
        // 滚动东西
        this.scroll_height = 1100*FIT_SCALE;
        // this.topBg.y = this.scroll_height;
        // this.top_panel.y= this.scroll_height;
        this.updateTowerList();
        // 前三名排行榜
        this.rank_container = this.mainContainer.getChildByName("rank_container");
        var lab = this.rank_container.getChildByName("rank_desc_label").getComponent(cc.Label);
        lab.string = Utils.TI18N("排行前三");
        
        this.rank_top3_btn = this.rank_container.getChildByName("rank_btn");
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(2);
            this.ctrl.openMainView(false);
        }, this)

        this.award_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            this.ctrl.openAwardWindow(true);
        }, this)
        
        this.rank_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            RankController.getInstance().openRankView(true,RankConstant.RankType.tower)
        }, this)

        this.rank_top3_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            RankController.getInstance().openRankView(true,RankConstant.RankType.tower);
        }, this)

        this.btnRule.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var config = Config.star_tower_data.data_tower_const.rule_desc;
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos);
        }, this)

        this.add_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(1);
            var fun = function() {
                var StarTowerController = require("startower_controller");
                StarTowerController.getInstance().sender11321();
            };
            
            var have_buycount = this.model.getBuyCount() || 0;
            var role_vo = RoleController.getInstance().getRoleVo();
            var config = Config.star_tower_data.data_tower_vip[role_vo.vip_lev];
            if(config && config.buy_count){
                if(have_buycount >= config.buy_count){
                    message(Utils.TI18N("本日购买次数已达上限"));
                }else{
                    var buy_config = Config.star_tower_data.data_tower_buy[have_buycount+1];
                    if(buy_config && buy_config.expend && buy_config.expend[0] && buy_config.expend[0][0]){
                        var item_id = buy_config.expend[0][0];
                        var num = buy_config.expend[0][1] || 0;
                        var item_config = Utils.getItemConfig(item_id);
                        if(item_config && item_config.icon){
                            var res = PathTool.getItemRes(item_config.icon);
                            var str = cc.js.formatStr( Utils.TI18N("是否花费<img src='%s'/> %s购买一次挑战次数？"),item_config.icon, num)
                            CommonAlert.show(str,Utils.TI18N("确定"),fun,Utils.TI18N("取消"),null,null,null,{resArr:[res]})
                        }
                    }
                }
            }
        }, this)

        this.addGlobalEvent(StartowerEvent.Update_All_Data, function() {
            // -- this:updateTowerList()
            this.updateCount();
            this.updataRewardRedPoint();
        }.bind(this))

        this.addGlobalEvent(StartowerEvent.Update_Top3_rank, function(list) {
            this.updateTop3Info(list);
        }.bind(this))

        this.addGlobalEvent(StartowerEvent.Update_First_Reward_Msg, function() {
            this.updataRewardRedPoint();
        }.bind(this))

        this.addGlobalEvent(StartowerEvent.Fight_Success_Event, function() {
            if(!this.select_vo)return;
            this.list_view.resetCurrentItems();
            this.list_view.moveToArrowNewPosition();
        }.bind(this))

        this.addGlobalEvent(StartowerEvent.Count_Change_Event, function() {
            this.updateCount();
            var index = this.model.getNowTowerId() || 0;
            var list = this.list_view.getActiveCellList();
            for(var i in list){
                if(list[i].index == index){
                    if(list[i].getData()){
                        list[i].sweepCount(list[i].getData())
                    }
                    break;
                }
            }
        }.bind(this))
    },

    //奖励红点
    updataRewardRedPoint:function(){
        var data = this.model.getRewardData();
        var status = false;
        for(var i in data){
            if(data[i].status == 1){
                status = true;
                break;
            }
        }
        Utils.addRedPointToNodeByStatus(this.award_btn, status)
        var SceneConst = require("scene_const");
        var MainSceneController = require("mainscene_controller");
        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.startower, {bid: 1, status: status});
        require("esecsice_controller").getInstance().getModel().setEsecsiceMainRedPointData(require("esecsice_const").execsice_func.starTower, status);
    },

    updateCount:function(){
        var count = this.model.getTowerLessCount() || 0;
        var all_count = Config.star_tower_data.data_tower_const["free_times"].val || 0;
        var str = cc.js.formatStr(Utils.TI18N("剩余挑战次数：%s/%s"),count,all_count)
        this.less_label.string = str;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        //请求塔数据
        this.ctrl.sender11320() ;
        // 请求排行榜数据,前3
        this.ctrl.requestStarTowerRank();
    
        if(this.list_view){
            var lev_id = this.model.getNowTowerId();
            this.list_view.reloadData(lev_id);
        }
    },

    updateTowerList:function(){
        //最大数量
        this.max_count = Config.star_tower_data.data_tower_base_length;
        if(!this.list_view){
            var scroll_view_size = cc.size(SCREEN_WIDTH*FIT_SCALE,this.scroll_height);
            var bottom_height = 90;//MainuiController:getInstance():getMainUi():getTopViewHeight()
            this.list_view = new StarTowerList();
            this.list_view.createScroll(this.container, cc.v2(0, this.black_bg.y - bottom_height), scroll_view_size);//SCREEN_WIDTH/2
            
            this.list_view.registerScriptHandlerSingle(this.createNewCell.bind(this), ScrollViewFuncType.CreateNewCell) //创建cell
            this.list_view.registerScriptHandlerSingle(this.numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells) //获取数量
            this.list_view.registerScriptHandlerSingle(this.updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex) //更新cell
            this.list_view.registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched) //更新cell
            
        }
        // -- local lev_id = this.ctrl:getModel():getNowTowerId()
        // -- this.list_view:reloadData(lev_id)
    },

    //创建cell 
    createNewCell:function(){
        var cell = Utils.createClass("star_tower_item_panel",this);//StarTowerItem.new(1, true)    
        cell.show();
        cell.addCallBack((function(){
            this.onCellTouched(cell);
        }).bind(this));
        return cell;
    },


    //获取数据数量
    numberOfCells:function(){
        return this.max_count || 0;
    },
    
    //更新cell(拖动的时候.刷新数据时候会执行次方法)
    //cell :createNewCell的返回的对象
    //inde :数据的索引
    updateCellByIndex:function(cell, index){
        cell.index = index;
        cell.setData(index);    
    },

    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched:function(cell){
        var index = cell.index;
        var cur_lev = this.model.getNowTowerId() + 1;
        if(index > cur_lev){
            message(Utils.TI18N("当前关卡未开启"));
            return;
        }
        
        var config = Config.star_tower_data.data_tower_base[index];
        if(config){
            this.select_vo = config;
            this.select_item = cell;
            this.data = config;
            this.clickFun(config);
        }
    },

    clickFun:function(vo){
        if(!vo)return;
        this.ctrl.openStarTowerMainView(true,vo);
    },

    updateTop3Info:function(rank_list){
        if(rank_list == null || Utils.next(rank_list) == null)return;
        

        for(var i in rank_list){
            if(!this.top3_item_list[rank_list[i].rank]){
                var item = this.createSingleRankItem(rank_list[i].rank);
                this.rank_container.addChild(item);
                this.top3_item_list[rank_list[i].rank] = item;
            }
            var item = this.top3_item_list[rank_list[i].rank];
            if(item){
                item.setPosition(0,120 - (rank_list[i].rank-1) * item.getContentSize().height);
                item.label.string = rank_list[i].name;
                item.value.string = (rank_list[i].tower || 0)+Utils.TI18N("层");
            }
        }
    },

    createSingleRankItem:function(i){
        var container = new cc.Node();
        container.setAnchorPoint(0,0);
        container.setContentSize(180,40);
        
        var sp = Utils.createImage(container,null,30,40/2,cc.v2(0.5, 0.5));
        var res = PathTool.getCommonIcomPath("common_300"+i);
        this.loadRes(res, function (sf_obj) {
            sp.spriteFrame = sf_obj;
        }.bind(this))
        sp.node.scale = 0.5;
        
        var label = Utils.createLabel(20,new cc.Color(0x89,0xed,0xff,0xff),null,60,40/2,"",container,0,cc.v2(0,0.5));
        
        var value = Utils.createLabel(20,new cc.Color(0x89,0xed,0xff,0xff),null,188,40/2,"",container,0,cc.v2(0,0.5));
        
        container.label = label
        container.value = value
        return  container
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openMainView(false);
        if(this.list_view){
            this.list_view.deleteMe();
            this.list_view = null;
        }
        this.select_item = null;
        if(this.lock_icon){
            this.lock_icon.onDelete();
            this.lock_icon = null;
        }
    },
})