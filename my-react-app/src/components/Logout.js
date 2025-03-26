const Logout = () => {
    const handleLogout = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        credentials: "include",
      });
  
      if (response.ok) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    };
  
    return <button onClick={handleLogout}>Logout</button>;
  };
  
  export default Logout;
  