# React Frontend - Complete Dashboard App (App.jsx & Components)

## Main App Structure

// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import BudgetPlanner from './pages/BudgetPlanner';
import Analytics from './pages/Analytics';
import WalletSetup from './pages/WalletSetup';
import FinancialLiteracy from './pages/FinancialLiteracy';
import Navigation from './components/Navigation';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  // Set up axios interceptor for JWT
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/`);
      setUser(response.data);
    } catch (error) {
      setToken(null);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading SecureFin...</p>
      </div>
    );
  }

  return (
    <Router>
      {token && user ? (
        <>
          <Navigation user={user} onLogout={handleLogout} />
          <main className="main-container">
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/expenses" element={<ExpenseTracker user={user} />} />
              <Route path="/budget" element={<BudgetPlanner user={user} />} />
              <Route path="/analytics" element={<Analytics user={user} />} />
              <Route path="/wallet" element={<WalletSetup user={user} />} />
              <Route path="/learn" element={<FinancialLiteracy user={user} />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="*" element={<LoginPage setToken={setToken} setUser={setUser} />} />
        </Routes>
      )}
    </Router>
  );
}

## Login/Register Component

// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

export default function LoginPage({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    monthly_income: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
          username: formData.username,
          password: formData.password,
        });

        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        setToken(response.data.access);
        setUser(response.data);
      } else {
        const response = await axios.post(`${API_BASE_URL}/auth/register/`, formData);

        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        setToken(response.data.access);
        setUser(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔒 SecureFin</h1>
          <p>Blockchain-Powered Personal Finance</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-group">
                <label>Monthly Income (₹)</label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="login-features">
          <h3>Why SecureFin?</h3>
          <ul>
            <li>🔐 Blockchain-secured transactions</li>
            <li>📊 AI-powered expense insights</li>
            <li>🛡️ Fraud detection & alerts</li>
            <li>💡 Financial literacy for beginners</li>
            <li>💰 Micro-transaction support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

## Dashboard Component

// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

export default function Dashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/dashboard/`);
      setDashboardData(response.data);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!dashboardData) return <div className="error">Failed to load data</div>;

  const { monthly_income, monthly_expenses, balance, daily_spending, top_categories, budget_status } = dashboardData;

  const COLORS = ['#32B0C6', '#E67E22', '#E74C3C', '#2ECC71', '#9B59B6', '#3498DB'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username}! 👋</h1>
        <p className="date">{new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {/* Summary Cards */}
      <div className="cards-grid">
        <div className="card income-card">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <p className="card-label">Monthly Income</p>
            <h3>₹{monthly_income.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <p className="card-label">Monthly Expenses</p>
            <h3>₹{monthly_expenses.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className={`card balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <p className="card-label">Available Balance</p>
            <h3>₹{balance.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="card savings-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <p className="card-label">Savings Rate</p>
            <h3>{((balance / monthly_income) * 100).toFixed(1)}%</h3>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>🚨 Active Alerts</h2>
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`alert alert-${alert.type}`}>
                <strong>{alert.type}</strong>
                <p>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Daily Spending Trend */}
        <div className="chart-card">
          <h3>Daily Spending Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily_spending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#32B0C6" 
                dot={{ fill: '#32B0C6', r: 5 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={top_categories}
                dataKey="total"
                nameKey="category__name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {top_categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Status */}
      <div className="budget-section">
        <h2>📊 Budget Status (This Month)</h2>
        <div className="budget-list">
          {budget_status.map((budget, idx) => {
            const progressPercent = Math.min(budget.percentage, 100);
            const isWarning = budget.percentage > budget.alert_threshold;
            const isOver = budget.percentage > 100;
            
            return (
              <div key={idx} className={`budget-item ${isWarning ? 'warning' : ''} ${isOver ? 'over' : ''}`}>
                <div className="budget-header">
                  <span className="budget-category">{budget.category}</span>
                  <span className="budget-amount">
                    ₹{budget.spent.toLocaleString('en-IN')} / ₹{budget.budgeted.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="budget-progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="budget-footer">
                  <span>{budget.percentage.toFixed(1)}% used</span>
                  <span className="remaining">
                    {budget.remaining >= 0 
                      ? `₹${budget.remaining.toLocaleString('en-IN')} left`
                      : `Over by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}`
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

## Expense Tracker Component

// src/pages/ExpenseTracker.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseTracker.css';

export default function ExpenseTracker({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    payment_method: 'upi',
    merchant_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/`);
      setExpenses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/expenses/`, formData);
      
      setFormData({
        amount: '',
        description: '',
        category: '',
        payment_method: 'upi',
        merchant_name: '',
      });
      
      fetchExpenses();
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Error adding expense: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_BASE_URL}/expenses/${id}/`);
        fetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filter === 'disputed') return exp.status === 'disputed';
    if (filter === 'blockchain') return exp.payment_method === 'blockchain';
    return true;
  });

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expense-tracker">
      <div className="tracker-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track and categorize your spending</p>
      </div>

      {/* Add Expense Form */}
      <div className="add-expense-card">
        <h2>Add New Expense</h2>
        <form onSubmit={handleAddExpense}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="net_banking">Net Banking</option>
                <option value="wallet">Digital Wallet</option>
                <option value="blockchain">Blockchain</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this expense for?"
                required
              />
            </div>

            <div className="form-group">
              <label>Merchant Name</label>
              <input
                type="text"
                value={formData.merchant_name}
                onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">Add Expense</button>
        </form>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Expenses ({expenses.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'disputed' ? 'active' : ''}`}
          onClick={() => setFilter('disputed')}
        >
          🚨 Suspicious ({expenses.filter(e => e.status === 'disputed').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'blockchain' ? 'active' : ''}`}
          onClick={() => setFilter('blockchain')}
        >
          ⛓️ Blockchain ({expenses.filter(e => e.payment_method === 'blockchain').length})
        </button>
      </div>

      {/* Expenses List */}
      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <p className="no-data">No expenses found</p>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className={`expense-item status-${expense.status}`}>
              <div className="expense-icon">
                {expense.category_icon || '💳'}
              </div>
              <div className="expense-details">
                <div className="expense-main">
                  <h4>{expense.description}</h4>
                  <p className="expense-category">{expense.category}</p>
                </div>
                <div className="expense-meta">
                  <span className="expense-date">
                    {new Date(expense.transaction_date).toLocaleDateString('en-IN')}
                  </span>
                  <span className={`expense-status ${expense.status}`}>
                    {expense.status === 'disputed' ? '🚨' : '✓'} {expense.status}
                  </span>
                </div>
              </div>
              <div className="expense-amount">
                <span className="amount">₹{expense.amount}</span>
                <span className="payment-method">{expense.payment_method}</span>
              </div>
              {expense.blockchain_tx_hash && (
                <div className="blockchain-badge">⛓️ On Blockchain</div>
              )}
              <button 
                className="btn-delete"
                onClick={() => handleDeleteExpense(expense.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
