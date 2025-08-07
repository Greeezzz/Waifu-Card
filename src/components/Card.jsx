export default function Card({ card, isSelected, onSelect, isClickable = false, showActions = false, onAction }) {
  const getTypeColor = (type) => {
    switch(type) {
      case 'dps': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30';
      case 'sub-dps': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30';
      case 'healer': return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30';
      case 'buffer-debuffer': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/30';
    }
  };

  const getRarityStyles = (rarity) => {
    switch(rarity) {
      case 'SSR': 
        return {
          border: 'border-2 border-yellow-400 shadow-xl shadow-yellow-400/30',
          bg: 'bg-gradient-to-br from-yellow-100/20 to-yellow-300/20',
          glow: 'animate-pulse'
        };
      case 'SR': 
        return {
          border: 'border-2 border-purple-400 shadow-lg shadow-purple-400/20',
          bg: 'bg-gradient-to-br from-purple-100/20 to-purple-300/20',
          glow: ''
        };
      case 'R': 
        return {
          border: 'border-2 border-blue-400 shadow-md shadow-blue-400/20',
          bg: 'bg-gradient-to-br from-blue-100/20 to-blue-300/20',
          glow: ''
        };
      default: 
        return {
          border: 'border-2 border-gray-400 shadow-md',
          bg: 'bg-gradient-to-br from-gray-100/20 to-gray-300/20',
          glow: ''
        };
    }
  };

  const rarityStyles = getRarityStyles(card.rarity);
  const isDefeated = card.hp <= 0;
  const hpPercentage = (card.hp / card.maxHp) * 100;

  return (
    <div 
      className={`
        relative w-full aspect-[3/4] backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer transition-all duration-300
        ${rarityStyles.border} ${rarityStyles.bg} ${rarityStyles.glow}
        ${isSelected ? 'ring-4 ring-cyan-400 ring-opacity-75 transform scale-105 shadow-2xl shadow-cyan-400/30' : ''}
        ${isClickable ? 'hover:transform hover:scale-105 hover:shadow-xl' : ''}
        ${card.isStunned ? 'opacity-60 grayscale' : ''}
        ${isDefeated ? 'opacity-40 grayscale saturate-0' : ''}
      `}
      onClick={() => isClickable && onSelect && onSelect(card)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Card Image */}
      <div className="relative h-1/2 overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-cover"
        />
        
        {/* Type Badge */}
        <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg ${getTypeColor(card.type)}`}>
          {card.type === 'buffer-debuffer' ? 'BUF' : card.type.toUpperCase().slice(0,3)}
        </div>

        {/* Rarity Stars */}
        <div className="absolute top-1 left-1 flex">
          {Array.from({ length: card.rarity === 'SSR' ? 3 : card.rarity === 'SR' ? 2 : 1 }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-xs drop-shadow-lg">⭐</span>
          ))}
        </div>

        {/* Status Overlays */}
        {card.isStunned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              😵 STUNNED
            </div>
          </div>
        )}
        
        {isDefeated && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold">
              💀 DEFEATED
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="relative h-1/2 p-2 bg-black/30 backdrop-blur-sm">
        
        {/* Name */}
        <h3 className="text-white font-bold text-xs sm:text-sm truncate mb-1 drop-shadow-lg">
          {card.name}
        </h3>
        
        {/* HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-white mb-1">
            <span>❤️ {card.hp}</span>
            <span className="text-gray-300">{card.maxHp}</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                hpPercentage > 60 ? 'bg-green-500' : 
                hpPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.max(0, hpPercentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-xs text-white mb-1">
          <div className="flex items-center gap-1">
            <span>⚔️</span>
            <span className="font-bold">{card.atk}</span>
          </div>
          
          {card.shield > 0 && (
            <div className="flex items-center gap-1 bg-blue-500/30 px-1 rounded">
              <span>🛡️</span>
              <span className="font-bold">{card.shield}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span className="font-bold">{card.speed}</span>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="mb-1">
          <div className="flex justify-between text-xs text-white mb-1">
            <span>🔋 Energy</span>
            <span className="text-yellow-300">{card.energy}/{card.maxEnergy}</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.max(0, (card.energy / card.maxEnergy) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Effects */}
        <div className="flex flex-wrap gap-1 mb-1">
          {card.buffs?.slice(0,2).map((buff, i) => (
            <span key={i} className="bg-green-500/70 text-white px-1 py-0.5 rounded text-xs font-bold">
              {buff.slice(0,3).toUpperCase()}
            </span>
          ))}
          {card.debuffs?.slice(0,2).map((debuff, i) => (
            <span key={i} className="bg-red-500/70 text-white px-1 py-0.5 rounded text-xs font-bold">
              {(debuff.type || debuff).slice(0,3).toUpperCase()}
            </span>
          ))}
        </div>

        {/* Ultimate Ready Indicator */}
        {card.energy >= card.maxEnergy && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
            🌟 ULT READY!
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !isDefeated && !card.isStunned && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-2 flex flex-col gap-1 justify-center">
            <button 
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all transform hover:scale-105 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onAction && onAction('attack', card);
              }}
            >
              ⚔️ ATK
            </button>
            
            {/* Ultimate Button */}
            {card.energy >= card.maxEnergy && (
              <button 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all transform hover:scale-105 shadow-lg animate-pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction && onAction('ultimate', card, card.ultimate.type);
                }}
              >
                🌟 ULT
              </button>
            )}
            
            {card.skills?.map((skill, i) => (
              <button 
                key={i}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all transform hover:scale-105 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction && onAction('skill', card, skill);
                }}
              >
                ✨ {skill.toUpperCase()}
              </button>
            ))}
            
            <button 
              className="w-full bg-gray-600/80 hover:bg-gray-500/80 text-white py-1 rounded text-xs transition-all"
              onClick={(e) => {
                e.stopPropagation();
                // Reset to selection phase
                if (onSelect) {
                  // This will trigger resetSelection in parent
                  window.dispatchEvent(new CustomEvent('resetCardSelection'));
                }
              }}
            >
              ❌ BACK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
