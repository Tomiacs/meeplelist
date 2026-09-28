import test from "node:test";
import assert from "node:assert/strict";
import { topRankedIds } from "../scripts/rank-csv.mjs";

test("a BGG ranglista-CSV-ből rang szerint válogat, idézett játéknevekkel is", () => {
  const csv = 'id,name,rank,is_expansion\r\n' +
    '3,"Három, és ""idézet""",3,0\r\n' +
    '1,"Első\nfolytatás",1,0\r\n' +
    '2,Második,2,0\r\n';
  assert.deepEqual(topRankedIds(csv, 3), [1, 2, 3]);
});

test("hiányos vagy ismétlődő rangsort nem fogad el", () => {
  assert.throws(() => topRankedIds('id,rank\n1,1\n2,3\n', 3), /nem tartalmaz teljes/);
  assert.throws(() => topRankedIds('id,rank\n1,1\n2,1\n', 2), /nem tartalmaz teljes/);
});
