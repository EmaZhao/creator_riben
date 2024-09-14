// --------------------------------------------------------------------
// @auth||: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-25 14:19:37
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview")
var BattleBuffListItem = require("battle_buff_list_item_panel")
var BattleController = require("battle_controller");
var Battle_buff_listWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_buff_list_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl =  BattleController.getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
    
        self.container = self.root_wnd.getChildByName("container")
    
        self.arrow_sp = self.container.getChildByName("Sprite_2")
        self.arrow_sp.active = false;
    
        let list_panel = self.container.getChildByName("list_panel")
        let scroll_view_size = list_panel.getContentSize()
        let setting = {
            item_class : BattleBuffListItem,      //-- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                    //-- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 0,                   //-- y方向的间隔
            item_width : 566,               //-- 单元的尺寸width
            item_height : 154,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            need_dynamic : true
        }
        this.buff_scrollview = new CommonScrollView();
        this.buff_scrollview.createScroll(list_panel,cc.v2(0,0),ScrollViewDir.vertical,ScrollViewStartPos.top, scroll_view_size, setting)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gc||e.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on('touchend',function(){
            Utils.playButtonSound(2);
            this.ctrl.openBattleBuffListView(false)
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        var self = this
        self.group = params.group
        self.partner_bid = params.partner_bid
        self.setData(params.data)
    },
    setData(data){
        var self = this
        self.data = data || []

        let temp_data = {}
        for(let i=0;i<this.data.length;++i){
            let b_info = this.data[i]
            for(let j=0;j<b_info.buff_infos.length;++j){
                let v = b_info.buff_infos[j]
                let buff_id = v.buff_id
                let remain_round = v.remain_round || b_info.remain_round
                let buff_config = Config.skill_data.data_get_buff[buff_id]
                if(buff_config){
                    if(temp_data[buff_id] == null){
                        temp_data[buff_id] = {res_id:b_info.res_id, num:0, name:buff_config.name, remain_round:remain_round, desc:buff_config.desc, buff_id : buff_id}
                    }
                    temp_data[buff_id].num = temp_data[buff_id].num + 1
                }
            }
        }
        let buff_data = []
        for(let k in temp_data){
            let v = Utils.deepCopy(temp_data[k])
            buff_data.push(v)
        }
        buff_data.sort(function(a,b){
            if(a.res_id == b.res_id){
                return a.buff_id - b.buff_id
            }else{
                return a.res_id - b.res_id
            }
        })
        for(let i=0;i<buff_data.length;++i){
            buff_data[i].index = i
        }
        this.arrow_sp.active = (buff_data.length>=5)
        this.buff_scrollview.setData(buff_data)
    },
    // -- 用于每回合更新数据时检测是否为选中的英雄buff列表
    checkIsChosedBuffList( group, partner_bid ){
        if(this.group == group && this.partner_bid == partner_bid){
            return true
        }
        return false
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.buff_scrollview){
            this.buff_scrollview.deleteMe()
            this.buff_scrollview = null;
        }
        this.ctrl.openBattleBuffListView(false)
    },
})