
window.cfg={
	hostAndPort:function(){
		return 'http://'+window.location.host;
		}
	,host: function(){
		return 'http://'+window.location.host.replace(/:[0-9]+$/, '');
		}
	};

