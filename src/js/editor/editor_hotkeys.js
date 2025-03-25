//   ___        _     _
//  (  _`\     ( ) _ ( )_
//  | (_(_)   _| |(_)| ,_)   _    _ __
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |
//  (____/'`\__,_)(_)`\__)`\___/'(_)
//   _   _         _    _
//  ( ) ( )       ( )_ ( )
//  | |_| |   _   | ,_)| |/')    __   _   _   ___
//  |  _  | /'_`\ | |  | , <   /'__`\( ) ( )/',__)
//  | | | |( (_) )| |_ | |\`\ (  ___/| (_) |\__, \
//  (_) (_)`\___/'`\__)(_) (_)`\____)`\__, |(____/
//                                   ( )_| |
//                                   `\___/'

import key from "keymaster";
import commands from "../commands";
import ShaderBoy from "../shaderboy";

export default ShaderBoy.editor_hotkeys = {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  setup() {
    this.keys = {};

    // キーマスターのフィルタ関数を元に戻す
    key.filter = function(evt) {
        return true; // すべてのイベントをkeymasterに通す
    };

    key("⌥+right", "default", () => {
      commands.setPrevBuffer();
      return false;
    });
    key("⌥+left", "default", () => {
      commands.setNextBuffer();
      return false;
    });
    key("ctrl+⇧+up", "default", () => {
      commands.pauseResumeTimeline();
      return false;
    });
    key("ctrl+⇧+down", "default", () => {
      commands.resetTimeline();
      return false;
    });
    key("⌥+enter", "default", () => {
      commands.compileShader();
      return false;
    });

    key("ctrl+1", "default", () => {
      commands.setResolution1();
      return false;
    });
    key("ctrl+2", "default", () => {
      commands.setResolution2();
      return false;
    });
    key("ctrl+3", "default", () => {
      commands.setResolution3();
      return false;
    });
    key("ctrl+4", "default", () => {
      commands.setResolution4();
      return false;
    });

    key("ctrl+s, ⌘+s", "default", () => {
      commands.saveShader();
      return false;
    });
    key("ctrl+o, ⌘+o", "default", () => {
      commands.openShader();
      return false;
    });
    key("ctrl+⇧+i, ⌘+⇧+i", "default", () => {
      commands.switchInfo();
      return false;
    });
    key("ctrl+m, ⌘+m", "default", () => {
      commands.mute();
      return false;
    });

    key("ctrl++, ⌘++", "default", () => {
      commands.incTextSize();
      return false;
    });
    key("ctrl+;, ⌘+;", "default", () => {
      commands.incTextSize();
      return false;
    });
    key("ctrl+=, ⌘+=", "default", () => {
      commands.incTextSize();
      return false;
    });
    key("ctrl+-, ⌘+-", "default", () => {
      commands.decTextSize();
      return false;
    });
    key("ctrl+_, ⌘+_", "default", () => {
      commands.decTextSize();
      return false;
    });

    key("ctrl+⇧+⌥+n, ⌘+⇧+⌥+n", "default", commands.newShader);
    key("ctrl+⇧+⌥+i, ⌘+⇧+⌥+i", "default", commands.importShader);
    key("ctrl+⇧+⌥+f, ⌘+⇧+⌥+f", "default", commands.forkShader);

    key("ctrl+⇧+⌥+d, ⌘+⇧+⌥+d", "default", commands.showKnobsPanel);
    key("ctrl+⇧+⌥+a, ⌘+⇧+⌥+a", "default", commands.showAssetsPanel);
    key("ctrl+⇧+⌥+t, ⌘+⇧+⌥+t", "default", commands.showTimeline);
    key("ctrl+⇧+⌥+r, ⌘+⇧+⌥+r", "default", commands.showRecordingHeader);
    key("ctrl+⇧+⌥+r, ⌘+⇧+⌥+r", "rec_shown", commands.hideRecordingHeader);
    key("ctrl+⇧+⌥+h, ⌘+⇧+⌥+h", "default", commands.hideEditor);
    key("ctrl+⇧+⌥+h, ⌘+⇧+⌥+h", "editor_hidden", commands.showEditor);
    key("ctrl+⇧+⌥+v, ⌘+⇧+⌥+v", "default", commands.hideCanvas);
    key("ctrl+⇧+⌥+,", "default", commands.toggleSplitView);
    key("ctrl+⇧+⌥+, ⌘+⇧+⌥+,", "default", commands.toggleSplitView);
    key("ctrl+⇧+⌥+., ⌘+⇧+⌥+.", "default", commands.toggleFullscreen);

    key("ctrl+⇧+⌥+up, ⌘+⇧+⌥+up", "default", () => {
      commands.incTextSize();
      return false;
    });
    key("ctrl+⇧+⌥+down, ⌘+⇧+⌥+down", "default", () => {
      commands.decTextSize();
      return false;
    });

    key.setScope("default");
  },
};
