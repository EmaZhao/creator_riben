// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-25 16:37:10
// --------------------------------------------------------------------
var ExchangeModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.exchangeList = [];
    },
    setExchangeData(data){
        this.exchangeList = data.list
    },
    getRedStatus(){
        let status = false
        for(let i=0;i<this.exchangeList.length;++i){
            let v = this.exchangeList[i];
            if(v.id == 1){
                if((v.max - v.num) > 0){
                    status = true
                }
                break
            }
        }
        return status
    },
});

module.exports = ExchangeModel;
