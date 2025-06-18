import React from "react";
import "./ScoreBoard.css";

const ScoreBoard = ({ humanScore, wolfScore }) => {
  return (
    <div className="scoreboard">
      Người: {humanScore} 👧 - Sói: {wolfScore} 🐺
    </div>
  );
};

export default ScoreBoard;
