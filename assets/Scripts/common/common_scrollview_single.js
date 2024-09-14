// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      新版本无限循环列表容器, cellitem 需要继承basepanel
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var CommonScrollViewSingle = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.initConfig()
    },

    initConfig: function () {
        this.parent = null;
        this.prefabPath = PathTool.getPrefabPath("common", "common_scroll_view");
        this.pos = cc.v2(0, 0);
        this.dir = ScrollViewDir.vertical;
        this.start_pos = ScrollViewStartPos.top;
        this.size = cc.size(100, 100);
        this.ap = cc.v2(0, 0);

        //存放所有格子结构体
        this.cellList = [];
        //缓存Cell所用到的对象
        this.cacheList = {};
        //记录活跃得格子ID
        this.activeCellIdx = {};
        //当前选择物品的索引
        this.selectCellIndex = 1;
        //回调方法
        this.handler = {};
        //到时间显示的索引
        this.time_show_index = 0;
        //是否初始化
        this.is_first_init = true;
        //最大条目
        this.cacheMaxSize = 1;
    },

    /**
     * 创建
     * @param {*} parent 所在父节点
     * @param {*} pos 滑动组件位置
     * @param {*} dir 滑动对齐方式
     * @param {*} start_pos 滑动列表开始位置
     * @param {*} size 滑动框大小
     * @param {*} setting 设置信息
     * @param {*} ap 锚点
     */
    createScroll: function (parent, pos, dir, start_pos, size, setting, ap) {
        this.parent = parent;
        this.pos = pos || cc.v2(0, 0);
        this.dir = dir || ScrollViewDir.vertical;
        this.start_pos = start_pos || ScrollViewStartPos.top;
        this.size = size || cc.size(100, 100);
        this.ap = ap || cc.v2(0, 0);

        this.analysisSetting(setting);

        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
            var scroll = res_object;
            this.createRootWnd(scroll);
        }).bind(this))
    },

    //解析数据
    analysisSetting: function (setting) {
        this.setting = setting || {};
        this.start_x = this.setting.start_x || 0                        //第一个单元的起点X
        this.space_x = this.setting.space_x || 0                        // 横向间隔空间
        this.start_y = this.setting.start_y || 0                        // 第一个单元的起点Y
        this.space_y = this.setting.space_y || 0                        // 竖向间隔空间
        this.item_width = this.setting.item_width || 115                // 单元的宽度
        this.item_height = this.setting.item_height || 115              // 单元的高度
        this.row = this.setting.row || 5                                // 行数,作用于水平方向的滚动
        this.col = this.setting.col || 5                                // 列数,作用于垂直方向的滚动
        this.delay = this.setting.delay || 4                            // 创建延迟时间
        this.once_num = this.setting.once_num || 1                      // 每次创建的数量
        this.need_dynamic = this.setting.need_dynamic || true          // 是否需要动态创建的 
        //横向的只支持一行的..
        if (this.dir == ScrollViewDir.horizontal) {
            this.row = 1
        }
        this.calculationMaxSum();
    },

    //计算一下一屏最多创建的个数
    calculationMaxSum: function () {
        var max_sum;
        if (this.dir == ScrollViewDir.horizontal) {
            max_sum = (Math.ceil(this.size.width / (this.item_width + this.space_x)) + 1) * this.row;
        } else {
            max_sum = (Math.ceil(this.size.height / (this.item_height + this.space_y)) + 1) * this.col;
        }
        this.cacheMaxSize = max_sum;
    },

    // 初始化创建对象
    createRootWnd: function (scroll) {
        this.root_wnd = scroll;
        this.scroll_view = scroll.getChildByName("ScrollView");
        this.scroll_view_mask = this.scroll_view.getChildByName("view");
        this.scroll_view_con = this.scroll_view_mask.getChildByName("content");

        this.root_wnd.setContentSize(this.size);
        this.root_wnd.setAnchorPoint(this.ap.x, this.ap.y);
        this.root_wnd.setPosition(this.pos);

        this.scroll_view.setContentSize(this.size);
        this.scroll_view_mask.setContentSize(this.size);
        this.scroll_view_con.setContentSize(this.size);

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
        this.registerEvent();

        // if (this.select_index != null) {
            this.reloadData(this.select_index, this.setting)
        // }
    },

    // 滚动设置
    registerEvent: function () {
        if (this.need_dynamic == true) {
            this.scroll_view_compend.node.on('scrolling', this.checkRectIntersectsRect, this);

            // this.scroll_view_compend.node.on('bounce-bottom', this.scrollToBottom_callback, this);
        }
    },

    // 滚动到底部的时候回调
    addScrollToBottomCallBack: function (callback) {
        this.scrollToBottom_callback = callback;
    },

    // 注册事件
    registerScriptHandlerSingle: function (func, handlerId) {
        this.handler[handlerId] = func;
    },

    //获取cell数量
    numberOfCells: function () {
        if (this.handler[ScrollViewFuncType.NumberOfCells]) {
            return this.handler[ScrollViewFuncType.NumberOfCells]();
        }
    },

    // 刷新每一个cell
    updateCellByIndex: function (cell, index) {
        if (this.handler[ScrollViewFuncType.UpdateCellByIndex]) {
            this.handler[ScrollViewFuncType.UpdateCellByIndex](cell, index);
        }
    },

    // 创建一个显示对象
    createNewCell: function () {
        if (this.handler[ScrollViewFuncType.CreateNewCell]) {
            return this.handler[ScrollViewFuncType.CreateNewCell](this.item_width, this.item_height);
        }
    },

    // 点击单个
    onCellTouched: function (cell, index) {
        if (this.handler[ScrollViewFuncType.OnCellTouched]) {
            this.handler[ScrollViewFuncType.OnCellTouched](cell, index);
        }
    },

    // 设置是否可点击
    setClickEnabled: function (status) {

    },

    // 设置是否吞噬点击
    setSwallowTouches: function (status) {

    },

    // 移动过程中是否不再可是范围,不再的时候移除,放到对象池,准备下一次创建
    checkRectIntersectsRect: function () {
        if (this.dir == ScrollViewDir.vertical) {
            this.checkOverShowByVertical()
        } else {
            this.checkOverShowByHorizontal()
        }
    },

    // 竖直方向的监测判断
    checkOverShowByVertical: function () {
        if (this.cellList == null) return;
        var sum = this.cellList.length;

        if (sum == 0) return;
        var container_y = this.container.y;
        var bot = -container_y;
        var top = this.size.height + bot;
        var col_count = Math.ceil(sum / this.col);
        // 活跃cell开始行数
        var activeCellStartRow = 0;
        for (let i = 0; i < col_count; i++) {
            var index = i * this.col;
            var cell = this.cellList[index];
            activeCellStartRow = i;
            if (cell && (cell.y - this.item_height * 0.5 <= top)) {
                break;
            }
        }
        // 活跃cell结束行数
        var activeCellEndRow = col_count;
        if (bot > 0) {
            for (let i = activeCellStartRow; i < col_count; i++) {
                var index = i * this.col;
                var cell = this.cellList[index];
                if (cell && (cell.y + this.item_height * 0.5 < bot)) {
                    activeCellEndRow = i-1;
                    break;
                }
            }
        }
        // 重复使用
        var max_count = this.numberOfCells();
        for (let i = 0; i < col_count; i++) {
            if (i >= activeCellStartRow && i <= activeCellEndRow) {
                for (let m = 0; m < this.col; m++) {
                    var index = i * this.col + m;
                    if (!(this.activeCellIdx[index])) {
                        if (index <= max_count) {
                            this.updateCellAtIndex(index);
                            this.activeCellIdx[index] = true;
                        }
                    }
                }
            } else {
                for (let m = 0; m < this.col; m++) {
                    var index = i * this.col + m;
                    if (index <= max_count) {
                        this.activeCellIdx[index] = false
                    }
                }
            }
        }
    },

    // 竖直方向的监测判断
    checkOverShowByVerticalBottom: function () {
        if (this.cellList == null) return;
        var sum = this.cellList.length;

        if (sum == 0) return;
        var container_y = this.container.y;
        var bot = -container_y;
        var top = this.size.height + bot;
        var col_count = Math.ceil(sum / this.col);
        // 活跃cell开始行数
        var activeCellStartRow = col_count;
        for (let i = col_count-1; i >= 0; i--) {
            var index = i * this.col;
            var cell = this.cellList[index];
            activeCellStartRow = i;
            if (cell && (cell.y - this.item_height * 0.5 <= top)) {
                break;
            }
        }
        // 活跃cell结束行数
        var activeCellEndRow = 0;
        if (bot > 0) {
            for (let i = activeCellStartRow-1; i >= 0; i--) {
                var index = i * this.col;
                var cell = this.cellList[index];
                if (cell && (cell.y + this.item_height * 0.5 < bot)) {
                    activeCellEndRow = i+1;
                    break;
                }
            }
        }
        // 重复使用
        var max_count = this.numberOfCells();
        for (let i = 0; i < col_count; i++) {
            if (i <= activeCellStartRow && i >= activeCellEndRow) {
                for (let m = 0; m < this.col; m++) {
                    var index = i * this.col + m;
                    if (!(this.activeCellIdx[index])) {
                        if (index <= max_count) {
                            this.updateCellAtIndex(index);
                            this.activeCellIdx[index] = true;
                        }
                    }
                }
            } else {
                for (let m = 0; m < this.col; m++) {
                    var index = i * this.col + m;
                    if (index <= max_count) {
                        this.activeCellIdx[index] = false
                    }
                }
            }
        }
    },

  

    // 水平方向的监测
    checkOverShowByHorizontal: function () {
        if (this.cellList == null) return;
        var row_count = this.cellList.length;
        if (row_count == 0) return;
        var container_x = this.container.x;
        var top = -container_x;
        var bot = top + this.size.width;
        // 活跃cell开始列数
        var activeCellStartRow = 0;
        if (top > 0) {
            for (let i = 0; i < row_count; i++) {
                var cell = this.cellList[i];
                activeCellStartRow = i;
                if (cell && (cell.x + this.item_width * 0.5) >= top) {
                    break;
                }
            }
        }
        // 活跃cell结束行数
        var activeCellEndRow = row_count;
        for (let index = activeCellStartRow; index < row_count; index++) {
            var cell = this.cellList[index];
            if (cell && (cell.x - this.item_width * 0.5 > bot)) {
                activeCellEndRow = index;
                break;
            }
        }

        var max_count = this.numberOfCells();
        for (let index = 0; index < row_count; index++) {
            if (index >= activeCellStartRow && index <= activeCellEndRow) {
                if (!this.activeCellIdx[index]) {
                    if (index <= max_count) {
                        this.updateCellAtIndex(index);
                        this.activeCellIdx[index] = true;
                    }
                }
            } else {
                if (index <= max_count) {
                    this.activeCellIdx[index] = false;
                }
            }
        }
    },

    // 移动到具体位置,暂时不用了
    updateMove: function (pos) {
        // var target_pos = this.checkPosition(pos.x, pos.y);
        // var move_to = cc.moveTo(0.1, target_pos.x, target_pos.y).easing(cc.easeBackOut());
        // this.container.runAction(move_to);
    },

    // 跳转到指定位置,暂时不用了
    jumpToMove: function (pos, time, callback) {

    },

    // 监测位置,暂时也不用了
    checkPosition: function () {
        // var _x = this.container.x;
        // var _y = this.container.y;
        // if (this.dir == ScrollViewDir.horizontal) {
        //     _x = _x + x;
        // } else if (this.dir == ScrollViewDir.vertical) {
        //     _y = _y + y;
        // }
        // if (_x > 0) {
        //     _x = 0;
        // } else if (_x < this.size.width - this.container_size.width) {
        //     _x = this.size.width - this.container_size.width;
        // }
        // if (_y > 0) {
        //     _y = 0;
        // } else if (_y < this.size.height - this.container_size.height) {
        //     _y = this.size.height - this.container_size.height;
        // }
        // return cc.v2(_x, _y)
    },

    // 获取当前容器的坐标,暂时不用
    getCurContainerPosY: function () {

    },

    // 当前容器的坐标 位置
    getCurContainerPosX: function () {

    },

    //设置滚动容器的大小
    setInnerContainer: function () {
        var size = this.numberOfCells();
        var container_width = this.size.width;
        var container_height = this.size.height;
        var num = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            num = Math.ceil(size / this.row);
            container_width = num * this.item_width + 2 * this.start_x + (num - 1) * this.space_x;
        } else {
            num = Math.ceil(size / this.col);
            container_height = num * this.item_height + 2 * this.start_y + (num - 1) * this.space_y;
        }
        container_width = Math.max(container_width, this.size.width);
        container_height = Math.max(container_height, this.size.height);
        this.container_size = cc.size(container_width, container_height);
        if (this.scroll_view_con) {
            this.scroll_view_con.setContentSize(this.container_size)
        }

        if (this.scroll_view_compend) {
            this.scroll_view_compend.stopAutoScroll()
            if (this.start_pos == ScrollViewStartPos.top) {
                this.scroll_view_compend.scrollToTop(0);
            } else if (this.start_pos == ScrollViewStartPos.bottom) {
                this.scroll_view_compend.scrollToBottom(0);
            }
        }
    },

    // 刷新当前显示item数据(不改变任何位置的)
    resetCurrentItems: function () {
        for (var key in this.activeCellIdx) {
            if (this.activeCellIdx[key] == true) {
                this.updateCellAtIndex(key);
            }
        }
    },

    // 根据index刷新对应的索引,如果在可视范围以内
    resetItemByIndex: function (index) {
        if (this.activeCellIdx[index] == true) {
            this.updateCellAtIndex(index);
        }
    },

    // 获取所有活跃的cell对象
    getActiveCellList: function () {
        var list = [];
        for (var key in this.activeCellIdx) {
            if (this.activeCellIdx[key] == true) {
                if (this.cellList[key] && this.cellList[key].cell) {
                    list.push(this.cellList[key].cell);
                }
            }
        }
        return list;
    },

    // 根据下表获取对应的cell,不管是否活跃
    getCellByIndex: function (index) {
        if (this.cellList[index] && this.cellList[index].cell) {
            return this.cellList[index].cell;
        }
    },

    // 根据下表获取对应的cell的XY位置,先预留
    getCellXYByIndex: function (index) {

    },

    // 设置数据
    reloadData: function (select_index, setting) {
        if (this.root_wnd == null) {
            this.select_index = select_index;
            this.setting = setting
            return
        }
        if (setting) {
            this.analysisSetting(setting);
        }
        this.cellList = [];
        this.activeCellIdx = {};
        for (var key in this.cacheList) {
            const cell = this.cacheList[key];
            cell.setPosition(-10000,0);
        }
        this.setInnerContainer();
        var number = this.numberOfCells();
        if (number == 0) return;

        for (let i = 0; i < number; i++) {
            var cell = null;
            if (i <= this.time_show_index) {
                cell = this.getCacheCellByIndex(i);
            }
            var row_count = this.cellList.length;
            var xy = this.getCellPosition(row_count)//row_cont + 1
            var cellData = { cell: cell, x: xy.x, y: xy.y };
            this.cellList.push(cellData);
        }
        if (this.is_first_init) {
            this.startTimeTicket();
        } else {
            //如果时间显示索引小于总数 应该显示继续当前定时器 让下面的能显示出来
            if (this.time_show_index <= number) {
                this.startTimeTicket();
            }
        }
        if (select_index == null) {
            var maxRefreshNum = 0
            if (this.dir == ScrollViewDir.horizontal) {
                maxRefreshNum = this.cacheMaxSize - this.row;
            } else {
                maxRefreshNum = this.cacheMaxSize - this.col;
            }
            var refreshNum = (number < maxRefreshNum) ? number : maxRefreshNum;
            for (let i = 0; i < refreshNum; i++) {
                if (i < this.time_show_index) { //i<=
                    this.updateCellAtIndex(i)
                }
                this.activeCellIdx[i] = true;
            }
        } else {
            this.selectCellByIndex(select_index);
        }
    },

    // 选中index索引对象(如果列表允许 会排序在开始第一位)
    selectCellByIndex: function (index) {
        var maxRefreshNum = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            maxRefreshNum = this.cacheMaxSize - this.row;
        } else {
            maxRefreshNum = this.cacheMaxSize - this.col;
        }
        var number = this.numberOfCells();
        if (number < maxRefreshNum) {
            // 不够现实一屏幕
            for (let i = 0; i < number; i++) {
                if (i < this.time_show_index) { //i<=
                    this.updateCellAtIndex(i);
                }
                this.activeCellIdx[i] = true;
            }
        } else {
            if (this.dir == ScrollViewDir.horizontal) {
                var container_x = 0;
                if (index == 0) {
                    container_x = 0
                } else {
                    container_x = -(this.cellList[index].x - (this.item_width + this.space_x) * 0.5);
                }
                // 容器X方向最大位置
                var max_contariner_x = -(this.container_size.width - this.size.width);
                if (container_x < max_contariner_x) {
                    container_x = max_contariner_x;
                }
                var show_index = Math.floor(Math.abs(container_x) / this.item_width) //+1
                if (this.time_show_index < show_index) {
                    this.time_show_index = show_index;
                }
                this.container.x = container_x;
                this.checkOverShowByHorizontal();
            } else {
                var container_y = 0
                if (index == 0) {
                    container_y = this.start_y + this.cellList[index].y + this.item_height * 0.5 - this.size.height;
                } else {
                    container_y = this.cellList[index].y + (this.item_height + this.space_y) * 0.5 - this.size.height;
                }
                if (container_y < 0) {
                    container_y = 0
                }
                var index_1 = Math.floor((this.container_size.height - (container_y + this.size.height)) / this.item_height) + 1;
                var show_index = (index_1 - 1) * this.col;//+1
                if (this.time_show_index < show_index) {
                    this.time_show_index = show_index;
                }
                this.container.y = -container_y;
                this.checkOverShowByVertical()
            }
        }
        if (index >= 0 && index < this.numberOfCells()) { //index>0 and index <=
            var cell = this.getCacheCellByIndex(index);
            cell.index = index;
            this.cellList[index].cell = cell;
            this.onCellTouched(cell, index);
        }
    },

    // 定时器创建
    startTimeTicket: function () {
        if (this.time_tichet == null) {
            if (this.cellList.length == 0) return;

            // 到时间现实索引
            var once_num = this.once_num || 1;
            var _callback = function () {
                if (this.container == null) return;
                var count = this.time_show_index + once_num;
                var index = this.time_show_index;
                // if(index == 0){
                //     index = 1;
                // }
                var size = this.cellList.length;
                this.time_show_index = this.time_show_index + once_num;
                for (let i = index; i < count; i++) {
                    if (i > size) break;
                    var cellData = this.cellList[i];
                    if (cellData && cellData.cell == null) {
                        cellData.cell = this.getCacheCellByIndex(i);
                    }
                    if (this.activeCellIdx[i]) {
                        this.updateCellAtIndex(i);
                    }
                }
                if (this.time_show_index >= size) {
                    this.clearTimeTicket();
                    this.is_first_init = false
                }
            }.bind(this);

            this.time_tichet = gcore.Timer.set(function () {
                _callback()
            }.bind(this), this.delay / 60, -1)
        }
    },

    // 清除掉定时器
    clearTimeTicket: function () {
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
    },

    // 获取index的对应位置
    getCellPosition: function (index) {
        var ap_x = 0.5;
        var ap_y = 0.5;
        var _x = 0;
        var _y = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            _x = this.start_x + this.item_width * ap_x + (this.item_width + this.space_x) * (Math.floor(index / this.row));
            _y = this.container_size.height - (this.start_y + this.item_height * ap_y + (index % this.row) * (this.item_height + this.space_y));
        } else {
            if (this.start_pos == ScrollViewStartPos.top) {
                _x = this.start_x + this.item_width * ap_x + (this.item_width + this.space_x) * (index % this.col);
                _y = this.container_size.height - (this.start_y + this.item_height * ap_y + (Math.floor(index / this.col)) * (this.item_height + this.space_y))
            } else {
                _x = this.start_x + this.item_width * ap_x + (this.item_width + this.space_x) * (index % this.col);
                _y = this.start_y + this.item_height * ap_y + Math.floor(index / this.col) * (this.item_height + this.space_y)
            }
        }
        return { x: _x, y: _y };
    },

    // 获取格子下表对应的缓存itemcell
    getCacheCellByIndex: function (index) {
        var cacheIndex = (index % this.cacheMaxSize);
        if (this.cacheList[cacheIndex] == null) {
            var newCell = this.createNewCell();
            if (newCell) {
                // newCell.setAnchorPoint(0.5, 0.5;)
                newCell.setPosition(-10000,0);
                this.cacheList[cacheIndex] = newCell;
                newCell.setParent(this.container);
            }
            return newCell;
        } else {
            return this.cacheList[cacheIndex];
        }
    },

    // 更新格子,并标记活跃
    updateCellAtIndex: function (index) {
        if (index > this.time_show_index) return;
        if (this.cellList[index] == null) return;
        var cellData = this.cellList[index];
        if (cellData.cell == null) {
            cellData.cell = this.getCacheCellByIndex(index);
        }
        cellData.cell.setPosition(cellData.x, cellData.y);
        this.updateCellByIndex(cellData.cell, index);
    },

    // 
    getMaxSize: function () {
        return this.container_size;
    },

    getContainer: function () {
        return this.container;
    },

    deleteMe: function () {
        this.DeleteMe();
    },
    setVisible:function(bool){
        if(this.root_wnd && bool != null){
            this.root_wnd.active = bool;
        }
    },
    DeleteMe: function () {
        this.clearTimeTicket();
        for (var key in this.cacheList) {
            var item = this.cacheList[key];
            if (item && item.deleteMe) {
                item.deleteMe()
            }
            item = null;
        }
        this.cellList = null;
        this.cacheList = null;
        this.activeCellIdx = null;

        this.root_wnd.destroy();
        this.root_wnd = null;
        LoaderManager.getInstance().releasePrefab(this.prefabPath);
    },
})