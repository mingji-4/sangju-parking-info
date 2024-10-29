import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import ParkingMap from './components/ParkingMap';
import MyPage from './components/MyPage';
import MenuBar from './components/MenuBar';
import FavoriteList from './components/FavoriteList';
import AdminPage from './components/AdminPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
  const [parkingLots] = useState([]);
  // const [parkingLots, setParkingLots] = useState([]);

  useEffect(() => {
    // 로그인 상태 체크 및 즐겨찾기 데이터 가져오기
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');

    if (loggedInStatus === 'true') {
      // 즐겨찾기 데이터 가져오기
      const userId = localStorage.getItem('email');
      const token = localStorage.getItem('token');

      if (userId && token) {
        axios
          .get(`http://localhost:5005/api/favorites?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            console.log('즐겨찾기 데이터:', response.data);
            setFavorites(response.data.map((favorite) => favorite.id));
          })
          .catch((error) => {
            console.error('즐겨찾기 데이터를 가져오는 중 오류 발생:', error);
          });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  return (
    <Router>
      <div className="App">
        {isLoggedIn && !isAdmin && <MenuBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/map"
            element={
              isLoggedIn ? (
                <ParkingMap favorites={favorites} setFavorites={setFavorites} parkingLots={parkingLots} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/mypage"
            element={isLoggedIn ? <MyPage /> : <Navigate to="/" />}
          />
          <Route
            path="/favorites"
            element={
              isLoggedIn ? (
                <FavoriteList favorites={favorites} setFavorites={setFavorites} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin"
            element={isLoggedIn && isAdmin ? <AdminPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
