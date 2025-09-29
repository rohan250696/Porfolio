"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Game state types
interface GameState {
  score: number;
  highScore: number;
  level: number;
  isPlaying: boolean;
  isGameOver: boolean;
  tower: Block[];
  currentBlock: Block | null;
  nextBlock: Block;
}

interface Block {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  isFalling: boolean;
}

// Skill types with their properties
const SKILL_TYPES = {
  react: { color: "#61dafb", name: "React", weight: 1.0 },
  node: { color: "#68a063", name: "Node.js", weight: 1.1 },
  solidity: { color: "#363636", name: "Solidity", weight: 1.2 },
  rust: { color: "#ce422b", name: "Rust", weight: 1.3 },
  three: { color: "#000000", name: "Three.js", weight: 0.9 },
  wagmi: { color: "#ff6b35", name: "Wagmi", weight: 0.8 },
  substrate: { color: "#e6007a", name: "Substrate", weight: 1.4 },
  graphql: { color: "#e10098", name: "GraphQL", weight: 1.1 },
};

// Game component
function GameBlock({ block, isCurrent = false }: { block: Block; isCurrent?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    if (isCurrent) {
      // Floating animation for current block
      meshRef.current.position.y = block.position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.1;
    }

    if (isGlitching) {
      // Glitch effect
      meshRef.current.rotation.x = (Math.random() - 0.5) * 0.2;
      meshRef.current.rotation.z = (Math.random() - 0.5) * 0.2;
    }
  });

  // const handleCollision = () => {
  //   setIsGlitching(true);
  //   setTimeout(() => setIsGlitching(false), 500);
  // };

  return (
    <mesh
      ref={meshRef}
      position={block.position}
      rotation={block.rotation}
    >
      <boxGeometry args={block.size} />
      <meshStandardMaterial 
        color={block.color} 
        emissive={block.color}
        emissiveIntensity={isCurrent ? 0.6 : 0.3}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={isCurrent ? 0.9 : 1}
      />
      {/* Add wireframe outline for better visibility */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...block.size)]} />
        <lineBasicMaterial color="#00f7ff" transparent opacity={0.8} />
      </lineSegments>
      {isCurrent && (
        <Html center distanceFactor={4}>
          <div className="text-sm font-bold text-white drop-shadow-lg bg-black/60 px-2 py-1 rounded border border-cyan-400">
            {SKILL_TYPES[block.type as keyof typeof SKILL_TYPES]?.name}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function ParticleBurst({ position }: { position: [number, number, number] }) {
  const points = useMemo(() => {
    const num = 50;
    const positions = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));

  return (
    <points position={position}>
      <bufferGeometry attach="geometry" {...geometry} />
      <pointsMaterial color="#ff0040" size={0.1} transparent opacity={0.8} />
    </points>
  );
}

function Tower({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => (
        <GameBlock key={block.id} block={block} />
      ))}
    </>
  );
}

function GameScene({ gameState, setGameState, achievements, setAchievements }: { 
  gameState: GameState; 
  setGameState: (state: GameState) => void;
  achievements: Array<{ id: string; message: string; type: 'milestone' | 'height' | 'score' }>;
  setAchievements: React.Dispatch<React.SetStateAction<Array<{ id: string; message: string; type: 'milestone' | 'height' | 'score' }>>>;
}) {
  const { camera } = useThree();
  const [particleBursts, setParticleBursts] = useState<Array<{ id: string; position: [number, number, number] }>>([]);

  // Dynamic camera positioning based on tower height
  useEffect(() => {
    const towerHeight = gameState.tower.length * 0.5;
    const cameraHeight = Math.max(5, towerHeight + 3);
    const cameraDistance = Math.max(8, towerHeight * 0.8 + 6);
    
    camera.position.set(0, cameraHeight, cameraDistance);
    camera.lookAt(0, towerHeight / 2, 0);
  }, [camera, gameState.tower.length]);

  const handleBlockPlace = (x: number, z: number) => {
    if (!gameState.currentBlock) return;

    const newBlock: Block = {
      ...gameState.currentBlock,
      position: [x, gameState.tower.length * 0.5, z],
      isFalling: false,
    };

    // Check for collision/instability
    const isStable = checkStability(gameState.tower, newBlock);
    
    if (!isStable) {
      // Game over - add particle burst
      setParticleBursts(prev => [...prev, { 
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        position: [x, gameState.tower.length * 0.5, z] 
      }]);
      
      setTimeout(() => {
        setParticleBursts(prev => prev.slice(1));
      }, 2000);

      setGameState({
        ...gameState,
        isGameOver: true,
        tower: [...gameState.tower, newBlock],
      });
      return;
    }

    // Successful placement
    const newTower = [...gameState.tower, newBlock];
    const newScore = gameState.score + 10;
    const newHighScore = Math.max(newScore, gameState.highScore);
    const newTowerLength = newTower.length;

    // Check for achievements
    const newAchievements: Array<{ id: string; message: string; type: 'milestone' | 'height' | 'score' }> = [];
    if (newTowerLength === 5) {
      newAchievements.push({ id: Date.now().toString(), message: "🏗️ First Foundation!", type: 'milestone' as const });
    }
    if (newTowerLength === 10) {
      newAchievements.push({ id: Date.now().toString(), message: "🏢 Tower Rising!", type: 'height' as const });
    }
    if (newTowerLength === 20) {
      newAchievements.push({ id: Date.now().toString(), message: "🏗️ Skyscraper!", type: 'height' as const });
    }
    if (newScore === 100) {
      newAchievements.push({ id: Date.now().toString(), message: "💯 Century Score!", type: 'score' as const });
    }
    if (newScore === 500) {
      newAchievements.push({ id: Date.now().toString(), message: "🎯 Master Builder!", type: 'score' as const });
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      // Auto-remove achievements after 3 seconds
      setTimeout(() => {
        setAchievements(prev => prev.filter(a => !newAchievements.some(na => na.id === a.id)));
      }, 3000);
    }

    setGameState({
      ...gameState,
      score: newScore,
      highScore: newHighScore,
      level: Math.floor(newScore / 50) + 1,
      tower: newTower,
      currentBlock: gameState.nextBlock,
      nextBlock: generateRandomBlock(),
    });
  };

  const checkStability = (tower: Block[], newBlock: Block): boolean => {
    if (tower.length === 0) return true;
    
    const lastBlock = tower[tower.length - 1];
    const distance = Math.sqrt(
      Math.pow(newBlock.position[0] - lastBlock.position[0], 2) +
      Math.pow(newBlock.position[2] - lastBlock.position[2], 2)
    );
    
    // Allow some tolerance for placement
    return distance < 0.8;
  };

  const generateRandomBlock = (): Block => {
    const types = Object.keys(SKILL_TYPES);
    const type = types[Math.floor(Math.random() * types.length)] as keyof typeof SKILL_TYPES;
    const skill = SKILL_TYPES[type];
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      size: [0.8, 0.5, 0.8],
      color: skill.color,
      isFalling: false,
    };
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f7ff" />
      <pointLight position={[-5, 5, -5]} intensity={1.0} color="#00f7ff" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} color="#ffffff" />
      
      <Tower blocks={gameState.tower} />
      
      {gameState.currentBlock && (
        <GameBlock block={gameState.currentBlock} isCurrent />
      )}
      
      {particleBursts.map((burst) => (
        <ParticleBurst key={burst.id} position={burst.position} />
      ))}
      
      {/* Ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#001122" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

function GameUI({ gameState, setGameState, achievements = [] }: { 
  gameState: GameState; 
  setGameState: (state: GameState) => void;
  achievements?: Array<{ id: string; message: string; type: 'milestone' | 'height' | 'score' }>;
}) {
  const startGame = () => {
    setGameState({
      score: 0,
      highScore: gameState.highScore,
      level: 1,
      isPlaying: true,
      isGameOver: false,
      tower: [],
      currentBlock: generateRandomBlock(),
      nextBlock: generateRandomBlock(),
    });
  };

  const generateRandomBlock = (): Block => {
    const types = Object.keys(SKILL_TYPES);
    const type = types[Math.floor(Math.random() * types.length)] as keyof typeof SKILL_TYPES;
    const skill = SKILL_TYPES[type];
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      size: [0.8, 0.5, 0.8],
      color: skill.color,
      isFalling: false,
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Futuristic Score Display */}
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
            <div className="text-sm text-cyan-300/80">
              LEVEL: {gameState.level}
            </div>
            <div className="text-xs text-cyan-400/70 mt-2">
              TOWER: {gameState.tower.length} blocks
            </div>
          </div>
        </div>
      </div>

      {/* Current Block Preview */}
      {gameState.isPlaying && gameState.currentBlock && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
            <div className="text-cyan-200 text-sm font-semibold mb-2">NEXT BLOCK</div>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-6 rounded border-2 border-cyan-400/50"
                style={{ backgroundColor: gameState.currentBlock.color }}
              ></div>
              <div className="text-cyan-100 font-bold">
                {SKILL_TYPES[gameState.currentBlock.type as keyof typeof SKILL_TYPES]?.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game over screen */}
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

      {/* Start screen */}
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
                SKILL TOWER
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl mb-8 text-cyan-300/90"
              >
                Stack your tech skills to build the ultimate tower!
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
                START GAME
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Futuristic Instructions */}
      {gameState.isPlaying && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
            <div className="text-cyan-200 text-sm font-semibold mb-2">CONTROLS</div>
            <div className="space-y-1 text-cyan-300/80 text-xs">
              <div>• Click to place blocks</div>
              <div>• Build a stable tower</div>
              <div>• Avoid misalignment!</div>
            </div>
            {/* Tower stability indicator */}
            <div className="mt-3 pt-2 border-t border-cyan-500/20">
              <div className="text-cyan-200 text-xs font-semibold mb-1">STABILITY</div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-cyan-900/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      gameState.tower.length > 10 
                        ? 'bg-gradient-to-r from-red-500 to-red-400' 
                        : gameState.tower.length > 5 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                        : 'bg-gradient-to-r from-green-500 to-green-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((gameState.tower.length / 15) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className={`text-xs ${
                  gameState.tower.length > 10 
                    ? 'text-red-400' 
                    : gameState.tower.length > 5 
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}>
                  {gameState.tower.length > 10 ? 'RISKY' : gameState.tower.length > 5 ? 'STABLE' : 'SAFE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {gameState.isPlaying && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_24px_rgba(0,247,255,0.15)]">
            <div className="text-cyan-200 text-sm font-semibold mb-2">PROGRESS</div>
            <div className="w-32 h-2 bg-cyan-900/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((gameState.score % 50) / 50 * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-cyan-300/80 text-xs mt-1">
              {50 - (gameState.score % 50)} to next level
            </div>
            {/* Tower height indicator */}
            <div className="mt-3 pt-2 border-t border-cyan-500/20">
              <div className="text-cyan-200 text-xs font-semibold mb-1">TOWER HEIGHT</div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 bg-cyan-900/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((gameState.tower.length / 20) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-cyan-300/80 text-xs">
                  {gameState.tower.length}m
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notifications */}
      <AnimatePresence>
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-cyan-500/90 to-cyan-400/90 backdrop-blur-md border border-cyan-300/50 rounded-xl p-4 shadow-[0_0_32px_rgba(0,247,255,0.6)]">
              <div className="text-black font-bold text-lg text-center">
                {achievement.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function SkillTowerGame() {
  const [isClient, setIsClient] = useState(false);
  const [achievements, setAchievements] = useState<Array<{ id: string; message: string; type: 'milestone' | 'height' | 'score' }>>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: 0,
    level: 1,
    isPlaying: false,
    isGameOver: false,
    tower: [],
    currentBlock: null,
    nextBlock: {
      id: '',
      type: 'react',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      size: [0.8, 0.5, 0.8],
      color: '#61dafb',
      isFalling: false,
    },
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize high score from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('skillTowerHighScore');
      if (savedHighScore) {
        setGameState(prev => ({
          ...prev,
          highScore: parseInt(savedHighScore)
        }));
      }
    }
  }, []);

  // Save high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skillTowerHighScore', gameState.highScore.toString());
    }
  }, [gameState.highScore]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    // Convert mouse position to 3D coordinates
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const z = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    
    // Simple placement logic (you can enhance this)
    const worldX = x * 4;
    const worldZ = z * 4;
    
    // Trigger block placement
    if (gameState.currentBlock) {
      const newBlock: Block = {
        ...gameState.currentBlock,
        position: [worldX, gameState.tower.length * 0.5, worldZ],
        isFalling: false,
      };

      const isStable = gameState.tower.length === 0 || 
        Math.abs(worldX) < 1 && Math.abs(worldZ) < 1;

      if (!isStable) {
        setGameState({
          ...gameState,
          isGameOver: true,
          tower: [...gameState.tower, newBlock],
        });
        return;
      }

      const newTower = [...gameState.tower, newBlock];
      const newScore = gameState.score + 10;
      const newHighScore = Math.max(newScore, gameState.highScore);

      setGameState({
        ...gameState,
        score: newScore,
        highScore: newHighScore,
        level: Math.floor(newScore / 50) + 1,
        tower: newTower,
        currentBlock: gameState.nextBlock,
        nextBlock: (() => {
          const types = Object.keys(SKILL_TYPES);
          const type = types[Math.floor(Math.random() * types.length)] as keyof typeof SKILL_TYPES;
          const skill = SKILL_TYPES[type];
          
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            size: [0.8, 0.5, 0.8],
            color: skill.color,
            isFalling: false,
          };
        })(),
      });
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <section className="py-16 md:py-24">
        <div className="px-4 md:px-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]">
              SKILL TOWER GAME
            </h3>
            <p className="text-lg text-cyan-300/90 max-w-2xl mx-auto">
              Build your tech stack as a 3D tower. Stack skill blocks in the right order to achieve the highest score!
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
            SKILL TOWER GAME
          </h3>
          <p className="text-lg text-cyan-300/90 max-w-2xl mx-auto">
            Build your tech stack as a 3D tower. Stack skill blocks in the right order to achieve the highest score!
          </p>
        </div>
      </div>
      
      <div className="relative h-[600px] w-full max-w-4xl mx-auto">
        <Canvas
          camera={{ position: [0, 5, 8], fov: 60 }}
          onClick={handleCanvasClick}
          className="cursor-pointer"
        >
          <GameScene gameState={gameState} setGameState={setGameState} achievements={achievements} setAchievements={setAchievements} />
        </Canvas>
        
        <GameUI gameState={gameState} setGameState={setGameState} achievements={achievements} />
      </div>
    </section>
  );
}

