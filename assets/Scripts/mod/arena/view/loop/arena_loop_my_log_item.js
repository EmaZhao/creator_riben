// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-19 09:46:41
// --------------------------------------------------------------------
var PathTool   = require("pathtool");
var PlayerHead = require("playerhead");
var RoleController      = require("role_controller");
var TimeTool = require("timetool");

var Arena_loop_my_log_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_my_log_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.score_iocn = Config.arena_data.data_const.score_iocn;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.left_role_nd       = this.seekChild("left_role");
        this.right_role_nd      = this.seekChild("right_role");
        
        this.down_arrow_nd      = this.seekChild("down_arrow");
        this.up_arrow_nd        = this.seekChild("up_arrow");
        this.score_item_sp      = this.seekChild("score_item", cc.Sprite);
        this.fight_result_nd    = this.seekChild("fight_result");
        this.fight_result_lb    = this.seekChild("fight_result", cc.Label);
        // this.result_nd       = this.seekChild("result");
        this.arrow_con_nd       = this.seekChild("arrow_con");
        this.check_fight_btn_nd = this.seekChild("check_fight_btn");
        
        this.right_name_lb      = this.seekChild("right_name", cc.Label);
        this.left_name_lb       = this.seekChild("left_name", cc.Label);
        
        this.fight_type_lb      = this.seekChild("fight_type", cc.Label);
        this.time_lb            = this.seekChild("time", cc.Label);
        
        this.success_img_nd     = this.seekChild("success_img");
        this.faild_img_nd       = this.seekChild("faild_img");

        this.left_head = new PlayerHead();
        this.left_head.setParent(this.left_role_nd);
        this.left_head.show();

        this.right_head = new PlayerHead();
        this.right_head.setParent(this.right_role_nd);
        this.right_head.show();
        
        this.check_fight_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickFightBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.left_head){
            this.left_head.deleteMe()
            this.left_head = null;
        }
        if(this.right_head){
            this.right_head.deleteMe()
            this.right_head = null
        }
    },

    setData: function(data) {
        this.data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        if (!this.data) return;
        this.left_head.setHeadRes(this.role_vo.face_id);
        this.right_head.setHeadRes(this.data.face);

        this.left_name_lb.string = this.role_vo.name;
        this.right_name_lb.string = this.data.name;

        if (this.data.ret === 1) {
            this.success_img_nd.active = true;
            this.faild_img_nd.active = false;
        } else {
            this.success_img_nd.active = false;
            this.faild_img_nd.active = true;            
        }

        var fight_str = "";
        if (this.data.type === 1) {
            if (this.data.ret === 1) {
                fight_str = Utils.TI18N("进攻成功");
            } else {
                fight_str = Utils.TI18N("进攻失败");
            }
        } else {
            if (this.data.ret === 1) {
                fight_str = Utils.TI18N("防守成功");
            } else {
                fight_str = Utils.TI18N("防守失败");                
            }
        }
        this.fight_type_lb.string = fight_str;

        this.time_lb.string = TimeTool.getYMDHMS(this.data.time);

        var result_str = "";
        if (this.score_iocn) {
            if (this.data.score === 0) {
                result_str = Utils.TI18N("不变");
                this.score_item_sp.spriteFrame = null;
                this.arrow_con_nd.active = false;
            } else {
                if (this.data.ret == 1) {
                    this.up_arrow_nd.active = true;
                    this.down_arrow_nd.active = false;
                    this.fight_result_nd.color = new cc.Color().fromHEX('#52ff6f');                    
                    result_str = "+" + this.data.score
                } else {
                    this.up_arrow_nd.active = false;
                    this.down_arrow_nd.active = true;                    
                    this.fight_result_nd.color = new cc.Color().fromHEX('#ff5670');
                    // result_str = "-" + this.data.score
                    result_str = this.data.score;                    
                }
            }
            this.fight_result_lb.string = result_str;

            var item_path = PathTool.getIconPath("item", this.score_iocn.val);
            this.loadRes(item_path, function(item_sf) {
                this.score_item_sp.spriteFrame = item_sf;
            }.bind(this));
        } else {
            this.score_item_sp.spriteFrame = null;
            this.arrow_con_nd.active = false;
        }

    },

    onClickFightBtn: function() {
        if (this.data) {        
            var BattleController = require("battle_controller");
            BattleController.getInstance().csRecordBattle(this.data.replay_id);
        }
    },
})