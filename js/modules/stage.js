/* ===== Stage｜成長の道のり（ステージ） ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  // 各ステージ。care = どのステージでも「カラダが土台」。tasks = 今やること。rooms = 見るルーム。
  var STAGES = [
    {
      no: 1, name: "整える（土台）",
      lead: "まずは、自分から。カラダと心が整っていれば、事業はちゃんと続きます。ここは“卒業”がなく、どのステージでもいちばん大事な場所です。",
      care: "睡眠・休息を先に予定に入れる。倒れない・枯れないことが、最大の経営戦略。",
      tasks: [
        "まず1週間、7〜8時間の睡眠をめざす",
        "「理想の働き方」を言葉にする（設定）",
        "基本情報（お名前・事業・商品）を入れる",
        "今日の戦略を、毎朝ひとつ"
      ],
      rooms: [["body", "BODY｜カラダ"], ["settings", "Settings｜基本情報"], ["diagnosis", "今日の戦略"]]
    },
    {
      no: 2, name: "はじめの一歩",
      lead: "小さくていい。「誰の・何を・いくらで」を決めて、最初のお客様に出会う段階です。完璧を待たず、まず出してみましょう。",
      care: "気合いより回復。動けない日は、責めずにカラダを整える日に。",
      tasks: [
        "メイン商品／サービスと価格を決める（設定）",
        "理想のお客様を、ひとり具体的に思い描く",
        "発信を始める（まずは週1投稿でOK）",
        "はじめての相談・お申込みを記録する"
      ],
      rooms: [["content", "CONTENT｜発信"], ["customer", "CUSTOMER｜顧客"], ["money", "MONEY｜お金"]]
    },
    {
      no: 3, name: "安定させる",
      lead: "一度きりでなく「続く」へ。リピート・継続のお客様と、お金の流れを整える段階です。数字を“見える化”すると、不安が安心に変わります。",
      care: "売上が伸びる時こそ、休む予定を先に入れる。忙しさで自分を後回しにしない。",
      tasks: [
        "毎月の売上・経費を記録して、利益を把握する",
        "リピート／継続につながる工夫を、ひとつ試す",
        "発信を「型」にする（曜日・テーマを決める）",
        "月商目標を決めて、達成率を見る"
      ],
      rooms: [["money", "MONEY｜お金"], ["customer", "CUSTOMER｜顧客"], ["content", "CONTENT｜発信"]]
    },
    {
      no: 4, name: "仕組み化",
      lead: "あなたが動かなくても回る部分をつくる段階。属人化を少しずつ手放すと、時間とカラダに余白が生まれます。個人のままでも、ここが“心地よい完成形”になります。",
      care: "仕組み化の目的は“ラクして大きく”。あなたの時間とカラダを守るため。",
      tasks: [
        "よくやる作業を1つ、手順書（マニュアル）にする",
        "「自分にしかできない事」と「任せられる事」を仕分ける",
        "お客様対応の流れ（申込→提供→フォロー）を決める",
        "週次・月次でふりかえる習慣をつくる"
      ],
      rooms: [["manual", "MANUAL｜仕組み"], ["project", "PROJECT｜事業"], ["weekly", "週次ミーティング"]]
    },
    {
      no: 5, name: "広げる・任せる",
      lead: "自分の手を離れても回る形へ。外注やチームの力を借りて、できることを増やす段階です。（会社をめざす方向け）",
      care: "人が増えても、まずあなたが整っていること。土台が崩れると、全部が揺れます。",
      tasks: [
        "最初に任せる業務を1つ決める（マニュアルがある作業から）",
        "外注さん／メンバーを、ひとりお願いしてみる",
        "任せたあとの「確認のしかた」を決める",
        "理想のチーム像を言葉にする（未来設定）"
      ],
      rooms: [["team", "TEAM｜チーム"], ["manual", "MANUAL｜仕組み"], ["future", "FUTURE｜未来設定"]]
    },
    {
      no: 6, name: "会社にする",
      lead: "法人化の準備。数字と仕組みが整ったら、形を会社へ。タイミングや方法は専門家に相談しながら、安心して進めましょう。（会社をめざす方向け）",
      care: "大きくしても、カラダが資本。倒れない自分でいることが、いちばんの土台。",
      tasks: [
        "年間の売上・利益を把握する（法人化の判断材料に）",
        "税理士さんに相談する（法人化のメリット・タイミング）",
        "屋号・事業内容・理念を整理する",
        "会社にした後の「理想のチーム・働き方」を描く"
      ],
      rooms: [["money", "MONEY｜お金"], ["future", "FUTURE｜未来設定"], ["manual", "MANUAL｜仕組み"]]
    }
  ];

  function maxStageFor(goal) { return goal === "company" ? 6 : 4; }

  function currentStage() {
    var s = S.settings();
    var no = parseInt(s.stage, 10) || 1;
    var max = maxStageFor(s.goal);
    if (no > max) no = max;
    return STAGES[no - 1];
  }

  function render(view) {
    var s = S.settings();
    var goal = s.goal || "";
    var max = maxStageFor(goal);
    var cur = parseInt(s.stage, 10) || 1;
    if (cur > max) cur = max;

    var html = '<p class="page-lead">あなたの“今いる場所”から、無理なく育てていきましょう。どのステージでも、土台はいつも「カラダ」。まず自分を整えることが、いちばんの近道です。</p>';

    // めざす形
    html += '<div class="card"><div class="card-title">めざす形</div><div class="choices">' +
      '<button class="choice' + (goal === "solo" ? " sel" : "") + '" data-goal="solo">個人で、心地よく豊かに</button>' +
      '<button class="choice' + (goal === "company" ? " sel" : "") + '" data-goal="company">会社にして、大きく</button>' +
      '</div><p class="hint" style="margin-top:10px">あとで変えられます。「会社にして、大きく」を選ぶと、Stage 5・6（広げる／会社にする）が出ます。個人のままでも、Stage 4 が心地よい完成形です。</p></div>';

    // 今いるステージ
    html += '<div class="card"><div class="card-title">今いるステージ</div><div class="choices">';
    STAGES.forEach(function (st) {
      if (st.no > max) return;
      html += '<button class="choice' + (st.no === cur ? " sel" : "") + '" data-stage="' + st.no + '">Stage ' + st.no + '｜' + U.esc(st.name) + '</button>';
    });
    html += '</div></div>';

    // 現在ステージの詳細
    var st = STAGES[cur - 1];
    var checks = (s.stageChecks && s.stageChecks[cur]) || [];
    html += '<div class="card" style="border-left:3px solid var(--gold)">' +
      '<div class="card-title">Stage ' + cur + '｜' + U.esc(st.name) + '</div>' +
      '<p style="font-size:13.5px;line-height:1.95;margin-bottom:14px">' + U.esc(st.lead) + '</p>' +
      '<div style="background:var(--surface-2);border-radius:12px;padding:12px 14px;margin-bottom:16px">' +
      '<div style="font-size:12px;letter-spacing:.08em;color:var(--gold-deep);font-weight:600;margin-bottom:4px">まず、カラダを整える</div>' +
      '<div style="font-size:13px;line-height:1.9">' + U.esc(st.care) + '</div></div>' +
      '<div style="font-size:13px;font-weight:600;margin-bottom:8px">今やること</div>' +
      '<div id="stageTasks"></div>' +
      '<div style="font-size:13px;font-weight:600;margin:18px 0 8px">このステージで見るルーム</div>' +
      '<div class="links" id="stageRooms"></div></div>';

    view.innerHTML = html;

    // めざす形の切り替え
    view.querySelectorAll("[data-goal]").forEach(function (b) {
      b.onclick = function () {
        var g = b.getAttribute("data-goal");
        var patch = { goal: g };
        var cs = parseInt(S.settings().stage, 10) || 1;
        if (g !== "company" && cs > 4) patch.stage = 4;
        S.saveSettings(patch);
        render(view);
      };
    });

    // 今いるステージの切り替え
    view.querySelectorAll("[data-stage]").forEach(function (b) {
      b.onclick = function () {
        S.saveSettings({ stage: parseInt(b.getAttribute("data-stage"), 10) });
        render(view);
        if (BG.refreshHeader) BG.refreshHeader();
      };
    });

    // チェックリスト
    var box = document.getElementById("stageTasks");
    st.tasks.forEach(function (t, i) {
      var row = document.createElement("label");
      row.className = "check-row";
      row.style.cssText = "display:flex;align-items:flex-start;gap:9px;padding:7px 0;cursor:pointer;line-height:1.8;font-size:13.5px";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!checks[i];
      cb.style.cssText = "width:auto;margin-top:4px;flex:none";
      cb.onchange = function () {
        var all = S.settings().stageChecks || {};
        var arr = (all[cur] || []).slice();
        arr[i] = cb.checked;
        all[cur] = arr;
        S.saveSettings({ stageChecks: all });
      };
      var span = document.createElement("span");
      span.textContent = t;
      row.appendChild(cb);
      row.appendChild(span);
      box.appendChild(row);
    });

    // 見るルーム
    var rooms = document.getElementById("stageRooms");
    st.rooms.forEach(function (r) {
      var chip = document.createElement("button");
      chip.className = "btn btn-sm";
      chip.textContent = r[1];
      chip.onclick = function () { if (BG.go) BG.go(r[0]); };
      rooms.appendChild(chip);
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.stage = { title: "STAGE｜成長の道のり", render: render };
  BG.calc = BG.calc || {};
  BG.calc.currentStage = currentStage;
})();
