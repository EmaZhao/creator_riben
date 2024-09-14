var _shSdk = function(){};
_shSdk.prototype = {
    logincallback:false,
    paycallback:false,
    subscallback:false,
    shareSdkCallback:false,
    shareResultCallback:false,
    realnameCallback:false,
    bindphoneCallback:false,
    login:function(callback){
        this.logincallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_LOGIN';
        console.log("shsdk login url:"+location.href,messageObject);
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    createRole:function(params){
        var messageObject = new Object();
        messageObject.params = params;
        messageObject.func = 'MSG_CREATE_ROLE';
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    enterGame:function(params){
        var messageObject = new Object();
        messageObject.params = params;
        messageObject.func = 'MSG_ENTER_GAME';
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    roleUpLevel:function(params){
        var messageObject = new Object();
        messageObject.params = params;
        messageObject.func = 'MSG_ROLE_UP_LEVEL';
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    pay:function(params,callback){
        this.paycallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_PAY';
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    subscribe:function(params,callback){
        this.subscallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_SUBSCRIBE';
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    setShareCallback:function(callback){
        this.shareResultCallback = callback;
    },
    shareSdk:function(params,callback){
        this.shareSdkCallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_SHARE_SDK';
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    realname:function(params,callback){
        this.realnameCallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_REAL_NAME';
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    bindphone:function(params,callback){
        this.bindphoneCallback = callback;
        var messageObject = new Object();
        messageObject.func = 'MSG_BIND_PHONE';
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    logout:function(){
        var messageObject = new Object();
        messageObject.func = 'MSG_LOGOUT';
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    dataPlacement:function(params){
        var messageObject = new Object();
        messageObject.func = 'MSG_DATAPLACEMENT';//dataPlacement
        messageObject.params = params;
        window.parent.postMessage(JSON.stringify(messageObject),'*');
    },
    message:function(messageObject){
        switch(messageObject.func){
            //登陆成功
            case 'NOTIFY_LOGIN':
                if(this.logincallback){
                    this.logincallback(messageObject.params);
                }
                break;
            //充值成功
            case 'NOTIFY_PAY':
                if(this.paycallback){
                    this.paycallback(messageObject.params);
                }
                break;
            case 'NOTIFY_SUBSCRIBE':
                if(this.subscallback){
                    this.subscallback(messageObject.params);
                }
                break;
            case 'NOTIFY_SHARE_SDK':
                if(this.shareSdkCallback){
                    this.shareSdkCallback(messageObject.params);
                }
                break;
            case 'NOTIFY_SHARE_RESULT':
                if(this.shareResultCallback){
                    this.shareResultCallback(messageObject.params);
                }
                break;
            case 'NOTIFY_REAL_NAME':
                if(this.realnameCallback){
                    this.realnameCallback(messageObject.params);
                }
                break;
            case 'NOTIFY_BIND_PHONE':
                if(this.bindphoneCallback){
                    this.bindphoneCallback(messageObject.params);
                }
                break;
            default:
            break;
        }
    }
};

var ShSdk = new _shSdk();
window.addEventListener('message',function(e){
    try{
    var messageData = e.data;
    var messageObject = JSON.parse(messageData);
    }catch(err){
        console.log(err);
        return;
    }
    if(messageObject == null || typeof(messageObject) != 'object' || !messageObject.hasOwnProperty('func')){
        return;
    }
    ShSdk.message(messageObject);
});