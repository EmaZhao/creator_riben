// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      无线滚动容器,子对象必须是锚点0.5,0.5, 而且一定要继承 basepanel
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")

var CommonScrollView = cc.Class({
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
        this.cache_item_list = [];                      // 当前显示的对象
        this.cache_item_pool = [];                      // 缓存中是剩余的对象

        this.item_click_callback = null;
        this.extend = null;                             //扩展参数
        this.cur_item_class = null;                     //当前显示的对象
        this.is_radian = false;
        this.is_scrolling = false;
        this.cur_min_index = 0;
        this.bounceEnabled = true;                         //是否回弹
        this.clickEnabled = true;                        //是否可点击
        this.inertiaEnabled = true; //是否有惯性
        this.createCallBack = null;
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
    createScroll: function (parent, pos, dir, start_pos, size, setting, ap,callback) {
        this.parent = parent;
        this.pos = pos || cc.v2(0, 0);
        this.dir = dir || ScrollViewDir.vertical;
        this.start_pos = start_pos || ScrollViewStartPos.top;
        this.size = size || cc.size(100, 100);
        this.ap = ap || cc.v2(0, 0);
        this.createCallBack = callback;

        this.analysisSetting(setting);

        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
            if(this.parent == null || (this.parent && this.parent.isValid)){
                this.root_wnd = res_object;
                this.createRootWnd(this.root_wnd);
            }
        }).bind(this))
    },

    // 初始化创建对象
    createRootWnd: function (scroll) {
        if(this.root_wnd == null)return
        this.root_wnd = scroll;
        this.scroll_view = scroll.getChildByName("ScrollView");
        this.scroll_view_mask = this.scroll_view.getChildByName("view");
        this.container = this.scroll_view_mask.getChildByName("content");
        this.mask = this.scroll_view.getChildByName("mask")
        this.root_wnd.setContentSize(this.size);
        this.root_wnd.setAnchorPoint(this.ap.x, this.ap.y);
        this.root_wnd.setPosition(this.pos);
 
        this.scroll_view.setContentSize(this.size);
        this.scroll_view_mask.setContentSize(this.size);
        this.container.setContentSize(this.size);
        // 滚动组建
        this.scroll_view_compend = this.scroll_view.getComponent(cc.ScrollView)
        if (this.dir == ScrollViewDir.vertical) {
            this.scroll_view_compend.vertical = true
        } else {
            this.scroll_view_compend.horizontal = true
        }

        if (this.scroll_state != null) {
            this.setScrollState(this.scroll_state)
        }

        if (this.parent) {
            this.parent.addChild(scroll);
        }

        this.setBounceEnabled(this.bounceEnabled);
        this.setInertiaEnabled(this.inertiaEnabled);
        this.setClickEnabled(this.clickEnabled);
        // 监听事件
        this.setInnerContainer()
        this.registerEvent();
    },

    registerEvent: function () {
        if (this.need_dynamic == true) {
            if (this.dir == ScrollViewDir.vertical) {
                this.scroll_view_compend.node.on('scrolling', this.checkRectIntersectsRect, this);
            }
        }
    },

    //移动的过程中盘点是否不再可视范围,不再的时候移除掉,放到对象池,并且准备下一次创建
    checkRectIntersectsRect: function (event) {
        if (this.need_dynamic == false) {
            return
        }
        if (this.dir == ScrollViewDir.vertical) {
            this.checkOverShowByVertical();
        }
    },

    //竖直方向的监测判断
    checkOverShowByVertical: function () {
        if (this.cur_item_class == null) {
            return
        }
        if (this.data_list == null || Utils.next(this.data_list) == null) {
            return
        }
        var item_list = this.cache_item_list
        var pool_list = this.cache_item_pool
        if (item_list == null) {
            return
        }
        var container_y = this.container.y;
        if (this.last_pos_y == null) {
            this.last_pos_y = container_y;
        }
        var item = null;
        var container_y_abs = Math.abs(container_y);
        //先移除不在可视的
        for (let index = item_list.length - 1; index >= 0; index--) {
            const item = item_list[index];
            if(item.y == null){
                Log.error(item);
            }
            var item_y = item.y
            var need_clear = false
            if (container_y > 0) {
                if (item_y > (this.size.height - container_y + this.item_height)) {
                    need_clear = true
                }
            } else {
                if (item_y < (container_y_abs - this.item_height)) {
                    need_clear = true
                } else if (item_y > (container_y_abs + this.size.height + this.item_height)) {
                    need_clear = true
                }
            }
            if (need_clear == true) {
                if (item && item.suspendAllActions != null) {
                    item.suspendAllActions();
                    item.cur_visible = false
                    item.setVisible(false,this.dir);
                }
                pool_list.push(item);
                item_list.splice(index, 1);
            }
        }
        this.supplementItemList(item_list, this.last_pos_y, container_y);
        this.last_pos_y = container_y;
    },

    //补充需要创建的
    supplementItemList: function (item_list, last_y, cur_y) {
        if (item_list == null || item_list.length == 0) {
            return
        }
        var cur_table_num = item_list.length;
        if (cur_table_num < this.max_sum) {
            var min_index = item_list[0].tmp_index;
            var max_index = item_list[0].tmp_index;

            for (let index = 0; index < item_list.length; index++) {
                const item = item_list[index];
                if (min_index >= item.tmp_index) {
                    min_index = Number(item.tmp_index);
                }
                if (max_index <= item.tmp_index) {
                    max_index = Number(item.tmp_index);
                }
            }
            if (cur_y > last_y) {  //向上,那么就创建到下面
                for (let index = 0; index < (this.max_sum - cur_table_num); index++) {
                    this.createList(this.data_list[max_index + index + 1])
                }
            } else {
                for (let index = 0; index < (this.max_sum - cur_table_num); index++) {
                    if ((min_index - index) > 0) {
                        this.createList(this.data_list[min_index - index - 1])
                    }
                }
            }
        }
    },

    setSwallowTouches: function (status) {
        this.scroll_view.setSwallowTouches(status);
    },

    setBounceEnabled: function (status) {
        this.bounceEnabled = status;
        if (!this.scroll_view_compend) return;
        this.scroll_view_compend.elastic = status;
    },

    scrollTo:function(index,time,object){
      var item = this.getItem(index);
      if(object){
        item = object;
        index = this.cache_item_list.indexOf(item);
      }
      if(!item || !item.params){
        return;
      }
      if(this.dir == ScrollViewDir.vertical){
        if(index == 0){
          this.scroll_view_compend.scrollToTop(0);
        }
        this.scroll_view_compend.scrollToOffset(cc.v2(item.x,item.y-item.params.height/2),time);
      }else{
        this.scroll_view_compend.scrollToOffset(cc.v2(item.x-item.params.width/2,item.y),time);
      }
    },

    setInertiaEnabled:function(status){//是否开启惯性
      this.inertiaEnabled = status;
      if (!this.scroll_view_compend) return;
      this.scroll_view_compend.inertia = status;
    },

    // 设置 scrollview 是否可点
    setClickEnabled: function (status) {
        this.clickEnabled = status;
        if (!this.scroll_view_compend) return;
        if (status) {
            this.scroll_view_compend.node.on(cc.Node.EventType.TOUCH_START, this.scroll_view_compend._onTouchBegan, this.scroll_view_compend, true);
            this.scroll_view_compend.node.on(cc.Node.EventType.TOUCH_MOVE, this.scroll_view_compend._onTouchMoved, this.scroll_view_compend, true);
            this.scroll_view_compend.node.on(cc.Node.EventType.TOUCH_END, this.scroll_view_compend._onTouchEnded, this.scroll_view_compend, true);
            this.scroll_view_compend.node.on(cc.Node.EventType.TOUCH_CANCEL, this.scroll_view_compend._onTouchCancelled, this.scroll_view_compend, true);
        } else {
            this.scroll_view_compend.node.off(cc.Node.EventType.TOUCH_START, this.scroll_view_compend._onTouchBegan, this.scroll_view_compend, true);
            this.scroll_view_compend.node.off(cc.Node.EventType.TOUCH_MOVE, this.scroll_view_compend._onTouchMoved, this.scroll_view_compend, true);
            this.scroll_view_compend.node.off(cc.Node.EventType.TOUCH_END, this.scroll_view_compend._onTouchEnded, this.scroll_view_compend, true);
            this.scroll_view_compend.node.off(cc.Node.EventType.TOUCH_CANCEL, this.scroll_view_compend._onTouchCancelled, this.scroll_view_compend, true);
        }
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
        time = time == null? 1 : time;
        var move_to = cc.moveTo(time, cc.v2(target_pos.x, target_pos.y));
        this.container.runAction(cc.sequence(move_to, cc.callFunc(function () {
            if (callback) {
                callback();
            }
        })))         //该方法在滚动的时候并不能触发scroll自己的监听，来更新数据,注释掉
    },

    jumpToMove_2:function(pos, time, callback){
        var target_pos = this.checkPosition(pos.x, pos.y);
        time = time == null? 1 : time;
        var move_to = cc.moveTo(time, cc.v2(target_pos.x, target_pos.y));
        this.container.runAction(cc.sequence(move_to, cc.callFunc(function () {
            if (callback) {
                callback();
            }
        })))         //该方法在滚动的时候并不能触发scroll自己的监听，来更新数据,注释掉
        // var size = this.container.getContentSize();
        // this.scroll_view_compend.scrollTo(cc.v2(target_pos.x / size.width, target_pos.y / size.height), time);
        // this.container.runAction(cc.sequence(cc.delayTime(0),cc.callFunc(function () {
        //     if (callback) {
        //         callback();
        //     }
        // })))
    },

    getCurContainerPosY: function () {
        if (this.container) {
            return this.container.y;
        }
    },

    getCurContainerPosX: function () {
        if (this.container) {
            return this.container.x;
        }
    },

    //监测目标点位置
    checkPosition: function (x, y) {
        if(this.root_wnd == null){
            return cc.v2(0, 0);
        }
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
        var size = 0;
        if (this.data_list) {
            size = this.data_list.length;
        }
        var container_width = this.size.width;
        var container_height = this.size.height;
        var num = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            num = Math.ceil(size / this.row);
            container_width = num * this.item_width + 2 * this.start_x + (num - 1) * this.space_x;
        } else {
            num = Math.ceil(size / this.col);
            if(!this.is_change){
                container_height = num * this.item_height + 2 * this.start_y + (num - 1) * this.space_y;
            }else{
                container_height = num * this.item_height + 2 * this.start_y + num * this.space_y;
            }
            
        }
        container_width = Math.max(container_width, this.size.width);
        container_height = Math.max(container_height, this.size.height);
        this.container_size = cc.size(container_width, container_height);
        if (this.container) {
            this.container.setContentSize(this.container_size.width,this.container_size.height + this.bottom)
        }

        if (this.scroll_view_compend) {
            this.scroll_view_compend.stopAutoScroll()
            if(this.dir == ScrollViewDir.vertical){
                if (this.start_pos == ScrollViewStartPos.top) {
                    this.scroll_view_compend.scrollToTop(0);
                } else if (this.start_pos == ScrollViewStartPos.bottom) {
                    this.scroll_view_compend.scrollToBottom(0);
                }
            }else if(this.dir == ScrollViewDir.horizontal){
                if (this.start_pos == ScrollViewStartPos.top) {
                    this.scroll_view_compend.scrollToLeft(0);
                } else if (this.start_pos == ScrollViewStartPos.bottom) {
                    this.scroll_view_compend.scrollToRight (0);
                }
            }

        }
    },

    //设置数据
    setData: function (data_list, click_callback, extend) {
        this.clearCacheList();
        if (data_list == null || Utils.next(data_list) == null) {
            return
        }

        // 转换一下存储,保证不改变原数据
        var switchList = []
        for (let index = 0; index < data_list.length; index++) {
            const element = data_list[index];
            switchList.push({ data: element, index: index })
        }

        this.item_click_callback = click_callback;
        this.data_list = switchList;
        this.extend = extend;
        this.cur_item_class = this.item_class;

        //设置内部滚动容器的尺寸
        this.setInnerContainer();

        var index = 0;
        var once_num = this.once_num || 1;
        //如果需要动态创建的话
        var size = this.data_list.length;
        if (this.need_dynamic == true) {
            size = this.max_sum - 1; //因为js从0开始，实际个数单位减少1
        }

        //判断这边是否已经创建过的,如果创建过的就不需要分帧创建了,直接add吧
        if (this.cur_item_class && this.cache_item_pool.length > 0) {
            for (var i = 0; i < size; i++) {
                var data = this.data_list[i];
                if (data != null) {
                    this.createList(data);
                }
                if (i == size - 1) {
                    if (this.end_callBack) {
                        this.end_callBack();
                    }
                }
            }
        } else {
            if (this.time_ticket == null && Utils.next(this.data_list || {}) != null) {
                this.time_ticket = gcore.Timer.set((function () {
                    if (this.container) {
                        if (this.data_list == null) {
                            if (this.end_callBack) {
                                this.end_callBack();
                            }
                            this.clearTimeTicket();
                        } else {
                            for (var i = index; i < index + once_num; i++) {
                                var switch_data = this.data_list[i];
                                if (switch_data != null) {
                                    this.createList(switch_data);
                                }
                            }
                            index = index + once_num;
                            if (index > size) {
                                if (this.end_callBack) {
                                    this.end_callBack();
                                }
                                this.clearTimeTicket();
                            }
                        }
                    } else {
                    }
                }).bind(this), this.delay * 10, -1);
            }
        }
    },

    updateItemData: function (index, new_data) {
        var new_item_data = { data: new_data, index: index }
        this.data_list[index] = new_item_data;

        var item = this.getItem(index);
        if (item) {
            item.setData(new_data);
        }
    },

    setStartX: function (x) {
        this.start_x = x
    },

    setSpaceY: function (space_y,is_change) {
        this.space_y = space_y;
        this.is_change = is_change;
    },

    clearTimeTicket: function () {
        if (this.time_ticket != null) {
            gcore.Timer.del(this.time_ticket);
            this.time_ticket = null;
        }
    },

    //重设滚动区域大小
    resetSize: function (size, pos) {
        if (size == null)
            return
        if (size.width == this.size.width && size.height == this.size.height)
            return
        this.size = size;
        if (this.root_wnd)
            this.root_wnd.setContentSize(size);
        if (this.scroll_view)
            this.scroll_view.setContentSize(size);
        if (this.scroll_view_mask)
            this.scroll_view_mask.setContentSize(size);
        if (this.root_wnd && pos)
            this.root_wnd.setPosition(pos);
        this.calculationMaxSum();
    },

    /**
     * 暂停计时器,以及回收掉之前创建的对象
     */
    clearCacheList: function () {
        this.clearTimeTicket();

        for (let index = 0; index < this.cache_item_list.length; index++) {
            const element = this.cache_item_list[index];
            if (element && element.suspendAllActions) {
                element.suspendAllActions()
            }
            this.cache_item_pool.push(element)
        }
        for (let index = 0; index < this.cache_item_pool.length; index++) {
            const element = this.cache_item_pool[index];
            if (element && element.setVisible) {
                element.cur_visible = false;
                element.setVisible(false,this.dir)
                // element.setPosVisible();
            }
        }
        this.cache_item_list = [];
    },

    addEndCallBack: function (call_back) {
        this.end_callBack = call_back;
    },

    /**
     * 创建具体事例
     * @param {*} data 这个数据是转换之后的数据,因为为了不改变数据结构,所以转换了 包含 data 和 index,其中data才是真实数据
     */
    createList: function (switch_data) {
        if (switch_data == null || switch_data.data == null || switch_data.index == null)
            return

        if (this.cur_item_class == null)
            return

        // if (this.cache_item_list[switch_data.index]) {
        //     var item = this.cache_item_list[switch_data.index]
        //     item.setVisible(true)
        //     return
        // }

        var item = null;
        if (this.cache_item_pool.length == 0) {
            if(typeof(this.item_class) == "string"){
                item = ItemsPool.getInstance().getItem(this.item_class);
            }else{
                item = new this.item_class(this.item_obj);
            }
            item.setParent(this.container);
            if (item.show)
                item.show();

            if (item.setScale) {
                item.setScale(this.scale);
            }

            if(this.isZIndex){
                if(this.isZIndex == 1){
                    if(item.setZIndex){
                        item.setZIndex(switch_data.index);
                    }
                }else if(this.isZIndex == 2){
                    if(item.setZIndex && this.data_list){
                        item.setZIndex(this.data_list.length-switch_data.index);
                    }
                }
            }
            
        } else {
            item = this.cache_item_pool.shift()
            if (item.setVisible) {
                item.setVisible(true,this.dir);
            } else {
                Log.error("没有设置显示接口啊!!!")
            }
        }
        //临时使用
        item.tmp_index = switch_data.index;
        this.cache_item_list.push(item);    //由于array数组的性质，有empty数据也算作一个长度，所以用push方法

        //拓展参数
        if (this.extend != null && item.setExtendData) {
            item.setExtendData(this.extend);
        }
        // 设置位置
        this.setItemPosition(item, switch_data.index);

        // 回调方法
        if (this.item_click_callback != null) {
            if (item.addCallBack) {
                item.addCallBack(this.item_click_callback);
            }
        }
        item.setData(switch_data.data, this.is_hide_effect);
        this.cur_min_index = switch_data.index;
    },

    //设置当前对象的位置,根据数据的临时_index去确定
    setItemPosition: function (item, index) {
        var cur_item_index = Number(index);
        var anchor_point = {};
        anchor_point.x = 0.5;
        anchor_point.y = 0.5;
        var _x = 0;
        var _y = 0;
        //父容器的相对锚点为（0,1）
        if (this.dir == ScrollViewDir.horizontal) {
            _x = this.start_x + this.item_width * anchor_point.x + (this.item_width + this.space_x) * (Math.floor(cur_item_index / this.row));
            _y = this.container_size.height - (this.start_y + this.item_height * (1 - anchor_point.y) + (cur_item_index % this.row) * (this.item_height + this.space_y));
        } else {
            if (this.start_pos == ScrollViewStartPos.top) {
                _x = this.start_x + this.item_width * anchor_point.x + (this.item_width + this.space_x) * (cur_item_index % this.col);
                _y = this.container_size.height - (this.start_y + this.item_height * (1 - anchor_point.y) + (Math.floor(cur_item_index / this.col)) * (this.item_height + this.space_y));
            } else {
                _x = this.start_x + this.item_width * anchor_point.x + (this.item_width + this.space_x) * (cur_item_index % this.col)
                _y = this.start_y + this.item_height * anchor_point.y + (Math.floor(cur_item_index / this.col)) * (this.item_height + this.space_y)
            }
        }
        item.setPosition(_x, _y+this.bottom)
    },

    resetCurrentItems: function() {
        for (let index = 0; index < this.cache_item_list.length; index++) {
            if (this.cache_item_list[index] && this.cache_item_list[index].setData) {
                var cur_data = this.data_list[this.cache_item_list[index].tmp_index];
                this.cache_item_list[index].setData(cur_data.data);
            }
        }
    },

    //获取已创建的全部对象
    getItemList: function () {
        var item_list = [];
        for (let index = 0; index < this.cache_item_list.length; index++) {
            const element = this.cache_item_list[index];
            item_list.push(element)
        }
        return item_list
    },

    getItem: function (tmp_index) {
        for (var item_i in this.cache_item_list) {
            var item = this.cache_item_list[item_i];
            if (item.tmp_index == tmp_index) {
                return item
            }
        }

        return null;
    },

    setRootVisible: function (bool) {
        if (this.root_wnd) {
            this.root_wnd.active = bool;
        }
    },


    //用于增减的时候操作,需要传去最新的List
    resetAddPosition: function (list, sort_fun) {
        if (list == null || Utils.next(list) == null)
            return
        if (sort_fun != null) {
            list.sort(sort_fun)
        }
        var swich_list = []
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            swich_list.push({ data: element, index: index })
        }
        this.data_list = swich_list;

        if (this.cache_item_list == null || Utils.next(this.cache_item_list) == null)
            return

        for (let index = 0; index < this.cache_item_list.length; index++) {
            var item = this.cache_item_list[index];           // 对象
            var switch_data = swich_list[item.tmp_index];       // 数据对象

            if (switch_data && item.setData && switch_data.data) {
                item.setData(switch_data.data);
                item.setVisible(true,this.dir);
                item.tmp_index = switch_data.index;
            } else {
                item.cur_visible = false
                item.setVisible(false,this.dir);
                this.cache_item_pool.push(item)

                // 移除掉
                this.cache_item_list.splice(index, 1)
            }
        }
    },

    //对当前创建对象做排序,同时对缓存数据做排序
    resetPosition: function (sort_fun, is_clear) {
        if (this.data_list == null || Utils.next(this.data_list) == null)
            return
        if (sort_fun != null) {
            this.data_list.sort(sort_fun);
        }
        for (let index = 0; index < this.data_list.length; index++) {
            var element = this.data_list[index];
            element.index = index
        }
        if (this.cache_item_list == null || Utils.next(this.cache_item_list) == null)
            return

        for (let index = 0; index < this.cache_item_list.length; index++) {
            var item = this.cache_item_list[index];
            if (item.tmp_index) {
                var switch_data = this.data_list[item.tmp_index];
                if (switch_data && item.setData && switch_data.data) {
                    item.setData(switch_data.data);
                    item.setVisible(true,this.dir);
                    item.tmp_index = switch_data.index;
                }
            }
        }
    },

    //解析数据
    analysisSetting: function (setting) {
        this.setting = setting || {};
        this.item_class = this.setting.item_class;
        this.start_x = this.setting.start_x || 0                        //第一个单元的起点X
        this.space_x = this.setting.space_x || 3                        // 横向间隔空间
        this.start_y = this.setting.start_y || 0                        // 第一个单元的起点Y
        this.space_y = this.setting.space_y || 3                        // 竖向间隔空间
        this.item_width = this.setting.item_width || 115                // 单元的宽度
        this.item_height = this.setting.item_height || 115              // 单元的高度
        this.is_radian = this.setting.is_radian || false                //是否要弧度
        this.row = this.setting.row || 5                                // 行数,作用于水平方向的滚动
        this.col = this.setting.col || 5                                // 列数,作用于垂直方向的滚动
        this.delay = this.setting.delay || 1                            // 创建延迟时间
        this.once_num = this.setting.once_num || 1                      // 每次创建的数量
        this.scale = this.setting.scale || 1                            //缩放值
        this.need_dynamic = this.setting.need_dynamic || false          // 是否需要动态创建的 
        this.is_hide_effect = this.setting.is_hide_effect || false
        this.item_obj = this.setting.item_obj;                          //给item_class传入默认参数
        this.bottom = this.setting.bottom || 0                        //底部间距
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
        this.max_sum = max_sum;
    },

    getMaxSize: function () {
        return this.container_size
    },

    getContainer: function () {
        return this.container
    },

    deleteMe: function () {
        this.DeleteMe();
    },

    //设置滚动状态，false取消滚动,true恢复原来的滚动方向
    setScrollState: function (bool) {
        if (this.scroll_view_compend) {
            if (!bool) {
                this.scroll_view_compend.vertical = false
                this.scroll_view_compend.horizontal = false
            } else {
                if (this.dir == ScrollViewDir.vertical) {
                    this.scroll_view_compend.vertical = true
                } else {
                    this.scroll_view_compend.horizontal = true
                }
            }
        } else {
            this.scroll_state = bool;
        }

    },

    setVisible:function(bool){
        if(this.root_wnd && bool != null){
            this.root_wnd.active = bool;
        }
    },

    /**
     * 是否设置item层次排序
     * type:   1:正向  2:反向
     */
    setItemZIndexByType:function(type){
        this.isZIndex = type;
    },

    //移除对象
    DeleteMe: function () {
        // doStopAllActions(self.container);    //不清楚H5还需不需要安全判断，先注释掉
        this.clearTimeTicket();
        this.setClickEnabled(false)
        for (let index = 0; index < this.cache_item_list.length; index++) {
            var element = this.cache_item_list[index];
            if (element.deleteMe) {
                element.deleteMe()
                element = null
            }
        }

        for (let index = 0; index < this.cache_item_pool.length; index++) {
            var element = this.cache_item_pool[index];
            if (element.deleteMe) {
                element.deleteMe()
                element = null
            }
        }
        this.cache_item_list = null
        this.cache_item_pool = null
        if(this.root_wnd){
            this.root_wnd.destroy();
            this.root_wnd = null;
        }
        LoaderManager.getInstance().releasePrefab(this.prefabPath);
    },
});