"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useSound } from "use-sound";

// Game state types
interface GameState {
  score: number;
  highScore: number;
  level: number;
  isPlaying: boolean;
  isGameOver: boolean;
  speed: number;
  collectedTokens: string[];
  combo: number;
  position: { x: number; y: number; z: number };
  nftTokens: NFTToken[];
  leaderboard: LeaderboardEntry[];
  soundEnabled: boolean;
  musicEnabled: boolean;
}

interface NFTToken {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  claimed: boolean;
  contractAddress: string;
}

interface LeaderboardEntry {
  id: string;
  score: number;
  name: string;
  timestamp: number;
}

interface Token {
  id: string;
  type: string;
  position: [number, number, number];
  color: string;
  collected: boolean;
}

interface Obstacle {
  id: string;
  type: string;
  position: [number, number, number];
  size: [number, number, number];
}

// Skill tokens with their properties and NFT metadata
const SKILL_TOKENS = {
  react: { 
    color: "#61dafb", 
    name: "React", 
    icon: "⚛️",
    nftMetadata: {
      name: "React Master Token",
      description: "Proven expertise in React development",
      image: "https://via.placeholder.com/300x300/61dafb/ffffff?text=React",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  node: { 
    color: "#68a063", 
    name: "Node.js", 
    icon: "🟢",
    nftMetadata: {
      name: "Node.js Expert Token",
      description: "Backend development mastery",
      image: "https://via.placeholder.com/300x300/68a063/ffffff?text=Node.js",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  solidity: { 
    color: "#363636", 
    name: "Solidity", 
    icon: "⛓️",
    nftMetadata: {
      name: "Solidity Developer Token",
      description: "Smart contract development skills",
      image: "https://via.placeholder.com/300x300/363636/ffffff?text=Solidity",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  rust: { 
    color: "#ce422b", 
    name: "Rust", 
    icon: "🦀",
    nftMetadata: {
      name: "Rust Developer Token",
      description: "Systems programming expertise",
      image: "https://via.placeholder.com/300x300/ce422b/ffffff?text=Rust",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  three: { 
    color: "#000000", 
    name: "Three.js", 
    icon: "🎮",
    nftMetadata: {
      name: "3D Web Developer Token",
      description: "3D graphics and WebGL mastery",
      image: "https://via.placeholder.com/300x300/000000/ffffff?text=Three.js",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  wagmi: { 
    color: "#ff6b35", 
    name: "Wagmi", 
    icon: "🔗",
    nftMetadata: {
      name: "Web3 Integration Token",
      description: "Ethereum dApp development",
      image: "https://via.placeholder.com/300x300/ff6b35/ffffff?text=Wagmi",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  substrate: { 
    color: "#e6007a", 
    name: "Substrate", 
    icon: "🔗",
    nftMetadata: {
      name: "Blockchain Developer Token",
      description: "Polkadot ecosystem development",
      image: "https://via.placeholder.com/300x300/e6007a/ffffff?text=Substrate",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  graphql: { 
    color: "#e10098", 
    name: "GraphQL", 
    icon: "📊",
    nftMetadata: {
      name: "API Design Token",
      description: "Modern API development skills",
      image: "https://via.placeholder.com/300x300/e10098/ffffff?text=GraphQL",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  typescript: { 
    color: "#3178c6", 
    name: "TypeScript", 
    icon: "📘",
    nftMetadata: {
      name: "Type-Safe Developer Token",
      description: "Advanced TypeScript expertise",
      image: "https://via.placeholder.com/300x300/3178c6/ffffff?text=TypeScript",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  web3: { 
    color: "#f7931e", 
    name: "Web3", 
    icon: "🌐",
    nftMetadata: {
      name: "Web3 Pioneer Token",
      description: "Decentralized web development",
      image: "https://via.placeholder.com/300x300/f7931e/ffffff?text=Web3",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  defi: { 
    color: "#ff6b35", 
    name: "DeFi", 
    icon: "💰",
    nftMetadata: {
      name: "DeFi Protocol Token",
      description: "Decentralized finance expertise",
      image: "https://via.placeholder.com/300x300/ff6b35/ffffff?text=DeFi",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
  nft: { 
    color: "#ff4cf0", 
    name: "NFT", 
    icon: "🎨",
    nftMetadata: {
      name: "NFT Creator Token",
      description: "Digital art and NFT development",
      image: "https://via.placeholder.com/300x300/ff4cf0/ffffff?text=NFT",
      contractAddress: "0x1234567890123456789012345678901234567890"
    }
  },
};

// Zustand store for game state management (unused for now)
// const useGameStore = create<GameState>((set, get) => ({
//   score: 0,
//   highScore: 0,
//   level: 1,
//   isPlaying: false,
//   isGameOver: false,
//   speed: 1,
//   collectedTokens: [],
//   combo: 0,
//   position: { x: 0, y: 0, z: 0 },
//   nftTokens: [],
//   leaderboard: [],
//   soundEnabled: true,
//   musicEnabled: true,
// }));

// Optimized sound effects hook
function useGameSounds() {
  // Only load sounds when needed to reduce initial load
  const [playCollect] = useSound('/sounds/collect.mp3', { 
    volume: 0.3,
    preload: false 
  });
  const [playCombo] = useSound('/sounds/combo.mp3', { 
    volume: 0.4,
    preload: false 
  });
  const [playGameOver] = useSound('/sounds/gameover.mp3', { 
    volume: 0.5,
    preload: false 
  });
  const [playMusic] = useSound('/sounds/synthwave.mp3', { 
    volume: 0.2, 
    loop: true,
    interrupt: false,
    preload: false
  });

  return { playCollect, playCombo, playGameOver, playMusic };
}

// Mobile touch controls
function useMobileControls(onMove: (direction: string) => void) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    const threshold = 50;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) onMove('right');
      else if (deltaX < -threshold) onMove('left');
    } else {
      if (deltaY > threshold) onMove('down');
      else if (deltaY < -threshold) onMove('up');
    }
    
    setTouchStart(null);
  };

  return { handleTouchStart, handleTouchEnd };
}

// Player component with enhanced effects
function Player({ position }: { position: { x: number; y: number; z: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Enhanced floating animation
    meshRef.current.position.y = position.y + Math.sin(clock.getElapsedTime() * 4) * 0.1;
    
    // Dynamic rotation
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 2) * 0.1;
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Main player body with enhanced materials */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color="#C700FF" 
          emissive="#C700FF"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Enhanced trail effect */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial 
          color="#C700FF" 
          transparent 
          opacity={0.5}
        />
      </mesh>
      
      {/* Energy field with pulsing effect */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color="#C700FF" 
          transparent 
          opacity={0.15}
          wireframe
        />
      </mesh>
      
      {/* Particle trail */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial 
          color="#FF4CFA" 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// NFT Claiming Component
function NFTClaimModal({ token, onClose, onClaim }: { 
  token: Token; 
  onClose: () => void; 
  onClaim: (tokenId: string) => void;
}) {
  const { isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!isConnected) {
      // For now, just show a message that wallet connection is needed
      alert('Please connect your wallet to claim NFTs');
      return;
    }

    setIsClaiming(true);
    try {
      // Simulate NFT minting/claiming
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClaim(token.id);
      onClose();
    } catch (error) {
      console.error('Failed to claim NFT:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const nftData = SKILL_TOKENS[token.type as keyof typeof SKILL_TOKENS]?.nftMetadata;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-black/90 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">{SKILL_TOKENS[token.type as keyof typeof SKILL_TOKENS]?.icon}</div>
          <h3 className="text-2xl font-bold text-cyan-200 mb-2">{nftData?.name}</h3>
          <p className="text-cyan-300/80 mb-6">{nftData?.description}</p>
          
          <div className="bg-cyan-900/20 rounded-lg p-4 mb-6">
            <div className="text-sm text-cyan-400 mb-2">NFT Details</div>
            <div className="text-xs text-cyan-300/70">
              Contract: {nftData?.contractAddress?.slice(0, 10)}...
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-cyan-500/30 rounded-lg text-cyan-200 hover:bg-cyan-900/20 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-cyan-300 transition disabled:opacity-50"
            >
              {isClaiming ? 'Claiming...' : isConnected ? 'Claim NFT' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Skill token component with NFT claiming
function SkillToken({ token, onCollect }: { token: Token; onCollect: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showNFTModal, setShowNFTModal] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Enhanced floating and rotating animation
    meshRef.current.position.y = token.position[1] + Math.sin(clock.getElapsedTime() * 3 + token.position[0]) * 0.2;
    meshRef.current.rotation.y = clock.getElapsedTime() * 2;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 1.5) * 0.3;
  });

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!token.collected) {
      onCollect(token.id);
      // Show NFT claim modal after collection (optional)
      if (Math.random() > 0.7) { // Only show NFT modal 30% of the time
        setTimeout(() => setShowNFTModal(true), 500);
      }
    }
  };

  return (
    <group position={token.position}>
      <mesh 
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={token.color}
          emissive={token.color}
          emissiveIntensity={isHovered ? 1.0 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Enhanced glowing aura */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={token.color}
          transparent 
          opacity={isHovered ? 0.4 : 0.2}
        />
      </mesh>
      
      {/* Particle effects around token */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={token.color}
          transparent 
          opacity={0.05}
          wireframe
        />
      </mesh>
      
      {/* Token label with enhanced styling */}
      <Html center distanceFactor={8}>
        <div className="text-xs font-bold text-white drop-shadow-lg bg-black/80 px-3 py-2 rounded-lg border border-cyan-400/50 backdrop-blur-sm">
          {SKILL_TOKENS[token.type as keyof typeof SKILL_TOKENS]?.icon} {SKILL_TOKENS[token.type as keyof typeof SKILL_TOKENS]?.name}
        </div>
      </Html>

      {/* NFT Claim Modal */}
      <AnimatePresence>
        {showNFTModal && (
          <NFTClaimModal
            token={token}
            onClose={() => setShowNFTModal(false)}
            onClaim={(tokenId) => {
              console.log('NFT claimed:', tokenId);
              setShowNFTModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </group>
  );
}

// Obstacle component
function Obstacle({ obstacle }: { obstacle: Obstacle }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Subtle rotation
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh ref={meshRef} position={obstacle.position}>
      <boxGeometry args={obstacle.size} />
      <meshStandardMaterial 
        color="#FF4CFA"
        emissive="#FF4CFA"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
        wireframe
      />
    </mesh>
  );
}

// Neon grid floor
function NeonGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    
    // Subtle color pulsing
    const intensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    gridRef.current.material.opacity = intensity;
  });

  return (
    <gridHelper 
      ref={gridRef}
      args={[50, 50, "#00FFE0", "#00FFE0"]} 
      position={[0, -2, 0]}
    />
  );
}

// Optimized particle system for effects
function ParticleSystem({ position, color }: { position: [number, number, number]; color: string }) {
  const points = useMemo(() => {
    const num = 20; // Reduced from 100 to 20
    const positions = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1;
      positions[i * 3 + 1] = Math.random() * 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
    }
    return positions;
  }, []);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));

  return (
    <points position={position}>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial color={color} size={0.1} transparent opacity={0.6} />
    </points>
  );
}

// Enhanced Game scene component with all features
function GameScene({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [particleEffects, setParticleEffects] = useState<Array<{ id: string; position: [number, number, number]; color: string }>>([]);
  
  // Sound effects
  const { playCollect, playCombo } = useGameSounds();
  
  // Mobile controls
  const handleMobileMove = useCallback((direction: string) => {
    const newPosition = { ...gameState.position };
    const moveSpeed = 0.5;
    
    switch (direction) {
      case 'left':
        newPosition.x = Math.max(newPosition.x - moveSpeed, -3);
        break;
      case 'right':
        newPosition.x = Math.min(newPosition.x + moveSpeed, 3);
        break;
      case 'up':
        newPosition.y = Math.min(newPosition.y + moveSpeed, 3);
        break;
      case 'down':
        newPosition.y = Math.max(newPosition.y - moveSpeed, -1);
        break;
    }
    
    setGameState({ ...gameState, position: newPosition });
  }, [gameState, setGameState]);
  
  const { handleTouchStart, handleTouchEnd } = useMobileControls(handleMobileMove);

  // Add touch event listeners to the canvas for mobile controls
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas && gameState.isPlaying) {
      const touchStartHandler = (e: TouchEvent) => handleTouchStart(e as unknown as React.TouchEvent);
      const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e as unknown as React.TouchEvent);
      
      canvas.addEventListener('touchstart', touchStartHandler);
      canvas.addEventListener('touchend', touchEndHandler);
      
      return () => {
        canvas.removeEventListener('touchstart', touchStartHandler);
        canvas.removeEventListener('touchend', touchEndHandler);
      };
    }
  }, [gameState.isPlaying, handleTouchStart, handleTouchEnd]);

  // Generate tokens (optimized)
  const generateTokens = useCallback(() => {
    const newTokens: Token[] = [];
    for (let i = 0; i < 5; i++) { // Reduced from 8 to 5
      const types = Object.keys(SKILL_TOKENS);
      const type = types[Math.floor(Math.random() * types.length)] as keyof typeof SKILL_TOKENS;
      const skill = SKILL_TOKENS[type];
      
      newTokens.push({
        id: `${Date.now()}-${i}`,
        type,
        position: [
          (Math.random() - 0.5) * 6, // Reduced spread
          Math.random() * 2 + 1,
          Math.random() * 15 + 10
        ],
        color: skill.color,
        collected: false,
      });
    }
    setTokens(newTokens);
  }, []);

  // Generate obstacles (optimized)
  const generateObstacles = useCallback(() => {
    const newObstacles: Obstacle[] = [];
    for (let i = 0; i < 3; i++) { // Reduced from 5 to 3
      newObstacles.push({
        id: `${Date.now()}-obs-${i}`,
        type: "firewall",
        position: [
          (Math.random() - 0.5) * 4, // Reduced spread
          Math.random() * 1.5 + 0.5,
          Math.random() * 15 + 10
        ],
        size: [0.4, 0.8, 0.1], // Smaller obstacles
      });
    }
    setObstacles(newObstacles);
  }, []);

  // Initialize game elements
  useEffect(() => {
    if (gameState.isPlaying) {
      generateTokens();
      generateObstacles();
    }
  }, [gameState.isPlaying, generateTokens, generateObstacles]);

  // Game loop
  useFrame(() => {
    if (!gameState.isPlaying) return;

    // Move tokens and obstacles towards player
    setTokens(prev => prev.map(token => ({
      ...token,
      position: [token.position[0], token.position[1], token.position[2] - gameState.speed * 0.1]
    })));

    setObstacles(prev => prev.map(obstacle => ({
      ...obstacle,
      position: [obstacle.position[0], obstacle.position[1], obstacle.position[2] - gameState.speed * 0.1]
    })));

    // Remove off-screen elements and generate new ones (optimized)
    setTokens(prev => {
      const filtered = prev.filter(token => token.position[2] > -5);
      if (filtered.length < 2) { // Reduced threshold
        const types = Object.keys(SKILL_TOKENS);
        const type = types[Math.floor(Math.random() * types.length)] as keyof typeof SKILL_TOKENS;
        const skill = SKILL_TOKENS[type];
        
        filtered.push({
          id: `${Date.now()}-new`,
          type,
          position: [
            (Math.random() - 0.5) * 6,
            Math.random() * 2 + 1,
            20
          ],
          color: skill.color,
          collected: false,
        });
      }
      return filtered;
    });

    setObstacles(prev => {
      const filtered = prev.filter(obstacle => obstacle.position[2] > -5);
      if (filtered.length < 1) { // Reduced threshold
        filtered.push({
          id: `${Date.now()}-obs-new`,
          type: "firewall",
          position: [
            (Math.random() - 0.5) * 4,
            Math.random() * 1.5 + 0.5,
            20
          ],
          size: [0.4, 0.8, 0.1],
        });
      }
      return filtered;
    });
  });

  const handleTokenCollect = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, collected: true } : t
    ));

    // Play sound effects
    if (gameState.soundEnabled) {
      playCollect();
      if (gameState.combo > 2) {
        playCombo();
      }
    }

    // Enhanced particle effect
    setParticleEffects(prev => [...prev, {
      id: Date.now().toString(),
      position: token.position,
      color: token.color
    }]);

    // Remove particle effect after animation (optimized)
    setTimeout(() => {
      setParticleEffects(prev => prev.slice(1));
    }, 500); // Reduced from 1000ms to 500ms

    // Update score with enhanced scoring
    const newScore = gameState.score + 10;
    const newCombo = gameState.combo + 1;
    const bonusScore = newCombo > 3 ? newCombo * 5 : 0;
    const levelBonus = Math.floor(newScore / 100) * 10;
    
    const finalScore = newScore + bonusScore + levelBonus;
    const newLevel = Math.floor(finalScore / 100) + 1;
    
    // Level transition effect (simplified)
    if (newLevel > gameState.level) {
      // Level up effect - could add visual feedback here
    }
    
    setGameState({
      ...gameState,
      score: finalScore,
      combo: newCombo,
      level: newLevel,
      collectedTokens: [...gameState.collectedTokens, token.type],
      speed: Math.min(gameState.speed + 0.1, 8),
    });
  };

  const checkCollisions = useCallback(() => {
    const playerPos = gameState.position;
    
    // Check obstacle collisions
    const collision = obstacles.find(obstacle => {
      const distance = Math.sqrt(
        Math.pow(playerPos.x - obstacle.position[0], 2) +
        Math.pow(playerPos.y - obstacle.position[1], 2) +
        Math.pow(playerPos.z - obstacle.position[2], 2)
      );
      return distance < 1;
    });

    if (collision) {
      setGameState({
        ...gameState,
        isGameOver: true,
        combo: 0,
      });
    }
  }, [gameState, obstacles, setGameState]);

  // Check collisions (optimized - less frequent)
  useEffect(() => {
    if (gameState.isPlaying) {
      const interval = setInterval(checkCollisions, 200); // Reduced from 100ms to 200ms
      return () => clearInterval(interval);
    }
  }, [gameState.isPlaying, checkCollisions]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#00FFE0" />
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#C700FF" />
      
      <NeonGrid />
      
      <Player position={gameState.position} />
      
      {tokens.map(token => (
        <SkillToken 
          key={token.id} 
          token={token} 
          onCollect={handleTokenCollect}
        />
      ))}
      
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      
      {particleEffects.slice(0, 3).map(effect => ( // Limit particle effects
        <ParticleSystem 
          key={effect.id} 
          position={effect.position} 
          color={effect.color} 
        />
      ))}
    </>
  );
}

// Enhanced Game UI component with all features
function GameUI({ gameState, setGameState }: { gameState: GameState; setGameState: (state: GameState) => void }) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { playMusic } = useGameSounds();

  const startGame = () => {
    setGameState({
      score: 0,
      highScore: gameState.highScore,
      level: 1,
      isPlaying: true,
      isGameOver: false,
      speed: 1,
      collectedTokens: [],
      combo: 0,
      position: { x: 0, y: 0, z: 0 },
      nftTokens: gameState.nftTokens,
      leaderboard: gameState.leaderboard,
      soundEnabled: gameState.soundEnabled,
      musicEnabled: gameState.musicEnabled,
    });

    // Start background music
    if (gameState.musicEnabled) {
      playMusic();
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameState.isPlaying) return;

    const moveSpeed = 0.5;
    const newPosition = { ...gameState.position };

    switch (event.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        newPosition.x = Math.max(newPosition.x - moveSpeed, -3);
        break;
      case 'd':
      case 'arrowright':
        newPosition.x = Math.min(newPosition.x + moveSpeed, 3);
        break;
      case 'w':
      case 'arrowup':
        newPosition.y = Math.min(newPosition.y + moveSpeed, 3);
        break;
      case 's':
      case 'arrowdown':
        newPosition.y = Math.max(newPosition.y - moveSpeed, -1);
        break;
    }

    setGameState({ ...gameState, position: newPosition });
  }, [gameState, setGameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score Display */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-200 font-bold text-lg">SCORE</span>
            </div>
            <div className="text-2xl font-bold text-cyan-100 drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]">
              {gameState.score.toString().padStart(6, '0')}
            </div>
            <div className="text-sm text-cyan-300/80">
              HIGH: {gameState.highScore.toString().padStart(6, '0')}
            </div>
            {gameState.combo > 1 && (
              <div className="text-sm text-yellow-400 font-bold">
                COMBO: x{gameState.combo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collected Tokens */}
      {gameState.isPlaying && gameState.collectedTokens.length > 0 && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
            <div className="text-cyan-200 text-sm font-semibold mb-2">COLLECTED</div>
            <div className="flex flex-wrap gap-1 max-w-32">
              {gameState.collectedTokens.slice(-8).map((token, index) => (
                <div 
                  key={index}
                  className="text-xs px-2 py-1 rounded border border-cyan-400/50 bg-cyan-900/30"
                >
                  {SKILL_TOKENS[token as keyof typeof SKILL_TOKENS]?.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState.isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 shadow-[0_0_32px_rgba(255,0,64,0.3)]"
              >
                <div className="text-red-400 text-6xl font-bold mb-4 drop-shadow-[0_0_16px_rgba(255,0,64,0.6)]">
                  GAME OVER
                </div>
                <div className="text-cyan-200 text-xl mb-6">
                  Final Score: <span className="text-cyan-100 font-bold">{gameState.score}</span>
                </div>
                <div className="text-cyan-300 text-sm mb-6">
                  Skills Collected: {gameState.collectedTokens.length}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl transition-all duration-300 pointer-events-auto shadow-[0_0_16px_rgba(0,247,255,0.4)] hover:shadow-[0_0_24px_rgba(0,247,255,0.6)]"
                >
                  RESTART GAME
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-12 shadow-[0_0_32px_rgba(0,247,255,0.3)]"
            >
              <motion.h1 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]"
              >
                SKILL RUNNER
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl mb-8 text-cyan-300/90"
              >
                Navigate the neon grid and collect skill tokens!
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(0,247,255,0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl transition-all duration-300 pointer-events-auto shadow-[0_0_16px_rgba(0,247,255,0.4)]"
              >
                START RUN
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Controls */}
      {gameState.isPlaying && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
            <div className="text-cyan-200 text-sm font-semibold mb-2">CONTROLS</div>
            <div className="space-y-1 text-cyan-300/80 text-xs">
              <div>• WASD or Arrow Keys to move</div>
              <div>• Swipe on mobile devices</div>
              <div>• Collect skill tokens for NFTs</div>
              <div>• Avoid obstacles!</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-cyan-200 hover:text-cyan-100 transition"
            >
              ⚙️
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="text-cyan-200 hover:text-cyan-100 transition"
            >
              🏆
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-black/90 border border-cyan-500/30 rounded-2xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold text-cyan-200 mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300">Sound Effects</span>
                  <button
                    onClick={() => setGameState({ ...gameState, soundEnabled: !gameState.soundEnabled })}
                    className={`px-3 py-1 rounded text-sm ${
                      gameState.soundEnabled 
                        ? 'bg-cyan-500 text-black' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {gameState.soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300">Background Music</span>
                  <button
                    onClick={() => setGameState({ ...gameState, musicEnabled: !gameState.musicEnabled })}
                    className={`px-3 py-1 rounded text-sm ${
                      gameState.musicEnabled 
                        ? 'bg-cyan-500 text-black' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {gameState.musicEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-4 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-black/90 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-cyan-200 mb-4">Leaderboard</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gameState.leaderboard.length === 0 ? (
                  <div className="text-cyan-300/70 text-center py-4">No scores yet</div>
                ) : (
                  gameState.leaderboard
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between bg-cyan-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-bold">#{index + 1}</span>
                          <span className="text-cyan-200">{entry.name}</span>
                        </div>
                        <span className="text-cyan-300 font-bold">{entry.score}</span>
                      </div>
                    ))
                )}
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-full mt-4 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SkillRunnerGame() {
  const [isClient, setIsClient] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: 0,
    level: 1,
    isPlaying: false,
    isGameOver: false,
    speed: 1,
    collectedTokens: [],
    combo: 0,
    position: { x: 0, y: 0, z: 0 },
    nftTokens: [],
    leaderboard: [],
    soundEnabled: true,
    musicEnabled: true,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize game data from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('skillRunnerHighScore');
      const savedLeaderboard = localStorage.getItem('skillRunnerLeaderboard');
      const savedSettings = localStorage.getItem('skillRunnerSettings');
      
      if (savedHighScore) {
        setGameState(prev => ({
          ...prev,
          highScore: parseInt(savedHighScore)
        }));
      }
      
      if (savedLeaderboard) {
        setGameState(prev => ({
          ...prev,
          leaderboard: JSON.parse(savedLeaderboard)
        }));
      }
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setGameState(prev => ({
          ...prev,
          soundEnabled: settings.soundEnabled ?? true,
          musicEnabled: settings.musicEnabled ?? true
        }));
      }
    }
  }, []);

  // Save high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillRunnerHighScore', gameState.highScore.toString());
    }
  }, [gameState.highScore]);

  // Update high score
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      setGameState(prev => ({
        ...prev,
        highScore: gameState.score
      }));
    }
  }, [gameState.score, gameState.highScore]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <section className="py-16 md:py-24">
        <div className="px-4 md:px-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]">
              SKILL RUNNER
            </h3>
            <p className="text-lg text-cyan-300/90 max-w-2xl mx-auto">
              Navigate the neon grid and collect skill tokens in this futuristic endless runner!
            </p>
          </div>
        </div>
        <div className="relative h-[600px] w-full max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-cyan-300">Loading game...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="px-4 md:px-8 mb-8">
        <div className="text-center mb-8">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]">
            SKILL RUNNER
          </h3>
          <p className="text-lg text-cyan-300/90 max-w-2xl mx-auto">
            Navigate the neon grid and collect skill tokens in this futuristic endless runner!
          </p>
        </div>
      </div>
      
      <div 
        className="relative h-[600px] w-full max-w-4xl mx-auto"
      >
        <Canvas
          camera={{ position: [0, 5, 8], fov: 60 }}
          className="cursor-pointer"
        >
          <color attach="background" args={["#0F0F1A"]} />
          <GameScene gameState={gameState} setGameState={setGameState} />
        </Canvas>
        
        <GameUI gameState={gameState} setGameState={setGameState} />
      </div>
    </section>
  );
}
