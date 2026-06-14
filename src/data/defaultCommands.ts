import type { EmergencyCommand } from '../types';

export const defaultEmergencyCommands: EmergencyCommand[] = [
  {
    id: 'cmd_hp_shield',
    name: '低血量护盾优先',
    description: '当血量低于设定百分比时，提示优先分配护盾舱',
    enabled: true,
    condition: {
      type: 'hp_below_percent',
      value: 30,
    },
    action: {
      type: 'prioritize_shield',
      cabinType: 'shield',
    },
    feedback: 'highlight_cabin',
  },
  {
    id: 'cmd_enemy_charge_engine',
    name: '敌方蓄力引擎提示',
    description: '当敌人显示蓄力或攻击意图时，提醒投入引擎增加闪避',
    enabled: true,
    condition: {
      type: 'enemy_intent_type',
      value: 0,
      intentType: 'charge',
    },
    action: {
      type: 'prioritize_engine',
      cabinType: 'engine',
    },
    feedback: 'alert',
  },
  {
    id: 'cmd_weapon_overheat_warn',
    name: '武器舱过热预警',
    description: '武器舱点数接近过热阈值时，禁止继续分配并标记风险',
    enabled: true,
    condition: {
      type: 'weapon_near_overheat',
      value: 80,
    },
    action: {
      type: 'warn_weapon_overheat',
      cabinType: 'weapon',
    },
    feedback: 'disable_cabin',
  },
];
