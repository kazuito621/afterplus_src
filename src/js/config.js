
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
            if(h.match(/app.arbor/)) return this.host()+'/api/v2.0';
            else return 'http://dev.arborplus.com/api/v2.0';
        }
    };


