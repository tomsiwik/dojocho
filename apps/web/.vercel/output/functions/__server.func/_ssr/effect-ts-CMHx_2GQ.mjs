import{o as e}from"../_runtime.mjs";import{s as t}from"../_libs/@radix-ui/react-arrow+[...].mjs";import{r as n}from"./chunk-BHwK3AQr.mjs";var r=e(t()),i=n({_markdown:()=>o,default:()=>u,frontmatter:()=>a,structuredData:()=>s,toc:()=>c}),a={title:`Effect-TS`,description:`Master Effect-TS through 40 hands-on katas, from Effect.succeed to managed runtimes.`},o=`

The &#x2A;*\`@dojocho/effect-ts\`** dojo is a 40-kata curriculum for
[Effect-TS](https://effect.website). You build up from the smallest unit
(\`Effect.succeed\`) all the way to layered services, fibers, streams, and a
managed runtime — one failing test at a time.

## Install [#install]

\`\`\`sh
dojo setup
dojo add effect-ts
\`\`\`

Then in your agent:

\`\`\`
/kata
\`\`\`

## What you'll learn [#what-youll-learn]

The dojo is organised into areas. Each area starts with a skill the sensei
loads before the first kata, then walks through the APIs hands-on:

| Area                  | Katas     | Topics                                                                               |
| --------------------- | --------- | ------------------------------------------------------------------------------------ |
| **Foundations**       | 001 – 005 | \`Effect.succeed\`, \`map\`, generators, \`flatMap\`, \`pipe\` composition                   |
| **Errors**            | 006 – 008 | \`Effect.fail\`, tagged errors, error channels, recovery patterns                      |
| **Modelling**         | 009 – 010 | \`Option\`, \`Either\`, \`Exit\`                                                           |
| **Services & Layers** | 011 – 013 | \`Context.Tag\`, \`Layer\`, testing with mocks                                           |
| **Schema**            | 014 – 015 | \`Schema.Struct\`, refinements, domain modelling                                       |
| **Concurrency**       | 016 – 020 | \`retry\`, schedules, parallelism, \`race\`, \`Ref\`, fibers                               |
| **Resources**         | 021 – 023 | \`acquireRelease\`, scoped layers, resource patterns                                   |
| **Streams**           | 024 – 027 | \`Stream\` basics, operations, combinators, data pipelines                             |
| **Observability**     | 028       | logging, spans                                                                       |
| **HTTP**              | 029       | typed HTTP client                                                                    |
| **Capstone**          | 030       | end-to-end, all areas combined                                                       |
| **Advanced**          | 031 – 040 | config, causes, pattern matching, queues, metrics, managed runtime, request batching |

Each kata is a single failing Vitest test. Your sensei reads the test and the
\`SENSEI.md\`, then asks you targeted questions until you make it green.

## Teaching contract [#teaching-contract]

Quoting the dojo's own \`DOJO.md\`:

> **Never give solutions.** Your role is Socratic guide.
>
> * Ask questions that steer toward the answer
> * Point to type signatures or API names
> * Narrow scope: "Focus on the first failing test"
> * Never write or show solution code

That contract is enforced kata-by-kata via per-kata \`SENSEI.md\` files, which
also flag which APIs belong to *you* (the student) versus the test harness
(\`runSync\`, \`runSyncExit\`) — a small but important detail Effect-TS beginners
often get backwards.

## Requirements [#requirements]

* Node.js 20+
* A package manager that supports workspaces — \`pnpm\` is recommended.
* The \`effect\` runtime is installed as a dependency of the dojo; the test
  runner is Vitest.

## Source [#source]

The dojo source lives in the [Dojocho monorepo](https://github.com/tomsiwik/dojocho/tree/main/dojos/effect-ts).
`,s={contents:[{heading:void 0,content:"The &#x2A;*`@dojocho/effect-ts`** dojo is a 40-kata curriculum for\nEffect-TS. You build up from the smallest unit\n(`Effect.succeed`) all the way to layered services, fibers, streams, and a\nmanaged runtime — one failing test at a time."},{heading:`install`,content:`Then in your agent:`},{heading:`what-youll-learn`,content:`The dojo is organised into areas. Each area starts with a skill the sensei
loads before the first kata, then walks through the APIs hands-on:`},{heading:`what-youll-learn`,content:`Area`},{heading:`what-youll-learn`,content:`Katas`},{heading:`what-youll-learn`,content:`Topics`},{heading:`what-youll-learn`,content:`**Foundations**`},{heading:`what-youll-learn`,content:`001 – 005`},{heading:`what-youll-learn`,content:"`Effect.succeed`, `map`, generators, `flatMap`, `pipe` composition"},{heading:`what-youll-learn`,content:`**Errors**`},{heading:`what-youll-learn`,content:`006 – 008`},{heading:`what-youll-learn`,content:"`Effect.fail`, tagged errors, error channels, recovery patterns"},{heading:`what-youll-learn`,content:`**Modelling**`},{heading:`what-youll-learn`,content:`009 – 010`},{heading:`what-youll-learn`,content:"`Option`, `Either`, `Exit`"},{heading:`what-youll-learn`,content:`**Services & Layers**`},{heading:`what-youll-learn`,content:`011 – 013`},{heading:`what-youll-learn`,content:"`Context.Tag`, `Layer`, testing with mocks"},{heading:`what-youll-learn`,content:`**Schema**`},{heading:`what-youll-learn`,content:`014 – 015`},{heading:`what-youll-learn`,content:"`Schema.Struct`, refinements, domain modelling"},{heading:`what-youll-learn`,content:`**Concurrency**`},{heading:`what-youll-learn`,content:`016 – 020`},{heading:`what-youll-learn`,content:"`retry`, schedules, parallelism, `race`, `Ref`, fibers"},{heading:`what-youll-learn`,content:`**Resources**`},{heading:`what-youll-learn`,content:`021 – 023`},{heading:`what-youll-learn`,content:"`acquireRelease`, scoped layers, resource patterns"},{heading:`what-youll-learn`,content:`**Streams**`},{heading:`what-youll-learn`,content:`024 – 027`},{heading:`what-youll-learn`,content:"`Stream` basics, operations, combinators, data pipelines"},{heading:`what-youll-learn`,content:`**Observability**`},{heading:`what-youll-learn`,content:`028`},{heading:`what-youll-learn`,content:`logging, spans`},{heading:`what-youll-learn`,content:`**HTTP**`},{heading:`what-youll-learn`,content:`029`},{heading:`what-youll-learn`,content:`typed HTTP client`},{heading:`what-youll-learn`,content:`**Capstone**`},{heading:`what-youll-learn`,content:`030`},{heading:`what-youll-learn`,content:`end-to-end, all areas combined`},{heading:`what-youll-learn`,content:`**Advanced**`},{heading:`what-youll-learn`,content:`031 – 040`},{heading:`what-youll-learn`,content:`config, causes, pattern matching, queues, metrics, managed runtime, request batching`},{heading:`what-youll-learn`,content:"Each kata is a single failing Vitest test. Your sensei reads the test and the\n`SENSEI.md`, then asks you targeted questions until you make it green."},{heading:`teaching-contract`,content:"Quoting the dojo's own `DOJO.md`:"},{heading:`teaching-contract`,content:`> **Never give solutions.** Your role is Socratic guide.
>
> * Ask questions that steer toward the answer
> * Point to type signatures or API names
> * Narrow scope: "Focus on the first failing test"
> * Never write or show solution code`},{heading:`teaching-contract`,content:"That contract is enforced kata-by-kata via per-kata `SENSEI.md` files, which\nalso flag which APIs belong to *you* (the student) versus the test harness\n(`runSync`, `runSyncExit`) — a small but important detail Effect-TS beginners\noften get backwards."},{heading:`requirements`,content:`Node.js 20+`},{heading:`requirements`,content:"A package manager that supports workspaces — `pnpm` is recommended."},{heading:`requirements`,content:"The `effect` runtime is installed as a dependency of the dojo; the test\nrunner is Vitest."},{heading:`source`,content:`The dojo source lives in the Dojocho monorepo.`}],headings:[{id:`install`,content:`Install`},{id:`what-youll-learn`,content:`What you'll learn`},{id:`teaching-contract`,content:`Teaching contract`},{id:`requirements`,content:`Requirements`},{id:`source`,content:`Source`}]},c=[{depth:2,url:`#install`,title:(0,r.jsx)(r.Fragment,{children:`Install`})},{depth:2,url:`#what-youll-learn`,title:(0,r.jsx)(r.Fragment,{children:`What you'll learn`})},{depth:2,url:`#teaching-contract`,title:(0,r.jsx)(r.Fragment,{children:`Teaching contract`})},{depth:2,url:`#requirements`,title:(0,r.jsx)(r.Fragment,{children:`Requirements`})},{depth:2,url:`#source`,title:(0,r.jsx)(r.Fragment,{children:`Source`})}];function l(e){let t={a:`a`,blockquote:`blockquote`,code:`code`,em:`em`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(t.p,{children:[`The `,(0,r.jsx)(t.strong,{children:(0,r.jsx)(t.code,{children:`@dojocho/effect-ts`})}),` dojo is a 40-kata curriculum for
`,(0,r.jsx)(t.a,{href:`https://effect.website`,children:`Effect-TS`}),`. You build up from the smallest unit
(`,(0,r.jsx)(t.code,{children:`Effect.succeed`}),`) all the way to layered services, fibers, streams, and a
managed runtime — one failing test at a time.`]}),`
`,(0,r.jsx)(t.h2,{id:`install`,children:`Install`}),`
`,(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,r.jsxs)(t.code,{children:[(0,r.jsxs)(t.span,{className:`line`,children:[(0,r.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` setup`})]}),`
`,(0,r.jsxs)(t.span,{className:`line`,children:[(0,r.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` effect-ts`})]})]})})}),`
`,(0,r.jsx)(t.p,{children:`Then in your agent:`}),`
`,(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,r.jsx)(t.code,{children:(0,r.jsx)(t.span,{className:`line`,children:(0,r.jsx)(t.span,{children:`/kata`})})})})}),`
`,(0,r.jsx)(t.h2,{id:`what-youll-learn`,children:`What you'll learn`}),`
`,(0,r.jsx)(t.p,{children:`The dojo is organised into areas. Each area starts with a skill the sensei
loads before the first kata, then walks through the APIs hands-on:`}),`
`,(0,r.jsxs)(t.table,{children:[(0,r.jsx)(t.thead,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.th,{children:`Area`}),(0,r.jsx)(t.th,{children:`Katas`}),(0,r.jsx)(t.th,{children:`Topics`})]})}),(0,r.jsxs)(t.tbody,{children:[(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Foundations`})}),(0,r.jsx)(t.td,{children:`001 – 005`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Effect.succeed`}),`, `,(0,r.jsx)(t.code,{children:`map`}),`, generators, `,(0,r.jsx)(t.code,{children:`flatMap`}),`, `,(0,r.jsx)(t.code,{children:`pipe`}),` composition`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Errors`})}),(0,r.jsx)(t.td,{children:`006 – 008`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Effect.fail`}),`, tagged errors, error channels, recovery patterns`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Modelling`})}),(0,r.jsx)(t.td,{children:`009 – 010`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Option`}),`, `,(0,r.jsx)(t.code,{children:`Either`}),`, `,(0,r.jsx)(t.code,{children:`Exit`})]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Services & Layers`})}),(0,r.jsx)(t.td,{children:`011 – 013`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Context.Tag`}),`, `,(0,r.jsx)(t.code,{children:`Layer`}),`, testing with mocks`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Schema`})}),(0,r.jsx)(t.td,{children:`014 – 015`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Schema.Struct`}),`, refinements, domain modelling`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Concurrency`})}),(0,r.jsx)(t.td,{children:`016 – 020`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`retry`}),`, schedules, parallelism, `,(0,r.jsx)(t.code,{children:`race`}),`, `,(0,r.jsx)(t.code,{children:`Ref`}),`, fibers`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Resources`})}),(0,r.jsx)(t.td,{children:`021 – 023`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`acquireRelease`}),`, scoped layers, resource patterns`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Streams`})}),(0,r.jsx)(t.td,{children:`024 – 027`}),(0,r.jsxs)(t.td,{children:[(0,r.jsx)(t.code,{children:`Stream`}),` basics, operations, combinators, data pipelines`]})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Observability`})}),(0,r.jsx)(t.td,{children:`028`}),(0,r.jsx)(t.td,{children:`logging, spans`})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`HTTP`})}),(0,r.jsx)(t.td,{children:`029`}),(0,r.jsx)(t.td,{children:`typed HTTP client`})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Capstone`})}),(0,r.jsx)(t.td,{children:`030`}),(0,r.jsx)(t.td,{children:`end-to-end, all areas combined`})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{children:(0,r.jsx)(t.strong,{children:`Advanced`})}),(0,r.jsx)(t.td,{children:`031 – 040`}),(0,r.jsx)(t.td,{children:`config, causes, pattern matching, queues, metrics, managed runtime, request batching`})]})]})]}),`
`,(0,r.jsxs)(t.p,{children:[`Each kata is a single failing Vitest test. Your sensei reads the test and the
`,(0,r.jsx)(t.code,{children:`SENSEI.md`}),`, then asks you targeted questions until you make it green.`]}),`
`,(0,r.jsx)(t.h2,{id:`teaching-contract`,children:`Teaching contract`}),`
`,(0,r.jsxs)(t.p,{children:[`Quoting the dojo's own `,(0,r.jsx)(t.code,{children:`DOJO.md`}),`:`]}),`
`,(0,r.jsxs)(t.blockquote,{children:[`
`,(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:`Never give solutions.`}),` Your role is Socratic guide.`]}),`
`,(0,r.jsxs)(t.ul,{children:[`
`,(0,r.jsx)(t.li,{children:`Ask questions that steer toward the answer`}),`
`,(0,r.jsx)(t.li,{children:`Point to type signatures or API names`}),`
`,(0,r.jsx)(t.li,{children:`Narrow scope: "Focus on the first failing test"`}),`
`,(0,r.jsx)(t.li,{children:`Never write or show solution code`}),`
`]}),`
`]}),`
`,(0,r.jsxs)(t.p,{children:[`That contract is enforced kata-by-kata via per-kata `,(0,r.jsx)(t.code,{children:`SENSEI.md`}),` files, which
also flag which APIs belong to `,(0,r.jsx)(t.em,{children:`you`}),` (the student) versus the test harness
(`,(0,r.jsx)(t.code,{children:`runSync`}),`, `,(0,r.jsx)(t.code,{children:`runSyncExit`}),`) — a small but important detail Effect-TS beginners
often get backwards.`]}),`
`,(0,r.jsx)(t.h2,{id:`requirements`,children:`Requirements`}),`
`,(0,r.jsxs)(t.ul,{children:[`
`,(0,r.jsx)(t.li,{children:`Node.js 20+`}),`
`,(0,r.jsxs)(t.li,{children:[`A package manager that supports workspaces — `,(0,r.jsx)(t.code,{children:`pnpm`}),` is recommended.`]}),`
`,(0,r.jsxs)(t.li,{children:[`The `,(0,r.jsx)(t.code,{children:`effect`}),` runtime is installed as a dependency of the dojo; the test
runner is Vitest.`]}),`
`]}),`
`,(0,r.jsx)(t.h2,{id:`source`,children:`Source`}),`
`,(0,r.jsxs)(t.p,{children:[`The dojo source lives in the `,(0,r.jsx)(t.a,{href:`https://github.com/tomsiwik/dojocho/tree/main/dojos/effect-ts`,children:`Dojocho monorepo`}),`.`]})]})}function u(e={}){let{wrapper:t}=e.components||{};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}export{s as a,o as i,c as n,u as o,i as r,a as t};