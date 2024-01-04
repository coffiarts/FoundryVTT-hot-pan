The **major** version number in my modules (like "11") always reflects the
Foundry VTT **core** version it is compatible with (and recommended for).

## 11.0.8.?
### 2024-??-?? - ???
- ???


## 11.0.8
### 2024-01-04 - Bugfix
- Fix for [Issue #4](https://github.com/coffiarts/FoundryVTT-hot-pan/issues/4): GM can now freely pan & zoom any scene in "view" mode without unintendendly affecting the active scene on the players' clients


## 11.0.7
### 2023-12-20 - Just an x-mas cleanup release :-)
Several internal refactorings and stability optimizations that have piled up over time.
Mainly optimizes debug logging. Nothing vital, just wanted to push this out before x-mas, so that there's room for hopefully more interesting features in the future.


## 11.0.6
### 2023-12-14 - Minor fix of instable module activation
- Fixes a minor bug that could sporadically result in this module not activating properly during startup.


## 11.0.5
### 2023-12-11 - LockView compatibility fix
- If you're using [LockView](https://github.com/MaterialFoundry/LockView) by [CDeenen](https://github.com/CDeenen) together
  with my mod, LockView's pan and zoom lock will now be automatically deactivated and reactivated whenever toggling Hot Pan & Zoom! on and off.<br/>
  Before that, both modules were incompatible (i.e. LockView's pan and zoom locks, while active, were blocking functionality of this mod).


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
