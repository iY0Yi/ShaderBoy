//
//   _____                     
//  (_   _)_                   
//    | | (_)  ___ ___     __  
//    | | | |/' _ ` _ `\ /'__`\
//    | | | || ( ) ( ) |(  ___/
//    (_) (_)(_) (_) (_)`\____)
//                             
//                             

import ShaderBoy from "./shaderboy";
import collectFPS from 'collect-fps';

export default ShaderBoy.time = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    FPS: 60.0,
    FPS_INTERVAL: 1000 / 60,
    pnow: undefined,
    getGlobalTime: undefined,
    time_then: undefined,
    time_elapsed: undefined,
    startTime: undefined,
    pausedTime: 0,
    offsetTime: 0,
    appTime: 0,

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init: function () {
        this.time_then = Date.now();
        this.pnow = window.performance && (performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow);
        this.getGlobalTime = function () { return (this.pnow && this.pnow.call(performance)) * 0.001 || (new Date().getTime()) * 0.001; }
        this.startTime = this.getGlobalTime();

        //FPS counter
        this.endCollection = collectFPS();
        setInterval(() => {
            this.fps = this.endCollection().toFixed(0);
            this.endCollection = collectFPS();
        }, 1000);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    needUpdate: function () {
        let now = Date.now();
        this.time_elapsed = now - this.time_then;
        if (this.time_elapsed > this.FPS_INTERVAL) {
            this.time_then = now - (this.time_elapsed % this.FPS_INTERVAL);
            this.appTime = this.getGlobalTime() - this.offsetTime - this.startTime;
            return true;
        }
        else {
            false;
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    reset: function () {
        this.startTime = this.getGlobalTime();
        this.pausedTime = 0;
        this.offsetTime = 0;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pause: function () {
        if (ShaderBoy.isPlaying !== true) {
            this.pausedTime = this.getGlobalTime();
        }
        else {
            if (this.pausedTime !== 0 && this.offsetTime !== 0)
                this.offsetTime += this.getGlobalTime() - this.pausedTime;
        }
    }
};