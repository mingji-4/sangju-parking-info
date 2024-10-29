import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

function ParkingMap() {
  const [searchInput, setSearchInput] = useState('');
  const [parkingData, setParkingData] = useState([]);
  const [filteredParkingData, setFilteredParkingData] = useState([]);
  const [toastMessage, setToastMessage] = useState({});
  const [showNavigationSelect, setShowNavigationSelect] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [map, setMap] = useState(null);
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null);
  const [customAlert, setAlertMessage] = useState(''); // 알림 메시지 상태
  const userId = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parkingResponse = await axios.get('http://localhost:5005/api/parkinglots');
        setParkingData(parkingResponse.data);
        setFilteredParkingData(parkingResponse.data);

        if (userId && token) {
          const favoriteResponse = await axios.get(`http://localhost:5005/api/favorites?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setFavorites(favoriteResponse.data.map(favorite => favorite.id));
        }
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
      }
    };

    fetchData();
  }, [userId, token]);

  useEffect(() => {
    const createMap = () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(36.41363033, 128.159818),
          level: 3
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);

        // 지도 클릭 시 토스트 팝업 닫기
        window.kakao.maps.event.addListener(newMap, 'click', () => {
          setToastMessage({});
          setShowNavigationSelect(false);
        });
      }
    };

    if (window.kakao && window.kakao.maps) {
      createMap();
    } else {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(createMap);
      };
      document.head.appendChild(script);
    }
  }, []);

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 5000);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);

          if (map) {
            map.setCenter(currentPosition);

            if (currentLocationMarker) currentLocationMarker.setMap(null);

            // 마커 스타일
            const markerContent = `
              <div style="
                position: absolute;
                width: 20px;
                height: 20px;
                background-color: #FF9696;
                border-radius: 50%; 
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                transform: translate(-50%, -50%);
              ">
              </div>
            `;

            // 새로운 커스텀 마커 생성
            const marker = new window.kakao.maps.CustomOverlay({
              position: currentPosition,
              content: markerContent,
              map: map,
              yAnchor: 0.5, // 마커의 중심을 정확하게 맞춤
            });

            setCurrentLocationMarker(marker);
          }
        },
        (error) => {
          if (error.code === 1) {
            showAlert('현재 위치 권한이 거부되었습니다. 위치 권한을 허용해주세요.');
          } else {
            console.error('현재 위치를 가져오지 못했습니다:', error);
          }
        }
      );
    } else {
      showAlert('현재 위치를 사용할 수 없습니다. 위치 권한을 허용해주세요.');
    }
  };

  const handleSearch = () => {
    const filteredData = parkingData.filter(parking =>
      parking.name.includes(searchInput) || parking.address.includes(searchInput)
    );
    setFilteredParkingData(filteredData);

    if (filteredData.length > 0 && map) {
      const { latitude, longitude } = filteredData[0];
      const moveLatLon = new window.kakao.maps.LatLng(latitude, longitude);
      map.setCenter(moveLatLon);
    }
  };

  useEffect(() => {
    if (map) {
      const markers = [];
      map.markers?.forEach(marker => marker.setMap(null));

      filteredParkingData.forEach((parking) => {
        const markerPosition = new window.kakao.maps.LatLng(parking.latitude, parking.longitude);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
        markers.push(marker);

        window.kakao.maps.event.addListener(marker, 'click', () => {
          setToastMessage({
            id: parking.id,
            name: parking.name,
            address: parking.address,
            slots: parking.slots,
            type: parking.type,
            fee: parking.fee,
            hours: parking.hours,
            lat: parking.latitude,
            lng: parking.longitude
          });
          setShowNavigationSelect(false);
        });
      });

      map.markers = markers;
    }
  }, [filteredParkingData, map]);

  const handleFavoriteToggle = async (parkingId) => {
    if (!userId) {
      showAlert('로그인이 필요합니다.');
      return;
    }

    try {
      if (favorites.includes(parkingId)) {
        await axios.delete('http://localhost:5005/api/favorites', {
          data: { userId, parkingLotId: parkingId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(prevFavorites => prevFavorites.filter(id => id !== parkingId));
      } else {
        await axios.post('http://localhost:5005/api/favorites', {
          userId,
          parkingLotId: parkingId
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(prevFavorites => [...prevFavorites, parkingId]);
      }
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error);
    }
  };

  const handleNavigationClick = () => {
    setToastMessage({});
    setShowNavigationSelect(true);
  };

  const handleNavigationSelect = (app) => {
    const { lat, lng, name } = toastMessage;
    let url = '';

    switch (app) {
      case 'kakao':
        url = `https://map.kakao.com/link/to/${name},${lat},${lng}`;
        break;
      case 'naver':
        url = `https://map.naver.com/v5/directions/-/-/${lat},${lng}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="map-container">
      <div className="search-bar" style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <input
            type="text"
            placeholder="장소, 주소 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flexGrow: 1, padding: '15px', borderRadius: '10px', border: '1px solid #ccc' }}
          />
          <button onClick={handleSearch} style={{ marginLeft: '10px', padding: '10px', borderRadius: '15px', border: 'none', backgroundColor: '#007BFF', color: '#fff' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '30px' }} />
          </button>
        </div>
        <button className='cur-loc-btn' onClick={handleCurrentLocation} style={{ marginLeft: '300px', marginTop: '-4px', padding: '7px', borderRadius: '100px', border: 'none', backgroundColor: '#fff', color: '#007BFF', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
          <FontAwesomeIcon icon={faLocationCrosshairs} style={{ fontSize: '20px' }} />
        </button>
      </div>

      <div id="map" style={{ width: '100vw', height: '100vh' }}></div>

      {/* 커스텀 알림 메시지 */}
      {customAlert && (
        <div className="custom-alert">{customAlert}</div>
      )}

      {toastMessage.name && !showNavigationSelect && (
        <div id="toast" className="toast" style={{ position: 'fixed', bottom: '85px', left: '50%', transform: 'translateX(-50%)', width: '94%', backgroundColor: '#fff', borderRadius: '40px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', padding: '20px', zIndex: 1000 }}>
          <h2>{toastMessage.name}
            <span style={{ cursor: 'pointer' }} onClick={() => handleFavoriteToggle(toastMessage.id)}>
              {favorites.includes(toastMessage.id) ?
                <FontAwesomeIcon icon={solidStar} /> :
                <FontAwesomeIcon icon={regularStar} />}
            </span>
          </h2>
          <p>{toastMessage.type} • {toastMessage.slots}면</p>
          <br />
          <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>운영 정보</span><span>{toastMessage.hours}</span></p>
          <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>요금 정보</span><span>{toastMessage.fee}</span></p>
          <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>지번 주소</span><span>{toastMessage.address}</span></p>
          <button id="toastButton"
            onClick={handleNavigationClick}
            style={{ marginTop: '10px', width: '95%', margin: '20px auto 0', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#48A0FF', color: '#fff' }}>내비</button>
        </div>
      )}

      {showNavigationSelect && (
        <div id='toast' className="toast" style={{ position: 'fixed', bottom: '85px', left: '50%', transform: 'translateX(-50%)', width: '96%', backgroundColor: '#fff', borderRadius: '40px', boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', padding: '20px', zIndex: 1001 }}>
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>길안내를 실행할 앱을 선택해 주세요.</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button onClick={() => handleNavigationSelect('kakao')} style={{ border: 'none', background: 'none' }}>
              <img src="/카카오내비.jpg" alt="카카오내비" style={{ width: '50px', height: '50px' }} />
            </button>
            <button onClick={() => handleNavigationSelect('naver')} style={{ border: 'none', background: 'none' }}>
              <img src="/네이버지도.png" alt="네이버지도" style={{ width: '50px', height: '50px' }} />
            </button>
          </div>
          <button onClick={() => setShowNavigationSelect(false)} style={{ marginTop: '20px', width: '93%', margin: '20px auto 0', padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#48A0FF', color: '#fff' }}>닫기</button>
        </div>
      )}
    </div>
  );
}

export default ParkingMap;
