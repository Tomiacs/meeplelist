export function topRankedIds(csv, limit = 1000) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("Érvénytelen rangsorhatár.");

  let columns;
  const ranked = [];
  forEachCsvRecord(csv.replace(/^\uFEFF/, ""), (record) => {
    if (!columns) {
      columns = Object.fromEntries(record.map((name, index) => [name, index]));
      if (columns.id === undefined || columns.rank === undefined) {
        throw new Error("A BGG ranglista-CSV-ből hiányzik az id vagy rank oszlop.");
      }
      return;
    }

    const id = Number(record[columns.id]);
    const rank = Number(record[columns.rank]);
    if (!Number.isInteger(rank) || rank < 1 || rank > limit) return;
    if (!Number.isInteger(id) || id < 1) throw new Error(`Érvénytelen játékazonosító a(z) ${rank}. helyen.`);
    if (columns.is_expansion !== undefined && record[columns.is_expansion] === "1") {
      throw new Error(`Kiegészítő szerepel a(z) ${rank}. helyen.`);
    }
    ranked.push({ id, rank });
  });

  ranked.sort((a, b) => a.rank - b.rank);
  if (ranked.length !== limit || new Set(ranked.map(({ id }) => id)).size !== limit ||
      ranked.some(({ rank }, index) => rank !== index + 1)) {
    throw new Error(`A BGG ranglista-CSV nem tartalmaz teljes, egyedi Top ${limit} listát.`);
  }
  return ranked.map(({ id }) => id);
}

function forEachCsvRecord(csv, visit) {
  let record = [];
  let field = "";
  let quoted = false;

  const finishField = () => {
    record.push(field);
    field = "";
  };
  const finishRecord = () => {
    finishField();
    if (record.some((value) => value !== "")) visit(record);
    record = [];
  };

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === ",") {
      finishField();
    } else if (char === "\n" || char === "\r") {
      finishRecord();
      if (char === "\r" && csv[index + 1] === "\n") index += 1;
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error("Lezáratlan idézőjel a BGG ranglista-CSV-ben.");
  if (field !== "" || record.length) finishRecord();
}
