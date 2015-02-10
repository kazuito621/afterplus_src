<?php

$dirscan=scandir(".", 1);
foreach($dirscan as $f){
	echo "<img src='$f'><BR>$f<BR><BR><BR><BR>";
}
