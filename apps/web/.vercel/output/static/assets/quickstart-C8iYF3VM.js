import{a as e}from"./chunk-BNv3lrIs.js";import{Tt as t}from"./index-BPR-Qz1M.js";var n=e(t()),r={title:`Quickstart`,description:`From zero to your first green kata in three commands.`},i=`

This guide assumes you've installed the [CLI](/installation) and have
[Claude Code](https://docs.anthropic.com/claude/docs/claude-code) (or another
supported agent) set up.

## 1. Wire up your project [#1-wire-up-your-project]

Run \`dojo setup\` once per project. It registers the \`/kata\` slash command,
writes the agent rules that tell your sensei how to behave, and sets up the
expected directory layout.

\`\`\`sh
dojo setup
\`\`\`

## 2. Add a dojo [#2-add-a-dojo]

Install the dojo you want to train on. Each dojo is a normal npm package — the
CLI just knows where to wire it.

\`\`\`sh
dojo add effect-ts
\`\`\`

Replace \`effect-ts\` with any dojo from the [catalog](/dojos), e.g.
\`pydantic-agents\`.

## 3. Start training [#3-start-training]

In Claude Code (or your agent of choice), run:

\`\`\`
/kata
\`\`\`

Your sensei opens the next kata, reads its \`SENSEI.md\`, and starts asking
questions instead of writing code for you. When the kata's test goes green,
\`/kata\` advances to the next one.

<Callout type="info">
  Stuck? Ask your sensei for a hint. Refuse to be told the answer — the point
  is to *earn* the green test.
</Callout>

## What's next [#whats-next]

* Skim the [commands reference](/commands) to learn \`dojo\` end-to-end.
* Browse the [dojo catalog](/dojos) to pick your next discipline.
`,a={contents:[{heading:void 0,content:`This guide assumes you've installed the CLI and have
Claude Code (or another
supported agent) set up.`},{heading:`1-wire-up-your-project`,content:"Run `dojo setup` once per project. It registers the `/kata` slash command,\nwrites the agent rules that tell your sensei how to behave, and sets up the\nexpected directory layout."},{heading:`2-add-a-dojo`,content:`Install the dojo you want to train on. Each dojo is a normal npm package — the
CLI just knows where to wire it.`},{heading:`2-add-a-dojo`,content:"Replace `effect-ts` with any dojo from the catalog, e.g.\n`pydantic-agents`."},{heading:`3-start-training`,content:`In Claude Code (or your agent of choice), run:`},{heading:`3-start-training`,content:"Your sensei opens the next kata, reads its `SENSEI.md`, and starts asking\nquestions instead of writing code for you. When the kata's test goes green,\n`/kata` advances to the next one."},{heading:`3-start-training`,content:`Stuck? Ask your sensei for a hint. Refuse to be told the answer — the point
is to *earn* the green test.`},{heading:`whats-next`,content:"Skim the commands reference to learn `dojo` end-to-end."},{heading:`whats-next`,content:`Browse the dojo catalog to pick your next discipline.`}],headings:[{id:`1-wire-up-your-project`,content:`1\\. Wire up your project`},{id:`2-add-a-dojo`,content:`2\\. Add a dojo`},{id:`3-start-training`,content:`3\\. Start training`},{id:`whats-next`,content:`What's next`}]},o=[{depth:2,url:`#1-wire-up-your-project`,title:(0,n.jsx)(n.Fragment,{children:`1. Wire up your project`})},{depth:2,url:`#2-add-a-dojo`,title:(0,n.jsx)(n.Fragment,{children:`2. Add a dojo`})},{depth:2,url:`#3-start-training`,title:(0,n.jsx)(n.Fragment,{children:`3. Start training`})},{depth:2,url:`#whats-next`,title:(0,n.jsx)(n.Fragment,{children:`What's next`})}];function s(e){let t={a:`a`,code:`code`,em:`em`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,ul:`ul`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(t.p,{children:[`This guide assumes you've installed the `,(0,n.jsx)(t.a,{href:`/installation`,children:`CLI`}),` and have
`,(0,n.jsx)(t.a,{href:`https://docs.anthropic.com/claude/docs/claude-code`,children:`Claude Code`}),` (or another
supported agent) set up.`]}),`
`,(0,n.jsx)(t.h2,{id:`1-wire-up-your-project`,children:`1. Wire up your project`}),`
`,(0,n.jsxs)(t.p,{children:[`Run `,(0,n.jsx)(t.code,{children:`dojo setup`}),` once per project. It registers the `,(0,n.jsx)(t.code,{children:`/kata`}),` slash command,
writes the agent rules that tell your sensei how to behave, and sets up the
expected directory layout.`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` setup`})]})})})}),`
`,(0,n.jsx)(t.h2,{id:`2-add-a-dojo`,children:`2. Add a dojo`}),`
`,(0,n.jsx)(t.p,{children:`Install the dojo you want to train on. Each dojo is a normal npm package — the
CLI just knows where to wire it.`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` effect-ts`})]})})})}),`
`,(0,n.jsxs)(t.p,{children:[`Replace `,(0,n.jsx)(t.code,{children:`effect-ts`}),` with any dojo from the `,(0,n.jsx)(t.a,{href:`/dojos`,children:`catalog`}),`, e.g.
`,(0,n.jsx)(t.code,{children:`pydantic-agents`}),`.`]}),`
`,(0,n.jsx)(t.h2,{id:`3-start-training`,children:`3. Start training`}),`
`,(0,n.jsx)(t.p,{children:`In Claude Code (or your agent of choice), run:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`/kata`})})})})}),`
`,(0,n.jsxs)(t.p,{children:[`Your sensei opens the next kata, reads its `,(0,n.jsx)(t.code,{children:`SENSEI.md`}),`, and starts asking
questions instead of writing code for you. When the kata's test goes green,
`,(0,n.jsx)(t.code,{children:`/kata`}),` advances to the next one.`]}),`
`,(0,n.jsx)(r,{type:`info`,children:(0,n.jsxs)(t.p,{children:[`Stuck? Ask your sensei for a hint. Refuse to be told the answer — the point
is to `,(0,n.jsx)(t.em,{children:`earn`}),` the green test.`]})}),`
`,(0,n.jsx)(t.h2,{id:`whats-next`,children:`What's next`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Skim the `,(0,n.jsx)(t.a,{href:`/commands`,children:`commands reference`}),` to learn `,(0,n.jsx)(t.code,{children:`dojo`}),` end-to-end.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Browse the `,(0,n.jsx)(t.a,{href:`/dojos`,children:`dojo catalog`}),` to pick your next discipline.`]}),`
`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};