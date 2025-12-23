import React, { useState, useEffect } from 'react';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export const AdminPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if already logged in
        const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
        const loginTime = localStorage.getItem('admin_login_time');

        // Session expires after 24 hours
        if (loggedIn && loginTime) {
            const elapsed = Date.now() - parseInt(loginTime, 10);
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

            if (elapsed < TWENTY_FOUR_HOURS) {
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem('admin_logged_in');
                localStorage.removeItem('admin_login_time');
            }
        }
    }, []);

    if (!isLoggedIn) {
        return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
    }

    return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
};
