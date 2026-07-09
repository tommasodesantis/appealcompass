import { routeCase } from "./routing";

test.each([
  ["Berwyn", "2026-07-06", "2026-07-06"],
  ["Cicero", "2026-07-06", "2026-07-31"],
  ["Palos", "2026-07-06", "2026-07-17"],
  ["Lakeview", "2026-07-06", "2026-07-13"],
  ["Maine", "2026-07-06", "2026-07-21"],
  ["Elk Grove", "2026-07-06", "2026-08-04"],
  ["Stickney", "2026-07-06", "2026-08-12"],
])("reports %s Assessor window when Assessor is selected", (township, today, deadline) => {
  const route = routeCase(township, today, "assessor");
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("open");
  expect(route.deadlineState).toBe("published");
  expect(route.deadline).toBe(deadline);
  expect(route.deadlines.map((item) => item.label)).toEqual(["Filing opens", "Filing closes"]);
});

test("does not reuse the expired 2025 BOR schedule for Tax Year 2026", () => {
  const route = routeCase("Rogers Park", "2026-07-10", "bor");
  expect(route.venue).toBe("bor");
  expect(route.actionStatus).toBe("upcoming");
  expect(route.deadlineState).toBe("not_published");
  expect(route.deadline).toBeNull();
  expect(route.deadlineLabel).toBe("2026 BOR dates not published yet");
  expect(route.reasoning.join(" ")).toContain("prior Tax Year 2025 schedule");
});

test("does not switch to Assessor when BOR is selected during an Assessor window", () => {
  const route = routeCase("Berwyn", "2026-07-06", "bor");
  expect(route.venue).toBe("bor");
  expect(route.deadlineState).toBe("not_published");
});

test("does not switch to BOR when Assessor is selected", () => {
  const route = routeCase("Rogers Park", "2025-07-10", "assessor");
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("upcoming");
  expect(route.deadline).toBe("2026-04-17");
});

test("selected Assessor venue remains selected when its configured window is closed", () => {
  const route = routeCase("Rogers Park", "2027-01-01", "assessor");
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("closed");
  expect(route.deadlineState).toBe("expired");
  expect(route.deadline).toBe("2026-06-01");
  expect(route.reasoning.some((reason) => reason.includes("Certificate of Error"))).toBe(true);
  expect(route.warnings.some((warning) => warning.includes("past its session end"))).toBe(true);
});

test("Assessor townships without released dates are labeled clearly", () => {
  const route = routeCase("Bremen", "2026-07-09", "assessor");
  expect(route.venue).toBe("assessor");
  expect(route.actionStatus).toBe("upcoming");
  expect(route.deadlineState).toBe("not_published");
  expect(route.deadline).toBeNull();
  expect(route.deadlineLabel).toBe("Township dates not published yet");
});

test("unknown township is honest and non-crashing for selected BOR venue", () => {
  const route = routeCase("Not A Township", "2026-07-10", "bor");
  expect(route.venue).toBe("bor");
  expect(route.deadlineState).toBe("not_published");
  expect(route.deadline).toBeNull();
});

test("PTAB requires the written notice date when notice was received", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    borNoticeReceived: true,
    borNoticeDate: null,
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("needs_input");
  expect(route.deadlineState).toBe("awaiting_notice");
  expect(route.reasoning.join(" ")).toContain("will not guess");
});

test("PTAB moves a 30th day that is an Illinois holiday to the next business day", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    borNoticeReceived: true,
    borNoticeDate: "2026-05-20",
  });
  expect(route.venue).toBe("ptab");
  expect(route.actionStatus).toBe("open");
  expect(route.deadline).toBe("2026-06-22");
  expect(route.daysRemaining).toBe(21);
  expect(route.reasoning.join(" ")).toContain("30th day was 2026-06-19");
});

test("PTAB moves a Sunday deadline to Monday", () => {
  const route = routeCase("Rogers Park", "2026-07-01", "ptab", null, {
    borNoticeReceived: true,
    borNoticeDate: "2026-06-19",
  });
  expect(route.deadline).toBe("2026-07-20");
  expect(route.reasoning.join(" ")).toContain("weekend or Illinois legal holiday");
});

test("PTAB expired state uses the adjusted notice-based date", () => {
  const route = routeCase("Rogers Park", "2026-07-06", "ptab", null, {
    borNoticeReceived: true,
    borNoticeDate: "2026-05-20",
  });
  expect(route.actionStatus).toBe("expired");
  expect(route.deadlineState).toBe("expired");
  expect(route.deadline).toBe("2026-06-22");
  expect(route.daysRemaining).toBe(-14);
});

test("PTAB explains waiting when the written BOR notice has not arrived", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    borNoticeReceived: false,
    borNoticeDate: null,
  });
  expect(route.actionStatus).toBe("upcoming");
  expect(route.deadlineState).toBe("awaiting_notice");
  expect(route.deadlineLabel).toBe("Waiting for BOR written notice");
});

test("PTAB explanation identifies the later Cook County transmission rule", () => {
  const route = routeCase("Rogers Park", "2026-06-01", "ptab", null, {
    borNoticeReceived: true,
    borNoticeDate: "2026-05-21",
  });
  expect(route.reasoning.join(" ")).toContain("township's final-action transmission");
  expect(route.reasoning.join(" ")).toContain("conservative notice-based date");
});
