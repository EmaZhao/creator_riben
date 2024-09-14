// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      无线滚动容器,子对象必须是锚点0.5,0.5, 而且一定要继承 basepanel
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")

var RedBagListPanel = cc.Class({
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
        this.total_cache_list = [];                      // 因为滚动容器可能每次存放不同的对象，因为多标签的时候

        this.item_click_callback = null;
        this.extend = null;                             //扩展参数
        this.cur_item_class = null;                     //当前显示的对象
        this.is_run = false;
        this.item_num = 0;
        this.move_over_index = 0;
        this.posx_list = { "1": this.size.width / 2, "2": this.size.width / 2 + 140, "3": this.size.width / 2 - 140 }
        this.cur_min_index = 0;
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
        this.ap = ap || cc.v2(0.5, 0.5);

        this.analysisSetting(setting);
        this.createRootWnd();
    },

    // 初始化创建对象
    createRootWnd: function () {
        var node = new cc.Node();
        this.container = new cc.Node("container");
        this.container.setParent(node);
        this.root_wnd = node;
        this.root_wnd.setParent(this.parent);

        this.root_wnd.setContentSize(this.size);
        this.root_wnd.setAnchorPoint(this.ap);
        this.root_wnd.setPosition(this.pos.x,this.pos.y);

        this.registerEvent();
    },

    registerEvent: function () {
        var self = this;
        var eventTarget = new cc.EventTarget();
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            /*
            可选event类型列表:
            cc.EventListener.TOUCH_ONE_BY_ONE (单点触摸)
            cc.EventListener.TOUCH_ALL_AT_ONCE (多点触摸)
            cc.EventListener.KEYBOARD (键盘)
            cc.EventListener.MOUSE (鼠标)
            cc.EventListener.ACCELERATION (加速计)
            cc.EventListener.CUSTOM (自定义)
            */
            onTouchBegin: function (touch, event) {
                self.last_point = null;
                self.is_move = false;
                if (self.cur_item_class == null) {
                    return false
                }
                if (self.screenSize == null) {
                    var pos = self.convertToWorldSpace(cc.p(0, 0));
                    self.screenSize = cc.rect(pos.x, pos.y, self.size.width, self.size.height);
                }
                var pos = cc.v2(touch.getLocation().x, touch.getLocation().y);
                if (!cc.rectContainsPoint(self.screenSize, pos)) {       // 判断触摸点是否在按钮范围内
                    return false
                }
                return true
            },

            onTouchMoved: function (touch, event) {
                self.last_point = touch.getDelta();
                self.moveContainer(self.last_point);
            },

            onTouchEnded: function () {
                self.is_move = false;
                if (self.last_point == null) return
            }
        })
        eventTarget.on(this.touchListener,this.container);
    },

    //移动
    moveContainer: function (pos) {
        var target_pos = this.checkPosition(pos.x, pos.y);
        var is_left = pos.x < 0;
        if (Math.abs(pos.x) >= 5 && this.is_move != true) {
            this.is_move = true;
            this.is_run = true;
            var cache_type_list = this.total_cache_list[this.cur_item_class];
            for (var i = 1; i <= this.item_num; i++) {
                var item = cache_type_list.item[i];
                this.setMoveItemPos(item, is_left);
            }
        }
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

    //设置数据
    setData: function (data_list, click_callback, extend) {
        this.clearCacheList();
        if (data_list == null || Utils.next(data_list) == null) {
            return
        }

        // 转换一下存储,保证不改变原数据
        // var switchList = []
        // for (let index = 0; index < data_list.length; index++) {
        //     const element = data_list[index];
        //     switchList.push({ data: element, index: index })
        // }

        this.item_click_callback = click_callback;
        this.data_list = data_list;
        this.extend = extend;

        var size = data_list.length;
        this.item_num = size;
        var container_width = this.size.width;
        var container_height = this.size.height;
        var num = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            num = Math.ceil(size / this.row)
            container_width = num * this.item_width + 2 * this.start_y + (num - 1) * this.space_x;
        } else {
            num = Math.ceil(size / this.col);
            container_height = num * this.item_height + 2 * this.start_y + (num - 1) * this.space_y;
        }

        container_width = Math.max(container_width, this.size.width);
        container_height = Math.max(container_height, this.size.height);
        this.container_size = cc.size(container_width, container_height);
        this.container.setContentSize(this.container_size);
        if (this.start_pos > 0) {
            var height = Math.max(0 - container_height * this.start_pos + 35, this.size.height - this.container_size.height);
            this.container.setPosition(cc.v2(0, height));
        } else if (this.start_pos == 0) {
            this.container.setPosition(cc.v2(0, 0));
        }

        //储存一下当前需要的单元类
        this.cur_item_class = this.item_class;
        var index = 0;
        var once_num = this.once_num || 1;
        var data = null;
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
                            var data = this.data_list[i];
                            if (data != null) {
                                // if (data._index == null) {
                                //     data._index = i;
                                // }
                                this.createList(data);
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


    },

    clearTimeTicket: function () {
        if (this.time_ticket != null) {
            gcore.Timer.del(this.time_ticket);
            this.time_ticket = null;
        }
    },

    /**
     * 暂停计时器,以及回收掉之前创建的对象
     */
    clearCacheList: function () {
        this.clearTimeTicket();

        if (this.cur_item_class != null) {
            var cache_type_list = this.total_cache_list[this.cur_item_class] || {};
            if (cache_type_list != null || Utils.next(cache_type_list) != null) {
                for (var i in cache_type_list.item) {
                    var item = cache_type_list.item[i];
                    item.setVisible(false);
                    cache_type_list.pool.push(item);
                }
            }
            cache_type_list.item = {};
        }
        this.cur_item_class = null;
    },

    addEndCallBack: function (call_back) {
        this.end_callBack = call_back;
    },

    /**
     * 创建具体事例
     * @param {*} data 这个数据是转换之后的数据,因为为了不改变数据结构,所以转换了 包含 data 和 index,其中data才是真实数据
     */
    createList: function (switch_data) {
        var data = switch_data;
        if (this.cur_item_class == null) return
        if (this.total_cache_list[this.cur_item_class] == null) {
            this.total_cache_list[this.cur_item_class] = {};
        }
        var cache_type_list = this.total_cache_list[this.cur_item_class];
        if (cache_type_list.item == null) {
            cache_type_list.item = []
        }
        if (cache_type_list.pool == null) {
            cache_type_list.pool = []
        }
        var item = null;
        if (Utils.next(cache_type_list.pool) == null) {
            item = new this.item_class(true, true, cc.size(this.item_width, this.item_height));
            if (item.setSwallowTouches)
                item.setSwallowTouches(false);
            // item.setScale(this.scale);
            item.setParent(this.container);
            item.show();
        } else {
            item = cache_type_list.splice(cache_type_list.pool, 0);
        }
        cache_type_list.item.push(item);
        var cur_item_index = cache_type_list.item.length;
        item.item_index = cur_item_index;
        if (this.extend != null && item.setExtendData) {
            item.setExtendData(this.extend);
        }
        this.setItemPosition(item, switch_data.index);
        // 回调方法
        if (this.item_click_callback != null) {
            if (item.addCallBack) {
                item.addCallBack(this.item_click_callback);
            }
        }
        item.setData(data);
    },

    //设置当前对象的位置,根据数据的临时_index去确定
    setItemPosition: function (item) {
        var cache_type_list = this.total_cache_list[this.cur_item_class];
        if (cache_type_list == null || cache_type_list.item == null) return
        var cur_item_index = cache_type_list.item.length;
        var anchor_point = cc.v2(0.5,0.5);
        var _x = 0;
        var _y = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            _x = this.posx_list[cur_item_index];
            _y = this.container_size.height - (this.start_y + this.item_height * (1 - anchor_point.y) + ((cur_item_index - 1) % this.row) * (this.item_height + this.space_y));
        }
        item.setPosition(_x, _y);
        if (cur_item_index == 1) {
            item.setLocalZOrder(10);
            item.showBlackBg(false);
            item.setScale(1.05);
            this.select_item = item;
        } else {
            item.setLocalZOrder(1);
            item.showBlackBg(true);
            item.setScale(0.85);
        }
    },

    //获取已创建的全部对象
    getItemList: function () {
        var item_list = [];
        for (let index = 0; index < this.total_cache_list.length; index++) {
            const element = this.total_cache_list[index];
            item_list.push(element)
        }
        return item_list
    },

    setMoveItemPos: function (item, is_left) {
        var cache_type_list = this.total_cache_list[this.cur_item_class];
        if (cache_type_list == null || cache_type_list.item == null) return
        var cur_item_index = item.item_index || 0;
        if (is_left == true) {
            if (cur_item_index <= 1) {
                cur_item_index = this.item_num;
            } else {
                cur_item_index = cur_item_index - 1;
            }
        } else {
            if (cur_item_index >= this.item_num) {
                cur_item_index = 1;
            } else {
                cur_item_index = cur_item_index + 1;
            }
        }
        item.item_index = cur_item_index;
        var anchor_point = cc.v2(0.5,0.5)
        var _x = 0;
        var _y = 0;
        if (this.dir == ScrollViewDir.horizontal) {
            _x = this.posx_list[cur_item_index]
            _y = this.container_size.height - (this.start_y + this.item_height * (1 - anchor_point.y) + ((cur_item_index - 1) % this.row) * (this.item_height + this.space_y))
        }
        var scale = 1;
        if (cur_item_index == 1) {
            item.setLocalZOrder(10);
            item.showBlackBg(false);
            scale = 1.05;
            this.select_item = item;
        } else {
            item.setLocalZOrder(1);
            item.showBlackBg(true);
            scale = 0.85;
        }
        var move_to = cc.moveTo(0.3, cc.v2(_x, _y));
        var scale_start = cc.scaleTo(0,1);
        var scale_to = cc.scaleTo(0.3, scale);
        item.runActionFunc(cc.sequence(scale_start,scale_to));
        var self = this;
        item.runActionFunc(cc.sequence(move_to, cc.callFunc(function () {
            self.is_run = false;
            if (self.end_callBack) {
                self.end_callBack()
            }
        })))
    },

    //外部按钮左移动一个
    runLeftPostion: function () {
        if (this.is_run == true) return
        var cache_type_list = this.total_cache_list[this.cur_item_class];
        this.is_run = true;
        for (var i = 0; i < this.item_num; i++) {
            var item = cache_type_list.item[i];
            this.setMoveItemPos(item, true);
        }
    },

    //外部按钮右移动一个
    runRightPostion: function () {
        if (this.is_run == true) return
        this.is_run = true;
        var cache_type_list = this.total_cache_list[this.cur_item_class];
        for (var i = 0; i < this.item_num; i++) {
            var item = cache_type_list.item[i];
            this.setMoveItemPos(item, false);
        }
    },

    getSelectItem: function () {
        return this.select_item;
    },

    setSelectItem: function (item) {
        if (item)
            this.select_item = item;
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
        this.delay = this.setting.delay || 4                            // 创建延迟时间
        this.once_num = this.setting.once_num || 1                      // 每次创建的数量
        this.scale = this.setting.scale || 1                            //缩放值
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

    //移除对象
    DeleteMe: function () {
        // doStopAllActions(self.container);    //不清楚H5还需不需要安全判断，先注释掉
        this.clearTimeTicket();
        for(var k in this.total_cache_list ){
            var v = this.total_cache_list[k];
            for(var i in v){
                var list = v[i];
                for(var j in list){
                    if(list[j].deleteMe){
                        list[j].deleteMe();
                        list[j] = null;
                    }
                }
            }
        }
        this.total_cache_list = null;

        this.root_wnd.destroy();
        this.root_wnd = null;
        this.container.destroy();
        this.container = null;
    },
});