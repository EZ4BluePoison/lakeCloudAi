import type { Agent, MyAgent, PlazaAgent, AgentStat, DepartmentUsage, DailyUsage } from '@/types';

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

/** 太湖云公司 2026 年组织架构（知识库目录）
 * 按图中部门层级维护，不显示人名。
 */
export const knowledgeOrgTree = [
  {
    id: 'taihu-sales',
    name: '市场销售中心',
    level: 1 as const,
    children: [
      { id: 'sales-business', name: '商务组', level: 2 as const },
      { id: 'sales-platform', name: '平台销售组', level: 2 as const },
      { id: 'sales-team1', name: '市场销售一组', level: 2 as const },
      { id: 'sales-team2', name: '市场销售二组', level: 2 as const },
      { id: 'sales-solution', name: '解决方案组', level: 2 as const },
    ]
  },
  {
    id: 'taihu-digital',
    name: '数智业务部',
    level: 1 as const,
    children: [
      { id: 'digital-wuxi', name: '数字国联', level: 2 as const },
      { id: 'digital-soe', name: '数智国企', level: 2 as const },
      { id: 'digital-water', name: '智慧水务', level: 2 as const },
      { id: 'digital-hardware', name: '硬件研发中心', level: 2 as const },
      { id: 'digital-ai', name: 'AI赋能中心', level: 2 as const },
    ]
  },
  { id: 'taihu-admin', name: '综合管理部', level: 1 as const },
  { id: 'taihu-finance', name: '财务部', level: 1 as const },
];

