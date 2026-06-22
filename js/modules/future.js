/* ===== ⑧ Future｜未来設定 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  function render(view) {
    var f = S.future();

    // 月が変わったら、先月の「今月の設定」を自動で記録に保存し、今月分を新しく始める
    var ym = U.curYM();
    f.monthly = f.monthly || {};
    f.months = f.months || {};
    if (!f.monthMark) f.monthMark = ym;
    if (f.monthMark !== ym) {
      var prev = f.monthly;
      if (prev && (prev.theme || prev.salesGoal || prev.idealState || prev.todo || prev.stop)) {
        f.months[f.monthMark] = prev;
      }
      f.monthly = {};
      f.monthMark = ym;
      S.saveFuture(f);
    }
    var m = BG.calc.money ? BG.calc.money() : { mSales: 0, ySales: 0 };
    var cust = BG.calc.customer ? BG.calc.customer() : { contract: 0 };
    var price = U.num(S.settings().price);

    var monthGoal = U.num(f.monthly.salesGoal) || U.num(S.settings().monthlyGoal);
    var yearGoal = U.num(f.yearly.salesGoal) || U.num(S.settings().yearlyGoal);
    var monthLeft = Math.max(0, monthGoal - m.mSales);
    var yearLeft = Math.max(0, yearGoal - m.ySales);
    var peopleLeft = price > 0 ? Math.ceil(monthLeft / price) : 0;
    var mRate = monthGoal ? Math.min(100, Math.round(m.mSales / monthGoal * 100)) : 0;
    var yRate = yearGoal ? Math.min(100, Math.round(m.ySales / yearGoal * 100)) : 0;

    var html = '<p class="page-lead">今の売上だけでなく、会社・雇用・社会への循環まで見据えて、未来から逆算します。</p>';

    html += '<div class="grid grid-3">' +
      U.stat("今月目標まで", U.yen(monthLeft), mRate + "% 達成", "accent") +
      U.stat("年間目標まで", U.yen(yearLeft), yRate + "% 達成") +
      U.stat("あと何人で達成", (price > 0 ? peopleLeft + "人" : "—"), price > 0 ? "商品単価から計算" : "初期設定で単価を入力", "rose") +
      '</div>';

    html += '<div class="card mt"><div class="card-title">今月の進捗</div>' +
      '<div class="progress"><span style="width:' + mRate + '%"></span></div>' +
      '<div class="hint">' + U.yen(m.mSales) + ' / ' + U.yen(monthGoal) + '</div>' +
      '<div class="card-title" style="margin-top:18px">年間の進捗</div>' +
      '<div class="progress"><span style="width:' + yRate + '%"></span></div>' +
      '<div class="hint">' + U.yen(m.ySales) + ' / ' + U.yen(yearGoal) + '</div></div>';

    // 今月の設定
    html += '<div class="card"><div class="section-head"><h2>今月の設定</h2>' +
      '<button class="btn" id="editMonth">編集</button></div>' +
      kv("売上目標", f.monthly.salesGoal && U.yen(f.monthly.salesGoal)) +
      kv("利益目標", f.monthly.profitGoal && U.yen(f.monthly.profitGoal)) +
      kv("今月のテーマ", f.monthly.theme) +
      kv("理想の状態", f.monthly.idealState) +
      kv("やりたいこと", f.monthly.todo) +
      kv("やめること", f.monthly.stop) +
      '</div>';

    // 年間の設定
    html += '<div class="card"><div class="section-head"><h2>年間・未来の設定</h2>' +
      '<button class="btn" id="editYear">編集</button></div>' +
      kv("年商目標", f.yearly.salesGoal && U.yen(f.yearly.salesGoal)) +
      kv("利益目標", f.yearly.profitGoal && U.yen(f.yearly.profitGoal)) +
      kv("人数目標", f.yearly.peopleGoal) +
      kv("叶えたい未来", f.yearly.dream) +
      kv("育てたい事業", f.yearly.growBiz) +
      kv("理想のライフスタイル", f.yearly.lifestyle) +
      kv("理想のチーム", f.yearly.idealTeam) +
      kv("雇用したい人数", f.yearly.hireCount) +
      kv("社会に広げたい価値", f.yearly.socialValue) +
      '</div>';

    // これまでの月（ふりかえり）— 月ごとに積み上がる記録
    var pastKeys = Object.keys(f.months).filter(function (k) {
      var p = f.months[k];
      return p && (p.theme || p.salesGoal || p.idealState || p.todo || p.stop);
    }).sort().reverse();
    if (pastKeys.length) {
      html += '<div class="card"><div class="card-title">これまでの月（ふりかえり）</div>' +
        '<p class="hint" style="margin-bottom:6px">毎月のテーマや目標が、ここに積み上がります。あとから成長を振り返れます。</p>' +
        '<div style="max-height:52vh;overflow:auto">';
      pastKeys.forEach(function (k) {
        var pm = f.months[k];
        var label = k.slice(0, 4) + '年' + (+k.slice(5, 7)) + '月';
        html += '<div style="border-top:1px solid var(--line-2);padding:12px 0">' +
          '<div style="font-weight:600;margin-bottom:6px">' + label + (pm.theme ? '：' + U.esc(pm.theme) : '') + '</div>' +
          (pm.salesGoal ? kv("売上目標", U.yen(pm.salesGoal)) : '') +
          (pm.idealState ? kv("理想の状態", pm.idealState) : '') +
          (pm.todo ? kv("やりたいこと", pm.todo) : '') +
          (pm.stop ? kv("やめること", pm.stop) : '') +
          '</div>';
      });
      html += '</div></div>';
    }

    view.innerHTML = html;

    var monthFields = [
      { name: "salesGoal", label: "売上目標", type: "money" },
      { name: "profitGoal", label: "利益目標", type: "money" },
      { name: "theme", label: "今月のテーマ", type: "text", full: true },
      { name: "idealState", label: "理想の状態", type: "textarea", full: true },
      { name: "todo", label: "やりたいこと", type: "textarea", full: true },
      { name: "stop", label: "やめること", type: "textarea", full: true }
    ];
    var yearFields = [
      { name: "salesGoal", label: "年商目標", type: "money" },
      { name: "profitGoal", label: "利益目標", type: "money" },
      { name: "peopleGoal", label: "人数目標", type: "text" },
      { name: "dream", label: "叶えたい未来", type: "textarea", full: true },
      { name: "growBiz", label: "育てたい事業", type: "textarea", full: true },
      { name: "lifestyle", label: "理想のライフスタイル", type: "textarea", full: true },
      { name: "idealTeam", label: "理想のチーム", type: "textarea", full: true },
      { name: "hireCount", label: "雇用したい人数", type: "text" },
      { name: "socialValue", label: "社会に広げたい価値", type: "textarea", full: true }
    ];

    document.getElementById("editMonth").onclick = function () {
      U.recordModal({ title: "今月の設定", fields: monthFields, values: f.monthly,
        onSave: function (v) { f.monthly = v; S.saveFuture(f); U.toast("保存しました"); render(view); } });
    };
    document.getElementById("editYear").onclick = function () {
      U.recordModal({ title: "年間・未来の設定", fields: yearFields, values: f.yearly,
        onSave: function (v) { f.yearly = v; S.saveFuture(f); U.toast("保存しました"); render(view); } });
    };
  }

  function kv(label, val) {
    return '<div style="margin-bottom:8px;display:flex;gap:10px">' +
      '<span class="muted" style="min-width:130px;font-size:12.5px">' + U.esc(label) + '</span>' +
      '<span style="white-space:pre-wrap">' + (val ? U.esc(val) : '<span class="muted">—</span>') + '</span></div>';
  }

  BG.modules = BG.modules || {};
  BG.modules.future = { title: "FUTURE｜未来設定", render: render };
})();
