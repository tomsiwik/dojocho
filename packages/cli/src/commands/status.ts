import {
  CLI,
  readDojoRc,
  readCatalog,
  resolveAllKatas,
  listDojos,
} from "../config";
import { findCurrentKata, findNextKata, completedCount } from "../state";

export function status(root: string, _args: string[]): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    console.log("state: no-dojo");
    return;
  }

  const progress = rc.progress?.[rc.currentDojo];

  if (!progress?.introduced) {
    console.log(`state: intro`);
    console.log(`dojo: ${rc.currentDojo}`);
    console.log(`run: ${CLI} intro`);
    const dojos = listDojos(root);
    if (dojos.length > 1) {
      console.log(`dojos: ${dojos.join(", ")}`);
    }
    return;
  }

  let catalog;
  try {
    catalog = readCatalog(root, rc.currentDojo);
  } catch {
    console.log(`state: intro`);
    console.log(`dojo: ${rc.currentDojo}`);
    console.log(`run: ${CLI} intro`);
    return;
  }

  const katas = resolveAllKatas(root, rc, catalog);
  const completed = completedCount(katas, progress);
  const total = katas.length;
  const current = findCurrentKata(katas, rc.currentKata);

  if (!current) {
    const next = findNextKata(katas, progress);
    if (!next) {
      console.log(`state: complete`);
      console.log(`dojo: ${rc.currentDojo}`);
      console.log(`progress: ${completed}/${total}`);
    } else {
      console.log(`state: no-kata`);
      console.log(`dojo: ${rc.currentDojo}`);
      console.log(`progress: ${completed}/${total}`);
      console.log(`run: ${CLI} kata --start`);
    }
    return;
  }

  const briefed = progress?.kataIntros?.includes(current.name) === true;

  console.log(`state: ${briefed ? "practicing" : "kata-intro"}`);
  console.log(`dojo: ${rc.currentDojo}`);
  console.log(`kata: ${current.name}`);
  console.log(`progress: ${completed}/${total}`);
  console.log(`run: ${CLI} kata ${briefed ? "--check" : "intro"}`);
}
