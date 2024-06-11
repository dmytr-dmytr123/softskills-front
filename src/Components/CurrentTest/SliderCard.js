import React, { useState } from "react";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";

const SliderCard = ({ question, number, onAnswerChange }) => {
  const { question: title, characteristics,questionId } = question;

  //SLIDER VALUE
  const [sliderValue, setSliderValue] = useState(0);

  //slider change function
  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    
    onAnswerChange(questionId, [newValue]);
  };

  return (
      <>
          <div className="firstQuestion" style={{ marginRight: "auto" }}>
            {number}
          </div>
          <div
            className="fristQuestionText"
            style={{
              textAlign: "center",
              flexGrow: 1,
              marginTop: "-6%",
              marginBottom: "5%",
            }}
          >
            {title}
          </div>
        <div></div>
        <div className="flex">
          <Slider
           className="questionSlider"
           aria-label="Temperature"
           valueLabelDisplay="auto"
           step={1}
           marks
           min={0}
           max={characteristics.length-1}
           value={sliderValue}
           onChange={handleSliderChange}
           sx={{ maxWidth: "500px" }}
          />
        </div>
      </>
  );
};

export default SliderCard;
