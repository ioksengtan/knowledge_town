import type { Card, Domain, QuizCard, ReadingCard, TownMap } from './types';
import { categoryHash } from './logic';

export const SEED_MAP_ID = 'map-1';

function domain(id: string, name: string, description: string, slotIndex: number): Domain {
  return {
    id,
    mapId: SEED_MAP_ID,
    name,
    description,
    category: categoryHash(name),
    level: 1,
    slotIndex,
  };
}

function quiz(
  id: string,
  domainId: string,
  question: string,
  choices: string[],
  answerIndex: number,
  explanation?: string
): QuizCard {
  return {
    id,
    domainId,
    type: 'quiz',
    question,
    choices,
    answerIndex,
    explanation,
    streak: 0,
    interval: 1,
    stage: 0,
    due: 0,
    claimed: false,
  };
}

function reading(id: string, domainId: string, title: string, pages: string[]): ReadingCard {
  return { id, domainId, type: 'reading', title, pages, claimed: false };
}

export function createSeedMap(): TownMap {
  return {
    id: SEED_MAP_ID,
    name: '第一座城鎮',
    theme: 'last-war',
    resources: 0,
    combo: 0,
    landCapacity: { used: 5, total: 6 },
    townHallLevel: 1,
    createdAt: Date.now(),
  };
}

export function createSeedDomains(): Domain[] {
  return [
    domain('d-ai', 'AI 與機器學習', '從類神經網路到大型語言模型，追蹤 AI 領域的核心技術演進。', 0),
    domain('d-chip', '晶片與硬體', '半導體製程、GPU 架構、先進封裝——認識驅動運算的物理基礎。', 1),
    domain('d-swe', '軟體工程', '從版本控制到系統設計，累積寫出可維護軟體的實務知識。', 2),
    domain('d-startup', '新創產業', '募資輪次、商業模式、產業趨勢，理解新創世界的運作邏輯。', 3),
    domain('d-people', '科技人物觀察', '認識形塑科技產業的重要人物與他們的關鍵決策。', 4),
  ];
}

export function createSeedCards(): Card[] {
  return [
    // AI 與機器學習
    quiz(
      'c-ai-1',
      'd-ai',
      'Transformer 架構中，讓模型能夠權衡輸入序列中不同位置重要性的機制稱為什麼？',
      ['卷積運算', '注意力機制（Attention）', '池化層', '批次正規化'],
      1,
      'Attention 機制讓模型在處理每個位置時，動態決定該關注輸入序列中的哪些部分，是 Transformer 的核心設計。'
    ),
    quiz(
      'c-ai-2',
      'd-ai',
      '「過擬合」（Overfitting）指的是什麼現象？',
      ['模型在訓練資料表現差', '模型在訓練資料表現極佳但在新資料上表現差', '模型訓練速度過慢', '模型參數量不足'],
      1,
      '過擬合代表模型記住了訓練資料的細節與雜訊，喪失了對未見過資料的泛化能力。'
    ),
    quiz(
      'c-ai-3',
      'd-ai',
      'RLHF（Reinforcement Learning from Human Feedback）主要用來做什麼？',
      ['加速模型訓練硬體', '壓縮模型參數量', '依人類偏好微調模型輸出行為', '將模型轉換成其他程式語言'],
      2,
      'RLHF 透過人類對模型輸出的偏好排序訓練一個獎勵模型，再用強化學習引導語言模型輸出更符合人類期望的內容。'
    ),
    quiz(
      'c-ai-4',
      'd-ai',
      '下列何者最能描述「參數量」與模型能力的關係？',
      ['參數量與能力完全無關', '參數量越大能力必然越好，沒有例外', '參數量是影響能力的因素之一，但資料品質、訓練方法同樣關鍵', '參數量只影響推論速度，不影響能力'],
      2,
      '模型能力受參數量、訓練資料的質與量、訓練方法（如 RLHF）等多重因素共同影響，並非單一變數決定。'
    ),
    reading(
      'c-ai-5',
      'd-ai',
      '大型語言模型的訓練三階段',
      [
        '大型語言模型的訓練通常分為三個階段：預訓練（Pretraining）、監督式微調（SFT），以及基於人類回饋的強化學習（RLHF）。',
        '預訓練階段，模型在海量文字語料上學習「預測下一個詞」，藉此吸收語言結構與世界知識，這個階段的運算成本最為龐大。',
        '監督式微調階段，團隊準備高品質的問答範例，教模型以「助理」的口吻回應指令，而不只是續寫文字。',
        'RLHF 階段則讓人類標註員對模型的多個回覆進行偏好排序，訓練一個獎勵模型，再用它引導語言模型產生更符合人類期待、更安全的輸出。',
        '這三階段環環相扣：預訓練決定模型的知識與能力上限，後兩階段則決定模型「願不願意、懂不懂得」把能力用在對的地方。',
      ]
    ),

    // 晶片與硬體
    quiz(
      'c-chip-1',
      'd-chip',
      '「先進封裝」（Advanced Packaging）技術興起的主要原因是什麼？',
      ['取代所有的製程微縮', '在製程微縮趨緩下，透過封裝把多顆晶粒整合以提升效能', '降低晶片的耗電需求為零', '讓晶片可以不需要散熱'],
      1,
      '當單靠製程微縮（如 3nm、2nm）帶來的效益遞減時，先進封裝（如 CoWoS、3D 堆疊）成為繼續提升系統效能與整合度的關鍵手段。'
    ),
    quiz(
      'c-chip-2',
      'd-chip',
      'GPU 相較於 CPU，在深度學習訓練上具有優勢的主要原因是？',
      ['GPU 時脈永遠比 CPU 高', 'GPU 擁有大量平行運算核心，適合矩陣運算', 'GPU 不需要記憶體', 'GPU 只能執行單一執行緒'],
      1,
      'GPU 內建數千個平行運算核心，非常適合深度學習中大量的矩陣乘法與張量運算，因此成為訓練模型的主流硬體。'
    ),
    quiz(
      'c-chip-3',
      'd-chip',
      '「晶圓代工」（Foundry）模式指的是什麼？',
      ['公司自行設計也自行製造晶片', '公司專門幫其他無廠半導體公司（Fabless）製造晶片', '只做晶片的封裝測試', '只設計不製造，也不代工'],
      1,
      '晶圓代工廠（如台積電）專注於製造，不自行設計產品，而是接受 Fabless 公司（如輝達、蘋果）的設計委託進行量產。'
    ),
    quiz(
      'c-chip-4',
      'd-chip',
      'HBM（High Bandwidth Memory）在 AI 加速卡中主要扮演什麼角色？',
      ['取代 GPU 運算核心', '提供極高頻寬的記憶體，緩解資料傳輸瓶頸', '負責晶片散熱', '取代電源供應器'],
      1,
      'AI 訓練涉及龐大資料搬移，HBM 透過堆疊式設計提供遠高於傳統 DRAM 的頻寬，減少運算核心等待資料的時間。'
    ),

    // 軟體工程
    quiz(
      'c-swe-1',
      'd-swe',
      'Git 中，「rebase」與「merge」最主要的差異是什麼？',
      ['rebase 會刪除所有歷史紀錄', 'rebase 改寫提交歷史使其線性，merge 保留分支交會的紀錄', '兩者完全相同，只是名稱不同', 'merge 只能用於遠端倉庫'],
      1,
      'rebase 會把提交「搬到」新的基準點上，產生線性歷史；merge 則會建立一個合併提交，保留原本分支交錯的紀錄。'
    ),
    quiz(
      'c-swe-2',
      'd-swe',
      '「技術債」（Technical Debt）最貼切的定義是？',
      ['公司積欠的實際金錢債務', '為求短期速度所做的取捨，未來需要額外成本償還', '伺服器硬體的折舊費用', '員工加班產生的補休'],
      1,
      '技術債是一種比喻：為了短期交付速度而採取的次佳實作方式，日後需要花額外心力（利息）來重構或修正。'
    ),
    quiz(
      'c-swe-3',
      'd-swe',
      '在系統設計中，「水平擴展」（Scale Out）指的是？',
      ['升級單台機器的規格（如加大記憶體）', '增加更多台機器來分攤負載', '減少伺服器數量', '把資料庫刪除重建'],
      1,
      '水平擴展透過增加機器數量分散流量與運算負載，相對於「垂直擴展」（升級單機規格），更適合處理大規模、彈性成長的流量。'
    ),
    quiz(
      'c-swe-4',
      'd-swe',
      '單元測試（Unit Test）主要驗證的對象是什麼？',
      ['整個系統的端對端流程', '單一函式或模組在隔離狀態下的行為是否正確', '使用者介面的視覺呈現', '伺服器的網路延遲'],
      1,
      '單元測試聚焦在最小可測試單位（如一個函式），驗證其在給定輸入下是否回傳預期輸出，通常會隔離外部依賴。'
    ),

    // 新創產業
    quiz(
      'c-startup-1',
      'd-startup',
      '新創公司的「A 輪」募資通常發生在什麼階段？',
      ['公司剛成立、僅有構想時', '產品已找到初步市場驗證（PMF），需要資金擴大規模時', '公司即將上市前的最後一輪', '公司已經倒閉清算時'],
      1,
      'A 輪通常在種子輪之後，公司已證明產品有一定市場需求（Product-Market Fit），需要資金來擴大團隊與業務規模。'
    ),
    quiz(
      'c-startup-2',
      'd-startup',
      '「PMF」（Product-Market Fit）指的是什麼？',
      ['產品的行銷預算已經用完', '產品滿足市場真實需求、獲得使用者強烈黏著的狀態', '公司完成上市', '產品完全沒有競爭對手'],
      1,
      'PMF 描述產品真正解決了目標市場的痛點，使用者願意持續使用甚至主動推薦，是新創從「求生存」邁向「求成長」的關鍵轉折。'
    ),
    quiz(
      'c-startup-3',
      'd-startup',
      '「燒錢率」（Burn Rate）衡量的是什麼？',
      ['公司每月獲利金額', '公司每月消耗現金的速度', '員工每月加班時數', '產品每月更新次數'],
      1,
      '燒錢率是新創每月淨消耗的現金量，搭配帳上現金可推算出「現金跑道」（Runway）還能撐多久，是募資時機的重要依據。'
    ),
    quiz(
      'c-startup-4',
      'd-startup',
      '新創採用「SaaS」（Software as a Service）商業模式的核心特徵是？',
      ['使用者需一次買斷軟體授權', '以訂閱制持續收費，透過雲端提供服務', '軟體完全免費不收費', '只能安裝在單一台電腦上使用'],
      1,
      'SaaS 模式透過雲端交付軟體服務，以月費或年費訂閱收費，讓公司獲得可預測的經常性收入（ARR/MRR）。'
    ),

    // 科技人物觀察
    quiz(
      'c-people-1',
      'd-people',
      '被稱為「深度學習三巨頭」之一、以反向傳播演算法研究聞名的學者是？',
      ['Geoffrey Hinton', 'Steve Jobs', 'Jeff Bezos', 'Satya Nadella'],
      0,
      'Geoffrey Hinton 與 Yoshua Bengio、Yann LeCun 並稱「深度學習三巨頭」，對類神經網路與反向傳播的研究影響深遠，三人於 2018 年共同獲得圖靈獎。'
    ),
    quiz(
      'c-people-2',
      'd-people',
      '在半導體產業中，被稱為「晶圓代工模式」創始人、台積電創辦人是？',
      ['張忠謀', '黃仁勳', '馬斯克', '比爾蓋茲'],
      0,
      '張忠謀創立台積電，開創了專注製造、不做設計的「純晶圓代工」商業模式，深刻改變全球半導體產業分工。'
    ),
    quiz(
      'c-people-3',
      'd-people',
      '輝達（NVIDIA）的創辦人暨執行長是？',
      ['黃仁勳', '馬克祖克柏', '伊隆馬斯克', '山姆奧特曼'],
      0,
      '黃仁勳自 1993 年創立輝達以來持續擔任執行長，帶領公司從繪圖晶片廠商轉型為 AI 運算時代的核心供應商。'
    ),
    quiz(
      'c-people-4',
      'd-people',
      'OpenAI 的執行長，也是 ChatGPT 推出時的核心領導者是？',
      ['山姆奧特曼', '賈伯斯', '祖克柏', '貝佐斯'],
      0,
      'Sam Altman 為 OpenAI 執行長，在他的領導下 OpenAI 推出了 ChatGPT，成為近年生成式 AI 浪潮的重要推手。'
    ),
  ];
}
