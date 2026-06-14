import React, { useState, useEffect } from 'react';
import {
  Settings, RotateCcw, Save, Flame, Shield, Crosshair, Wrench, Zap, Info,
  AlertTriangle, AlertCircle, Bell, Lock, Highlighter, Command, ChevronDown, ChevronUp
} from 'lucide-react';
import { useConfigStore } from '../store/useConfigStore';
import { useShipStore } from '../store/useShipStore';
import { useEmergencyCommandsStore } from '../store/useEmergencyCommandsStore';
import { Modal } from '../components/UI/Modal';
import { resetSaveData, exportSaveData, importSaveData } from '../utils/storage';
import { defaultConfig } from '../data/defaultConfig';
import type { CommandConditionType, CommandActionType, CommandUIFeedbackType, EnemyIntentType } from '../types';

export const ConfigPage: React.FC = () => {
  const { config, updateConfig, resetConfig } = useConfigStore();
  const { resetShip } = useShipStore();
  const {
    commands,
    loadCommands,
    updateCommand,
    toggleCommand,
    resetCommands
  } = useEmergencyCommandsStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [expandedCommands, setExpandedCommands] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCommands();
  }, [loadCommands]);

  const toggleCommandExpand = (id: string) => {
    setExpandedCommands(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSliderChange = (key: keyof typeof config, value: number) => {
    updateConfig(key, value);
  };

  const handleResetConfig = () => {
    resetConfig();
  };

  const handleResetAllData = () => {
    resetSaveData();
    resetShip();
    resetConfig();
    resetCommands();
    setShowResetModal(false);
    window.location.reload();
  };

  const conditionOptions: { value: CommandConditionType; label: string; description: string }[] = [
    { value: 'hp_below_percent', label: '血量低于百分比', description: '当玩家血量低于设定百分比时触发' },
    { value: 'shield_below_percent', label: '护盾低于百分比', description: '当玩家护盾低于设定百分比时触发' },
    { value: 'energy_below_percent', label: '能量低于百分比', description: '当玩家能量低于设定百分比时触发' },
    { value: 'enemy_intent_type', label: '敌人意图类型', description: '当敌人显示指定意图时触发' },
    { value: 'weapon_near_overheat', label: '武器舱接近过热', description: '当武器舱点数达到过热阈值的设定百分比时触发' },
  ];

  const actionOptions: { value: CommandActionType; label: string; description: string }[] = [
    { value: 'prioritize_shield', label: '优先护盾', description: '提示玩家优先分配护盾舱' },
    { value: 'prioritize_engine', label: '优先引擎', description: '提示玩家优先分配引擎舱' },
    { value: 'prioritize_repair', label: '优先维修', description: '提示玩家优先分配维修舱' },
    { value: 'prioritize_weapon', label: '优先武器', description: '提示玩家优先分配武器舱' },
    { value: 'warn_weapon_overheat', label: '武器过热警告', description: '警告武器舱即将过热并禁用继续分配' },
    { value: 'warn_high_damage', label: '高伤害预警', description: '警告即将到来的高伤害' },
    { value: 'suggest_scan', label: '建议扫描', description: '建议使用扫描舱削弱敌方' },
  ];

  const feedbackOptions: { value: CommandUIFeedbackType; label: string; description: string; icon: typeof AlertTriangle }[] = [
    { value: 'alert', label: '紧急弹窗提示', description: '以高优先级红色弹窗显示', icon: AlertCircle },
    { value: 'warning', label: '警告提示', description: '以橙色警告条显示', icon: AlertTriangle },
    { value: 'info', label: '信息提示', description: '以蓝色信息条显示', icon: Bell },
    { value: 'disable_cabin', label: '禁用舱位', description: '禁止向目标舱位继续分配骰子', icon: Lock },
    { value: 'highlight_cabin', label: '高亮舱位', description: '高亮标记建议的舱位', icon: Highlighter },
  ];

  const intentOptions: { value: EnemyIntentType; label: string }[] = [
    { value: 'attack', label: '普通攻击' },
    { value: 'charge', label: '蓄力攻击' },
    { value: 'defend', label: '防御姿态' },
    { value: 'special', label: '特殊技能' },
    { value: 'repair', label: '自我修复' },
  ];

  const cabinOptions: { value: 'engine' | 'shield' | 'weapon' | 'repair' | 'scanner'; label: string }[] = [
    { value: 'engine', label: '引擎舱' },
    { value: 'shield', label: '护盾舱' },
    { value: 'weapon', label: '武器舱' },
    { value: 'repair', label: '维修舱' },
    { value: 'scanner', label: '扫描舱' },
  ];

  const getFeedbackColor = (feedback: CommandUIFeedbackType): string => {
    switch (feedback) {
      case 'alert': return 'border-neon-red/50 bg-neon-red/5';
      case 'warning': return 'border-neon-yellow/50 bg-neon-yellow/5';
      case 'info': return 'border-neon-blue/50 bg-neon-blue/5';
      case 'disable_cabin': return 'border-neon-red/50 bg-neon-red/5';
      case 'highlight_cabin': return 'border-neon-green/50 bg-neon-green/5';
      default: return 'border-space-600';
    }
  };

  const getFeedbackIconColor = (feedback: CommandUIFeedbackType): string => {
    switch (feedback) {
      case 'alert': return 'text-neon-red';
      case 'warning': return 'text-neon-yellow';
      case 'info': return 'text-neon-blue';
      case 'disable_cabin': return 'text-neon-red';
      case 'highlight_cabin': return 'text-neon-green';
      default: return 'text-gray-400';
    }
  };

  const handleExportData = () => {
    const data = exportSaveData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starship_dice_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    try {
      const success = importSaveData(importText);
      if (success) {
        setImportError('');
        setShowImportModal(false);
        setImportText('');
        window.location.reload();
      } else {
        setImportError('导入失败，请检查数据格式');
      }
    } catch {
      setImportError('导入失败：JSON格式错误');
    }
  };

  const configItems = [
    {
      key: 'overheatThreshold' as const,
      name: '过热阈值',
      description: '单舱位分配点数超过此值将导致舱室过热损坏',
      icon: Flame,
      color: 'text-neon-red',
      min: 5,
      max: 20,
      step: 1,
      unit: '点',
    },
    {
      key: 'shieldAbsorptionRate' as const,
      name: '护盾吸收率',
      description: '护盾能够吸收的伤害比例',
      icon: Shield,
      color: 'text-neon-cyan',
      min: 0.1,
      max: 0.9,
      step: 0.05,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'critMultiplier' as const,
      name: '暴击倍率',
      description: '暴击时的伤害倍率',
      icon: Crosshair,
      color: 'text-neon-yellow',
      min: 1.5,
      max: 4,
      step: 0.1,
      unit: 'x',
    },
    {
      key: 'critBonusRate' as const,
      name: '暴击加成率',
      description: '每个6点骰子额外增加的暴击率',
      icon: Crosshair,
      color: 'text-neon-yellow',
      min: 0,
      max: 0.3,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'repairCooldown' as const,
      name: '维修冷却',
      description: '舱室损坏后需要冷却的回合数',
      icon: Wrench,
      color: 'text-neon-green',
      min: 1,
      max: 5,
      step: 1,
      unit: '回合',
    },
    {
      key: 'engineEvasionBonus' as const,
      name: '引擎闪避加成',
      description: '每点引擎点数增加的闪避率',
      icon: Zap,
      color: 'text-neon-purple',
      min: 0.01,
      max: 0.15,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'scanEvasionReduction' as const,
      name: '扫描削弱效果',
      description: '每点扫描点数降低的敌方闪避率',
      icon: Zap,
      color: 'text-neon-blue',
      min: 0.01,
      max: 0.15,
      step: 0.01,
      unit: '%',
      displayMultiplier: 100,
    },
    {
      key: 'maxRerolls' as const,
      name: '最大重掷次数',
      description: '每回合可以重掷骰子的次数',
      icon: RotateCcw,
      color: 'text-white',
      min: 0,
      max: 5,
      step: 1,
      unit: '次',
    },
    {
      key: 'diceCount' as const,
      name: '骰子数量',
      description: '每回合可用的骰子数量',
      icon: Settings,
      color: 'text-white',
      min: 3,
      max: 8,
      step: 1,
      unit: '颗',
    },
    {
      key: 'energyCostPerPoint' as const,
      name: '能量消耗系数',
      description: '每点骰子点数消耗的能量（保留功能）',
      icon: Zap,
      color: 'text-neon-yellow',
      min: 0,
      max: 3,
      step: 0.5,
      unit: '能量/点',
    },
    {
      key: 'enemyDamageVariance' as const,
      name: '敌人伤害波动',
      description: '敌人伤害的随机波动范围',
      icon: Crosshair,
      color: 'text-neon-red',
      min: 0,
      max: 0.5,
      step: 0.05,
      unit: '%',
      displayMultiplier: 100,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-neon-blue flex items-center gap-2">
        <Settings className="w-7 h-7" />
        游戏设置
      </h2>

      <div className="glass-panel neon-border p-4 rounded-xl mb-6">
        <div className="flex items-start gap-3 p-3 bg-neon-blue/10 rounded-lg">
          <Info className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-neon-blue font-medium">关于游戏设置</p>
            <p className="text-sm text-gray-400 mt-1">
              调整这些参数可以改变游戏体验。所有设置会自动保存到本地。
              点击"重置为默认值"可以恢复原始设置。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {configItems.map(item => {
          const Icon = item.icon;
          const displayValue = item.displayMultiplier
            ? (config[item.key] * item.displayMultiplier).toFixed(0)
            : config[item.key];
          const defaultDisplayValue = item.displayMultiplier
            ? (defaultConfig[item.key] * item.displayMultiplier).toFixed(0)
            : defaultConfig[item.key];
          const isModified = config[item.key] !== defaultConfig[item.key];

          return (
            <div
              key={item.key}
              className={`glass-panel p-4 rounded-xl border ${isModified ? 'border-neon-yellow/50' : 'border-space-600'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <div>
                    <h4 className="font-display font-bold text-white flex items-center gap-2">
                      {item.name}
                      {isModified && (
                        <span className="text-xs px-2 py-0.5 bg-neon-yellow/20 text-neon-yellow rounded">
                          已修改
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    当前: <span className={`font-display font-bold ${item.color}`}>{displayValue}{item.unit}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    默认: {defaultDisplayValue}{item.unit}
                  </span>
                </div>

                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={config[item.key]}
                  onChange={(e) => handleSliderChange(item.key, parseFloat(e.target.value))}
                  className="w-full h-2 bg-space-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-neon-blue
                    [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,212,255,0.5)]
                    [&::-webkit-slider-thumb]:cursor-pointer
                  "
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{item.min}{item.unit}</span>
                  <span>{item.max}{item.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-display font-bold text-neon-purple flex items-center gap-2 mb-6">
          <Command className="w-7 h-7" />
          紧急指令链
        </h2>

        <div className="glass-panel neon-border p-4 rounded-xl mb-6">
          <div className="flex items-start gap-3 p-3 bg-neon-purple/10 rounded-lg">
            <Info className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-neon-purple font-medium">关于紧急指令链</p>
              <p className="text-sm text-gray-400 mt-1">
                配置三条条件指令，在战斗中满足条件时以高优先级提示、按钮禁用建议或风险标记的形式出现。
                指令不会替你强制操作，仅作为战斗中的智能提醒。所有设置会自动保存到本地存档。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {commands.map((command) => {
            const isExpanded = expandedCommands[command.id] ?? false;
            const FeedbackIcon = feedbackOptions.find(f => f.value === command.feedback)?.icon || Bell;
            const conditionInfo = conditionOptions.find(c => c.value === command.condition.type);
            const actionInfo = actionOptions.find(a => a.value === command.action.type);

            return (
              <div
                key={command.id}
                className={`glass-panel rounded-xl border overflow-hidden transition-all duration-200 ${
                  command.enabled
                    ? getFeedbackColor(command.feedback)
                    : 'border-space-600 opacity-60'
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-space-800/50 transition-colors"
                  onClick={() => toggleCommandExpand(command.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${command.enabled ? getFeedbackColor(command.feedback) : 'bg-space-800'}`}>
                        <FeedbackIcon className={`w-5 h-5 ${command.enabled ? getFeedbackIconColor(command.feedback) : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-white">
                            {command.name}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            command.enabled
                              ? 'bg-neon-green/20 text-neon-green'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {command.enabled ? '已启用' : '已禁用'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {command.enabled
                            ? `条件: ${conditionInfo?.label} → 动作: ${actionInfo?.label}`
                            : command.description
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCommand(command.id);
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          command.enabled ? 'bg-neon-green' : 'bg-space-700'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                          command.enabled ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-space-600 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">指令名称</label>
                        <input
                          type="text"
                          value={command.name}
                          onChange={(e) => updateCommand(command.id, { name: e.target.value })}
                          className="w-full bg-space-900 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">指令描述</label>
                        <input
                          type="text"
                          value={command.description}
                          onChange={(e) => updateCommand(command.id, { description: e.target.value })}
                          className="w-full bg-space-900 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-space-900/50 rounded-lg">
                      <h5 className="font-display font-bold text-neon-blue mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        触发条件
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">条件类型</label>
                          <select
                            value={command.condition.type}
                            onChange={(e) => {
                              const newType = e.target.value as CommandConditionType;
                              const newCondition = { ...command.condition, type: newType };
                              if (newType === 'enemy_intent_type' && !newCondition.intentType) {
                                newCondition.intentType = 'attack';
                              }
                              updateCommand(command.id, { condition: newCondition });
                            }}
                            className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-blue focus:outline-none text-sm"
                          >
                            {conditionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {(command.condition.type === 'hp_below_percent' ||
                          command.condition.type === 'shield_below_percent' ||
                          command.condition.type === 'energy_below_percent') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">阈值百分比</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={5}
                                max={90}
                                step={5}
                                value={command.condition.value}
                                onChange={(e) => updateCommand(command.id, {
                                  condition: { ...command.condition, value: parseFloat(e.target.value) }
                                })}
                                className="flex-1 h-2 bg-space-700 rounded-lg appearance-none cursor-pointer
                                  [&::-webkit-slider-thumb]:appearance-none
                                  [&::-webkit-slider-thumb]:w-4
                                  [&::-webkit-slider-thumb]:h-4
                                  [&::-webkit-slider-thumb]:rounded-full
                                  [&::-webkit-slider-thumb]:bg-neon-blue
                                  [&::-webkit-slider-thumb]:cursor-pointer"
                              />
                              <span className="text-sm font-display font-bold text-neon-blue min-w-[3rem] text-right">
                                {command.condition.value}%
                              </span>
                            </div>
                          </div>
                        )}

                        {command.condition.type === 'weapon_near_overheat' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">阈值百分比（相对过热阈值）</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={50}
                                max={95}
                                step={5}
                                value={command.condition.value}
                                onChange={(e) => updateCommand(command.id, {
                                  condition: { ...command.condition, value: parseFloat(e.target.value) }
                                })}
                                className="flex-1 h-2 bg-space-700 rounded-lg appearance-none cursor-pointer
                                  [&::-webkit-slider-thumb]:appearance-none
                                  [&::-webkit-slider-thumb]:w-4
                                  [&::-webkit-slider-thumb]:h-4
                                  [&::-webkit-slider-thumb]:rounded-full
                                  [&::-webkit-slider-thumb]:bg-neon-red
                                  [&::-webkit-slider-thumb]:cursor-pointer"
                              />
                              <span className="text-sm font-display font-bold text-neon-red min-w-[3rem] text-right">
                                {command.condition.value}%
                              </span>
                            </div>
                          </div>
                        )}

                        {command.condition.type === 'enemy_intent_type' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">敌人意图类型</label>
                            <select
                              value={command.condition.intentType || 'attack'}
                              onChange={(e) => updateCommand(command.id, {
                                condition: {
                                  ...command.condition,
                                  intentType: e.target.value as EnemyIntentType,
                                  value: 0
                                }
                              })}
                              className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-blue focus:outline-none text-sm"
                            >
                              {intentOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {conditionInfo?.description}
                      </p>
                    </div>

                    <div className="p-3 bg-space-900/50 rounded-lg">
                      <h5 className="font-display font-bold text-neon-green mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        触发动作
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">动作类型</label>
                          <select
                            value={command.action.type}
                            onChange={(e) => {
                              const newType = e.target.value as CommandActionType;
                              const cabinMap: Record<CommandActionType, 'engine' | 'shield' | 'weapon' | 'repair' | 'scanner' | undefined> = {
                                prioritize_shield: 'shield',
                                prioritize_engine: 'engine',
                                prioritize_repair: 'repair',
                                prioritize_weapon: 'weapon',
                                warn_weapon_overheat: 'weapon',
                                warn_high_damage: undefined,
                                suggest_scan: 'scanner',
                              };
                              updateCommand(command.id, {
                                action: { type: newType, cabinType: cabinMap[newType] }
                              });
                            }}
                            className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none text-sm"
                          >
                            {actionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {command.action.cabinType && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">目标舱位</label>
                            <select
                              value={command.action.cabinType}
                              onChange={(e) => updateCommand(command.id, {
                                action: { ...command.action, cabinType: e.target.value as typeof command.action.cabinType }
                              })}
                              className="w-full bg-space-800 border border-space-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none text-sm"
                            >
                              {cabinOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {actionOptions.find(a => a.value === command.action.type)?.description}
                      </p>
                    </div>

                    <div className="p-3 bg-space-900/50 rounded-lg">
                      <h5 className="font-display font-bold text-neon-yellow mb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        反馈方式
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {feedbackOptions.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => updateCommand(command.id, { feedback: opt.value })}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                command.feedback === opt.value
                                  ? 'border-neon-yellow bg-neon-yellow/10'
                                  : 'border-space-600 hover:border-space-500'
                              }`}
                            >
                              <Icon className={`w-5 h-5 mb-1 ${command.feedback === opt.value ? 'text-neon-yellow' : 'text-gray-400'}`} />
                              <div className={`text-xs font-medium ${command.feedback === opt.value ? 'text-neon-yellow' : 'text-gray-300'}`}>
                                {opt.label}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                {opt.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            onClick={() => resetCommands()}
            className="px-4 py-2 bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置指令链为默认
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-8">
        <button
          onClick={handleResetConfig}
          className="px-4 py-2 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置为默认值
        </button>

        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-neon-green/20 border border-neon-green text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          导出存档
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-neon-blue/20 border border-neon-blue text-neon-blue rounded-lg hover:bg-neon-blue/30 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          导入存档
        </button>

        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-neon-red/20 border border-neon-red text-neon-red rounded-lg hover:bg-neon-red/30 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置所有数据
        </button>
      </div>

      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="确认重置"
        maxWidth="max-w-md"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-display font-bold text-neon-red mb-2">
            确定要重置所有数据吗？
          </h3>
          <p className="text-gray-400 mb-6">
            此操作将清除所有游戏进度，包括舰船升级、战斗记录、设置等。
            <br />
            <span className="text-neon-red font-bold">此操作无法撤销！</span>
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setShowResetModal(false)}
              className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleResetAllData}
              className="flex-1 btn-danger"
            >
              确认重置
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportText('');
          setImportError('');
        }}
        title="导入存档"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            将导出的存档JSON数据粘贴到下方文本框中，然后点击导入。
          </p>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"ship": {...}, "upgrades": [...], ...}'
            className="w-full h-40 bg-space-900 border border-space-600 rounded-lg p-3 text-sm font-mono text-white resize-none focus:border-neon-blue focus:outline-none"
          />

          {importError && (
            <p className="text-sm text-neon-red">{importError}</p>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowImportModal(false);
                setImportText('');
                setImportError('');
              }}
              className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImportData}
              disabled={!importText.trim()}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导入
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
