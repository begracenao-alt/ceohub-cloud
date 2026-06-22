/* ===== ④ Content｜発信管理 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var CATS = ["Instagramリール", "ストーリーズ", "スレッズ", "LINE", "YouTube", "ブログ", "メルマガ"];
  function uniq(a) { var o = {}, r = []; a.forEach(function (x) { if (x && !o[x]) { o[x] = 1; r.push(x); } }); return r; }
  function catList() { var s = S.list("contentCats"); return (s && s.length) ? s.slice() : CATS.slice(); }
  function mediaOf(r) { return (r.media && r.media.length) ? r.media : (r.category ? [r.category] : []); }
  function usedMedia() { var a = []; S.list("contents").forEach(function (c) { mediaOf(c).forEach(function (m) { a.push(m); }); }); return a; }
  function catOptions() { return uniq(catList().concat(usedMedia())); }
  function setMediaOptions(extra) { fields.filter(function (f) { return f.name === "media"; })[0].options = uniq(catList().concat(extra || [])); }
  function dayDiff(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 86400000); }
  function relLabel(d, today) {
    if (d < today) return '<span class="badge hot">' + dayDiff(d, today) + '日過ぎ</span>';
    if (d === today) return '<span class="badge hot">今日</span>';
    if (dayDiff(today, d) === 1) return '<span class="badge warn">明日</span>';
    return '<span class="badge gray">' + U.fmtDate(d) + '</span>';
  }
  var filter = "all";
  function chip(key, label) { return '<button class="btn btn-sm' + (filter === key ? ' btn-primary' : '') + '" data-filter="' + key + '">' + label + '</button>'; }

  function calc() {
    var cs = S.list("contents");
    var posted = 0, notPosted = 0, shotNotPosted = 0, inquiry = 0, consult = 0;
    cs.forEach(function (c) {
      if (c.posted) { if (U.inThisMonth(c.scheduledDate) || !c.scheduledDate) posted++; }
      else {
        notPosted++;
        if (c.shot) shotNotPosted++;
      }
      if (c.ledInquiry) inquiry++;
      if (c.ledConsult) consult++;
    });
    return { posted: posted, notPosted: notPosted, shotNotPosted: shotNotPosted, inquiry: inquiry, consult: consult };
  }

  var fields = [
    { name: "title", label: "タイトル", type: "text" },
    { name: "media", label: "媒体（複数えらべます）", type: "checks", options: CATS, full: true },
    { name: "mediaNew", label: "新しい媒体を追加（任意・ここに打つと媒体に増えます）", type: "text", placeholder: "例：TikTok・Podcast など", full: true },
    { name: "purpose", label: "投稿の目的", type: "select", options: ["価値を届ける", "認知を広げる", "信頼・人柄を伝える", "案内・オファー"] },
    { name: "shootDate", label: "撮影日", type: "date" },
    { name: "scheduledDate", label: "投稿予定日", type: "date" },
    { name: "idea", label: "アイデア／内容", type: "textarea", full: true },
    { name: "script", label: "台本（スクリプト）", type: "textarea", full: true, placeholder: "台本アプリで作った台本を、ここに貼り付けておけます" },
    { name: "shot", label: "撮影済", type: "checkbox" },
    { name: "edited", label: "編集済", type: "checkbox" },
    { name: "posted", label: "投稿済", type: "checkbox" },
    { name: "ledInquiry", label: "問い合わせにつながった", type: "checkbox" },
    { name: "ledConsult", label: "相談につながった", type: "checkbox" },
    { name: "views", label: "再生数・リーチ（任意）", type: "number" },
    { name: "saves", label: "保存数（任意・刺さった度の目安）", type: "number" },
    { name: "reactionMemo", label: "反応メモ", type: "textarea", full: true }
  ];

  function chk(b) { return b ? '✓' : '—'; }
  function normalize(v) {
    v.media = v.media || [];
    if (v.mediaNew && v.mediaNew.trim()) {
      var nm = v.mediaNew.trim();
      var list = catList();
      if (list.indexOf(nm) < 0) { list.push(nm); S.setContentCats(list); }
      if (v.media.indexOf(nm) < 0) v.media.push(nm);
    }
    delete v.mediaNew;
    v.category = v.media[0] || "";
    return v;
  }

  function render(view) {
    var c = calc();
    setMediaOptions();
    var html = '<p class="page-lead">投稿数だけでなく、問い合わせ・相談・契約につながる発信を見える化します。<br>' +
      '<span class="muted">目的タグで「価値を届ける」と「案内・オファー」のバランスを見ながら発信できます。</span></p>';
    html += '<div class="grid grid-4">' +
      U.stat("今月投稿数", c.posted + "件", null, "accent") +
      U.stat("未投稿", c.notPosted + "件", "うち撮影済 " + c.shotNotPosted + "件") +
      U.stat("問い合わせ", c.inquiry + "件", null, "rose") +
      U.stat("相談誘導", c.consult + "件") +
      '</div>';

    // 🎯 今月の発信バランス（目的別）＋プロのひとこと
    var PURPOSES = ["価値を届ける", "認知を広げる", "信頼・人柄を伝える", "案内・オファー"];
    var monthPosts = S.list("contents").filter(function (r) { return r.posted && (U.inThisMonth(r.scheduledDate) || !r.scheduledDate); });
    var pc = {}; PURPOSES.forEach(function (p) { pc[p] = 0; });
    monthPosts.forEach(function (r) { if (r.purpose && pc[r.purpose] !== undefined) pc[r.purpose]++; });
    var tip;
    if (!monthPosts.length) tip = "今月はまだ投稿がありません。まずは「価値を届ける」投稿から始めましょう 🤍";
    else if (pc["案内・オファー"] === 0) tip = "価値はしっかり届いています。今月まだ「案内・オファー」がありません。届けるだけでなく“そっと誘う”ことで相談につながります。入口の案内を1つ入れてみましょう 🤍";
    else if (pc["価値を届ける"] < pc["案内・オファー"]) tip = "案内が多めです。「価値を届ける」投稿を増やすと、信頼が育って案内も効きやすくなります ✨";
    else tip = "いいバランスです。価値を届けつつ、ちゃんと案内もできています ✨";
    html += '<div class="card mt"><div class="card-title">🎯 今月の発信バランス（投稿した分・目的別）</div>' +
      '<div class="grid grid-4">' + PURPOSES.map(function (p) { return U.stat(p, pc[p] + "件"); }).join("") + '</div>' +
      '<div style="margin-top:12px;background:#fbf6ea;border:1px solid #f0e3c4;border-radius:12px;padding:12px 14px;font-size:13px;color:#8a6f3f">' + tip + '</div></div>';

    // 📅 これからの発信（2週間）— ワンタップで投稿済に
    var today = U.todayStr();
    var hd = new Date(); hd.setDate(hd.getDate() + 14);
    var hStr = hd.getFullYear() + "-" + ("0" + (hd.getMonth() + 1)).slice(-2) + "-" + ("0" + hd.getDate()).slice(-2);
    var up = S.list("contents").filter(function (r) { return !r.posted && r.scheduledDate && r.scheduledDate <= hStr; })
      .sort(function (a, b) { return a.scheduledDate.localeCompare(b.scheduledDate); });
    html += '<div class="card mt" style="border-left:3px solid var(--gold)"><div class="card-title">📅 これからの発信（2週間）</div>';
    if (up.length) {
      html += up.map(function (r) {
        var media = mediaOf(r).map(function (m) { return '<span class="badge gray">' + U.esc(m) + '</span>'; }).join(" ");
        return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line-2);flex-wrap:wrap">' +
          relLabel(r.scheduledDate, today) +
          '<span style="flex:1;min-width:140px">' + U.esc(r.title || "(無題)") + ' ' + media + '</span>' +
          '<button class="btn btn-sm btn-primary" data-post="' + r.id + '">投稿済にする</button></div>';
      }).join("");
    } else {
      html += '<div class="hint">2週間以内の発信予定はありません。「発信を追加」で投稿予定日を入れると、ここに並びます。</div>';
    }
    html += '</div>';

    html += '<div style="text-align:right;margin:6px 0 10px"><button class="btn btn-sm" id="mgCat">⚙️ 媒体を編集（追加・削除）</button></div>';

    html += '<div class="card mt">' + U.sectionHead("発信リスト", "発信を追加", "addCo");
    html += '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">' + chip("all", "すべて") + chip("idea", "💡 アイデア") + chip("plan", "📅 予定あり") + chip("done", "✅ 投稿済") + '</div>';
    var rows = S.list("contents").filter(function (r) {
      if (filter === "idea") return !r.posted && !r.scheduledDate;
      if (filter === "plan") return !r.posted && r.scheduledDate;
      if (filter === "done") return r.posted;
      return true;
    });
    var body = rows.length ? rows.map(function (r) {
      var media = mediaOf(r);
      var mediaCell = media.length ? media.map(function (m) { return '<span class="badge gray">' + U.esc(m) + '</span>'; }).join(" ") : '<span class="muted">—</span>';
      return '<tr>' +
        '<td>' + U.esc(r.title) + (r.script ? ' 📝' : '') + (r.purpose ? ' <span class="badge gray" style="font-weight:600">' + U.esc(r.purpose) + '</span>' : '') + '</td>' +
        '<td>' + mediaCell + '</td>' +
        '<td>' + U.fmtDate(r.shootDate) + '</td>' +
        '<td>' + U.fmtDate(r.scheduledDate) + '</td>' +
        '<td style="text-align:center">' + chk(r.shot) + '</td>' +
        '<td style="text-align:center">' + chk(r.edited) + '</td>' +
        '<td style="text-align:center">' + (r.posted ? '<span class="badge ok">済</span>' : '<span class="badge gray">未</span>') + '</td>' +
        '<td style="text-align:center;white-space:nowrap">' + (r.ledInquiry ? '<span class="badge ok">問</span> ' : '') + (r.ledConsult ? '<span class="badge hot">商</span> ' : '') + ((r.views || r.saves) ? '<span style="font-size:11px;color:var(--muted)">' + (r.views ? '▶' + U.num(r.views).toLocaleString() + ' ' : '') + (r.saves ? '💾' + U.num(r.saves).toLocaleString() : '') + '</span>' : (!r.ledInquiry && !r.ledConsult ? '<span class="muted">—</span>' : '')) + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(9, "発信アイデアを追加してみましょう");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>タイトル</th><th>媒体</th><th>撮影日</th><th>予定日</th><th>撮影</th><th>編集</th><th>投稿</th><th>反応</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';

    view.innerHTML = html;

    document.getElementById("mgCat").onclick = function () { manageCats(view); };
    document.getElementById("addCo").onclick = function () {
      setMediaOptions();
      U.recordModal({ title: "発信を追加", fields: fields, values: { purpose: "価値を届ける" },
        onSave: function (v) { S.add("contents", normalize(v)); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        var rec = Object.assign({}, S.find("contents", id));
        if (!rec.media) rec.media = rec.category ? [rec.category] : [];
        setMediaOptions(rec.media);
        U.recordModal({ title: "発信を編集", fields: fields, values: rec,
          onSave: function (v) { S.update("contents", id, normalize(v)); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この発信を削除しますか？", function () { S.remove("contents", id); U.toast("削除しました"); render(view); });
      };
    });
    view.querySelectorAll("[data-filter]").forEach(function (b) {
      b.onclick = function () { filter = b.getAttribute("data-filter"); render(view); };
    });
    view.querySelectorAll("[data-post]").forEach(function (b) {
      b.onclick = function () { S.update("contents", b.getAttribute("data-post"), { posted: true }); U.toast("投稿済にしました 🎉"); render(view); };
    });
  }

  // 媒体（カテゴリー）の追加・削除
  function manageCats(view) {
    function open() {
      var cats = catList();
      var body = '<p class="hint">▲▼で並び替え、削除もできます。削除しても、過去の発信のラベルは残ります。</p>' +
        '<div>' + (cats.length ? cats.map(function (c, i) {
          return '<div class="check-row" style="justify-content:space-between;border-bottom:1px solid var(--line-2);padding:9px 2px">' +
            '<span>' + U.esc(c) + '</span><span style="display:flex;gap:6px">' +
            '<button class="btn btn-sm" data-up="' + i + '"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
            '<button class="btn btn-sm" data-down="' + i + '"' + (i === cats.length - 1 ? ' disabled' : '') + '>▼</button>' +
            '<button class="btn btn-sm btn-danger" data-rmcat="' + U.esc(c) + '">削除</button></span></div>';
        }).join("") : '<p class="hint">媒体がありません。下から追加してください。</p>') + '</div>' +
        '<div class="field" style="margin-top:14px"><label for="newCat">新しい媒体を追加</label>' +
        '<input type="text" id="newCat" placeholder="例：TikTok・Podcast など"></div>' +
        '<div class="modal-foot"><button class="btn" data-close2>閉じる</button>' +
        '<button class="btn btn-primary" id="addCat">追加</button></div>';
      U.openModal("媒体の管理", body, function (m) {
        m.querySelector("[data-close2]").onclick = function () { U.closeModal(); render(view); };
        m.querySelector("#addCat").onclick = function () {
          var val = m.querySelector("#newCat").value.trim();
          if (!val) return;
          var arr = catList();
          if (arr.indexOf(val) < 0) arr.push(val);
          S.setContentCats(arr); U.toast("追加しました"); open();
        };
        m.querySelectorAll("[data-rmcat]").forEach(function (b) {
          b.onclick = function () {
            var c = b.getAttribute("data-rmcat");
            S.setContentCats(catList().filter(function (x) { return x !== c; }));
            U.toast("削除しました"); open();
          };
        });
        m.querySelectorAll("[data-up]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-up"); var arr = catList(); var t = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = t; S.setContentCats(arr); open(); };
        });
        m.querySelectorAll("[data-down]").forEach(function (b) {
          b.onclick = function () { var i = +b.getAttribute("data-down"); var arr = catList(); var t = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = t; S.setContentCats(arr); open(); };
        });
      });
    }
    open();
  }

  BG.modules = BG.modules || {};
  BG.modules.content = { title: "CONTENT｜発信管理", render: render };
  BG.calc = BG.calc || {};
  BG.calc.content = calc;
})();
