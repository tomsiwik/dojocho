import{o as e}from"../_runtime.mjs";import{s as t}from"../_libs/@radix-ui/react-arrow+[...].mjs";import{r as n}from"./chunk-BHwK3AQr.mjs";var r=e(t()),i=n({_markdown:()=>o,default:()=>u,frontmatter:()=>a,structuredData:()=>s,toc:()=>c}),a={title:`Installation`,description:`Install the Dojocho CLI globally and verify it runs.`},o=`

## Install [#install]

<InstallCommand />

Verify the install:

\`\`\`sh
dojo --version
\`\`\`

## Requirements [#requirements]

* Node.js 20 or newer.
* A coding agent that can read project files and run shell commands —
  [Claude Code](https://docs.anthropic.com/claude/docs/claude-code) is the
  default target.
* For language-specific dojos, the matching toolchain (e.g. \`pnpm\` for
  TypeScript dojos, \`uv\` for Python dojos).

## Uninstall [#uninstall]

\`\`\`sh
npm uninstall -g @dojocho/cli
\`\`\`

Removing installed dojos from a project is a normal \`pnpm remove\` (or
equivalent) — they live in your project's dependencies.
`,s={contents:[{heading:`install`,content:`Verify the install:`},{heading:`requirements`,content:`Node.js 20 or newer.`},{heading:`requirements`,content:`A coding agent that can read project files and run shell commands —
Claude Code is the
default target.`},{heading:`requirements`,content:"For language-specific dojos, the matching toolchain (e.g. `pnpm` for\nTypeScript dojos, `uv` for Python dojos)."},{heading:`uninstall`,content:"Removing installed dojos from a project is a normal `pnpm remove` (or\nequivalent) — they live in your project's dependencies."}],headings:[{id:`install`,content:`Install`},{id:`requirements`,content:`Requirements`},{id:`uninstall`,content:`Uninstall`}]},c=[{depth:2,url:`#install`,title:(0,r.jsx)(r.Fragment,{children:`Install`})},{depth:2,url:`#requirements`,title:(0,r.jsx)(r.Fragment,{children:`Requirements`})},{depth:2,url:`#uninstall`,title:(0,r.jsx)(r.Fragment,{children:`Uninstall`})}];function l(e){let t={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,ul:`ul`,...e.components},{InstallCommand:n}=t;return n||d(`InstallCommand`,!0),(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h2,{id:`install`,children:`Install`}),`
`,(0,r.jsx)(n,{}),`
`,(0,r.jsx)(t.p,{children:`Verify the install:`}),`
`,(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,r.jsx)(t.code,{children:(0,r.jsxs)(t.span,{className:`line`,children:[(0,r.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --version`})]})})})}),`
`,(0,r.jsx)(t.h2,{id:`requirements`,children:`Requirements`}),`
`,(0,r.jsxs)(t.ul,{children:[`
`,(0,r.jsx)(t.li,{children:`Node.js 20 or newer.`}),`
`,(0,r.jsxs)(t.li,{children:[`A coding agent that can read project files and run shell commands —
`,(0,r.jsx)(t.a,{href:`https://docs.anthropic.com/claude/docs/claude-code`,children:`Claude Code`}),` is the
default target.`]}),`
`,(0,r.jsxs)(t.li,{children:[`For language-specific dojos, the matching toolchain (e.g. `,(0,r.jsx)(t.code,{children:`pnpm`}),` for
TypeScript dojos, `,(0,r.jsx)(t.code,{children:`uv`}),` for Python dojos).`]}),`
`]}),`
`,(0,r.jsx)(t.h2,{id:`uninstall`,children:`Uninstall`}),`
`,(0,r.jsx)(r.Fragment,{children:(0,r.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,r.jsx)(t.code,{children:(0,r.jsxs)(t.span,{className:`line`,children:[(0,r.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`npm`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` uninstall`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -g`}),(0,r.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` @dojocho/cli`})]})})})}),`
`,(0,r.jsxs)(t.p,{children:[`Removing installed dojos from a project is a normal `,(0,r.jsx)(t.code,{children:`pnpm remove`}),` (or
equivalent) — they live in your project's dependencies.`]})]})}function u(e={}){let{wrapper:t}=e.components||{};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}function d(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{s as a,o as i,c as n,u as o,i as r,a as t};