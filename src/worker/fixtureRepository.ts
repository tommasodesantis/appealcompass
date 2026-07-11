import fixture0001 from "../../fixtures/cases/03000000000001.json";
import fixture0020 from "../../fixtures/cases/03000000000020.json";
import fixture0030 from "../../fixtures/cases/03000000000030.json";
import fixture0040 from "../../fixtures/cases/03000000000040.json";
import fixture0050 from "../../fixtures/cases/03000000000050.json";
import { caseFileFromJson } from "../domain/caseSerde";
import { NotFoundError } from "../domain/errors";
import type { Comparable, Parcel, SubjectRecord } from "../domain/models";
import { formatPin, normalizePin } from "../domain/pin";
import type { CaseRepository } from "./repository";

const FIXTURES: Record<string, unknown> = {
  "03000000000001": fixture0001,
  "03000000000020": fixture0020,
  "03000000000030": fixture0030,
  "03000000000040": fixture0040,
  "03000000000050": fixture0050,
};

export class FixtureRepository implements CaseRepository {
  async loadSubjectByPin(pin: string): Promise<SubjectRecord> {
    const normalized = normalizePin(pin);
    const fixture = FIXTURES[normalized];
    if (!fixture) {
      throw new NotFoundError(`PIN ${formatPin(normalized)} was not found in offline fixtures.`);
    }
    const parsed = caseFileFromJson(fixture);
    const { comparables: _comparables, ...subject } = parsed;
    return subject;
  }

  async loadComparables(parcel: Parcel): Promise<[Comparable[], string[]]> {
    const fixture = FIXTURES[parcel.pin];
    if (!fixture) return [[], []];
    const parsed = caseFileFromJson(fixture);
    const originalTownship = parsed.publicParcel.townshipCode;
    if (
      parcel.townshipName !== parsed.publicParcel.townshipName &&
      parcel.townshipCode !== originalTownship
    ) {
      return [[], ["The corrected township has no matching offline fixture pool."]];
    }
    return [
      parsed.comparables.filter(
        (comp) =>
          comp.propertyClass === parcel.propertyClass &&
          (comp.townshipCode ?? originalTownship) === (parcel.townshipCode ?? originalTownship),
      ),
      [],
    ];
  }
}
