import React from "react";

const GoToRestaurant: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-red-100">
      <div className="p-6 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">You are outside the restaurant area</h1>
        <p>Please go to the restaurant to continue.</p>
      </div>
    </div>
  );
};

export default GoToRestaurant;
