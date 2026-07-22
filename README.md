# 📓 Basix

**A notebook for number systems.**

Basix is a small, single-page web app that does the tedious part of Digital Principles & System Design (DPSD) homework for you — base conversions, binary arithmetic, complements, codes, and IEEE-754 — and shows its work like a good notebook should, one worked "page" at a time.

🔗 **Live demo:** [basix-calc.vercel.app](https://basix-calc.vercel.app)

---

## Why this exists

If you've ever sat down to convert `1011.101` from binary to decimal, then had to double check your 2's complement by hand, then got asked to encode "Hi there" into 8-bit binary, you know the drill: it's not *hard*, it's just repetitive, and one dropped bit ruins the whole answer. Basix is built to be the calculator you wish you had during DPSD lab sessions — one that shows every step, not just the final number, so you can actually check your own work instead of just copying an answer.

## Features

- **Base conversion** — binary, octal, decimal, hexadecimal, or any custom base from 2–36, with support for fractional values (e.g. `1011.101`)
- **Binary arithmetic** — addition and subtraction with full carry/borrow working shown
- **ASCII ⇄ Code** — encode text to binary or hex, or decode it back to text
- **Number system codes** — Binary → BCD, Decimal → Excess-3, Binary → Gray Code
- **Representations & complements** — 1's and 2's complement (both "flip the bits" and full arithmetic operations), 9's and 10's complement for decimal, and interpreting a raw bit pattern as sign-magnitude, 1's complement, or 2's complement
- **IEEE-754 single-precision float** — break a decimal number down into sign, exponent, and mantissa
- **"Show working" toggle** — see the full step-by-step derivation, or just the final answer if you're in a hurry
- **Copy buttons** — grab the answer or the entire working, one click, no highlight-and-drag required
- **History ("Earlier pages")** — every problem you've worked through this session is saved so you can scroll back through it, notebook-style
- **Ruled paper / graph paper themes** — a little toggle in the header switches the whole app's look, and remembers your choice via `localStorage`

## Tech stack

Nothing fancy, and that's the point:

- **HTML** for structure (`index.html`)
- **CSS** for the notebook look, including the ruled/graph paper themes (`style.css`)
- **Vanilla JavaScript** for every conversion, calculation, and bit of interactivity (`app.js`)

No frameworks, no bundler, no `npm install`, no build step. Open it and it just works.

## Getting started

Clone it and open the file — that's the whole setup process:

```bash
git clone https://github.com/Omega-Mu-Gamma-Studio/Basix.git
cd Basix
```

Then either:
- Double-click `index.html` to open it directly in your browser, or
- Serve it locally for a nicer dev experience (avoids some browser file:// quirks):

```bash
# Python
python3 -m http.server 8000

# or Node, if you have it
npx serve .
```

...then visit `http://localhost:8000` (or whatever port your tool of choice prints out).

## Project structure

```
Basix/
├── index.html      # Page structure: input panel, output panel, header, footer
├── style.css        # Notebook styling + ruled/graph paper themes
├── app.js            # All the logic — conversions, arithmetic, codes, history, theming
├── assets/
│   └── fonts/       # Bundled fonts used for the notebook aesthetic
├── LICENSE           # MIT
└── README.md
```

## How to use it

1. Type a number into the **Number** field.
2. Pick an **Operation** — conversion, arithmetic, a code, or a representation/complement task. The form adapts to show only the fields that operation actually needs (e.g. a "From Base"/"To Base" pair for conversions, a second number field for add/subtract).
3. Hit **Work it out →**.
4. Read the answer at the top of the right-hand page, and the full step-by-step working underneath — or switch off "Show working" if you just want the number.
5. Copy either the answer or the working with one click, and find it again later in **Earlier pages**.

## Contributing

This is a small student-project-turned-tool, so contributions are welcome but keep it simple:

1. Fork the repo
2. Make your change in a branch
3. Test it by literally just opening `index.html` — there's no build step to worry about
4. Open a pull request describing what you changed and why

Bug reports and "hey, you got this operation wrong" issues are especially appreciated — the whole point of this tool is that it needs to be *correct*.

## License

MIT — see [LICENSE](./LICENSE) for the full text. Built for DPSD students, by Omega Mu Gamma Studio, © 2026.
