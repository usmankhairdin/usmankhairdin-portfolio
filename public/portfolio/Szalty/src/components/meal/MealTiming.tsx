
import React from "react";

interface MealTimingProps {
  timing: "pre" | "during" | "post";
}

const MealTiming: React.FC<MealTimingProps> = ({ timing }) => {
  const getTimingInfo = () => {
    switch (timing) {
      case "pre":
        return {
          text: "Pre-Workout",
          className: "bg-szalty-blue text-white"
        };
      case "during":
        return {
          text: "During Workout",
          className: "bg-szalty-yellow text-black"
        };
      case "post":
        return {
          text: "Post-Workout",
          className: "bg-szalty-orange text-white"
        };
      default:
        return {
          text: "Pre-Workout",
          className: "bg-szalty-blue text-white"
        };
    }
  };

  const timingInfo = getTimingInfo();

  return (
    <div className={`${timingInfo.className} rounded-full px-3 py-1 text-xs font-medium`}>
      {timingInfo.text}
    </div>
  );
};

export default MealTiming;
