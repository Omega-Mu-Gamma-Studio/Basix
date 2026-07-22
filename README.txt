Basix bugfix bundle
====================

1) app.js NaN fix
   Apply from the repo root:
     git apply basix-nan-fix.patch
   (or open basix-nan-fix.patch and copy the +lines in by hand)

   What it fixes: Add/Subtract/Gray/Complement/9s-10s-complement all
   validated input using isValidForBase(), which explicitly SKIPS the
   '.' character for every base. So a fractional binary number like
   "1011.101" passed validation for Add/Subtract, then hit
   parseInt('.', 10) inside binaryAdd's bit loop -> NaN -> every
   subsequent carry becomes NaN too, giving the "NaNNaNNaN..." output.
   Gray Code and Complement had the same root cause but it was worse:
   parseInt('.',10) is NaN, and NaN ^ NaN evaluates to 0 in JS, so
   Gray Code silently wrote a wrong 0 bit instead of erroring.
   Complement's flip check (ch === '0' ? '1' : '0') also silently
   turned '.' into '0'. Both are now checked up front and inside the
   functions themselves, with a clear error message instead of a
   silent wrong answer or NaN.

2) assets/fonts/*.woff2
   Drop these into assets/fonts/ in the repo (create the folder if
   it doesn't exist). Your style.css already references these exact
   filenames via @font-face — the folder just never made it into the
   repo, hence the four 404s in the console. These are pulled straight
   from the @fontsource/caveat and @fontsource/patrick-hand npm
   packages, which is almost certainly where the original @font-face
   block was copied from (the filenames are Fontsource's own naming
   convention).
