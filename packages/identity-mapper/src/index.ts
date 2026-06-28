import type {
  CityModule,
  IdentityFragment,
  PrologueAction
} from "@lacuna-engine/schema";

export type PrologueRecord = {
  actionId: string;
  tendency: PrologueAction["tendency"];
};

export function recordPrologueAction(
  city: CityModule,
  actionId: string
): PrologueRecord {
  const action = city.prologueActions.find((candidate) => candidate.id === actionId);

  if (!action) {
    throw new Error(`Unknown prologue action: ${actionId}`);
  }

  return {
    actionId: action.id,
    tendency: action.tendency
  };
}

export function summarizePrologueTendency(
  records: PrologueRecord[]
): PrologueAction["tendency"] | "unresolved" {
  const totals = records.reduce<Record<string, number>>((current, record) => {
    current[record.tendency] = (current[record.tendency] ?? 0) + 1;
    return current;
  }, {});

  const [winner] = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return (winner?.[0] as PrologueAction["tendency"] | undefined) ?? "unresolved";
}

export function generateIdentityFragments(
  city: CityModule,
  _records: PrologueRecord[] = []
): IdentityFragment[] {
  const roleIds = new Set(city.entryRoles.map((role) => role.id));
  const fragments = city.identityFragments.map((fragment) => {
    if (!roleIds.has(fragment.mappedRoleId)) {
      throw new Error(
        `Identity fragment ${fragment.id} maps to missing role ${fragment.mappedRoleId}`
      );
    }

    return fragment;
  });

  if (fragments.length !== 3) {
    throw new Error("Identity mapper requires exactly three fragments");
  }

  return fragments;
}
