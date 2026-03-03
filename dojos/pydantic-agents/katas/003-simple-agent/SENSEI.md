# SENSEI — 003 Simple Agent

## Briefing

### Goal

Create a pydantic-ai `Agent` that returns structured data as a Pydantic model. This bridges unstructured LLM text to typed Python — testable without API keys.

### Tasks

1. Fill in `CityInfo` with fields: `name` (str), `country` (str), `population` (int)
2. Create an `Agent` called `city_agent` with `CityInfo` as its `output_type`

### Hints

- `Agent("test", output_type=...)` creates an agent that uses the test model by default.
- The agent should be a module-level variable, not inside a function.
- `output_type` tells the agent what Pydantic model to parse the LLM response into.

## Prerequisites

- 001-basic-model
- 002-validation

## References

- [pydantic-ai Agents](https://ai.pydantic.dev/agents/)
- [Structured Output (output_type)](https://ai.pydantic.dev/output/)
- [Testing with TestModel](https://ai.pydantic.dev/testing/)

## Teaching Approach

### Socratic prompts

- "How does the Agent know what shape its output should be?"
- "What does `output_type=CityInfo` tell pydantic-ai to do?"
- "Why do the tests pass `model=TestModel()` — what does that replace?"

### Common pitfalls

1. **Trying to call an LLM** — The tests use `TestModel`, not a real LLM. Ask: "Do you need an API key for the tests to pass? What model string works without one?"
2. **Defining the agent inside a function** — `city_agent` should be a module-level variable. Ask: "Where should the agent be defined so the tests can import it?"
3. **Forgetting `output_type`** — Without it, the agent returns plain text. Ask: "How does the agent know to return a `CityInfo` instead of a string?"

## On Completion

### Insight

A pydantic-ai `Agent` bridges LLMs and typed Python. By setting `output_type`, you get structured, validated output — the LLM's response is parsed into your Pydantic model automatically. `TestModel` lets you test agent wiring without real API calls.

### Bridge

You've covered the foundations: models, validation, and AI agents with structured output. From here, you can explore tool use, dependency injection, and multi-step agent workflows.
