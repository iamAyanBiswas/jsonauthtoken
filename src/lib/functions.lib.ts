import { SUPPORTED_ALGORITHM } from "../config/algo.config";
import encoading from "./encoading.lib";
import decoading from "./decoading.lib";
import { RUNTIME } from "../config/name.config"

function tokenFormatCreate<R extends Runtimes = Runtimes>(meta: TokenMetaData<R>, encrypted: string,): string {
    return `${encoading(meta)}:${encrypted}`
}

function tokenFormatVerify<R extends Runtimes = Runtimes>(token: string): { meta: TokenMetaData<R>; encrypted: string } {
    const index = token.indexOf(":");

    if (index === -1) {
        throw new Error("Invalid token format");
    }

    const metaPart = token.substring(0, index);
    const encryptedPart = token.substring(index + 1);

    const meta: TokenMetaData<R> = decoading(metaPart);

    if (!meta) {
        throw new Error("Invalid token format")
    }

    const algorithm = SUPPORTED_ALGORITHM[meta.runtime]?.find(e => e.name === meta.algo)

    if (!algorithm) {
        throw new Error("Invalid token format")
    }
    if (algorithm.type !== meta.type) {
        throw new Error("Invalid token format")
    }
    if (meta.type === 'asymmetric') {
        if (!meta.encryptedKey) {
            throw new Error("Invalid token format")
        }
    }
    if (!meta.iv) {
        throw new Error("Invalid token format")
    }
    if (!RUNTIME.includes(meta.runtime)) {
        throw new Error("Invalid token format")
    }
    if (meta.runtime === 'node') {
        if (!meta.tag) {
            throw new Error("Invalid token format")
        }
    }
    if (!meta.v) {
        throw new Error("Invalid token format")
    }


    return { meta, encrypted: encryptedPart };
}

function isExpired(timeStamp: number): boolean {
    let currentTime = Math.floor(Date.now() / 1000)
    if (timeStamp < currentTime) {
        return true
    }
    else {
        return false
    }
}


type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
function print({ dev = false, color = 'green' }: { dev?: boolean, color?: Color }, ...args: unknown[]): void {

    if (!dev) return

    const colors: Record<Color | 'reset', string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        reset: '\x1b[0m',
    };

    if (typeof window !== 'undefined') {
        // Browser or Edge: use CSS for coloring
        console.log(`%c[jsonauthtoken]`, `color:${color}`, ...args);
    } else {
        // Node: use ANSI codes
        const colorCode = colors[color] ?? colors.green;
        console.log(`${colorCode}[jsonauthtoken]`, ...args, '\x1b[0m'); // reset at end
    }
}


export { isExpired, tokenFormatCreate, tokenFormatVerify, print }