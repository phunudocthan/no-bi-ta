import React, { useState, useEffect } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import ScoreBoard from "./components/ScoreBoard";
import GameLog from "./components/GameLog";
import BackgroundSvg from "./assets/Background.svg";

function App() {
  const [gameState, setGameState] = useState({
    boardState: [
      { piece: "human" }, // góc trên trái
      { piece: "wolf" }, // góc trên phải
      { piece: "wolf" }, // góc dưới trái
      { piece: "human" }, // góc dưới phải
      { piece: null }, // trung tâm
    ],
    selectedIndex: null,
    turn: "human",
    log: "Lượt người chơi 👧",
    round: 1,
    humanScore: 0,
    wolfScore: 0,
    isGameOver: false,
    isCheckingWin: false,
    gameEnded: false,
    botMove: null, // Track bot move for animation
  });

  const links = {
    0: [1, 4], // góc trên trái -> góc trên phải, trung tâm
    1: [0, 3, 4], // góc trên phải -> góc trên trái, dưới phải, trung tâm
    2: [3, 4], // góc dưới trái -> dưới phải, trung tâm
    3: [1, 4, 2], // góc dưới phải -> trên phải, trung tâm, dưới trái
    4: [0, 1, 2, 3], // trung tâm -> tất cả các góc
  };

  const getMovablePositions = (index) => {
    const piece = gameState.boardState[index].piece;
    if (!piece) return [];

    const possibleLinks = links[index] || [];
    console.log(
      `Checking moves for ${piece} at position ${index}, possible links:`,
      possibleLinks
    );

    const validMoves = possibleLinks.filter((linkIndex) => {
      // Chỉ cho phép di chuyển đến ô trống
      const targetPiece = gameState.boardState[linkIndex].piece;
      const isValid = targetPiece === null;
      console.log(
        `Position ${linkIndex} has piece: ${targetPiece}, valid: ${isValid}`
      );
      return isValid;
    });

    console.log(`Valid moves for ${piece} at ${index}:`, validMoves);
    return validMoves;
  };

  const hasMove = (playerType) => {
    return gameState.boardState.some((pos, i) => {
      if (pos.piece === playerType) {
        return getMovablePositions(i).length > 0;
      }
      return false;
    });
  };

  const getAllPieces = (playerType) => {
    return gameState.boardState
      .map((pos, index) => (pos.piece === playerType ? index : null))
      .filter((pos) => pos !== null);
  };

  const hasAnyPieceCanMove = (playerType) => {
    const pieces = getAllPieces(playerType);
    return pieces.some((index) => getMovablePositions(index).length > 0);
  };

  const resetGame = () => {
    setGameState({
      boardState: [
        { piece: "human" }, // góc trên trái
        { piece: "wolf" }, // góc trên phải
        { piece: "wolf" }, // góc dưới trái
        { piece: "human" }, // góc dưới phải
        { piece: null }, // trung tâm
      ],
      turn: "human",
      selectedIndex: null,
      log: "Lượt: Người 👧",
      round: 1,
      humanScore: 0,
      wolfScore: 0,
      isGameOver: false,
      isCheckingWin: false,
      gameEnded: false,
    });
  };

  const switchTurn = () => {
    const newTurn = gameState.turn === "human" ? "wolf" : "human";
    const newLog = `Lượt: ${newTurn === "human" ? "Người 👧" : "Sói 🐺"}`;

    setGameState((prev) => ({
      ...prev,
      turn: newTurn,
      log: newLog,
    }));
  };

  const resetRound = () => {
    const nextRound = gameState.round + 1;

    // Trạng thái ban đầu: hai nhân vật của mỗi phe nằm cùng một đường chéo
    const newBoardState = [
      { piece: "human" }, // góc trên trái
      { piece: "wolf" }, // góc trên phải
      { piece: "wolf" }, // góc dưới trái
      { piece: "human" }, // góc dưới phải
      { piece: null }, // trung tâm
    ];

    // Nếu round chẵn, hoán đổi vị trí hai phe theo nguyên tắc đường chéo
    if (nextRound % 2 === 0) {
      console.log("Hoán đổi vị trí cho round", nextRound);
      // Hoán đổi: người ở đường chéo trên trái-dưới phải ↔ sói ở đường chéo trên phải-dưới trái
      newBoardState[0].piece = "wolf"; // góc trên trái -> sói
      newBoardState[1].piece = "human"; // góc trên phải -> người
      newBoardState[2].piece = "human"; // góc dưới trái -> người
      newBoardState[3].piece = "wolf"; // góc dưới phải -> sói
      newBoardState[4].piece = null; // giữ ô trống ở giữa
    }

    setGameState((prev) => ({
      ...prev,
      boardState: newBoardState,
      selectedIndex: null,
      turn: "human",
      log: `Round ${nextRound}: Lượt người chơi 👧`,
      round: nextRound,
      isGameOver: false,
      isCheckingWin: false,
      gameEnded: false,
    }));
  };

  const showGameOverModal = (message, humanScore, wolfScore) => {
    const modal = document.createElement("div");
    modal.className = "game-over-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${message}</h2>
        <div class="final-score">
          <p>👧 Người: ${humanScore}</p>
          <p>🐺 Sói: ${wolfScore}</p>
        </div>
        <button onclick="window.location.reload();">Chơi lại</button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  const movePiece = (fromIndex, toIndex) => {
    const newBoardState = [...gameState.boardState];
    newBoardState[toIndex].piece = newBoardState[fromIndex].piece;
    newBoardState[fromIndex].piece = null;

    setGameState((prev) => ({
      ...prev,
      boardState: newBoardState,
      selectedIndex: null,
    }));

    switchTurn();
  };

  const handleTileClick = (fromIndex, toIndex) => {
    // Không cho phép di chuyển khi game đã kết thúc
    if (gameState.gameEnded) return;

    // Nếu chỉ có fromIndex, đây là click thông thường
    if (toIndex === undefined) {
      const piece = gameState.boardState[fromIndex].piece;

      if (gameState.selectedIndex === null) {
        // Chọn quân
        if (piece === gameState.turn) {
          setGameState((prev) => ({
            ...prev,
            selectedIndex: fromIndex,
          }));
        }
      } else {
        const moveOptions = getMovablePositions(gameState.selectedIndex);
        if (moveOptions.includes(fromIndex)) {
          // Di chuyển quân
          movePiece(gameState.selectedIndex, fromIndex);
        } else if (piece === gameState.turn) {
          // Nếu click vào quân cùng phe, chọn quân mới
          setGameState((prev) => ({
            ...prev,
            selectedIndex: fromIndex,
          }));
        } else {
          // Bỏ chọn
          setGameState((prev) => ({
            ...prev,
            selectedIndex: null,
          }));
        }
      }
    } else {
      // Đây là drag-drop hoặc bot move
      const piece = gameState.boardState[fromIndex].piece;
      if (piece === gameState.turn) {
        const moveOptions = getMovablePositions(fromIndex);
        if (moveOptions.includes(toIndex)) {
          movePiece(fromIndex, toIndex);
        }
      }
    }
  };

  // Thêm callback
  const handleBotMoveAnimationEnd = (fromIndex, toIndex) => {
    movePiece(fromIndex, toIndex);
    setGameState((prev) => ({
      ...prev,
      botMove: null,
    }));
  };

  // Sửa handleBotMove chỉ set botMove, không movePiece và không setTimeout nữa
  const handleBotMove = (fromIndex, toIndex) => {
    const piece = gameState.boardState[fromIndex].piece;
    if (piece && !gameState.boardState[toIndex].piece) {
      setGameState((prev) => ({
        ...prev,
        botMove: { fromIndex, toIndex, piece },
        selectedIndex: null,
      }));
    }
  };

  // Bot cho sói
  useEffect(() => {
    if (gameState.turn === "wolf" && !gameState.gameEnded) {
      const makeWolfMove = () => {
        // Tìm tất cả các quân sói
        const wolfPositions = gameState.boardState
          .map((pos, index) => (pos.piece === "wolf" ? index : null))
          .filter((pos) => pos !== null);

        console.log("Wolf positions:", wolfPositions);

        // Tìm tất cả các nước đi có thể
        const possibleMoves = wolfPositions.flatMap((fromIndex) => {
          const destinations = getMovablePositions(fromIndex);
          console.log(`Wolf at ${fromIndex} can move to:`, destinations);
          return destinations.map((toIndex) => ({ fromIndex, toIndex }));
        });

        console.log("All possible wolf moves:", possibleMoves);

        if (possibleMoves.length > 0) {
          // Chọn ngẫu nhiên một nước đi
          const randomMove =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          console.log("Wolf making move:", randomMove);

          // Sử dụng handleBotMove để có animation
          handleBotMove(randomMove.fromIndex, randomMove.toIndex);
        } else {
          console.log("Wolf has no valid moves, switching turn");
          // Nếu không có nước đi hợp lệ, chuyển lượt
          switchTurn();
        }
      };

      // Đợi 500ms trước khi bot đi để người chơi có thể thấy được
      const timer = setTimeout(makeWolfMove, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn]);

  // Thêm useEffect để kiểm tra thắng thua sau khi cả hai phe đã đi
  useEffect(() => {
    if (
      gameState.turn === "human" &&
      !gameState.isCheckingWin &&
      !gameState.gameEnded
    ) {
      // Đợi một chút để đảm bảo board state đã được cập nhật
      setTimeout(() => {
        const humanPieces = getAllPieces("human");
        const wolfPieces = getAllPieces("wolf");

        console.log("Checking win condition...");
        console.log("Current board state:", gameState.boardState);
        console.log("Human pieces at:", humanPieces);
        console.log("Wolf pieces at:", wolfPieces);

        const humanCanMove = humanPieces.some((index) => {
          const movablePositions = getMovablePositions(index);
          console.log(`Human piece at ${index} can move to:`, movablePositions);
          return movablePositions.length > 0;
        });

        const wolfCanMove = wolfPieces.some((index) => {
          const movablePositions = getMovablePositions(index);
          console.log(`Wolf piece at ${index} can move to:`, movablePositions);
          return movablePositions.length > 0;
        });

        console.log("Human can move:", humanCanMove);
        console.log("Wolf can move:", wolfCanMove);

        // Kiểm tra thắng thua sau khi sói đã đi xong
        if (!humanCanMove || !wolfCanMove) {
          setGameState((prev) => ({
            ...prev,
            isCheckingWin: true,
          }));

          if (!humanCanMove && !wolfCanMove) {
            console.log("Hòa round!");
            setGameState((prev) => ({
              ...prev,
              log: "Hòa round! 🤝",
            }));

            // Kiểm tra điều kiện kết thúc game
            setTimeout(() => {
              const currentHumanScore = gameState.humanScore;
              const currentWolfScore = gameState.wolfScore;

              console.log(
                "Current scores - Human:",
                currentHumanScore,
                "Wolf:",
                currentWolfScore
              );

              if (currentHumanScore >= 3 || currentWolfScore >= 3) {
                // Một bên đã thắng 3 round
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                if (currentHumanScore >= 3) {
                  showGameOverModal(
                    "Người thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                } else {
                  showGameOverModal(
                    "Sói thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                }
              } else if (
                gameState.round >= 4 &&
                currentHumanScore === 2 &&
                currentWolfScore === 2
              ) {
                // Đến round 4 mà mỗi bên 2 round thì hòa
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                showGameOverModal(
                  "Hòa chung cuộc! 🤝",
                  currentHumanScore,
                  currentWolfScore
                );
              } else {
                // Tiếp tục round tiếp theo
                setGameState((prev) => ({
                  ...prev,
                  log: "Hòa round! 🤝 - Nhấn bất kỳ đâu để tiếp tục...",
                }));
              }
            }, 2000);
          } else if (!humanCanMove) {
            console.log("Sói thắng round!");
            const newWolfScore = gameState.wolfScore + 1;
            setGameState((prev) => ({
              ...prev,
              log: "Sói thắng round! 🐺 - Người hết nước đi!",
              wolfScore: newWolfScore,
            }));

            setTimeout(() => {
              // Kiểm tra điều kiện kết thúc game
              const currentHumanScore = gameState.humanScore;
              const currentWolfScore = newWolfScore;

              console.log(
                "After wolf win - Human:",
                currentHumanScore,
                "Wolf:",
                currentWolfScore
              );

              if (currentHumanScore >= 3 || currentWolfScore >= 3) {
                // Một bên đã thắng 3 round
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                if (currentHumanScore >= 3) {
                  showGameOverModal(
                    "Người thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                } else {
                  showGameOverModal(
                    "Sói thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                }
              } else if (
                gameState.round >= 4 &&
                currentHumanScore === 2 &&
                currentWolfScore === 2
              ) {
                // Đến round 4 mà mỗi bên 2 round thì hòa
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                showGameOverModal(
                  "Hòa chung cuộc! 🤝",
                  currentHumanScore,
                  currentWolfScore
                );
              } else {
                // Tiếp tục round tiếp theo
                setGameState((prev) => ({
                  ...prev,
                  log: "Sói thắng round! 🐺 - Nhấn bất kỳ đâu để tiếp tục...",
                }));
              }
            }, 2000);
          } else if (!wolfCanMove) {
            console.log("Người thắng round!");
            const newHumanScore = gameState.humanScore + 1;
            setGameState((prev) => ({
              ...prev,
              log: "Người thắng round! 👧 - Sói hết nước đi!",
              humanScore: newHumanScore,
            }));

            setTimeout(() => {
              // Kiểm tra điều kiện kết thúc game
              const currentHumanScore = newHumanScore;
              const currentWolfScore = gameState.wolfScore;

              console.log(
                "After human win - Human:",
                currentHumanScore,
                "Wolf:",
                currentWolfScore
              );

              if (currentHumanScore >= 3 || currentWolfScore >= 3) {
                // Một bên đã thắng 3 round
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                if (currentHumanScore >= 3) {
                  showGameOverModal(
                    "Người thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                } else {
                  showGameOverModal(
                    "Sói thắng chung cuộc! 👑",
                    currentHumanScore,
                    currentWolfScore
                  );
                }
              } else if (
                gameState.round >= 4 &&
                currentHumanScore === 2 &&
                currentWolfScore === 2
              ) {
                // Đến round 4 mà mỗi bên 2 round thì hòa
                setGameState((prev) => ({
                  ...prev,
                  gameEnded: true,
                }));
                showGameOverModal(
                  "Hòa chung cuộc! 🤝",
                  currentHumanScore,
                  currentWolfScore
                );
              } else {
                // Tiếp tục round tiếp theo
                setGameState((prev) => ({
                  ...prev,
                  log: "Người thắng round! 👧 - Nhấn bất kỳ đâu để tiếp tục...",
                }));
              }
            }, 2000);
          }
        }
      }, 100);
    }
  }, [gameState.turn, gameState.boardState]);

  // Thêm event handler cho toàn bộ App
  const handleAppClick = (e) => {
    // Nếu đang chờ người chơi nhấn để tiếp tục round
    if (gameState.log.includes("Nhấn bất kỳ đâu để tiếp tục")) {
      resetRound();
      return;
    }
  };

  return (
    <div className="background-full">
      <div className="App" onClick={handleAppClick}>
        <GameBoard
          boardState={gameState.boardState}
          onTileClick={handleTileClick}
          selectedIndex={gameState.selectedIndex}
          turn={gameState.turn}
          botMove={gameState.botMove}
          onBotMoveAnimationEnd={handleBotMoveAnimationEnd}
        />
        <div className="game-info">
          <div className="score-board">
            <div className="score">
              <span>👧 Người: {gameState.humanScore}</span>
              <span>🐺 Sói: {gameState.wolfScore}</span>
            </div>
            <div className="round">Round: {gameState.round}/4</div>
          </div>
          <div className="log">{gameState.log}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
