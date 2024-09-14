var PathTool = require("pathtool");
var ActionConst = require("action_const")
var ExhibitionItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_grow_fund_Item");

    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        var self = this;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        self.title_bg = self.root_wnd.getChildByName("title_bg");
		self.title_lb = self.root_wnd.getChildByName("title").getComponent(cc.Label);

		self.get_btn = self.root_wnd.getChildByName("get_btn").getComponent(cc.Button);
        self.get_btn_lb = self.get_btn.node.getChildByName("label").getComponent(cc.Label);
        self.get_btn_lb_line = self.get_btn.node.getChildByName("label").getComponent(cc.LabelOutline)
		self.get_btn_lb.string = Utils.TI18N("受取");

		self.item_icon_1 = self.root_wnd.getChildByName("item_icon_1").getComponent(cc.Sprite);
		self.item_icon_2 = self.root_wnd.getChildByName("item_icon_2").getComponent(cc.Sprite);
		self.item_value_1 = self.root_wnd.getChildByName("item_value_1").getComponent(cc.Label);
		self.item_value_2 = self.root_wnd.getChildByName("item_value_2").getComponent(cc.Label);

        self.pass_icon = self.root_wnd.getChildByName("pass_icon");
        if(self.data){
            self.setData(self.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {
        this.get_btn.node.on('click',function(){
            Utils.playButtonSound(1)
            if (this.call_back && this.data){
				this.call_back(this.data);
            }
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData( data ){
        var self = this;
        self.data = data;
        if (data && self.root_wnd){
            self.title_lb.string = data.aim_str || "";
            self.get_btn.node.active = data.status != ActionConst.ActionStatus.completed
            self.pass_icon.active = (data.status == ActionConst.ActionStatus.completed)
            if (data.status == ActionConst.ActionStatus.un_finish){ 
                self.get_btn.interactable = false;
                self.get_btn.enableAutoGrayEffect = true;
                self.get_btn_lb.string = Utils.TI18N("未达成");
                self.get_btn_lb_line.enabled = false;
                self.title_bg.opacity = 255;
            }else if(data.status == ActionConst.ActionStatus.finish){
                self.get_btn.interactable = true;
                self.get_btn.enableAutoGrayEffect = false;
                self.get_btn_lb_line.enabled = true
                self.get_btn_lb.string = Utils.TI18N("受取");
                self.title_bg.opacity = 255;
            }else if(data.status == ActionConst.ActionStatus.completed){
                self.title_bg.opacity = 128;
            }

            if (data.item_list){
                for (let i=0;i<data.item_list.length;++i){
                    let v = data.item_list[i];
                    let index = i+1;
                    if (self["item_icon_"+index]){
                        this.loadRes(PathTool.getItemRes(v.bid),function(res){
                            self["item_icon_"+index].spriteFrame = res;
                        }.bind(this))
                    }
                    if (self["item_value_"+index]){
                        self["item_value_"+index].string = "X"+(v.num || 0) ;
                    }
                }
            }
        }
    },
    addCallBack(callback){
        this.call_back = callback;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        
    },
})