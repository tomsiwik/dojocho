"""Tests for 003 — Simple Agent."""

from pydantic_ai.models.test import TestModel


def test_city_info_fields(solution):
    """CityInfo should have name, country, and population fields."""
    city = solution.CityInfo(name="Tokyo", country="Japan", population=14_000_000)
    assert city.name == "Tokyo"
    assert city.country == "Japan"
    assert city.population == 14_000_000


def test_agent_returns_city_info(solution):
    """Running the agent with TestModel should return a CityInfo instance."""
    agent = solution.city_agent
    result = agent.run_sync(
        "Tell me about Tokyo",
        model=TestModel(),
    )
    assert isinstance(result.output, solution.CityInfo), (
        f"Agent should return CityInfo, got {type(result.output).__name__}"
    )


def test_agent_output_fields_populated(solution):
    """The agent output should have all CityInfo fields populated."""
    agent = solution.city_agent
    result = agent.run_sync(
        "Tell me about Paris",
        model=TestModel(),
    )
    city = result.output
    assert isinstance(city.name, str) and len(city.name) > 0
    assert isinstance(city.country, str) and len(city.country) > 0
    assert isinstance(city.population, int)
