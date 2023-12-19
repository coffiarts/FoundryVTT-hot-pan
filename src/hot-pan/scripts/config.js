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

    static init() {

        // Register all globally relevant game settings here
        const data = {
            modVersion: {
                scope: 'client', config: true, type: String, default: game.modules.get(MOD_ID).version,
                onChange: value => {
                    if (value !== game.modules.get(MOD_ID).version) {
                        // This "pseudo-setting" is meant for display only.
                        // So we always want to snap back to its default on change
                        game.settings.set(Config.data.modID, `modVersion`, game.modules.get(MOD_ID).version);
                    }
                }
            },
            isActive: {
                scope: 'world', config: true, type: Boolean, default: false,
            },
            notifyOnChange: {
                scope: 'world', config: true, type: Boolean, default: true
            },
            warnWhenON: {
                scope: 'world', config: true, type: Boolean, default: true
            },
            warnWhenOFF: {
                scope: 'world', config: true, type: Boolean, default: false
            }
        };
        Config.registerSettings(data);

        // Whenever loading up, we need to adjust the "pseudo-setting" modVersion once to the current value from
        // the manifest. Otherwise, module updates won't be reflected in its value (users would always see their first
        // installed version ever in the settings menu).
        game.settings.set(Config.data.modID, 'modVersion', game.modules.get(MOD_ID).version);
        Logger.debug("(init) Settings registered)");

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
            Logger.debug("(registerSettings) Game Setting registered:", name);
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
        while (safetyCount++ <10 && game.settings.get(Config.data.modID, key) !== expectedValue) {
            await this.sleep(500);
        }
    }

    static async sleep(msec) {
        Logger.debug(`(sleep) Waiting for ${msec} msec. Zzzzzz....`)
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


}
