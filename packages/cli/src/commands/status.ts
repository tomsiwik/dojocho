import {
  CLI,
  readDojoRc,
  readCatalog,
  resolveAllKatas,
  listDojos,
} from "../config";
import { findCurrentKata, findNextKata, completedCount } from "../state";
import { status as statusTag } from "../format";

export function status(root: string, _args: string[]): void {
  const rc = readDojoRc(root);

  if (!rc.currentDojo) {
    console.log(statusTag({ state: "no-dojo" }));
    return;
  }

  const progress = rc.progress?.[rc.currentDojo];

  if (!progress?.introduced) {
    const fields: Record<string, string> = {
      state: "intro",
      dojo: rc.currentDojo,
      run: `${CLI} intro`,
    };
    const dojos = listDojos(root);
    if (dojos.length > 1) {
      fields.dojos = dojos.join(", ");
    }
    console.log(statusTag(fields));
    return;
  }

  let catalog;
  try {
    catalog = readCatalog(root, rc.currentDojo);
  } catch {
    console.log(statusTag({
      state: "intro",
      dojo: rc.currentDojo,
      run: `${CLI} intro`,
    }));
    return;
  }

  const katas = resolveAllKatas(root, rc, catalog);
  const completed = completedCount(katas, progress);
  const total = katas.length;
  const current = findCurrentKata(katas, rc.currentKata);

  if (!current) {
    const next = findNextKata(katas, progress);
    if (!next) {
      console.log(statusTag({
        state: "complete",
        dojo: rc.currentDojo,
        progress: `${completed}/${total}`,
      }));
    } else {
      console.log(statusTag({
        state: "no-kata",
        dojo: rc.currentDojo,
        progress: `${completed}/${total}`,
        run: `${CLI} kata --start`,
      }));
    }
    return;
  }

  const briefed = progress?.kataIntros?.includes(current.name) === true;

  console.log(statusTag({
    state: briefed ? "practicing" : "kata-intro",
    dojo: rc.currentDojo,
    kata: current.name,
    progress: `${completed}/${total}`,
    run: `${CLI} kata ${briefed ? "--check" : "intro"}`,
  }));
}
