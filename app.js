(() => {
"use strict";
const D = window.CODEX, $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ── copy ───────────────────────────────────────────────────────────── */
const T = {
  zh:{ title:"蝶谱", titleSub:"The Butterfly Codex", skip:"跳到图鉴", aboutBtn:"关于",
       eyebrow:"鳞翅目 · 标本图鉴", heroH:"蝶谱",
       heroP:"一百一十二个分类单元，二百二十件标本。逐条记录分类地位、模式产地、分布、生境与生活史，并附图版原注转录。",
       sSpecies:"分类单元", sShots:"标本", sGroups:"科级类群", cta:"开始浏览",
       ph:"搜索名称、学名、属名或产地…", all:"全部科", allRealms:"全部地理区",
       count:(n,t)=>`显示 ${n} / ${t} 个分类单元`, empty:"没有找到匹配的蝴蝶。", resetBtn:"清除筛选",
       footNote:"标本图像由原始图版分离生成并去除背景；『图版原注』为图版文字的忠实转录，其余各栏为编者依一般参考资料整理。",
       footAbout:"资料来源与说明",
       // detail
       taxonomy:"分类", family:"科", tribe:"族", genus:"属", auth:"命名人",
       typeLoc:"模式产地", span:"翅展", realm:"地理区", region:"分布",
       secDiag:"形态", secHab:"生境与习性", secHost:"幼期与寄主",
       secStatus:"保护现状", secRem:"附注", secPlate:"图版原注",
       plateNote:"以下为原始图版文字的转录，是本收藏的第一手材料。",
       origZh:"图版原文（中文）",
       shots:n=>`${n} 件标本`, plate:n=>n.startsWith("IMG_") ? `补充图 ${n.slice(4)}` : `图版 ${n}`,
       unlisted:"图版未标注学名", noAuth:"命名人未记录",
       showAlt:"显示英文条目", hideAlt:"隐藏英文条目", altHead:"English account" },
  en:{ title:"蝶谱", titleSub:"The Butterfly Codex", skip:"Skip to the plates", aboutBtn:"About",
       eyebrow:"Lepidoptera · An illustrated codex", heroH:"The Butterfly Codex",
       heroP:"A hundred and twelve taxa and 220 specimens, each with its classification, type locality, range, habitat and life history — and a transcription of the caption on the original plate.",
       sSpecies:"taxa", sShots:"specimens", sGroups:"family groups", cta:"Start browsing",
       ph:"Search a name, a genus, a country…", all:"All families", allRealms:"All realms",
       count:(n,t)=>`Showing ${n} of ${t} taxa`, empty:"No butterfly matches those filters.",
       resetBtn:"Clear filters",
       footNote:"Specimens were separated from the original plates and their backgrounds removed. 'As captioned on the plate' is a faithful transcription; every other field is editorial apparatus compiled from general reference.",
       footAbout:"Sources and caveats",
       taxonomy:"Classification", family:"Family", tribe:"Tribe", genus:"Genus", auth:"Authority",
       typeLoc:"Type locality", span:"Wingspan", realm:"Realm", region:"Range",
       secDiag:"Diagnosis", secHab:"Habitat & ecology", secHost:"Larval hostplants",
       secStatus:"Conservation", secRem:"Remarks", secPlate:"As captioned on the plate",
       plateNote:"A transcription of the original plate text — the primary source for this collection.",
       origZh:"Original Chinese",
       shots:n=>`${n} specimen${n>1?"s":""}`, plate:n=>n.startsWith("IMG_") ? `Supplement ${n.slice(4)}` : `Plate ${n}`,
       unlisted:"No scientific name given on the plate", noAuth:"Authority not recorded",
       showAlt:"显示中文条目", hideAlt:"隐藏中文条目", altHead:"中文条目" }
};

/* ── state ──────────────────────────────────────────────────────────── */
const store = {
  get(k, d){ try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch {} }
};
/* Resolve the theme: the viewer's stored choice, else a theme stamped on the root by the
   host, else the OS preference. */
const hostTheme = document.documentElement.getAttribute("data-theme");
const prefersLight = matchMedia("(prefers-color-scheme: light)").matches;
const S = {
  lang: store.get("codex.lang", (navigator.language || "").startsWith("zh") ? "zh" : "en"),
  theme: store.get("codex.theme", null) || hostTheme || (prefersLight ? "light" : "dark"),
  q: "", group: "", realm: "", open: null, shot: 0, alt: false
};
const t = () => T[S.lang];
const other = () => S.lang === "zh" ? "en" : "zh";

/* ── helpers ────────────────────────────────────────────────────────── */
const norm = s => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
const groupOf = id => D.groups.find(g => g.id === id);
const realmOf = id => D.realms.find(r => r.id === id);
const label = (o, l = S.lang) => l === "zh" ? o.zh : o.en;
const nameOf = (s, l = S.lang) => l === "zh" ? (s.zh !== "—" ? s.zh : s.en) : s.en;
const subOf = (s, l = S.lang) => l === "zh" ? s.en : (s.zh !== "—" ? s.zh : "");
const fld = (s, k, l = S.lang) => s[k] ? s[k][l] : null;

/** Full scientific name: genus + epithet + subspecies + authority. */
function sciLine(s){
  if (!s.sci) return null;
  let n = s.sci;
  if (s.ssp && !s.ssp.startsWith("ab.")) n += " " + s.ssp;
  else if (s.ssp) n += " " + s.ssp;
  return n;
}

function matches(s){
  if (S.group && s.g !== S.group) return false;
  if (S.realm && !(s.realm || []).includes(S.realm)) return false;
  if (!S.q) return true;
  const g = groupOf(s.g);
  const hay = norm([s.zh, s.en, s.sci, s.ssp, s.genus, s.tribe, s.auth, s.type_loc,
                    fld(s, "regions", "zh"), fld(s, "regions", "en"),
                    g.zh, g.en, g.taxon_en,
                    ...(s.realm || []).flatMap(r => [realmOf(r).zh, realmOf(r).en])].join(" "));
  return S.q.split(" ").every(w => hay.includes(w));
}
const visible = () => D.species.filter(matches);

/* ── chrome ─────────────────────────────────────────────────────────── */
function paintStatic(){
  const c = t();
  document.documentElement.lang = S.lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i]").forEach(el => {
    const v = c[el.dataset.i]; if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll("[data-i-ph]").forEach(el => el.placeholder = c[el.dataset.iPh]);
  document.querySelectorAll("[data-lang]").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.lang === S.lang)));
  $("#nSpecies").textContent = D.species.length;
  $("#nShots").textContent = D.species.reduce((n, s) => n + s.shots.length, 0);
  $("#nGroups").textContent = D.groups.length;
}

function buildChips(){
  const c = t();
  const row = (host, items, key, allLabel) => {
    host.innerHTML = "";
    const mk = (id, text) => {
      const b = document.createElement("button");
      b.className = "chip"; b.type = "button";
      b.setAttribute("aria-pressed", String(S[key] === id));
      b.textContent = text;
      b.onclick = () => { S[key] = S[key] === id ? "" : id; render(); };
      host.appendChild(b);
    };
    mk("", allLabel);
    items.forEach(o => mk(o.id, label(o)));
  };
  row($("#groupChips"), D.groups, "group", c.all);
  row($("#realmChips"), D.realms, "realm", c.allRealms);
}

/* ── grid ───────────────────────────────────────────────────────────── */
function card(s){
  const el = document.createElement("button");
  el.className = "card"; el.type = "button";
  el.style.setProperty("--acc", s.accent);
  el.onclick = () => open(s.id);
  const sub = subOf(s), sci = sciLine(s);
  const n = s.shots.length > 1 ? `<span class="card-n">${s.shots.length}</span>` : "";
  el.innerHTML = `${n}
    <div class="card-fig"><img loading="lazy" decoding="async" src="img/${s.shots[0].thumb}" alt=""></div>
    <p class="card-zh">${esc(nameOf(s))}</p>
    ${sub ? `<p class="card-en">${esc(sub)}</p>` : ""}
    <p class="card-sci">${sci ? esc(sci) : "—"}</p>`;
  return el;
}

function render(){
  const c = t(), list = visible(), grid = $("#grid");
  grid.innerHTML = "";
  D.groups.forEach(g => {
    const items = list.filter(s => s.g === g.id);
    if (!items.length) return;
    const h = document.createElement("div");
    h.className = "ghead";
    h.innerHTML =
      `<div class="ghead-top"><h2>${esc(label(g))}</h2>
        <span>${esc(S.lang === "zh" ? g.taxon_zh : g.taxon_en)}</span><b>${items.length}</b></div>
       <p class="ghead-essay">${esc(S.lang === "zh" ? g.essay_zh : g.essay_en)}</p>`;
    grid.appendChild(h);
    items.forEach(s => grid.appendChild(card(s)));
  });
  $("#count").textContent = c.count(list.length, D.species.length);
  $("#empty").hidden = list.length > 0;
  $("#qClear").hidden = !S.q;
  document.querySelectorAll("#groupChips .chip").forEach((b, i) =>
    b.setAttribute("aria-pressed", String((i === 0 ? "" : D.groups[i - 1].id) === S.group)));
  document.querySelectorAll("#realmChips .chip").forEach((b, i) =>
    b.setAttribute("aria-pressed", String((i === 0 ? "" : D.realms[i - 1].id) === S.realm)));
  if (S.open) paintDetail();
}

/* ── species account ────────────────────────────────────────────────── */
function facts(s, l){
  const c = T[l], g = groupOf(s.g), rows = [];
  rows.push([c.family, l === "zh" ? g.taxon_zh : g.taxon_en]);
  if (s.tribe) rows.push([c.tribe, s.tribe]);
  if (s.genus) rows.push([c.genus, `<i>${esc(s.genus)}</i>`]);
  rows.push([c.auth, s.auth ? esc(s.auth) : `<span class="dim">${c.noAuth}</span>`]);
  if (s.type_loc) rows.push([c.typeLoc, esc(s.type_loc)]);
  if (s.wingspan) rows.push([c.span, esc(s.wingspan)]);
  if ((s.realm || []).length)
    rows.push([c.realm, s.realm.map(r => esc(label(realmOf(r), l))).join(" · ")]);
  const reg = fld(s, "regions", l);
  if (reg) rows.push([c.region, esc(reg)]);
  return `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}

function sections(s, l){
  const c = T[l];
  const out = [["secDiag","diag"],["secHab","hab"],["secHost","host"],
               ["secStatus","status"],["secRem","rem"]]
    .filter(([, k]) => fld(s, k, l))
    .map(([lab, k]) => `<section class="sec"><h3>${c[lab]}</h3><p>${esc(fld(s, k, l))}</p></section>`);
  return out.join("");
}

function plateBlock(s, l){
  const c = T[l], zh = fld(s, "plate", "zh"), en = fld(s, "plate", "en");
  if (!zh && !en) return "";
  const body = l === "zh"
    ? `<p>${esc(zh || en)}</p>`
    : `<p>${esc(en || zh)}</p>${zh ? `<p class="plate-orig"><em>${c.origZh}:</em> ${esc(zh)}</p>` : ""}`;
  return `<section class="sec plate-sec"><h3>${c.secPlate}</h3>
            <p class="plate-note">${c.plateNote}</p>
            <blockquote>${body}</blockquote></section>`;
}

function account(s, l){
  return facts(s, l) + sections(s, l) + plateBlock(s, l);
}

function open(id){
  S.open = id; S.shot = 0; S.alt = false;
  if (location.hash !== "#/" + id) history.pushState(null, "", "#/" + id);
  document.body.classList.add("locked");
  $("#detail").hidden = false;
  paintDetail();
  $("#detail .close").focus();
}
function close(){
  if (!S.open) return;
  S.open = null;
  $("#detail").hidden = true;
  document.body.classList.remove("locked");
  if (location.hash.startsWith("#/") && location.hash !== "#/") history.pushState(null, "", "#/");
}
function step(d){
  const list = visible(), i = list.findIndex(s => s.id === S.open);
  if (i < 0) return;
  open(list[(i + d + list.length) % list.length].id);
}

function paintDetail(){
  const c = t(), s = D.species.find(x => x.id === S.open);
  if (!s) return close();
  const g = groupOf(s.g), shot = s.shots[Math.min(S.shot, s.shots.length - 1)];
  $(".panel").style.setProperty("--acc", s.accent);

  const img = $("#dImg");
  if (img.getAttribute("src") !== "img/" + shot.full){
    img.src = "img/" + shot.full;
    img.alt = nameOf(s);
  }
  const strip = $("#dStrip");
  strip.hidden = s.shots.length < 2;
  strip.innerHTML = "";
  s.shots.forEach((sh, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", String(i === S.shot));
    b.title = c.plate(sh.plate);
    b.innerHTML = `<img src="img/${sh.thumb}" alt="" loading="lazy">`;
    b.onclick = () => { S.shot = i; paintDetail(); };
    strip.appendChild(b);
  });

  const sci = sciLine(s), sub = subOf(s);
  $("#dInfo").innerHTML = `
    <p class="d-group" style="--acc:${s.accent}">${esc(label(g))}</p>
    <h2 id="dTitle">${esc(nameOf(s))}</h2>
    ${sub ? `<p class="d-sub">${esc(sub)}</p>` : ""}
    <p class="d-sci">${sci ? `<i>${esc(sci)}</i>${s.auth ? " " + esc(s.auth) : ""}`
                          : `<span class="dim">${c.unlisted}</span>`}</p>
    ${account(s, S.lang)}
    <button class="alt-b" id="dAlt">${S.alt ? c.hideAlt : c.showAlt}</button>
    <div class="d-alt" id="dAltBox" ${S.alt ? "" : "hidden"}>
      <h3 class="alt-head">${c.altHead}</h3>${S.alt ? account(s, other()) : ""}
    </div>
    <p class="d-src">${c.shots(s.shots.length)} · ${c.plate(shot.plate)}</p>`;
  $("#dAlt").onclick = () => { S.alt = !S.alt; paintDetail(); };
}

/* ── about ──────────────────────────────────────────────────────────── */
function openAbout(){
  $("#aboutBody").innerHTML = D.about[S.lang]
    .map(([h, p]) => `<section class="sec"><h3>${esc(h)}</h3><p>${esc(p)}</p></section>`).join("");
  document.body.classList.add("locked");
  $("#about").hidden = false;
  $("#about .close").focus();
}
function closeAbout(){
  $("#about").hidden = true;
  if (!S.open) document.body.classList.remove("locked");
}

/* ── hero ───────────────────────────────────────────────────────────── */
function hero(){
  // Specimens that hold up on both a dark and a light ground; the first frame is also
  // what a shared link's thumbnail shows, so the rotation starts on a high-contrast one.
  const picks = ["cypris","cacica","anaxibia","achilles","augustinae-talboti","arcas-imperialis"]
    .map(id => D.species.find(s => s.id === id)).filter(Boolean);
  const stage = $("#heroStage");
  let i = 0, img = null;
  const show = () => {
    const s = picks[i % picks.length];
    const next = document.createElement("img");
    next.src = "img/" + s.shots[0].full;
    next.alt = ""; next.decoding = "async";
    next.onload = () => {
      next.classList.add("in");
      if (img){ const old = img; old.classList.remove("in"); setTimeout(() => old.remove(), 900); }
      img = next;
    };
    stage.appendChild(next);
    document.documentElement.style.setProperty("--accent", s.accent);
    i++;
  };
  show();
  setInterval(show, 7000);
}

/* ── wiring ─────────────────────────────────────────────────────────── */
function setTheme(v){ S.theme = v; store.set("codex.theme", v); document.documentElement.dataset.theme = v; }
function setLang(v){
  S.lang = v; store.set("codex.lang", v);
  paintStatic(); buildChips(); render();
  if (!$("#about").hidden) openAbout();
}

document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => setLang(b.dataset.lang));
$("#themeBtn").onclick = () => setTheme(S.theme === "dark" ? "light" : "dark");
$("#aboutBtn").onclick = openAbout;
$("#aboutBtn2").onclick = openAbout;
$("#q").oninput = e => { S.q = norm(e.target.value); render(); };
$("#qClear").onclick = () => { S.q = ""; $("#q").value = ""; render(); $("#q").focus(); };
$("#reset").onclick = () => { S.q = ""; S.group = ""; S.realm = ""; $("#q").value = ""; render(); };
$("#prev").onclick = () => step(-1);
$("#next").onclick = () => step(1);
document.querySelectorAll("[data-close]").forEach(el => el.onclick = close);
document.querySelectorAll("[data-close-about]").forEach(el => el.onclick = closeAbout);

addEventListener("keydown", e => {
  if (!$("#about").hidden){ if (e.key === "Escape") closeAbout(); return; }
  if (S.open){
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    return;
  }
  if (e.key === "/" && document.activeElement !== $("#q")){ e.preventDefault(); $("#q").focus(); }
});
addEventListener("popstate", route);

function route(){
  const id = location.hash.startsWith("#/") ? location.hash.slice(2) : "";
  const s = id && D.species.find(x => x.id === id);
  if (s){ S.open = s.id; S.shot = 0; S.alt = false;
          document.body.classList.add("locked"); $("#detail").hidden = false; paintDetail(); }
  else if (S.open){ S.open = null; $("#detail").hidden = true; document.body.classList.remove("locked"); }
}

setTheme(S.theme);
paintStatic(); buildChips(); render(); hero(); route();
})();
