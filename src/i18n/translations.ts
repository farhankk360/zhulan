export const translations = {
  zh: {
    // ── Navigation ───────────────────────────────────────────────
    'nav.map': '地图',
    'nav.timeline': '时间轴',
    'nav.about': '关于',
    'header.tagline': '古代建筑图鉴',

    // ── Footer ───────────────────────────────────────────────────
    'footer.credit': '2026 4C 竞赛 · 筑览 ZhuLan · AI + 信息可视化',

    // ── MapView ──────────────────────────────────────────────────
    'map.filtersButton': '筛选',
    'map.errorDismiss': '关闭',
    'map.identifyFailed': '识别失败，请重试。',

    // ── TimelineView ─────────────────────────────────────────────
    'timeline.heading': '历史时间轴',
    'timeline.subheading': '个建筑分布于中国历史各朝代',
    'timeline.sectionTimeline': '建筑年代分布',
    'timeline.sectionDynasty': '各朝代数量',

    // ── AboutView ────────────────────────────────────────────────
    'about.heading': '关于筑览',
    'about.intro': 'ZhuLan（筑览）是中国1911年前建筑遗产的交互式地图——宫殿、民居、官府与桥梁——通过地图与历史时间轴进行探索。',
    'about.sectionBackground': '项目背景',
    'about.backgroundText': '本项目参加第19届中国大学生计算机设计大赛（4C）2026年度，大类6：AI+信息可视化设计。数据集结合了人工整理条目与Wikidata数据，收录1911年前建造的建筑。',
    'about.sectionAI': 'AI 工具使用声明',
    'about.aiDeepSeek': '研究辅助、中文文本生成、代码生成',
    'about.aiTongyi': 'AI 结构插图生成',
    'about.aiKimi': '文献综述、历史核查、长文档分析',
    'about.sectionTech': '技术栈',
    'about.sectionData': '数据来源',
    'about.dataItem1': 'Wikidata SPARQL 端点（wikidata.org）',
    'about.dataItem2': '故宫博物院官方资料',
    'about.dataItem3': 'UNESCO 世界遗产提名文件',
    'about.dataItem4': '各省文物局档案',
    'about.dataItem5': '人工整理历史研究',

    // ── FilterPanel ──────────────────────────────────────────────
    'filter.heading': '筛选',
    'filter.typeLabel': '类型',
    'filter.sourceLabel': '来源',
    'filter.resetAll': '重置全部',
    'filter.typePalace': '皇宫',
    'filter.typeResidence': '民居',
    'filter.typeGovernment': '官府',
    'filter.typeBridge': '桥梁',
    'filter.sourceCurated': '精选',
    'filter.sourceWikidata': '维基数据',

    // ── InfoPanel ────────────────────────────────────────────────
    'info.typePalace': '皇宫',
    'info.typeResidence': '民居',
    'info.typeGovernment': '官府',
    'info.typeBridge': '桥梁',
    'info.fieldArchitect': '建造者',
    'info.fieldStyle': '建筑风格',
    'info.fieldFeatures': '主要特征',
    'info.fieldMaterials': '建筑材料',
    'info.fieldSources': '参考来源',
    'info.imageCredit': '图片',
    'info.closePanel': '关闭面板',
    'info.wikipedia': '维基百科 →',

    // ── ScanButton ───────────────────────────────────────────────
    'scan.buttonTitle': '筑览识图 — 扫描识别',
    'scan.buttonAriaLabel': '扫描建筑',

    // ── CameraCapture ────────────────────────────────────────────
    'scan.modalTitle': '筑览识图',
    'scan.modalSubtitle': '扫描识别',
    'scan.privacyNotice': '您的照片将发送至通义AI（Qwen-VL）进行识别，图片不会被存储。',
    'scan.privacyAck': '知道了',
    'scan.tabUpload': '📁 上传',
    'scan.tabCamera': '📷 拍照',
    'scan.dropPrompt': '拖拽图片至此或',
    'scan.dropBrowse': '浏览文件',
    'scan.dropFormats': 'JPG, PNG',
    'scan.changeImage': '更换图片',
    'scan.captureButton': '📸 拍摄',
    'scan.identifyButton': '✦ 识别建筑',
    'scan.identifyingButton': '识别中…',
    'scan.cameraError': '摄像头访问被拒绝，请改用上传方式。',

    // ── IdentifyResult ───────────────────────────────────────────
    'result.titleFound': '识别结果',
    'result.titleNotFound': '未识别',
    'result.confidenceHigh': '高置信度',
    'result.confidenceMedium': '中置信度',
    'result.confidenceLow': '低置信度',
    'result.typePalace': '🏯 宫殿',
    'result.typeResidence': '🏠 民居',
    'result.typeGovernment': '🏛 官府',
    'result.typeBridge': '🌉 桥梁',
    'result.dynastySuffix': '朝',
    'result.historicalFacts': '历史事实',
    'result.viewOnMap': '🗺 在地图上查看',
    'result.notFoundMsg': '无法识别此建筑',
    'result.retryButton': '换张照片再试',

    // ── Charts (D3) ──────────────────────────────────────────────
    'chart.bce': '公元前',
    'chart.typePalace': '皇宫 Palace',
    'chart.typeResidence': '民居 Residence',
    'chart.typeGovernment': '官府 Government',
    'chart.typeBridge': '桥梁 Bridge',
  },

  en: {
    // ── Navigation ───────────────────────────────────────────────
    'nav.map': 'Map',
    'nav.timeline': 'Timeline',
    'nav.about': 'About',
    'header.tagline': 'Atlas of Ancient Chinese Architecture',

    // ── Footer ───────────────────────────────────────────────────
    'footer.credit': '2026 4C Competition · ZhuLan · AI + Information Visualization',

    // ── MapView ──────────────────────────────────────────────────
    'map.filtersButton': 'Filters',
    'map.errorDismiss': 'Dismiss',
    'map.identifyFailed': 'Identification failed.',

    // ── TimelineView ─────────────────────────────────────────────
    'timeline.heading': 'Timeline',
    'timeline.subheading': 'structures across Chinese history',
    'timeline.sectionTimeline': 'Construction Timeline',
    'timeline.sectionDynasty': 'Count by Dynasty',

    // ── AboutView ────────────────────────────────────────────────
    'about.heading': 'About ZhuLan',
    'about.intro': "ZhuLan (筑览) is an interactive atlas of China's pre-1911 architectural heritage — palaces, residences, government offices, and bridges — visualised on a map and explored through historical timelines.",
    'about.sectionBackground': 'Background',
    'about.backgroundText': 'Created for the 19th Chinese Collegiate Computing Competition (4C) 2026, Category 6: AI + Information Visualization Design. The dataset combines hand-curated entries with data enriched from Wikidata, covering structures built before 1911.',
    'about.sectionAI': 'AI Tools Used',
    'about.aiDeepSeek': 'Research assistance, Chinese text generation, code generation',
    'about.aiTongyi': 'AI-generated structure illustrations',
    'about.aiKimi': 'Literature review, historical fact-checking, long-document analysis',
    'about.sectionTech': 'Tech Stack',
    'about.sectionData': 'Data Sources',
    'about.dataItem1': 'Wikidata SPARQL endpoint (wikidata.org)',
    'about.dataItem2': 'Palace Museum official records (故宫博物院)',
    'about.dataItem3': 'UNESCO World Heritage nomination files',
    'about.dataItem4': 'Provincial cultural heritage bureau records',
    'about.dataItem5': 'Hand-curated historical research',

    // ── FilterPanel ──────────────────────────────────────────────
    'filter.heading': 'Filters',
    'filter.typeLabel': 'Type',
    'filter.sourceLabel': 'Source',
    'filter.resetAll': 'Reset all',
    'filter.typePalace': 'Palace',
    'filter.typeResidence': 'Residence',
    'filter.typeGovernment': 'Government',
    'filter.typeBridge': 'Bridge',
    'filter.sourceCurated': 'Curated',
    'filter.sourceWikidata': 'Wikidata',

    // ── InfoPanel ────────────────────────────────────────────────
    'info.typePalace': 'Palace',
    'info.typeResidence': 'Residence',
    'info.typeGovernment': 'Government',
    'info.typeBridge': 'Bridge',
    'info.fieldArchitect': 'Architect',
    'info.fieldStyle': 'Style',
    'info.fieldFeatures': 'Key Features',
    'info.fieldMaterials': 'Materials',
    'info.fieldSources': 'Sources',
    'info.imageCredit': 'Image',
    'info.closePanel': 'Close panel',
    'info.wikipedia': 'Wikipedia →',

    // ── ScanButton ───────────────────────────────────────────────
    'scan.buttonTitle': 'ZhuLan Scan & Discover',
    'scan.buttonAriaLabel': 'Scan a structure',

    // ── CameraCapture ────────────────────────────────────────────
    'scan.modalTitle': '筑览识图',
    'scan.modalSubtitle': 'Scan & Discover',
    'scan.privacyNotice': 'Your photo will be sent to Tongyi AI (Qwen-VL) for identification. No images are stored.',
    'scan.privacyAck': 'Got it',
    'scan.tabUpload': '📁 Upload',
    'scan.tabCamera': '📷 Camera',
    'scan.dropPrompt': 'Drop image here or',
    'scan.dropBrowse': 'browse',
    'scan.dropFormats': 'JPG, PNG',
    'scan.changeImage': 'Choose a different image',
    'scan.captureButton': '📸 Capture',
    'scan.identifyButton': '✦ Identify Structure',
    'scan.identifyingButton': 'Identifying…',
    'scan.cameraError': 'Camera access denied. Please use Upload instead.',

    // ── IdentifyResult ───────────────────────────────────────────
    'result.titleFound': 'Result',
    'result.titleNotFound': 'Not Identified',
    'result.confidenceHigh': 'high confidence',
    'result.confidenceMedium': 'medium confidence',
    'result.confidenceLow': 'low confidence',
    'result.typePalace': '🏯 Palace',
    'result.typeResidence': '🏠 Residence',
    'result.typeGovernment': '🏛 Government',
    'result.typeBridge': '🌉 Bridge',
    'result.dynastySuffix': ' Dynasty',
    'result.historicalFacts': 'Historical Facts',
    'result.viewOnMap': '🗺 View on Map',
    'result.notFoundMsg': "Couldn't identify this structure",
    'result.retryButton': 'Try Another Photo',

    // ── Charts (D3) ──────────────────────────────────────────────
    'chart.bce': 'BCE',
    'chart.typePalace': '皇宫 Palace',
    'chart.typeResidence': '民居 Residence',
    'chart.typeGovernment': '官府 Government',
    'chart.typeBridge': '桥梁 Bridge',
  },
} as const

export type TranslationKey = keyof typeof translations.zh
