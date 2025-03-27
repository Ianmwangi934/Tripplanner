import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register | Trip Planner";
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 1500); // Redirect to login after 1.5 seconds
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div>
       {/* Registration Page Title */}
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Register an Account</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      
      {/* Add Login Redirect Button */}
      <p>Already have an account? <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>Login here</button></p>
    </div>
  );
};

export default Register;
