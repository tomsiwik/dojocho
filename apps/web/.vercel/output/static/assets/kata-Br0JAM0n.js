import{a as e}from"./chunk-BNv3lrIs.js";import{Tt as t}from"./index-BPR-Qz1M.js";var n=e(t()),r={title:`/kata`,description:`The slash command your agent uses to run the next kata.`},i=`

\`/kata\` is a *slash command*, not a CLI command. You invoke it from inside your
agent (Claude Code, Cursor, etc.) once \`dojo setup\` has registered it.

## What it does [#what-it-does]

When you type \`/kata\`, your agent:

1. Reads \`dojocho.json\` to find which dojo is active.
2. Picks the next kata in the dojo's order — the first one whose tests don't
   pass.
3. Reads that kata's \`SENSEI.md\` for teaching guidance.
4. Asks you questions, points you at type signatures or docs, and refuses to
   write the solution for you.
5. Runs the kata's test command after each change.

When the test goes green, \`/kata\` declares victory and you can run it again to
move on.

## Arguments [#arguments]

\`/kata\` is intentionally argument-free. The state lives in the workspace —
which tests pass, which dojo is active. If you want to skip a kata, just edit
its solution to be trivial; the next \`/kata\` will move past it.

## Sensei rules [#sensei-rules]

Every dojo ships a \`DOJO.md\` with project-wide teaching rules and a
\`SENSEI.md\` per kata with kata-specific guidance. The agent treats these as
the source of truth — they override any default tendency to "just write the
code".
`,a={contents:[{heading:void 0,content:"`/kata` is a *slash command*, not a CLI command. You invoke it from inside your\nagent (Claude Code, Cursor, etc.) once `dojo setup` has registered it."},{heading:`what-it-does`,content:"When you type `/kata`, your agent:"},{heading:`what-it-does`,content:"Reads `dojocho.json` to find which dojo is active."},{heading:`what-it-does`,content:`Picks the next kata in the dojo's order — the first one whose tests don't
pass.`},{heading:`what-it-does`,content:"Reads that kata's `SENSEI.md` for teaching guidance."},{heading:`what-it-does`,content:`Asks you questions, points you at type signatures or docs, and refuses to
write the solution for you.`},{heading:`what-it-does`,content:`Runs the kata's test command after each change.`},{heading:`what-it-does`,content:"When the test goes green, `/kata` declares victory and you can run it again to\nmove on."},{heading:`arguments`,content:"`/kata` is intentionally argument-free. The state lives in the workspace —\nwhich tests pass, which dojo is active. If you want to skip a kata, just edit\nits solution to be trivial; the next `/kata` will move past it."},{heading:`sensei-rules`,content:'Every dojo ships a `DOJO.md` with project-wide teaching rules and a\n`SENSEI.md` per kata with kata-specific guidance. The agent treats these as\nthe source of truth — they override any default tendency to "just write the\ncode".'}],headings:[{id:`what-it-does`,content:`What it does`},{id:`arguments`,content:`Arguments`},{id:`sensei-rules`,content:`Sensei rules`}]},o=[{depth:2,url:`#what-it-does`,title:(0,n.jsx)(n.Fragment,{children:`What it does`})},{depth:2,url:`#arguments`,title:(0,n.jsx)(n.Fragment,{children:`Arguments`})},{depth:2,url:`#sensei-rules`,title:(0,n.jsx)(n.Fragment,{children:`Sensei rules`})}];function s(e){let t={code:`code`,em:`em`,h2:`h2`,li:`li`,ol:`ol`,p:`p`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`/kata`}),` is a `,(0,n.jsx)(t.em,{children:`slash command`}),`, not a CLI command. You invoke it from inside your
agent (Claude Code, Cursor, etc.) once `,(0,n.jsx)(t.code,{children:`dojo setup`}),` has registered it.`]}),`
`,(0,n.jsx)(t.h2,{id:`what-it-does`,children:`What it does`}),`
`,(0,n.jsxs)(t.p,{children:[`When you type `,(0,n.jsx)(t.code,{children:`/kata`}),`, your agent:`]}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Reads `,(0,n.jsx)(t.code,{children:`dojocho.json`}),` to find which dojo is active.`]}),`
`,(0,n.jsx)(t.li,{children:`Picks the next kata in the dojo's order — the first one whose tests don't
pass.`}),`
`,(0,n.jsxs)(t.li,{children:[`Reads that kata's `,(0,n.jsx)(t.code,{children:`SENSEI.md`}),` for teaching guidance.`]}),`
`,(0,n.jsx)(t.li,{children:`Asks you questions, points you at type signatures or docs, and refuses to
write the solution for you.`}),`
`,(0,n.jsx)(t.li,{children:`Runs the kata's test command after each change.`}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`When the test goes green, `,(0,n.jsx)(t.code,{children:`/kata`}),` declares victory and you can run it again to
move on.`]}),`
`,(0,n.jsx)(t.h2,{id:`arguments`,children:`Arguments`}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`/kata`}),` is intentionally argument-free. The state lives in the workspace —
which tests pass, which dojo is active. If you want to skip a kata, just edit
its solution to be trivial; the next `,(0,n.jsx)(t.code,{children:`/kata`}),` will move past it.`]}),`
`,(0,n.jsx)(t.h2,{id:`sensei-rules`,children:`Sensei rules`}),`
`,(0,n.jsxs)(t.p,{children:[`Every dojo ships a `,(0,n.jsx)(t.code,{children:`DOJO.md`}),` with project-wide teaching rules and a
`,(0,n.jsx)(t.code,{children:`SENSEI.md`}),` per kata with kata-specific guidance. The agent treats these as
the source of truth — they override any default tendency to "just write the
code".`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};