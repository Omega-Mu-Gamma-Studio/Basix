// ===== DOM REFS =====
const numberInput = document.getElementById('numberInput');
const numberInputLabel = document.getElementById('numberInputLabel');
const fromBaseSelect = document.getElementById('fromBase');
const toBaseSelect = document.getElementById('toBase');
const baseFieldsRow = document.getElementById('baseFieldsRow');
const toBaseFieldsRow = document.getElementById('toBaseFieldsRow');
const customFromGroup = document.getElementById('customFromGroup');
const customToGroup = document.getElementById('customToGroup');
const customFromBase = document.getElementById('customFromBase');
const customToBase = document.getElementById('customToBase');
const operationSelect = document.getElementById('operationSelect');
const secondNumberGroup = document.getElementById('secondNumberGroup');
const secondNumber = document.getElementById('secondNumber');
const asciiGroup = document.getElementById('asciiGroup');
const asciiDirection = document.getElementById('asciiDirection');
const asciiEncoding = document.getElementById('asciiEncoding');
const calculateBtn = document.getElementById('calculateBtn');
const showStepsCheck = document.getElementById('showStepsCheck');
const resultValue = document.getElementById('resultValue');
const resultText = document.getElementById('resultText');
const stepsContainer = document.getElementById('stepsContainer');
const copyBtn = document.getElementById('copyBtn');
const copyStepsBtn = document.getElementById('copyStepsBtn');
const themeToggle = document.getElementById('themeToggle');
const historyHeader = document.getElementById('historyHeader');
const historyList = document.getElementById('historyList');
const historyToggleIcon = document.getElementById('historyToggleIcon');

// ===== THEME (Ruled Notebook / Graph Paper) =====
const THEME_LABEL = { ruled: '🟩 Try Graph Paper', grid: '📓 Try Ruled Paper' };
function setTheme(theme) {
    document.body.className = 'theme-' + theme;
    themeToggle.textContent = THEME_LABEL[theme];
    localStorage.setItem('basix-theme', theme);
}
const savedTheme = localStorage.getItem('basix-theme') || 'ruled';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
    const current = document.body.className.replace('theme-', '');
    setTheme(current === 'ruled' ? 'grid' : 'ruled');
});

// ===== CUSTOM BASE TOGGLES =====
function toggleCustomBase(select, group) {
    group.style.display = select.value === 'custom' ? 'flex' : 'none';
}
fromBaseSelect.addEventListener('change', () => toggleCustomBase(fromBaseSelect, customFromGroup));
toBaseSelect.addEventListener('change', () => toggleCustomBase(toBaseSelect, customToGroup));
toggleCustomBase(fromBaseSelect, customFromGroup);
toggleCustomBase(toBaseSelect, customToGroup);

// ===== OPERATION CATEGORIES =====
const BINARY_OPS = ['add', 'subtract', 'bcd', 'gray', 'complement1', 'complement2', 'interpSM', 'interp1C', 'interp2C'];
const DECIMAL_DIGIT_OPS = ['excess3', 'comp9', 'comp10'];
const OP_LABELS = {
    convert: 'Convert', ascii: 'ASCII', add: 'Add', subtract: 'Subtract', bcd: 'BCD', gray: 'Gray',
    excess3: 'Excess-3', complement1: "1's Comp", complement2: "2's Comp", comp9: "9's Comp", comp10: "10's Comp",
    interpSM: 'Sign-Mag', interp1C: '1C Interp', interp2C: '2C Interp', ieee754: 'IEEE-754'
};
const NUMBER_PLACEHOLDERS = {
    convert: 'e.g. 1011.101', add: 'e.g. 1011', subtract: 'e.g. 1011', bcd: 'e.g. 1001',
    gray: 'e.g. 1011', excess3: 'e.g. 259', complement1: 'e.g. 1011', complement2: 'e.g. 1011',
    comp9: 'e.g. 4831', comp10: 'e.g. 4831', interpSM: 'e.g. 10000101', interp1C: 'e.g. 11111010',
    interp2C: 'e.g. 11111011', ieee754: 'e.g. -13.25', ascii: 'e.g. Hi there'
};

function updateFieldsForOperation() {
    const op = operationSelect.value;
    const isConvert = op === 'convert';
    const isAddSub = op === 'add' || op === 'subtract';
    const isAscii = op === 'ascii';

    baseFieldsRow.style.display = isConvert ? 'flex' : 'none';
    toBaseFieldsRow.style.display = isConvert ? 'flex' : 'none';
    secondNumberGroup.style.display = isAddSub ? 'block' : 'none';
    asciiGroup.style.display = isAscii ? 'flex' : 'none';

    numberInputLabel.textContent = isAscii
        ? (asciiDirection.value === 'encode' ? 'Text' : 'Code (space-separated)')
        : 'Number';
    numberInput.placeholder = NUMBER_PLACEHOLDERS[op] || 'e.g. 1011';
}
operationSelect.addEventListener('change', updateFieldsForOperation);
asciiDirection.addEventListener('change', updateFieldsForOperation);
updateFieldsForOperation();

// ===== GET BASES =====
function getBase(select, customInput) {
    if (select.value === 'custom') return parseInt(customInput.value, 10);
    return parseInt(select.value, 10);
}

// ===== VALIDATE DIGITS =====
function isValidForBase(str, base) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allowed = digits.slice(0, base);
    const upper = str.toUpperCase();
    for (let ch of upper) {
        if (ch === '.') continue;
        if (!allowed.includes(ch)) return false;
    }
    return true;
}

// ===== CONVERT TO DECIMAL =====
function toDecimal(str, base) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const parts = str.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    const steps = [];

    let intValue = 0;
    for (let i = 0; i < intPart.length; i++) {
        const ch = intPart[i].toUpperCase();
        const val = digits.indexOf(ch);
        if (val === -1 || val >= base) throw new Error(`Invalid digit '${ch}' for base ${base}`);
        const pos = intPart.length - 1 - i;
        const place = val * Math.pow(base, pos);
        intValue += place;
        steps.push(`${ch} × ${base}^${pos} = ${place}`);
    }

    let fracValue = 0;
    for (let i = 0; i < fracPart.length; i++) {
        const ch = fracPart[i].toUpperCase();
        const val = digits.indexOf(ch);
        if (val === -1 || val >= base) throw new Error(`Invalid digit '${ch}' for base ${base}`);
        const pos = -(i + 1);
        const place = val * Math.pow(base, pos);
        fracValue += place;
        steps.push(`${ch} × ${base}^(${pos}) = ${place.toFixed(6)}`);
    }

    const total = intValue + fracValue;
    return { value: total, intValue, fracValue, steps };
}

// ===== FROM DECIMAL TO BASE =====
function fromDecimal(decimal, base, maxFrac = 10) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const steps = [];
    if (decimal < 0) throw new Error('Negative numbers not supported for base conversion');

    let intPart = Math.floor(decimal);
    let fracPart = decimal - intPart;
    let intResult = '';
    let temp = intPart;

    if (temp === 0) {
        intResult = '0';
        steps.push('Integer part: 0 → "0"');
    } else {
        const intSteps = [];
        while (temp > 0) {
            const rem = temp % base;
            intSteps.push(`${temp} ÷ ${base} = ${Math.floor(temp / base)} remainder ${rem} → ${digits[rem]}`);
            intResult = digits[rem] + intResult;
            temp = Math.floor(temp / base);
        }
        steps.push('Divide by base, collect remainders:');
        steps.push(...intSteps.reverse());
        steps.push(`→ Integer result: ${intResult}`);
    }

    let fracResult = '';
    let fracSteps = [];
    let count = 0;
    while (fracPart > 0 && count < maxFrac) {
        fracPart *= base;
        const digit = Math.floor(fracPart);
        fracResult += digits[digit];
        fracSteps.push(`${(fracPart / base).toFixed(6)} × ${base} = ${fracPart.toFixed(6)} → digit ${digits[digit]}`);
        fracPart -= digit;
        count++;
    }
    if (fracSteps.length > 0) {
        steps.push('Multiply by base, collect integer digits:');
        steps.push(...fracSteps);
        steps.push(`→ Fraction result: ${fracResult}`);
    }
    if (fracPart > 0 && count === maxFrac) steps.push(`... (truncated after ${maxFrac} digits)`);

    const result = intResult + (fracResult ? '.' + fracResult : '');
    return { value: result, steps };
}

// ===== BINARY ARITHMETIC =====
function binaryAdd(a, b) {
    const steps = [];
    let carry = 0;
    let result = '';
    const maxLen = Math.max(a.length, b.length);
    let aPadded = a.padStart(maxLen, '0');
    let bPadded = b.padStart(maxLen, '0');
    steps.push(`Align: ${aPadded} + ${bPadded}`);

    for (let k = maxLen - 1; k >= 0; k--) {
        const bitA = parseInt(aPadded[k], 10);
        const bitB = parseInt(bPadded[k], 10);
        const sum = bitA + bitB + carry;
        const outBit = sum % 2;
        const newCarry = Math.floor(sum / 2);
        const pos = maxLen - 1 - k;
        steps.push(`Bit ${pos}: ${bitA} + ${bitB} + carry ${carry} = ${sum} → write ${outBit}, carry ${newCarry}`);
        result = outBit + result;
        carry = newCarry;
    }
    if (carry) {
        result = '1' + result;
        steps.push(`Final carry → 1`);
    }
    return { value: result, steps };
}

// FIXED: pad a and b to equal width *before* complementing, so the two's-complement
// trick is computed at the correct bit-width instead of silently zero-extending
// an under-width complement (which previously gave wrong answers whenever the two
// operands had different lengths).
function binarySubtract(a, b) {
    const steps = [];
    const maxLen = Math.max(a.length, b.length);
    const aPadded = a.padStart(maxLen, '0');
    const bPadded = b.padStart(maxLen, '0');
    if (a.length !== b.length) steps.push(`Pad to equal width (${maxLen} bits): ${aPadded} and ${bPadded}`);

    let bComp = '';
    for (let ch of bPadded) bComp += (ch === '0' ? '1' : '0');
    steps.push(`1's complement of ${bPadded}: ${bComp}`);

    const addResult = binaryAdd(bComp, '1');
    const b2Comp = addResult.value.padStart(maxLen, '0').slice(-maxLen);
    steps.push(`Add 1 → 2's complement: ${b2Comp}`);
    steps.push(`Add ${aPadded} + ${b2Comp}:`);

    const finalAdd = binaryAdd(aPadded, b2Comp);
    steps.push(...finalAdd.steps.slice(1));
    let result = finalAdd.value;

    if (result.length > maxLen) {
        result = result.slice(result.length - maxLen);
        steps.push(`Discard overflow bit → ${result}`);
    }
    return { value: result, steps };
}

// ===== BCD =====
function toBCD(binary) {
    const dec = toDecimal(binary, 2);
    const decStr = dec.value.toString();
    const steps = [];
    const digits = '0123456789';
    let bcd = '';
    steps.push(`Binary → Decimal: ${binary} = ${decStr}`);
    steps.push('Convert each decimal digit to 4-bit BCD:');
    for (let ch of decStr) {
        const val = digits.indexOf(ch);
        const bin = val.toString(2).padStart(4, '0');
        bcd += bin + ' ';
        steps.push(`${ch} → ${bin}`);
    }
    return { value: bcd.trim(), steps };
}

// ===== EXCESS-3 =====
function toExcess3(decStr) {
    const steps = [];
    const digits = '0123456789';
    let result = '';
    for (let ch of decStr) {
        const val = digits.indexOf(ch);
        if (val === -1) throw new Error(`'${ch}' is not a decimal digit`);
        const x = val + 3;
        const bin = x.toString(2).padStart(4, '0');
        result += bin + ' ';
        steps.push(`${ch} + 3 = ${x} → ${bin}`);
    }
    return { value: result.trim(), steps };
}

// ===== GRAY CODE =====
function toGray(binary) {
    const steps = [];
    let gray = binary[0];
    steps.push(`MSB stays: ${binary[0]} → ${gray}`);
    for (let i = 1; i < binary.length; i++) {
        const bit = (parseInt(binary[i - 1], 10) ^ parseInt(binary[i], 10)).toString();
        gray += bit;
        steps.push(`${binary[i - 1]} ⊕ ${binary[i]} = ${bit} → ${gray}`);
    }
    return { value: gray, steps };
}

// ===== COMPLEMENT (operation on a bit/digit string) =====
function complement(binary, type) {
    const steps = [];
    let result = '';
    if (type === 1) {
        for (let ch of binary) result += (ch === '0' ? '1' : '0');
        steps.push(`Flip each bit: ${binary} → ${result}`);
    } else {
        const oneComp = complement(binary, 1);
        steps.push(`1's complement: ${oneComp.value}`);
        const addResult = binaryAdd(oneComp.value, '1');
        result = addResult.value.padStart(binary.length, '0').slice(-binary.length);
        steps.push(`Add 1: ${oneComp.value} + 1 = ${result}`);
    }
    return { value: result, steps };
}

// ===== 9's / 10's COMPLEMENT (decimal) =====
function decimalAddOne(str) {
    let digits = str.split('').map(Number);
    let carry = 1;
    for (let i = digits.length - 1; i >= 0 && carry; i--) {
        const sum = digits[i] + carry;
        digits[i] = sum % 10;
        carry = Math.floor(sum / 10);
    }
    return (carry ? '1' : '') + digits.join('');
}
function complementDecimal(decStr, type) {
    const steps = [];
    let nines = '';
    for (let ch of decStr) {
        const val = parseInt(ch, 10);
        if (isNaN(val)) throw new Error(`'${ch}' is not a decimal digit`);
        nines += (9 - val);
    }
    steps.push(`9's complement — subtract each digit from 9: ${decStr} → ${nines}`);
    if (type === 9) return { value: nines, steps };
    const tens = decimalAddOne(nines);
    steps.push(`10's complement — add 1: ${nines} + 1 = ${tens}`);
    return { value: tens, steps };
}

// ===== SIGNED INTERPRETATION =====
function interpretSigned(binary, mode) {
    const steps = [];
    const msb = binary[0];
    if (mode === 'sm') {
        const magBits = binary.slice(1) || '0';
        const magVal = parseInt(magBits, 2);
        steps.push(`Sign bit: ${msb} → ${msb === '1' ? 'negative' : 'positive'}`);
        steps.push(`Magnitude bits: ${magBits} = ${magVal}`);
        const value = msb === '1' ? -magVal : magVal;
        steps.push(`→ Value = ${value}`);
        return { value: String(value), steps };
    }
    if (msb === '0') {
        const value = parseInt(binary, 2);
        steps.push(`Sign bit: 0 → positive`);
        steps.push(`→ Value = ${value}`);
        return { value: String(value), steps };
    }
    // negative, mode is 1c or 2c
    let flip = '';
    for (let ch of binary) flip += (ch === '0' ? '1' : '0');
    steps.push(`Sign bit: 1 → negative`);
    steps.push(`Flip all bits: ${binary} → ${flip}`);
    if (mode === '1c') {
        const magVal = parseInt(flip, 2);
        steps.push(`→ Value = -${magVal}`);
        return { value: String(-magVal), steps };
    }
    const plusOne = binaryAdd(flip, '1').value.padStart(binary.length, '0').slice(-binary.length);
    steps.push(`Add 1: ${flip} + 1 = ${plusOne}`);
    const magVal = parseInt(plusOne, 2);
    steps.push(`→ Value = -${magVal}`);
    return { value: String(-magVal), steps };
}

// ===== IEEE-754 SINGLE PRECISION =====
function toIEEE754(decStr) {
    const steps = [];
    const num = parseFloat(decStr);
    if (isNaN(num)) throw new Error(`'${decStr}' is not a valid number`);
    const sign = num < 0 || Object.is(num, -0) ? 1 : 0;
    steps.push(`Sign: ${num} is ${sign ? 'negative' : 'positive or zero'} → bit ${sign}`);

    if (num === 0) {
        steps.push('Zero → exponent and mantissa are all 0');
        return { value: `${sign} 00000000 00000000000000000000000`, steps };
    }

    let abs = Math.abs(num);
    let exponent = 0;
    let mantissaVal = abs;
    while (mantissaVal >= 2) { mantissaVal /= 2; exponent++; }
    while (mantissaVal < 1) { mantissaVal *= 2; exponent--; }
    steps.push(`Normalize: ${abs} = 1.${(mantissaVal - 1).toFixed(6).slice(2)}... × 2^${exponent}`);

    const biased = exponent + 127;
    steps.push(`Biased exponent: ${exponent} + 127 = ${biased} → ${biased.toString(2).padStart(8, '0')}`);

    let frac = mantissaVal - 1;
    let mantissaBits = '';
    for (let i = 0; i < 23; i++) {
        frac *= 2;
        const bit = Math.floor(frac);
        mantissaBits += bit;
        frac -= bit;
    }
    steps.push(`Mantissa (23 bits, fractional part doubled repeatedly): ${mantissaBits}`);

    const expBits = biased.toString(2).padStart(8, '0');
    steps.push(`→ sign | exponent | mantissa = ${sign} | ${expBits} | ${mantissaBits}`);
    return { value: `${sign} ${expBits} ${mantissaBits}`, steps };
}

// ===== ASCII =====
function asciiEncode(text, base) {
    const steps = [];
    const parts = [];
    for (let ch of text) {
        const code = ch.charCodeAt(0);
        const encoded = base === 2 ? code.toString(2).padStart(8, '0') : code.toString(16).padStart(2, '0').toUpperCase();
        parts.push(encoded);
        steps.push(`'${ch === ' ' ? '(space)' : ch}' → code ${code} → ${encoded}`);
    }
    return { value: parts.join(' '), steps };
}
function asciiDecode(codeStr, base) {
    const steps = [];
    const tokens = codeStr.trim().split(/\s+/);
    let text = '';
    for (let tok of tokens) {
        const code = parseInt(tok, base);
        if (isNaN(code)) throw new Error(`'${tok}' is not valid ${base === 2 ? 'binary' : 'hex'}`);
        const ch = String.fromCharCode(code);
        text += ch;
        steps.push(`${tok} → ${code} → '${ch === ' ' ? '(space)' : ch}'`);
    }
    return { value: text, steps };
}

// ===== HISTORY (in-memory, this session only) =====
const history = [];
function pushHistory(entry) {
    history.unshift(entry);
    if (history.length > 10) history.pop();
    renderHistory();
}
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Nothing worked out yet</div>';
        return;
    }
    historyList.innerHTML = history.map((h, i) => `
        <button class="history-row" data-idx="${i}" type="button">
            <span class="h-op">${OP_LABELS[h.op] || h.op}: ${escapeHtml(h.input.length > 14 ? h.input.slice(0, 14) + '…' : h.input)}</span>
            <span class="h-result">${escapeHtml(h.result.length > 20 ? h.result.slice(0, 20) + '…' : h.result)}</span>
        </button>
    `).join('');
}
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
historyList.addEventListener('click', (e) => {
    const row = e.target.closest('.history-row');
    if (!row) return;
    const h = history[parseInt(row.dataset.idx, 10)];
    if (!h) return;
    operationSelect.value = h.op;
    updateFieldsForOperation();
    numberInput.value = h.input;
    fromBaseSelect.value = h.fromBase || '10';
    toBaseSelect.value = h.toBase || '10';
    toggleCustomBase(fromBaseSelect, customFromGroup);
    toggleCustomBase(toBaseSelect, customToGroup);
    secondNumber.value = h.secondNumber || '';
    asciiDirection.value = h.asciiDirection || 'encode';
    asciiEncoding.value = h.asciiEncoding || '2';
    updateFieldsForOperation();
    calculateBtn.click();
});
historyHeader.addEventListener('click', () => {
    historyList.classList.toggle('collapsed');
    historyToggleIcon.textContent = historyList.classList.contains('collapsed') ? '▸' : '▾';
});

// ===== MAIN CALCULATE =====
let lastSteps = [];
calculateBtn.addEventListener('click', () => {
    const numStr = numberInput.value.trim();
    const op = operationSelect.value;
    const showSteps = showStepsCheck.checked;
    const fromBase = getBase(fromBaseSelect, customFromBase);
    const toBase = getBase(toBaseSelect, customToBase);

    function showError(msg) {
        resultText.textContent = '⚠️ ' + msg;
        resultValue.classList.add('error');
        resultValue.classList.remove('written');
        stepsContainer.innerHTML = `<div class="steps-placeholder"><p>${escapeHtml(msg)}</p></div>`;
    }

    if (!numStr) return showError('Enter a value first');

    if (op === 'convert') {
        if (!isValidForBase(numStr, fromBase)) return showError(`Invalid digits for base ${fromBase}`);
    } else if (BINARY_OPS.includes(op)) {
        if (!isValidForBase(numStr, 2)) return showError('Only 0s and 1s allowed for this operation');
    } else if (DECIMAL_DIGIT_OPS.includes(op)) {
        if (!isValidForBase(numStr, 10)) return showError('Only decimal digits allowed for this operation');
    }

    let steps = [];
    let displayResult = '';

    try {
        switch (op) {
            case 'convert': {
                const dec = toDecimal(numStr, fromBase);
                const converted = fromDecimal(dec.value, toBase);
                displayResult = converted.value;
                steps = [...dec.steps, `→ In base ${fromBase}, that's the decimal value ${dec.value}`, ...converted.steps];
                break;
            }
            case 'add': {
                const num2 = secondNumber.value.trim();
                if (!num2) return showError('Enter the second number');
                if (!isValidForBase(num2, 2)) return showError('Second number must be binary');
                const r = binaryAdd(numStr, num2);
                displayResult = r.value; steps = r.steps;
                break;
            }
            case 'subtract': {
                const num2 = secondNumber.value.trim();
                if (!num2) return showError('Enter the second number');
                if (!isValidForBase(num2, 2)) return showError('Second number must be binary');
                const r = binarySubtract(numStr, num2);
                displayResult = r.value; steps = r.steps;
                break;
            }
            case 'bcd': { const r = toBCD(numStr); displayResult = r.value; steps = r.steps; break; }
            case 'excess3': { const r = toExcess3(numStr); displayResult = r.value; steps = r.steps; break; }
            case 'gray': { const r = toGray(numStr); displayResult = r.value; steps = r.steps; break; }
            case 'complement1': { const r = complement(numStr, 1); displayResult = r.value; steps = r.steps; break; }
            case 'complement2': { const r = complement(numStr, 2); displayResult = r.value; steps = r.steps; break; }
            case 'comp9': { const r = complementDecimal(numStr, 9); displayResult = r.value; steps = r.steps; break; }
            case 'comp10': { const r = complementDecimal(numStr, 10); displayResult = r.value; steps = r.steps; break; }
            case 'interpSM': { const r = interpretSigned(numStr, 'sm'); displayResult = r.value; steps = r.steps; break; }
            case 'interp1C': { const r = interpretSigned(numStr, '1c'); displayResult = r.value; steps = r.steps; break; }
            case 'interp2C': { const r = interpretSigned(numStr, '2c'); displayResult = r.value; steps = r.steps; break; }
            case 'ieee754': { const r = toIEEE754(numStr); displayResult = r.value; steps = r.steps; break; }
            case 'ascii': {
                const base = parseInt(asciiEncoding.value, 10);
                const r = asciiDirection.value === 'encode' ? asciiEncode(numStr, base) : asciiDecode(numStr, base);
                displayResult = r.value; steps = r.steps;
                break;
            }
            default: return showError('Unknown operation');
        }
    } catch (e) {
        return showError(e.message);
    }

    resultText.textContent = displayResult || '—';
    resultValue.classList.remove('error', 'written');
    // slight delay before "circling" the answer, like a pen finishing the loop
    requestAnimationFrame(() => requestAnimationFrame(() => resultValue.classList.add('written')));

    lastSteps = steps;
    if (showSteps && steps.length > 0) {
        stepsContainer.innerHTML = steps.map((s, i) => {
            const isAnswer = s.startsWith('→');
            const delay = Math.min(i * 45, 900);
            return `<div class="step-line${isAnswer ? ' answer-line' : ''}" style="animation-delay:${delay}ms"><span class="step-marker">${isAnswer ? '' : '·'}</span>${escapeHtml(s)}</div>`;
        }).join('');
        stepsContainer.scrollTop = 0;
    } else if (showSteps) {
        stepsContainer.innerHTML = '<div class="steps-placeholder"><p>Done — nothing more to show here</p></div>';
    } else {
        stepsContainer.innerHTML = '<div class="steps-placeholder"><p>Working hidden</p></div>';
    }

    pushHistory({
        op, input: numStr, result: displayResult,
        fromBase: fromBaseSelect.value, toBase: toBaseSelect.value,
        secondNumber: secondNumber.value, asciiDirection: asciiDirection.value, asciiEncoding: asciiEncoding.value
    });
});

// ===== COPY RESULT =====
copyBtn.addEventListener('click', () => {
    const text = resultText.textContent;
    if (text && text !== '—' && !text.startsWith('⚠️')) {
        navigator.clipboard?.writeText(text).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => copyBtn.textContent = '📋', 1500);
        }).catch(() => {});
    }
});

// ===== COPY STEPS =====
copyStepsBtn.addEventListener('click', () => {
    if (lastSteps.length === 0) return;
    const text = lastSteps.join('\n');
    navigator.clipboard?.writeText(text).then(() => {
        const original = copyStepsBtn.textContent;
        copyStepsBtn.textContent = 'Copied!';
        setTimeout(() => copyStepsBtn.textContent = original, 1500);
    }).catch(() => {});
});

// ===== ENTER KEY =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculateBtn.click();
});
