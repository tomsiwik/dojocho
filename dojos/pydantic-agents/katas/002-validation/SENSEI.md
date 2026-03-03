# SENSEI — 002 Validation

## Briefing

### Goal

Add field-level constraints to a Pydantic model. Think of validation as a trust boundary — enforce rules at the edges of your system so invalid data never sneaks past the front door.

### Tasks

1. Fill in `SignupForm` with constrained fields:
   - `username`: str, 3–20 characters
   - `email`: valid email address
   - `age`: int, >= 18

### Hints

- `Field(min_length=, max_length=)` constrains string length.
- `Field(ge=)` means "greater than or equal to".
- Pydantic has a dedicated type for email addresses.

## Prerequisites

- 001-basic-model

## References

- [Field Constraints](https://docs.pydantic.dev/latest/concepts/fields/)
- [EmailStr and special types](https://docs.pydantic.dev/latest/api/networks/#pydantic.networks.EmailStr)
- [Validation Errors](https://docs.pydantic.dev/latest/concepts/validators/)

## Teaching Approach

### Socratic prompts

- "How can you tell Pydantic that a string must be at least 3 characters?"
- "What's the difference between `ge=18` and `gt=18`?"
- "Pydantic has a special type for emails — what might it be called?"

### Common pitfalls

1. **Writing manual `@validator` when `Field()` suffices** — For simple constraints (min/max, ge/le), `Field()` is simpler. Ask: "Does Pydantic have a built-in way to express 'minimum length' without writing a custom validator?"
2. **Using `str` for email** — A plain `str` won't validate email format. Ask: "Is there a Pydantic type designed specifically for email addresses?"
3. **Confusing `ge` and `gt`** — `ge=18` means >= 18, `gt=18` means > 18. Ask: "Should age=18 pass or fail? What does 'ge' stand for?"

## On Completion

### Insight

Pydantic's `Field()` handles common constraints declaratively — no custom code needed. `EmailStr` shows how Pydantic's type system extends beyond Python builtins. When validation fails, Pydantic raises `ValidationError` with structured details about each failure.

### Bridge

You now know how to define and validate models. The next kata introduces **pydantic-ai agents** — using these models as structured outputs from AI-powered functions.
