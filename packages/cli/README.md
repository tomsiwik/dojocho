# dojocho

Installable coding dojos that turn your AI agent into a sensei.

## Install

```sh
npm install -g dojocho
# or
pnpm add -g dojocho
# or
bun add -g dojocho
```

After install, the CLI is available as `dojo`.

## Usage

```sh
dojo setup --claude       # set up your dojo (creates dojo.config.ts, wires up your agent)
dojo add effect-ts        # install a training pack (a "dojo")
claude /kata              # start practicing
```

You write the code. The agent runs your tests, points out where you're
stuck, and asks Socratic questions instead of solving the kata for you.
Think pair programming with a patient mentor who knows the material but
lets you do the typing.

## Documentation

Full docs at **https://dojocho.ai/docs**.

- [Installation](https://dojocho.ai/docs/installation)
- [Quickstart](https://dojocho.ai/docs/quickstart)
- [Commands](https://dojocho.ai/docs/commands/setup)
- [Available dojos](https://dojocho.ai/dojos)

## License

MIT © Tomas Sivicki
