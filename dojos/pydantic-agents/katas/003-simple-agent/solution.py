"""003 — Simple Agent

Structured output: bridge unstructured LLM text to typed Python.
A pydantic-ai Agent with `output_type` guarantees the response
matches your model — testable without API keys via TestModel.

1. Define a `CityInfo` model: name (str), country (str), population (int)
2. Create an Agent called `city_agent` that returns `CityInfo`
"""

from pydantic import BaseModel
from pydantic_ai import Agent


class CityInfo(BaseModel):
    ...  # fields: name (str), country (str), population (int)


# create an Agent named city_agent that returns CityInfo
