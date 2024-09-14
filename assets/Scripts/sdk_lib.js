/*-----------------------------------------------------+
 * sdk相关接口相关处理
 * @author whjing2012@163.com
 +-----------------------------------------------------*/

 var SdkLib = {

    // 充值总入口 
    pay : function(money, buyNum, prodId, productName, productDesc){
        buyNum = buyNum || 1;
        Log.info("pay ", money, prodId);
        gcore.SmartSocket.send(10399, {msg:"pay " + prodId});
    }

 };

 module.exports = SdkLib;