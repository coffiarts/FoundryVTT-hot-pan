import {Logger} from './logger.js';

// keep values in sync with module.json!
const MOD_NAME = "hot-pan";
const MOD_PATH = `/modules/${MOD_NAME}`;
const MOD_TITLE = "Hot Pan & Zoom!";
const MOD_DESCRIPTION = "One Mod to Pan Them! One Mod to Zoom Them! One Mod to Find them and to the GM's Canvas Bind Them!";
const MOD_LINK = `https://github.com/coffiarts/FoundryVTT-hot-pan`;

export class Config {
    static data = {
        // keep these values in sync with your module.json!
        modName: MOD_NAME,
        modPath: MOD_PATH,
        modTitle: MOD_TITLE,
        modDescription: MOD_DESCRIPTION,
        modlink: MOD_LINK
    };

    static async init() {
        // Register all globally relevant game settings here
        const data = {
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
    }

    static registerSettings(settingsData) {
        Object.entries(settingsData).forEach(([key, data]) => {
            let name = Config.localize(`setting.${key}.name`);
            let hint = Config.localize(`setting.${key}.hint`);
            game.settings.register(
                Config.data.modName, key, {
                    name: name,
                    hint: hint,
                    ...data
                }
            );
            Logger.info("Game Setting registered:", name);
        });
    }

    static setting(key) {
        return game.settings.get(Config.data.modName, key);
    }

    static async modifySetting(key, newValue) {
        Logger.debug("Change of game.settings requested by module:", key, "=>", newValue);
        game.settings.set(Config.data.modName, key, newValue);

        // It turned out to be much more stable here by waiting for game.settings to be updated.
        // Might be an ugly workaround, better ideas welcome!
        return new Promise(resolve => {
            resolve(this.gameSettingConfirmed(key, newValue));
        });
    }

    static async gameSettingConfirmed(key, expectedValue) {
        while (game.settings.get(Config.data.modName, key) !== expectedValue) {
            await this.sleep(500);
        }
    }

    static async sleep(msec) {
        Logger.debug(`Waiting for ${msec} msec. Zzzzzz....`)
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
        return game.i18n.localize(`${Config.data.modName}.${key}`);
    }

    static format(key, data) {
        return game.i18n.format(`${Config.data.modName}.${key}`, data);
    }


}
