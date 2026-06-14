import { create } from 'zustand';
import type { EmergencyCommand, ActiveCommandAlert, BattleState, Die, Ship, Enemy, GameConfig, CabinType } from '../types';
import { loadEmergencyCommands, saveEmergencyCommands, resetEmergencyCommands } from '../utils/storage';
import { defaultEmergencyCommands } from '../data/defaultCommands';
import { getTotalPointsByCabin } from '../utils/dice';

interface EmergencyCommandsState {
  commands: EmergencyCommand[];
  activeAlerts: ActiveCommandAlert[];

  loadCommands: () => void;
  saveCommands: () => void;
  resetCommands: () => void;
  updateCommand: (id: string, updates: Partial<EmergencyCommand>) => void;
  toggleCommand: (id: string) => void;
  setCommands: (commands: EmergencyCommand[]) => void;

  evaluateCommands: (
    battleState: BattleState,
    dice: Die[],
    config: GameConfig
  ) => void;
  clearAlerts: () => void;

  isCabinDisabled: (cabinType: CabinType) => boolean;
  getHighlightedCabins: () => CabinType[];
}

const priorityMap: Record<EmergencyCommand['feedback'], number> = {
  alert: 10,
  disable_cabin: 9,
  warning: 7,
  highlight_cabin: 5,
  info: 3,
};

function evaluateCondition(
  command: EmergencyCommand,
  player: Ship,
  enemy: Enemy,
  dice: Die[],
  config: GameConfig
): boolean {
  const { condition } = command;

  switch (condition.type) {
    case 'hp_below_percent': {
      const hpPercent = (player.hp / player.maxHp) * 100;
      return hpPercent < condition.value;
    }
    case 'shield_below_percent': {
      const shieldPercent = player.maxShield > 0
        ? (player.shield / player.maxShield) * 100
        : 0;
      return shieldPercent < condition.value;
    }
    case 'energy_below_percent': {
      const energyPercent = player.maxEnergy > 0
        ? (player.energy / player.maxEnergy) * 100
        : 0;
      return energyPercent < condition.value;
    }
    case 'enemy_intent_type': {
      if (condition.intentType) {
        return enemy.intent.type === condition.intentType;
      }
      return ['attack', 'charge', 'special'].includes(enemy.intent.type);
    }
    case 'weapon_near_overheat': {
      const weaponPoints = getTotalPointsByCabin(dice, 'weapon');
      const threshold = config.overheatThreshold;
      const nearThreshold = threshold * (condition.value / 100);
      return weaponPoints >= nearThreshold && weaponPoints < threshold;
    }
    default:
      return false;
  }
}

function generateAlertMessage(
  command: EmergencyCommand,
  player: Ship,
  enemy: Enemy,
  dice: Die[],
  config: GameConfig
): string {
  const { action } = command;

  switch (action.type) {
    case 'prioritize_shield': {
      const hpPercent = ((player.hp / player.maxHp) * 100).toFixed(0);
      return `⚠️ 血量危急！当前仅 ${hpPercent}%，建议优先分配护盾舱防止被击穿`;
    }
    case 'prioritize_engine': {
      const intentName = enemy.intent.type === 'charge' ? '蓄力攻击' : '强力攻击';
      const damage = enemy.intent.value;
      return `🚨 敌方正在${intentName}！预计伤害 ${damage}，建议投入引擎提升闪避率`;
    }
    case 'prioritize_repair': {
      return `🔧 检测到损伤风险，建议分配维修舱恢复船体`;
    }
    case 'prioritize_weapon': {
      return `⚔️ 敌方状态虚弱，建议集中火力攻击`;
    }
    case 'warn_weapon_overheat': {
      const weaponPoints = getTotalPointsByCabin(dice, 'weapon');
      const threshold = config.overheatThreshold;
      return `🔥 武器舱过热警告！当前点数 ${weaponPoints}，阈值 ${threshold}，继续分配将导致过热损坏`;
    }
    case 'warn_high_damage': {
      return `💥 高伤害预警！请做好防御准备`;
    }
    case 'suggest_scan': {
      return `📡 建议使用扫描舱削弱敌方闪避`;
    }
    default:
      return command.description;
  }
}

export const useEmergencyCommandsStore = create<EmergencyCommandsState>((set, get) => ({
  commands: defaultEmergencyCommands,
  activeAlerts: [],

  loadCommands: () => {
    const saved = loadEmergencyCommands();
    set({ commands: saved });
  },

  saveCommands: () => {
    const { commands } = get();
    saveEmergencyCommands(commands);
  },

  resetCommands: () => {
    const defaults = resetEmergencyCommands();
    set({ commands: defaults });
  },

  updateCommand: (id, updates) => {
    const { commands } = get();
    const newCommands = commands.map(cmd =>
      cmd.id === id ? { ...cmd, ...updates } : cmd
    );
    set({ commands: newCommands });
    saveEmergencyCommands(newCommands);
  },

  toggleCommand: (id) => {
    const { commands } = get();
    const newCommands = commands.map(cmd =>
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    );
    set({ commands: newCommands });
    saveEmergencyCommands(newCommands);
  },

  setCommands: (commands) => {
    set({ commands });
    saveEmergencyCommands(commands);
  },

  evaluateCommands: (battleState, dice, config) => {
    const { commands } = get();
    const alerts: ActiveCommandAlert[] = [];
    const { player, enemy } = battleState;

    for (const command of commands) {
      if (!command.enabled) continue;

      const triggered = evaluateCondition(command, player, enemy, dice, config);
      if (triggered) {
        const alert: ActiveCommandAlert = {
          commandId: command.id,
          commandName: command.name,
          message: generateAlertMessage(command, player, enemy, dice, config),
          feedback: command.feedback,
          priority: priorityMap[command.feedback],
          targetCabin: command.action.cabinType,
          disableCabin: command.feedback === 'disable_cabin' ? command.action.cabinType : undefined,
        };
        alerts.push(alert);
      }
    }

    alerts.sort((a, b) => b.priority - a.priority);
    set({ activeAlerts: alerts });
  },

  clearAlerts: () => {
    set({ activeAlerts: [] });
  },

  isCabinDisabled: (cabinType) => {
    const { activeAlerts } = get();
    return activeAlerts.some(alert => alert.disableCabin === cabinType);
  },

  getHighlightedCabins: () => {
    const { activeAlerts } = get();
    const cabins: CabinType[] = [];
    for (const alert of activeAlerts) {
      if (alert.targetCabin && !cabins.includes(alert.targetCabin)) {
        cabins.push(alert.targetCabin);
      }
    }
    return cabins;
  },
}));
