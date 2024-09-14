// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     开场剧情
// <br/>Create: 2019-05-06 14:33:44
// --------------------------------------------------------------------
var RoleController = require("role_controller");
var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("login", "login_story_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.ctrl = require("login_controller").getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.mainPanel_nd = this.seekChild("main_panel");
        this.content_nd = this.seekChild("content");
        this.label_nd = this.content_nd.getChildByName("label");
        this.content_label = this.label_nd.getComponent(cc.Label);
        this.continue_nd = this.mainPanel_nd.getChildByName("continue");
        this.continue_nd.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
      Utils.onTouchEnd(this.root_wnd, ()=> {
        if(this.printDiaTimer){
          this.showAllTxt();
        }else{
          this.continue_nd.active = false;
          this.playNext();
        }
      }, 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      this.textList = []
      this.textList.push("       太陽歴2048年、大陸北部の深緑の森に突如現れた魔竜によって、深緑の森のエルフたちは蹂躙され故郷を失った。平和を尊ぶエルフの女王アルヴィンは、エルフ族を引き連れて人間が統治している南の大陸へ住処を移すことになる――。\n\n       太陽暦2068年、魔竜は獣人族の領地である落日平原を襲撃し、獣人族の族長ケビンが戦死してしまう。そして、生き残った部族は氷霜平原へ逃げていった――。")
      this.textList.push("       太陽歴2078年、魔竜は邪悪な軍隊を率いて、人間の都市ライトシティの侵攻を開始する。人間の女王ルーシーは人間とエルフを率いて魔竜の侵攻から都市を守ることはできたものの、魔竜を倒すことはできなかった。魔竜は再び軍隊を集結し二度目の侵攻を企んでいる。大規模な戦争が起ころうとしている時、人間の女王は大陸の平和を取り戻すため、すべての種族に団結して魔竜を討伐することを呼びかける。")
      this.textList.push("       各種族は団結し、魔竜の侵入から世界を守ろうと奮闘したが、魔竜の力と軍隊はより力を増していき、抵抗はますます難しくなっていった――。\n\n       エルフの女王アルヴィンは古代の生命樹の下で神様が加護を下すことに日夜祈りを捧げた。アルヴィンの献身的な祈りは奇跡を呼び、地球からこの異世界にある男が召喚された。")
      this.textList.push("       異世界から召喚された主人公は、この世界の女たちを自分に近づければ近づけるほど強くさせる。主人公であるアナタはエルフ、人間、獣人と共に戦場に赴き、魔竜を討伐し、世界に平和をもたらすための戦いが今始まる！")
      
      this.playNext();
    },

    playNext:function(){
      if(this.textList.length>0){
        this.printDialog(this.textList.shift());
      }else{
        this.ctrl.openLoginStoryWindow(false);
      }
    },

    playContinueAnim:function(){
      if(this.continue_nd){
        this.continue_nd.runAction(
          cc.sequence(
            cc.fadeOut(0.5),
            cc.fadeIn(0.5),
            cc.callFunc(()=>{
              this.playContinueAnim();
            })
          )
        )
      }
    },

    printDialog(txt) {
      this.cur_txt = txt;
      const txtArr = txt.split("");
      this.content_label.string = "";
      let idx = 0;
      const printSpeed = 70;
      this.clearDiaTimer();
      this.printDiaTimer = gcore.Timer.set(()=> {
          this.content_label.string += txtArr[idx];
          idx++;
          if(idx == txtArr.length) {
              this.continue_nd.active = true;
              this.continue_nd.stopAllActions();
              this.playContinueAnim();
              this.clearDiaTimer();
          }
      }, printSpeed, -1);
    },

    showAllTxt() {
      if(this.printDiaTimer) {
        this.clearDiaTimer();
        this.content_label.string = this.cur_txt;
        this.continue_nd.active = true;
        this.continue_nd.stopAllActions();
        this.playContinueAnim();
      }
    },

    clearDiaTimer() {
      if(this.printDiaTimer) {
          gcore.Timer.del(this.printDiaTimer);
          this.printDiaTimer = null;
      }
  },

    closeCallBack:function(){
      if(RoleController.getInstance().bStoryStatus){
        RoleController.getInstance().setStoryStatus(false);
      }
      this.clearDiaTimer();
      gcore.GlobalEvent.fire(EventId.GUIDE_TO_CONTINUE);
    },
    
})