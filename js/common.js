/*
* @Author: Alex Tsoi ( https://github.com/alextsoi ) @ K2 Digital [https://k2.digital]
* @Date:   2017-02-18 22:51:00
* @Last Modified by:   AT
* @Last Modified time: 2017-04-29 12:52:23
*/
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
function updateFPS() {
    stats.update();
    requestAnimationFrame( updateFPS );
}
requestAnimationFrame( updateFPS );