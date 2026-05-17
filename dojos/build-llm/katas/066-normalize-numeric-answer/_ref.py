"""Reference implementation — normalize-numeric-answer."""

import re

_LEADING_NUMBER = re.compile(r"^(-?\d+(?:\.\d+)?)")


def normalize(answer: str) -> str:
    s = answer.strip()
    if not s:
        return s

    # Strip commas (thousands separators)
    no_commas = s.replace(",", "")

    # Try fraction "a/b"
    if "/" in no_commas:
        parts = no_commas.split("/")
        if len(parts) == 2:
            try:
                num = float(parts[0].strip())
                den = float(parts[1].strip())
                if den != 0:
                    val = round(num / den, 6)
                    # "0.5" not "0.500000"; "2.0" not "2"
                    text = f"{val:.6f}".rstrip("0").rstrip(".")
                    return text if text else "0"
            except ValueError:
                pass

    # Try leading-number-then-unit ("5 dogs" -> "5")
    m = _LEADING_NUMBER.match(no_commas)
    if m and m.group(1) != no_commas:
        # Only strip a trailing tail if there's actually something
        # non-numeric after the number (preserves e.g. "1000").
        tail = no_commas[m.end():].lstrip()
        if tail:
            return m.group(1)

    return no_commas
