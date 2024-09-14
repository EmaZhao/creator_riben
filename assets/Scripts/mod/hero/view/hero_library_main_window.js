// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     英雄图书馆
// <br/>Create: 2019-03-16 10:40:01
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var HeroConst = require("hero_const");
var HeroLibraryMainItem = require("hero_library_main_item");

var Hero_library_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_library_main_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.ctrl = HeroController.getInstance();
        this.model = this.ctrl.getModel();

        //图书馆列表
        this.hero_library_list = {}
            //阵营
        this.select_camp = 0

        //scrollview列表参数
        this.col = 3 //列数
        this.item_width = 220 //item的宽高
        this.item_height = 325 + 10
        this.cacheList = {} //对象池
        this.cacheMaxSize = 0 //最大池数

        // 到时间显示的索引
        this.time_show_index = 0
        this.first_title_height = 50 //第一个的高度
        this.title_height = 80 //职业名字的高

        //列表职业对应信息
        this.career_info_list = {}

        //创建存储
        this.node_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        this.main_container = this.seekChild("main_container");
        this.lay_scrollview_nd = this.seekChild(this.main_container, "lay_scrollview");

        this.centre_box_1_nd = this.seekChild(this.main_container, "centre_box_1");
        this.border_left_box_2_nd = this.seekChild(this.main_container, "border_left_box_2");
        this.border_right_box_2_nd = this.seekChild(this.main_container, "border_right_box_2");
        this.top_box_4_nd = this.seekChild(this.main_container, "top_box_4");
        this.bottom_box_5_nd = this.seekChild(this.main_container, "bottom_box_5");
        this.seekChild(this.top_box_4_nd, "title", cc.Label).string = Utils.TI18N("图书馆");
        var camp_nd = this.seekChild(this.bottom_box_5_nd, "camp_node");
        this.camp_btn_list = {};
        for (var i = 0; i < 6; i++) {
            this.camp_btn_list[i] = this.seekChild(camp_nd, "camp_btn" + i);
        }
        this.img_select_nd = this.seekChild(camp_nd, "img_select");
        var pos = this.camp_btn_list[0].getPosition();
        this.img_select_nd.setPosition(pos.x, pos.y);

        this.close_btn = this.seekChild(this.bottom_box_5_nd, "close_btn");
        //this.seekChild(this.close_btn, "label", cc.Label).string = Utils.TI18N("返回");
        this.background_nd = this.seekChild("background");
        this.background_nd.scale = FIT_SCALE;
        this.loadRes(PathTool.getBigBg("hero/hero_bag_bg"), function(res) {
            this.background_nd.getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))

        this.adaptationScreen();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.close_btn, function() {
            this.ctrl.openHeroLibraryMainWindow(false)
        }.bind(this), 2)

        var fun = function(btn, i) {
            Utils.onTouchEnd(btn, function() {
                this.onClickBtnShowByIndex(i);
            }.bind(this), 2)
        }.bind(this)
        for (var i in this.camp_btn_list) {
            var v = this.camp_btn_list[i];
            fun(v, i);
        }
    },

    //设置适配屏幕
    adaptationScreen: function() {},

    //显示根据类型 0表示全部
    onClickBtnShowByIndex: function(index, is_must_reset) {
        if (this.img_select_nd && this.camp_btn_list[index]) {
            var pos = this.camp_btn_list[index].getPosition();
            this.img_select_nd.setPosition(pos.x - 0.5, pos.y + 1)
        }
        this.updateHeroList(index, is_must_reset);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(bid) {
        this.onClickBtnShowByIndex(0, true);
    },

    //更新职业的ui
    //title_pos_list 结构: title_pos_list[n] = {career_type = career_type, pos_y = xx}
    updateCareerUI: function(title_pos_list, container_height, start_x) {
        for (var i in this.career_info_list) {
            var career_info = this.career_info_list[i];
            if (career_info) {
                if (career_info.desk) {
                    career_info.desk.node.active = false;
                }
                career_info.bg.node.active = false;
            }
        }
        start_x = start_x || 0;

        var fun = function(i) {
            var info = title_pos_list[i];
            var career_type = info.career_type || HeroConst.CareerName.eMagician;
            var pos_y = info.pos_y || 0;
            var name = HeroConst.CareerName[career_type];
            var desk_y = -pos_y;
            var bg_y = -pos_y - 25;
            if (i == 1) {
                bg_y = -pos_y;
            }
            if (this.career_info_list[i] == null) {
                //第一个位置不需要台子
                var career_info = {};
                if (i != 1) {
                    var res = PathTool.getUIIconPath("herolibrary", "hero_library_box_5");
                    career_info.desk = Utils.createImage(this.scrollview_container_nd, null, 0, desk_y, cc.v2(0.5, 0.5), true, 0, true);
                    this.loadRes(res, function(bg_sf) {
                        career_info.desk.spriteFrame = bg_sf;
                    }.bind(this));
                    career_info.desk.node.setContentSize(cc.size(this.scrollview_size.width, 103));
                    career_info.desk.type = cc.Sprite.Type.SLICED;
                    career_info.desk.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                    this.node_list.push(career_info.desk)
                }
                var res = PathTool.getUIIconPath("herolibrary", "hero_library_18");
                var bg_hegit = 48;
                career_info.bg = Utils.createImage(this.scrollview_container_nd, null, start_x, bg_y, cc.v2(0, 1), true, 0, true);
                this.loadRes(res, function(bg_sf) {
                    career_info.bg.spriteFrame = bg_sf;
                }.bind(this));
                career_info.bg.node.setContentSize(cc.size(232, bg_hegit));
                career_info.bg.type = cc.Sprite.Type.SLICED;
                career_info.bg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this.node_list.push(career_info.bg)

                var res = PathTool.getPartnerTypeIcon(career_type);
                career_info.career_icon = Utils.createImage(career_info.bg.node, null, 50, -bg_hegit * 0.5 - 3, cc.v2(0, 0.5));
                this.loadRes(res, function(bg_sf) {
                    career_info.career_icon.spriteFrame = bg_sf;
                }.bind(this));

                this.node_list.push(career_info.career_icon)

                career_info.label = Utils.createLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), null, 88, -bg_hegit * 0.5 - 3, name, career_info.bg.node, null, cc.v2(0, 0.5));
                this.career_info_list[i] = career_info;

                this.node_list.push(career_info.label)
            } else {
                var career_info = this.career_info_list[i];
                if (career_info.desk) {
                    career_info.desk.node.active = true;
                    career_info.desk.node.y = desk_y;
                }
                career_info.bg.node.active = true;
                career_info.bg.node.y = bg_y;

                var res = PathTool.getPartnerTypeIcon(career_type);
                this.loadRes(res, function(bg_sf) {
                    career_info.career_icon.spriteFrame = bg_sf;
                }.bind(this));
                career_info.label.string = name;
            }
        }.bind(this)

        for (var i in title_pos_list) {
            if (i != 0) {
                fun(i)
            }
        }
    },

    //创建英雄列表
    updateHeroList: function(select_camp, is_must_reset) {
        select_camp = select_camp || 0;
        if (!is_must_reset && select_camp == this.select_camp) return

        if (!this.list_view_sv) {
            var size = this.lay_scrollview_nd.getContentSize();
            this.createLibraryScrollView(size, size.width * 0.5, size.height * 0.5);
        }
        this.list_view_sv.stopAutoScroll();
        this.list_view_sv.scrollToTop(0);
        this.select_camp = select_camp;
        var config_list = Config.partner_data.data_partner_base || {};
        var config_library = Config.partner_data.data_partner_library || {};
        var list = [];
        for (var k in config_list) {
            var v = config_list[k];
            for (var i in config_library)
            {
                var j = config_library[i];
                if(j[0]==v.bid)
                {
                    if (select_camp == 0 || select_camp == v.camp_type) {
                        list.push(v);
                    }
                }
            }
        }
        list.sort(Utils.tableCommonSorter([
            ["type", false],
            ["init_star", true],
            ["camp_type", false],
            ["sort_order", false]
        ]));

        var content_y = 0;
        var start_x = -this.scrollview_size.width / 2
            //获取下一个位置根据当前数量
        var _getNextPositionBySize = function(size) {
            var count = size % this.col;
            if (count == 0) {
                //换行
                content_y = content_y + this.item_height;
            }
            var x = start_x + this.item_width * count + this.item_width * 0.5;
            var y = content_y - this.item_height * 0.5
            return { x: x, y: y }
        }.bind(this)

        var title_pos_list = [];
        title_pos_list[0] = {}
        var career_type = null;
        this.hero_library_list = [];
        this.hero_library_list[0] = {};
        for (var i in list) {
            var v = list[i];
            if (career_type == null) {
                career_type = v.type;
                content_y = this.first_title_height;
                title_pos_list.push({ career_type: career_type, pos_y: 0 });
            }

            if (career_type != v.type) {
                // 算出多出的空位置 用{}去填补
                var count = this.col - (this.hero_library_list.length - 1) % this.col;
                if (count < this.col && count != 0) {
                    for (var i = 1; i <= count; i++) {
                        var pos = _getNextPositionBySize(this.hero_library_list.length - 1);
                        this.hero_library_list.push({ x: pos.x, y: pos.y });
                    }
                }
                career_type = v.type;
                title_pos_list.push({ career_type: career_type, pos_y: content_y });
                //遇到新职业..加title高度
                content_y = content_y + this.title_height;
            }
            var pos = _getNextPositionBySize(this.hero_library_list.length - 1);
            this.hero_library_list.push({ config: v, x: pos.x, y: pos.y });
        }

        //内容的高度
        var container_height = null;
        if (this.hero_library_list.length - 1 > 0) {
            container_height = content_y;
        } else {
            container_height = 0;
        }

        this.updateCareerUI(title_pos_list, container_height, start_x);
        this.reloadData(container_height);
    },

    //获取数据数量
    numberOfCells: function() {
        return this.hero_library_list.length - 1
    },

    //更新cell(拖动的时候.刷新数据时候会执行方法)
    updateCellByIndex: function(cell, index) {
        cell.index = index;
        var cell_data = this.hero_library_list[index];
        if (cell_data.config) {
            cell.setActive(true);
            let state =this.model.getHadHeroStarBybid(cell_data.config.bid)==null?true:false;
            cell.setData(cell_data.config,state);
        } else {
            cell.setActive(false);
        }
    },

    //点击cell .需要在 createNewCell 设置点击事件
    onCellTouched: function(cell) {
        var index = cell.index;
        var cell_data = this.hero_library_list[index];
        if(this.model.getHadHeroStarBybid(cell_data.config.bid)==null) {
            return;
        }
        if (cell_data && cell_data.config) {
            var draw_res = cell_data.config.draw_res;
            var library_config = gdata("partner_data", "data_partner_library", [cell_data.config.bid]);
            if (draw_res && library_config && draw_res != "") {
                this.ctrl.openHeroLibraryInfoWindow(true, cell_data.config.bid);
            } else {
                message(Utils.TI18N("画师正快马加鞭地制作该立绘中哟"))
                var pokedex_config = gdata("partner_data", "data_partner_pokedex", [cell_data.config.bid]);
                if (pokedex_config && pokedex_config[0]) {
                    var star = pokedex_config[0].star || 1;
                    this.ctrl.openHeroInfoWindowByBidStar(cell_data.config.bid, star);
                }
            }
        }
    },

    //--------------------------------开始-------------------------  
    //内内部写一个无限的scrollview
    createLibraryScrollView: function(size, x, y) {
        this.scrollview_size = size;
        this.list_view_sv = this.seekChild(this.lay_scrollview_nd, "list_view", cc.ScrollView);
        this.scrollview_container_nd = this.seekChild(this.list_view_sv.node, "content");

        this.cacheMaxSize = (Math.ceil(size.height / this.item_height) + 1) * this.col;
        this.list_view_sv.node.on("scrolling", function() {
            this.checkOverShowByVertical();
        }, this)
    },

    //竖直方向的监测判断
    checkOverShowByVertical: function() {
        if (!this.cellList) return
        var container_y = this.scrollview_container_nd.y;
        //计算 视图的上部分和下部分在self.container 的位置
        var top = -container_y;
        var bot = -this.scrollview_size.height + top;
        var col_count = Math.ceil((this.cellList.length - 1) / this.col);
        //下面因为 self.cellList 是一维数组 所以要换成二维来算
        //活跃cell开始行数
        var activeCellStarRow = 1;
        for (var i = 1; i <= col_count; i++) {
            var index = 1 + (i - 1) * this.col;
            var cell = this.cellList[index];
            activeCellStarRow = i;
            if (cell && cell.y - this.item_height * 0.5 <= top) {
                break
            }
        }
        //活跃cell结束行数
        var activeCellEndRow = col_count;
        if (bot < 0) {
            for (var i = activeCellStarRow; i <= col_count; i++) {
                var index = 1 + (i - 1) * this.col;
                var cell = this.cellList[index];
                if (cell && cell.y + this.item_height * 0.5 < bot) {
                    activeCellEndRow = i - 1;
                    break
                }
            }
        }
        var max_count = this.numberOfCells();
        for (var i = 1; i <= col_count; i++) {
            if (i >= activeCellStarRow && i <= activeCellEndRow) {
                for (var k = 1; k <= this.col; k++) {
                    var index = (i - 1) * this.col + k;
                    if (!this.activeCellIdx[index]) {
                        if (index <= max_count) {
                            this.updateCellAtIndex(index);
                            this.activeCellIdx[index] = true;
                        }
                    }
                }
            } else {
                for (var k = 1; k <= this.col; k++) {
                    var index = (i - 1) * this.col + k;
                    if (index <= max_count) {
                        this.activeCellIdx[index] = false;
                    }
                }
            }
        }
    },

    reloadData: function(container_height) {
        this.cellList = [];
        this.cellList[0] = {};
        this.activeCellIdx = {};
        for (var k in this.cacheList) {
            //相当于隐藏
            this.cacheList[k].setPosition(-1000, 0);
        }

        var container_height = Math.max(container_height, this.scrollview_size.height);
        this.container_size = cc.size(this.scrollview_size.width, container_height);
        this.scrollview_container_nd.setContentSize(this.container_size);
        this.list_view_sv.scrollToTop(0);

        var number = this.numberOfCells();
        if (number == 0) {
            return
        }
        for (var i = 1; i <= number; i++) {
            var data = this.hero_library_list[i];
            if (data != null) {
                var cell = null;
                if (i <= this.time_show_index) {
                    cell = this.getCacheCellByIndex(i);
                }
                var x = data.x;
                var y = -data.y;
                var cellData = { cell: cell, x: x, y: y };
                this.cellList.push(cellData);
            }
        }

        var maxRefreshNum = this.cacheMaxSize - this.col;
        var refreshNum = number < maxRefreshNum && number || maxRefreshNum;
        var fun = function(index) {
            gcore.Timer.set(function() {
                if (this.time_show_index < index) {
                    this.time_show_index = index;
                }
                this.updateCellAtIndex(index);
                if (this.time_show_index == refreshNum) {
                    this.time_show_index = 9999;
                }
            }.bind(this), index / 60, 1)
            this.activeCellIdx[i] = true;
        }.bind(this)
        for (var i = 1; i <= refreshNum; i++) {
            fun(i)
        }
    },

    //获得格子下标对应的缓存itemCell
    getCacheCellByIndex: function(index) {
        var cacheIndex = (index - 1) % this.cacheMaxSize + 1;
        if (!this.cacheList[cacheIndex]) {
            var newCell = new HeroLibraryMainItem();
            newCell.show();
            newCell.addCallBack(function() {
                this.onCellTouched(newCell);
            }.bind(this))
            newCell.setPosition(-1000, 0)
            newCell.setAnchorPoint(cc.v2(0.5, 0.5));
            this.cacheList[cacheIndex] = newCell;
            newCell.setParent(this.scrollview_container_nd);
            return newCell
        } else {
            return this.cacheList[cacheIndex];
        }
    },

    //更新格子，并记为活跃
    updateCellAtIndex: function(index) {
        if (index > this.time_show_index) {
            return
        }
        if (!this.cellList[index]) return
        var cellData = this.cellList[index];
        if (cellData.cell == null) {
            cellData.cell = this.getCacheCellByIndex(index);
        }
        cellData.cell.setPosition(cellData.x, cellData.y);
        this.updateCellByIndex(cellData.cell, index);
    },

    //--------------------------scrollview结束-------------------------

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (var k in this.cacheList) {
            var item = this.cacheList[k];
            if (item.deleteMe) {
                item.deleteMe();
                item = null;
            }
        }
        this.cacheList = null;

        for (var i in this.node_list) {
            var v = this.node_list[i];
            if (v) {
                if (v instanceof cc.Node) {
                    v.destroy();
                    v = null
                } else {
                    v.node.destroy();
                    v = null
                }
            }
        }
        this.node_list = null

        this.career_info_list = null;
        this.ctrl.openHeroLibraryMainWindow(false);
    },
})