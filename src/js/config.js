
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
			var api=this.host()+'/api/v2.0';
			return api;
            //else return 'http://dev.arborplus.com/api/v2.0';
        }
	,getEntityID: function(){
            var h=this.host()||'';
			if(h.match(/aplus/)) return 1;
			if(h.match(/joseph/)) return 2;
			if(h.match(/woodie/)) return 3;
			return 0;
		}
    };



