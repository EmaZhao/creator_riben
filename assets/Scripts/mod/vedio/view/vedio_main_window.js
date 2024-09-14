// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-16 19:12:27
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var VedioMainItem = require("vedio_item_panel")
var VedioConst = require("vedio_const")
var CommonTabBtn = require("common_tab_btn")
var VedioController = require("vedio_controller")
var VedioEvent = require("vedio_event")
var RoleController = require("role_controller")
var ChatConst = require("chat_const")
var VedioMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vedio", "vedio_main_window");
        // this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = VedioController.getInstance()
        this._model = this.ctrl.getModel()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.req_flag = false     // 是否正在请求数据（避免滑到底部多次请求）
        this.filt_index_list = {} //记录各页签当前选中的筛选下标
        this.filt_btn_list = []
        this.vedio_data = {}     // -- 当前选中的类型、条件的录像数
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this;
        self.background = self.root_wnd.getChildByName("background")
        self.background.scale = FIT_SCALE;
        this.loadRes(PathTool.getUIIconPath("bigbg","bigbg_2","jpg"),function(res){
            self.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        self.mainContainer = self.root_wnd.getChildByName("main_container")

        self.share_panel = self.mainContainer.getChildByName("share_panel")
        self.share_panel.active = false;
        self.share_bg = self.share_panel.getChildByName("share_bg")
        self.btn_guild = self.share_bg.getChildByName("btn_guild")
        self.btn_world = self.share_bg.getChildByName("btn_world")
        self.btn_guild.getChildByName("guild_label").getComponent(cc.Label).string = Utils.TI18N("分享到公会频道")
        self.btn_world.getChildByName("world_label").getComponent(cc.Label).string = Utils.TI18N("分享到世界频道")

        self.main_panel = self.mainContainer.getChildByName("main_panel")

        self.main_panel.getChildByName("win_title").getComponent(cc.Label).string = Utils.TI18N("录像馆")
        self.like_limit_num = self.main_panel.getChildByName("like_limit_num").getComponent(cc.Label)
        self.like_limit_num.string = ""
    
        self.close_btn = self.main_panel.getChildByName("close_btn")
        self.collect_btn = self.main_panel.getChildByName("collect_btn")
        self.collect_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("个人收藏")
        self.myself_btn = self.main_panel.getChildByName("myself_btn")
        self.myself_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("个人记录")
    
        self.no_vedio_image = self.main_panel.getChildByName("no_vedio_image")
        self.arrow = self.main_panel.getChildByName("arrow")
        let filt_bg = self.main_panel.getChildByName("filt_bg")
        self.filt_label = filt_bg.getChildByName("filt_label").getComponent(cc.Label)
        self.filt_btn = filt_bg.getChildByName("filt_btn")
    
        self.filt_lv_btn = self.main_panel.getChildByName("filt_lv_btn")
        self.filt_lv_btn.getComponent(cc.Toggle).isChecked = this._model.getFiltLevelFlag()
        self.filt_lv_btn.getChildByName("name").getComponent(cc.Label).string = Utils.TI18N("筛选临近等级")

        let scrollCon = self.main_panel.getChildByName("scrollCon")
        let bgSize = scrollCon.getContentSize()
        let scroll_view_size = cc.size(bgSize.width-10, bgSize.height-10)

        Utils.getNodeCompByPath("main_container/main_panel/no_vedio_image/label", this.root_wnd, cc.Label).string = Utils.TI18N("暂无录像信息");
        Utils.getNodeCompByPath("main_container/main_panel/filt_bg/filt_label", this.root_wnd, cc.Label).string = Utils.TI18N("全部等级");

        let setting = {
            item_class : VedioMainItem,
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                    //-- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 3,                   //-- y方向的间隔
            item_width : 620,               //-- 单元的尺寸width
            item_height : 374,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            need_dynamic : true
        }
        this.vedio_scrollview = new CommonScrollView();

        this.vedio_scrollview.createScroll(scrollCon, cc.v2(4.5,5) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting)
        //common_scrollview_single有bug暂时不用
        // this.vedio_scrollview.registerScriptHandlerSingle(self._createNewCell.bind(this), ScrollViewFuncType.CreateNewCell) //--创建cell
        // self.vedio_scrollview.registerScriptHandlerSingle(self._numberOfCells.bind(this), ScrollViewFuncType.NumberOfCells) //--获取数量
        // this.vedio_scrollview.registerScriptHandlerSingle(self._updateCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex) //--更新cell

        this.createTabBtnList()
    },
    _createNewCell(  ){
        let cell = new VedioMainItem()
        cell.addCallBack(this._onClickShareBtn.bind(this))
        cell.show();
        return cell
    },
    _numberOfCells(  ){
        if(!this.vedio_show_data)  return 0;
        return this.vedio_show_data.length
    },
    _updateCellByIndex(cell,index){
        if(!this.vedio_show_data)  return;
        cell.index = index
        let cell_data = this.vedio_show_data[index]
        if(!cell_data) return;
        if(this.cur_index){
            if(this.cur_index == VedioConst.Tab_Index.Hot){
                cell.setExtendData({is_hot : true})
            }else{
                cell.setExtendData({})
            }
        }
        cell.setData(cell_data)
    },
    createTabBtnList(){
        // let temp_tab = []
        // temp_tab[0] = VedioConst.Tab_Index.Hot;
        // temp_tab[1] = VedioConst.Tab_Index.Arena;
        // temp_tab[2] = VedioConst.Tab_Index.Champion;
        // temp_tab[3] = VedioConst.Tab_Index.Solo;
        // temp_tab[4] = VedioConst.Tab_Index.Guildwar;
        // temp_tab[5] = VedioConst.Tab_Index.Ladder;
        // temp_tab[6] = VedioConst.Tab_Index.Elite;
        // this.tabArray = []
        // for(let i=0;i<temp_tab.length;++i){
        //     let index = temp_tab[i]
        //     let config = Config.video_data.data_vedio[index]
        //     if(config){
        //         let tab_data = {}
        //         tab_data.title = config.name
        //         tab_data.index = config.id
        //         this.filt_index_list[config.id] = this.getDefaultFiltIndex() //-- 各页签筛选默认选中的下标
        //         this.tabArray.push(tab_data)
        //     }
        // }
        this.tabArray = [];
        for(let k in Config.video_data.data_vedio){
            let config = Config.video_data.data_vedio[k];
            if(config.is_show == 1){
                let tab_data = {}
                tab_data.title = config.name;
                tab_data.index = config.id;
                tab_data.sort_id = config.sort_id;
                this.filt_index_list[config.id] = this.getDefaultFiltIndex() //-- 各页签筛选默认选中的下标
                this.tabArray.push(tab_data)
            }
        }
        this.tabArray.sort(Utils.tableLowerSorter(["sort_id"]));
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.myself_btn.on('click',function(){
            this.ctrl.openVedioMyselfWindow(true)
        },this)
        //个人收藏
        this.collect_btn.on('click',function(){
            Utils.playButtonSound(1)
            this.ctrl.openVedioCollectWindow(true)
        },this)
        this.addGlobalEvent(VedioEvent.UpdateTodayLikeNum,function(){
            this.refreshTodayLikeNum()
        }.bind(this))
        this.addGlobalEvent(VedioEvent.UpdatePublicVedioEvent,function(vedioType){
            if(this.cur_index && vedioType && this.cur_index == vedioType){
                this.setData()
                this.req_flag = false
            }
        }.bind(this))
        this.filt_lv_btn.on('toggle',function(event){
            Utils.playButtonSound(1)
            this._model.setFiltLevelFlag(event.isChecked)
            this.scroll_to_top = true
            this.setData()
        },this)
        this.close_btn.on('click',function(){
            Utils.playButtonSound(2)
            this.ctrl.openVedioMainWindow(false)
        },this)
        this.share_panel.on('touchend',function(){
            this.share_panel.active = false;
        },this)
        this.btn_world.on("click",function(){
            Utils.playButtonSound(1)
            if(this.replay_id){
                this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.World, this.srv_id, this.combat_type)
                let new_data = this._model.updateVedioData(this.cur_index, this.replay_id, "share", this.share_num)
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
            this.replay_id = null
            this.srv_id = null
            this.combat_type = null
            this.share_panel.active = false
        },this)
        this.btn_guild.on('click',function(){
            Utils.playButtonSound(1)
            if(RoleController.getInstance().getRoleVo().isHasGuild() == false){
                message(Utils.TI18N("您暂未加入公会"))
                return
            }
            if(this.replay_id){
                this.ctrl.requestShareVedio(this.replay_id, ChatConst.Channel.Gang, this.srv_id, this.combat_type)
                let new_data = this._model.updateVedioData(this.cur_index, this.replay_id, "share", this.share_num)
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
            this.replay_id = null
            this.srv_id = null
            this.combat_type = null
            this.share_panel.active = false
        },this)
        // -- 筛选按钮
        this.filt_btn.on("click",function(){
            Utils.playButtonSound(1)
            this._onClickFiltBtn()
        },this)
        // -- 打开\关闭个人记录个人收藏界面
        this.addGlobalEvent(VedioEvent.OpenCollectViewEvent, function ( status ){
            if(!this.mainContainer)  return;
            if(status == true){
                this.mainContainer.active = false
            }else{
                this.mainContainer.active = true
            }
        }.bind(this))

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(sub_index){
        sub_index = sub_index || VedioConst.Tab_Index.Hot
        let tab_container = this.main_panel.getChildByName("tab_container").getChildByName("content")
        this.tab_Btn = []
        for(let i=0;i<this.tabArray.length;++i){
            let v = this.tabArray[i]
            let btn = new CommonTabBtn()
            btn.setParent(tab_container)
            btn.setTitle(v.title)
            btn.addCallBack(function(){
                let index = v.index
                this._onClickTabBtn(index)
            }.bind(this))
            this.tab_Btn.push(btn)
        }
        this.refreshTodayLikeNum()
        for(let i=0;i<this.tabArray.length;++i){
            let v = this.tabArray[i]
            if(sub_index == v.index){
                this.tab_Btn[i].getToggle().check()
                this._onClickTabBtn(v.index)
                break
            }
        }

        
    },
    _onClickTabBtn(index){
        var self = this
        self.cur_index = index

        // -- 竞技场才显示筛选相近等级玩家按钮
        self.filt_lv_btn.active = (self.cur_index == VedioConst.Tab_Index.Arena)

        let vedio_config = Config.video_data.data_vedio[self.cur_index]
        let filt_index = self.filt_index_list[self.cur_index]
        if(vedio_config){
            let evt = vedio_config.evt[filt_index ]
            let btn_str = self.getFiltBtnNameByEvt(evt)
            self.filt_label.string = btn_str
        }

        self.vedio_data = {}
        self.scroll_to_top = true
        // -- 没请求过数据则请求数据，否则直接显示缓存数据
        if(self.cur_index == VedioConst.Tab_Index.Elite){
            // -- 段位赛特殊处理
            // self.vedio_scrollview.setVisible(false)
            // if(!self.elite_scrollview){
            //     self.createEliteScrollview()
            // }
            // self.elite_scrollview:setVisible(true)
            // if not self.req_elite_flag then
            //     self.req_elite_flag = true
            //     ElitematchController:getInstance():sender24930(3)
            // else
            //     self:updateEliteVedioData()
            // end
        }else{
            // if(self.elite_scrollview){
            //     self.elite_scrollview.setVisible(false)
            // }
            if(!this._model.checkIsReqVedioDataByType(self.cur_index, filt_index)){
                this.ctrl.requestPublicVedioData(self.cur_index, filt_index, 1, VedioConst.ReqVedioDataNum)
            }else{
                this.setData()
            }
        }
    },
    // -- 刷新点赞数
    refreshTodayLikeNum(  ){
        let today_num = this._model.getTodayLikeNum()
        let total_num = 0
        let likes_limit_cfg = Config.video_data.data_const["likes_limit"]
        if(likes_limit_cfg){
            total_num = likes_limit_cfg.val
        }
        let left_num = total_num - today_num
        if(left_num < 0){  
            left_num = 0 
        }
        this.like_limit_num.string =  cc.js.formatStr(Utils.TI18N("点赞数:%d/%d"), left_num, total_num)
    },
    // -- 获取默认选中的筛选下标
    getDefaultFiltIndex(  ){
        let filt_index = 0
        return filt_index
    },
    getFiltBtnNameByEvt( evt ){
        if(!evt) return "";
        let evt_name = evt[0]
        let btn_str = ""
        if(evt_name == "all"){
            btn_str = Utils.TI18N("全部")
        }else if(evt_name == "rank"){
            let min_num = evt[1]
            let max_num = evt[2]
            if(min_num && max_num){
                btn_str = cc.js.formatStr(Utils.TI18N("%d-%d名"), min_num, max_num)
            }else if(!max_num){
                btn_str = cc.js.formatStr(Utils.TI18N("%d名以后"), min_num)
            }
        }else if(evt_name == "cham"){
            let cham_num = evt[1]
            btn_str = Utils.TI18N(VedioConst.Cham_Name[cham_num])
        }else if(evt_name == "lev"){
            let min_num = evt[1]
            let max_num = evt[2]
            if(min_num && max_num){
                btn_str = cc.js.formatStr(Utils.TI18N("%d-%d级"), min_num, max_num)
            }else if(!max_num){
                btn_str = cc.js.formatStr(Utils.TI18N("%d级以上"), min_num)
            }
        }
        return btn_str || ""
    },
    setData(){
        var self = this
        if(!self.cur_index) return;

        let cur_filt_index = self.filt_index_list[self.cur_index]
        if(cur_filt_index == null) return;

        self.vedio_data = this._model.getPublicVedioData(self.cur_index, cur_filt_index) || {}
        self.vedio_show_data = []
        if(self.cur_index == VedioConst.Tab_Index.Arena && this._model.getFiltLevelFlag()){
            let uplimit_config = Config.video_data.data_const["lev_interval_uplimit"]
            let lowlimit_config = Config.video_data.data_const["lev_interval_lowlimit"]
            let uplimit_val = 5
            if(uplimit_config){
                uplimit_val = uplimit_config.val || 5
            }
            let lowlimit_val = 5
            if(lowlimit_config){
                lowlimit_val = lowlimit_config.val || 5
            }
            let role_vo = RoleController.getInstance().getRoleVo()
            let vedioDataArr = self.vedio_data.vedio_data || []
            for(let i=0;i<vedioDataArr.length;++i){ 
                let v = self.vedio_data.vedio_data[i]
                let left_min_lv = v.a_lev - lowlimit_val
                let left_max_lv = v.a_lev + uplimit_val
                let right_min_lv = v.b_lev - lowlimit_val
                let right_max_lv = v.b_lev + uplimit_val
                if( (role_vo.lev >= left_min_lv && role_vo.lev <= left_max_lv) || (role_vo.lev >= right_min_lv && role_vo.lev <= right_max_lv) ){
                    self.vedio_show_data.push(v)
                }
            }
        }else{
            self.vedio_show_data = self.vedio_data.vedio_data || []
        }
        if(Utils.next(self.vedio_show_data) != null){
            // -- 滑到顶部还是保持位置仅更新数据
            if(self.scroll_to_top == true){
                // self.vedio_scrollview.reloadData()
                let extend
                if(self.cur_index == VedioConst.Tab_Index.Hot){
                    extend = {is_hot : true}
                }else{
                    extend = {}
                }
                self.vedio_scrollview.setData(self.vedio_show_data,this._onClickShareBtn.bind(this),extend)
            }else{
                self.vedio_scrollview.resetCurrentItems()
            }
            self.vedio_scrollview.setVisible(true)
            self.no_vedio_image.active = false; 
            self.scroll_to_top = false
        }else{
            self.vedio_scrollview.setVisible(false)
            // self.vedio_scrollview.reloadData()
            self.vedio_scrollview.setData(self.vedio_show_data,this._onClickShareBtn.bind(this))
            self.no_vedio_image.active = false; 
        }
    },
    _onClickShareBtn( world_pos, replay_id, share_num, srv_id, combat_type ){
        var self = this
        self.replay_id = replay_id
        self.share_num = share_num
        self.srv_id = srv_id
        self.combat_type = combat_type
        let node_pos = self.share_panel.convertToNodeSpaceAR(world_pos)
        if(node_pos){
            self.share_bg.setPosition(cc.v2(node_pos.x-60,node_pos.y+45))
            self.share_panel.active = true;
        }
    },
    // -- 点击筛选按钮
    _onClickFiltBtn(  ){
        var self = this
        if(self.cur_index){
            let vedio_config = Config.video_data.data_vedio[this.cur_index]
            if(!vedio_config) return;

            if(!self.filt_layout){
                self.filt_layout = new cc.Node()
                self.filt_layout.setContentSize(cc.size(676, 918))
                self.filt_layout.setAnchorPoint(0.5,0.5)
                self.filt_layout.setPosition(0 , 0)
                self.mainContainer.addChild(self.filt_layout)
                self.filt_layout.on("touchend",function(){
                    self._onClickFiltBtn()
                }) 
                self.filt_bg = Utils.createImage(self.filt_layout, null , 0, 0, cc.v2(1, 1), true, 1, true)
                self.filt_bg.node.setAnchorPoint(cc.v2(1, 1))
                this.loadRes(PathTool.getUIIconPath("common", "common_1092"),function(res){
                    self.filt_bg.spriteFrame = res
                }.bind(this))
                self.filt_layout.active = false;
            }
            let evt_list = vedio_config.evt || []
            for(let k=0;k<self.filt_btn_list.length;++k){
                let btn = self.filt_btn_list[k]
                btn.node.active = false
            }
            let space_y = 0
            let distance = 10
            let btn_size = cc.size(150, 50)
            let bg_size = cc.size(166, distance*2 + evt_list.length*(btn_size.height+space_y)-space_y)
            self.filt_bg.node.setContentSize(bg_size)
            let world_pos = self.filt_btn.convertToWorldSpaceAR(cc.v2(0, 0))
            let node_pos = self.filt_layout.convertToNodeSpaceAR(world_pos)
            self.filt_bg.node.setPosition(cc.v2(node_pos.x + 22, node_pos.y-22))
            for(let i=0;i<evt_list.length;++i){
                let v = evt_list[i]
                let btn = self.filt_btn_list[i]
                if(btn == null){
                    btn = {}
                    let img = Utils.createImage(self.filt_bg.node, null , 0, 0, cc.v2(0.5, 0), true, 1, true)
                    btn.node = img.node
                    btn.node.setContentSize(btn_size)
                    let button = btn.node.addComponent(cc.Button)
                    button.transition = cc.Button.Transition.SCALE
                    button.duration = 0.1;
                    button.zoomScale = 0.9;
                    this.loadRes(PathTool.getUIIconPath("common", "common_1046"),function(res){
                        img.spriteFrame = res
                    }.bind(this))
                    btn.node.on("click",function(){
                        this._onClickFiltItem(i)
                    }.bind(this))
                    let btn_str = new cc.Node().addComponent(cc.Label)
                    btn_str.horizontalAlign = cc.Label.HorizontalAlign.CENTER
                    btn_str.horizontalAlign = cc.Label.VerticalAlign.CENTER
                    btn_str.node.y = btn_size.height / 2
                    btn_str.fontSize = 22;
                    btn_str.lineHeight = 25;
                    btn_str.node.color = new cc.Color(113,40,4)
                    btn.node.addChild(btn_str.node)
                    self.filt_btn_list.push(btn)
                    btn.name = btn_str
                }
                btn.name.string = self.getFiltBtnNameByEvt(v)
                btn.node.active = true;
                let pos_y = distance + (i + 1)*(btn_size.height+space_y)
                btn.node.setPosition(cc.v2(-166/2, -pos_y))
            }

            self.filt_layout.active = !self.filt_layout.active
        }
    },
    _onClickFiltItem(index){
        var self = this
        if(!self.cur_index) return
        let vedio_config = Config.video_data.data_vedio[self.cur_index]
        if(vedio_config){
            self.filt_index_list[self.cur_index] = index
            let evt = vedio_config.evt[index]
            let btn_str = self.getFiltBtnNameByEvt(evt)
            self.filt_label.string = btn_str;
            self._onClickFiltBtn()
            if(self.cur_index != VedioConst.Tab_Index.Elite){
                self.vedio_data = {}
                self.scroll_to_top = true
                // -- 没请求过数据则请求数据，否则直接显示缓存数据
                if(!this._model.checkIsReqVedioDataByType(self.cur_index, index)){
                    this.ctrl.requestPublicVedioData(self.cur_index, index, 1, VedioConst.ReqVedioDataNum)
                }else{
                    self.setData()
                }
            }
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.tab_Btn){
            for(let i=0;i<this.tab_Btn.length;++i){
                if(this.tab_Btn){
                    this.tab_Btn[i].deleteMe()
                    this.tab_Btn[i] = null
                }
            }
        }
        this.tab_Btn = null;
        if(this.vedio_scrollview){
            this.vedio_scrollview.DeleteMe()
            this.vedio_scrollview = null
        }
        this.ctrl.openVedioMainWindow(false)
    },
})