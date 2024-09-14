var PathTool = require("pathtool");
var PartnerCalculate = require("partner_calculate");
var ExhibitionItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_camp_item");

    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        var self = this;
        self.camp_icons = [];
	    self.attr_label = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        let container = self.root_wnd.getChildByName("main_container");
        self.cur_bg = container.getChildByName("cur_bg");
        self.cur_bg.active = false;
        self.form_icon = container.getChildByName("form_icon");
        this.btn = self.form_icon.getComponent(cc.Button)
        this.name_lb = container.getChildByName("name").getComponent(cc.Label)
        self.sp_activate = container.getChildByName("sp_activate")
        self.sp_activate.active = false
        self.attr_label = container.getChildByName("attr_label").getComponent(cc.RichText)
        this.line = container.getChildByName("line")
        if(this.data){
            this.setData(this.data);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setData( data ){
        this.data = data;
        cc.log(data)
        if(data && this.root_wnd){
            var self = this;
            if(data.is_activate == true){
                self.cur_bg.active = true;
                this.btn.interactable = true;
                this.btn.enableAutoGrayEffect = false;
                this.sp_activate.active = true;
            }else{
                self.cur_bg.active = false;
                this.btn.interactable = false;
                this.btn.enableAutoGrayEffect = true;
                this.sp_activate.active = false;
            }

            let form_res = PathTool.getUIIconPath("campicon","campicon_"+data.icon);
            this.loadRes(form_res,function(res){
                self.form_icon.getComponent(cc.Sprite).spriteFrame = res;
            }.bind(this))
            this.name_lb.string = data.name;
            this.line.active = data.index != Config.combat_halo_data.data_halo_show_length-1
            // -- 属性
            let desc_str = ""
            let index_flag = 0
            for(let i in data.attr_data){
                let v = data.attr_data[i]
                if(v.is_activate){
                    index_flag = i
                }
            }
            let len = Utils.getArrLen(data.attr_data);
            let index = 0
            for(let i in data.attr_data){
                let v = data.attr_data[i]
                let str = v.desc
                for(let j=0;j<v.attrs.length;++j){
                    let attr = v.attrs[j]
                    let attr_key = attr[0]
                    let attr_val = attr[1]/1000
                    let attr_name = Config.attr_data.data_key_to_name[attr_key]
                    if(attr_name){
                        let is_per = PartnerCalculate.isShowPerByStr(attr_key)
                        if(is_per == true){
                            attr_val = (attr_val*1000*100/1000)+"%"
                        }
                        if(i == index_flag){
                            str = str + cc.js.formatStr("    %s<color=#4ccc0c>+%s</color>", attr_name, attr_val)
                        }else{
                            str = str + cc.js.formatStr("    %s+%s", attr_name, attr_val)
                        }
                    }
                }
                if(i == index_flag){
                    str = cc.js.formatStr("<color=#a55f14>%s</color>", str)
                }else{
                    str = cc.js.formatStr("<color=#3c3c3c>%s</color>", str)
                }
                index++
                if(len != index){
                    desc_str = desc_str + str + "\n"
                }else{
                    desc_str = desc_str + str
                }
               
            }
            this.attr_label.string = desc_str
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        
    },
})