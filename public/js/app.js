document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const res = await axios.post('/api/register', { username, password });
        alert(res.data.message);
    } catch (err) {
        alert(err.response.data.error);
    }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await axios.post('/api/login', { username, password });
        alert(res.data.message);
    } catch (err) {
        alert(err.response.data.error);
    }
});
