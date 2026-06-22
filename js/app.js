/* ============================================================
   Be Grace CEO Hub — アプリ本体 (app.js)
   ナビゲーション・ルーティング
   ============================================================ */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var NAV = [
    { sep: "Daily" },
    { key: "dashboard", label: "Dashboard", ico: "🏠" },
    { key: "stage", label: "Stage", ico: "🪜" },
    { key: "diagnosis", label: "Strategy", ico: "🩺" },
    { sep: "Business" },
    { key: "money", label: "Money", ico: "💰" },
    { key: "customer", label: "Customer", ico: "👥" },
    { key: "project", label: "Project", ico: "📋" },
    { key: "sns", label: "SNS", ico: "📱" },
    { key: "links", label: "Links", ico: "🔗" },
    { sep: "Self & Team" },
    { key: "body", label: "Body", ico: "🌿" },
    { key: "team", label: "Team", ico: "🤝" },
    { key: "manual", label: "Manual", ico: "📖" },
    { sep: "Future" },
    { key: "future", label: "Future", ico: "🔮" },
    { key: "wheel", label: "Life Balance", ico: "🎯" },
    { key: "weekly", label: "Weekly", ico: "📅" },
    { sep: "Settings" },
    { key: "settings", label: "Settings", ico: "⚙️" }
  ];

  var current = "dashboard";

  function buildNav() {
    var nav = document.getElementById("nav");
    nav.innerHTML = NAV.map(function (item) {
      if (item.sep) return '<div class="nav-sep">' + item.sep + '</div>';
      return '<div class="nav-item" data-key="' + item.key + '">' +
        '<span class="ico">' + item.ico + '</span><span>' + U.esc(item.label) + '</span></div>';
    }).join("");
    nav.querySelectorAll(".nav-item").forEach(function (el) {
      el.onclick = function () { go(el.getAttribute("data-key")); closeSidebar(); };
    });
  }

  function go(key) {
    current = key;
    var mod = BG.modules[key];
    if (!mod) { key = "dashboard"; mod = BG.modules.dashboard; }
    document.getElementById("topbarTitle").textContent = mod.title;
    document.querySelectorAll(".nav-item").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-key") === key);
    });
    var view = document.getElementById("view");
    view.innerHTML = "";
    try {
      mod.render(view);
    } catch (e) {
      console.error(e);
      view.innerHTML = '<div class="card"><p class="empty">画面の表示でエラーが発生しました。<br>設定画面からバックアップの復元をお試しください。</p></div>';
    }
    window.scrollTo(0, 0);
  }

  function refreshHeader() {
    var sync = S.sync();
    document.getElementById("syncState").textContent =
      sync.enabled ? "保存先：ブラウザ＋スプレッドシート" : "保存先：このブラウザ内";
  }
  BG.refreshHeader = refreshHeader;
  BG.go = go;

  function setDate() {
    var d = new Date();
    var days = ["日", "月", "火", "水", "木", "金", "土"];
    document.getElementById("topbarDate").textContent =
      (d.getMonth() + 1) + "月" + d.getDate() + "日（" + days[d.getDay()] + "）";
  }

  function closeSidebar() { document.getElementById("sidebar").classList.remove("open"); }

  function init() {
    buildNav();
    setDate();
    refreshHeader();
    document.getElementById("hamburger").onclick = function () {
      document.getElementById("sidebar").classList.toggle("open");
    };

    // 初回起動なら設定画面へ案内
    var s = S.settings();
    if (!s.repName && !s.bizName) {
      go("settings");
      U.toast("はじめに「基本情報」を入力しましょう");
    } else {
      go("dashboard");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
