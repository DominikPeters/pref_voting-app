export function debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

export function sum(xs) {
    return xs.reduce((a, b) => a + b, 0);
}

export function round2(x) {
    return Math.round(x * 100) / 100;
}