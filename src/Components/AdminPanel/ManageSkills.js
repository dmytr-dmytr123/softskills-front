import React, {useState, useEffect} from "react";
import {Button, Modal, Form, Dropdown} from "react-bootstrap";
import "./ManageSkills.css";
import axios from "axios";

import Pencil from "../../Assets/Images/pencil.png";
import Delete from "../../Assets/Images/delete.png";

function ManageSkills() {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [characteristics, setCharacteristics] = useState([]);
  const [newSkill, setNewSkill] = useState({
    type: "",
    characteristics: [],
  });
  const handleShowModal = () => setShowModal(true);

  const handleCloseModal = () => setShowModal(false);

  //save new soft-skill to database
  const handleSaveSkill = async () => {
    const authToken = localStorage.getItem("authToken");

    try {
      console.log("Attempting to save skill:", newSkill);
      const response = await axios.post(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/soft-skills",
        newSkill,
        {headers: {Authorization: `Bearer ${authToken}`}}
      );
      console.log("Skill saved successfully:", response.data);
      handleCloseModal();
      fetchSkills(authToken); // update soft-skills table
    } catch (error) {
      console.error("Error saving skill:", error);
      console.error("Error:", error.message);
    }
  };

  //handle changes in softskill input

  const handleSkillChange = (e) => {
    setNewSkill({...newSkill, type: e.target.value});
  };

  //handle changes in characteristic input
  const handleCharacteristicChange = (e) => {

    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => ({
        characteristicId: option.value,
        title: option.textContent,
      })
    );
    setNewSkill({
      ...newSkill,
      characteristics: selectedOptions,
    });
    console.log(selectedOptions);
  };

  useEffect(() => {
    console.log("newskill");

    console.log(newSkill);
  }, [newSkill]);

  //get skills from database
  const fetchSkills = async (authToken) => {
    try {
      const response = await axios.get(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/soft-skills",
        {
          headers: {Authorization: `Bearer ${authToken}`},
        }
      );
      const fetchedSkills = response.data.map((skill) => ({
        title: skill.type,
        characteristics: skill.characteristics.map((c) => c.title), //Taking just name of characteristic
      }));
      setSkills(fetchedSkills);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  //get characteristics from database
  const fetchCharacteristics = async (authToken) => {

    try {
      const response = await axios.get(
        "http://ec2-34-239-91-8.compute-1.amazonaws.com/characteristics",
        {
          headers: {Authorization: `Bearer ${authToken}`},
        }
      );
      const fetchedCharacteristics = response.data.map((char) => ({
        _id: char._id,
        title: char.title,
      }));

      console.log(fetchedCharacteristics);
      setCharacteristics(fetchedCharacteristics);
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

    fetchSkills(authToken);
    fetchCharacteristics(authToken);
  }, []);

  return (
    <>
      <div className="manageTable">
        <h1 className="manageTable__title">Soft skills</h1>
        
        <button type="button" className="manageTable__add" onClick={handleShowModal}>
          <svg className="manageTable__ico" width="35" height="33" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.91998 16.5H31.2" stroke="#384699" strokeWidth="6" strokeLinecap="round"/>
            <path d="M17.56 30V3.00001" stroke="#384699" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          Add new soft skill...
        </button>

        <table className="manageTable__table">
          <div className="manageTable__body">
          {skills.map((skill, index) => (
            <div className="manageTable__tr" key={index}>
              <div className="manageTable__td-wrap">
                <div className="manageTable__td">{skill.title}</div>
                <div className="manageTable__td">{skill.characteristics.join(", ")}</div>
              </div>
              <button className="manageTable__btn" type="button">
                <img src={Pencil}/>
              </button>
              <button className="manageTable__btn" type="button">
                <img src={Delete}/>
              </button>
            </div>
          ))}
          </div>
        </table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Soft Skill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newSkill.type}
                onChange={handleSkillChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Characteristics</Form.Label>
              <Form.Control
                as="select"
                multiple
                onChange={handleCharacteristicChange}
              >
                {characteristics.map((char, index) => (
                  <option key={index} value={char._id}>
                    {char.title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveSkill}>
            Save Skill
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ManageSkills;
