
// config file for angular

window.cfg={
    hostAndPort:function(){
        return 'http://'+window.location.host;
        }
    ,host: function(){
        return 'http://'+window.location.host.replace(/:[0-9]+$/, '');
        }
    ,apiBaseUrl: function(){
            var h=this.host()||'';
			if(h.match(/(localh|127.0.0|0.0.0)/)) h='http://dev.arborplus.com';
			var api=h+'/api/v2.0';
			return api;
            //else return 'http://dev.arborplus.com/api/v2.0';
        }
	,getEntityID: function(){
            var h=this.host()||'';
			if(h.match(/app.aplus/)) return 2;
			if(h.match(/joseph/)) return 3;
			if(h.match(/woodie/)) return 4;
			return 1;	// default to dev.aplustree
		}
    };



