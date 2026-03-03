"""002 — Validation

Trust boundaries: enforce constraints at the edges of your system so
invalid data never sneaks past the front door. Fail fast, fail clearly.

Define a `SignupForm` with:
- username: str (min 3 chars, max 20 chars)
- email: valid email address
- age: int (must be >= 18)
"""

from pydantic import BaseModel, EmailStr, Field


class SignupForm(BaseModel):
    ...  # constrain: username 3-20 chars, valid email, age >= 18
