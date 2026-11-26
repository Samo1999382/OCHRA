export const initialCases = [
  {
    id: "OC-0248",
    name: "Laparoscopic appendectomy",
    surgeon: "Dr. Maya Hassan",
    date: "2026-11-24",
    duration: "42:18",
    status: "Awaiting review",
    score: 82,
  },
  {
    id: "OC-0247",
    name: "Laparoscopic cholecystectomy",
    surgeon: "Dr. Omar Khalil",
    date: "2026-11-23",
    duration: "58:06",
    status: "Reviewed",
    score: 91,
  },
  {
    id: "OC-0246",
    name: "Laparoscopic appendectomy",
    surgeon: "Dr. Maya Hassan",
    date: "2026-11-22",
    duration: "38:52",
    status: "Awaiting review",
    score: 87,
  },
  {
    id: "OC-0245",
    name: "Laparoscopic appendectomy",
    surgeon: "Dr. Lina Adel",
    date: "2026-11-21",
    duration: "46:11",
    status: "Reviewed",
    score: 89,
  },
  {
    id: "OC-0244",
    name: "Laparoscopic cholecystectomy",
    surgeon: "Dr. Omar Khalil",
    date: "2026-11-20",
    duration: "51:34",
    status: "Reviewed",
    score: 94,
  },
];
export const steps = [
  {
    name: "Access & exposure",
    start: 0,
    time: "00:00",
    duration: "04:12",
    status: "On sequence",
    note: "Access and exposure precede identification in this illustrative sequence.",
  },
  {
    name: "Identify appendix",
    start: 252,
    time: "04:12",
    duration: "07:54",
    status: "On sequence",
    note: "The appendix is identified before dissection. Verify this boundary in the source recording.",
  },
  {
    name: "Mesoappendix dissection",
    start: 726,
    time: "12:06",
    duration: "13:11",
    status: "Timing variation",
    note: "The example segment exceeds its reference duration. Review case complexity and technique before interpreting the timing difference.",
  },
  {
    name: "Appendiceal base",
    start: 1517,
    time: "25:17",
    duration: "09:04",
    status: "Sequence check",
    note: "A possible order variation has been flagged in this example. Inspect neighboring segments before confirming the finding.",
  },
  {
    name: "Extraction & closure",
    start: 2061,
    time: "34:21",
    duration: "07:57",
    status: "On sequence",
    note: "Review the end of the procedure to confirm extraction and closure.",
  },
];
export function getProcedureSteps(item) {
  const names = item.name.includes("cholecystectomy")
    ? [
        "Access & exposure",
        "Identify anatomy",
        "Gallbladder dissection",
        "Duct & artery division",
        "Extraction & closure",
      ]
    : steps.map((step) => step.name);
  const parts = item.duration.split(":").map(Number);
  const duration = parts.length === 2 ? parts[0] * 60 + parts[1] : 2538;
  const format = (n) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  return steps.map((step, i) => {
    const start = Math.round((step.start / 2538) * duration);
    const end =
      i === steps.length - 1
        ? duration
        : Math.round((steps[i + 1].start / 2538) * duration);
    return {
      ...step,
      name: names[i],
      start,
      time: format(start),
      duration: format(end - start),
      note:
        i === 1 && item.name.includes("cholecystectomy")
          ? "Anatomy identification is shown before dissection. Verify the boundaries and clinical context in the recording."
          : step.note,
    };
  });
}
