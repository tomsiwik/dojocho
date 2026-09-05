import { autocompletion, closeCompletion, completionKeymap, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { yaml } from "@codemirror/lang-yaml";
import { undo } from "@codemirror/commands";
import { codeFolding, foldGutter } from "@codemirror/language";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { Decoration, EditorView, GutterMarker, gutterLineClass, keymap, ViewPlugin, type DecorationSet } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import CodeMirror, { RangeSetBuilder, StateField } from "@uiw/react-codemirror";
import { useEffect, useRef } from "react";
import type { CodeHighlight } from "../lib/code-highlight";
import { vercelCursorColors, vercelCursorTheme } from "../lib/code-editor-theme";

const editorAdditions = EditorView.theme({
  "&": {
    height: "100%",
  },
  ".cm-scroller": { overflow: "auto" },
  ".cm-line-flash": {
    animation: "dojofoo-line-flash 1.2s ease-out",
    backgroundColor: "#0070f34d",
  },
  "@keyframes dojofoo-line-flash": {
    "0%, 35%": { backgroundColor: "#0070f366" },
    "100%": { backgroundColor: "transparent" },
  },
  ".cm-lint-marker-error": {
    content: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='4' fill='%23f05b8d'/%3E%3C/svg%3E\")",
    height: "1em",
    width: "1em",
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    backgroundSize: "6px 4px",
    paddingBottom: "2px",
    textDecoration: "none",
  },
  ".cm-lintRange-error": {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4' viewBox='0 0 6 4'%3E%3Cpath d='M0 3L2 1L4 3L6 1' fill='none' stroke='%23f05b8d' stroke-width='1.25'/%3E%3C/svg%3E\")",
  },
  ".cm-lintRange-warning": {
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4' viewBox='0 0 6 4'%3E%3Cpath d='M0 3L2 1L4 3L6 1' fill='none' stroke='%23f5a623' stroke-width='1.25'/%3E%3C/svg%3E\")",
  },
}, { dark: true });

export type CodeEditorLanguage = "javascript" | "json" | "markdown" | "python" | "typescript" | "yaml";

type CodeEditorProps = {
  code: string;
  coverage: boolean;
  lineHits?: Record<string, number>;
  failedLines?: number[];
  filePath: string;
  language: CodeEditorLanguage;
  lessonApiBase: string;
  readOnly: boolean;
  onChange: (code: string) => void;
  onUndoReady?: (undoEditor: () => boolean) => void;
  highlight?: CodeHighlight & { nonce: number };
};

export default function CodeEditor({
  code,
  coverage,
  lineHits,
  failedLines,
  filePath,
  language,
  lessonApiBase,
  readOnly,
  onChange,
  onUndoReady,
  highlight,
}: CodeEditorProps) {
  const editor = useRef<EditorView | null>(null);
  const languageExtension = language === "python"
    ? python()
    : language === "yaml"
      ? yaml()
      : language === "json"
        ? json()
        : language === "markdown"
          ? markdown()
        : javascript({ jsx: true, typescript: language === "typescript" });
  const languageTools = language === "typescript" ? typescriptLanguageTools(filePath, lessonApiBase) : [];

  useEffect(() => {
    const view = editor.current;
    if (!view || !highlight) return;
    const fromLine = Math.min(highlight.from, view.state.doc.lines);
    const toLine = Math.min(highlight.to, view.state.doc.lines);
    const from = view.state.doc.line(fromLine).from;
    view.dispatch({
      effects: [
        flashLines.of({ from: fromLine, to: toLine }),
        EditorView.scrollIntoView(from, { y: "center" }),
      ],
    });
    const timeout = window.setTimeout(() => {
      if (editor.current === view) view.dispatch({ effects: flashLines.of(null) });
    }, 1_200);
    return () => window.clearTimeout(timeout);
  }, [highlight]);

  return (
    <div
      className="h-full min-h-0 overflow-hidden"
      style={{ backgroundColor: vercelCursorColors.background }}
      data-file-path={filePath}
    >
      <CodeMirror
        className="h-full min-h-0"
        basicSetup={{
          autocompletion: false,
          bracketMatching: true,
          closeBrackets: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          highlightSelectionMatches: true,
          lineNumbers: true,
          lintKeymap: true,
          searchKeymap: true,
        }}
        editable={!readOnly}
        extensions={[
          languageExtension,
          languageTools,
          preciseFolding,
          flashLineExtension,
          coverageExtension(coverage ? lineHits : undefined, failedLines),
          EditorView.contentAttributes.of({ "aria-label": "Code editor" }),
          editorAdditions,
        ]}
        height="100%"
        theme={vercelCursorTheme}
        onChange={onChange}
        onCreateEditor={(view) => {
          editor.current = view;
          onUndoReady?.(() => undo(view));
        }}
        value={code}
      />
    </div>
  );
}

const flashLines = StateEffect.define<CodeHighlight | null>();
const flashLineExtension = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    const effect = transaction.effects.find((candidate) => candidate.is(flashLines));
    if (effect) {
      if (!effect.value) return Decoration.none;
      const ranges = [];
      for (let line = effect.value.from; line <= effect.value.to; line += 1) {
        if (line <= transaction.state.doc.lines) {
          ranges.push(Decoration.line({ class: "cm-line-flash" }).range(transaction.state.doc.line(line).from));
        }
      }
      return Decoration.set(ranges);
    }
    return transaction.docChanged ? decorations.map(transaction.changes) : decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

type CompletionResponse = {
  from: number;
  options: Array<{ label: string; type: string }>;
};

type DiagnosticResponse = Array<Diagnostic & { code: number }>;

function typescriptLanguageTools(filePath: string, lessonApiBase: string) {
  return [
    autocompletion({ override: [typescriptCompletions(filePath, lessonApiBase)] }),
    keymap.of(completionKeymap),
    linter(async (view) => {
      const response = await fetch(`${lessonApiBase}/files/solution/diagnostics`, {
        body: JSON.stringify({ code: view.state.doc.toString(), filePath }),
        headers: languageHeaders(),
        method: "POST",
      });
      if (!response.ok) return [];
      const diagnostics = await response.json() as DiagnosticResponse;
      return diagnostics.map(({ code, ...diagnostic }) => ({
        ...diagnostic,
        source: `TypeScript ${code}`,
      }));
    }, { delay: 500 }),
    lintMarkerInteractions,
    lintGutter(),
  ];
}

const lintMarkerInteractions = ViewPlugin.define((view) => {
  const onMouseOver = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest(".cm-lint-marker")) {
      closeCompletion(view);
    }
  };
  view.dom.addEventListener("mouseover", onMouseOver);
  return {
    destroy() {
      view.dom.removeEventListener("mouseover", onMouseOver);
    },
  };
});

function typescriptCompletions(filePath: string, lessonApiBase: string) {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    const word = context.matchBefore(/[\w$]*/);
    if (!context.explicit && word?.from === word?.to && context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos) !== ".") {
      return null;
    }
    const response = await fetch(`${lessonApiBase}/files/solution/completions`, {
      body: JSON.stringify({
        code: context.state.doc.toString(),
        filePath,
        position: context.pos,
      }),
      headers: languageHeaders(),
      method: "POST",
    });
    if (!response.ok) return null;
    const result = await response.json() as CompletionResponse;
    return { ...result, validFor: /^[\w$]*$/ };
  };
}

function languageHeaders(): Record<string, string> {
  return { "content-type": "application/json" };
}

const preciseFolding = [
  foldGutter({ markerDOM: (open) => foldMarker(open) }),
  codeFolding({ placeholderDOM: (_view, onClick) => foldPlaceholder(onClick) }),
];

function foldMarker(open: boolean): HTMLElement {
  const marker = document.createElement("span");
  marker.title = open ? "Fold line" : "Unfold line";
  marker.className = "cm-foldControl";
  marker.append(svgIcon(open
    ? "<path d=\"m4 6 4 4 4-4\"/>"
    : "<path d=\"m6 4 4 4-4 4\"/>"));
  return marker;
}

function foldPlaceholder(onClick: (event: Event) => void): HTMLElement {
  const marker = document.createElement("span");
  marker.className = "cm-foldPlaceholder";
  marker.title = "Unfold folded code";
  marker.addEventListener("click", onClick);
  marker.append(svgIcon("<circle cx=\"4\" cy=\"8\" r=\"1\"/><circle cx=\"8\" cy=\"8\" r=\"1\"/><circle cx=\"12\" cy=\"8\" r=\"1\"/>"));
  return marker;
}

function svgIcon(content: string): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = content;
  return svg;
}

function coverageExtension(lineHits?: Record<string, number>, failedLines: number[] = []) {
  const content = StateField.define<DecorationSet>({
    create(state) {
      return coverageDecorations(state.doc.lines, (line) => state.doc.line(line).from, lineHits, failedLines);
    },
    update(decorations, transaction) {
      return transaction.docChanged
        ? coverageDecorations(transaction.state.doc.lines, (line) => transaction.state.doc.line(line).from, lineHits, failedLines)
        : decorations;
    },
    provide: (field) => EditorView.decorations.from(field),
  });
  const gutters = StateField.define({
    create(state) {
      return coverageGutterMarkers(state.doc.lines, (line) => state.doc.line(line).from, lineHits, failedLines);
    },
    update(markers, transaction) {
      return transaction.docChanged
        ? coverageGutterMarkers(transaction.state.doc.lines, (line) => transaction.state.doc.line(line).from, lineHits, failedLines)
        : markers;
    },
    provide: (field) => gutterLineClass.from(field),
  });
  return [content, gutters];
}

class CoverageGutterMarker extends GutterMarker {
  constructor(readonly elementClass: string) {
    super();
  }

  eq(other: CoverageGutterMarker): boolean {
    return other.elementClass === this.elementClass;
  }
}

const coveredGutterMarker = new CoverageGutterMarker("cm-line-covered");
const failedGutterMarker = new CoverageGutterMarker("cm-line-failed");

function coverageGutterMarkers(
  lineCount: number,
  lineStart: (line: number) => number,
  lineHits?: Record<string, number>,
  failedLines: number[] = [],
) {
  const builder = new RangeSetBuilder<GutterMarker>();
  for (const { line, status } of visualizedLines(lineCount, lineHits, failedLines)) {
    const marker = status === "failed" ? failedGutterMarker : coveredGutterMarker;
    builder.add(lineStart(line), lineStart(line), marker);
  }
  return builder.finish();
}

function coverageDecorations(
  lineCount: number,
  lineStart: (line: number) => number,
  lineHits?: Record<string, number>,
  failedLines: number[] = [],
): DecorationSet {
  return Decoration.set(visualizedLines(lineCount, lineHits, failedLines)
    .map(({ line, status }) => Decoration.line({ attributes: { class: `cm-line-${status}` } }).range(lineStart(line))));
}

function visualizedLines(lineCount: number, lineHits?: Record<string, number>, failedLines: number[] = []) {
  const failed = new Set(failedLines);
  const lines = new Set([
    ...Object.entries(lineHits ?? {}).filter(([, hits]) => hits > 0).map(([line]) => Number(line)),
    ...failedLines,
  ]);
  return [...lines]
    .map((line) => ({
      line,
      status: failed.has(line) ? "failed" : "covered",
    }))
    .filter(({ line }) => Number.isInteger(line) && line > 0 && line <= lineCount)
    .sort((a, b) => a.line - b.line);
}
