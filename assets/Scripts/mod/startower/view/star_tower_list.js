// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      自动意义的scrollview 试练塔的
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")
var CommonScrollViewSingleLayout = require("common_scrollview_single");
var StartowerController = require("startower_controller");
var RoleController = require("role_controller");
var PlayerHead = require("playerhead");

var StarTowerList = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.initConfig()
    },

    initConfig: function () {
        this.parent = null;
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_scroll_view");
        this.pos = cc.v2(0, 0);
        this.dir = ScrollViewDir.vertical;
        this.start_pos = ScrollViewStartPos.bottom;
        this.size = cc.size(100, 100);
        this.ap = cc.v2(0.5, 0);

        this.cellList = [];                      // 存放所有格子结构体
        this.cacheList = [];                      // 缓存Cell所用到的对象
        this.activeCellIdx = []                    //记录活跃得格子ID

        this.selectCellIndex = 1;                  //当前选择物品的索引

        this.handler = {};                          //函数句柄

        this.start_x        = 325             // 第一个单元的起点X
        this.space_x        = 0             // 横向间隔空间
        this.start_y        = 185             // 第一个单元的起点Y
        this.space_y        = 0             // 竖向间隔空间
        this.item_width     = 300        // 单元的宽度
        this.item_height    = 120       // 单元的高度

        this.col            = 1               // 列数,作用于垂直方向的滚动
        //背景相对塔移动的系数
        this.bg_param = 3;

    },

    /**
     * 创建
     * @param {*} parent 所在父节点
     * @param {*} pos 滑动组件位置
     * @param {*} dir 滑动对齐方式
     * @param {*} start_pos 滑动列表开始位置
     * @param {*} size 滑动框大小
     * @param {*} ap 锚点
     */
    createScroll: function (parent, pos, size) {
        this.parent = parent;
        this.pos = pos || cc.v2(0, 0);
        this.size = size || cc.size(100, 100);
        //计算一个屏幕最大数量
        this.cacheMaxSize = (Math.ceil(this.size.height / (this.item_height + this.space_y)) + 1) * this.col;
        

        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
            var scroll = res_object;
            this.createRootWnd(scroll);
        }).bind(this))
    },

    // 初始化创建对象
    createRootWnd: function (scroll) {
        this.root_wnd = scroll;
        this.scroll_view = scroll.getChildByName("ScrollView");
        this.scroll_view_mask = this.scroll_view.getChildByName("view");
        this.scroll_view_con = this.scroll_view_mask.getChildByName("content");
        this.scroll_view.zIndex = 2;
        this.root_wnd.setContentSize(this.size);
        this.root_wnd.setAnchorPoint(this.ap.x, this.ap.y);
        this.root_wnd.setPosition(this.pos);

        this.scroll_view.setContentSize(this.size);
        this.scroll_view_mask.setContentSize(this.size);
        this.scroll_view_con.setContentSize(this.size);

        this.arrow_btn = this.scroll_view_con.getChildByName("arrow_btn");
        this.arrow_btn.active = true;
        this.arrow_btn.zIndex = 10;
        
        var role_vo = RoleController.getInstance().getRoleVo();
        this.head = new PlayerHead();
        this.head.show();
        this.head.setScale(0.6);
        this.head.setPosition(47, 0)
        this.head.setParent(this.arrow_btn);
        this.head.setHeadRes(role_vo.face_id)

        // 滚动组建
        this.scroll_view_compend = this.scroll_view.getComponent(cc.ScrollView)
        
        if (this.dir == ScrollViewDir.vertical) {
            this.scroll_view_compend.vertical = true
        } else {
            this.scroll_view_compend.horizontal = true
        }

        this.container = this.scroll_view_con;

        if (this.parent) {
            this.parent.addChild(scroll);
        }
        // 监听事件
        this.setInnerContainer()
        this.updateBgList();
        this.registerEvent();

        if (this.select_index != null) {
            this.reloadData(this.select_index);
        }
            
    },

    registerEvent: function () {
        this.scroll_view_compend.node.on('scrolling', this.checkRectIntersectsRect, this);

        this.arrow_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.moveToArrowNewPosition()
        }, this)
    },

    // 注册事件
    //  注册回调方法
    registerScriptHandlerSingle:function(func, handlerId){
        this.handler[handlerId] = func;
    },

    // 获取cell数量
    numberOfCells:function(){
        if(!this.handler[ScrollViewFuncType.NumberOfCells])return;
        return this.handler[ScrollViewFuncType.NumberOfCells]();
    },

    //刷新每一个cell 
    updateCellByIndex:function(cell, index){
        if(!this.handler[ScrollViewFuncType.UpdateCellByIndex])return;
        this.handler[ScrollViewFuncType.UpdateCellByIndex](cell, index);
    },

    // 创建一个新cell
    createNewCell:function(){
        if(!this.handler[ScrollViewFuncType.CreateNewCell])return;
        return this.handler[ScrollViewFuncType.CreateNewCell](this.item_width, this.item_height);
    },


    // 点击cell --在createNewCell 自行实现
    onCellTouched:function(cell, index){
        if(!this.handler[ScrollViewFuncType.OnCellTouched])return;
        this.handler[ScrollViewFuncType.OnCellTouched](cell, index);
    },


    // 设置 scrollview 是否可点
    setClickEnabled:function(status){
        this.scroll_view.setClickEnabled(status);
    },

    // 设置 是否吞噬点击
    setSwallowTouches:function(status){
        this.scroll_view.setSwallowTouches(status);
    },

    //移动的过程中盘点是否不再可视范围,不再的时候移除掉,放到对象池,并且准备下一次创建
    checkRectIntersectsRect: function (event) {
        if(this.dir == ScrollViewDir.vertical){
            this.checkOverShowByVertical();    
        }
    },

    //竖直方向的监测判断
    checkOverShowByVertical: function () {
        if(this.cellList == null)return;

        var container_y = this.container.y;
        if(this.scroll_view_bg){
            var container = this.scroll_view_bg.getContainer();
            if(container){
                container.y = container_y/this.bg_param;
                this.scroll_view_bg.checkOverShowByVerticalBottom();
            }
        }
        // 计算 视图的上部分和下部分在this.container 的位置
        var bot = -container_y;
        var top = this.size.height + bot;
        var col_count = Math.ceil(this.cellList.length/this.col);
        // 下面因为 this.cellList 是一维数组 所以要换成二维来算
        // 活跃cell开始行数
        var activeCellStartRow = col_count;
        for(var i = col_count-1;i>=0;i--){
            var index = i* this.col;
            var cell = this.cellList[index];
            activeCellStartRow = i;
            if(cell && cell.y <= top){
                break;
            }
        }
        // 活跃cell结束行数
        var activeCellEndRow = 1;
        if(bot > 0){
            for(var j = activeCellStartRow;j>=0;j--){
                var index = j* this.col;
                var cell = this.cellList[index];
                if(cell && cell.y + this.item_height < bot){
                    activeCellEndRow = j + 1
                    break
                }
            }
        }
        
        var max_count = this.numberOfCells();
        for(var i = 0;i< col_count;i++){
            if(i <= activeCellStartRow && i >= activeCellEndRow){
                for(var j = 0;j< this.col;j++){
                    var index = i * this.col + j;
                    if(!this.activeCellIdx[index]){
                        if(index <= max_count){
                            this.updateCellAtIndex(index);
                            this.activeCellIdx[index] = true;
                        }
                    }
                }
            }else{
                for(var j = 0;j< this.col;j++){
                    var index = i * this.col + j;
                    if(index <= max_count){
                        this.activeCellIdx[index] = false;
                    }
                }

            }
        }

        this.updateArrowPos(top, bot);
    },

    //滚动容器移动到指定位置
    updateMove: function (pos) {
        var target_pos = this.checkPosition(pos.x, pos.y);
        var move_to = cc.moveTo(0.1, target_pos.x, target_pos.y).easing(cc.easeBackOut());
        this.container.runAction(move_to);
    },

    //跳转指定位置
    jumpToMove: function (pos, time, callback) {
        var target_pos = this.checkPosition(pos.x, pos.y);
        time = time || 1;
        var move_to = cc.moveTo.create(time, cc.v2(target_pos.x, target_pos.y));
        this.container.runAction(cc.sequence.create(move_to, cc.callFunc.create(function () {
            if (callback) {
                callback();
            }
        })))
    },

    //监测目标点位置
    checkPosition: function (x, y) {
        var _x = this.container.x;
        var _y = this.container.y;
        if (this.dir == ScrollViewDir.horizontal) {
            _x = _x + x;
        } else if (this.dir == ScrollViewDir.vertical) {
            _y = _y + y;
        }
        if (_x > 0) {
            _x = 0;
        } else if (_x < this.size.width - this.container_size.width) {
            _x = this.size.width - this.container_size.width;
        }
        if (_y > 0) {
            _y = 0;
        } else if (_y < this.size.height - this.container_size.height) {
            _y = this.size.height - this.container_size.height;
        }
        return cc.v2(_x, _y)
    },

    //设置滚动容器的大小
    setInnerContainer: function () {
        if(!this.root_wnd)return;

        var number = this.numberOfCells();
        var container_width = this.size.width;
        var num = Math.ceil(number / this.col);
        var container_height = num * this.item_height + 2 * this.start_y + (num - 1) * this.space_y

        // 加上塔顶 
        container_height  = container_height + 453; // 根据塔顶图片高度决定的    
        // 塔底座 在这里 this.start_y 算了

        container_height = Math.max(container_height, this.size.height);
        this.container_size = cc.size(container_width, container_height);
        if (this.scroll_view_con) {
            this.scroll_view_con.setContentSize(this.container_size)
        }

        if(this.start_pos == ScrollViewStartPos.bottom){
            this.scroll_view_compend.scrollToBottom(0);
        }
    },


    // 刷新当前显示的item数据 (不改变任何位置的)
    resetCurrentItems:function(){
        for(var i in this.activeCellIdx){
            if(this.activeCellIdx[i]){
                this.updateCellAtIndex(i);    
            }
        }
    },

    // 根据index 刷新对应索引..如果在显示视图内
    resetItemByIndex:function(index){
        // body
        if(this.activeCellIdx[index]){
            this.updateCellAtIndex(index);
        }
    },

    // 获取活跃中的cell对象
    getActiveCellList:function(){
        var list = [];
        for(var i in this.activeCellIdx){
            if(this.activeCellIdx[i] && this.cellList[i] && this.cellList[i].cell){
                list.push(this.cellList[i].cell);
            }
        }
        return list;
    },

    // 获取index索引对应cell(不管是否活跃)
    getCellByIndex:function(index){
        if(this.cellList[index] && this.cellList[index].cell){
            return this.cellList[i].cell;
        }
    },
        
    // 获取index索引对应cellXY位置(不管是否活跃)
    getCellXYByIndex:function(index){
        // if(this.cellList[index] && this.cellList[index].cell){
        //     return this.cellList[i].x, this.cellList[i].y 
        // }
    },
      
    // desc:设置数据
    // select_idnex 从第几个开始
    reloadData:function(select_index){
        if (this.root_wnd == null) {
            this.select_index = select_index;
            return
        }

        this.cellList = [];
        this.activeCellIdx = [];
        for(var i in this.cacheList){
            // 相当于隐藏
            this.cacheList[i].setPosition(-10000,0);
        }
        // 设置容器大小
        // -- this:setInnerContainer()

        var number = this.numberOfCells();
        if(number == 0)return;

        // 先初始化中间背景
        // -- this:updateBgList()

        for(var i = 0;i<number;i++){
            var cell = this.getCacheCellByIndex(i);
            var count = this.cellList.length;
            var xy = this.getCellPosition(count);
            var cellData = {cell: cell, x:xy.x, y: xy.y}
            this.cellList.push(cellData);
        }
        if(select_index == null){
            var maxRefreshNum = this.cacheMaxSize - this.col;
            var refreshNum = number < maxRefreshNum && number || maxRefreshNum;
            for(var j = 0;j<refreshNum;j++){
                this.updateCellAtIndex(j);
                this.activeCellIdx[j] = true;
            }
        }else{
            this.selectCellByIndex(select_index);
        }
        

        
        // 延迟加个塔底

        gcore.Timer.set(function () {
            if(this.bottom_bg == null){
                this.bottom_bg = Utils.createImage(this.container, null, this.start_x + this.item_width * 0.5, 165, null, false, 3, false);
                LoaderManager.getInstance().loadRes(PathTool.getBigBg("bigbg_28"), (function(resObject){
                    this.bottom_bg.spriteFrame = resObject;
                }).bind(this));
            }
        }.bind(this), 1 / cc.game.getFrameRate(), 1);
        
        // 加个塔顶
        gcore.Timer.set(function () {
            if(this.top_bg == null){
                var y = this.cellList[number-1].y + this.item_height;
                this.top_bg = Utils.createImage(this.container, null, this.start_x + this.item_width * 0.5, y+235, null, false, 3, false);
                LoaderManager.getInstance().loadRes(PathTool.getBigBg("bigbg_29"), (function(resObject){
                    this.top_bg.spriteFrame = resObject;
                    this.moveToArrowNewPosition();
                }).bind(this));
            }
        }.bind(this), 2 / cc.game.getFrameRate(), 1);
        this.moveToArrowNewPosition();
        gcore.Timer.set(function () {
            //显示人物箭头
            this.moveToArrowNewPosition();
        }.bind(this), 3 / cc.game.getFrameRate(), 1);

        
    },

    jumpToMoveByY:function(y){
        if(!y)return;
        var pos =y-this.size.height*0.5;
        if(pos < 0){
            pos = 0;    
        }
        var pos_per = pos / (this.container_size.height - this.size.height);
        if(pos_per > 1){
            pos_per = 1;    
        }
        if(pos_per == 1){
            this.checkOverShowByVertical();
        }
        this.scroll_view_compend.scrollToPercentVertical(pos_per, 0.5, true);
    },

    // -----------------------中间背景的代码开始-----------------------------------------------------------
    updateBgList:function(){
        if(this.scroll_view_bg == null){
            var height = this.container_size.height/this.bg_param;
            var scroll_view_size = this.size;
            // var scale = display.getMaxScale();
            var bg_height = 944; //循环图的高度  * scale

            this.bg_max_count = Math.ceil(height/bg_height) + 1;
            var list_setting = {
                start_x: 0,
                space_x: 0,
                start_y: 336,
                space_y: 0,
                item_width: 720*FIT_SCALE,
                item_height: bg_height,
                row: 0,
                col: 1,
            }

            this.scroll_view_bg = new CommonScrollViewSingleLayout();
            this.scroll_view_bg.createScroll(this.root_wnd, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.bottom, scroll_view_size, list_setting,cc.v2(0.5,0));
            this.scroll_view_bg.time_show_index = this.bg_max_count + 1;
            this.scroll_view_bg.registerScriptHandlerSingle(this.createNewCellBg.bind(this), ScrollViewFuncType.CreateNewCell) //创建cell
            this.scroll_view_bg.registerScriptHandlerSingle(this.numberOfCellsBg.bind(this), ScrollViewFuncType.NumberOfCells) //获取数量
            // -- this.scroll_view_bg:registerScriptHandlerSingle(this.updateCellByIndexBg.bind(this), ScrollViewFuncType.UpdateCellByIndex) --更新cell
            // -- this.scroll_view:registerScriptHandlerSingle(this.onCellTouched.bind(this), ScrollViewFuncType.OnCellTouched) --更新cell
            this.scroll_view_bg.setClickEnabled(false);
            // -- var bottom_bg_height = 322 --底部一张固定图的高度
            }

            
        
        this.scroll_view_bg.reloadData();
    },

    // 创建cell 
    createNewCellBg:function(){
        
        if(this.scroll_view_bg && this.scroll_view_bottom_bg == null){
            gcore.Timer.set(function () {
                if(this.scroll_view_bottom_bg == null){
                    var container = this.scroll_view_bg.getContainer();
                    this.scroll_view_bottom_bg = Utils.createImage(container, null, this.container_size.width/2, 0, cc.v2(0.5,0), false, 1, false);
                    this.scroll_view_bottom_bg.node.scaleX = FIT_SCALE;
                    this.scroll_view_bottom_bg.node.scaleY = 1;
                    LoaderManager.getInstance().loadRes(PathTool.getBigBg("bigbg_27"), (function(resObject){
                        this.scroll_view_bottom_bg.spriteFrame = resObject;
                    }).bind(this));
                }
            }.bind(this), 3 / cc.game.getFrameRate(), 1);
        }
        

        var cell = Utils.createImage(null, null, null,null, cc.v2(0.5, 0.5), false,0, false);
        cell.node.scaleY = 1;
        cell.node.scaleX = 1*FIT_SCALE;
        
        LoaderManager.getInstance().loadRes(PathTool.getBigBg("bigbg_36"), (function(resObject){
            cell.spriteFrame = resObject;
        }).bind(this));

        // cell.setScale(display.getMaxScale())
    return cell.node;
    },
    
    // 获取数据数量
    numberOfCellsBg:function(){
        return this.bg_max_count || 0;
    },
// -----------------------中间背景的代码结束-----------------------------------------------------------
    // 移动人物箭头到最新位置
    moveToArrowNewPosition:function(){
        var index = StartowerController.getInstance().getModel().getNowTowerId() || 0;
        var cellData = this.cellList[index]
        if(!cellData)return;
        this.jumpToMoveByY(cellData.y)
        this.setNowArrowPos()
    },
        

    setNowArrowPos:function(){
        if(!this.arrow_btn)return;
        var index = StartowerController.getInstance().getModel().getNowTowerId() || 0;
        index = index +1;
        var number = this.numberOfCells();
        if(index > number){
            index = number;
        }
        var cellData = this.cellList[index];
        if(!cellData)return;
        var x = cellData.x + this.item_width - 5
        var y = cellData.y + this.item_height * 0.5
        
        this.arrow_height = y;
        this.arrow_btn.setPosition(x, y);
    },

    // 箭头逻辑
    // @top 当前this.container对应屏幕 的顶部 y位置
    // @bot 当前this.container对应屏幕 的底部 y位置
    updateArrowPos:function(top, bot){
        if(!this.arrow_height)return;
        
        var top_param = 140;
        var bot_param = 245;
        if(top - top_param <= this.arrow_height){
            this.arrow_btn.y = top - top_param;
        }else if(bot + bot_param >= this.arrow_height){
            this.arrow_btn.y = bot + bot_param;
        }else{
            this.arrow_btn.y = this.arrow_height;
        }
    },

    // 选中index索引对象(如果列表允许 会排序在开始第一位)
    selectCellByIndex:function(index){
        // 一屏幕显示的最大数量
        var maxRefreshNum = this.cacheMaxSize - this.col
        var number = this.numberOfCells();
        if(number < maxRefreshNum){
            // 不够显示一屏幕
            for(var i = 0;i<number;i++){
                this.updateCellAtIndex(i);
                this.activeCellIdx[i] = true;
            }
        }else{
            var container_y;
            if(index <= 1){
                container_y = 0;
            }else{
                container_y = this.cellList[index].y + this.item_height - this.size.height * 0.5;
            }
            if(container_y < 0){
                container_y = 0;
            }
            this.container.y = - container_y;
            this.checkOverShowByVertical();
        }
        // -- if index > 0 and index <= this:numberOfCells() then
        // --     var cell = this:getCacheCellByIndex(index)
        // --     cell.index = index
        // --     this.cellList[index].cell = cell
        // --     this:onCellTouched(cell, index)
        // -- end 
    },

    // 获取index 对应的位置 由于一开始不创建item  
    // @return 是[index]对象所在的中点
    getCellPosition:function(index){
        var anchor_point = cc.v2(0,0)
        var _x = this.start_x + this.item_width * anchor_point.x +(this.item_width + this.space_x) *((index-1) % this.col)
        var _y = this.start_y + this.item_height * anchor_point.y +(Math.floor((index-1) / this.col)) *(this.item_height + this.space_y)
        return {x:_x, y:_y};
    },

    // 获得格子下标对应的缓存itemCell
    getCacheCellByIndex:function(index){
        var cacheIndex = (index % this.cacheMaxSize)
        if(!this.cacheList[cacheIndex]){
            var newCell = this.createNewCell();
            if(newCell){
                newCell.setAnchorPoint(0,0);
                newCell.setPosition(-10000,0);//隐藏
                this.cacheList[cacheIndex] = newCell
                newCell.setParent(this.container)
            }
            return newCell;
        }else{
            return this.cacheList[cacheIndex];
        }
    },

    // 更新格子，并记为活跃
    updateCellAtIndex:function(index){
        if(!this.cellList[index])return;
        var cellData = this.cellList[index];
        cellData.cell.setPosition(cellData.x, cellData.y);
        this.updateCellByIndex(cellData.cell, index);
    },

    getMaxSize:function(){
        return this.container_size;
    },

    getContainer:function(){
        return this.container;
    },

    deleteMe:function(){
        this.DeleteMe();
    },

    //移除对象
    DeleteMe: function () {
        // doStopAllActions(this)
        // doStopAllActions(this.container)

        if(this.head){
            this.head.deleteMe();
            this.head = null;
        }

        for(var i in this.cacheList){
            if(this.cacheList[i].onDelete){
                this.cacheList[i].onDelete();
            }
        }

        if(this.scroll_view_bg){
            this.scroll_view_bg.deleteMe();
            this.scroll_view_bg = null;
        }
        
            
        this.cellList = null;
        this.activeCellIdx = null;
        this.cacheList = null;

        // this:removeAllChildren()
        // this:removeFromParent()
    },
});