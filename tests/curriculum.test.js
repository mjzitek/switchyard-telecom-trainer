import test from "node:test";
import assert from "node:assert/strict";
import { LAYERS, ROUTES, SOURCES, STATIONS, TERMS } from "../src/curriculum.js";

test("curriculum has a unique, sequential 18-station route", () => {
  assert.equal(STATIONS.length, 18);
  assert.deepEqual(STATIONS.map((station) => station.number), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.equal(new Set(STATIONS.map((station) => station.id)).size, STATIONS.length);
});
test("every station is complete and uses registered layers and sources", () => {
  const sourceIds = new Set(SOURCES.map((source) => source.id));
  for (const station of STATIONS) {
    for (const field of ["name", "kicker", "summary", "lesson", "build", "signal", "media", "state", "metric", "failure"]) {
      assert.ok(station[field]?.trim(), `${station.id} is missing ${field}`);
    }
    assert.ok(LAYERS[station.layer], `${station.id} uses an unknown layer`);
    assert.ok(station.terms.length > 0, `${station.id} introduces no vocabulary`);
    station.terms.forEach((term) => assert.ok(TERMS[term], `${station.id} uses undefined term ${term}`));
    assert.ok(station.sources.length > 0, `${station.id} has no primary source`);
    station.sources.forEach((source) => assert.ok(sourceIds.has(source), `${station.id} uses unknown source ${source}`));
  }
});

test("every glossary entry gives an expansion and plain-language meaning", () => {
  assert.ok(Object.keys(TERMS).length >= 40);
  for (const [termId, term] of Object.entries(TERMS)) {
    assert.ok(term.expansion?.trim(), `${termId} has no expansion`);
    assert.ok(term.plain?.trim(), `${termId} has no plain-language definition`);
  }
});

test("every scenario references existing stations without duplicates", () => {
  const stationIds = new Set(STATIONS.map((station) => station.id));
  for (const route of Object.values(ROUTES)) {
    assert.ok(route.stations.length >= 2);
    assert.equal(new Set(route.stations).size, route.stations.length);
    route.stations.forEach((station) => assert.ok(stationIds.has(station), `${route.label} references unknown station ${station}`));
  }
});

test("sources are secure, unique, and official/primary-hosted", () => {
  const hosts = new Set();
  for (const source of SOURCES) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    const key = `${url.host}${url.pathname}`;
    assert.ok(!hosts.has(key), `duplicate source ${key}`);
    hosts.add(key);
  }
});
