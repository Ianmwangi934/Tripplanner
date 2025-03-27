import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("https://tripplanner-2.onrender.com:10000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      setMessage("Login successful.");
      setTimeout(() => navigate("/trip-form"), 1000); // Redirect to TripForm.js after 1 second
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      
      {/* Add Register Redirect Button */}
      <p>Don't have an account? <button onClick={() => navigate("/register")} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>Register here</button></p>
    </div>
  );
};

export default Login;
