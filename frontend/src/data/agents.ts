import type { Agent, MyAgent, PlazaAgent, AgentStat, DepartmentUsage, DailyUsage, FileNode } from '@/types';

/** Chat agents — used in MessagesModule left panel */
export const chatAgents: Agent[] = [
  {
    id: 'plaza-1', name: '知识问答助手', icon: 'BookOpen',
    avatarGradient: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
    category: '行政类',
    description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 5678, status: 'online',
    tips: ['查询国联集团最新合规政策要求', '客户画像系统的数据标准是什么？', '业务协同平台的审批流程有哪些？'],
    responses: ['根据集团最新合规政策要求（2026年6月版），主要涉及以下方面：\n\n• 数据安全：核心业务数据分类分级管理\n• 协同审批：超50万项目需集团级联审\n• AI应用：大模型使用需通过安全评估\n• 客户画像：敏感字段需脱敏处理\n\n需要查看具体条款吗？']
  },
  {
    id: 'plaza-2', name: '公文写作助手', icon: 'FileText',
    avatarGradient: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)',
    category: '行政类',
    description: '一键生成通知、报告、请示、纪要等行政公文',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 4520, status: 'online',
    tips: ['帮我写一份关于数字化转型的工作通知', '生成一份季度经营分析报告', '起草关于员工培训的请示文件'],
    responses: ['已为您生成《关于推进数字化转型工作的通知》模板：\n\n各子公司、各部门：\n\n为深入贯彻落实集团数字化转型战略部署，加快推进太湖云AI企业智能体平台建设，现将有关事项通知如下：\n\n一、工作目标\n二、重点任务\n三、时间节点\n四、保障措施\n\n请各单位高度重视，认真落实。\n\n需要我调整内容或格式吗？']
  },
  {
    id: 'plaza-3', name: '会议智能助手', icon: 'CalendarDays',
    avatarGradient: 'linear-gradient(135deg, #7B61FF 0%, #5B3FD9 100%)',
    category: '行政类',
    description: '智能安排会议、生成议程、提取要点与待办',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 3456, status: 'online',
    tips: ['帮我安排下周的项目评审会议', '生成季度经营分析会的议程', '检查会议室A下周的可用时间'],
    responses: ['已为您安排下周三（6月25日）下午2:00-4:00 的项目评审会议：\n\n• 会议主题：业务协同平台二期项目评审\n• 参会人员：张经理、李主管、王工程师（已自动避开冲突日程）\n• 会议室：A305（已确认可用）\n• 议程：\n  1. 项目进度汇报（30分钟）\n  2. 技术方案评审（45分钟）\n  3. 风险评估与讨论（30分钟）\n  4. 下阶段计划确认（15分钟）\n\n是否需要发送会议邀请？']
  },
  {
    id: 'plaza-4', name: '人事招聘助手', icon: 'UserPlus',
    avatarGradient: 'linear-gradient(135deg, #3370FF 0%, #245BDB 100%)',
    category: '行政类',
    description: '简历智能筛选、面试安排、人才画像生成',
    permission: 'dept', creator: '人力资源部', department: '集团', callCount: 1876, status: 'online',
    tips: ['帮我筛选Java开发工程师的简历', '安排下周的技术面试', '生成一份人才画像报告'],
    responses: ['已为您完成简历智能筛选：\n\n从收到的47份简历中，筛选出8份匹配度≥85%的候选人：\n\n• 候选人A：5年Java经验，匹配度92%\n• 候选人B：3年微服务架构，匹配度88%\n• 候选人C：全栈开发，匹配度86%\n\n是否需要安排面试？']
  },
  {
    id: 'plaza-5', name: '员工培训助手', icon: 'GraduationCap',
    avatarGradient: 'linear-gradient(135deg, #00B96B 0%, #008F52 100%)',
    category: '行政类',
    description: '培训课程智能推荐、学习路径规划、考核评估',
    permission: 'group', creator: '人力资源部', department: '集团', callCount: 2345, status: 'online',
    tips: ['为新入职员工推荐培训课程', '设计Java工程师的学习路径', '生成本月培训考核报告'],
    responses: ['已为新入职员工规划学习路径：\n\n第1周：企业文化与制度培训\n第2周：岗位技能基础培训\n第3周：业务系统操作培训\n第4周：实战项目跟岗学习\n\n共计32学时，预计4周完成。\n\n需要安排培训讲师吗？']
  },
  {
    id: 'plaza-6', name: '流程审批助手', icon: 'GitBranch',
    avatarGradient: 'linear-gradient(135deg, #FFAA00 0%, #CC6600 100%)',
    category: '行政类',
    description: '智能发起审批、自动流转跟踪、催办提醒',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 8921, status: 'online',
    tips: ['帮我发起一个采购申请审批', '查看我的待审批事项', '催办一下我上周提交的出差申请'],
    responses: ['已为您发起采购申请审批流程：\n\n• 申请人：张经理\n• 申请类型：设备采购\n• 采购内容：服务器 2 台\n• 预算金额：¥45,000\n• 审批流程：部门经理 → 财务部 → 总经理\n\n当前状态：已提交，等待部门经理审批\n预计审批时间：1-2个工作日\n\n是否需要设置审批进度提醒？']
  },
  {
    id: 'plaza-7', name: '智能待办助手', icon: 'CheckSquare',
    avatarGradient: 'linear-gradient(135deg, #F54A45 0%, #D93A36 100%)',
    category: '行政类',
    description: '智能生成待办清单、优先级排序、到期提醒',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 4567, status: 'online',
    tips: ['帮我整理今天的待办事项', '设置明天上午9点的会议提醒', '查看 overdue 的任务'],
    responses: ['已为您整理今日待办清单（共5项）：\n\n🔴 高优先级：\n• 10:00 参加项目评审会议\n• 14:00 提交月度报告\n\n🟡 中优先级：\n• 16:00 审批报销单（3张待审）\n\n🟢 低优先级：\n• 回复客户邮件（2封）\n• 更新项目进度\n\n是否需要设置提醒？']
  },
  {
    id: 'plaza-8', name: '每日晨报助手', icon: 'Sunrise',
    avatarGradient: 'linear-gradient(135deg, #FFC000 0%, #FF7D00 100%)',
    category: '行政类',
    description: '自动生成每日晨报摘要、关键数据汇总、日程概览',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 3234, status: 'online',
    tips: ['生成今天的晨报', '查看昨日关键业务数据', '今天有哪些重要会议'],
    responses: ['【2026年6月24日 每日晨报】\n\n📊 昨日关键数据：\n• 系统调用量：12,470次（↑23.5%）\n• 活跃用户数：342人（↑15.2%）\n• 平均响应时间：1.8秒（↓8.3%）\n\n📅 今日日程：\n• 10:00 项目评审会（A305）\n• 14:00 月度经营分析会\n• 16:00 数字化转型推进会议\n\n⚠️ 待处理提醒：3条审批待办']
  },
  {
    id: 'plaza-9', name: '智能报销助手', icon: 'Receipt',
    avatarGradient: 'linear-gradient(135deg, #00B96B 0%, #008F52 100%)',
    category: '财务类',
    description: '智能报销填报、发票识别与合规校验',
    permission: 'group', creator: '财务部', department: '集团', callCount: 8921, status: 'online',
    tips: ['帮我识别这张发票的信息', '差旅报销需要哪些附件', '检查这张报销单是否合规'],
    responses: ['已成功识别发票信息：\n\n• 发票类型：增值税专用发票\n• 金额：¥2,450.00\n• 开票日期：2026-06-15\n• 发票代码：3200261234\n• 发票号码：00123456\n\n✅ 合规检查通过：发票信息完整、金额合理、在有效期内。\n\n是否自动生成报销单？']
  },
  {
    id: 'plaza-10', name: '合同合规助手', icon: 'Scale',
    avatarGradient: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)',
    category: '商务类',
    description: '合同条款合规审查、风险点自动识别',
    permission: 'group', creator: '法务合规部', department: '集团', callCount: 2345, status: 'online',
    tips: ['审查这份采购合同的付款条款风险', '这份合同有哪些合规问题', '生成合同审查意见书'],
    responses: ['经审查，该采购合同存在以下风险点：\n\n⚠️ 付款条款：预付款比例 50% 偏高，建议调整为 30%\n⚠️ 交付标准：验收标准模糊，建议补充量化指标\n⚠️ 违约责任：违约金比例低于行业惯例\n\n已生成修订建议书，是否发送给法务部复核？']
  },
  {
    id: 'plaza-11', name: '合同生成助手', icon: 'PenTool',
    avatarGradient: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
    category: '商务类',
    description: '根据模板和参数自动生成标准合同文本',
    permission: 'dept', creator: '法务合规部', department: '集团', callCount: 1876, status: 'online',
    tips: ['生成一份采购合同', '帮我起草技术服务合同', '根据模板生成租赁合同'],
    responses: ['已根据标准模板生成采购合同：\n\n• 合同类型：设备采购合同\n• 甲方：国联集团\n• 乙方：[待填写]\n• 合同金额：¥45,000\n• 付款方式：30%预付 + 60%到付 + 10%质保金\n• 交付周期：30个工作日\n\n合同已通过合规规则校验，是否需要导出Word文档？']
  },
  {
    id: 'plaza-12', name: '售前方案助手', icon: 'FileBarChart',
    avatarGradient: 'linear-gradient(135deg, #FF7D00 0%, #E66A00 100%)',
    category: '商务类',
    description: '快速生成专业售前技术方案与投标文档',
    permission: 'dept', creator: '市场部', department: '集团', callCount: 1567, status: 'online',
    tips: ['生成智慧园区项目的售前方案', '帮我写一份投标技术方案', '根据客户需求生成方案建议书'],
    responses: ['已为您生成《智慧园区项目售前技术方案》：\n\n一、项目背景与需求分析\n二、总体架构设计\n三、核心技术方案\n  • 物联网平台\n  • 大数据中台\n  • AI智能分析\n四、实施计划与里程碑\n五、投资估算与效益分析\n\n方案共28页，包含3张架构图。是否需要导出PDF？']
  },
  {
    id: 'plaza-13', name: '项目管理助手', icon: 'FolderKanban',
    avatarGradient: 'linear-gradient(135deg, #CC66FF 0%, #9933FF 100%)',
    category: '管控类',
    description: '项目进度跟踪、风险预警、资源调配建议',
    permission: 'group', creator: '战略投资部', department: '集团', callCount: 4567, status: 'online',
    tips: ['查看太湖云AI企业智能体项目的当前进度', '分析当前项目的风险点', '生成项目周报'],
    responses: ['《太湖云AI企业智能体平台》项目当前进度：\n\n📊 总体进度：68%（按计划推进）\n\n各阶段状态：\n• 需求分析：✅ 已完成\n• 系统设计：✅ 已完成\n• 开发实现：🔄 进行中（85%）\n• 测试上线：⏳ 待启动\n• 运营优化：⏳ 待启动\n\n⚠️ 风险预警：\n1. 开发阶段人力资源紧张（建议协调2名后端工程师）\n2. 第三方接口联调延迟3天\n\n是否需要生成详细的项目周报？']
  },
  {
    id: 'plaza-14', name: '安全生产助手', icon: 'Shield',
    avatarGradient: 'linear-gradient(135deg, #F54A45 0%, #D93A36 100%)',
    category: '管控类',
    description: '安全隐患识别、事故预案生成、合规检查报告',
    permission: 'group', creator: '安全生产部', department: '集团', callCount: 3456, status: 'online',
    tips: ['检查本周安全隐患', '生成安全事故应急预案', '编制安全生产合规检查报告'],
    responses: ['本周安全隐患检查结果：\n\n🔴 高风险（1项）：\n• B栋配电房温度异常（38.2℃）\n\n🟡 中风险（2项）：\n• 消防通道临时堆放杂物\n• C区监控摄像头离线\n\n🟢 低风险（3项）：\n• 办公区插座老化（已标记更换）\n\n已生成整改通知单，是否需要下发责任人？']
  },
  {
    id: 'plaza-15', name: '物业语音助手', icon: 'Home',
    avatarGradient: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '运营类',
    description: '语音交互式物业服务，报修、查询、预约一站式解决',
    permission: 'group', creator: '国联物业', department: '集团', callCount: 5678, status: 'online',
    tips: ['我要报修办公室空调', '查询本月物业费', '预约明天的会议室'],
    responses: ['已为您记录空调报修工单：\n\n• 工单编号：WX-20260624-001\n• 报修类型：空调制冷异常\n• 报修位置：A栋1205办公室\n• 紧急程度：一般\n• 预计上门：今日14:00-16:00\n\n维修师傅会提前电话确认，请保持手机畅通。\n\n是否需要查看报修进度？']
  },
  {
    id: 'plaza-16', name: '智能膳食助手', icon: 'UtensilsCrossed',
    avatarGradient: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
    category: '运营类',
    description: '智能推荐营养餐谱、食堂菜品管理、用餐数据分析',
    permission: 'group', creator: '后勤保障部', department: '集团', callCount: 3456, status: 'online',
    tips: ['今天食堂有什么菜', '推荐一份低热量的午餐', '查看本周食堂菜单'],
    responses: ['【今日午餐推荐】\n\n🥗 健康轻食套餐（推荐）：\n• 香煎鸡胸肉 + 藜麦饭 + 时蔬沙拉\n• 热量：485kcal | 蛋白质：38g\n\n🍜 其他选择：\n• 红烧牛肉面（较重口味）\n• 素食套餐（全素）\n• 商务套餐（两荤两素）\n\n供应时间：11:30-13:00\n地点：A栋3楼员工餐厅\n\n是否需要提前预订？']
  },
  {
    id: 'plaza-17', name: 'IT运维助手', icon: 'MonitorCog',
    avatarGradient: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
    category: '运营类',
    description: '故障智能诊断、运维自动化、监控告警分析',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 3456, status: 'online',
    tips: ['服务器CPU使用率过高怎么办', '帮我诊断网络连接问题', '查看今天的系统告警'],
    responses: ['已诊断服务器CPU异常：\n\n⚠️ 告警信息：\n• 服务器：SVR-APP-03\n• CPU使用率：92%（持续15分钟）\n• 内存使用率：78%\n\n🔧 诊断结果：\n• 根因：Java进程内存泄漏\n• 建议：重启Tomcat服务 + 清理日志\n• 预计恢复时间：5分钟\n\n是否执行自动修复？']
  },
  {
    id: 'plaza-18', name: '积水识别助手', icon: 'ScanEye',
    avatarGradient: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
    category: '市政类',
    description: '基于AI视觉的积水智能识别与预警系统',
    permission: 'group', creator: '安全生产部', department: '集团', callCount: 2345, status: 'online',
    tips: ['查看实时积水监测数据', '设置积水预警阈值', '分析历史积水分布'],
    responses: ['实时积水监测报告：\n\n🌧️ 当前天气：中雨（降雨量15mm/h）\n\n📍 监测点位状态：\n• 中山路隧道：正常（水位2cm）\n• 人民路下穿：⚠️ 轻度积水（水位8cm）\n• 建设大道：正常（水位1cm）\n\n已自动向市政部门发送预警通知。\n\n是否需要查看历史积水数据分析？']
  },
  {
    id: 'plaza-19', name: '设备维护助手', icon: 'Wrench',
    avatarGradient: 'linear-gradient(135deg, #8F959E 0%, #646A73 100%)',
    category: '市政类',
    description: '设备状态监测、维护计划生成、故障预测',
    permission: 'group', creator: '安全生产部', department: '集团', callCount: 1876, status: 'online',
    tips: ['查看设备运行状态', '生成本月维护计划', '预测设备故障风险'],
    responses: ['【设备维护计划】\n\n本月待维护设备清单（共12台）：\n\n🔴 紧急维护（2台）：\n• 冷却塔CT-03：轴承温度偏高\n• 空压机AC-01：油压异常\n\n🟡 常规保养（6台）：\n• 服务器集群月度巡检\n• UPS电源电池检测\n\n🟢 预防性维护（4台）：\n• 空调系统清洗\n• 消防设备检测\n\n是否生成维护工单？']
  },
  {
    id: 'plaza-20', name: '前台问数助手', icon: 'TrendingUp',
    avatarGradient: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '金融类',
    description: '实时业务数据查询、经营指标看板、趋势分析',
    permission: 'group', creator: '财务管理部', department: '集团', callCount: 4567, status: 'online',
    tips: ['查询本月营收数据', '查看各子公司利润排名', '分析季度财务趋势'],
    responses: ['【本月经营数据概览】\n\n📊 关键指标：\n• 营业收入：12.5亿元（↑14% YoY）\n• 净利润：1.85亿元（↑15% YoY）\n• 新签合同额：15.8亿元\n\n🏆 子公司营收排名：\n1. 太湖云：4.5亿元（+30%）\n2. 国联物业：3.2亿元（+8%）\n3. 国联科技：2.8亿元（+12%）\n\n是否需要导出详细财务报表？']
  },
  {
    id: 'plaza-21', name: '后台问数助手', icon: 'Database',
    avatarGradient: 'linear-gradient(135deg, #722ED1 0%, #5319A8 100%)',
    category: '金融类',
    description: '财务数据深度分析、资产负债管理、投资回报测算',
    permission: 'dept', creator: '财务管理部', department: '集团', callCount: 2345, status: 'online',
    tips: ['分析资产负债结构', '测算项目投资回报率', '生成财务风险预警报告'],
    responses: ['【资产负债分析】\n\n📈 资产结构（截至2026年5月）：\n• 总资产：312亿元（↑8%）\n• 流动资产：156亿元（50%）\n• 非流动资产：156亿元（50%）\n\n📉 负债结构：\n• 总负债：168亿元\n• 资产负债率：53.8%（行业均值62%，处于安全区间）\n• 流动比率：1.28（健康）\n\n⚠️ 关注事项：\n• 短期借款占比偏高，建议优化债务结构\n\n是否需要生成详细分析报告？']
  },
  {
    id: 'plaza-22', name: '在线客服助手', icon: 'Headphones',
    avatarGradient: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '客服类',
    description: '7x24小时智能客服，自动回答常见咨询',
    permission: 'group', creator: '客户服务部', department: '集团', callCount: 12345, status: 'online',
    tips: ['如何申请办公用品', '集团的年假政策是什么', '报修流程怎么走'],
    responses: ['您好！关于办公用品申请流程：\n\n1. 登录 OA 系统 → 行政服务 → 办公用品申领\n2. 选择所需物品及数量\n3. 填写领用事由\n4. 提交部门负责人审批\n5. 审批通过后至行政处领取\n\n一般审批时长：1-2个工作日\n\n如有其他问题，欢迎继续咨询！']
  },
  {
    id: 'plaza-23', name: 'PPT生成助手', icon: 'Presentation',
    avatarGradient: 'linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%)',
    category: '行政类',
    description: '智能生成工作汇报、方案展示、培训课件等专业PPT',
    permission: 'group', creator: '数字化部', department: '集团', callCount: 3876, status: 'online',
    tips: ['帮我生成一份数字化转型汇报PPT', '制作新员工培训课件', '生成项目总结演示文稿'],
    responses: ['已为您生成《数字化转型工作汇报》PPT框架：\n\n📑 共18页，包含以下结构：\n\n第1页：封面（标题+副标题+汇报人+日期）\n第2页：目录页\n第3-5页：项目背景与目标\n第6-10页：实施进展与成果\n  • 已完成：系统集成、数据迁移\n  • 进行中：AI模型训练、界面优化\n第11-14页：数据展示与对比分析\n第15-16页：问题与挑战\n第17页：下一步计划\n第18页：感谢页\n\n是否需要调整风格或补充内容？']
  }
];

export const myAgents: MyAgent[] = [
  {
    id: 'my-data',
    name: '数据分析助手',
    icon: 'BarChart3',
    iconBg: 'linear-gradient(135deg, #00CCAA 0%, #006666 100%)',
    description: '自动分析业务数据，生成可视化报表',
    permission: 'group',
    creator: '张经理',
    department: '数字化部',
    createdAt: '2026-05-20',
    callCount: 1247
  },
  {
    id: 'my-official',
    name: '公文写作助手',
    icon: 'FileText',
    iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)',
    description: '数字化部专用，支持各类行政公文生成',
    permission: 'dept',
    creator: '张经理',
    department: '数字化部',
    createdAt: '2026-06-01',
    callCount: 856
  },
  {
    id: 'my-code',
    name: '代码审查助手',
    icon: 'Code2',
    iconBg: 'linear-gradient(135deg, #CC66FF 0%, #6600CC 100%)',
    description: 'Java 代码规范检查与优化建议',
    permission: 'personal',
    creator: '张经理',
    department: '数字化部',
    createdAt: '2026-06-10',
    callCount: 423
  },
  {
    id: 'my-synergy',
    name: '业务协同洞察',
    icon: 'GitBranch',
    iconBg: 'linear-gradient(135deg, #FFAA00 0%, #CC6600 100%)',
    description: '自动识别客户潜在协同需求并主动推送',
    permission: 'group',
    creator: '张经理',
    department: '数字化部',
    createdAt: '2026-06-08',
    callCount: 678
  }
];

export const plazaAgents: PlazaAgent[] = [
  {
    id: 'plaza-1',
    name: '知识问答助手',
    icon: 'BookOpen',
    iconBg: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
    category: '行政类',
    description: '基于企业知识库的智能问答，支持多轮对话与文档溯源',
    fullDescription: '知识问答助手已接入集团全量知识库，涵盖制度规范、业务手册、技术文档等。支持多轮对话与文档溯源，准确率高达95%以上。',
    tags: ['知识库', '问答', 'AI'],
    useCount: 5678,
    creator: '数字化部',
    department: '集团',
    rating: 4.8,
    reviewCount: 423,
    capabilities: ['多轮智能对话', '文档精准溯源', '知识自动更新', '多格式支持'],
    permission: 'group'
  },
  {
    id: 'plaza-2',
    name: '公文写作助手',
    icon: 'FileText',
    iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)',
    category: '行政类',
    description: '一键生成通知、报告、请示、纪要等行政公文',
    fullDescription: '公文写作助手内置丰富的公文模板库，覆盖通知、报告、请示、纪要、函件等全部行政文体。支持智能排版、格式自动校验和文风优化。',
    tags: ['公文', '写作', '办公'],
    useCount: 4520,
    creator: '数字化部',
    department: '集团',
    rating: 4.7,
    reviewCount: 312,
    capabilities: ['通知自动生成', '报告智能编排', '请示格式校验', '纪要模板匹配', '公文规范审核'],
    permission: 'group'
  },
  {
    id: 'plaza-3',
    name: '会议智能助手',
    icon: 'CalendarDays',
    iconBg: 'linear-gradient(135deg, #7B61FF 0%, #5B3FD9 100%)',
    category: '行政类',
    description: '智能安排会议、生成议程、提取要点与待办',
    fullDescription: '会议智能助手覆盖会议全生命周期管理，支持会议智能排期、自动冲突检测、议程模板生成、纪要要点提取及待办事项追踪。无缝对接集团日历系统，让会议效率提升50%以上。',
    tags: ['会议', '排期', '纪要'],
    useCount: 3456,
    creator: '数字化部',
    department: '集团',
    rating: 4.7,
    reviewCount: 289,
    capabilities: ['智能排期', '议程自动生成', '纪要要点提取', '待办自动追踪', '会议室预定'],
    permission: 'group'
  },
  {
    id: 'plaza-4',
    name: '人事招聘助手',
    icon: 'UserPlus',
    iconBg: 'linear-gradient(135deg, #3370FF 0%, #245BDB 100%)',
    category: '行政类',
    description: '简历智能筛选、面试安排、人才画像生成',
    fullDescription: '人事招聘助手基于AI大模型技术，实现简历智能解析与岗位匹配、面试流程自动化管理、人才画像自动生成。支持多维度人才评估与推荐，帮助HR高效完成招聘工作。',
    tags: ['招聘', '人事', '简历'],
    useCount: 1876,
    creator: '人力资源部',
    department: '集团',
    rating: 4.6,
    reviewCount: 156,
    capabilities: ['简历智能筛选', '岗位匹配评分', '面试自动安排', '人才画像生成', '招聘数据分析'],
    permission: 'dept'
  },
  {
    id: 'plaza-5',
    name: '员工培训助手',
    icon: 'GraduationCap',
    iconBg: 'linear-gradient(135deg, #00B96B 0%, #008F52 100%)',
    category: '行政类',
    description: '培训课程智能推荐、学习路径规划、考核评估',
    fullDescription: '员工培训助手根据岗位能力模型和员工发展需求，智能推荐培训课程、规划学习路径、跟踪学习进度。支持在线考试与能力评估，帮助员工快速成长。',
    tags: ['培训', '学习', '考核'],
    useCount: 2345,
    creator: '人力资源部',
    department: '集团',
    rating: 4.5,
    reviewCount: 198,
    capabilities: ['课程智能推荐', '学习路径规划', '进度自动跟踪', '在线考核评估', '能力差距分析'],
    permission: 'group'
  },
  {
    id: 'plaza-6',
    name: '流程审批助手',
    icon: 'ClipboardCheck',
    iconBg: 'linear-gradient(135deg, #FFAA00 0%, #CC8800 100%)',
    category: '行政类',
    description: '智能发起审批、自动流转跟踪、催办提醒',
    fullDescription: '流程审批助手覆盖集团全部审批场景，支持智能表单填写、流程自动路由、多级审批跟踪和逾期催办。对接OA系统实现一键提交和全程可视化追踪。',
    tags: ['审批', '流程', 'OA'],
    useCount: 8921,
    creator: '数字化部',
    department: '集团',
    rating: 4.8,
    reviewCount: 567,
    capabilities: ['智能表单填写', '流程自动路由', '多级审批跟踪', '逾期自动催办', '审批数据分析'],
    permission: 'group'
  },
  {
    id: 'plaza-7',
    name: '智能待办助手',
    icon: 'ListTodo',
    iconBg: 'linear-gradient(135deg, #FF69B4 0%, #CC188B 100%)',
    category: '行政类',
    description: '智能生成待办清单、优先级排序、到期提醒',
    fullDescription: '智能待办助手基于AI大模型技术，自动分析邮件、消息、会议等场景中的待办事项，智能生成待办清单并按优先级排序。支持到期提醒和进度跟踪，让工作更高效有序。',
    tags: ['待办', '任务', '效率'],
    useCount: 4567,
    creator: '数字化部',
    department: '集团',
    rating: 4.7,
    reviewCount: 289,
    capabilities: ['待办自动提取', '优先级智能排序', '到期提醒', '进度跟踪', '多源汇聚'],
    permission: 'group'
  },
  {
    id: 'plaza-8',
    name: '每日晨报助手',
    icon: 'Sunrise',
    iconBg: 'linear-gradient(135deg, #FFC000 0%, #FF7D00 100%)',
    category: '行政类',
    description: '自动生成每日晨报摘要、关键数据汇总、日程概览',
    fullDescription: '每日晨报助手每天自动生成晨报摘要，涵盖关键业务数据汇总、今日日程概览、待办提醒、重要通知等内容。支持自定义信息源和推送时间，让每一天的工作从容开始。',
    tags: ['晨报', '日报', '摘要'],
    useCount: 3234,
    creator: '数字化部',
    department: '集团',
    rating: 4.6,
    reviewCount: 234,
    capabilities: ['晨报自动生成', '数据智能汇总', '日程概览', '待办提醒', '信息源自定义'],
    permission: 'group'
  },
  {
    id: 'plaza-9',
    name: '智能报销助手',
    icon: 'Receipt',
    iconBg: 'linear-gradient(135deg, #00B96B 0%, #008F52 100%)',
    category: '财务类',
    description: '智能报销填报、发票识别与合规校验',
    fullDescription: '智能报销助手支持发票自动识别、报销单智能填报、合规规则自动校验。对接财务系统实现一键提交，大幅提升报销效率，降低退单率。',
    tags: ['报销', '发票', '财务'],
    useCount: 8921,
    creator: '财务部',
    department: '集团',
    rating: 4.9,
    reviewCount: 567,
    capabilities: ['发票自动识别', '报销单智能填报', '合规规则校验', '一键提交审批', '报销进度追踪'],
    permission: 'group'
  },
  {
    id: 'plaza-10',
    name: '合同合规助手',
    icon: 'Scale',
    iconBg: 'linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)',
    category: '商务类',
    description: '合同条款合规审查、风险点自动识别',
    fullDescription: '合同合规助手能够自动审查合同条款，识别合规风险点，并生成专业的审查意见书。支持多维度风险评估和法规自动匹配，确保合同合规安全。',
    tags: ['合同', '合规', '法务'],
    useCount: 2345,
    creator: '法务合规部',
    department: '集团',
    rating: 4.9,
    reviewCount: 178,
    capabilities: ['合同条款审查', '风险自动识别', '法规智能匹配', '审查意见生成', '历史合同对比'],
    permission: 'group'
  },
  {
    id: 'plaza-11',
    name: '合同生成助手',
    icon: 'PenTool',
    iconBg: 'linear-gradient(135deg, #00E5FF 0%, #0099CC 100%)',
    category: '商务类',
    description: '根据模板和参数自动生成标准合同文本',
    fullDescription: '合同生成助手内置多种标准合同模板，支持根据业务参数智能填充生成完整合同文本。覆盖采购、销售、服务、租赁等常见合同类型。',
    tags: ['合同', '生成', '模板'],
    useCount: 1876,
    creator: '法务合规部',
    department: '集团',
    rating: 4.7,
    reviewCount: 156,
    capabilities: ['模板智能匹配', '参数自动填充', '条款智能推荐', '格式自动排版', '多方协同编辑'],
    permission: 'dept'
  },
  {
    id: 'plaza-12',
    name: '售前方案助手',
    icon: 'FileBarChart',
    iconBg: 'linear-gradient(135deg, #FF7D00 0%, #E66A00 100%)',
    category: '商务类',
    description: '快速生成专业售前技术方案与投标文档',
    fullDescription: '售前方案助手能够根据客户需求快速生成专业的售前技术方案、投标文档和项目建议书。内置丰富的行业模板库，支持方案智能排版与内容优化。',
    tags: ['售前', '方案', '投标'],
    useCount: 1567,
    creator: '市场部',
    department: '集团',
    rating: 4.8,
    reviewCount: 134,
    capabilities: ['方案智能生成', '模板库匹配', '技术架构图生成', '投标文档编制', '方案对比分析'],
    permission: 'dept'
  },
  {
    id: 'plaza-13',
    name: '项目管理助手',
    icon: 'FolderKanban',
    iconBg: 'linear-gradient(135deg, #CC66FF 0%, #9933FF 100%)',
    category: '管控类',
    description: '项目进度跟踪、风险预警、资源调配建议',
    fullDescription: '项目管理助手帮助项目经理高效管理项目全生命周期，支持进度自动跟踪、风险智能预警、资源优化调配、甘特图自动生成等功能。',
    tags: ['项目管理', '进度', '风险'],
    useCount: 4567,
    creator: '战略投资部',
    department: '集团',
    rating: 4.7,
    reviewCount: 312,
    capabilities: ['进度自动跟踪', '风险智能预警', '资源优化调配', '甘特图生成', '项目报告自动生成'],
    permission: 'group'
  },
  {
    id: 'plaza-14',
    name: '安全生产助手',
    icon: 'Shield',
    iconBg: 'linear-gradient(135deg, #F54A45 0%, #D93A36 100%)',
    category: '管控类',
    description: '安全隐患识别、事故预案生成、合规检查报告',
    fullDescription: '安全生产助手基于AI和物联网数据，实现安全隐患智能识别、事故应急预案自动生成、安全合规检查报告编制。支持多维度安全态势分析和预警分级推送。',
    tags: ['安全', '生产', '合规'],
    useCount: 3456,
    creator: '安全生产部',
    department: '集团',
    rating: 4.8,
    reviewCount: 267,
    capabilities: ['隐患智能识别', '应急预案生成', '合规检查报告', '安全态势分析', '预警分级推送'],
    permission: 'group'
  },
  {
    id: 'plaza-15',
    name: '物业语音助手',
    icon: 'Home',
    iconBg: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '运营类',
    description: '语音交互式物业服务，报修、查询、预约一站式解决',
    fullDescription: '物业语音助手支持语音交互方式处理各类物业服务需求，包括设备报修、费用查询、服务预约、投诉建议等。对接物业管理系统，实现一站式语音服务。',
    tags: ['物业', '语音', '服务'],
    useCount: 5678,
    creator: '国联物业',
    department: '集团',
    rating: 4.6,
    reviewCount: 234,
    capabilities: ['语音报修', '费用查询', '服务预约', '投诉建议', '工单跟踪'],
    permission: 'group'
  },
  {
    id: 'plaza-16',
    name: '智能膳食助手',
    icon: 'UtensilsCrossed',
    iconBg: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
    category: '运营类',
    description: '智能推荐营养餐谱、食堂菜品管理、用餐数据分析',
    fullDescription: '智能膳食助手根据员工健康档案和饮食偏好，智能推荐营养餐谱。支持食堂菜品管理、用餐数据统计分析、食材采购建议等功能，让每一餐都健康美味。',
    tags: ['膳食', '餐饮', '健康'],
    useCount: 3456,
    creator: '后勤保障部',
    department: '集团',
    rating: 4.5,
    reviewCount: 198,
    capabilities: ['餐谱智能推荐', '营养分析', '菜品管理', '用餐数据分析', '食材采购建议'],
    permission: 'group'
  },
  {
    id: 'plaza-17',
    name: 'IT运维助手',
    icon: 'MonitorCog',
    iconBg: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
    category: '运营类',
    description: '故障智能诊断、运维自动化、监控告警分析',
    fullDescription: 'IT运维助手基于AIOps技术，实现故障智能诊断与定位、运维脚本自动化执行、监控告警智能分析。支持多系统联动，大幅提升IT运维效率。',
    tags: ['运维', 'IT', '监控'],
    useCount: 3456,
    creator: '数字化部',
    department: '集团',
    rating: 4.8,
    reviewCount: 267,
    capabilities: ['故障智能诊断', '自动化运维', '告警智能分析', '性能趋势预测', '知识库自动匹配'],
    permission: 'group'
  },
  {
    id: 'plaza-18',
    name: '积水识别助手',
    icon: 'ScanEye',
    iconBg: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
    category: '市政类',
    description: '基于AI视觉的积水智能识别与预警系统',
    fullDescription: '积水识别助手利用计算机视觉技术，实时监测道路、隧道、桥下等易积水区域的积水情况。支持水位自动检测、预警分级推送、历史数据分析等功能，为城市防汛决策提供智能支撑。',
    tags: ['积水监测', 'AI视觉', '防汛预警'],
    useCount: 2345,
    creator: '安全生产部',
    department: '集团',
    rating: 4.9,
    reviewCount: 178,
    capabilities: ['实时积水检测', '预警分级推送', '水位趋势分析', '历史数据回溯', '多点位同时监控'],
    permission: 'group'
  },
  {
    id: 'plaza-19',
    name: '设备维护助手',
    icon: 'Wrench',
    iconBg: 'linear-gradient(135deg, #8F959E 0%, #646A73 100%)',
    category: '市政类',
    description: '设备状态监测、维护计划生成、故障预测',
    fullDescription: '设备维护助手基于IoT传感器数据和AI预测模型，实现设备状态实时监测、智能维护计划自动生成、故障提前预测。支持多类型设备管理和全生命周期维护跟踪。',
    tags: ['设备', '维护', '预测'],
    useCount: 1876,
    creator: '安全生产部',
    department: '集团',
    rating: 4.7,
    reviewCount: 156,
    capabilities: ['状态实时监测', '维护计划生成', '故障提前预测', '备件库存管理', '维修知识库'],
    permission: 'group'
  },
  {
    id: 'plaza-20',
    name: '前台问数助手',
    icon: 'TrendingUp',
    iconBg: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '金融类',
    description: '实时业务数据查询、经营指标看板、趋势分析',
    fullDescription: '前台问数助手面向管理层和业务人员，提供实时业务数据查询、经营指标看板、趋势分析等功能。支持自然语言查询，让数据驱动决策更简单高效。',
    tags: ['数据查询', '经营分析', '看板'],
    useCount: 4567,
    creator: '财务管理部',
    department: '集团',
    rating: 4.8,
    reviewCount: 234,
    capabilities: ['自然语言查询', '经营指标看板', '趋势智能分析', '多维度对比', '数据导出'],
    permission: 'group'
  },
  {
    id: 'plaza-21',
    name: '后台问数助手',
    icon: 'Database',
    iconBg: 'linear-gradient(135deg, #722ED1 0%, #5319A8 100%)',
    category: '金融类',
    description: '财务数据深度分析、资产负债管理、投资回报测算',
    fullDescription: '后台问数助手面向财务专业人员，提供财务数据深度分析、资产负债结构优化、投资回报测算等功能。支持复杂财务模型计算和风险预警分析。',
    tags: ['财务分析', '资产负债', '投资'],
    useCount: 2345,
    creator: '财务管理部',
    department: '集团',
    rating: 4.7,
    reviewCount: 156,
    capabilities: ['财务深度分析', '资产负债管理', '投资回报测算', '风险预警分析', '财务模型计算'],
    permission: 'dept'
  },
  {
    id: 'plaza-22',
    name: '在线客服助手',
    icon: 'Headphones',
    iconBg: 'linear-gradient(135deg, #00CCAA 0%, #00997A 100%)',
    category: '客服类',
    description: '7x24小时智能客服，自动回答常见咨询',
    fullDescription: '在线客服助手提供全天候智能客服服务，支持多渠道接入、意图识别、多轮对话、工单自动创建。覆盖常见问题自动回答，复杂问题智能转人工。',
    tags: ['客服', '在线咨询', '工单'],
    useCount: 12345,
    creator: '客户服务部',
    department: '集团',
    rating: 4.6,
    reviewCount: 456,
    capabilities: ['多渠道接入', '意图智能识别', '多轮对话', '工单自动创建', '服务质量分析'],
    permission: 'group'
  },
  {
    id: 'plaza-23',
    name: 'PPT生成助手',
    icon: 'Presentation',
    iconBg: 'linear-gradient(135deg, #FF4D4F 0%, #CF1322 100%)',
    category: '行政类',
    description: '智能生成工作汇报、方案展示、培训课件等专业PPT',
    fullDescription: 'PPT生成助手基于AI大模型技术，根据用户提供的内容要点智能生成专业级演示文稿。内置多种行业模板，支持自动排版、图表生成、配色优化，让PPT制作效率提升10倍。',
    tags: ['PPT', '演示', '办公'],
    useCount: 3876,
    creator: '数字化部',
    department: '集团',
    rating: 4.8,
    reviewCount: 234,
    capabilities: ['模板智能匹配', '内容自动排版', '图表自动生成', '配色风格优化', '多格式导出'],
    permission: 'group'
  }
];

export const agentStats: AgentStat = {
  totalCalls: 12470,
  callTrend: 23.5,
  activeUsers: 342,
  userTrend: 15.2,
  avgResponseTime: 1.8,
  responseTrend: -8.3,
  satisfactionScore: 4.7,
  satisfactionTrend: 5.1
};

export const departmentUsage: DepartmentUsage[] = [
  { rank: 1, name: '数字化部', color: '#00E5FF', callCount: 4234, percentage: 100 },
  { rank: 2, name: '财务部', color: '#00FF88', callCount: 3156, percentage: 74.5 },
  { rank: 3, name: '人力资源部', color: '#FFAA00', callCount: 2341, percentage: 55.3 },
  { rank: 4, name: '法务合规部', color: '#CC66FF', callCount: 1876, percentage: 44.3 },
  { rank: 5, name: '安全生产部', color: '#FF6B6B', callCount: 1567, percentage: 37.0 }
];

export const dailyUsage: DailyUsage[] = [
  { date: '6/10', calls: 1234, users: 156, avgTime: 2.1, successRate: 96.5 },
  { date: '6/11', calls: 1567, users: 189, avgTime: 1.9, successRate: 97.2 },
  { date: '6/12', calls: 1876, users: 212, avgTime: 1.8, successRate: 97.8 },
  { date: '6/13', calls: 2134, users: 234, avgTime: 1.7, successRate: 98.1 },
  { date: '6/14', calls: 2345, users: 256, avgTime: 1.7, successRate: 98.3 },
  { date: '6/15', calls: 1656, users: 198, avgTime: 1.8, successRate: 97.6 },
  { date: '6/16', calls: 1658, users: 201, avgTime: 1.8, successRate: 97.9 }
];

/** Scene categories for classification */
export const sceneCategories = [
  '全部', '行政类', '财务类', '商务类', '管控类', '运营类', '市政类', '金融类', '客服类'
];

/** SOE four-level org tree: Group > Governance > Departments > Units */
export const knowledgeOrgTree = [
  {
    id: 'gl-group',
    name: '国联集团',
    level: 1 as const,
    children: [
      {
        id: 'level-zhili',
        name: '治理层（决策与监督核心）',
        level: 2 as const,
        children: [
          {
            id: 'dangwei',
            name: '党委（党组）',
            level: 3 as const,
            children: [
              { id: 'dw-changwei', name: '党委常委会', level: 4 as const },
              { id: 'dw-quanwei', name: '党委全委会', level: 4 as const },
              { id: 'dw-dangjian', name: '党建工作领导小组', level: 4 as const },
            ]
          },
          {
            id: 'dongshihui',
            name: '董事会',
            level: 3 as const,
            children: [
              { id: 'ds-dongshizhang', name: '董事长办公室', level: 4 as const },
              { id: 'ds-neibu', name: '内部董事（总经理、职工董事）', level: 4 as const },
              { id: 'ds-waibu', name: '外部董事（占多数）', level: 4 as const },
            ]
          },
          {
            id: 'jianshihui',
            name: '监事会/审计委员会',
            level: 3 as const,
            children: [
              { id: 'js-jianshizhang', name: '监事长/主席', level: 4 as const },
              { id: 'js-zhigong', name: '职工监事', level: 4 as const },
              { id: 'js-waibu', name: '外部监事', level: 4 as const },
            ]
          },
          {
            id: 'jingli',
            name: '经理层（经营班子）',
            level: 3 as const,
            children: [
              { id: 'jl-zongjingli', name: '总经理（党委副书记）', level: 4 as const },
              { id: 'jl-fuzong', name: '副总经理（若干）', level: 4 as const },
              { id: 'jl-caiwu', name: '总会计师/财务总监', level: 4 as const },
              { id: 'jl-falv', name: '总法律顾问', level: 4 as const },
              { id: 'jl-mishu', name: '董事会秘书', level: 4 as const },
            ]
          }
        ]
      },
      {
        id: 'level-zongbu',
        name: '总部职能部门（管理与支撑中枢）',
        level: 2 as const,
        children: [
          {
            id: 'zb-xingzheng',
            name: '综合行政类',
            level: 3 as const,
            children: [
              { id: 'xz-bangongshi', name: '办公室/综合管理部', level: 4 as const },
              { id: 'xz-dongban', name: '董事会办公室/改革办', level: 4 as const },
              { id: 'xz-xinfang', name: '信访办公室', level: 4 as const },
            ]
          },
          {
            id: 'zb-dangjian',
            name: '党建人事类',
            level: 3 as const,
            children: [
              { id: 'dj-zuzhi', name: '党委组织部/人力资源部', level: 4 as const },
              { id: 'dj-xuanchuan', name: '党委宣传部/企业文化部', level: 4 as const },
              { id: 'dj-dangqun', name: '党群工作部（工会、团委、统战）', level: 4 as const },
              { id: 'dj-laoganbu', name: '老干部工作部', level: 4 as const },
            ]
          },
          {
            id: 'zb-zhanlue',
            name: '战略投资类',
            level: 3 as const,
            children: [
              { id: 'zl-guihua', name: '战略规划部/发展部', level: 4 as const },
              { id: 'zl-touzi', name: '投资管理部/资本运营部', level: 4 as const },
              { id: 'zl-qiye', name: '企业管理部/改革部', level: 4 as const },
            ]
          },
          {
            id: 'zb-caiwu',
            name: '财务资产类',
            level: 3 as const,
            children: [
              { id: 'cw-guanli', name: '财务管理部', level: 4 as const },
              { id: 'cw-ziben', name: '资本运营部/金融管理部', level: 4 as const },
              { id: 'cw-zichan', name: '资产管理部', level: 4 as const },
            ]
          },
          {
            id: 'zb-yunying',
            name: '运营生产类',
            level: 3 as const,
            children: [
              { id: 'yy-yunying', name: '运营管理部/生产调度部', level: 4 as const },
              { id: 'yy-anquan', name: '安全环保部（HSE）', level: 4 as const },
              { id: 'yy-zhiliang', name: '质量技术部/科技部', level: 4 as const },
              { id: 'yy-gongcheng', name: '工程建设部/项目管理部', level: 4 as const },
            ]
          },
          {
            id: 'zb-fengkong',
            name: '风控监督类',
            level: 3 as const,
            children: [
              { id: 'fk-shenji', name: '审计部（内部审计）', level: 4 as const },
              { id: 'fk-jijian', name: '纪检监察室/巡视办', level: 4 as const },
              { id: 'fk-falv', name: '法律合规部/风控部', level: 4 as const },
              { id: 'fk-jianshi', name: '监事会办公室', level: 4 as const },
            ]
          },
          {
            id: 'zb-shuzihua',
            name: '数字化与保障类',
            level: 3 as const,
            children: [
              { id: 'sz-xinxihua', name: '信息化部/数字化部', level: 4 as const },
              { id: 'sz-caigou', name: '采购管理部/供应链管理部', level: 4 as const },
              { id: 'sz-houqin', name: '后勤保障部/行政事务中心', level: 4 as const },
            ]
          }
        ]
      },
      {
        id: 'level-yewu',
        name: '业务执行层（产业与区域布局）',
        level: 2 as const,
        children: [
          {
            id: 'yw-erji',
            name: '二级子公司（产业板块）',
            level: 3 as const,
            children: [
              {
                id: 'yw-shuju',
                name: '数据集团',
                level: 4 as const,
                children: [
                  { id: 'th-xingzheng', name: '太湖云-行政部', level: 4 as const },
                  { id: 'th-caiwu', name: '太湖云-财务部', level: 4 as const },
                  { id: 'th-jishu', name: '太湖云-技术部', level: 4 as const },
                  { id: 'th-yunying', name: '太湖云-运营部', level: 4 as const },
                  { id: 'gk-rd', name: '国联科技-研发中心', level: 4 as const },
                  { id: 'gk-product', name: '国联科技-产品部', level: 4 as const },
                  { id: 'gk-market', name: '国联科技-市场部', level: 4 as const },
                  { id: 'gk-qa', name: '国联科技-测试部', level: 4 as const },
                  { id: 'wy-zonghe', name: '国联物业-综合管理部', level: 4 as const },
                  { id: 'wy-yunying', name: '国联物业-运营管理部', level: 4 as const },
                  { id: 'wy-kefu', name: '国联物业-客户服务部', level: 4 as const },
                ]
              },
              {
                id: 'yw-touzi',
                name: '国联投资',
                level: 4 as const,
                children: [
                  { id: 'tz-bangongshi', name: '投资办公室', level: 4 as const },
                  { id: 'tz-yanjiu', name: '投资研究部', level: 4 as const },
                  { id: 'tz-fengkong', name: '风控合规部', level: 4 as const },
                  { id: 'tz-touhou', name: '投后管理部', level: 4 as const },
                ]
              }
            ]
          },
          {
            id: 'yw-quyu',
            name: '区域分公司/事业部',
            level: 3 as const,
            children: [
              { id: 'qy-huabei', name: '华北区域公司', level: 4 as const },
              { id: 'qy-huadong', name: '华东区域公司', level: 4 as const },
              { id: 'qy-huanan', name: '华南区域公司', level: 4 as const },
              { id: 'qy-xinan', name: '西南区域公司', level: 4 as const },
            ]
          },
          {
            id: 'yw-zhishu',
            name: '直属单位/专业机构',
            level: 3 as const,
            children: [
              { id: 'zs-yanjiuyuan', name: '研究院/技术中心', level: 4 as const },
              { id: 'zs-shejiyuan', name: '设计院/咨询公司', level: 4 as const },
              { id: 'zs-peixun', name: '培训中心/党校', level: 4 as const },
              { id: 'zs-xinxi', name: '信息中心/数据中心', level: 4 as const },
              { id: 'zs-caiwu', name: '财务共享中心', level: 4 as const },
            ]
          }
        ]
      },
      {
        id: 'level-jiceng',
        name: '基层单元（执行末梢）',
        level: 2 as const,
        children: [
          {
            id: 'jc-chejian',
            name: '车间/工区/班组',
            level: 3 as const,
            children: [
              { id: 'cj-shengchan', name: '生产班组', level: 4 as const },
              { id: 'cj-jishu', name: '技术班组', level: 4 as const },
              { id: 'cj-weixiu', name: '维修班组', level: 4 as const },
            ]
          },
          {
            id: 'jc-xiangmu',
            name: '项目部/项目组',
            level: 3 as const,
            children: [
              { id: 'xm-jingli', name: '项目经理部', level: 4 as const },
              { id: 'xm-jishu', name: '技术组', level: 4 as const },
              { id: 'xm-anquan', name: '安全组', level: 4 as const },
              { id: 'xm-houqin', name: '后勤组', level: 4 as const },
            ]
          },
          {
            id: 'jc-yingye',
            name: '营业网点/服务站',
            level: 3 as const,
            children: [
              { id: 'yy-yeting', name: '营业厅/窗口', level: 4 as const },
              { id: 'yy-fuwu', name: '服务站/代办点', level: 4 as const },
            ]
          },
          {
            id: 'jc-dangzhibu',
            name: '党支部/党小组',
            level: 3 as const,
            children: [
              { id: 'dz-yixian', name: '生产一线党支部', level: 4 as const },
              { id: 'dz-linshi', name: '项目临时党支部', level: 4 as const },
            ]
          }
        ]
      }
    ]
  }
];

export const knowledgeBaseData: Record<string, FileNode[]> = {
  'cj-jishu': [
    {
      id: 'jsbz-1', name: '技术班组', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jsbz-1-1', name: '技术攻关项目记录', type: 'file' as const, size: '3.2 MB', modifiedAt: '2026-06-20', permission: 'group' as const, content: '# 技术攻关项目记录\n\n## 项目：大模型推理加速优化\n\n### 问题描述\n\n当前GPT-4模型单次推理耗时3.2秒，无法满足实时对话需求。\n\n### 攻关方案\n\n1. 模型量化（FP16→INT8）\n2. KV Cache优化\n3. 批处理合并\n4. 异构计算调度\n\n### 成果\n\n推理耗时降至0.8秒，性能提升4倍。' },
      ]
    }
  ],
  'cj-shengchan': [
    {
      id: 'sc-1', name: '班组管理', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'sc-1-1', name: '班组安全生产标准化手册', type: 'file' as const, size: '2.5 MB', modifiedAt: '2026-04-15', permission: 'group' as const, content: '# 班组安全生产标准化手册\n\n## 一、班前会制度\n\n1. 点名签到\n2. 安全交底\n3. 任务分配\n4. 风险提示\n\n## 二、作业规范\n\n| 工序 | 操作要点 | 安全注意事项 | 质量标准 |\n|------|----------|--------------|----------|\n| 数据接入 | 校验完整性 | 防止数据泄露 | 准确率≥99.9% |\n| 模型训练 | 监控资源使用 | 防止过热 | 收敛时间≤4h |\n| 服务部署 | 灰度发布 | 回滚准备 | 可用性≥99.95% |' },
      ]
    }
  ],
  'cj-weixiu': [
    {
      id: 'wx-1', name: '维修班组', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'wx-1-1', name: '设备维护保养规程', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-05-10', permission: 'group' as const, content: '# 设备维护保养规程\n\n## 一、服务器维护\n\n| 维护项目 | 频次 | 内容 | 责任人 |\n|----------|------|------|--------|\n| 硬件巡检 | 每日 | 温度、风扇、指示灯 | 值班人员 |\n| 系统更新 | 每周 | 补丁安装、日志清理 | 系统管理员 |\n| 深度保养 | 每月 | 除尘、线缆检查 | 维修班组 |\n| 预防性维护 | 每季 | 部件老化评估 | 技术主管 |' },
      ]
    }
  ],
  'dj-dangqun': [
    {
      id: 'dq-1', name: '工会工作', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dq-1-1', name: '工会年度工作要点', type: 'file' as const, size: '2.1 MB', modifiedAt: '2026-02-15', permission: 'group' as const, content: '# 2026年工会年度工作要点\n\n## 一、民主管理\n\n1. 完善职工代表大会制度\n2. 推进厂务公开\n3. 开展合理化建议活动\n\n## 二、权益维护\n\n1. 做好困难职工帮扶\n2. 开展职工健康体检\n3. 组织职工疗休养\n\n## 三、文化活动\n\n1. 举办职工运动会\n2. 开展文艺汇演\n3. 组织技能竞赛' },
      ]
    },
    {
      id: 'dq-2', name: '团委工作', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dq-2-1', name: '青年突击队组建方案', type: 'file' as const, size: '1.5 MB', modifiedAt: '2026-05-20', permission: 'group' as const, content: '# 青年突击队组建方案\n\n## 一、组建原则\n\n围绕中心、服务大局，在急难险重任务中发挥青年生力军作用。\n\n## 二、组建条件\n\n- 35岁以下青年占比不低于70%\n- 有明确的攻坚目标和任务\n- 有固定的队长和指导人员\n\n## 三、主要任务\n\n1. 数字化转型攻坚\n2. 技术难题攻关\n3. 应急服务保障' },
      ]
    }
  ],
  'dj-laoganbu': [
    {
      id: 'gb-1', name: '老干部管理', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'gb-1-1', name: '老干部服务管理办法', type: 'file' as const, size: '1.8 MB', modifiedAt: '2026-04-01', permission: 'group' as const, content: '# 老干部服务管理办法\n\n## 第一章 总则\n\n第一条 为做好离退休干部服务管理工作，落实老干部政治待遇和生活待遇，制定本办法。\n\n## 第二章 政治待遇\n\n1. 定期组织政治学习\n2. 按规定阅读文件\n3. 参加重要会议和活动\n4. 听取工作情况通报\n\n## 第三章 生活待遇\n\n1. 确保养老金按时足额发放\n2. 落实医疗待遇\n3. 开展走访慰问\n4. 组织健康体检' },
      ]
    }
  ],
  'dj-xuanchuan': [
    {
      id: 'xc-1', name: '宣传工作', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'xc-1-1', name: '企业文化手册', type: 'file' as const, size: '8.5 MB', modifiedAt: '2026-03-20', permission: 'group' as const, content: '# 国联集团企业文化手册\n\n## 企业使命\n\n赋能数字未来，共创智慧生活\n\n## 企业愿景\n\n成为值得信赖的数字化产业领航者\n\n## 核心价值观\n\n| 价值观 | 内涵 | 行为准则 |\n|--------|------|----------|\n| 诚信 | 诚实守信，言行一致 | 说到做到，信守承诺 |\n| 创新 | 勇于突破，追求卓越 | 敢于尝试，持续改进 |\n| 协作 |  teamwork，共同成长 | 开放包容，互帮互助 |\n| 担当 | 勇于负责，敢于承担 | 主动担当，不推诿 |\n\n## 企业精神\n\n团结、务实、拼搏、奉献' }, 
        { id: 'xc-1-2', name: '2026年宣传工作方案', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-06-05', permission: 'group' as const, content: '# 2026年宣传工作方案\n\n## 一、宣传主题\n\n数字赋能高质量发展\n\n## 二、重点工作\n\n1. 打造太湖云AI企业智能体品牌IP\n2. 建设集团融媒体矩阵\n3. 开展国企开放日活动\n4. 制作企业形象宣传片' },
      ]
    }
  ],
  'dj-zuzhi': [
    {
      id: 'zz-1', name: '干部管理', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'zz-1-1', name: '干部选拔任用管理办法', type: 'file' as const, size: '3.8 MB', modifiedAt: '2026-04-10', permission: 'group' as const, content: '# 干部选拔任用管理办法\n\n## 第一章 总则\n\n第一条 为规范集团干部选拔任用工作，建设高素质干部队伍，制定本办法。\n\n## 第二章 选拔条件\n\n### 2.1 基本条件\n\n- 政治立场坚定，拥护党的领导\n- 具有5年以上相关工作经历\n- 近3年年度考核均为称职以上\n- 具备岗位所需的专业知识和管理能力\n\n## 第三章 选拔程序\n\n民主推荐 → 组织考察 → 党委讨论决定 → 任前公示 → 任职' }, 
        { id: 'zz-1-2', name: '后备干部名册', type: 'file' as const, size: '2.4 MB', modifiedAt: '2026-06-20', permission: 'group' as const, content: '# 后备干部名册\n\n| 姓名 | 性别 | 年龄 | 学历 | 现任职务 | 后备方向 | 培养措施 |\n|------|------|------|------|----------|----------|----------|\n| 张XX | 男 | 38 | 硕士 | 部门副经理 | 部门经理 | 轮岗锻炼 |\n| 李XX | 女 | 35 | 博士 | 项目经理 | 子公司副总 | 挂职锻炼 |\n| 王XX | 男 | 40 | 硕士 | 技术主管 | 技术总监 | 专项培训 |' },
      ]
    },
    {
      id: 'zz-2', name: '薪酬绩效', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'zz-2-1', name: '薪酬管理制度', type: 'file' as const, size: '4.2 MB', modifiedAt: '2026-05-15', permission: 'group' as const, content: '# 薪酬管理制度\n\n## 第一章 总则\n\n第一条 为建立科学的薪酬分配体系，调动员工积极性，制定本制度。\n\n## 第二章 薪酬结构\n\n| 构成 | 占比 | 说明 |\n|------|------|------|\n| 基本工资 | 40% | 岗位工资+薪级工资 |\n| 绩效工资 | 35% | 与个人绩效挂钩 |\n| 津贴补贴 | 15% | 交通、通讯、餐补等 |\n| 年终奖金 | 10% | 与公司效益挂钩 |' },
      ]
    },
    {
      id: 'zz-3', name: '培训开发', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'zz-3-1', name: '2026年度培训计划', type: 'file' as const, size: '3.5 MB', modifiedAt: '2026-01-25', permission: 'group' as const, content: '# 2026年度培训计划\n\n| 培训类别 | 培训对象 | 培训内容 | 培训时间 | 预算（万元） |\n|----------|----------|----------|----------|--------------|\n| 领导力培训 | 中高层管理者 | 战略管理、团队建设 | 全年 | 120 |\n| 专业能力 | 业务骨干 | 行业知识、专业技能 | 全年 | 80 |\n| 新员工培训 | 新入职员工 | 企业文化、规章制度 | 每月 | 30 |\n| 合规培训 | 全体员工 | 法律法规、合规要求 | 每季度 | 50 |' },
      ]
    }
  ],
  'ds-dongshizhang': [
    {
      id: 'ds-1', name: '董事会议案', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'ds-1-1', name: '2026年第五次董事会议案汇编', type: 'file' as const, size: '5.6 MB', modifiedAt: '2026-06-18', permission: 'group' as const, content: '# 2026年第五次董事会议案汇编\n\n## 议案一\n\n关于收购太湖水务集团有限公司51%股权的议案\n\n## 议案二\n\n关于2026年度中期财务预算调整的议案\n\n## 议案三\n\n关于聘任张XX为数据集团副总经理的议案' }, 
        { id: 'ds-1-2', name: '董事会决议执行情况跟踪表', type: 'file' as const, size: '2.3 MB', modifiedAt: '2026-06-20', permission: 'group' as const, content: '# 董事会决议执行情况跟踪表\n\n| 决议编号 | 决议事项 | 责任部门 | 计划完成时间 | 实际进展 | 状态 |\n|----------|----------|----------|--------------|----------|------|\n| 2026-001 | 数字化转型方案 | 数据集团 | 2026.06 | 已完成评审 | 已完成 |\n| 2026-002 | 太湖水务收购 | 战略投资部 | 2026.09 | 尽职调查中 | 进行中 |\n| 2026-003 | 内部审计整改 | 审计部 | 2026.07 | 整改80% | 进行中 |' },
      ]
    }
  ],
  'ds-neibu': [
    {
      id: 'dsnb-1', name: '董事履职文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dsnb-1-1', name: '董事履职评价报告', type: 'file' as const, size: '1.8 MB', modifiedAt: '2026-05-30', permission: 'group' as const, content: '# 2026年度董事履职评价报告\n\n## 评价对象\n\n- 张XX（董事长）：优秀\n- 李XX（总经理）：优秀\n- 王XX（职工董事）：良好\n\n## 评价内容\n\n1. 出席董事会会议情况\n2. 审议议案准备情况\n3. 提出建设性意见情况\n4. 参加调研培训情况' },
      ]
    }
  ],
  'ds-waibu': [
    {
      id: 'dswb-1', name: '外部董事文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dswb-1-1', name: '外部董事年度述职报告', type: 'file' as const, size: '2.4 MB', modifiedAt: '2026-05-25', permission: 'group' as const, content: '# 2026年度外部董事述职报告\n\n## 一、出席情况\n\n本年度共召开董事会会议6次，出席率100%。\n\n## 二、主要履职活动\n\n1. 参加战略研讨会2次\n2. 开展实地调研3次\n3. 提出书面意见5份\n4. 参加专题培训16学时\n\n## 三、主要建议\n\n1. 建议加强数字化转型投入\n2. 建议完善风险管理体系\n3. 建议优化投资决策流程' },
      ]
    }
  ],
  'dw-changwei': [
    {
      id: 'dwcw-1', name: '常委会议材料', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dwcw-1-1', name: '2026年第六次常委会议纪要', type: 'file' as const, size: '1.2 MB', modifiedAt: '2026-06-15', permission: 'group' as const, content: '# 2026年第六次党委常委会议纪要\n\n## 会议议题\n\n1. 审议通过《国联集团数字化转型三年行动方案》\n2. 研究部署安全生产专项整治工作\n3. 讨论干部任免事项\n\n## 会议决议\n\n一、数字化转型方案\n\n同意数据集团提交的太湖水务收购方案，要求战略投资部做好尽职调查。\n\n二、安全生产\n\n成立安全生产专项整治领导小组，由党委副书记任组长。\n\n三、干部任免\n\n同意张XX同志任数据集团副总经理，免去其国联科技总经理职务。' }, 
        { id: 'dwcw-1-2', name: '党委理论学习中心组学习材料', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-06-10', permission: 'group' as const, content: '# 党委理论学习中心组学习材料\n\n## 学习主题\n\n深入学习贯彻习近平总书记关于国有企业改革发展的重要论述。\n\n## 学习要点\n\n1. 坚持党对国有企业的全面领导\n2. 完善中国特色现代企业制度\n3. 推进国有企业数字化转型\n4. 加强国有企业党风廉政建设' },
      ]
    },
    {
      id: 'dwcw-2', name: '党建工作', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dwcw-2-1', name: '2026年党建工作要点', type: 'file' as const, size: '3.5 MB', modifiedAt: '2026-01-20', permission: 'group' as const, content: '# 2026年国联集团党建工作要点\n\n## 一、总体要求\n\n以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神。\n\n## 二、重点任务\n\n| 序号 | 任务 | 责任部门 | 完成时限 |\n|------|------|----------|----------|\n| 1 | 开展主题教育 | 党委宣传部 | 6月底 |\n| 2 | 组织支部书记培训 | 党委组织部 | 3月底 |\n| 3 | 评选先进基层党组织 | 党群工作部 | 7月初 |\n| 4 | 完善党员发展流程 | 党委组织部 | 全年 |' },
      ]
    }
  ],
  'dw-dangjian': [
    {
      id: 'dj-1', name: '党建文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dj-1-1', name: '基层党组织建设规范', type: 'file' as const, size: '2.1 MB', modifiedAt: '2026-04-15', permission: 'group' as const, content: '# 基层党组织建设规范\n\n## 第一章 总则\n\n第一条 为加强基层党组织建设，提升组织力，制定本规范。\n\n## 第二章 组织设置\n\n### 2.1 设置原则\n\n- 党员3人以上应建立党支部\n- 党支部党员一般不超过50人\n- 项目部应建立临时党支部\n\n### 2.2 支部委员会\n\n支部委员会设书记1人，必要时设副书记1人，委员3-5人。' }, 
        { id: 'dj-1-2', name: '党员发展工作流程', type: 'file' as const, size: '1.8 MB', modifiedAt: '2026-05-20', permission: 'group' as const, content: '# 党员发展工作流程\n\n## 发展流程\n\n1. 入党申请人提交入党申请书\n2. 党组织派人谈话（1个月内）\n3. 确定为入党积极分子（支委会讨论）\n4. 培养教育和考察（1年以上）\n5. 确定为发展对象\n6. 政治审查\n7. 集中培训（不少于3天）\n8. 支部大会讨论表决\n9. 上级党委审批\n10. 预备期考察（1年）\n11. 转正审批' },
      ]
    }
  ],
  'dw-quanwei': [
    {
      id: 'dwqw-1', name: '全委会文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dwqw-1-1', name: '2026年全委会工作报告', type: 'file' as const, size: '4.2 MB', modifiedAt: '2026-03-25', permission: 'group' as const, content: '# 国联集团2026年全委会工作报告\n\n## 一、2025年工作回顾\n\n2025年集团实现营业收入135亿元，同比增长12%；利润总额18.5亿元，同比增长15%。\n\n## 二、2026年工作部署\n\n### 2.1 经营目标\n\n- 营业收入：150亿元\n- 利润总额：22亿元\n- 新增投资：30亿元\n\n### 2.2 重点工作\n\n1. 推进太湖云AI企业智能体平台建设\n2. 完成太湖水务收购\n3. 启动数字化转型三年行动\n4. 深化国企改革三年行动成果' },
      ]
    }
  ],
  'dz-linshi': [
    {
      id: 'dls-1', name: '临时支部', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dls-1-1', name: '临时党支部组建指南', type: 'file' as const, size: '1.8 MB', modifiedAt: '2026-04-10', permission: 'group' as const, content: '# 项目临时党支部组建指南\n\n## 一、组建条件\n\n项目工期3个月以上，党员3人以上，应建立临时党支部。\n\n## 二、组建程序\n\n1. 上级党组织批复\n2. 召开党员大会选举\n3. 明确支部书记\n4. 制定工作计划\n\n## 三、主要职责\n\n1. 加强党员教育管理\n2. 发挥党员先锋模范作用\n3. 做好思想政治工作\n4. 参与项目重大决策' },
      ]
    }
  ],
  'dz-yixian': [
    {
      id: 'dyx-1', name: '支部建设', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'dyx-1-1', name: '生产一线党支部工作手册', type: 'file' as const, size: '2.5 MB', modifiedAt: '2026-03-25', permission: 'group' as const, content: '# 生产一线党支部工作手册\n\n## 一、组织架构\n\n支部书记：1人\n支部委员：3人（组织、宣传、纪检）\n党员人数：15人\n\n## 二、三会一课\n\n| 会议 | 频次 | 时间 |\n|------|------|------|\n| 支部党员大会 | 每季 | 季末最后一周 |\n| 支部委员会 | 每月 | 月初第一周 |\n| 党小组会 | 每月 | 月中 |\n| 党课 | 每季 | 配合党员大会 |' },
      ]
    }
  ],
  'jl-caiwu': [
    {
      id: 'jlcw-1', name: '财务总监文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jlcw-1-1', name: '2026年度财务预算方案', type: 'file' as const, size: '6.2 MB', modifiedAt: '2026-02-28', permission: 'group' as const, content: '# 2026年度财务预算方案\n\n## 一、收入预算\n\n| 板块 | 预算金额（亿元） | 占比 |\n|------|------------------|------|\n| 数据科技 | 45 | 30% |\n| 现代物业 | 35 | 23% |\n| 产业投资 | 25 | 17% |\n| 其他业务 | 45 | 30% |\n\n## 二、成本预算\n\n总成本预算：108亿元\n\n## 三、利润预算\n\n目标利润总额：22亿元' },
      ]
    }
  ],
  'jl-falv': [
    {
      id: 'jlfw-1', name: '法律事务', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jlfw-1-1', name: '重大合同法律审核意见书', type: 'file' as const, size: '3.4 MB', modifiedAt: '2026-06-15', permission: 'group' as const, content: '# 重大合同法律审核意见书\n\n## 合同名称\n\n太湖水务集团有限公司股权转让协议\n\n## 审核意见\n\n### 一、主体资格审查\n\n交易各方主体资格合法有效。\n\n### 二、交易条款审查\n\n1. 转让价格公允\n2. 付款条件合理\n3. 过渡期安排明确\n4. 违约责任对等\n\n### 三、风险提示\n\n1. 建议补充环保责任承担条款\n2. 建议明确员工安置方案' },
      ]
    }
  ],
  'jl-fuzong': [
    {
      id: 'jlfz-1', name: '副总经理分工', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jlfz-1-1', name: '副总经理分工调整方案', type: 'file' as const, size: '1.8 MB', modifiedAt: '2026-04-01', permission: 'group' as const, content: '# 副总经理分工调整方案\n\n## 一、李XX副总经理\n\n分管：战略投资、企业管理、资本运作\n\n## 二、王XX副总经理\n\n分管：运营管理、安全生产、工程建设\n\n## 三、赵XX副总经理\n\n分管：财务管理、人力资源、后勤保障' },
      ]
    }
  ],
  'jl-mishu': [
    {
      id: 'jlms-1', name: '董秘工作', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jlms-1-1', name: '信息披露管理制度', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-03-15', permission: 'group' as const, content: '# 信息披露管理制度\n\n## 第一章 总则\n\n第一条 为规范国联集团信息披露工作，保护投资者合法权益，制定本制度。\n\n## 第二章 披露内容\n\n1. 定期报告：年度报告、半年度报告、季度报告\n2. 临时报告：重大事件公告\n3. 其他披露：关联交易、对外担保等\n\n## 第三章 披露程序\n\n信息收集 → 审核 → 审批 → 披露 → 存档' },
      ]
    }
  ],
  'jl-zongjingli': [
    {
      id: 'jlzj-1', name: '总经理办公会', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jlzj-1-1', name: '2026年第十次总经理办公会纪要', type: 'file' as const, size: '2.6 MB', modifiedAt: '2026-06-22', permission: 'group' as const, content: '# 2026年第十次总经理办公会议纪要\n\n## 会议信息\n\n- 时间：2026年6月22日\n- 地点：集团总部A会议室\n- 主持：总经理\n\n## 会议议题\n\n1. 审议2026年上半年经营分析报告\n2. 研究部署下半年重点工作\n3. 讨论知识库管理系统建设方案\n\n## 会议决议\n\n一、上半年经营情况\n\n实现营业收入78亿元，完成年度预算52%，同比增长14%。\n\n二、下半年重点工作\n\n1. 确保完成全年150亿元营收目标\n2. 推进太湖云AI企业智能体平台上线运营\n3. 完成太湖水务收购交割' }, 
        { id: 'jlzj-1-2', name: '总经理年度工作报告', type: 'file' as const, size: '8.5 MB', modifiedAt: '2026-03-10', permission: 'group' as const, content: '# 2026年度总经理工作报告\n\n## 一、2025年工作回顾\n\n### 1.1 经营业绩\n\n| 指标 | 2025年 | 同比 |\n|------|--------|------|\n| 营业收入 | 135亿元 | +12% |\n| 利润总额 | 18.5亿元 | +15% |\n| 资产总额 | 280亿元 | +8% |\n| 员工人数 | 6,800人 | +5% |\n\n### 1.2 重点工作\n\n- 完成国企改革三年行动\n- 启动太湖云AI企业智能体平台建设\n- 推进数字化转型升级' },
      ]
    }
  ],
  'js-jianshizhang': [
    {
      id: 'jsjz-1', name: '监事会文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jsjz-1-1', name: '2026年度监事会工作报告', type: 'file' as const, size: '4.8 MB', modifiedAt: '2026-06-28', permission: 'group' as const, content: '# 2026年度监事会工作报告\n\n## 一、监事会工作情况\n\n上半年共召开监事会会议3次，列席董事会会议6次。\n\n## 二、监督检查情况\n\n### 2.1 财务监督\n\n对2025年度财务决算进行了审核，认为财务报表真实、完整。\n\n### 2.2 重大决策监督\n\n对重大投资决策程序进行了监督，认为决策程序合规。\n\n## 三、发现问题\n\n| 问题类别 | 问题数量 | 整改建议 |\n|----------|----------|----------|\n| 财务管理 | 2 | 加强预算执行管控 |\n| 内部控制 | 3 | 完善审批流程 |\n| 合规管理 | 1 | 加强法律审核 |' },
      ]
    }
  ],
  'js-waibu': [
    {
      id: 'jswb-1', name: '外部监事文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jswb-1-1', name: '外部监事履职报告', type: 'file' as const, size: '1.5 MB', modifiedAt: '2026-05-20', permission: 'group' as const, content: '# 2026年度外部监事履职报告\n\n## 一、履职情况\n\n本年度出席监事会会议3次，列席董事会会议2次。\n\n## 二、主要意见\n\n1. 建议加强关联交易管理\n2. 建议完善信息披露制度\n3. 建议强化内部审计独立性' },
      ]
    }
  ],
  'js-zhigong': [
    {
      id: 'jszg-1', name: '职工监事文件', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'jszg-1-1', name: '职工监事提案汇总', type: 'file' as const, size: '1.2 MB', modifiedAt: '2026-05-15', permission: 'group' as const, content: '# 2026年职工监事提案汇总\n\n## 提案一\n\n关于改善职工工作环境的建议\n\n## 提案二\n\n关于加强职工职业培训的建议\n\n## 提案三\n\n关于完善职工福利制度的建议' },
      ]
    }
  ],
  'qy-huabei': [
    {
      id: 'hb-1', name: '区域运营', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'hb-1-1', name: '华北区域年度经营计划', type: 'file' as const, size: '3.2 MB', modifiedAt: '2026-01-20', permission: 'group' as const, content: '# 华北区域2026年度经营计划\n\n## 一、区域概况\n\n管辖范围：北京、天津、河北、山西、内蒙古\n\n## 二、经营目标\n\n| 指标 | 目标值 |\n|------|--------|\n| 营业收入 | 25亿元 |\n| 新签合同额 | 30亿元 |\n| 客户满意度 | ≥95% |\n| 安全事故率 | 0 |\n\n## 三、重点项目\n\n1. 北京智慧园区项目\n2. 天津数据中心项目\n3. 河北新能源项目' }, 
        { id: 'hb-1-2', name: '华北区域客户名录', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-06-15', permission: 'group' as const, content: '# 华北区域重点客户名录\n\n| 客户名称 | 行业 | 合作金额 | 合作状态 |\n|----------|------|----------|----------|\n| 首钢集团 | 钢铁 | 2.5亿 | 长期合作 |\n| 北汽集团 | 汽车 | 1.8亿 | 长期合作 |\n| 中国移动北京 | 通信 | 3.2亿 | 战略合作 |\n| 国家电网华北 | 电力 | 4.5亿 | 战略合作 |' },
      ]
    }
  ],
  'qy-huadong': [
    {
      id: 'hd-1', name: '区域运营', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'hd-1-1', name: '华东区域年度经营计划', type: 'file' as const, size: '3.5 MB', modifiedAt: '2026-01-20', permission: 'group' as const, content: '# 华东区域2026年度经营计划\n\n## 一、区域概况\n\n管辖范围：上海、江苏、浙江、安徽、山东\n\n## 二、经营目标\n\n| 指标 | 目标值 |\n|------|--------|\n| 营业收入 | 45亿元 |\n| 新签合同额 | 55亿元 |\n| 客户满意度 | ≥95% |\n| 安全事故率 | 0 |\n\n## 三、重点项目\n\n1. 上海金融城智慧物业项目\n2. 江苏智能制造产业园项目\n3. 杭州亚运会场馆运维项目' },
      ]
    }
  ],
  'qy-huanan': [
    {
      id: 'hn-1', name: '区域运营', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'hn-1-1', name: '华南区域年度经营计划', type: 'file' as const, size: '3.0 MB', modifiedAt: '2026-01-20', permission: 'group' as const, content: '# 华南区域2026年度经营计划\n\n## 一、区域概况\n\n管辖范围：广东、广西、海南、福建\n\n## 二、经营目标\n\n| 指标 | 目标值 |\n|------|--------|\n| 营业收入 | 30亿元 |\n| 新签合同额 | 38亿元 |\n| 客户满意度 | ≥95% |\n| 安全事故率 | 0 |' },
      ]
    }
  ],
  'qy-xinan': [
    {
      id: 'xn-1', name: '区域运营', type: 'folder' as const, permission: 'group' as const,
      children: [
        { id: 'xn-1-1', name: '西南区域年度经营计划', type: 'file' as const, size: '2.8 MB', modifiedAt: '2026-01-20', permission: 'group' as const, content: '# 西南区域2026年度经营计划\n\n## 一、区域概况\n\n管辖范围：四川、重庆、云南、贵州\n\n## 二、经营目标\n\n| 指标 | 目标值 |\n|------|--------|\n| 营业收入 | 20亿元 |\n| 新签合同额 | 25亿元 |\n| 客户满意度 | ≥95% |\n| 安全事故率 | 0 |' },
      ]
    }
  ]
};
