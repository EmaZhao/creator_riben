/*-----------------------------------------------------+
 * GM命令处理类相关处理
 * @author whjing2012@163.com
 +-----------------------------------------------------*/
 var LoaderManager = require("loadermanager");
 var PathTool = require("pathtool");
 var StringUtil = require("string_util");

var GmCmd = {
    getInstance : function(){
        return this;
    },

    // 自定义gm命令 
    cli_cmds : [
        {name:"关闭GM", func:function(){
            this.show();
        }}
        ,{name:"net_ping", func:function(){
            if(this.ping_timer_id){
                gcore.Timer.del(this.ping_timer_id);
                this.ping_timer_id = undefined;
                self.label.string = "";
            }else{
                this.ping_timer_id = gcore.Timer.set((function(){
                    gcore.SmartSocket.send(1198, {time : this.get_ping_time()});
                }).bind(this), 1000, -1);
            }
        }}
        ,{name:"断网", func:function(){
            gcore.SmartSocket.close();
        }}
        ,{name:"FPS", func:function(){
            cc.debug.setDisplayStats(cc.game.config.showFPS = !cc.game.config.showFPS);
        }}
        ,{name:"SOCKET", func:function(){
            window.SOCKET_LOG = window.SOCKET_LOG == false;
        }}
        ,{name:"UI调试", func:function(){
            this.openDebugUI();
        }}
        ,{name:"系统信息", func:function(){
            cc.sys.dump();
        }}
        ,{name:"在线福利", func:function(){
            require("onlinegift_controller").getInstance().openOnlineGiftView(true);
        }}
    ],

    // 处理输入信息
    handleInput : function(msg){
        if(msg == ''){
            return;
        }else if(msg.charAt(0) == "@"){
            // eval("Log.info("+msg.substr(1)+");");
            return;
        }else if(msg.charAt(0) == "."){
            var keys = msg.substr(1).split(".");
            var o = window;
            for(let i=0,n=keys.length; i<n; i++){
                o = o[keys[i]];
            }
            Log.info(o);
            return;
        }
        this.saveMsg(msg);
        gcore.SmartSocket.send(10399, {msg:msg});
    },

    get_ping_time : function(){
        return Date.now() % 10000000;
    },

    // 显示gm命令
    show : function(){
        if(OUT_NET == false && gcore.SysEnv.get("password") == "sszgh5gy"){
            SHOW_GM = true;
        }
        if(SHOW_GM != true){
            return;
        }
        if(this.root){
            this.root.active = (this.root.active == false);
        }else{
            LoaderManager.getInstance().loadRes(PathTool.getPrefabPath("gm", "gm_panel"), (function(res_object){
                this.root = res_object;
                this.root.gm = true;

                var gm_btn = this.root.getChildByName("gm_btn");
                this.input = this.root.getChildByName("editbox").getComponent(cc.EditBox);
                this.input.maxLength = 300;
                this.label = this.root.getChildByName("msg").getComponent(cc.RichText);
                this.root.setPosition(-SCREEN_WIDTH*0.5, -SCREEN_HEIGHT*0.5)
                ViewManager.getInstance().addToSceneNode(this.root, SCENE_TAG.loading);
                gm_btn.on(cc.Node.EventType.TOUCH_END, (function(event){
                    if(this.move){
                        this.move = false;
                        return;
                    }

                    if(this.debug_ui && this.debug_ui.active){
                        this.debug_ui.active = false;
                        this.setDebugUIObjBorder(this.debug_ui_obj1, false);
                    }
                    this.showLayer();
                }).bind(this));
                gm_btn.on(cc.Node.EventType.TOUCH_MOVE, function(event){
                    var pos = event.getTouches()[0].getDelta();
                    this.root.x = this.root.x + pos.x;
                    this.root.y = this.root.y + pos.y;
                    if (pos.x !== 0 && pos.y !== 0) {
                        this.move = true;
                    }
                }, this);
                this.input.node.on('editing-did-ended', function(){
                    this.handleInput(this.input.string);
                }, this);
                this.cmds = gcore.SysEnv.getObject("gm_cmds").cmds || [];
                if(this.cmds.length > 0){
                    this.input.string = this.cmds[this.cmds.length - 1];
                }
                gcore.SmartSocket.bindCmd(10391, this.on10391.bind(this));
                gcore.SmartSocket.bindCmd(10399, this.on10399.bind(this));
                gcore.SmartSocket.bindCmd(1198, this.on1198.bind(this));
                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); 
                cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this); 

                this.button = this.root.getChildByName("Button")
            }).bind(this));
        }
    },

    // 显示gm面板
    showLayer : function(){
        if(this.layer){
            this.layer.active = this.layer.active == false;
            return;
        }else{
            this.layer = this.root.getChildByName("layer");
            this.layer.active = true;
            var btn_list = [{name:"基础功能", list:this.cli_cmds}, {name:"最近使用"}];
            if(Config && Config.gm_data){
                for(var k in Config.gm_data.data_list){
                    var v = Config.gm_data.data_list[k];
                    if(v.is_show == 1){
                        if(v.list.length == 0){
                            btn_list.push({name:v.tips, msg:v.info});
                        }else{
                            btn_list.push({name:v.tips, list:v.list});
                        }
                    }
                }
            }
            this.showGmList(true, btn_list);
        }
    },

    // 显示下级gm面板
    showGmList : function(btn, btn_list){
        if(this.sub_layer && this.sub_layer.active && btn != true && this.sub_layer != btn.layer){
            this.sub_layer.active = false;
        }
        if(btn == true){
            for(var i=0; i<btn_list.length; i++){
                var v = btn_list[i];
                this.createGmButton(i, this.layer, v)
            }
        }else if(btn.layer){
            if(btn.layer.lately){
                btn.layer.destroy();
                btn.layer = null;
                this.sub_layer = null;
            }else{
                btn.layer.active = btn.layer.active == false;
                this.sub_layer = btn.layer;
            }
        }else{
            btn.layer = new cc.Node();
            this.sub_layer = btn.layer;
            this.layer.addChild(btn.layer);
            btn.layer.setAnchorPoint(0, 1);
            btn.layer.setPosition(0, btn.y-25);
            if(!btn_list){
                btn.layer.lately = true;
                btn_list = [];
                for(var i=0; i<this.cmds.length; i++){
                    btn_list.push({name:this.cmds[i], msg:this.cmds[i]});
                }
            }
            for(var i=0; i<btn_list.length; i++){
                var v = btn_list[i];
                this.createGmButton(i, btn.layer, v, 'common_1018');
            }
        }
    },

    // 创建一个gm按钮
    createGmButton : function(i, layer, v, res){
        if(typeof v == "number"){
            v = Config.gm_data.data_list[v];
            if(v.list.length == 0){
                v = {name:v.tips, msg:v.info};
            }else{
                v = {name:v.tips, list:v.list};
            }
        }
        var btn = this.createButton(v.name, v.func || function(event){
            if(v.msg){
                gcore.SmartSocket.send(10399, {msg:v.msg});
            }else{
                this.showGmList(event.target, v.list);
            }
        }, res);
        btn.setPosition(i % 4 * 135 + 70, -(parseInt(i / 4) * 65 + 40));
        layer.addChild(btn);
    },

    // 键盘按下事件
    onKeyDown : function(event){
        this.keyCode = event.keyCode;
        var func = (function(time){
            if(!this.keyCode || !this.root.active) return;
            switch(this.keyCode) {
                case cc.macro.KEY.up:
                    if(this.cmds.length > 1){
                        this.cmds.unshift(this.cmds.pop());
                        this.saveMsg(this.cmds.pop());
                        time = time || 1500;
                    }
                    break;
                case cc.macro.KEY.down:
                    if(this.cmds.length > 0){
                        this.saveMsg(this.cmds[0]);
                        time = time || 600;
                    }
                    break;
                case cc.macro.KEY.enter:
                    this.handleInput(this.input.string);
                    time = null;
                    break;
                case cc.macro.KEY.a :
                    this.moveDebugUIObjPos(-1, 0);
                    time = time || 100;
                    break;
                case cc.macro.KEY.d :
                    this.moveDebugUIObjPos(1, 0);
                    time = time || 100;
                    break;
                case cc.macro.KEY.w :
                    this.moveDebugUIObjPos(0, 1);
                    time = time || 100;
                    break;
                case cc.macro.KEY.s :
                    this.moveDebugUIObjPos(0, -1);
                    time = time || 100;
                    break;
                default:
                    time = null;
                    break;
            }
            if(time){
                gcore.Timer.set(func, time, 1, "gm_cmd_key_timer");
            } 
        }).bind(this);
        func(2000);
    },

    // 键盘释放事件
    onKeyUp : function(event){
        if(this.keyCode == event.keyCode){
            this.keyCode = null;
        }
    },

    // 协议返回处理
    on10391 : function(data){

        cc.log("DDDDDDDDDDDDDDDDDDD");
        cc.log(data);

        var ret = eval(data.data);
        if(data.type == 1){
            if(typeof ret == 'object'){
                ret = JSON.stringify(ret);
            }else{
                ret = ret + '';
            }
            gcore.SmartSocket.send(10391, {msg:ret});
        }
    },

    // gm命令结果 
    on10399 : function(data){
        if(data.msg.length < 500){
            message(data.msg);
        }
        Log.info(data.msg.split("\n"));
    },

    on1198 : function(data){
        if(this.ping_timer_id){
            this.label.string = "time:<color=#00ff00>" + (this.get_ping_time() - data.time) + "</color>,msg_len:<color=#00ff00>" + gcore.SmartSocket.msg_list.length + "</color>";
        }
    },

    // 保存信息
    saveMsg : function(msg){
        this.input.string = msg;
        for(var i = this.cmds.length - 1; i >= 0; i--){
            if(this.cmds[i] == msg){
                this.cmds.splice(i, 1);
            }
        }
        this.cmds.push(msg);
        if(this.cmds.length > 20){
            this.cmds.shift();
        }
        gcore.SysEnv.setObject("gm_cmds", {cmds:this.cmds});
    },

    // 创建一个gm按钮
    createButton : function(text, func, res){
        // var gm_btn = new cc.Node();
        // gm_btn.setPosition(0, 0);
        // var gm_buttom = gm_btn.addComponent(cc.Button);
        // gm_buttom.target = gm_btn;
        // gm_buttom.transition = cc.Button.Transition.SCALE;
        // gm_buttom.duration = 0.1;
        // gm_buttom.zoomScale = 1.1;
        // var gm_sprite = gm_btn.addComponent(cc.Sprite);
        // var frame = COMMON_ATLAS.getSpriteFrame(res || 'common_1017');
        // gm_sprite.spriteFrame = frame;
        // gm_sprite.type = cc.Sprite.Type.SLICED;
        // var gm_label = this.createLabel(text, new cc.Color(0, 0, 0xff));
        // gm_btn.addChild(gm_label);
        // gm_btn.on(cc.Node.EventType.TOUCH_END, func, this);

        var gm_btn = cc.instantiate(this.button)
        gm_btn.active = true
        if(res){
            // loadermanager
            var common_res_path = PathTool.getCommonIcomPath(res);
            LoaderManager.getInstance().loadRes(common_res_path, function(sf_obj){
                gm_btn.getComponent(cc.Sprite).spriteFrame = sf_obj;
            }.bind(this))
        }
        var label = gm_btn.getChildByName("Label").getComponent(cc.Label)
        label.string = text
        gm_btn.on(cc.Node.EventType.TOUCH_END, func, this);
        return gm_btn;
    },

    // 创建一个Label
    createLabel : function(text, color, fontSize){
        var node = new cc.Node();
        var label = node.addComponent(cc.Label);
        node.obj = label;
        label.string = text || '';
        label.fontSize = fontSize || 24;
        node.color = color || new cc.Color(255, 0, 0);
        return node;
    },

    // DebugUi
    openDebugUI : function(){
        this.layer.active = false;
        if(this.debug_ui){
            this.debug_ui.active = this.debug_ui.active == false;
            this.setDebugUIObjBorder(this.debug_ui_obj1, false);
        }else{
            this.debug_ui = this.root.getChildByName("debug_ui");
            this.debug_ui.active = true;
            var o = {};
            o.touch = this.debug_ui.getChildByName("touch_node");
            o.name = this.debug_ui.getChildByName("name").getChildByName("msg").getComponent(cc.Label);
            o.type = this.debug_ui.getChildByName("type").getChildByName("msg").getComponent(cc.Label);
            o.node_w = this.debug_ui.getChildByName("node_w").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_h = this.debug_ui.getChildByName("node_h").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_sx = this.debug_ui.getChildByName("node_sx").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_sy = this.debug_ui.getChildByName("node_sy").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_ax = this.debug_ui.getChildByName("node_ax").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_ay = this.debug_ui.getChildByName("node_ay").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_wx = this.debug_ui.getChildByName("node_wx").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_wy = this.debug_ui.getChildByName("node_wy").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_x = this.debug_ui.getChildByName("node_x").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_y = this.debug_ui.getChildByName("node_y").getChildByName("editbox").getComponent(cc.EditBox);
            o.node_c_r = this.debug_ui.getChildByName("node_c").getChildByName("editbox_r").getComponent(cc.EditBox);
            o.node_c_g = this.debug_ui.getChildByName("node_c").getChildByName("editbox_g").getComponent(cc.EditBox);
            o.node_c_b = this.debug_ui.getChildByName("node_c").getChildByName("editbox_b").getComponent(cc.EditBox);
            o.node_c_a = this.debug_ui.getChildByName("node_c").getChildByName("editbox_a").getComponent(cc.EditBox);
            o.show = this.debug_ui.getChildByName("show").getComponent(cc.Toggle);
            o.child_btn = this.debug_ui.getChildByName("child_btn");
            o.parent_btn = this.debug_ui.getChildByName("parent_btn");
            o.scroll_content = this.debug_ui.getChildByName("scrollview").getComponent(cc.ScrollView).content;
            o.scroll_item = o.scroll_content.getChildByName("item");
            this.debug_ui_o = o;
            this.setDebugUIEvt(o);
        }
        if(this.debug_ui.active){
            this.setDebugUIObj(this.input);
        }
    },

    setDebugUIEvt : function(o){
        // ViewManager.getInstance().getSceneNode(SCENE_TAG.loading).on(cc.Node.EventType.TOUCH_END, function(event){
        o.touch.on(cc.Node.EventType.TOUCH_END, function (event){
            this.selectDebugUIObj(event.getTouches()[0].getLocation());
        }, this);
        o.show.node.on(cc.Node.EventType.TOUCH_END, function (event){
            this.debug_ui_obj1.active = !this.debug_ui_obj1.active;
        }, this);
        o.parent_btn.on(cc.Node.EventType.TOUCH_END, function(event){
            this.setDebugUIObj(this.debug_ui_obj.node || this.debug_ui_obj.parent);
        }, this);
        o.node_w.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.width = Number(o.node_w.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_h.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.height = Number(o.node_h.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_sx.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.scaleX = Number(o.node_sx.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_sy.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.scaleY = Number(o.node_sy.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_ax.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.setAnchorPoint(Number(o.node_ax.string), Number(o.node_ay.string));
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_ay.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.setAnchorPoint(Number(o.node_ax.string), Number(o.node_ay.string));
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_x.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.x = Number(o.node_x.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_y.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.y = Number(o.node_y.string);
            this.setDebugUIObjBorder(this.debug_ui_obj1, true);
        }, this);
        o.node_c_a.node.on('editing-did-ended', function(event){
            this.debug_ui_obj1.opacity = Number(o.node_c_a.string);
        }, this);
        o.node_c_r.node.on('editing-did-ended', function(event){
            this.setDebugUIObjColor(o);
        }, this);
        o.node_c_g.node.on('editing-did-ended', function(event){
            this.setDebugUIObjColor(o);
        }, this);
        o.node_c_b.node.on('editing-did-ended', function(event){
            this.setDebugUIObjColor(o);
        }, this);
    },

    moveDebugUIObjPos : function(x, y){
        if(!this.debug_ui || !this.debug_ui.active || !this.debug_ui_obj1) return;
        this.debug_ui_obj1.setPosition(this.debug_ui_obj1.x + x, this.debug_ui_obj1.y + y);
        this.setDebugUIObj(this.debug_ui_obj1);
    },

    setDebugUIObjColor : function(o){
        if(this.debug_ui_obj.fontColor){
            this.debug_ui_obj.fontColor = new cc.Color(Number(o.node_c_r.string), Number(o.node_c_g.string), Number(o.node_c_b.string));
        }else if(this.debug_ui_obj1.color){
            this.debug_ui_obj.color = new cc.Color(Number(o.node_c_r.string), Number(o.node_c_g.string), Number(o.node_c_b.string));
        }
    },

    setDebugUIObj : function(obj){
        if(!obj) return;
        // Log.info("====>>>", obj.w_zIndex);
        this.setDebugUIObjBorder(this.debug_ui_obj1, false);
        if(this.debug_ui_obj != obj){
            this.updateChildNodes(obj);
        }
        this.debug_ui_obj = obj;
        // Log.info(obj, obj.toString(), obj.__classname__, obj.getClassName);
        var o = this.debug_ui_o;
        var obj1 = obj.node || obj;
        this.debug_ui_obj1 = obj1;
        var c = obj.fontColor || obj1.color || {};
        // Log.info(obj1.anchorX, obj1.anchorY, obj1);
        o.show.isChecked = obj1.active;
        o.name.string = obj1._name || obj.name || "";
        o.type.string = cc.js.getClassName(obj) || "";
        o.node_w.string = obj1.width || 0;
        o.node_h.string = obj1.height || 0;
        o.node_sx.string = obj1.scaleX || 0;
        o.node_sy.string = obj1.scaleY || 0;
        o.node_ax.string = obj1.anchorX;
        o.node_ay.string = obj1.anchorY;
        var pos = this.debug_ui_obj1.convertToWorldSpace(cc.v2(0,0));
        o.node_wx.string = pos.x || 0;
        o.node_wy.string = pos.y || 0;
        o.node_x.string = obj1.x || 0;
        o.node_y.string = obj1.y || 0;
        o.node_c_r.string = c.getR && c.getR() || 0;
        o.node_c_g.string = c.getG && c.getG() || 0;
        o.node_c_b.string = c.getB && c.getB() || 0;
        o.node_c_a.string = obj1.opacity || 0;
        this.setDebugUIObjBorder(obj1, true);
    },

    updateChildNodes : function(obj){
        let items = this.debug_ui_items || [];
        this.debug_ui_items = items;
        for(let i=0, n=items.length; i<n; i++){
            items[i].active = false;
        }
        var y = 0;
        var id = 0;
        //Log.info(obj._components, obj.children);
        var nodes = obj._components || [];
        for(let i=0, n=nodes.length; i<n; i++){
            if(nodes[i].border) continue;
            y = this.createDebugUIItem("c", id++, nodes[i], y);
        }
        nodes = obj.children || [];
        for(let i=0, n=nodes.length; i<n; i++){
            if(nodes[i].border) continue;
            y = this.createDebugUIItem("n", id++, nodes[i], y);
        }
        this.debug_ui_o.scroll_content.height = -y
    },

    createDebugUIItem : function(type, i, obj, y){
        let item = this.debug_ui_items[i];
        if(!item){
            item = cc.instantiate(this.debug_ui_o.scroll_item);
            item.on(cc.Node.EventType.TOUCH_END, function(event){
                this.setDebugUIObj(item.o);
            }, this);
            this.debug_ui_o.scroll_content.addChild(item);
        }
        this.debug_ui_items[i] = item;
        item.active = true;
        item.o = obj;
        var obj1 = obj.node || obj;
        item.getComponent(cc.Label).string = "[" + type + "]" + (cc.js.getClassName(obj) || "") + "(" + (obj1._name || obj.name || "name") + ")";
        item.y = y;
        //Log.info(item.getComponent(cc.Label).string, i, y);
        return y - 30;
    },

    setDebugUIObjBorder : function(obj, flag){
        if(!obj) return;
        if(flag == false){
            if(obj && obj.draw_node){
                obj.draw_node.active = false;
            }
            return;
        }
        if(!obj.draw_node){
            obj.draw_node = new cc.Node();
            obj.draw_node.border = true;
            obj.parent.addChild(obj.draw_node);
            obj.draw_layer = obj.draw_node.addComponent(cc.Graphics);
            // obj.draw_layer.fillColor = new cc.Color(0, 255, 0);
            obj.draw_layer.strokeColor = new cc.Color(0, 255, 0);
            obj.draw_layer.lineWidth = 2;
            // Log.info(obj.anchorX, obj.anchorY, obj.x, obj.y, obj.width, obj.height, obj.draw_node.anchorX, obj.draw_node.anchorY, obj.parent.anchorX, obj.parent.anchorY);
        }
        obj.draw_node.active = true;
        obj.draw_node.setAnchorPoint(obj.anchorX, obj.anchorY);
        obj.draw_node.setPosition(obj.x, obj.y);
        obj.draw_layer.clear();
        obj.draw_layer.rect(-obj.width * obj.anchorX, -obj.height*obj.anchorY, obj.width, obj.height);
        obj.draw_layer.stroke();
        //obj.draw_layer.fill();
    },

    selectDebugUIObj : function(pos){
        if(this.debug_ui && this.debug_ui.active){
            var newobj = this.matchDebugUIObj(cc.director.getScene(), 1, pos, null, 0);
            this.setDebugUIObj(newobj);
        }
    },

    matchDebugUIObj : function(node, n, pos, obj, zindex){
        if(n > 100) return obj; // 只处理到一定深度
        let nodes = node.children;
        for(let i=0, len=nodes.length; i<len; i++){
            if(nodes[i].active && !nodes[i].gm){
                if(n>1 && this.hitObj(nodes[i], pos)){
                    nodes[i].w_zIndex = zindex + i;
                    obj = this.compObj(nodes[i], obj);
                }
                obj = this.matchDebugUIObj(nodes[i], n + 1, pos, obj, zindex + i * 100000);
            }
        }
        return obj;
    },

    hitObj : function(node, pos){
        let rect = node.getBoundingBoxToWorld();
        return rect.contains(pos);
    },

    compObj : function(obj, obj1){
        if(obj.width < 1 || obj.height < 1 || obj.width >= SCREEN_WIDTH || obj.height >= SCREEN_HEIGHT){
            return obj1;
        }else if(!obj1){
            return obj;
        // }else if(obj.w_zIndex > obj1.w_zIndex){
        //     return obj;
        }else if(obj.width * obj.height < obj1.width * obj1.height){
            return obj;
        }
        return obj1;
    }
};

module.exports = GmCmd;