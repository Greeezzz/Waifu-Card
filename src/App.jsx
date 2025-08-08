import Card from "./components/Card";
import { playerTeam as initialPlayerTeam, karbitTeam as initialKarbitTeam } from "./data/cards";
import { BattleSystem } from "./utils/battleSystem";
import { useState, useEffect } from "react";

function App() {
  const [playerTeam, setPlayerTeam] = useState(initialPlayerTeam);
  const [karbitTeam, setKarbitTeam] = useState(initialKarbitTeam);
  const [turn, setTurn] = useState("player");
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetCard, setTargetCard] = useState(null);
  const [gamePhase, setGamePhase] = useState("select"); // select, target, executing
  const [battleLog, setBattleLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Handle back button from card component
  useEffect(() => {
    const handleReset = () => {
      handleBackButton();
    };
    
    window.addEventListener('resetCardSelection', handleReset);
    return () => window.removeEventListener('resetCardSelection', handleReset);
  }, []);

  // Check for game over
  useEffect(() => {
    if (BattleSystem.isTeamDefeated(playerTeam)) {
      setGameOver(true);
      setWinner("Karbit");
    } else if (BattleSystem.isTeamDefeated(karbitTeam)) {
      setGameOver(true);
      setWinner("Player");
    }
  }, [playerTeam, karbitTeam]);

  // Process debuffs at start of turn AND give energy gain
  useEffect(() => {
    if (turn === "player") {
      const newPlayerTeam = [...playerTeam];
      const newKarbitTeam = [...karbitTeam];
      
      let messages = [];
      
      // Process debuffs for all cards
      newPlayerTeam.forEach(card => {
        messages.push(...BattleSystem.processDebuffs(card));
      });
      newKarbitTeam.forEach(card => {
        messages.push(...BattleSystem.processDebuffs(card));
      });
      
      // Give turn energy bonus to all alive cards
      newPlayerTeam.forEach(card => {
        if (card.hp > 0) {
          card.energy = Math.min(card.maxEnergy, card.energy + 10); // +10 energy per turn
        }
      });
      newKarbitTeam.forEach(card => {
        if (card.hp > 0) {
          card.energy = Math.min(card.maxEnergy, card.energy + 10); // +10 energy per turn
        }
      });
      
      if (messages.length > 0 || true) { // Always update for energy bonus
        if (messages.length === 0) {
          messages.push("⚡ All characters gain energy for the new turn!");
        }
        setBattleLog(prev => [...prev, ...messages]);
        setPlayerTeam(newPlayerTeam);
        setKarbitTeam(newKarbitTeam);
      }
    }
  }, [turn]);

  // Karbit AI turn
  useEffect(() => {
    if (turn === "karbit" && !gameOver) {
      const timer = setTimeout(() => {
        const aiAction = BattleSystem.karbitAI(karbitTeam, playerTeam);
        
        if (aiAction) {
          executeAction(aiAction);
        } else {
          // No valid action (all stunned or no alive cards), skip turn
          const aliveKarbitCards = BattleSystem.getAliveCards(karbitTeam);
          const availableCards = aliveKarbitCards.filter(card => !card.isStunned);
          
          if (availableCards.length === 0 && aliveKarbitCards.length > 0) {
            setBattleLog(prev => [...prev, `😵 All AI cards are stunned, skipping turn...`]);
          } else {
            setBattleLog(prev => [...prev, `🤖 AI has no available actions, skipping turn...`]);
          }
          endTurn();
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [turn, karbitTeam, playerTeam, gameOver]);

  const executeAction = (action) => {
    const newPlayerTeam = [...playerTeam];
    const newKarbitTeam = [...karbitTeam];
    let message = "";

    // SIMPLIFIED FIX: Determine team membership by checking which array contains the original card
    let actualAttacker = action.attacker;
    let actualTarget = action.target;
    let actualCaster = action.caster;

    // Update attacker reference
    if (actualAttacker) {
      // Check if attacker is from player team using ID-based lookup
      const isPlayerAttacker = playerTeam.some(card => card.id === action.attacker.id);
      
      if (isPlayerAttacker) {
        const playerIndex = newPlayerTeam.findIndex(c => c.id === actualAttacker.id);
        if (playerIndex !== -1) {
          actualAttacker = newPlayerTeam[playerIndex];
          actualAttacker.team = 'player';
          console.log(`[TEAM CHECK] Attacker ${actualAttacker.name} confirmed as PLAYER (ID: ${actualAttacker.id})`);
        }
      } else {
        const karbitIndex = newKarbitTeam.findIndex(c => c.id === actualAttacker.id);
        if (karbitIndex !== -1) {
          actualAttacker = newKarbitTeam[karbitIndex];
          actualAttacker.team = 'karbit';
          console.log(`[TEAM CHECK] Attacker ${actualAttacker.name} confirmed as KARBIT (ID: ${actualAttacker.id})`);
        }
      }
    }

    // Update caster reference
    if (actualCaster) {
      // Check if caster is from player team using ID-based lookup
      const isPlayerCaster = playerTeam.some(card => card.id === action.caster.id);
      
      if (isPlayerCaster) {
        const playerIndex = newPlayerTeam.findIndex(c => c.id === actualCaster.id);
        if (playerIndex !== -1) {
          actualCaster = newPlayerTeam[playerIndex];
          actualCaster.team = 'player';
          console.log(`[TEAM CHECK] Caster ${actualCaster.name} confirmed as PLAYER (ID: ${actualCaster.id})`);
        }
      } else {
        const karbitIndex = newKarbitTeam.findIndex(c => c.id === actualCaster.id);
        if (karbitIndex !== -1) {
          actualCaster = newKarbitTeam[karbitIndex];
          actualCaster.team = 'karbit';
          console.log(`[TEAM CHECK] Caster ${actualCaster.name} confirmed as KARBIT (ID: ${actualCaster.id})`);
        }
      }
    }

    // Update target reference
    if (actualTarget) {
      // Target bisa player atau karbit, cek ID dan tim
      const isPlayerTarget = playerTeam.some(card => card.id === actualTarget.id);
      const isKarbitTarget = karbitTeam.some(card => card.id === actualTarget.id);
      if (isPlayerTarget && !isKarbitTarget) {
        // Target hanya di tim player
        const playerIndex = newPlayerTeam.findIndex(c => c.id === actualTarget.id);
        if (playerIndex !== -1) {
          actualTarget = newPlayerTeam[playerIndex];
          console.log(`[TEAM CHECK] Target ${actualTarget.name} confirmed as PLAYER (ID: ${actualTarget.id})`);
        }
      } else if (isKarbitTarget && !isPlayerTarget) {
        // Target hanya di tim karbit
        const karbitIndex = newKarbitTeam.findIndex(c => c.id === actualTarget.id);
        if (karbitIndex !== -1) {
          actualTarget = newKarbitTeam[karbitIndex];
          console.log(`[TEAM CHECK] Target ${actualTarget.name} confirmed as KARBIT (ID: ${actualTarget.id})`);
        }
      } else if (isPlayerTarget && isKarbitTarget) {
        // Ada karakter kembar, tentukan target berdasarkan tim yang sedang dipilih
        if (action.action === "attack" || action.action === "skill" || action.action === "ultimate") {
          // Kalau target dipilih dari grid musuh, ambil dari karbitTeam
          const karbitIndex = newKarbitTeam.findIndex(c => c.id === actualTarget.id);
          if (karbitIndex !== -1) {
            actualTarget = newKarbitTeam[karbitIndex];
            console.log(`[TEAM CHECK] Target ${actualTarget.name} (KEMBAR) confirmed as KARBIT (ID: ${actualTarget.id})`);
          }
        } else {
          // Default ke playerTeam
          const playerIndex = newPlayerTeam.findIndex(c => c.id === actualTarget.id);
          if (playerIndex !== -1) {
            actualTarget = newPlayerTeam[playerIndex];
            console.log(`[TEAM CHECK] Target ${actualTarget.name} (KEMBAR) confirmed as PLAYER (ID: ${actualTarget.id})`);
          }
        }
      }
    }

    // Helper for effect log
    const effectLog = (type, source, target, value = null) => {
      switch(type) {
        case 'buff':
          return `🟢 ${source} buffs ${target}${value ? ` (${value})` : ''}`;
        case 'debuff':
          return `🔴 ${source} debuffs ${target}${value ? ` (${value})` : ''}`;
        case 'stun':
          return `⚡ ${source} stuns ${target}`;
        case 'heal':
          return `💚 ${source} heals ${target} for ${value} HP`;
        case 'shield':
          return `🛡️ ${source} gives ${target} ${value} shield`;
        case 'penetration':
          return `🟢 ${source} gives penetration to ${target}`;
        case 'break':
          return `🔴 ${source} breaks ${target}'s armor (-${value})`;
        default:
          return '';
      }
    };
    // Execute action with correct references
    if (action.action === "attack") {
      const damage = BattleSystem.calculateDamage(actualAttacker, actualTarget);
      message = `⚔️ ${actualAttacker.name} attacks ${actualTarget.name} for ${damage} damage!`;
    } else if (action.action === "skill") {
      message = BattleSystem.applySkill(actualCaster, actualTarget, action.skill);
      // Log effect for buffs/debuffs
      if (["heal", "shield", "pen"].includes(action.skill)) {
        if (action.skill === "heal") message += ` | ${effectLog('heal', actualCaster.name, actualTarget.name, Math.floor(actualCaster.atk * 1.2))}`;
        if (action.skill === "shield") message += ` | ${effectLog('shield', actualCaster.name, actualTarget.name, Math.floor(actualCaster.atk * 1.5))}`;
        if (action.skill === "pen") message += ` | ${effectLog('penetration', actualCaster.name, actualTarget.name)}`;
      } else if (["poison", "bleed", "stun", "break"].includes(action.skill)) {
        if (action.skill === "stun") message += ` | ${effectLog('stun', actualCaster.name, actualTarget.name)}`;
        if (action.skill === "break") message += ` | ${effectLog('break', actualCaster.name, actualTarget.name, 30)}`;
        if (action.skill === "poison") message += ` | ${effectLog('debuff', actualCaster.name, actualTarget.name, 'poison')}`;
        if (action.skill === "bleed") message += ` | ${effectLog('debuff', actualCaster.name, actualTarget.name, 'bleed')}`;
      }
    } else if (action.action === "ultimate") {
      if (actualCaster && !actualCaster.team) {
        const isPlayerCaster = playerTeam.some(card => card.id === action.caster.id);
        actualCaster.team = isPlayerCaster ? 'player' : 'karbit';
      }
      message = BattleSystem.applyUltimate(actualCaster, actualTarget, action.skill, newPlayerTeam, newKarbitTeam);
      // Example: log penetration buff from March, armor break from Zani, stun from Waguri
      if (actualCaster.name === "March 7th" && action.skill === "meteor") {
        playerTeam.forEach(card => {
          if (card.buffs?.includes("pen")) {
            message += ` | ${effectLog('penetration', "March 7th", card.name)}`;
          }
        });
      }
      if (actualCaster.name === "Zani" && action.skill === "berserk") {
        message += ` | ${effectLog('break', "Zani", actualTarget.name, 30)}`;
        playerTeam.forEach(card => {
          if (card.buffs?.includes("pen")) {
            message += ` | ${effectLog('penetration', "Zani", card.name)}`;
          }
        });
      }
      if (actualCaster.name === "Waguri Kaoruko" && action.skill === "smile") {
        karbitTeam.forEach(card => {
          if (card.isStunned) {
            message += ` | ${effectLog('stun', "Waguri", card.name)}`;
          }
        });
      }
    }

    // CRITICAL FIX: Force update ALL modified objects back to state arrays using ID-based lookup
    console.log(`[FORCE UPDATE] Updating state arrays with modified objects...`);
    
    // Update attacker in correct team array
    if (actualAttacker) {
      const isPlayerAttacker = playerTeam.some(card => card.id === action.attacker.id);
      if (isPlayerAttacker) {
        const index = newPlayerTeam.findIndex(c => c.id === actualAttacker.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Player attacker ${actualAttacker.name} energy: ${actualAttacker.energy} (ID: ${actualAttacker.id})`);
          newPlayerTeam[index] = actualAttacker;
        }
      } else {
        const index = newKarbitTeam.findIndex(c => c.id === actualAttacker.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Karbit attacker ${actualAttacker.name} energy: ${actualAttacker.energy} (ID: ${actualAttacker.id})`);
          newKarbitTeam[index] = actualAttacker;
        }
      }
    }
    
    // Update caster in correct team array
    if (actualCaster && actualCaster !== actualAttacker) {
      const isPlayerCaster = playerTeam.some(card => card.id === action.caster.id);
      if (isPlayerCaster) {
        const index = newPlayerTeam.findIndex(c => c.id === actualCaster.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Player caster ${actualCaster.name} energy: ${actualCaster.energy} (ID: ${actualCaster.id})`);
          newPlayerTeam[index] = actualCaster;
        }
      } else {
        const index = newKarbitTeam.findIndex(c => c.id === actualCaster.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Karbit caster ${actualCaster.name} energy: ${actualCaster.energy} (ID: ${actualCaster.id})`);
          newKarbitTeam[index] = actualCaster;
        }
      }
    }
    
    // Update target in correct team array
    if (actualTarget) {
      // Pastikan update target hanya di satu tim (player atau karbit, bukan dua-duanya)
      const isPlayerTarget = playerTeam.some(card => card.id === actualTarget.id);
      const isKarbitTarget = karbitTeam.some(card => card.id === actualTarget.id);
      if (isPlayerTarget && !isKarbitTarget) {
        const index = newPlayerTeam.findIndex(c => c.id === actualTarget.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Player target ${actualTarget.name} energy: ${actualTarget.energy} (ID: ${actualTarget.id})`);
          newPlayerTeam[index] = actualTarget;
        }
      } else if (isKarbitTarget && !isPlayerTarget) {
        const index = newKarbitTeam.findIndex(c => c.id === actualTarget.id);
        if (index !== -1) {
          console.log(`[FORCE UPDATE] Karbit target ${actualTarget.name} energy: ${actualTarget.energy} (ID: ${actualTarget.id})`);
          newKarbitTeam[index] = actualTarget;
        }
      } else if (isPlayerTarget && isKarbitTarget) {
        // Kalau karakter kembar, update hanya di tim target yang dipilih (default ke karbit jika aksi menyerang musuh)
        if (action.action === "attack" || action.action === "skill" || action.action === "ultimate") {
          const index = newKarbitTeam.findIndex(c => c.id === actualTarget.id);
          if (index !== -1) {
            console.log(`[FORCE UPDATE] Karbit target ${actualTarget.name} (KEMBAR) energy: ${actualTarget.energy} (ID: ${actualTarget.id})`);
            newKarbitTeam[index] = actualTarget;
          }
        } else {
          const index = newPlayerTeam.findIndex(c => c.id === actualTarget.id);
          if (index !== -1) {
            console.log(`[FORCE UPDATE] Player target ${actualTarget.name} (KEMBAR) energy: ${actualTarget.energy} (ID: ${actualTarget.id})`);
            newPlayerTeam[index] = actualTarget;
          }
        }
      }
    }

    setBattleLog(prev => [...prev, message]);
    setPlayerTeam(newPlayerTeam);
    setKarbitTeam(newKarbitTeam);
    
    endTurn();
  };

  const handleCardSelect = (card) => {
    if (turn !== "player" || gameOver) return;
    
    if (gamePhase === "select") {
      // Select player card to act with - only alive, non-stunned cards (check by ID)
      if (playerTeam.some(c => c.id === card.id) && card.hp > 0 && !card.isStunned) {
        setSelectedCard(card);
        setGamePhase("action");
        setBattleLog(prev => [...prev, `🎯 ${card.name} selected! Choose action:`]);
      }
    } else if (gamePhase === "target") {
      // Validate target selection based on action type
      const isValidTarget = validateTarget(selectedCard, card);
      
      if (isValidTarget) {
        setTargetCard(card);
        
        // Execute the action immediately
        const action = {
          action: selectedCard.currentAction,
          attacker: selectedCard,
          caster: selectedCard,
          target: card,
          skill: selectedCard.currentSkill
        };

        executeAction(action);
      } else {
        setBattleLog(prev => [...prev, `❌ Invalid target for this action!`]);
      }
    }
  };

  const validateTarget = (caster, target) => {
    if (!caster || !target) return false;
    
    if (caster.currentAction === "attack") {
      // Attack targets must be alive enemies (check by ID)
      return karbitTeam.some(card => card.id === target.id) && target.hp > 0;
    } else if (caster.currentAction === "ultimate") {
      const skill = caster.currentSkill;
      // All single-target ultimates target enemies
      if (['BOMB', 'REVERSE_TIME', 'BERSERK_PHASE1', 'BERSERK_PHASE2'].includes(skill)) {
        return karbitTeam.some(card => card.id === target.id) && target.hp > 0;
      }
      return true; // AOE ultimates don't need specific target validation
    } else if (caster.currentAction === "skill") {
      const skill = caster.currentSkill;
      
      // Buff skills target alive allies (check by ID)
      if (['heal', 'shield', 'pen'].includes(skill)) {
        return playerTeam.some(card => card.id === target.id) && target.hp > 0;
      }
      // Debuff skills target alive enemies (check by ID)
      else if (['poison', 'bleed', 'stun', 'break'].includes(skill)) {
        return karbitTeam.some(card => card.id === target.id) && target.hp > 0;
      }
    }
    
    return false;
  };

  const handleAction = (actionType, card, skill = null) => {
    if (actionType === "attack") {
      setSelectedCard({...card, currentAction: "attack"});
      setGamePhase("target");
      setBattleLog(prev => [...prev, `🎯 Select enemy target for ${card.name}'s attack`]);
    } else if (actionType === "ultimate") {
      // Special handling for Zani's two-phase berserk
      let ultimateSkill = skill;
      if (card.name === "Zani" && card.ultimateType === "BERSERK_PHASE1" && card.berserkMode) {
        ultimateSkill = "BERSERK_PHASE2";
      }
      setSelectedCard({...card, currentAction: "ultimate", currentSkill: ultimateSkill});
      // Semua ultimate sekarang harus pilih target dulu, walaupun AOE
      setGamePhase("target");
      setBattleLog(prev => [...prev, `🌟 Select target for ${card.name}'s ULTIMATE!`]);
    } else if (actionType === "skill") {
      setSelectedCard({...card, currentAction: "skill", currentSkill: skill});
      
      if (['heal', 'shield', 'pen'].includes(skill)) {
        // Buff skills target allies
        setGamePhase("target");
        setBattleLog(prev => [...prev, `✨ Select ally to buff with ${skill}`]);
      } else {
        // Debuff skills target enemies
        setGamePhase("target");
        setBattleLog(prev => [...prev, `💀 Select enemy to debuff with ${skill}`]);
      }
    }
  };

  const executePlayerAction = () => {
    if (!selectedCard || !targetCard) return;

    const action = {
      action: selectedCard.currentAction,
      attacker: selectedCard,
      caster: selectedCard,
      target: targetCard,
      skill: selectedCard.currentSkill
    };

    executeAction(action);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedCard(null);
    setTargetCard(null);
    setGamePhase("select");
  };

  const handleBackButton = () => {
    resetSelection();
    setBattleLog(prev => [...prev, `↩️ Action cancelled, select another card`]);
  };

  const endTurn = () => {
    setTurn(turn === "player" ? "karbit" : "player");
    resetSelection();
  };

  const restartGame = () => {
    window.location.reload();
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-pink-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-10 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-10 animate-ping"></div>
          <div className="absolute bottom-40 right-1/4 w-16 h-16 bg-cyan-400 rounded-full opacity-10 animate-pulse"></div>
          
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl text-center border border-white/20 max-w-md w-full">
          {/* Winner Icon */}
          <div className="mb-6">
            {winner === "Player" ? (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <span className="text-3xl">🎉</span>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <span className="text-3xl">🤖</span>
              </div>
            )}
          </div>

          {/* Winner Text */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white drop-shadow-lg">
            {winner === "Player" ? (
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Victory! �
              </span>
            ) : (
              <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Defeat! 💔
              </span>
            )}
          </h1>
          
          <p className="text-lg text-gray-200 mb-6">
            {winner === "Player" ? 
              "Congratulations! You defeated Karbit!" : 
              "Better luck next time, challenger!"
            }
          </p>

          {/* Battle Stats */}
          <div className="mb-6 space-y-2 text-sm text-gray-300">
            <p>🎮 Battle completed in {battleLog.length} moves</p>
            <p>⚔️ {winner} achieved victory!</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={restartGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg font-bold transition-all transform hover:scale-105 hover:shadow-xl"
            >
              🔄 Play Again
            </button>
            
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-600/50 hover:bg-gray-500/50 text-gray-200 px-6 py-2 rounded-xl transition-all"
            >
              🏠 Exit Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 sm:p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-12 h-12 bg-purple-400 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-40 right-1/4 w-8 h-8 bg-cyan-400 rounded-full opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-xl sm:text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          ⚔️ <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Waifu Card Battle</span> vs 
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Karbit</span> 🤖
        </h1>

        {/* Battle Status Card */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              
              {/* Turn Info */}
              <div className="text-center sm:text-left mb-3 sm:mb-0">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <div className={`w-4 h-4 rounded-full animate-pulse ${turn === "player" ? "bg-green-400" : "bg-red-400"}`}></div>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {turn === "player" ? "🎮 Your Turn" : "🤖 Karbit's Turn"}
                  </p>
                </div>
                <p className="text-xs text-gray-300">Phase: <span className="text-cyan-300 font-semibold">{gamePhase}</span></p>
              </div>
              
              {/* Action Prompts */}
              {gamePhase === "target" && (
                <div className="text-center bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                  <p className="text-sm font-semibold text-blue-200 mb-2">🎯 Choose Your Target!</p>
                  <button
                    onClick={resetSelection}
                    className="bg-gray-600/80 hover:bg-gray-500/80 text-white px-3 py-1 rounded-lg text-sm transition-all"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}

              {turn === "player" && gamePhase === "select" && (
                <div className="text-center bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                  <p className="text-sm font-semibold text-green-200 mb-2">✨ Pick a Card to Act!</p>
                  <button
                    onClick={endTurn}
                    className="bg-blue-600/80 hover:bg-blue-500/80 text-white px-4 py-2 rounded-lg text-sm transition-all font-semibold"
                  >
                    ⏭️ Skip Turn
                  </button>
                </div>
              )}

              {turn === "karbit" && (
                <div className="text-center bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                  <p className="text-sm font-semibold text-red-200">🤖 AI is thinking...</p>
                  <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mt-1"></div>
                </div>
              )}
            </div>

            {/* Battle Log */}
            <div className="bg-black/30 rounded-xl p-3 sm:p-4 border border-gray-600/30">
              <h3 className="font-bold text-sm sm:text-base mb-2 text-white flex items-center gap-2">
                📜 Battle Log
                <span className="text-xs text-gray-400">({battleLog.length} events)</span>
              </h3>
              <div className="h-20 sm:h-24 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {battleLog.slice(-6).map((log, i) => (
                  <p key={i} className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    <span className="text-gray-400">#{battleLog.length - 6 + i + 1}</span> {log}
                  </p>
                ))}
                {battleLog.length === 0 && (
                  <p className="text-xs text-gray-500 italic">Battle hasn't started yet...</p>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Teams Layout - Responsive & Deck Design */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Player Deck */}
        <div className="flex-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-blue-400/30 p-2 xs:p-3 sm:p-4 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">👤</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Player Deck</h2>
            <div className="px-3 py-1 bg-blue-500/30 rounded-full text-xs text-blue-200 border border-blue-400/40">
              {BattleSystem.getAliveCards(playerTeam).length}/{playerTeam.length} alive
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {playerTeam.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                isSelected={selectedCard === card}
                onSelect={handleCardSelect}
                isClickable={turn === "player" && card.hp > 0 && !card.isStunned}
                showActions={selectedCard === card && gamePhase === "action"}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>
        {/* Karbit Deck */}
        <div className="flex-1 bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl border border-red-400/30 p-2 xs:p-3 sm:p-4 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🤖</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Karbit Deck</h2>
            <div className="px-3 py-1 bg-red-500/30 rounded-full text-xs text-red-200 border border-red-400/40">
              {BattleSystem.getAliveCards(karbitTeam).length}/{karbitTeam.length} alive
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {karbitTeam.map((card, i) => (
              <Card
                key={card.id}
                card={card}
                isSelected={targetCard === card}
                onSelect={handleCardSelect}
                isClickable={gamePhase === "target"}
              />
            ))}
          </div>
        </div>
      </div>
      </div>
      {/* Footer: Github Link */}
      <footer className="w-full mt-8 flex justify-center items-center">
        <a
          href="https://github.com/Greeezzz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-gray-300 hover:text-white bg-black/30 px-4 py-2 rounded-full shadow-lg border border-gray-600/30 transition-all"
        >
          🌐 My GitHub: Greeezzz
        </a>
      </footer>
    </div>
  );
}

export default App;
