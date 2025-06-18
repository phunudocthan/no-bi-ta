import React, { useState, useEffect, useRef } from "react";
import "./GameBoard.css";
import BackgroundSvg from "../assets/Background.svg";
import BoardSvg from "../assets/Board.svg";
import GirlShadowSvg from "../assets/Girl+Shadow.svg";
import WolfShadowSvg from "../assets/Wolf+Shadow.svg";
import { motion, AnimatePresence } from "framer-motion";

const GameBoard = ({
  boardState,
  selectedIndex,
  onTileClick,
  turn,
  botMove,
  onBotMoveAnimationEnd,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [tempBoardState, setTempBoardState] = useState(boardState);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);
  const ghostRef = useRef(null);

  useEffect(() => {
    setTempBoardState(boardState);
  }, [boardState]);

  // Handle bot move animation
  useEffect(() => {
    if (botMove) {
      // Set initial position
      setAnimatingPiece({
        from: botMove.fromIndex,
        to: botMove.toIndex,
        piece: botMove.piece,
      });
    }
  }, [botMove]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const images = {
    human: GirlShadowSvg,
    wolf: WolfShadowSvg,
  };

  const positions = [
    { top: "16%", left: "16%" }, // góc trên trái
    { top: "17%", left: "69%" }, // góc trên phải (dùng left thay vì right)
    { top: "69%", left: "16%" }, // góc dưới trái (dùng top thay vì bottom)
    { top: "68%", left: "70%" }, // góc dưới phải (dùng top/left thay vì bottom/right)
    { top: "42%", left: "43%" }, // trung tâm (bỏ transform, dùng top/left chính xác)
  ];

  const handleDragStart = (e, index) => {
    const piece = boardState[index].piece;
    if (piece) {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";

      // Tạo ghost image
      const ghost = document.createElement("div");
      ghost.style.width = isMobile ? "50px" : "70px";
      ghost.style.height = isMobile ? "50px" : "70px";
      ghost.style.backgroundImage = `url(${images[piece]})`;
      ghost.style.backgroundSize = "contain";
      ghost.style.backgroundRepeat = "no-repeat";
      ghost.style.backgroundPosition = "center";
      ghost.style.opacity = "0.8";
      ghost.style.position = "absolute";
      ghost.style.top = "-1000px";
      ghost.style.left = "-1000px";
      ghost.style.pointerEvents = "none";
      document.body.appendChild(ghost);

      e.dataTransfer.setDragImage(
        ghost,
        isMobile ? 25 : 35,
        isMobile ? 25 : 35
      );

      // Xóa ghost sau khi đã sử dụng
      requestAnimationFrame(() => {
        document.body.removeChild(ghost);
      });

      // Cập nhật trạng thái tạm thời
      const newTempState = [...boardState];
      newTempState[index] = { ...newTempState[index], piece: null };
      setTempBoardState(newTempState);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && boardState[index].piece === null) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && boardState[index].piece === null) {
      // Gọi onTileClick với cả vị trí nguồn và đích
      onTileClick(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTempBoardState(boardState);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTempBoardState(boardState);
  };

  // Touch events for mobile
  const handleTouchStart = (e, index) => {
    if (isMobile) {
      const touch = e.touches[0];
      setTouchStartPos({ x: touch.clientX, y: touch.clientY, index });
    }
  };

  const handleTouchMove = (e) => {
    // Remove preventDefault to avoid passive listener error
    if (isMobile && touchStartPos) {
      // Just track movement, don't prevent default
    }
  };

  const handleTouchEnd = (e, index) => {
    if (isMobile && touchStartPos) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);

      // If it's a tap (small movement), treat as click
      if (deltaX < 10 && deltaY < 10) {
        handleTileClick(index);
      }

      setTouchStartPos(null);
    }
  };

  // Pointer events for better mobile support
  const handlePointerDown = (e, index) => {
    if (isMobile) {
      setTouchStartPos({ x: e.clientX, y: e.clientY, index });
    }
  };

  const handlePointerMove = (e) => {
    // Track movement without preventing default
  };

  const handlePointerUp = (e, index) => {
    if (isMobile && touchStartPos) {
      const deltaX = Math.abs(e.clientX - touchStartPos.x);
      const deltaY = Math.abs(e.clientY - touchStartPos.y);

      // If it's a tap (small movement), treat as click
      if (deltaX < 10 && deltaY < 10) {
        handleTileClick(index);
      }

      setTouchStartPos(null);
    }
  };

  // Enhanced click handler with animation
  const handleTileClick = (index) => {
    // Normal player click
    if (selectedIndex !== null && selectedIndex !== index) {
      // Check if this is a valid move
      const piece = boardState[selectedIndex].piece;
      const targetPiece = boardState[index].piece;

      if (piece && !targetPiece) {
        // Check if we should animate (mobile: all pieces, desktop: no animation for player)
        const shouldAnimate = isMobile;

        if (shouldAnimate) {
          // This is a valid move, animate the piece
          setAnimatingPiece({
            from: selectedIndex,
            to: index,
            piece: piece,
          });

          // Call the original onTileClick after animation
          setTimeout(() => {
            onTileClick(selectedIndex, index);
            setAnimatingPiece(null);
          }, 400);
        } else {
          // No animation needed, call immediately
          onTileClick(selectedIndex, index);
        }
      } else {
        // Invalid move or selecting new piece
        onTileClick(index);
      }
    } else {
      // Normal selection
      onTileClick(index);
    }
  };

  const currentBoardState = draggedIndex !== null ? tempBoardState : boardState;

  return (
    <div
      className="game-board"
      style={{
        backgroundImage: `url(${BackgroundSvg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${BoardSvg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          zIndex: 1,
        }}
      />

      {/* Animated piece overlay */}
      {animatingPiece && (
        <AnimatePresence>
          <motion.div
            className="animated-piece"
            key={`anim-${animatingPiece.from}-${animatingPiece.to}-${animatingPiece.piece}`}
            initial={{
              ...positions[animatingPiece.from],
              scale: 1,
              zIndex: 1000,
            }}
            animate={{
              ...positions[animatingPiece.to],
              scale: 1,
              zIndex: 1000,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
            style={{
              backgroundImage: `url(${images[animatingPiece.piece]})`,
            }}
            onAnimationComplete={() => {
              if (botMove && onBotMoveAnimationEnd) {
                onBotMoveAnimationEnd(animatingPiece.from, animatingPiece.to);
              }
              setAnimatingPiece(null);
            }}
          />
        </AnimatePresence>
      )}

      {currentBoardState.map((tile, index) => (
        <div
          key={index}
          className={`tile ${selectedIndex === index ? "selected" : ""} ${
            dragOverIndex === index ? "drag-over" : ""
          }`}
          style={{
            ...positions[index],
            zIndex: 2,
            backgroundImage: tile.piece ? `url(${images[tile.piece]})` : "none",
            backgroundColor: tile.piece
              ? "transparent"
              : "rgba(255, 255, 255, 0.1)",
            opacity:
              (botMove &&
                ((botMove.fromIndex === index &&
                  botMove.piece === tile.piece) ||
                  (botMove.toIndex === index &&
                    botMove.piece === tile.piece))) ||
              (animatingPiece &&
                ((animatingPiece.from === index &&
                  animatingPiece.piece === tile.piece) ||
                  (animatingPiece.to === index &&
                    animatingPiece.piece === tile.piece)))
                ? 0
                : 1,
          }}
          draggable={!!tile.piece}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onClick={() => handleTileClick(index)}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => handleTouchEnd(e, index)}
          onPointerDown={(e) => handlePointerDown(e, index)}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUp(e, index)}
        >
          {!tile.piece && (
            <div className="empty-tile">
              <span>•</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
