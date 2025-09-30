import {Logger} from './logger.js';

// keep values in sync with module.json!
const MOD_ID = "hot-pan";
const MOD_PATH = `/modules/${MOD_ID}`;
const MOD_TITLE = "Hot Pan & Zoom!";
const MOD_DESCRIPTION = "One Mod to Pan Them! One Mod to Zoom Them! One Mod to Find them and to the GM's Canvas Bind Them!";
const MOD_LINK = `https://github.com/coffiarts/FoundryVTT-${MOD_ID}`;

export class Config {
    static data = {
        modID: MOD_ID,
        modPath: MOD_PATH,
        modTitle: MOD_TITLE,
        modDescription: MOD_DESCRIPTION,
        modlink: MOD_LINK
    };

    static HUD_NAME = "coffiarts-hud";
    static HUD_ICON_NAME = "hot-pan-hud-icon";
    static HUD_ICON_SRC = `${Config.data.modPath}/artwork/hot-pan-macro-icon.png`;
    static OVERLAY_SCALE_MAPPING = { zero: 0, small: 0.2, normal: 0.3, large: 0.4 };

    static init() {

        // Register all globally relevant game settings
        const hotPanSettingsdata1 = {
            modVersion: {
                scope: 'client', config: true, type: String, default: game.modules.get(MOD_ID).version,
                onChange: value => {
                    if (value !== game.modules.get(MOD_ID).version) {
                        // This "pseudo-setting" is meant for display only.
                        // So we always want to snap back to its default on change
                        game.settings.set(Config.data.modID, `modVersion`, game.modules.get(MOD_ID).version);
                    }
                }
            }
        }
        Config.registerSettings(hotPanSettingsdata1);

        // create separator and title at the beginning of this settings section
        if (Config.getGameMajorVersion() >= 13) {
            Hooks.on('renderSettingsConfig', (app, html) => {
                const inputEl = html.querySelector(`#settings-config-${Config.data.modID.replace(/\./g, "\\.")}\\.isActive`);
                const formGroup = inputEl?.closest(".form-group");
                formGroup?.insertAdjacentHTML("beforebegin", `<div><h4 style="margin-top: 0; border-bottom: 1px solid #888; padding-bottom: 4px; margin-bottom: 6px;">Core</h4></div>`);
            });
        }
        else {
            Hooks.on('renderSettingsConfig', (app, [html]) => {
                html.querySelector(`[data-setting-id="${Config.data.modID}.isActive"]`)?.insertAdjacentHTML('beforeBegin', `<h3>Core</h3>`)
            });
        }

        const hotPanSettingsdata2 = {
            isActive: {
                scope: 'world', config: true, type: Boolean, default: false,
                onChange: (value) => { // value is the new value of the setting
                    HotPan.onActiveStateChanged(value);
                }
            },
            notifyOnChange: {
                scope: 'world', config: true, type: Boolean, default: true
            },
            warnWhenON: {
                scope: 'world', config: true, type: Boolean, default: true
            },
            warnWhenOFF: {
                scope: 'world', config: true, type: Boolean, default: false
            },
            showHUDIcon: {
                scope: 'world', config: true, type: Boolean, default: true,
                onChange: () => { // value is the new value of the setting
                    HotPan.onActiveStateChanged(Config.setting('isActive'));
                }
            },
            hudIconScale: {
                scope: 'world', config: true, type: String,
                choices: {
                    "zero": Config.localize("setting.hudIconScaleOptions.zero"),
                    "small": Config.localize("setting.hudIconScaleOptions.small"),
                    "normal": Config.localize("setting.hudIconScaleOptions.normal"),
                    "large": Config.localize("setting.hudIconScaleOptions.large")
                },
                default: "normal",
                render: "radio",
                onChange: () => { // value is the new value of the setting
                    HotPan.onActiveStateChanged(Config.setting('isActive'));
                }
            },
            hudIconOpacity: {
                scope: 'world', config: true, type: Number, default: 0.5,
                range: { // define a slider
                    min: 0.2,
                    max: 1,
                    step: 0.1
                },
                onChange: () => { // value is the new value of the setting
                    HotPan.onActiveStateChanged(Config.setting('isActive'));
                }
            }
        };
        Config.registerSettings(hotPanSettingsdata2);

        // create separator and title at the beginning of the next settings section
        if (Config.getGameMajorVersion() >= 13) {
            Hooks.on('renderSettingsConfig', (app, html) => {
                const inputEl = html.querySelector(`#settings-config-${Config.data.modID.replace(/\./g, "\\.")}\\.afMode`);
                const formGroup = inputEl?.closest(".form-group");
                formGroup?.insertAdjacentHTML(
                    "beforebegin",
                    `<div><h4 style="margin-top: 0; border-bottom: 1px solid #888; padding-bottom: 4px; margin-bottom: 6px;">${Config.localize('autoFocus.title')}</h4></div>` +
                    `<p class="notes" style="margin-top: 0">${Config.localize('autoFocus.description')} ` +
                    `<a href="https://github.com/SDoehren/always-centred">https://github.com/SDoehren/always-centred</a>` +
                    `</p>`);
            });
        }
        else {
            Hooks.on('renderSettingsConfig', (app, [html]) => {
                html.querySelector(`[data-setting-id="${Config.data.modID}.afMode"]`)?.insertAdjacentHTML(
                    'beforeBegin',
                    `<h3>${Config.localize('autoFocus.title')}</h3>` +
                    `<p class="notes">${Config.localize('autoFocus.description')} ` +
                    `<a href="https://github.com/SDoehren/always-centred">https://github.com/SDoehren/always-centred</a>` +
                    `</p>`);
            });
        }

        const autoFocusSettingsData = {
            afMode: {
                scope: "world", config: true, type: String, default: "disabled",
                choices: {
                    disabled: Config.localize('setting.afMode.options.disabled'),
                    partyView: Config.localize('setting.afMode.options.partyView'),
                    selectedToken: Config.localize('setting.afMode.options.selectedToken')
                },
                onChange: (value) => { // value is the new value of the setting
                    HotPan.onAFActiveStateChanged(value);
                }            },
            afAutoZoom: { // hidden!
                scope: "world", config: false, type: Boolean, default: true
            },
            afMitigateBounce: { // hidden!
                scope: "world", config: false, type: Boolean, default: true
            },
            afPaddingSq: { // hidden!
                scope: "world", config: false, type: Number, default: 12
            },
            afPaddingPer: { // hidden!
                scope: "world", config: false, type: Number, default: 33
            },
            afMaxZoom: { // hidden!
                scope: "world", config: false, type: Number, default: 1
            },
            afUpdateSpeed: { // hidden!
                scope: "world", config: false, type: Number, default: 500
            },
            afIncludeInvisible: {
                scope: "world", config: true, type: Boolean, default: false
            }
        };
        Config.registerSettings(autoFocusSettingsData);

        // Add the keybindings

        game.keybindings.register("hot-pan", "active", {
            name: Config.localize('setting.keybindingNames.toggle'),
            editable: [
                //{ key: "KeyL", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT] }
            ],
            restricted: true,
            onDown: () => {
                if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
                    return;
                }
                HotPan.toggle();
            }
        });
        game.keybindings.register("hot-pan", "afActive", {
            name: Config.localize('setting.keybindingNames.toggleAF'),
            editable: [
                //{ key: "KeyL", modifiers: [KeyboardManager.MODIFIER_KEYS.SHIFT] }
            ],
            restricted: true,
            onDown: () => {
                if (game.user.isGM && !game.settings.get("core", "noCanvas")) {
                    HotPan.toggleAutoFocus();
                }
            }
        });
        Logger.info("Empty keybindings registered. Assign them to your liking in the game settings.");

        game.keybindings.register("hot-pan", "scale: zero", {
            name: Config.localize('setting.keybindingNames.scaleZero'),
            editable: [],
            restricted: true,
            onDown: () => {
                if (!game.user.isGM) {
                    return;
                }
                Config.modifySetting('hudIconScale', 'zero');
            }
        });

        game.keybindings.register("hot-pan", "scale: small", {
            name: Config.localize('setting.keybindingNames.scaleSmall'),
            editable: [],
            restricted: true,
            onDown: () => {
                if (!game.user.isGM) {
                    return;
                }
                Config.modifySetting('hudIconScale', 'small');
            }
        });

        game.keybindings.register("hot-pan", "scale: normal", {
            name: Config.localize('setting.keybindingNames.scaleNormal'),
            editable: [],
            restricted: true,
            onDown: () => {
                if (!game.user.isGM) {
                    return;
                }
                Config.modifySetting('hudIconScale', 'normal');
            }
        });

        game.keybindings.register("hot-pan", "scale: large", {
            name: Config.localize('setting.keybindingNames.scaleLarge'),
            editable: [],
            restricted: true,
            onDown: () => {
                if (!game.user.isGM) {
                    return;
                }
                Config.modifySetting('hudIconScale', 'large');
            }
        });


        // Whenever loading up, we need to adjust the "pseudo-setting" modVersion once to the current value from
        // the manifest. Otherwise, module updates won't be reflected in its value (users would always see their first
        // installed version ever in the settings menu).
        game.settings.set(Config.data.modID, 'modVersion', game.modules.get(MOD_ID).version);
        Logger.debug("(Config.init) All game settings registered)");

    }

    static registerSettings(settingsData) {
        Object.entries(settingsData).forEach(([key, data]) => {
            let name = Config.localize(`setting.${key}.name`);
            let hint = Config.localize(`setting.${key}.hint`);
            game.settings.register(
                Config.data.modID, key, {
                    name: name,
                    hint: hint,
                    ...data
                }
            );
            Logger.debug("(Config.registerSettings) Game Setting registered:", name);
        });
    }

    static setting(key) {
        return game.settings.get(Config.data.modID, key);
    }

    static async modifySetting(key, newValue) {
        // Logger.debug("Change of game.settings requested by module:", key, "=>", newValue);
        game.settings.set(Config.data.modID, key, newValue);

        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        return new Promise(resolve => {
            resolve(this.gameSettingConfirmed(key, newValue));
        });
    }

    static async gameSettingConfirmed(key, expectedValue) {
        // Logger.debug(`expected: ${Config.data.modID}.${key} = ${expectedValue}`);
        let safetyCount = 0;
        while (safetyCount++ < 10 && game.settings.get(Config.data.modID, key) !== expectedValue) {
            await this.sleep(500);
        }
    }

    static async sleep(msec) {
        Logger.debug(`(Config.sleep) Waiting for ${msec} msec. Zzzzzz....`)
        return new Promise(resolve => setTimeout(resolve, msec));
    }

    /**
     * Returns the localized string for a given module scoped i18n key
     *
     * @ignore
     * @static
     * @param {*} key
     * @returns {string}
     * @memberof Config
     */
    static localize(key) {
        return game.i18n.localize(`${Config.data.modID}.${key}`);
    }

    static format(key, data) {
        return game.i18n.format(`${Config.data.modID}.${key}`, data);
    }

    static getGameMajorVersion() {
        return game.version.split('.')[0];
    }

    static isV13plus() {
        if (foundry?.utils?.isNewerVersion) {
            Logger.debug(`Foundry Version: ${game.version}`);
            // Check if we're on v13.x or higher.
            // Note the "newer than 13" comparison below may seem unintuitive, but it is actually correct, not "12":
            // Any 12x version like "12.3.4.3" would be treated as "newer" than "12", so we need to compare agains "13".
            // Also, there's never a "blank 13" version (without any subversion), so any 13.x will always be "newer" than 13.
            return foundry.utils.isNewerVersion(game.version, "13");
        } else {
            // v12 fallback: no foundry.utils namespace, so definitely not v13
            Logger.debug(`Foundry Version: ${game.data.version}`);
            return false;
        }
    }
}
