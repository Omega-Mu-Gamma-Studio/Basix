// ===== DOM REFS =====
const numberInput = document.getElementById('numberInput');
const fromBaseSelect = document.getElementById('fromBase');
const toBaseSelect = document.getElementById('toBase');
const customFromGroup = document.getElementById('customFromGroup');
const customToGroup = document.getElementById('customToGroup');
const customFromBase = document.getElementById('customFromBase');
const customToBase = document.getElementById('customToBase');
const operationSelect = document.getElementById('operationSelect');
const secondNumberGroup = document.getElementById('secondNumberGroup');
const secondNumber = document.getElementById('secondNumber');
const calculateBtn = document.getElementById('calculateBtn');
const showStepsCheck = document.getElementById('showStepsCheck');
const resultValue = document.getElementById('resultValue');
const stepsContainer = document.getElementById('stepsContainer');
const copyBtn = document.getElementById('copyBtn');
const themeSelect = document.getElementById('themeSelect');

// ===== THEME =====
function setTheme(theme) {
    document.body.className = 'theme-' + theme;
    localStorage.setItem('basix-theme', theme);
}
const savedTheme = localStorage.getItem('basix-theme') || 'dark-neon';
themeSelect.value = savedTheme;
setTheme(savedTheme);
themeSelect.addEventListener('change', (e) => setTheme(e.target.value));

// ===== CUSTOM BASE TOGGLES =====
function toggleCustomBase(select, group) {
    if (select.value === 'custom') {
        group.style.display = 'block';
    } else {
        group.style.display = 'none';
    }
}
fromBaseSelect.addEventListener('change', () => toggleCustomBase(fromBaseSelect, customFromGroup));
toBaseSelect.addEventListener('change', () => toggleCustomBase(toBaseSelect, customToGroup));
toggleCustomBase(fromBaseSelect, customFromGroup);
toggleCustomBase(toBaseSelect, customToGroup);

// ===== OPERATION TOGGLE =====
operationSelect.addEventListener('change', () => {
    const op = operationSelect.value;
    secondNumberGroup.style.display = (op === 'add' || op === 'subtract') ? 'block' : 'none';
});
operationSelect.dispatchEvent(new Event('change'));

// ===== GET BASES =====
function getBase(select, customInput) {
    if (select.value === 'custom') {
        return parseInt(customInput.value, 10);
    }
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

// ===== FIXED: CONVERT TO DECIMAL =====
function toDecimal(str, base) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const parts = str.split('.');
    const intPart = parts[0] || '0';
    const fracPart = parts[1] || '';
    const steps = [];

    // ---- Integer part ----
    let intValue = 0;
    for (let i = 0; i < intPart.length; i++) {
        const ch = intPart[i].toUpperCase();
        const val = digits.indexOf(ch);
        if (val === -1 || val >= base) {
            throw new Error(`Invalid digit '${ch}' for base ${base}`);
        }
        const pos = intPart.length - 1 - i;
        const place = val * Math.pow(base, pos);
        intValue += place;
        steps.push(`${ch} × ${base}^${pos} = ${place}`);
    }

    // ---- Fractional part ----
    let fracValue = 0;
    for (let i = 0; i < fracPart.length; i++) {
        const ch = fracPart[i].toUpperCase();
        const val = digits.indexOf(ch);
        if (val === -1 || val >= base) {
            throw new Error(`Invalid digit '${ch}' for base ${base}`);
        }
        const pos = -(i + 1);
        const place = val * Math.pow(base, pos);
        fracValue += place;
        steps.push(`${ch} × ${base}^(${pos}) = ${place.toFixed(6)}`);
    }

    const total = intValue + fracValue;
    return { value: total, intValue, fracValue, steps };
}

// ===== FIXED: FROM DECIMAL TO BASE =====
function fromDecimal(decimal, base, maxFrac = 10) {
    const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const steps = [];

    // Handle negative? Skip for now (DPSD usually unsigned)
    if (decimal < 0) {
        throw new Error('Negative numbers not supported in this version');
    }

    // ---- Integer part ----
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
            intSteps.push(`${temp} ÷ ${base} = ${Math.floor(temp / base)}  remainder ${rem} → ${digits[rem]}`);
            intResult = digits[rem] + intResult;
            temp = Math.floor(temp / base);
        }
        steps.push('Integer part (divide by base, collect remainders):');
        steps.push(...intSteps.reverse());
        steps.push(`→ Integer result: ${intResult}`);
    }

    // ---- Fractional part ----
    let fracResult = '';
    let fracSteps = [];
    let count = 0;
    while (fracPart > 0 && count < maxFrac) {
        fracPart *= base;
        const digit = Math.floor(fracPart);
        fracResult += digits[digit];
        fracSteps.push(`  ${(fracPart / base).toFixed(6)} × ${base} = ${fracPart.toFixed(6)} → digit ${digits[digit]}, remainder ${(fracPart - digit).toFixed(6)}`);
        fracPart -= digit;
        count++;
    }
    if (fracSteps.length > 0) {
        steps.push('Fractional part (multiply by base, collect integer digits):');
        steps.push(...fracSteps);
        steps.push(`→ Fraction result: ${fracResult}`);
    }
    if (fracPart > 0 && count === maxFrac) {
        steps.push(`... (truncated after ${maxFrac} digits)`);
    }

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
        steps.push(`  Bit ${pos}: ${bitA} + ${bitB} + carry ${carry} = ${sum} → write ${outBit}, carry ${newCarry}`);
        result = outBit + result;
        carry = newCarry;
    }
    if (carry) {
        result = '1' + result;
        steps.push(`Final carry → 1`);
    }

    return { value: result, steps };
}

function binarySubtract(a, b) {
    const steps = [];
    // 1's complement of b
    let bComp = '';
    for (let ch of b) bComp += (ch === '0' ? '1' : '0');
    steps.push(`1. 1's complement of ${b}: ${bComp}`);

    // 2's complement: add 1
    const addResult = binaryAdd(bComp, '1');
    const b2Comp = addResult.value;
    steps.push(`2. Add 1 → 2's complement: ${b2Comp}`);
    steps.push(`3. Add ${a} + ${b2Comp}:`);

    const finalAdd = binaryAdd(a, b2Comp);
    steps.push(...finalAdd.steps.slice(1));
    let result = finalAdd.value;

    // Discard overflow for n-bit result
    if (result.length > a.length) {
        result = result.slice(1);
        steps.push(`Discard overflow → ${result}`);
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
        steps.push(`  ${ch} → ${bin}`);
    }
    return { value: bcd.trim(), steps };
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

// ===== COMPLEMENTS =====
function complement(binary, type) {
    const steps = [];
    let result = '';
    if (type === 1) {
        for (let ch of binary) {
            result += (ch === '0' ? '1' : '0');
        }
        steps.push(`Flip each bit: ${binary} → ${result}`);
    } else {
        const oneComp = complement(binary, 1);
        steps.push(`1. 1's complement: ${oneComp.value}`);
        const addResult = binaryAdd(oneComp.value, '1');
        steps.push(`2. Add 1: ${oneComp.value} + 1 = ${addResult.value}`);
        result = addResult.value;
        // Pad to same length
        if (result.length < binary.length) {
            result = result.padStart(binary.length, '0');
        }
    }
    return { value: result, steps };
}

// ===== MAIN CALCULATE =====
calculateBtn.addEventListener('click', () => {
    const numStr = numberInput.value.trim();
    const op = operationSelect.value;
    const showSteps = showStepsCheck.checked;
    const fromBase = getBase(fromBaseSelect, customFromBase);
    const toBase = getBase(toBaseSelect, customToBase);

    // Validation
    if (!numStr) {
        resultValue.textContent = '⚠️ Enter a number';
        stepsContainer.innerHTML = '<div class="steps-placeholder"><p>Please enter a value</p></div>';
        return;
    }

    // Check valid digits for conversion ops
    if (op === 'convert' || op === 'bcd' || op === 'gray' || op === 'complement1' || op === 'complement2') {
        if (!isValidForBase(numStr, fromBase)) {
            resultValue.textContent = '⚠️ Invalid digits for base ' + fromBase;
            stepsContainer.innerHTML = `<div class="steps-placeholder"><p>Digits not allowed in base ${fromBase}</p></div>`;
            return;
        }
    }

    let result;
    let steps = [];
    let displayResult = '';

    try {
        switch (op) {
            case 'convert': {
                const dec = toDecimal(numStr, fromBase);
                const converted = fromDecimal(dec.value, toBase);
                displayResult = converted.value;
                steps = showSteps ? [...dec.steps, '--- Converted ---', ...converted.steps] : [];
                break;
            }
            case 'add': {
                const num2 = secondNumber.value.trim();
                if (!num2) { resultValue.textContent = '⚠️ Enter second number'; break; }
                if (!isValidForBase(num2, 2)) { resultValue.textContent = '⚠️ Invalid binary digits'; break; }
                const addRes = binaryAdd(numStr, num2);
                displayResult = addRes.value;
                steps = showSteps ? addRes.steps : [];
                break;
            }
            case 'subtract': {
                const num2 = secondNumber.value.trim();
                if (!num2) { resultValue.textContent = '⚠️ Enter second number'; break; }
                if (!isValidForBase(num2, 2)) { resultValue.textContent = '⚠️ Invalid binary digits'; break; }
                const subRes = binarySubtract(numStr, num2);
                displayResult = subRes.value;
                steps = showSteps ? subRes.steps : [];
                break;
            }
            case 'bcd': {
                const bcdRes = toBCD(numStr);
                displayResult = bcdRes.value;
                steps = showSteps ? bcdRes.steps : [];
                break;
            }
            case 'gray': {
                const grayRes = toGray(numStr);
                displayResult = grayRes.value;
                steps = showSteps ? grayRes.steps : [];
                break;
            }
            case 'complement1': {
                const compRes = complement(numStr, 1);
                displayResult = compRes.value;
                steps = showSteps ? compRes.steps : [];
                break;
            }
            case 'complement2': {
                const compRes = complement(numStr, 2);
                displayResult = compRes.value;
                steps = showSteps ? compRes.steps : [];
                break;
            }
            default: {
                resultValue.textContent = '⚠️ Unknown operation';
                steps = [];
            }
        }
    } catch (e) {
        resultValue.textContent = '⚠️ Error';
        stepsContainer.innerHTML = `<div class="steps-placeholder"><p>❌ ${e.message}</p></div>`;
        return;
    }

    resultValue.textContent = displayResult || '—';

    // Render steps
    if (showSteps && steps.length > 0) {
        stepsContainer.innerHTML = steps.map((s) => {
            const isAnswer = s.startsWith('→') || s.startsWith('---');
            const cls = isAnswer ? 'step-answer' : 'step-item';
            const arrow = isAnswer ? '' : '▸ ';
            return `<div class="${cls}">${arrow}${s}</div>`;
        }).join('');
        stepsContainer.scrollTop = stepsContainer.scrollHeight;
    } else if (showSteps && steps.length === 0) {
        stepsContainer.innerHTML = '<div class="steps-placeholder"><p>✅ Done (no detailed steps for this operation)</p></div>';
    } else {
        stepsContainer.innerHTML = '<div class="steps-placeholder"><p>👀 Steps hidden</p></div>';
    }
});

// ===== COPY =====
copyBtn.addEventListener('click', () => {
    const text = resultValue.textContent;
    if (text && text !== '—' && !text.startsWith('⚠️')) {
        navigator.clipboard?.writeText(text).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => copyBtn.textContent = '📋', 1500);
        }).catch(() => {});
    }
});

// ===== ENTER KEY =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calculateBtn.click();
});