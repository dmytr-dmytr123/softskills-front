import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Slider from "@mui/material/Slider";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useTheme } from "@mui/material/styles";
import Form from "react-bootstrap/Form";
import "./DNDconstructor.css";
import { Radio, RadioGroup, FormControlLabel, Typography } from "@mui/material";
import { Checkbox, FormGroup } from "@mui/material";
import ReactSelect from "react-select";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { Toast } from "react-bootstrap";

const ItemTypes = {
  QUESTION: "question",
  TEXT_AREA: "textArea",
  RADIO: "radio",
  MULTI_CHOICE: "multiChoice",
  SKILL_SELECTOR: "skillSelector",
  YES_NO_QUESTION: "yesNoQuestion",
};

const DraggableYesNoQuestion = ({ content }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.YES_NO_QUESTION,
      item: { type: "yesNoQuestion", content: "ABC" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [content]
  );

  return (
    <div
      ref={drag}
      className="draggable-question"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {content}
    </div>
  );
};

const DraggableMultiChoice = ({ content }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.MULTI_CHOICE,
      item: { type: "multiChoice", content },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [content]
  );

  return (
    <div
      ref={drag}
      className="draggable-question"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {content}
      {/* <div> Add your multiple choice question layout here</div> */}
    </div>
  );
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 0;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      backgroundColor: "#C9D0FB",
      marginLeft: "-13px",
    },
  },
};

const names = [
  "Skill number one",
  "Skill number two",
  "Skill number three",
  "Skill number four",
];

function getStyles(name, personName1, theme) {
  return {
    fontWeight:
      personName1.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function getStyles1(name, personName2, theme) {
  return {
    fontWeight:
      personName2.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const CheckboxWithFormControl = ({
  option,
  handleOptionChange,
  characteristicList,
  handleDeleteOption,
}) => {
  //handle characteristics to get id and title separately
  const handleCharacteristicChange = (event) => {
    const selectedId = event.target.value;
    const selectedCharacteristic = characteristicList.find(
      (char) => char._id === selectedId
    );
    handleOptionChange(option.id, "characteristicId", selectedId);
    console.log("SELECTED", selectedCharacteristic);
  };
  return (
    <div className="checkbox-with-form-control option-container">
      <FormControlLabel
        control={
          <Checkbox
            className="checkbox_mult"
            checked={option.checked || false}
            onChange={(e) =>
              handleOptionChange(option.id, "checked", e.target.checked)
            }
            name={option.label}
          />
        }
        label={
          <TextField
            size="small"
            variant="outlined"
            style={{ border: "none !important" }}
            className="questionText"
            value={option.label}
            onChange={(e) =>
              handleOptionChange(option.id, "label", e.target.value)
            }
          />
        }
      />

      <Form.Control
        size="sm"
        type="number"
        placeholder="+/- 1"
        className="addPointsYN"
        value={option.points}
        onChange={(e) =>
          handleOptionChange(option.id, "points", Number(e.target.value))
        }
        style={{ margin: "0", width: "100px" }}
        required
      />
      <FormControl style={{ width: "200px", marginLeft: "10px" }}>
        <Select
          displayEmpty
          className="ch_mult_txt"
          value={option.characteristicId}
          onChange={handleCharacteristicChange}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>Choose characteristic</em>;
            }

            const selectedChar = characteristicList.find(
              (char) => char._id === selected
            );
            return selectedChar ? (
              selectedChar.title
            ) : (
              <em>Choose characteristic</em>
            );
          }}
          className="ch_mult_txt"
          MenuProps={MenuProps}
          inputProps={{ "aria-label": "Without label" }}
        >
          <MenuItem disabled value="">
            <em>Choose characteristic</em>
          </MenuItem>

          {characteristicList.map((char) => (
            <MenuItem key={char._id} value={char._id}>
              {char.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton
        onClick={() => handleDeleteOption(option.id)}
        style={{ marginLeft: "10px", marginTop: "1%" }}
      >
        X
      </IconButton>
    </div>
  );
};

const MultiChoiceItem = ({
  content,
  answers,
  points,
  characteristics,
  index,
  items,
  onDelete,
  onUpdate,
}) => {
  const [questionName, setQuestionName] = useState("QuestionName");
  //option structure
  const [options, setOptions] = useState([
    {
      id: 1,
      label: "Option 1",
      points: 0,
      characteristicId: "65c3adfbfe2b0e98e5ba7374",
      checked: false,
    },
  ]);
  const [characteristicList, setCharacteristicList] = useState([]); //characteristics list

  const handleOptionChange = (optionId, field, value) => {
    const updatedOptions = options.map((option) => {
      if (option.id === optionId) {
        return { ...option, [field]: value };
      }
      return option;
    });
    setOptions(updatedOptions);
  };

  
  const [nextId, setNextId] = useState(2);

  //add new option
  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        id: nextId,
        label: `Option ${nextId}`,
        points: 0,
        characteristicId: "65c3adfbfe2b0e98e5ba7374",
        checked: false,
      },
    ]);
    setNextId(nextId + 1); //increment nextId for the next new option
  };

  //delete option
  const handleDeleteOption = (optionId) => {
    const updatedOptions = options.filter((option) => option.id !== optionId);
    setOptions(updatedOptions);
    onUpdate(index, {
      content: questionName,
      options: updatedOptions.map((option) => ({
        text: option.label,
        isCorrect: option.checked,
        characteristicId: option.characteristicId,
        points: option.points,
      })),
    });
  };
  //get characteristics
  const fetchCharacteristics = async (authToken) => {
    try {
      const response = await axios.get(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/characteristics",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const fetchedCharacteristics = response.data.map((char) => ({
        _id: char._id,
        title: char.title,
      }));

      console.log(fetchedCharacteristics);
      setCharacteristicList(fetchedCharacteristics);
    } catch (error) {
      console.error("Error fetching characteristics:", error);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("Auth token is not available.");
      return;
    }
    fetchCharacteristics(authToken);
    // In your component rendering the Select


  }, []);

  useEffect(() => {
    //update localstorage
    onUpdate(index, {
      content: questionName,
      options: options.map((option) => ({
        label: option.label,
        checked: option.checked,
        characteristicId: option.characteristicId,
        points: option.points,
      })),
    });
  }, [questionName, options, onUpdate, index]);
  return (
    <div className="question-item">
      <div className="fristWrapper">
        <p className="firstQuestion">{index + 1}</p>
        <input
          className="fristQuestionText"
          contenteditable="true"
          value={questionName}
          required
          onChange={(e) => setQuestionName(e.target.value)}
        />
        <button className="closeButton" onClick={() => onDelete(index)}>
          X
        </button>
      </div>

      <div className="option-container">
        <div className="correct-answer-section" style={{ display: "flex" }}>
          <div>
            {options.map((option, idx) => (
              <CheckboxWithFormControl
                key={idx}
                option={option}
                handleOptionChange={handleOptionChange}
                handleDeleteOption={handleDeleteOption}
                characteristicList={characteristicList}
              />
            ))}
          </div>
        </div>
      </div>
      <FormGroup>
        <IconButton onClick={handleAddOption} color="primary" size="small">
          <div className="circlee">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
            >
              <path
                d="M0 4C0 1.79086 1.79086 0 4 0H19C21.2091 0 23 1.79086 23 4V19C23 21.2091 21.2091 23 19 23H4C1.79086 23 0 21.2091 0 19V4Z"
                fill="#DBDFF4"
              />
              <path
                d="M4.13998 11.5H18.4"
                stroke="#384699"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d="M11.27 18.4V4.60002"
                stroke="#384699"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </IconButton>
      </FormGroup>
    </div>
  );
};

const YesNoQuestionItem = ({
  content,
  answers,
  points,
  characteristics,
  index,
  items,
  onDelete,
  onUpdate,
}) => {
  const [answer, setAnswer] = useState(null);
  const [questionName, setQuestionName] = useState("QuestionName");
  const [yesPoints, setYesPoints] = useState(null); // points for yes
  const [noPoints, setNoPoints] = useState(null); // points for no
  const [characteristicsList, setCharacteristicsList] = useState([]); // characteristics list
  const [selectedYesChar, setSelectedYesChar] = useState({ id: "65c3adfbfe2b0e98e5ba7374", title: "Self-respect" });
  const [selectedNoChar, setSelectedNoChar] = useState({ id: "65c3adfbfe2b0e98e5ba7374", title: "Self-respect" });

  //get chrateristic
  const fetchCharacteristics = async (authToken) => {
    try {
      const response = await axios.get(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/characteristics",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const fetchedCharacteristics = response.data.map((char) => ({
        _id: char._id,
        title: char.title,
      }));

      console.log("fetchedCH", fetchedCharacteristics);
      setCharacteristicsList(fetchedCharacteristics);
    } catch (error) {
      console.error("Error fetching characteristics:", error);
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("Auth token is not available.");
      return;
    }
    fetchCharacteristics(authToken);
  }, []);

  const handleChangeQuestionName = (e) => {
    setQuestionName(e.target.value);
  };
  //handle yes characteristic
  const handleYesCharChange = (event) => {
    const charId = event.target.value;
    const char = characteristicsList.find((c) => c._id === charId);
    setSelectedYesChar({ id: char._id, title: char.title });
    onUpdate(index, {
      content: questionName,
      answers: ["Yes", "No"],
      points: [yesPoints, noPoints],
      characteristics: [selectedYesChar, selectedNoChar],
    });
  };

  //handle no characteristic

  const handleNoCharChange = (event) => {
    const charId = event.target.value;
    const char = characteristicsList.find((c) => c._id === charId);
    setSelectedNoChar({ id: char._id, title: char.title });
    onUpdate(index, {
      content: questionName,
      answers: ["Yes", "No"],
      points: [yesPoints, noPoints],
      characteristics: [selectedYesChar, selectedNoChar],
    });
  };

  useEffect(() => {
    onUpdate(index, {
      content: questionName,
      answers: ["Yes", "No"],
      points: [yesPoints, noPoints],
      characteristics: [selectedYesChar, selectedNoChar],
    });
    
  }, [questionName, yesPoints, noPoints, onUpdate, index]);
  
  const theme = useTheme();
  const [personName1, setPersonName1] = React.useState([]);
  const [personName2, setPersonName2] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName1(typeof value === "string" ? value.split(",") : value);
  };

  const handleChange2 = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName2(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <div className="question-item">
      <div className="fristWrapper">
        <div className="firstQuestion">{index + 1}</div>
        <input
          className="fristQuestionText"
          contenteditable="true"
          value={questionName}
          required
          onChange={handleChangeQuestionName}
        />

        <button className="closeButton" onClick={() => onDelete(index)}>
          X
        </button>
      </div>
      <div className="yes-no-buttons">
        <Button
          variant="contained"
          onClick={() => setAnswer("yes")}
          sx={{
            backgroundColor: answer === "yes" ? "#1976d2" : "#5061C5", // Change color when selected
            "&:hover": {
              backgroundColor: answer === "yes" ? "#115293" : "#64b5f6", // Darker on hover
            },
            color: "white",
            fontSize: "34px",
            width: "190px",
            height: "41.158px",
            margin: "5px", // Spacing between buttons
            textTransform: "none", // Prevent uppercase transformation
            boxShadow: "none", // No shadow for a flatter appearance
          }}
          className="yesno_button"
        >
          Yes
        </Button>

        <Button
          variant="contained"
          onClick={() => setAnswer("no")}
          sx={{
            backgroundColor: answer === "no" ? "#1976d2" : "#5061C5",
            "&:hover": {
              backgroundColor: answer === "no" ? "#115293" : "#64b5f6",
            },
            color: "white",
            width: "190px",
            height: "41.158px",

            fontSize: "34px",
            margin: "5px",
            textTransform: "none",
            boxShadow: "none",
          }}
          className="yesno_button"
        >
          No
        </Button>
      </div>
      <div className="wrapperPointsYN">
        <Form.Control
          size="sm"
          type="number"
          placeholder="+/- 1"
          className="addPointsYN"
          value={yesPoints}
          onChange={(e) => setYesPoints(Number(e.target.value))}
          required
        />
        <Form.Control
          size="sm"
          type="number"
          placeholder="+/- 1"
          className="addPointsYN"
          value={noPoints}
          onChange={(e) => setNoPoints(Number(e.target.value))}
          required
        />
      </div>
      <div className="categoryDrop d-flex justify-content-evenly">
        <FormControl style={{ width: "200px" }}>
          <Select
            displayEmpty
            labelId="yes-characteristic-label"
            value={selectedYesChar ? selectedYesChar.id : ""}
            onChange={handleYesCharChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Choose characteristic</em>;
              }

              return selectedYesChar.title;
            }}
            className="ch_mult_txt"
            MenuProps={MenuProps}
            inputProps={{ "aria-label": "Without label" }}
          >
            <MenuItem disabled value="">
              <em>Choose characteristic</em>
            </MenuItem>
            {characteristicsList.map((char) => (
              <MenuItem key={char._id} value={char._id}>
                {char.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ width: "200px" }}>
          <Select
            displayEmpty
            labelId="yes-characteristic-label"
            value={selectedNoChar ? selectedNoChar.id : ""}
            onChange={handleNoCharChange}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <em>Choose characteristic</em>;
              }

              return selectedNoChar.title;
            }}
            className="ch_mult_txt"
            MenuProps={MenuProps}
            inputProps={{ "aria-label": "Without label" }}
          >
            <MenuItem disabled value="">
              <em>Choose characteristic</em>
            </MenuItem>
            {characteristicsList.map((char) => (
              <MenuItem key={char._id} value={char._id}>
                {char.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

// Drop area for adding questions
const DropArea = ({ onAddItem }) => {
  const [, drop] = useDrop(
    () => ({
      accept: Object.values(ItemTypes),
      drop: (item, monitor) => {
        if (item.type === ItemTypes.YES_NO_QUESTION) {
          onAddItem({
            type: ItemTypes.YES_NO_QUESTION,
            content: "",
            answers: ["", ""],
            characteristics: [
              { id: null, title: "" },
              { id: null, title: "" },
            ],
          });
        } else if (item.type === ItemTypes.MULTI_CHOICE) {
          onAddItem({
            type: ItemTypes.MULTI_CHOICE,
            content: "",
            answers: [],
            characteristics: [],
          });
        }
      },
    }),
    [onAddItem]
  );

  return (
    <div ref={drop} className="drop-area">
      Drop here to add a question
    </div>
  );
};

function DNDconstructor() {
  const [items, setItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const addItem = (newItem) => {
    const updatedItems = [...items, { ...newItem, id: Math.random() }];
    setItems(updatedItems);
    localStorage.setItem("dnd-items", JSON.stringify(updatedItems));
  };

  const deleteItem = (index) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    localStorage.setItem("dnd-items", JSON.stringify(updatedItems));
  };

  const editItem = (indexToEdit, newContent) => {
    setItems(
      items.map((item, index) => {
        if (index === indexToEdit) {
          return { ...item, content: newContent };
        }
        return item;
      })
    );
  };

  const updateItem = (index, newItemContent) => {
    const updatedItems = items.map((item, idx) =>
      idx === index ? { ...item, ...newItemContent } : item
    );
    setItems(updatedItems);
    localStorage.setItem("dnd-items", JSON.stringify(updatedItems));
  };
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("dnd-items")) || [];
    if (savedItems.length > 0) {
      setItems(savedItems);
    }
  }, []);

  const sendQuestion = async (question) => {
    const authToken = localStorage.getItem("authToken");

    try {
      const response = await axios.post(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/questions",
        question,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data; // Assuming this is the format
    } catch (error) {
      console.error(
        "Failed to send question:",
        question,
        error.response || error.message
      );
      throw error; // Rethrowing the error to be caught by Promise.all error handling
    }
  };

  const [testTitle, setTestTitle] = useState("");

  const handleCreateTest = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const savedItems = JSON.parse(localStorage.getItem("dnd-items")) || [];

      if (!testTitle.trim()) {
        setToastMessage("Please provide a title for the test.");
        setShowToast(true);
        return;
      }

      if (savedItems.length === 0) {
        setToastMessage("Please add at least one question to the test.");
        setShowToast(true);
        return;
      }

      const questionsForApi = savedItems.map((item) => {
        if (item.type === ItemTypes.MULTI_CHOICE) {
          //map answers and correctAnswers
          const answers = item.options.map((opt) => opt.label);
          const correctAnswers = item.options.map((opt) => opt.checked);

          //map characteristic from option
          const characteristics = item.options.map((opt) => ({
            characteristicId: opt.characteristicId,
            points: opt.points,
          }));
          console.log("char:", characteristics);

          //return full question object
          return {
            question: item.content,
            type: "multiple_choice",
            answers: answers,
            correctAnswers: correctAnswers,
            characteristics: characteristics,
          };
        } else if (item.type === ItemTypes.YES_NO_QUESTION) {
          // Handle other types as needed, example for yes/no:
          return {
            question: item.content,
            type: "yes_no", //yes-no type
            answers: item.answers,
            correctAnswers: item.answers.map((answer) => answer === "Yes"), //yes is correct
            characteristics: [
              {
                characteristicId: item.characteristics[0].id,
                //characteristicId: "65c3adfbfe2b0e98e5ba7374",
                points: item.points[0], //points for yes
              },
              {
                characteristicId: item.characteristics[1].id,

                //characteristicId: "65c3adfbfe2b0e98e5ba7374", //for no answer'
                points: item.points[1], //points for no
              },
            ],
          };
        }
      });
      console.log("123", questionsForApi);
      console.log("title", testTitle);
      await questionsForApi.map((question) => {
        console.log("myquest", question);
      });
      const responses = await Promise.all(
        questionsForApi.map((question) =>
          axios.post(
            "http://ec2-34-239-91-8.compute-1.amazonaws.com/questions",
            question,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          )
        )
      );
      console.log("555", responses);

      const questionIds = responses.map((response) => response.data._id);

      // Create the test with question IDs

      /*const questionPromises = savedItems.map((item) =>
        axios.post(
          "http://ec2-34-239-91-8.compute-1.amazonaws.com/questions",
          {
            questions: questionsForApi,

          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
      );*/

      console.log("Questions: ", questionsForApi);
      //extract IDs from the responses

      // Create the test with the structured questions
      const testResponse = await axios.post(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/tests",
        {
          title: testTitle,
          questions: questionIds,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log("Test created:", testResponse.data);
      setToastMessage("Test successfully created!");
      setShowToast(true);

      localStorage.removeItem("dnd-items");
      setItems([]);
      setTestTitle("");
    } catch (error) {
      console.error("Error creating test:", error);

      let errorMessage = "Error creating test: ";

      if (error.response) {
        if (error.response.status === 500) {
          errorMessage += "Fill all fields to create the test.";
          console.log("responses1", error.message);
        } else {
          errorMessage += ` Status code ${error.response.status}.`;
        }
      } else if (error.request) {
        errorMessage += "The request was made but no response was received.";
      } else {
        errorMessage += error.message;
      }

      setToastMessage(errorMessage);
      setShowToast(true);
    }
  };

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("dnd-items"));
    //const savedTitle = localStorage.getItem("dnd-test-title");

    if (savedItems) {
      setItems(savedItems);
    }
    /*if (savedTitle) {
      setTestTitle(savedTitle);
    }*/
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <aside className="side-panel">
          <DraggableYesNoQuestion content="'Yes/No' question format." />
          <DraggableMultiChoice content="'Multiple-choice' question format." />
        </aside>

        <main className="main-content">
          <input
            className="test_name"
            placeholder="Test title"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
          />

          <div className="item-list">
            {items.map((item, index) => {
              if (item.type === ItemTypes.YES_NO_QUESTION) {
                return (
                  <YesNoQuestionItem
                    key={item.id}
                    content={item.content}
                    points={item.points}
                    answers={item.answers}
                    index={index}
                    onDelete={deleteItem}
                    items={items}
                    onUpdate={updateItem}
                  />
                );
              } else if (item.type === "multiChoice") {
                return (
                  <MultiChoiceItem
                    key={item.id}
                    content={item.content}
                    points={item.points}
                    answers={item.answers}
                    index={index}
                    onDelete={deleteItem}
                    items={items}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                  />
                );
              }
            })}
          </div>
          <DropArea onAddItem={addItem} items={items} />
          <button className="create_test" onClick={handleCreateTest}>
            Create Test
          </button>
        </main>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 1000,
            backgroundColor: toastMessage.startsWith("Error")
              ? "#f8d7da"
              : toastMessage.startsWith("Please")
              ? "#fff3cd" // Yellow color for messages starting with "Please"
              : "#dff0d8",
          }}
        >
          <Toast.Header
            style={{
              backgroundColor: toastMessage.startsWith("Error")
                ? "#d9534f"
                : toastMessage.startsWith("Please")
                ? "#ffbb00" // Lighter yellow or a different shade for the header if you prefer
                : "#5cb85c",
              color: "white",
            }}
          >
            <strong className="me-auto">Test Constructor</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </DndProvider>
  );
}

export default DNDconstructor;
