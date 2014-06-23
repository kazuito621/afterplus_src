
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
            else return 'http://app.arborplus.com/api/v2.0';
                // todo - above should point at dev.arborplus, as soon as we get the subdomain up
        }
    };


