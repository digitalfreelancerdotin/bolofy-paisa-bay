// Predefined users for direct login
const validUsers = [
    {
      email: "test@example.com",
      password: "123456",
      name: "John"
    }
  ];

  
  export const authUtils = {
    login: async (email, password) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = validUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const token = 'auth-token-' + Math.random();
      return { token, user: { name: user.name, email: user.email } };
    },
  
    logout: () => {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    },
  
    isAuthenticated: () => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    },
  
    getCurrentUser: () => {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }
  };