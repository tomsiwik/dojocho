"""extract-boxed-answer — pull \\boxed{...} from a model response.

Reasoning models (and base models trained on math data) often wrap their
final answer in a `\\boxed{...}` LaTeX expression. The grader's first job
is to find that content reliably — including when braces are nested
(common with `\\frac`, `\\sqrt`, `\\dfrac`) and when there are multiple
boxes in the response (common when the model shows partial work).

Convention (following Raschka ch03): return the **last** boxed
expression in the text. If the model wrote several, the final one is the
intended answer.

Return None if no complete `\\boxed{...}` is present.
"""


def extract_boxed(text: str) -> str | None:
    """Return the content inside the last `\\boxed{...}` in `text`.

    Handles nested braces by tracking depth. Returns None when there is
    no `\\boxed`, or when braces are unbalanced.

    Examples:
        extract_boxed(r"\\boxed{42}")               -> "42"
        extract_boxed(r"\\boxed{\\frac{14}{3}}")     -> r"\\frac{14}{3}"
        extract_boxed(r"first \\boxed{1} then \\boxed{2}") -> "2"
        extract_boxed("no box here")               -> None
    """
    ...  # implement me
