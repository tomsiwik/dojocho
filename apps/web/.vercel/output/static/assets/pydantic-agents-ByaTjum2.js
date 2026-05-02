import{a as e}from"./chunk-BNv3lrIs.js";import{Tt as t}from"./index-BPR-Qz1M.js";var n=e(t()),r={title:`Pydantic Agents`,description:`Learn Pydantic models, validation, and pydantic-ai agents through hands-on katas.`},i=`

The &#x2A;*\`@dojocho/pydantic-agents\`** dojo teaches
[Pydantic](https://docs.pydantic.dev) and
[pydantic-ai](https://ai.pydantic.dev) the same way the rest of Dojocho does:
one failing test at a time, with a Socratic sensei refusing to write the
answer for you.

## Install [#install]

\`\`\`sh
dojo setup
dojo add pydantic-agents
\`\`\`

Then in your agent:

\`\`\`
/kata
\`\`\`

## Katas [#katas]

The current set covers the fundamentals:

| Kata                   | Focus                                                |
| ---------------------- | ---------------------------------------------------- |
| **001 — basic-model**  | Defining your first \`BaseModel\`, fields, types       |
| **002 — validation**   | Validators, constraints, error handling              |
| **003 — simple-agent** | Building a \`pydantic-ai\` agent backed by your models |

More katas (tools, structured outputs, RAG patterns) are on the roadmap.

## Test runner [#test-runner]

The dojo uses \`pytest\` driven by [\`uv\`](https://docs.astral.sh/uv/):

\`\`\`sh
uv run pytest katas/001-basic-model/test_solution.py -v
\`\`\`

Each kata has its own \`test_solution.py\`. The runner adapter is
\`exit-code\` — green when pytest exits 0, red otherwise. Your sensei runs
these for you after each change.

## Teaching contract [#teaching-contract]

Lifted from the dojo's \`DOJO.md\`:

> **Never give solutions.** Your role is Socratic guide.
>
> * Ask questions that steer toward the answer
> * Point to Pydantic docs or class/method names
> * Narrow scope: "Focus on the first failing test"
> * Never write or show solution code

Test-only utilities (fixtures, assertions) belong to the harness — the sensei
won't attribute them to you.

## Requirements [#requirements]

* Python 3.11+
* [\`uv\`](https://docs.astral.sh/uv/) for the test runner.
* The dojo's \`prepare.sh\` installs Python deps the first time you run it.

## Source [#source]

The dojo source lives in the [Dojocho monorepo](https://github.com/tomsiwik/dojocho/tree/main/dojos/pydantic-agents).
`,a={contents:[{heading:void 0,content:`The &#x2A;*\`@dojocho/pydantic-agents\`** dojo teaches
Pydantic and
pydantic-ai the same way the rest of Dojocho does:
one failing test at a time, with a Socratic sensei refusing to write the
answer for you.`},{heading:`install`,content:`Then in your agent:`},{heading:`katas`,content:`The current set covers the fundamentals:`},{heading:`katas`,content:`Kata`},{heading:`katas`,content:`Focus`},{heading:`katas`,content:`**001 — basic-model**`},{heading:`katas`,content:"Defining your first `BaseModel`, fields, types"},{heading:`katas`,content:`**002 — validation**`},{heading:`katas`,content:`Validators, constraints, error handling`},{heading:`katas`,content:`**003 — simple-agent**`},{heading:`katas`,content:"Building a `pydantic-ai` agent backed by your models"},{heading:`katas`,content:`More katas (tools, structured outputs, RAG patterns) are on the roadmap.`},{heading:`test-runner`,content:"The dojo uses `pytest` driven by `uv`:"},{heading:`test-runner`,content:"Each kata has its own `test_solution.py`. The runner adapter is\n`exit-code` — green when pytest exits 0, red otherwise. Your sensei runs\nthese for you after each change."},{heading:`teaching-contract`,content:"Lifted from the dojo's `DOJO.md`:"},{heading:`teaching-contract`,content:`> **Never give solutions.** Your role is Socratic guide.
>
> * Ask questions that steer toward the answer
> * Point to Pydantic docs or class/method names
> * Narrow scope: "Focus on the first failing test"
> * Never write or show solution code`},{heading:`teaching-contract`,content:`Test-only utilities (fixtures, assertions) belong to the harness — the sensei
won't attribute them to you.`},{heading:`requirements`,content:`Python 3.11+`},{heading:`requirements`,content:"`uv` for the test runner."},{heading:`requirements`,content:"The dojo's `prepare.sh` installs Python deps the first time you run it."},{heading:`source`,content:`The dojo source lives in the Dojocho monorepo.`}],headings:[{id:`install`,content:`Install`},{id:`katas`,content:`Katas`},{id:`test-runner`,content:`Test runner`},{id:`teaching-contract`,content:`Teaching contract`},{id:`requirements`,content:`Requirements`},{id:`source`,content:`Source`}]},o=[{depth:2,url:`#install`,title:(0,n.jsx)(n.Fragment,{children:`Install`})},{depth:2,url:`#katas`,title:(0,n.jsx)(n.Fragment,{children:`Katas`})},{depth:2,url:`#test-runner`,title:(0,n.jsx)(n.Fragment,{children:`Test runner`})},{depth:2,url:`#teaching-contract`,title:(0,n.jsx)(n.Fragment,{children:`Teaching contract`})},{depth:2,url:`#requirements`,title:(0,n.jsx)(n.Fragment,{children:`Requirements`})},{depth:2,url:`#source`,title:(0,n.jsx)(n.Fragment,{children:`Source`})}];function s(e){let t={a:`a`,blockquote:`blockquote`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`@dojocho/pydantic-agents`})}),` dojo teaches
`,(0,n.jsx)(t.a,{href:`https://docs.pydantic.dev`,children:`Pydantic`}),` and
`,(0,n.jsx)(t.a,{href:`https://ai.pydantic.dev`,children:`pydantic-ai`}),` the same way the rest of Dojocho does:
one failing test at a time, with a Socratic sensei refusing to write the
answer for you.`]}),`
`,(0,n.jsx)(t.h2,{id:`install`,children:`Install`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` setup`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pydantic-agents`})]})]})})}),`
`,(0,n.jsx)(t.p,{children:`Then in your agent:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`/kata`})})})})}),`
`,(0,n.jsx)(t.h2,{id:`katas`,children:`Katas`}),`
`,(0,n.jsx)(t.p,{children:`The current set covers the fundamentals:`}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Kata`}),(0,n.jsx)(t.th,{children:`Focus`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.strong,{children:`001 — basic-model`})}),(0,n.jsxs)(t.td,{children:[`Defining your first `,(0,n.jsx)(t.code,{children:`BaseModel`}),`, fields, types`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.strong,{children:`002 — validation`})}),(0,n.jsx)(t.td,{children:`Validators, constraints, error handling`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.strong,{children:`003 — simple-agent`})}),(0,n.jsxs)(t.td,{children:[`Building a `,(0,n.jsx)(t.code,{children:`pydantic-ai`}),` agent backed by your models`]})]})]})]}),`
`,(0,n.jsx)(t.p,{children:`More katas (tools, structured outputs, RAG patterns) are on the roadmap.`}),`
`,(0,n.jsx)(t.h2,{id:`test-runner`,children:`Test runner`}),`
`,(0,n.jsxs)(t.p,{children:[`The dojo uses `,(0,n.jsx)(t.code,{children:`pytest`}),` driven by `,(0,n.jsx)(t.a,{href:`https://docs.astral.sh/uv/`,children:(0,n.jsx)(t.code,{children:`uv`})}),`:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`uv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` run`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pytest`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` katas/001-basic-model/test_solution.py`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -v`})]})})})}),`
`,(0,n.jsxs)(t.p,{children:[`Each kata has its own `,(0,n.jsx)(t.code,{children:`test_solution.py`}),`. The runner adapter is
`,(0,n.jsx)(t.code,{children:`exit-code`}),` — green when pytest exits 0, red otherwise. Your sensei runs
these for you after each change.`]}),`
`,(0,n.jsx)(t.h2,{id:`teaching-contract`,children:`Teaching contract`}),`
`,(0,n.jsxs)(t.p,{children:[`Lifted from the dojo's `,(0,n.jsx)(t.code,{children:`DOJO.md`}),`:`]}),`
`,(0,n.jsxs)(t.blockquote,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Never give solutions.`}),` Your role is Socratic guide.`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Ask questions that steer toward the answer`}),`
`,(0,n.jsx)(t.li,{children:`Point to Pydantic docs or class/method names`}),`
`,(0,n.jsx)(t.li,{children:`Narrow scope: "Focus on the first failing test"`}),`
`,(0,n.jsx)(t.li,{children:`Never write or show solution code`}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`Test-only utilities (fixtures, assertions) belong to the harness — the sensei
won't attribute them to you.`}),`
`,(0,n.jsx)(t.h2,{id:`requirements`,children:`Requirements`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Python 3.11+`}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://docs.astral.sh/uv/`,children:(0,n.jsx)(t.code,{children:`uv`})}),` for the test runner.`]}),`
`,(0,n.jsxs)(t.li,{children:[`The dojo's `,(0,n.jsx)(t.code,{children:`prepare.sh`}),` installs Python deps the first time you run it.`]}),`
`]}),`
`,(0,n.jsx)(t.h2,{id:`source`,children:`Source`}),`
`,(0,n.jsxs)(t.p,{children:[`The dojo source lives in the `,(0,n.jsx)(t.a,{href:`https://github.com/tomsiwik/dojocho/tree/main/dojos/pydantic-agents`,children:`Dojocho monorepo`}),`.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};