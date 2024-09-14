// --------------------------------------------------------------------
// @author: 
// @description:
//     主城
// <br/>Create:
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var HeroController = require("hero_controller")

var CityMainWindow = cc.Class({
    extends: ViewClass,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mainui", "city_main_window");
        LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
          this.initConfig()
          this.initUI(res_object);
        }.bind(this)));
    },

    initConfig(){
      this.draw_vo = RoleController.getInstance().getDrawData()
    },

    initUI:function(prefab){
      this.root_wnd = prefab;
      ViewManager.getInstance().addToSceneNode(this.root_wnd, SCENE_TAG.scene);
      this.role_bg = this.seekChild("role_bg");
      this.bg1 = this.seekChild("bg1");
      this.bg2 =  this.seekChild("bg2");
      this.role_skeleton = this.seekChild("role_skeleton");
      this.reset();

      Utils.onTouchEnd(this.role_bg, ()=> {
        HeroController.getInstance().onClickHeroToPlayVoice(this.library_config.voice_res);
      }, 1);
      Utils.onTouchEnd(this.role_skeleton,()=>{
        HeroController.getInstance().onClickHeroToPlayVoice(this.library_config.voice_res);
      })
    },

    refreshVertical(){//更换立绘
      if(!this.draw_vo){
        return;
      }
      var draw_res_id = this.draw_vo.draw_res|| "jinglingwangzi"; 
      if(this.draw_vo.star >=8){
        var config = gdata("partner_data", "data_partner_base", [this.draw_vo.bid]);
        if(config.awaken_draw_res){
          draw_res_id = config.awaken_draw_res;
        }
      }
      this.library_config = gdata("partner_data", "data_partner_library", [this.draw_vo.bid]);
      var spine_res_list = this.library_config.spine_res_list;
      var bg_res = PathTool.getIconPath("herodraw/herodrawres", draw_res_id);
      var must_scale = 1
      var x = 0;
      var y = 0;
      if (this.library_config) {
          if (this.library_config.main_scale && this.library_config.main_scale !=0) {
              must_scale = this.library_config.main_scale / 100;
          }
          if(this.library_config.main_draw_offset.length>0){
            x = this.library_config.main_draw_offset[0][0];
            y = this.library_config.main_draw_offset[0][1];
          }
          if(this.draw_vo.star &&this.draw_vo.star >=8){
            if (this.library_config.awaken_main_scale&&this.library_config.awaken_main_scale !=0) {
              must_scale = this.library_config.awaken_main_scale / 100;
            }
            if(this.library_config.awaken_main_draw_offset.length>0){
              x = this.library_config.awaken_main_draw_offset[0][0];
              y = this.library_config.awaken_main_draw_offset[0][1];
            }
          }
      }
     

      if( spine_res_list&& spine_res_list.length>0){
        var spine_name =  spine_res_list[0][0];
        if(this.draw_vo.star &&this.draw_vo.star >=8){
          if(spine_res_list[0][1]){
            spine_name = spine_res_list[0][1];
          }
        }
        if(spine_name){
          this.role_skeleton.active = true;
          this.role_bg.active = false;
          var skeleton_res = "spine/"+spine_name+"/action.atlas"
          LoaderManager.getInstance().loadRes(skeleton_res, function (skeleton_data) {
            this.role_skeleton.getComponent(sp.Skeleton).skeletonData = skeleton_data;
            this.role_skeleton.getComponent(sp.Skeleton).setAnimation(0, "action",true);
          }.bind(this));
        }
      }else{
        if (this.role_bg) {
          this.role_bg.active = true;
          this.role_skeleton.active = false;
          LoaderManager.getInstance().loadRes(bg_res, function (sp) {
              this.role_bg.getComponent(cc.Sprite).spriteFrame = sp;
          }.bind(this));
        }
      }
      // if(this.draw_vo.star &&this.draw_vo.star >=6){
        this.role_skeleton.setPosition(x,y);
        this.role_skeleton.scale = must_scale;
      // }
      this.role_bg.setPosition(x,y);
      this.role_bg.scale = must_scale;
      
    },


    reset:function(){//重新唤醒
      if(this.root_wnd){
        if(!this.root_wnd.active){
          this.setVisible(true);
        }
        this.draw_vo = RoleController.getInstance().getDrawData()
        this.refreshVertical();
        this.refreshUI();
      }
    },

    refreshUI:function(){
      this.cur_time_type = this.getTiemType();
      if(this.cur_time_type == 1){
        this.bg1.active = true;
        this.bg2.active = false;
      }else{
        this.bg1.active = false;
        this.bg2.active = true;
      }
    },

    setTimeType: function(timevalue) {
      var cur_type;
      if (timevalue >= 6 && timevalue < 18) {
          cur_type = 1;
      } else {
          cur_type = 2;
      }

      if (this.cur_time_type !== cur_type) {
          this.cur_time_type = cur_type;
          if (this.root_wnd.active){
            this.refreshUI();
          } 
      }
    },

    getTiemType: function() {
      var myDate = new Date();
      var curTime = myDate.getHours();
      var cur_time_type = 2;
      if (curTime >= 6 && curTime <= 18) {
          cur_time_type = 1;
      }
      return cur_time_type;
    },


    setVisible:function(status){
      if(this.root_wnd){
        this.root_wnd.active = status;
        this.cur_time_type = this.getTiemType();
        if (this.cur_time_type !== this.cur_time_type) {
            this.refreshUI();
        }
      }
    },

    close:function(dis_map){
      this.deleteMe();
    }
   
})