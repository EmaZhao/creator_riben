// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     星命塔解锁
// <br/>Create: 2019-02-27 15:26:22
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Star_tower_get_Window = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_get");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tower = 0;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.active = true;
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_container");
        this.ok_btn = this.main_panel.getChildByName("ok_btn"); 
        var ok_btn_label = this.ok_btn.getChildByName("Label").getComponent(cc.Label);
        ok_btn_label.string = Utils.TI18N("知道了");

        this.createDesc();
        this.updateDesc();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.ok_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openGetWindow(false);
        }, this)

    },

    createDesc:function(){
        var size = this.main_panel.getContentSize();
        var color1 = gdata("color_data", "data_color4", 1);
        var color2 = gdata("color_data", "data_color4", 9);
        this.star_name = Utils.createLabel(26,new cc.Color(139,71,21,255),null,this.main_panel.width/2,385,"",this.main_panel,2,cc.v2(0.5,0));
        
        this.star_desc = Utils.createRichLabel(26,new cc.Color(100,50,35,255),cc.v2(0.5,1),cc.v2(this.main_panel.width/2, 360),30,500);
        this.main_panel.addChild(this.star_desc.node);
    },
    
    updateDesc:function(){
        if(this.tower == 0)return;
        var config = Config.star_tower_data.data_award_list;
        var data = null;
        for(var i in config){
            if(config[i].lev && config[i].lev == this.tower){
                if(config[i].extend && config[i].extend[0]){
                    var item_config = gdata("item_data","data_get_data",config[i].extend[0]);
                    data = item_config;
                }
            }
        }
        if(!data)return;
        if(!this.head_icon){
            this.head_icon = ItemsPool.getInstance().getItem("backpack_item");
            this.head_icon.setParent(this.head_icon);//this.main_panel.addChild(this.head_icon, 1000);
            this.head_icon.initConfig(false, 1.2, false, true);
            this.head_icon.show();

            
            // var bg = this.head_icon.getBackground();
            // bg.active = false;
            this.head_icon.setData(data);
        }
        var desc = data.desc || "";
        this.star_desc.string = desc;
        if(data.eqm_set){
            var name = Config.star_data.data_star_name[data.eqm_set] || "";
            this.star_name.string = name;
        }
    },
    

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.handleEffect(true);
        this.tower = data;
    },

    handleEffect:function(status){
        if(status == false){

        }else{
            
        }
    //     if status == false then
	// 	if self.play_effect then
	// 		self.play_effect:clearTracks()
	// 		self.play_effect:removeFromParent()
	// 		self.play_effect = nil
	// 	end
	// else
    //     if not tolua.isnull(self.main_panel) and self.play_effect == nil then
    //         local size = self.main_panel:getContentSize() 
    //         self.play_effect = createEffectSpine(Config.EffectData.data_effect_info[145], cc.p(size.width*0.5, size.height*0.5+10), cc.p(0.5, 0.5), true, PlayerAction.action)
    //         self.main_panel:addChild(self.play_effect, 1)
    //     end
	// end
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openGetWindow(false);
        this.handleEffect(false);
        if(this.head_icon){
            this.head_icon.onDelete();
            this.head_icon = null;
        }

    },
})