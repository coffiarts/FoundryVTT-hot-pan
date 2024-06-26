![](https://img.shields.io/badge/Foundry-v11-informational)
![](https://img.shields.io/badge/Foundry-v12-informational)
![GitHub All Releases](https://img.shields.io/github/downloads/coffiarts/FoundryVTT-hot-pan/latest/module.zip?label=Downloads+latest+release+[12.1.0])
![GitHub All Releases](https://img.shields.io/github/downloads/coffiarts/FoundryVTT-hot-pan/12.0.0/module.zip?label=previous+release+[12.0.0])
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fhot-pan)](https://forge-vtt.com/bazaar#package=hot-pan)
[![GitHub issues](https://img.shields.io/github/issues/coffiarts/FoundryVTT-hot-pan/bug)](https://github.com/coffiarts/FoundryVTT-hot-pan/issues)
[![The Forge](https://img.shields.io/badge/The%20Forge-Pay%20What%20You%20Want-success?style=flat-square)](https://eu.forge-vtt.com/bazaar#package=hot-pan)

# Hot Pan & Zoom! for Foundry VTT
<table style="border:0">
  <tr>
    <td><img src="src/hot-pan/artwork/hot-pan-logo.gif" alt="Hot Pan & Zoom! Logo"/></td>
    <td><span style="color:#da6502">Take control over your players' canvas position and zoom (manually or by macro) for demonstrations and cinematics.</span><br/>
        <br/>
        <i><strong>"One Thing to Pan Them!<br/>
            One Thing to Find Them!<br/>
            One Thing to Zoom them<br/>
            And to the GM's Canvas Bind Them!"</strong></i>
    </td>
  </tr>
</table>

- Are you on [Forge VTT](https://forge-vtt.com/)?
- Do you like my work?
- Do you REALLY like my work?
- Could you even imagine to DONATE?

Feel free to [head over to this mod on Forge](https://eu.forge-vtt.com/bazaar/package/hot-pan), where you can even pay for it what you like.

This is absolutely optional! Don't feel obliged in any way to do so. My mod is and will remain available for free.

## It's finally a part of us!
It's been a long awaited fusion of two mods that seem to love each others sooo much. As of v. 12.1.0, it is done:

This mod now comes with a new feature called **"Auto Focus"**.
It is basically an integration of one of my favorite mods, [Always Centred](https://github.com/SDoehren/always-centred) by [SDoehren](https://github.com/SDoehren). See [Credits](#credits) and [CHANGELOG.MD](CHANGELOG.md). Go and find out what this fancy new macro button can do!

<img src="src/hot-pan/artwork/auto-focus-macro-icon.png" width="160" alt="New Auto Focus macro"/>


## Video demo on youtube
(does not show the new "Auto Focus" feature yet)

[Hot Pan & Zoom! Demo](https://youtu.be/irUmWkSJ_4M)

[<img src="src/hot-pan/artwork/hot-pan-video-thumb.png" alt="Hot Pan & Zoom! - Video demo on youtube" width="600"/>](https://youtu.be/irUmWkSJ_4M)

* [What does it do ...](#what-does-it-do-)
* [Changelog](#changelog)
* [Adjustable module settings](#adjustable-module-settings)
* [Toggle by hotkey](#toggle-by-hotkey)
* [Control it by macro](#control-it-by-macro)
* [Compatibility and Dependencies](#compatibility-and-dependencies)
* [Troubleshooting](#troubleshooting)
  - [Switching off after switching on inside the same macro fails](#switching-off-after-switching-on-inside-the-same-macro-fails)
* [Credits](#credits)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## What does it do ...
Are you tired of your players complaining about things like...
- *"Hey, where's my token gone again?"*
- *"Where the h... are you (the GM)? I think you've lost us! What are you trying to show us over there?"*

It happens to me quite often that I (as the GM) like panning and scrolling around, enthusiastically trying to demonstrate something in the scene to my players, but I tend to forget that they cannot follow me on their screens!
So I am frequently losing their attention without noticing.

And a more fancy thing: I like scripting big macros for playing cinematic animation sequences that do a lot of stuff across the scene. But then I forget that most of it won't be noticed by the players, as it happens to take place in a far-away corner of the scene that they are currently just *not* looking at! :(

**This is why I've created this whole thing.**

It is a systems-agnostic utility for keeping players' canvas position & zoom in sync with the GM's screen.

For instance, it allows to take over control of the players' canvas for a short time to draw their attention to important things ("Hey! Have a look at THIS!").

And it comes in handy for cinematic reasons, like in the animation sequence shown in the video demo. Feel free to experiment!

## Changelog
Has been moved to [CHANGELOG.md](CHANGELOG.md)


## Adjustable module settings
This screenshot shows the default values.

(!) Note that especially the UI notification messages can be configured to your needs.

<img src="src/hot-pan/artwork/hot-pan-settings.png" alt="Hot Pan & Zoom! settings"/>

## Toggle by hotkey
You (gamemasters only) can assign a custom hotkey in the game settings (by default it is empty to prevent unwanted key collisions). My personal preference is **SHIFT + P** ("P" standing for "Pan"):

<img src="src/hot-pan/artwork/hot-pan-keybinding-step1.png" alt="Hot Pan & Zoom! assign keybinding - step 1"/>

<img src="src/hot-pan/artwork/hot-pan-keybinding-step2.png" alt="Hot Pan & Zoom! assign keybinding - step 2"/>

<img src="src/hot-pan/artwork/hot-pan-keybinding-step3.png" alt="Hot Pan & Zoom! assign keybinding - step 3"/>


## Control it by macro
The module runs automatically in the backend as a module, but it can also easily be controlled through macro code.

The module comes with its own macro compendium pack containing two prebuilt examples: One for the Hot Pan & Zoom! core functionality, and one for the "Auto Focus" (aka "Always Centred") added in v. 12.1.0.
Use and modify them according to your needs:

<img src="src/hot-pan/artwork/hot-pan-macro-compendium.png" alt="Hot Pan & Zoom! - Macro compendium"/>

The macro uses the exposed `class HotPan` - just like this, it's a no-brainer:

<img src="src/hot-pan/artwork/hot-pan-toggle-macro.png" alt="Hot Pan & Zoom! macro example"/>

Some variants:

    // Toggle specifically on and off (pretty obvious)
    HotPan.switchOn();
    HotPan.switchOff(); // If this doesn't work, refer to "Troubleshooting" below
    
    // If your macro should not rely on HotPan being installed, to prevent runtime issues,
    // use it optionally (by using "?")
    HotPan?.switchOn();
    
    // And now for the advanced scenarios:
    // Use HotPan (optionally) in a macro running a multi-step animation sequence,
    // AND prevent that the GM's preference (active state of the mod) is not overridden afterwards:
    
    // Step 1: activate Hot Pan & Zoom!
    HotPan?.switchOn();
    // A special recommendation here is to suppress UI messages (supported as of v1.1.0)
    HotPan?.switchOn(true); // true means "silentMode", being effective always for a single switch action 
    
    // Step 2: Run all your fancy animation stuff and watch the players' map view following yours
    <...>
    
    // Step 3: When all is done, switch of HotPan again, but gracefully: If the user setting was ON before,
    // you don't want to set it to OFF now!
    // This is done by using the switchBack(true) method instead of switchOff(true). True, again, meaning "silentMode", which is the recommendation during macro automation
    HotPan?.switchBack(true);  // If this doesn't work, refer to "Troubleshooting" below

## Compatibility and Dependencies
- ***Hot Pan & Zoom!*** uses [socketlib](https://github.com/manuelVo/foundryvtt-socketlib) for sending sync messages between the GM's session and the clients.
- Developed and tested on Foundry VTT 11.2xx and higher (including v12), with Chrome as the players' client (I _assume_, but cannot _guarantee_ that it's still compatible with v10.x).

- Feel free to follow the ["dev" branch on GitHub](https://github.com/coffiarts/FoundryVTT-hot-pan/tree/dev) to stay tuned: [https://github.com/coffiarts/FoundryVTT-hot-pan/tree/dev](https://github.com/coffiarts/FoundryVTT-hot-pan/tree/dev)

# Troubleshooting
## Switching off after switching on inside the same macro fails
Toggling within a single thread (like a macro script) (e.g. <i>switchOn() => switchOff()/switchBack(), toggle() => toggle()</i>) can be unreliable.
It's some weird asynchronicity / threading issue I haven't fully understood.

Workaround:

    // Toggle on (as usual)
    HotPan.switchOn();
    <...>
    // But for switching off, encapsulate function calls within setTimeout():
    setTimeout(function(){HotPan.switchOff()}, 100);
    <or>
    setTimeout(function(){HotPan.switchBack()}, 100);
    <or>
    setTimeout(function(){HotPan.toggle()}, 100);

This might be an ugly solution caused by my noob-i-ness, any better ideas highly appreciated!

## Credits
- [SDoehren](https://github.com/SDoehren) for his great mod [Always Centred](https://github.com/SDoehren/always-centred) and his Creative Commons License that allowed me to freely reuse and integrate his code!
