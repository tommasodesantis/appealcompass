import { routeCase } from "./routing";
import type { AppealStatusInput } from "./routing";

const noneFiled: AppealStatusInput = {
  assessorAppealFiled: false,
  assessorDecisionReceived: null,
  borAppealFiled: false,
  borDecisionReceived: null,
  borDecisionDate: null,
};

test.each([
  ["Berwyn", "2026-07-06", "2026-07-06"],
  ["Cicero", "2026-07-06", "2026-07-31"],
  ["Palos", "2026-07-06", "2026-07-17"],
  ["Lakeview", "2026-07-06", "2026-07-13"],
  ["Maine", "2026-07-06", "2026-07-21"],
  ["Elk Grove", "2026-07-06", "2026-08-04"],
  ["Stickney", "2026-07-06", "2026-08-12"],
])("reports %s Assessor window when Assessor is selected", (township, today, deadline) => {
  const route = routeCase(township, today, "assessor", null, noneFiled);
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("open");
  expect(route.deadline).toBe(deadline);
  expect(route.reasoning.join(" ")).toContain("You selected the Cook County Assessor");
});

test("reports BOR window when BOR is selected", () => {
  const route = routeCase("Rogers Park", "2025-07-10", "bor", null, noneFiled);
  expect(route.venue).toBe("bor");
  expect(route.actionStatus).toBe("open");
  expect(route.deadline).toBe("2025-08-05");
  expect(route.reasoning.join(" ")).toContain("Evidence deadline: 2025-08-15");
});

test("does not switch to Assessor when BOR is selected during an Assessor window", () => {
  const route = routeCase("Berwyn", "2026-07-06", "bor", null, noneFiled);
  expect(route.venue).toBe("bor");
  expect(route.actionStatus).toBe("closed");
  expect(route.deadline).toBe("2025-12-12");
  expect(route.reasoning.join(" ")).toContain("No configured BOR filing window");
});

test("does not switch to BOR when Assessor is selected during a BOR window", () => {
  const route = routeCase("Rogers Park", "2025-07-10", "assessor", null, noneFiled);
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("upcoming");
  expect(route.deadline).toBe("2026-04-17");
});

test("selected Assessor venue remains selected when all configured windows are closed", () => {
  const route = routeCase("Rogers Park", "2027-01-01", "assessor", null, noneFiled);
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("closed");
  expect(route.deadline).toBe("2026-06-01");
  expect(route.reasoning.some((reason) => reason.includes("Certificate of Error"))).toBe(true);
  expect(route.warnings.some((warning) => warning.includes("past its session end"))).toBe(true);
});

test("unknown township is honest and non-crashing for selected BOR venue", () => {
  const route = routeCase("Not A Township", "2025-07-10", "bor", null, noneFiled);
  expect(route.venue).toBe("bor");
  expect(route.actionStatus).toBe("closed");
  expect(route.deadline).toBeNull();
  expect(route.headline).toContain("BOR window is not currently open");
});

test("PTAB requires a decision date", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    assessorAppealFiled: true,
    assessorDecisionReceived: true,
    borAppealFiled: true,
    borDecisionReceived: true,
    borDecisionDate: null,
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("needs_input");
  expect(route.reasoning.join(" ")).toContain("refuses to guess");
});

test("PTAB is eligible from a supplied decision date", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    assessorAppealFiled: true,
    assessorDecisionReceived: true,
    borAppealFiled: true,
    borDecisionReceived: true,
    borDecisionDate: "2026-05-20",
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("open");
  expect(route.deadline).toBe("2026-06-19");
  expect(route.daysRemaining).toBe(18);
});

test("PTAB expires from a supplied decision date", () => {
  const route = routeCase("Rogers Park", "2026-07-06", "ptab", null, {
    assessorAppealFiled: true,
    assessorDecisionReceived: true,
    borAppealFiled: true,
    borDecisionReceived: true,
    borDecisionDate: "2026-05-20",
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("expired");
  expect(route.deadline).toBe("2026-06-19");
  expect(route.daysRemaining).toBe(-17);
});

test("PTAB explains waiting when a BOR appeal is filed but no decision exists", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    assessorAppealFiled: true,
    assessorDecisionReceived: true,
    borAppealFiled: true,
    borDecisionReceived: false,
    borDecisionDate: null,
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("upcoming");
  expect(route.reasoning.join(" ")).toContain("PTAB becomes available only after");
});
