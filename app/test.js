const { chunkUpload, greet } = require("./index.js");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let failures = 0;
function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`FAIL ${label}: expected ${expected}, got ${actual}`);
    failures++;
  } else {
    console.log(`PASS ${label}`);
  }
}

assertEqual(greet("Ada"), "Hello, Ada! Welcome to the gh-aw demo lab.", "greet");
assertEqual(chunkUpload("abcdef", 2), ["ab", "cd", "ef"], "chunkUpload");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "docs/index.html"), "utf8");
assertEqual(html === fs.readFileSync(path.join(root, "demo.html"), "utf8"), true, "site copies match");
const news = JSON.parse(html.match(/<script type="application\/json" id="whatsnew-data">([\s\S]*?)<\/script>/)[1]);
assertEqual(Array.isArray(news) && news.length > 0 && news.length <= 15, true, "bounded news array");
const releaseTags = news.filter(item => /^v\d/.test(item.tag)).map(item => item.tag);
assertEqual(new Set(releaseTags).size, releaseTags.length, "unique release tags");
for (const item of news) {
  assertEqual(["date", "tag", "title", "summary", "link"].every(key => typeof item[key] === "string" && item[key].length > 0), true, `news fields: ${item.tag}`);
  const date = new Date(item.date);
  assertEqual(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === item.date, true, `valid date: ${item.tag}`);
  assertEqual(date.getTime() <= Date.now(), true, `published date: ${item.tag}`);
  const url = new URL(item.link);
  assertEqual(url.protocol === "https:" && url.hostname === "github.com" && !url.username && !url.password && !url.port, true, `safe source: ${item.tag}`);
  if (/^v\d/.test(item.tag)) {
    assertEqual(url.pathname.endsWith(`/gh-aw/releases/tag/${item.tag}`), true, `release source: ${item.tag}`);
  }
}

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assertEqual(scripts.length > 0, true, "embedded scripts found");
scripts.forEach(script => new vm.Script(script));
const script = scripts.join("\n");
const helpers = script.slice(script.indexOf("function esc("), script.indexOf("renderSo(soData[0]);", script.indexOf("function esc(")));
const render = script.slice(script.indexOf("(function renderWhatsNew()"), script.indexOf("/* ---------- Pipeline detail", script.indexOf("(function renderWhatsNew()")));
function renderNews(data) {
  const nodes = {
    "whatsnew-data": { textContent: JSON.stringify(data) },
    "wn-list": { innerHTML: "", textContent: "" },
    "wn-status": { textContent: "" },
    "nav-whatsnew": { insertAdjacentHTML(position, value) { this.badge = value; } },
  };
  class FixedDate extends Date {
    static now() { return Date.parse("2026-09-09T12:00:00Z"); }
  }
  vm.runInNewContext(helpers + render, {
    document: { getElementById: id => nodes[id] },
    Date: FixedDate,
    URL,
  });
  return nodes;
}
const entry = { date: "2026-09-09", tag: "v1.0.0", title: '<img src=x onerror="alert(1)">', summary: "Test", link: "https://github.com/github/gh-aw/releases/tag/v1.0.0" };
let rendered = renderNews([entry]);
assertEqual(rendered["nav-whatsnew"].badge.includes("1 NEW"), true, "fresh badge");
assertEqual(rendered["wn-list"].innerHTML.includes("<img"), false, "news text is escaped");
assertEqual(rendered["wn-list"].innerHTML.includes("&quot;"), true, "attribute quotes are escaped");
assertEqual(rendered["wn-status"].textContent.includes("v1.0.0"), true, "snapshot status");
rendered = renderNews([{ ...entry, date: "2026-09-10" }]);
assertEqual(rendered["nav-whatsnew"].badge, undefined, "future release is not NEW");
rendered = renderNews([{ ...entry, date: "2026-08-01" }]);
assertEqual(rendered["wn-status"].textContent.includes("may be stale"), true, "stale snapshot warning");
for (const link of ["javascript:alert(1)", "https://evil.example/", "https://github.com.evil.example/", "https://user@github.com/"]) {
  rendered = renderNews([{ ...entry, link }]);
  assertEqual(rendered["wn-list"].innerHTML.includes("<a "), false, `unsafe link rejected: ${link}`);
}
rendered = renderNews({ invalid: true });
assertEqual(rendered["wn-list"].textContent.includes("Could not parse"), true, "invalid news handled");
rendered = renderNews([]);
assertEqual(rendered["wn-status"].textContent.includes("No published releases"), true, "empty news handled");

const builder = script.slice(script.indexOf("function buildWf()"), script.indexOf("bIds.forEach("));
const controls = {};
function control(id) { return controls[id] || (controls[id] = { value: "", checked: false }); }
control("b-name").value = 'demo"\\name';
control("b-trigger").value = "schedule";
control("b-engine").value = "copilot";
control("b-so-issue").checked = true;
control("b-g-network").checked = true;
vm.runInNewContext(builder + "\nbuildWf();", { document: { getElementById: control } });
const output = control("b-output").textContent;
assertEqual(output.includes("  model: claude-sonnet-5\n"), true, "builder uses available model");
assertEqual(JSON.parse(output.match(/title-prefix: (.+)/)[1]), '[demo"\\name] ', "builder quotes YAML title safely");

const simulator = script.slice(script.indexOf("const simStepsDef ="), script.indexOf("/* ---------- Examples gallery"));
for (const attack of [false, true]) {
  const nodes = {};
  const timers = new Map();
  let timerId = 0;
  function element() {
    return {
      children: [],
      classList: { add() {}, remove() {} },
      set innerHTML(value) { this.children = []; this.markup = value; },
      appendChild(child) { this.children.push(child); if (child.id) nodes[child.id] = child; },
      addEventListener(event, handler) { this[event] = handler; },
    };
  }
  function getNode(id) { return nodes[id] || (nodes[id] = element()); }
  getNode("sim-attack").checked = attack;
  vm.runInNewContext(simulator, {
    document: {
      getElementById: getNode,
      createElement: element,
      querySelectorAll: () => Object.values(nodes),
    },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id),
  });
  getNode("sim-play").click();
  for (const fn of timers.values()) fn();
  const log = getNode("sim-log").children.map(child => child.textContent).join("\n");
  assertEqual(log.includes("applied [bug, docs, question]"), !attack, `simulator writes: attack=${attack}`);
  assertEqual(log.includes("write jobs blocked"), attack, `simulator blocks attack=${attack}`);
  getNode("sim-reset").click();
  assertEqual(timers.size, 0, "simulator reset cancels timers");
  assertEqual(getNode("sim-log").markup.includes("idle"), true, "simulator reset clears log");
}

process.exit(failures ? 1 : 0);
