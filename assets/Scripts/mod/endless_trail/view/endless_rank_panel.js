// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     无尽试炼排行榜数据
// <br/>Create: 2019-03-07 10:59:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Endless_trailController = require("endless_trail_controller");
var CommonScrollView = require("common_scrollview");
var PlayerHead = require("playerhead");
var RankEvent = require("rank_event");
var RankConstant = require("rank_constant");
var RankController = require("rank_controller");
var RoleController = require("role_controller");
var EndlessRankItem = require("endless_rank_item_panel");



var Endless_rankPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_rank_panel");
        this.ctrl = Endless_trailController.getInstance();
        this.model = Endless_trailController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_init = true
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.scroll_container = this.root_wnd.getChildByName("scroll_container");
        this.empty_bg = this.scroll_container.getChildByName("empty_bg");
        this.empty_bg.active = false;

        this.loadRes(PathTool.getBigBg("bigbg_3"), (function(resObject){
            this.empty_bg.spriteFrame = resObject;
        }).bind(this));

        this.desc_label = this.empty_bg.getChildByName("desc_label").getComponent(cc.Label);
        this.desc_label.string = Utils.TI18N("暂无记录");

        
    
        var size = this.scroll_container.getContentSize();
        var setting = {
            item_class: EndlessRankItem,
            start_x: 4,
            space_x: 4,
            start_y: 0,
            space_y: -3,
            item_width: 614,
            item_height: 125,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(this.scroll_container, cc.v2(0,0), null, null, size, setting);

        var my_container = this.root_wnd.getChildByName("my_container");
        var my_rank_title = my_container.getChildByName("my_rank_title");

        this.rank_img = my_container.getChildByName("rank_img").getComponent(cc.Sprite);
        this.rank_img.node.active = false;
        this.rank_x = this.rank_img.node.x;
        this.rank_y = this.rank_img.node.y;

        this.rank_txt_nd = my_container.getChildByName("rank_txt");
        this.rank_txt_ct = this.rank_txt_nd.getComponent("CusRichText");

        this.role_name = my_container.getChildByName("role_name").getComponent(cc.Label);
        this.role_power = my_container.getChildByName("role_power").getComponent(cc.Label);
        this.no_rank = my_container.getChildByName("no_rank").getComponent(cc.Label);
        this.no_rank.string = Utils.TI18N("未上榜");
        this.no_rank.node.active = false;
        this.my_score_info = Utils.createRichLabel(20, new cc.Color(0xff,0xde,0x5e, 0xff), cc.v2(0.5, 0.5), cc.v2(500, 65),30,300);
        my_container.addChild(this.my_score_info.node);

        this.role_head = new PlayerHead();
        this.role_head.setPosition(150, 65);
        this.role_head.setScale(0.95);
        this.role_head.setLev(99)
        this.role_head.setParent(my_container);
        this.role_head.show();

        this.my_container = my_container;

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

        this.addGlobalEvent(RankEvent.RankEvent_Get_Rank_data,function(data){
            if(data.type == RankConstant.RankType.endless){
                this.updateRankList(data);
            }
        }.bind(this));

    },

    setNodeVisible:function(status){
        if(this.root_wnd){
            this.root_wnd.active = status;
        }
    },

    addToParent:function(){
        // 窗体打开只请求一次，不是标签显示
        if(this.is_init == true){
            RankController.getInstance().send_12900(RankConstant.RankType.endless);
            this.is_init = false
        }
    },

    updateRankList:function(data){
        var role_vo = RoleController.getInstance().getRoleVo();
        if(data && role_vo){
            this.role_name.string = role_vo.name;
            this.role_power.string = role_vo.power;
            if(data.my_idx>=0 && data.my_idx <= 3){
                if(this.rank_num != null){
                    this.setNodeVisible(false);
                }
                if(data.my_idx == 0){
                    this.rank_img.node.active = false;
                    this.no_rank.node.active = true;
                }else{
                    this.no_rank.node.active = false;
                    var res_id = PathTool.getCommonIcomPath(cc.js.formatStr("common_200%s", data.my_idx));
                    if(this.rank_res_id != res_id){
                        this.rank_res_id  = res_id;
                        this.loadRes(res_id, (function(resObject){
                            this.rank_img.spriteFrame = resObject;
                        }).bind(this));
                    }
                    this.rank_img.node.active = true;
                }
            }else{
                this.rank_txt_nd.active = true;
                this.rank_txt_ct.setNum(data.my_idx);
                this.rank_img.node.active = false;
            }
        }

        var msg = cc.js.formatStr(
            "%s<color=#ffde5e fontsize=22>%s</color>",
            "最大クリア数：",
            data.my_val1 || 0
        )
        this.my_score_info.string = msg;
        this.role_head.setHeadRes(role_vo.face_id)
        this.role_head.setLev(role_vo.lev);
        var avatar_bid = role_vo.avatar_base_id;
        var vo = Config.avatar_data.data_avatar[avatar_bid];
        if(vo){
            var res_id = vo.res_id || 0;
            var res = PathTool.getHeadcircle(res_id)
            // this.role_head.showBg(res, null, false, vo.offy);
            this.role_head.setFrameRes(res);
        }
        //  创建排行榜。。。。。这里做点击回到用于记录更新点赞数量
        var click_callback = function(item){
            this.worshipOtherRole(item);
        }.bind(this);
        if(data.rank_list != null && Utils.next(data.rank_list) !=null){
            this.scroll_view.setData(data.rank_list, click_callback)
            this.empty_bg.active = false;
        }else{
            this.empty_bg.active = true;
        }
    },

    // 主要用于点击点赞按钮，在这做记录等返回成功之后做按钮的更新处理
    worshipOtherRole:function(item){
        if(item.data!=null){
            this.select_item = item;
        }
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.addToParent()
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        if(this.role_head){
            this.role_head.deleteMe();
        }
        this.role_head = null;
    },
})