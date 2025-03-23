import React, { useEffect } from 'react';

const RedirectToMap = () => {
    useEffect(() => {
        window.location.href = 'http://127.0.0.1:8000/api/map/';  // Make sure this URL is correct.
    }, []);

    return <div>Redirecting to the map...</div>;  // Optionally, show a message while redirecting.
};

export default RedirectToMap;
