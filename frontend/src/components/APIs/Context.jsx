import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from './Axios';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                axiosInstance.get('/profile/').then(res => setUserData(res.data));
            } catch (err) {
                setError("Failed to fetch user data.");
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div>Loading user data...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <UserContext.Provider value={userData}>
            {children}
        </UserContext.Provider>
    );
};