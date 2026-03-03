"""001 — Basic Model

Structured data: a Pydantic model replaces fragile dicts with typed,
validated, serializable objects. Pydantic *parses* (and coerces), not
just validates — `age="25"` becomes `age=25` automatically.

Define a `UserProfile` with fields: name (str), age (int), email (str).
"""

from pydantic import BaseModel


class UserProfile(BaseModel):
    ...  # define fields: name (str), age (int), email (str)
