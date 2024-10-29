import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FavoriteList({ favorites, setFavorites }) {
  const [favoriteParkingLots, setFavoriteParkingLots] = useState([]);
  const userId = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // 즐겨찾기된 주차장 데이터 가져오기
    if (userId && token) {
      axios
        .get(`http://localhost:5005/api/favorites?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((response) => {
          setFavoriteParkingLots(response.data);
        })
        .catch((error) => {
          console.error('즐겨찾기 주차장 데이터를 가져오는 중 오류 발생:', error);
        });
    } else {
      setFavoriteParkingLots([]);
    }
  }, [favorites, userId, token]);

  return (
    <div className="favorite-list-container">
      <h2>즐겨찾기 목록</h2>
      <ul>
        {favoriteParkingLots.length > 0 ? (
          favoriteParkingLots.map((parkingLot, index) => (
            <li key={index} className="favorite-item">
              <span>{parkingLot.name}</span>
              <button
                className="remove-button"
                onClick={() => {
                  // 즐겨찾기 삭제 처리
                  axios
                    .delete('http://localhost:5005/api/favorites', {
                      data: { userId, parkingLotId: parkingLot.id },
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    })
                    .then(() => {
                      setFavorites(prevFavorites => prevFavorites.filter(id => id !== parkingLot.id));
                      setFavoriteParkingLots(prevParkingLots =>
                        prevParkingLots.filter(lot => lot.id !== parkingLot.id)
                      );
                    })
                    .catch((error) => {
                      console.error('즐겨찾기 삭제 오류:', error);
                    });
                }}
              >
                삭제
              </button>
            </li>
          ))
        ) : (
          <p>즐겨찾기된 주차장이 없습니다.</p>
        )}
      </ul>
    </div>
  );
}

export default FavoriteList;
