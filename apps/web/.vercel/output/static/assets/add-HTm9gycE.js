import{a as e}from"./chunk-BNv3lrIs.js";import{Tt as t}from"./index-BPR-Qz1M.js";var n=e(t()),r={title:`dojo add`,description:`Install a dojo from the catalog into the current project.`},i=`

## Usage [#usage]

\`\`\`sh
dojo add <name>
\`\`\`

Examples:

\`\`\`sh
dojo add effect-ts
dojo add pydantic-agents
\`\`\`

Each dojo is published as an npm package under the \`@dojocho/*\` scope. \`dojo
add\` is a thin wrapper that:

* Installs the package with your project's package manager.
* Registers the dojo with your project's \`dojocho.json\` so \`/kata\` can find it.
* Runs any per-dojo \`prepare\` script (e.g. installing Python deps via \`uv\`).

## Listing installed dojos [#listing-installed-dojos]

\`\`\`sh
dojo add --list
\`\`\`

prints the dojos currently registered in this project.

## Removing a dojo [#removing-a-dojo]

Use your package manager:

\`\`\`sh
pnpm remove @dojocho/effect-ts
\`\`\`

Then run \`dojo setup\` to refresh the registration.
`,a={contents:[{heading:`usage`,content:`Examples:`},{heading:`usage`,content:"Each dojo is published as an npm package under the `@dojocho/*` scope. `dojo\nadd` is a thin wrapper that:"},{heading:`usage`,content:`Installs the package with your project's package manager.`},{heading:`usage`,content:"Registers the dojo with your project's `dojocho.json` so `/kata` can find it."},{heading:`usage`,content:"Runs any per-dojo `prepare` script (e.g. installing Python deps via `uv`)."},{heading:`listing-installed-dojos`,content:`prints the dojos currently registered in this project.`},{heading:`removing-a-dojo`,content:`Use your package manager:`},{heading:`removing-a-dojo`,content:"Then run `dojo setup` to refresh the registration."}],headings:[{id:`usage`,content:`Usage`},{id:`listing-installed-dojos`,content:`Listing installed dojos`},{id:`removing-a-dojo`,content:`Removing a dojo`}]},o=[{depth:2,url:`#usage`,title:(0,n.jsx)(n.Fragment,{children:`Usage`})},{depth:2,url:`#listing-installed-dojos`,title:(0,n.jsx)(n.Fragment,{children:`Listing installed dojos`})},{depth:2,url:`#removing-a-dojo`,title:(0,n.jsx)(n.Fragment,{children:`Removing a dojo`})}];function s(e){let t={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,ul:`ul`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`usage`,children:`Usage`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`nam`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]})})})}),`
`,(0,n.jsx)(t.p,{children:`Examples:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` effect-ts`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pydantic-agents`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`Each dojo is published as an npm package under the `,(0,n.jsx)(t.code,{children:`@dojocho/*`}),` scope. `,(0,n.jsx)(t.code,{children:`dojo add`}),` is a thin wrapper that:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Installs the package with your project's package manager.`}),`
`,(0,n.jsxs)(t.li,{children:[`Registers the dojo with your project's `,(0,n.jsx)(t.code,{children:`dojocho.json`}),` so `,(0,n.jsx)(t.code,{children:`/kata`}),` can find it.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Runs any per-dojo `,(0,n.jsx)(t.code,{children:`prepare`}),` script (e.g. installing Python deps via `,(0,n.jsx)(t.code,{children:`uv`}),`).`]}),`
`]}),`
`,(0,n.jsx)(t.h2,{id:`listing-installed-dojos`,children:`Listing installed dojos`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` add`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --list`})]})})})}),`
`,(0,n.jsx)(t.p,{children:`prints the dojos currently registered in this project.`}),`
`,(0,n.jsx)(t.h2,{id:`removing-a-dojo`,children:`Removing a dojo`}),`
`,(0,n.jsx)(t.p,{children:`Use your package manager:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`pnpm`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` remove`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` @dojocho/effect-ts`})]})})})}),`
`,(0,n.jsxs)(t.p,{children:[`Then run `,(0,n.jsx)(t.code,{children:`dojo setup`}),` to refresh the registration.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};