# SENSEI — 001 Basic Model

## Briefing

### Goal

Define your first Pydantic model — a `UserProfile` with typed fields. Understand why structured models beat raw dicts: Pydantic *parses and coerces*, not just validates.

### Tasks

1. Add three fields to `UserProfile`: `name` (str), `age` (int), `email` (str)

### Hints

- Fields are declared as class-level annotations with types — no `__init__` needed.
- Pydantic will coerce compatible types automatically (e.g. `"25"` → `25`).

## Prerequisites

None — this is the first kata.

## References

- [Pydantic Models](https://docs.pydantic.dev/latest/concepts/models/)
- [Field Types](https://docs.pydantic.dev/latest/concepts/types/)
- [Serialization (model_dump, JSON)](https://docs.pydantic.dev/latest/concepts/serialization/)

## Teaching Approach

### Socratic prompts

- "What does extending `BaseModel` give your class that a plain `class` doesn't?"
- "What happens if you pass `age='thirty'` instead of `age=30`?"
- "How is `model_dump()` different from `__dict__`?"

### Common pitfalls

1. **Using `__init__` manually** — Pydantic generates `__init__` from field annotations. Ask: "Do you need to write `__init__` yourself, or does BaseModel handle it?"
2. **Forgetting type annotations** — Fields without annotations are not Pydantic fields. Ask: "What does Pydantic use to know a field's type?"
3. **Leaving the `...` placeholder** — The ellipsis is the starting point, not the answer. Ask: "What should replace the `...` inside the class body?"

## On Completion

### Insight

A Pydantic model is defined by its field annotations — no boilerplate `__init__`, no manual validation. Pydantic coerces compatible types automatically and gives you serialization (`model_dump`, `model_dump_json`) for free.

### Bridge

Now that you can define a model, the next kata explores **validation** — constraining what values those fields accept.
