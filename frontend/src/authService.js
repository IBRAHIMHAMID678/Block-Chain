
// Mock function to register a doctor (This would be an API call in real life)
export const registerDoctor = async (username, password, name) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name })
        });
        return await response.json();
    } catch (error) {
        return { error: error.message };
    }
};

// Mock function to login
export const loginDoctor = async (username, password) => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        throw error;
    }
};
