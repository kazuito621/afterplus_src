<?php
// if an image is requested on dev, and not found, then go look for it on live

// only run if were in dev directory
if(!preg_match('/www.dev.arbor/', __FILE__)) die();

$liveDir="/var/www/prod/arborplus.com/public";
$req=$_SERVER['REQUEST_URI'];
if(preg_match('/(jpg|jpeg)/', $req)){
	header('Content-type: image/jpeg');
	readfile("$liveDir/$req");
	die();
}

