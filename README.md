<img src="src/hot-pan/artwork/hot-pan-logo.gif" alt="Hot Pan & Zoom! Logo"/>

# Hot Pan & Zoom! for Foundry VTT
*"One Thing to Pan Them! One Thing to Find Them! One Thing to Zoom them and to the GM's Canvas Bind Them!"*

- [Changelog](#changelog)
- [What does it do?](#what-does-it-do-)
- [Tech stuff](#tech-stuff)
    * [Module settings (i.e. game settings)](#module-settings--ie-game-settings-)
    * [Control it by macro!](#control-it-by-macro-)
    * [Compatibility & Dependencies](#compatibility---dependencies)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Changelog
<table>
    <tr>
        <th colspan="3" style="text-align: left">Latest Version</th>
    </tr>
    <tr>
        <td>1.0.1</td>
        <td>2023-??-??</td>
        <td>
            <ul>
                <li>Macro API more intuitive:<br/>Use HotPan.switchBack() instead of HotPan.switchOff(restoreStateBefore=true)</li>
            </ul>
        </td>
    </tr>
</table>

<details><summary>Click to see older versions</summary>
<table>
    <tr>
        <th>Release #</th>
        <th>Date</th>
        <th>Changes</th>
    </tr>
    <tr>
        <td>1.0.0</td>
        <td>2023-02-18</td>
        <td>Going out into the world!</td>
    </tr>
</table>
</details>

## What does it do?
Have a look at the video demo: [Hot Pan & Zoom! Demo on youtube](https://youtu.be/irUmWkSJ_4M)

[<img src="src/hot-pan/artwork/hot-pan-video-thumb.png" alt="Hot Pan & Zoom! youtube demo" width="600"/>](https://youtu.be/irUmWkSJ_4M)

***Hot Pan & Zoom!*** is a systems-agnostic utility for keeping players' canvas position & zoom in sync with the GM's screen.

By this, you (as the GM) have a convenient option to point players' attention to relevant things.

Best practise is always to use this only temporarily in specific situation ("hey all of you, please have a look at THIS!"). That's why the feature can be toggled on and off, either in the game settings or by a very easy-to-create custom macro (see below).

Even more, you can use it for cinematic reasons, like in the long animation sequence shown in the video above. Feel free to experiment!

This "canvas sync" is considered a pure GM feature in this mod. It does not support players to use it.

## Tech stuff
### Module settings (i.e. game settings)
This screenshot shows the default values.

(!) Note that especially the UI notification messages can be configured to your needs.
<img src="src/hot-pan/artwork/hot-pan-settings.png" alt="Hot Pan & Zoom! settings"/>

### Control it by macro!
The module runs automatically in the backend as a module, but it can also easily be controlled through macro code.

For this, use the exposed `class HotPan` - just like this, it's a no-brainer:

<img src="src/hot-pan/artwork/hot-pan-toggle-macro.png" alt="Hot Pan & Zoom! macro example"/>

Some more variants:

    // Toggle specifically on and off (pretty obvious)
    HotPan.switchOn();
    HotPan.switchOff();
    
    // If your macro should not rely on HotPan being installed, to prevent runtime issues,
    // use it optionally (by using "?")
    HotPan?.switchOn();
    
    // And now the advanced scenario:
    // Use HotPan (optionally) in a macro running a multi-step animation sequence,
    // AND prevent that the GM's preference (active state of the mod) is not overridden afterwards:
    
    // Step 1: activate Hot Pan & Zoom!
    HotPan?.SetOn();
    
    // Step 2: Run all your fancy animation stuff and watch the players' map view following yours
    <...>
    
    // Step 3: When all is done, switch of HotPan again, but gracefully: If the user setting was ON before,
    // you don't want to set it to OFF now!
    // This is done by using the switchBack() method instead of switchOff().
    HotPan?.switchBack();

### Compatibility & Dependencies
- ***Hot Pan & Zoom!*** uses [socketlib](https://github.com/manuelVo/foundryvtt-socketlib) for sending sync messages between the GM's session and the clients.
- Developed and tested on Foundry VTT 10.2xx, with Chrome as the players' client.
- **DISCLAIMER:** Be aware that I have developed and tested this mainly in local network sessions (including plain localhost connections)! So I can't claim to have run tough reality checks with this. So I am very to know how it works out for others!
