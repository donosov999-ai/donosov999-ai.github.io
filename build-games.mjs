// Обогащение /games/: добавляет каждому тренажёру раскрываемое описание
// (что тренирует / суть / сложность) + аккордеон-анимацию. Контент EN+RU (остальные
// языки добавятся отдельным проходом-переводом; пока fallback на EN в раскрытии).
// Идемпотентно: при повторном запуске пропускает инъекцию, если DET уже есть.
import { readFileSync, writeFileSync } from 'fs';

const FILE = '/Users/denisonosov/dev/psygames-site/games/index.html';
let html = readFileSync(FILE, 'utf8');
if (html.includes('const DET=')) { console.log('DET уже внедрён — пропуск'); process.exit(0); }

// tr = что тренирует · how = суть/как играть · lv = что растёт по сложности
// Порядок строго совпадает с GAMES[] в games/index.html (48 шт).
const DET = [
 {tr:{en:"Visual scanning, peripheral vision and focus speed.",ru:"Зрительный поиск, периферическое зрение и скорость фокуса."},how:{en:"Find the numbers 1→N in order on the grid as fast as you can.",ru:"Находи числа 1→N по порядку на сетке как можно быстрее."},lv:{en:"Grid grows from 3×3 to 7×7.",ru:"Сетка растёт от 3×3 до 7×7."}},
 {tr:{en:"Selective and sustained attention.",ru:"Избирательное и устойчивое внимание."},how:{en:"Scan the text and mark every target letter — no misses, no false taps.",ru:"Просматривай текст и отмечай все заданные буквы — без пропусков и ложных нажатий."},lv:{en:"Longer text, more distractor letters.",ru:"Длиннее текст, больше букв-отвлекашек."}},
 {tr:{en:"Visual comparison and attention to detail.",ru:"Зрительное сравнение и внимание к деталям."},how:{en:"Compare two scenes and spot every difference.",ru:"Сравни две картинки и найди все отличия."},lv:{en:"More and subtler differences, time limit.",ru:"Больше и тоньше отличия, лимит времени."}},
 {tr:{en:"Associative verbal memory (paired-associate learning).",ru:"Ассоциативная вербальная память (парные ассоциации)."},how:{en:"Memorize pairs of words, then recall the partner when one is shown.",ru:"Запомни пары слов, затем по одному слову вспомни его пару."},lv:{en:"More pairs, shorter study time.",ru:"Больше пар, меньше времени на запоминание."}},
 {tr:{en:"Sequential memory and mnemonic encoding.",ru:"Память на порядок и мнемоническое кодирование."},how:{en:"Hold an ordered list of words and numbers, then reproduce the order.",ru:"Удержи упорядоченный список слов и чисел, затем воспроизведи порядок."},lv:{en:"Longer sequences, mixed words and digits.",ru:"Длиннее последовательности, слова вперемешку с цифрами."}},
 {tr:{en:"Working memory and fluid updating.",ru:"Оперативная память и обновление информации."},how:{en:"Decide whether the current flash matches the one N steps back.",ru:"Реши, совпадает ли текущая вспышка с той, что была N шагов назад."},lv:{en:"N grows 1→2→3+; dual modality is hardest.",ru:"N растёт 1→2→3+; двойная модальность — самое сложное."}},
 {tr:{en:"Short-term verbal memory span.",ru:"Объём кратковременной вербальной памяти."},how:{en:"Repeat the digit string — forward or backward.",ru:"Повтори ряд цифр — вперёд или в обратном порядке."},lv:{en:"Longer strings; backward is harder than forward.",ru:"Длиннее ряды; обратный порядок труднее прямого."}},
 {tr:{en:"Visuospatial short-term memory.",ru:"Зрительно-пространственная кратковременная память."},how:{en:"Memorize the lit cells on the grid, then reproduce them.",ru:"Запомни светящиеся клетки на сетке, затем повтори их."},lv:{en:"Bigger grid, more cells, shorter flash.",ru:"Больше сетка, больше клеток, короче вспышка."}},
 {tr:{en:"Visual memory and recognition.",ru:"Зрительная память и узнавание."},how:{en:"Flip cards to find every matching pair from memory.",ru:"Переворачивай карточки и находи все одинаковые пары по памяти."},lv:{en:"More pairs, shorter preview.",ru:"Больше пар, короче предпросмотр."}},
 {tr:{en:"Working memory under language processing.",ru:"Оперативная память при обработке речи."},how:{en:"Judge whether each sentence makes sense, then recall the last word of each.",ru:"Оцени, осмысленна ли каждая фраза, затем вспомни последнее слово каждой."},lv:{en:"More sentences per set.",ru:"Больше предложений в наборе."}},
 {tr:{en:"Visuospatial short-term memory.",ru:"Зрительно-пространственная кратковременная память."},how:{en:"Repeat the sequence in which the blocks light up.",ru:"Повтори последовательность, в которой загорались блоки."},lv:{en:"Longer block sequences.",ru:"Длиннее последовательности блоков."}},
 {tr:{en:"Complex working memory: storage plus processing.",ru:"Сложная оперативная память: хранение плюс обработка."},how:{en:"Solve a quick equation, memorize a letter, then recall all letters in order.",ru:"Реши быстрое уравнение, запомни букву, затем вспомни все буквы по порядку."},lv:{en:"More items per set.",ru:"Больше элементов в наборе."}},
 {tr:{en:"Visuospatial working memory and reversal.",ru:"Зрительно-пространственная оперативная память и реверс."},how:{en:"Reproduce the spatial sequence in reverse order.",ru:"Воспроизведи пространственную последовательность в обратном порядке."},lv:{en:"Longer sequences.",ru:"Длиннее последовательности."}},
 {tr:{en:"Sequence memory — verbal or spatial.",ru:"Память на последовательности — вербальные или пространственные."},how:{en:"Reproduce digit or spatial sequences, forward or backward.",ru:"Воспроизводи цифровые или пространственные ряды — вперёд или назад."},lv:{en:"Length, direction and modality scale up.",ru:"Растут длина, направление и модальность."}},
 {tr:{en:"Planning and means-end reasoning.",ru:"Планирование и целенаправленное рассуждение."},how:{en:"Move all discs to the target peg — never a larger disc on a smaller one.",ru:"Перенеси все диски на целевой стержень — большой нельзя класть на меньший."},lv:{en:"More discs (minimum moves grow as 2ⁿ−1).",ru:"Больше дисков (минимум ходов растёт как 2ⁿ−1)."}},
 {tr:{en:"Deductive logic and constraint satisfaction.",ru:"Дедуктивная логика и удовлетворение ограничений."},how:{en:"Fill the grid so digits 1–6 appear once in each row, column and block.",ru:"Заполни так, чтобы цифры 1–6 встречались по разу в строке, столбце и блоке."},lv:{en:"Fewer given digits (easy → hard).",ru:"Меньше открытых цифр (легко → сложно)."}},
 {tr:{en:"Verbal flexibility and lexical access.",ru:"Гибкость речи и доступ к словарю."},how:{en:"Rearrange the shuffled letters into a valid word.",ru:"Составь из перемешанных букв правильное слово."},lv:{en:"Longer words, fewer hints.",ru:"Длиннее слова, меньше подсказок."}},
 {tr:{en:"Inductive reasoning.",ru:"Индуктивное мышление."},how:{en:"Infer the rule and continue the number sequence.",ru:"Выведи правило и продолжи числовую последовательность."},lv:{en:"More complex rules.",ru:"Сложнее правила."}},
 {tr:{en:"Abstract reasoning and feature analysis.",ru:"Абстрактное мышление и анализ признаков."},how:{en:"Find a triple where each of 4 attributes is all-same or all-different.",ru:"Найди тройку, где каждый из 4 признаков либо одинаков, либо весь разный."},lv:{en:"More cards on the table, time pressure.",ru:"Больше карт на столе, дефицит времени."}},
 {tr:{en:"Spatial visualization.",ru:"Пространственное воображение."},how:{en:"Pick the shape that is a rotation — not a mirror — of the target.",ru:"Выбери фигуру, которая является поворотом (а не зеркалом) образца."},lv:{en:"Larger rotation angles, 3D shapes.",ru:"Больше углы поворота, объёмные фигуры."}},
 {tr:{en:"Planning and forethought.",ru:"Планирование и предвидение."},how:{en:"Reach the goal arrangement of balls in the fewest moves.",ru:"Достигни целевого расположения шаров за минимум ходов."},lv:{en:"More moves required to solve.",ru:"Требуется больше ходов для решения."}},
 {tr:{en:"Cognitive control and interference suppression.",ru:"Когнитивный контроль и подавление помех."},how:{en:"Respond to the relevant feature while suppressing the conflicting automatic one.",ru:"Реагируй на нужный признак, подавляя конфликтующий автоматический."},lv:{en:"More conflict trials, faster pace.",ru:"Больше конфликтных проб, быстрее темп."}},
 {tr:{en:"Response inhibition (Go/No-Go and Stop-Signal combined).",ru:"Торможение реакции (Go/No-Go и Стоп-сигнал вместе)."},how:{en:"Act on Go, withhold on No-Go, and abort when the stop signal appears.",ru:"Жми на Go, не жми на No-Go и отменяй действие по стоп-сигналу."},lv:{en:"Shorter windows, more stop trials.",ru:"Короче окна, больше стоп-проб."}},
 {tr:{en:"Inhibition of the automatic reading response.",ru:"Торможение автоматического чтения."},how:{en:"Name the ink colour — not the word.",ru:"Называй цвет чернил, а не само слово."},lv:{en:"More incongruent trials, faster.",ru:"Больше несогласованных проб, быстрее."}},
 {tr:{en:"Impulse control.",ru:"Контроль импульсов."},how:{en:"Tap on green, hold back on red.",ru:"Жми на зелёный, сдерживайся на красном."},lv:{en:"Rarer No-Go, faster stimuli.",ru:"Реже No-Go, быстрее стимулы."}},
 {tr:{en:"Action cancellation.",ru:"Отмена уже начатого действия."},how:{en:"Respond fast, but cancel the action when the stop signal appears.",ru:"Реагируй быстро, но отменяй действие, когда появляется стоп-сигнал."},lv:{en:"Later and rarer stop signals.",ru:"Позже и реже стоп-сигнал."}},
 {tr:{en:"Attention switching and processing speed.",ru:"Переключение внимания и скорость обработки."},how:{en:"Connect targets alternating two rules — 1→A→2→B→3…",ru:"Соединяй цели, чередуя два правила — 1→А→2→Б→3…"},lv:{en:"More items; mixed sequence is hardest.",ru:"Больше элементов; смешанная цепочка — самое сложное."}},
 {tr:{en:"Cognitive flexibility.",ru:"Когнитивная гибкость."},how:{en:"Alternate between a number rule and a letter rule on cue.",ru:"Чередуй правило для числа и для буквы по сигналу."},lv:{en:"Faster switches, less cueing.",ru:"Быстрее переключения, меньше подсказок."}},
 {tr:{en:"Rule inference and set-shifting.",ru:"Выведение правила и смена установки."},how:{en:"Discover the hidden sorting rule from feedback — it changes without warning.",ru:"Найди скрытое правило сортировки по обратной связи — оно меняется без предупреждения."},lv:{en:"More frequent rule shifts.",ru:"Чаще смена правил."}},
 {tr:{en:"Selective attention and interference control.",ru:"Избирательное внимание и контроль помех."},how:{en:"Respond to the central arrow, ignoring the flanking arrows.",ru:"Реагируй на центральную стрелку, игнорируя стрелки по бокам."},lv:{en:"More incongruent trials, faster.",ru:"Больше несогласованных проб, быстрее."}},
 {tr:{en:"Emotional interference control.",ru:"Контроль эмоциональных помех."},how:{en:"Name the font colour, ignoring the emotional meaning of the word.",ru:"Называй цвет шрифта, игнорируя эмоциональный смысл слова."},lv:{en:"Stronger emotional words.",ru:"Сильнее эмоциональные слова."}},
 {tr:{en:"Risk assessment and impulse control.",ru:"Оценка риска и контроль импульсов."},how:{en:"Pump the balloon for more reward — or bank it before it bursts.",ru:"Надувай шар ради награды — или забери деньги, пока он не лопнул."},lv:{en:"Variable, unknown burst points.",ru:"Переменные, неизвестные точки разрыва."}},
 {tr:{en:"Value-based decision learning.",ru:"Обучение решениям по ценности."},how:{en:"Learn by feedback to favour the advantageous decks.",ru:"Учись по обратной связи выбирать выгодные колоды."},lv:{en:"Shifting payoff schedules.",ru:"Меняющиеся схемы выплат."}},
 {tr:{en:"Adaptive learning and flexibility.",ru:"Адаптивное обучение и гибкость."},how:{en:"Pick the rewarding colour; when the rule reverses, switch.",ru:"Выбирай вознаграждаемый цвет; когда правило меняется — переключайся."},lv:{en:"More frequent reversals.",ru:"Чаще развороты правила."}},
 {tr:{en:"Mental arithmetic and speed.",ru:"Устный счёт и скорость."},how:{en:"Combine numbers to make the target sum, X+Y=Z.",ru:"Составляй из чисел нужную сумму, X+Y=Z."},lv:{en:"Bigger numbers, time limit.",ru:"Больше числа, лимит времени."}},
 {tr:{en:"Calculation speed.",ru:"Скорость вычислений."},how:{en:"Solve as many problems as you can against the clock.",ru:"Реши как можно больше примеров на время."},lv:{en:"Harder operations, less time.",ru:"Сложнее операции, меньше времени."}},
 {tr:{en:"Number sense and decomposition.",ru:"Чувство числа и его разложение."},how:{en:"Pick the numbers that add up to the target.",ru:"Выбери числа, дающие в сумме нужное."},lv:{en:"Bigger targets, more options.",ru:"Больше цель, больше вариантов."}},
 {tr:{en:"Reaction speed and selective response.",ru:"Скорость реакции и избирательный ответ."},how:{en:"Hit the valid coloured targets, avoid the rest.",ru:"Бей по нужным цветным мишеням, избегай остальных."},lv:{en:"Faster, more distractors.",ru:"Быстрее, больше отвлекающих."}},
 {tr:{en:"Choice reaction time.",ru:"Время реакции выбора."},how:{en:"Tap in the arrow's direction as fast as possible.",ru:"Жми по направлению стрелки как можно быстрее."},lv:{en:"More choices, faster onset.",ru:"Больше вариантов, быстрее появление."}},
 {tr:{en:"Selective attention and feature binding.",ru:"Избирательное внимание и связывание признаков."},how:{en:"Find the target T among many distractor Ls.",ru:"Найди цель-T среди множества букв-L."},lv:{en:"More distractors; conjunction search is hardest.",ru:"Больше отвлекающих; поиск по сочетанию признаков — самое сложное."}},
 {tr:{en:"Processing speed and coding.",ru:"Скорость обработки и кодирование."},how:{en:"Convert symbols to digits using the key — as fast as possible.",ru:"Кодируй символы цифрами по таблице — как можно быстрее."},lv:{en:"Under time pressure.",ru:"В условиях дефицита времени."}},
 {tr:{en:"Spatial orienting of attention.",ru:"Пространственная ориентировка внимания."},how:{en:"Respond to the target; the cue may point to it truly or falsely.",ru:"Реагируй на мишень; подсказка может указывать на неё верно или ложно."},lv:{en:"More invalid cues, shorter cue-target gap.",ru:"Больше ложных подсказок, короче интервал подсказка-мишень."}},
 {tr:{en:"Alerting, orienting and executive attention together.",ru:"Тревога-готовность, ориентировка и исполнительное внимание вместе."},how:{en:"Respond to a central arrow combined with cues and flankers.",ru:"Реагируй на центральную стрелку в сочетании с подсказками и фланкерами."},lv:{en:"Combined cue and flanker conditions.",ru:"Совмещённые условия подсказок и фланкеров."}},
 {tr:{en:"Vigilance and response inhibition over time.",ru:"Бдительность и торможение реакции на дистанции."},how:{en:"Respond to every letter except the rare target X.",ru:"Реагируй на все буквы, кроме редкой мишени X."},lv:{en:"Longer blocks, rarer targets.",ru:"Длиннее блоки, реже мишени."}},
 {tr:{en:"Verbal fluency and retrieval.",ru:"Беглость речи и извлечение из памяти."},how:{en:"Name as many words as you can starting with a given letter in 60s.",ru:"Назови за 60 с как можно больше слов на заданную букву."},lv:{en:"Rarer starting letters.",ru:"Реже стартовые буквы."}},
 {tr:{en:"Episodic memory for detail (immediate and delayed).",ru:"Эпизодическая память на детали (сразу и с задержкой)."},how:{en:"Read a short story, then recall it now and again after 90 seconds.",ru:"Прочитай короткий рассказ, затем перескажи его сейчас и снова через 90 секунд."},lv:{en:"Longer stories, more detail to hold.",ru:"Длиннее рассказы, больше деталей удержать."}},
 {tr:{en:"Social cognition and emotion recognition.",ru:"Социальное познание и распознавание эмоций."},how:{en:"Infer the person's mental state from a photo of the eyes alone.",ru:"Определи состояние человека только по фото глаз."},lv:{en:"Subtler, more similar expressions.",ru:"Тоньше и более похожие выражения."}},
 {tr:{en:"Spatial interference control.",ru:"Контроль пространственных помех."},how:{en:"The colour tells which side to press; the position tries to distract you.",ru:"Цвет говорит, какую сторону жать; позиция пытается сбить."},lv:{en:"More incongruent trials, faster.",ru:"Больше несогласованных проб, быстрее."}},
];

const LBL = {
 en:{tr:"What it trains",how:"How it works",lv:"Difficulty"},
 ru:{tr:"Что тренирует",how:"Как играть",lv:"Сложность"},
 es:{tr:"Qué entrena",how:"Cómo se juega",lv:"Dificultad"},
 pt:{tr:"O que treina",how:"Como jogar",lv:"Dificuldade"},
 hi:{tr:"क्या प्रशिक्षित करता है",how:"कैसे खेलें",lv:"कठिनाई"},
 zh:{tr:"训练什么",how:"玩法",lv:"难度"},
 de:{tr:"Was es trainiert",how:"Spielablauf",lv:"Schwierigkeit"},
};

if (DET.length !== 48) { console.error('DET длина', DET.length, '≠ 48 — стоп'); process.exit(1); }

// ── 1) CSS аккордеона перед </style> ──
const CSS = `
  .g{cursor:pointer;position:relative}
  .g .hd{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  .g .chev{flex:none;color:var(--mut);font-size:13px;margin-top:3px;transition:transform .25s,color .2s}
  .g.open{border-color:var(--accent);background:var(--card2)}
  .g.open .chev{transform:rotate(180deg);color:var(--accent)}
  .more{max-height:0;overflow:hidden;opacity:0;transition:max-height .32s ease,opacity .25s ease,margin-top .25s}
  .g.open .more{max-height:560px;opacity:1;margin-top:13px}
  .sec{margin-top:11px;padding-top:11px;border-top:1px solid var(--line)}
  .sec:first-child{margin-top:0;padding-top:0;border-top:none}
  .sec .lbl{display:block;font-size:11px;font-weight:800;color:var(--accent2);letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px}
  .sec p{font-size:13px;color:var(--txt);line-height:1.5;margin:0}
</style>`;
html = html.replace('\n</style>', CSS);

// ── 2) DET + LBL перед const UI= ──
html = html.replace('const UI=', `const DET=${JSON.stringify(DET)};\nconst LBL=${JSON.stringify(LBL)};\nconst UI=`);

// ── 3) раскрываемая карточка вместо плоской ──
const OLD = `    gs.forEach(g=>{const card=document.createElement('div');card.className='g';
      const n=document.createElement('div');n.className='n';n.textContent=g.name[l]||g.name.en;
      const dd=document.createElement('div');dd.className='d';dd.textContent=g.desc[l]||g.desc.en;
      card.appendChild(n);card.appendChild(dd);grid.appendChild(card);});`;
const NEW = `    const LB=LBL[l]||LBL.en;
    gs.forEach(g=>{const i=GAMES.indexOf(g);const det=DET[i]||{};const pick=o=>o&&(o[l]||o.en)||'';
      const tr=pick(det.tr),how=pick(det.how)||(g.desc[l]||g.desc.en),lv=pick(det.lv);
      const card=document.createElement('div');card.className='g';
      card.innerHTML='<div class="hd"><div><div class="n"></div><div class="d"></div></div><span class="chev">▾</span></div><div class="more"></div>';
      card.querySelector('.n').textContent=g.name[l]||g.name.en;
      card.querySelector('.d').textContent=g.desc[l]||g.desc.en;
      const secs=[['🎯',LB.tr,tr],['🎮',LB.how,how],['📈',LB.lv,lv]].filter(s=>s[2]);
      const more=card.querySelector('.more');
      more.innerHTML=secs.map(s=>'<div class="sec"><span class="lbl"></span><p></p></div>').join('');
      [...more.querySelectorAll('.sec')].forEach((sec,k)=>{sec.querySelector('.lbl').textContent=secs[k][0]+' '+secs[k][1];sec.querySelector('p').textContent=secs[k][2];});
      card.addEventListener('click',()=>card.classList.toggle('open'));
      grid.appendChild(card);});`;
if (!html.includes(OLD)) { console.error('НЕ найден старый блок карточки — стоп (apply изменился?)'); process.exit(1); }
html = html.replace(OLD, NEW);

writeFileSync(FILE, html, 'utf8');
console.log('games/index.html обогащён: DET(48) + LBL(7) + аккордеон. EN+RU заполнены, прочие langs → fallback EN в раскрытии.');
