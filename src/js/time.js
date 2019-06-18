//
//   _____                     
//  (_   _)_                   
//    | | (_)  ___ ___     __  
//    | | | |/' _ ` _ `\ /'__`\
//    | | | || ( ) ( ) |(  ___/
//    (_) (_)(_) (_) (_)`\____)
//                             
//                             

import ShaderBoy from "./shaderboy"
import collectFPS from 'collect-fps'
import gui_timeline from './gui/gui_timeline'

export default ShaderBoy.time = {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    FPS: 60.0,
    FPS_INTERVAL: 1000 / 60,
    getGlobalTime: undefined,
    time_then: undefined,
    time_elapsed: undefined,
    startTime: undefined,
    loop: { start: 0, end: 60 * 60 },
    pausedTime: 0,
    offsetTime: 0,
    fps: 0,
    totalFrames: 60 * 60,

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        this.time_then = Date.now()
        this.getGlobalTime = (() =>
        {
            if ("performance" in window) return () => { return window.performance.now() * 0.001; }
            return () => { return (new Date()).getTime() * 0.001; }
        })()
        this.startTime = this.getGlobalTime()
        //FPS counter
        this.endCollection = collectFPS()
        setInterval(() =>
        {
            this.fps = this.endCollection()
            this.endCollection = collectFPS()
        }, 1000)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    needUpdate()
    {
        const now = Date.now()
        this.time_elapsed = now - this.time_then

        if (this.time_elapsed > this.FPS_INTERVAL)
        {
            this.time_then = now - (this.time_elapsed % this.FPS_INTERVAL)
            return true
        }
        else
        {
            return false
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    update()
    {
        ShaderBoy.uniforms.iFrame++
        const oldITime = ShaderBoy.uniforms.iTime
        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * (1 / 60);//this.getGlobalTime() - this.offsetTime - this.startTime
        ShaderBoy.uniforms.iTimeDelta = (1 / 60);//ShaderBoy.uniforms.iTime - oldITime
        ShaderBoy.uniforms.iFrameRate = this.fps
        const d = new Date()
        ShaderBoy.uniforms.iDate = [
            d.getFullYear(), // the year (four digits)
            d.getMonth(),	   // the month (from 0-11)
            d.getDate(),     // the day of the month (from 1-31)
            d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0
        ]

        if (ShaderBoy.uniforms.iFrame > this.loop.end)
        {
            this.reset()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    reset()
    {
        ShaderBoy.uniforms.iTime = this.loop.start * (1 / 60)
        ShaderBoy.uniforms.iFrame = this.loop.start
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pause()
    {
        if (ShaderBoy.isPlaying !== true)
        {
            this.pausedTime = this.getGlobalTime()
            console.log('Paused.')
        }
        else
        {
            if (ShaderBoy.uniforms.iTime === 0.0)
            {
                this.reset()
            }
            this.offsetTime += this.getGlobalTime() - this.pausedTime
            console.log('Resumed.')
        }
    }
}