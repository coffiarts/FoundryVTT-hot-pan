## 11.0.4
### 2023-06-27 - Changelog & Readme optimization for Module Management+
- Refactored documentation so that it can be properly displayed & linked in-game by [Module Management+](https://github.com/mouse0270/module-credits),<br/>
  which is a veeeery helpful mod that I waaaaarmly recommend!
- Updated recommended dependency from always-centred to latest v11-compatible version (0010)


## 11.0.3
### 2023-06-22 - Getting rid of unnecessary console error on game load
- Just technical - My module didn't handle its initialization sequence properly, causing an error in the browser console on startup ("Uncaught (in promise) Error: undefined.<br/>
  You may not set a World-level Setting before the Game is ready"). The error was harmless but unnecessary. This fix makes it go away.


## 11.0.2
### 2023-06-05 - Compatibility info simplified
- Reduced verified compatibility to main version (11) of FoundryVTT (instead of specific patch version).<br/>
  This gets rid of unnecessary "incompatibility risk" flags with every new patch version.


## 11.0.1
### 2023-05-29 - Additional recommended dependency added: Always Centred
- I recommend to use this mod together with [Always Centred](https://github.com/SDoehren/always-centred) by [SDoehren](https://github.com/SDoehren).<br/>
  The new Foundry version (11) supports such optional dependencies to be properly declared in the manifest, which is what I have done hereby.


## 11.0.0
### 2023-05-28 - Foundry 11 compatibility release
- Actually, nothing has changed, technically. It had already been compatible, and it is still backward-compatible with v10.<br/>
  There are some minor optimizations to logging and readme, though.<br/>
  In addition, I want to clearly signal v11 compatibility by this new release number.<br>
  <span style="color:green">
  From now on, my major versions will always reflect the corresponding Foundry VTT major version<br/>
  (i.e. mod version 11.x.x => compatible with Foundry v11, and so on)
  </span>


## 1.1.1
### 2023-03-05 - Minor technical patch
- Fixing name of macro pack in manifest


## 1.1.0
### 2023-02-25 - Introducing new "silentMode" parameter for suppressing UI messages on demand:
- Introducing new "silentMode" parameter for suppressing UI messages on demand:<br/>
  Especially when automating Hot Pan & Zoom in macros, UI messages can be tedious.<br/>
  Instead of switching them off in the game settings, you can now suppress them for individual calls of <i>switchOn(), switchOff(), switchBack() and toggle()</i> by an optional paramter:<br/>
  <i>swichOn(<b>true</b>);</i><br/>
  <i>swichOff(<b>true</b>);</i><br/>
  <i>swichBack(<b>true</b>);</i><br/>
  <i>toggle(<b>true</b>);</i>
- Various minor refactorings


## 1.0.2
### 2023-02-21 - Example macro(s) now provided as compendium pack:
- Find included a compendium pack with a default macro that can easily be adjusted to your needs.<br/>
  Find further explanations inline in the macro's code:<br/>
  <img src="https://github.com/coffiarts/FoundryVTT-hot-pan/blob/master/src/hot-pan/artwork/hot-pan-macro-compendium.png?raw=true" alt="Hot Pan & Zoom! - Macro Compendium" width="400"/>

## 1.0.1
### 2023-02-20 - 
- More intuitive Macro API:<br/>
  Use <i>HotPan.switchBack()</i> now instead of <i>HotPan.switchOff(restoreStateBefore=true)</i><br/>
  (Old function still valid, but flagged as deprecated. Migration recommended.)
- Stability workaround for Macro API:<br/>
  Toggling within a single macro script (<i>switchOn() => switchOff()/switchBack(), toggle() => toggle()</i>) was unreliable.<br/>
  Some weird asynchronicity / threading behaviour which I couldn't really understand.<br/>.
  Added some await / Promise logic, plus updated documentation about macro usage (new troubleshooting section).<br/>
  Any feedback on better solutions highly appreciated!


## 1.0.0
### 2023-02-18 - Going out into the world!