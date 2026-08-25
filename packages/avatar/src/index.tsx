import type { SVGProps } from "react";

export const avatarCatalog = {
  head: ["oval", "round", "angular"],
  palette: ["porcelain", "warm", "golden"],
  eyes: ["calm", "bright", "sharp", "soft"],
  brows: ["fine", "arched", "bold"],
  nose: ["short", "long", "curved"],
  mouth: ["quiet", "smile", "pout", "open"],
  hair: ["shimada", "maru", "loose", "samurai"],
  accessory: ["none", "kanzashi", "comb", "ribbon"],
} as const;

export type AvatarTrait = keyof typeof avatarCatalog;
export type AvatarDefinition = { [K in AvatarTrait]: (typeof avatarCatalog)[K][number] };
export type AvatarOverrides = Partial<AvatarDefinition>;

const labels: Record<AvatarTrait, Record<string, string>> = {
  head: { oval: "Oval", round: "Round", angular: "Angular" },
  palette: { porcelain: "Porcelain", warm: "Warm", golden: "Golden" },
  eyes: { calm: "Calm", bright: "Bright", sharp: "Sharp", soft: "Soft" },
  brows: { fine: "Fine", arched: "Arched", bold: "Bold" },
  nose: { short: "Short", long: "Long", curved: "Curved" },
  mouth: { quiet: "Quiet", smile: "Smile", pout: "Pout", open: "Open" },
  hair: { shimada: "Shimada", maru: "Maru-mage", loose: "Loose", samurai: "Samurai" },
  accessory: { none: "None", kanzashi: "Kanzashi", comb: "Comb", ribbon: "Ribbon" },
};

export function avatarTraitLabel(trait: AvatarTrait, value: string): string {
  return labels[trait][value] ?? value;
}

function hash(value: string): number {
  let result = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16_777_619);
  }
  return result >>> 0;
}

export function createAvatar(seed: string, overrides: AvatarOverrides = {}): AvatarDefinition {
  return Object.fromEntries(Object.entries(avatarCatalog).map(([trait, options]) => {
    const key = trait as AvatarTrait;
    return [key, overrides[key] ?? options[hash(`${seed}:${trait}`) % options.length]];
  })) as AvatarDefinition;
}

export function createAvatarSeed(): string {
  const values = new Uint32Array(2);
  globalThis.crypto?.getRandomValues?.(values);
  if (values.every((value) => value === 0)) {
    values[0] = Date.now() >>> 0;
    values[1] = Math.floor(Math.random() * 0xffff_ffff);
  }
  return `ukiyo-${[...values].map((value) => value.toString(36)).join("-")}`;
}

export function countAvatarCombinations(): number {
  return Object.values(avatarCatalog).reduce((total, options) => total * options.length, 1);
}

const skins = {
  porcelain: { base: "#f4dfca", shade: "#dcae98", blush: "#d98f82" },
  warm: { base: "#e8c4a3", shade: "#c88e75", blush: "#c9786e" },
  golden: { base: "#d9ac77", shade: "#ad725d", blush: "#b86660" },
} as const;

export function UkiyoAvatar({ avatar, title = "Ukiyo-e avatar", ...props }: SVGProps<SVGSVGElement> & { avatar: AvatarDefinition; title?: string }) {
  const skin = skins[avatar.palette];
  return (
    <svg aria-label={title} role="img" viewBox="0 0 320 360" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>{title}</title>
      <defs>
        <linearGradient id="dojo-skin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8ed" stopOpacity=".72" />
          <stop offset=".58" stopColor={skin.base} />
          <stop offset="1" stopColor={skin.shade} />
        </linearGradient>
      </defs>
      <g stroke="#171412" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
        <path d="M128 292c2 27-9 48-31 61h132c-25-14-36-34-33-64" fill="url(#dojo-skin)" />
        <HairBack kind={avatar.hair} />
        <Head kind={avatar.head} />
        <path d="M231 171c20-6 27 7 19 24-5 10-13 13-22 12" fill={skin.base} />
        <path d="M239 181c7-4 9 5 2 12" fill="none" opacity=".58" />
        <ellipse cx="121" cy="205" fill={skin.blush} opacity=".18" rx="30" ry="17" stroke="none" />
        <ellipse cx="201" cy="205" fill={skin.blush} opacity=".16" rx="27" ry="15" stroke="none" />
        <Brows kind={avatar.brows} />
        <Eyes kind={avatar.eyes} />
        <Nose kind={avatar.nose} />
        <Mouth kind={avatar.mouth} />
        <HairFront kind={avatar.hair} />
        <Accessory kind={avatar.accessory} />
      </g>
    </svg>
  );
}

function Head({ kind }: { kind: AvatarDefinition["head"] }) {
  const path = kind === "round"
    ? "M82 121c10-61 123-83 157-10 27 57 5 161-54 195-45 26-105-8-115-76-7-47 2-82 12-109Z"
    : kind === "angular"
      ? "M87 110c29-49 119-66 151 1 22 47 3 143-28 178l-43 28-54-22c-30-22-44-69-43-111 1-33 6-56 17-74Z"
      : "M89 106c29-48 116-62 148 4 24 50 1 153-44 190-38 32-99 2-118-61-15-50-3-106 14-133Z";
  return <path d={path} fill="url(#dojo-skin)" />;
}

function Eyes({ kind }: { kind: AvatarDefinition["eyes"] }) {
  const lift = kind === "sharp" ? -5 : kind === "soft" ? 4 : 0;
  const left = kind === "bright" ? "M91 175q27-19 49 1-25 13-49-1Z" : `M91 ${178 + lift}q26 ${kind === "soft" ? -8 : -15} 49 0-25 ${kind === "soft" ? 9 : 6}-49 0Z`;
  const right = kind === "bright" ? "M170 176q28-17 51 2-27 11-51-2Z" : `M170 ${179 + lift}q29 ${kind === "soft" ? -7 : -13} 51 1-27 ${kind === "soft" ? 8 : 5}-51-1Z`;
  return <><path d={left} fill="#fffaf1" /><path d={right} fill="#fffaf1" /><ellipse cx="122" cy={176 + lift} fill="#171412" rx="3.2" ry="4.4" stroke="none" /><ellipse cx="195" cy={178 + lift} fill="#171412" rx="3.2" ry="4.4" stroke="none" /></>;
}

function Brows({ kind }: { kind: AvatarDefinition["brows"] }) {
  const width = kind === "bold" ? 5.5 : kind === "fine" ? 2.2 : 3.4;
  const left = kind === "arched" ? "M91 152q26-20 51-4" : "M91 153q26-12 51-3";
  const right = kind === "arched" ? "M168 149q28-18 54 3" : "M168 151q29-10 54 4";
  return <><path d={left} fill="none" strokeWidth={width} /><path d={right} fill="none" strokeWidth={width} /></>;
}

function Nose({ kind }: { kind: AvatarDefinition["nose"] }) {
  const path = kind === "short" ? "M156 180q-3 30-13 40 10 8 22 1" : kind === "curved" ? "M157 180q2 26-11 47 11 10 25-1" : "M157 178q-1 38-15 54 12 9 28 0";
  return <path d={path} fill="none" />;
}

function Mouth({ kind }: { kind: AvatarDefinition["mouth"] }) {
  const path = kind === "smile" ? "M139 254q21 12 40-2-15 24-40 2Z" : kind === "pout" ? "M143 255q17-12 34 1-17 12-34-1Z" : kind === "open" ? "M139 253q21-13 41 2-20 25-41-2Z" : "M142 255q18-6 35 1-19 7-35-1Z";
  return <path d={path} fill={kind === "quiet" ? "#c66e64" : "#b94847"} />;
}

function HairBack({ kind }: { kind: AvatarDefinition["hair"] }) {
  if (kind === "loose") return <path d="M77 125Q83 30 169 35q83 4 82 98l-7 184-35 25 3-203q-20-65-118-8l-11 177-31-25Z" fill="#151311" />;
  if (kind === "samurai") return <><path d="M82 126Q89 44 166 50q74 3 79 83l-19 32q-3-66-59-79-57 8-80 53Z" fill="#151311" /><path d="M132 62q-7-45 33-48 41 3 28 49" fill="#151311" /></>;
  return <><path d="M77 129Q81 45 168 42q80 5 82 91l-19 40q-10-72-66-84-60 8-80 56Z" fill="#151311" /><ellipse cx={kind === "maru" ? 209 : 193} cy="54" fill="#151311" rx={kind === "maru" ? 54 : 44} ry={kind === "maru" ? 35 : 48} /></>;
}

function HairFront({ kind }: { kind: AvatarDefinition["hair"] }) {
  if (kind === "samurai") return <path d="M87 128q30-65 78-45 46-22 72 39-47-26-68-3-28-28-82 9Z" fill="#151311" />;
  if (kind === "loose") return <path d="M84 125q26-72 82-46 39-26 75 42-50-36-71 2-35-33-86 2Z" fill="#151311" />;
  return <path d="M83 128q24-69 82-42 52-25 77 36-49-32-76 1-31-31-83 5Z" fill="#151311" />;
}

function Accessory({ kind }: { kind: AvatarDefinition["accessory"] }) {
  if (kind === "none") return null;
  if (kind === "comb") return <><path d="M120 70q45-24 89 0l-7 18q-36-17-75 1Z" fill="#d4a74e" /><path d="M132 80v18m14-22v17m15-19v17m16-16v18m15-14v18" fill="none" stroke="#9c672f" strokeWidth="2" /></>;
  if (kind === "ribbon") return <><path d="M202 60q25-33 45-4l-17 19 22 15q-26 21-49-4Z" fill="#c84d42" /><circle cx="208" cy="70" fill="#e29a68" r="8" /></>;
  return <><path d="M97 74 250 43M104 86l139 5" fill="none" stroke="#d8ad5b" strokeWidth="7" /><circle cx="250" cy="43" fill="#d05846" r="9" /><path d="m251 43 22-17m-21 17 27 5" fill="none" stroke="#d8ad5b" strokeWidth="5" /></>;
}
