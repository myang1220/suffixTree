import React from "react";

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  const instructions = [
    {
      title: "Placing Nodes",
      description: "Click anywhere on the canvas to create a new node.",
    },
    {
      title: "Creating Lines",
      description:
        "Click and drag from one node to another to create a directional line.",
    },
    {
      title: "Selecting Nodes/Lines",
      description:
        "Click on a node or line to select it. Selected items will be highlighted in blue.",
    },
    {
      title: "Adding Labels",
      description:
        "After selecting a node or line, enter a label in the input field below the canvas.",
    },
    {
      title: "Moving Nodes",
      description:
        "Hold Shift and click-drag a node to move it. Connected lines will adjust automatically.",
    },
    {
      title: "Removing Nodes/Lines",
      description:
        "Select a node or line and press Delete or Backspace to remove it.",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Suffix Tree Editor Instructions
        </h2>
        <ul className="space-y-4">
          {instructions.map((instruction, index) => (
            <li key={index} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold text-lg mb-2">
                {instruction.title}
              </h3>
              <p className="text-gray-600">{instruction.description}</p>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-400"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;
