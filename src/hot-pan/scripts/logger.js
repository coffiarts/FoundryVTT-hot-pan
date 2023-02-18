/*
 * MIT License
 *
 * Copyright (c) 2020-2021 DnD5e Helpers Team and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Config } from './config.js'

export class Logger {

    static init(){
        // Here is the space for registering any game settings relevant for this very component (i.e. Logger)
        const config = true;
        const settingsData = {
            debug : {
                scope: "client", config, type: Boolean, default: false,
            },
        };
        Config.registerSettings(settingsData);
    }
    static info(...args) {
        console.log(`${Config?.data?.modTitle ?? "" }  | `, ...args);
    }
    static debug(...args) {
        if (Config.setting('debug'))
            console.debug(`${Config?.data?.modTitle ?? "" }  | DEBUG | `, ...args);
    }

    static warn(...args) {
        console.warn(`${Config?.data?.modTitle ?? "" } | WARNING | `, ...args);
        ui.notifications.warn(`${Config?.data?.modTitle ?? "" } | WARNING | ${args[0]}`);
    }

    static error(...args) {
        console.error(`${Config?.data?.modTitle ?? "" } | ERROR | `, ...args);
        ui.notifications.error(`${Config?.data?.modTitle ?? "" } | ERROR | ${args[0]}`);
    }

    static catchThrow(thrown, toastMsg = undefined) {
        console.warn(thrown);
        if(toastMsg) Logger.error(toastMsg);
    }
}
