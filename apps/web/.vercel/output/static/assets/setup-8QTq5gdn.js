import{a as e}from"./chunk-BNv3lrIs.js";import{Tt as t}from"./index-BPR-Qz1M.js";var n=e(t()),r={title:`dojo setup`,description:`One-time wiring of a project so your agent can run katas.`},i=`

## Usage [#usage]

\`\`\`sh
dojo setup
\`\`\`

\`dojo setup\` prepares the current directory to host one or more dojos. It is
idempotent — running it twice is harmless.

## What it does [#what-it-does]

* Registers the \`/kata\` slash command with your agent (Claude Code by default).
* Writes the sensei rules — the agent-side instructions that enforce Socratic
  teaching: ask questions, never spoil solutions, narrow scope to the next
  failing test.
* Creates the expected workspace layout so installed dojos drop in cleanly.

## Re-running setup [#re-running-setup]

Re-run \`dojo setup\` if you've upgraded the CLI, switched agents, or want to
reset the agent rules to defaults. Your code is untouched.
`,a={contents:[{heading:`usage`,content:"`dojo setup` prepares the current directory to host one or more dojos. It is\nidempotent — running it twice is harmless."},{heading:`what-it-does`,content:"Registers the `/kata` slash command with your agent (Claude Code by default)."},{heading:`what-it-does`,content:`Writes the sensei rules — the agent-side instructions that enforce Socratic
teaching: ask questions, never spoil solutions, narrow scope to the next
failing test.`},{heading:`what-it-does`,content:`Creates the expected workspace layout so installed dojos drop in cleanly.`},{heading:`re-running-setup`,content:"Re-run `dojo setup` if you've upgraded the CLI, switched agents, or want to\nreset the agent rules to defaults. Your code is untouched."}],headings:[{id:`usage`,content:`Usage`},{id:`what-it-does`,content:`What it does`},{id:`re-running-setup`,content:`Re-running setup`}]},o=[{depth:2,url:`#usage`,title:(0,n.jsx)(n.Fragment,{children:`Usage`})},{depth:2,url:`#what-it-does`,title:(0,n.jsx)(n.Fragment,{children:`What it does`})},{depth:2,url:`#re-running-setup`,title:(0,n.jsx)(n.Fragment,{children:`Re-running setup`})}];function s(e){let t={code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,ul:`ul`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`usage`,children:`Usage`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`dojo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` setup`})]})})})}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`dojo setup`}),` prepares the current directory to host one or more dojos. It is
idempotent — running it twice is harmless.`]}),`
`,(0,n.jsx)(t.h2,{id:`what-it-does`,children:`What it does`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Registers the `,(0,n.jsx)(t.code,{children:`/kata`}),` slash command with your agent (Claude Code by default).`]}),`
`,(0,n.jsx)(t.li,{children:`Writes the sensei rules — the agent-side instructions that enforce Socratic
teaching: ask questions, never spoil solutions, narrow scope to the next
failing test.`}),`
`,(0,n.jsx)(t.li,{children:`Creates the expected workspace layout so installed dojos drop in cleanly.`}),`
`]}),`
`,(0,n.jsx)(t.h2,{id:`re-running-setup`,children:`Re-running setup`}),`
`,(0,n.jsxs)(t.p,{children:[`Re-run `,(0,n.jsx)(t.code,{children:`dojo setup`}),` if you've upgraded the CLI, switched agents, or want to
reset the agent rules to defaults. Your code is untouched.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};