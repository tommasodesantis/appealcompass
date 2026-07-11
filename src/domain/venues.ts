import {
  BOR_OFFICIAL_URL,
  BOR_PROPERTY_OWNER_GUIDE_URL,
  BOR_RULES_URL,
  CCAO_APPEALS_URL,
  CCAO_OFFICIAL_URL,
  PTAB_OFFICIAL_URL,
  PTAB_RESIDENTIAL_APPEAL_FORM_URL,
} from "./config";
import type { ResolvedVenue } from "./models";

export interface VenueMetadata {
  key: ResolvedVenue;
  name: string;
  officialUrl: string;
  submissionUrl: string;
  rulesUrl: string;
}

const VENUES: Record<ResolvedVenue, VenueMetadata> = {
  assessor: {
    key: "assessor",
    name: "Cook County Assessor",
    officialUrl: CCAO_OFFICIAL_URL,
    submissionUrl: CCAO_APPEALS_URL,
    rulesUrl: CCAO_APPEALS_URL,
  },
  bor: {
    key: "bor",
    name: "Cook County Board of Review",
    officialUrl: BOR_OFFICIAL_URL,
    submissionUrl: BOR_PROPERTY_OWNER_GUIDE_URL,
    rulesUrl: BOR_RULES_URL,
  },
  ptab: {
    key: "ptab",
    name: "Illinois Property Tax Appeal Board",
    officialUrl: PTAB_OFFICIAL_URL,
    submissionUrl: PTAB_RESIDENTIAL_APPEAL_FORM_URL,
    rulesUrl: PTAB_OFFICIAL_URL,
  },
  closed: {
    key: "closed",
    name: "Cook County appeal preparation",
    officialUrl: CCAO_OFFICIAL_URL,
    submissionUrl: CCAO_APPEALS_URL,
    rulesUrl: CCAO_APPEALS_URL,
  },
};

export function adapterForVenue(venue: ResolvedVenue): VenueMetadata {
  return VENUES[venue];
}
