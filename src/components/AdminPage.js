import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [parkingList, setParkingList] = useState([]);
  const [parkingData, setParkingData] = useState({
    name: '',
    address: '',
    slots: '',
    type: '',
    fee: '',
    hours: '',
    latitude: '',
    longitude: '',
    createdBy: ''
  });
  const [customAlert, setAlertMessage] = useState(''); // 커스텀 알림 메시지 상태

  const userEmail = localStorage.getItem('email');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    if (!userEmail) {
      navigate('/');
    } else if (!isAdmin) {
      navigate('/map');
    } else {
      fetchParkingLots();
    }
  }, [userEmail, isAdmin, navigate]);

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 5000);
  };

  const fetchParkingLots = () => {
    axios
      .get(`http://localhost:5005/api/parkinglots/user?createdBy=${userEmail}`)
      .then(response => setParkingList(response.data))
      .catch(error => console.error('주차장 정보를 가져오는 중 오류 발생:', error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParkingData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRegisterClick = () => {
    setParkingData({
      name: '',
      address: '',
      slots: '',
      type: '',
      fee: '',
      hours: '',
      latitude: '',
      longitude: '',
      createdBy: userEmail
    });
    setIsRegistering(true);
    setIsEditing(true);
  };

  const handleRegister = () => {
    axios
      .post('http://localhost:5005/api/parkinglots', parkingData)
      .then(() => {
        showAlert('주차장 정보가 등록되었습니다.');
        setIsEditing(false);
        setIsRegistering(false);
        fetchParkingLots();
      })
      .catch(error => {
        console.error('주차장 등록 오류:', error);
        showAlert('주차장 정보 등록 중 오류가 발생했습니다.');
      });
  };

  const handleEditClick = (parking) => {
    setParkingData(parking);
    setIsEditing(true);
    setIsRegistering(false);
  };

  const handleEdit = () => {
    axios
      .put(`http://localhost:5005/api/parkinglots/${parkingData.id}`, parkingData)
      .then(() => {
        showAlert('주차장 정보가 수정되었습니다.');
        setIsEditing(false);
        fetchParkingLots();
      })
      .catch(error => {
        console.error('주차장 수정 오류:', error);
        showAlert('주차장 정보 수정 중 오류가 발생했습니다.');
      });
  };

  const handleDeleteClick = (parkingId) => {
    handleDelete(parkingId);
  };
  
  const handleDelete = (parkingId) => {
    axios
      .delete(`http://localhost:5005/api/parkinglots/${parkingId}`)
      .then(() => {
        showAlert('주차장 정보가 성공적으로 삭제되었습니다.');
        fetchParkingLots();
      })
      .catch(error => {
        console.error('주차장 삭제 오류:', error);
        showAlert('주차장 정보 삭제 중 오류가 발생했습니다.');
      });
  };
  

  const handleCancel = () => {
    setIsEditing(false);
    setIsRegistering(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-container">
      {!isEditing ? (
        <div className="mypage">
          <h2 className="mypage-title">설정</h2>
          <div className="user-info-card">
            <div className="user-info-header">
              주차장 정보
              <div className="admin-buttons">
                <span className="edit-toggle" onClick={handleRegisterClick}>
                  등록
                </span>
              </div>
            </div>
            <div className="admin-info-list">
              {parkingList.map(parking => (
                <div
                  key={parking.id}
                  className="admin-info-item"
                  style={{ cursor: 'pointer' }}
                >
                  <span onClick={() => handleEditClick(parking)}>{parking.name}</span>
                  <span className="delete-toggle" onClick={() => handleDeleteClick(parking.id)} style={{ float: 'right', color: 'red'}}>
                    삭제
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="admin-action-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : (
        <>
          <h2 className="admin-title">주차장 정보 {isRegistering ? '등록' : '수정'}</h2>
          <div className="admin-edit-section">
            <div className="admin-form">
              <div className="user-info-header">
                주차장 정보
                <span className="edit-toggle" onClick={handleCancel}>취소</span>
              </div>
              <label>주차장명
                <input
                  type="text"
                  name="name"
                  value={parkingData.name}
                  onChange={handleInputChange}
                />
              </label>
              <label>지번주소
                <input
                  type="text"
                  name="address"
                  value={parkingData.address}
                  onChange={handleInputChange}
                />
              </label>
              <label>주차구획수
                <input
                  type="number"
                  name="slots"
                  value={parkingData.slots}
                  onChange={handleInputChange}
                />
              </label>
              <label>주차장구분
                <input
                  type="text"
                  name="type"
                  value={parkingData.type}
                  onChange={handleInputChange}
                />
              </label>
              <label>요금정보
                <input
                  type="text"
                  name="fee"
                  value={parkingData.fee}
                  onChange={handleInputChange}
                />
              </label>
              <label>운영시간
                <input
                  type="text"
                  name="hours"
                  value={parkingData.hours}
                  onChange={handleInputChange}
                />
              </label>
              <label>위도
                <input
                  type="number"
                  name="latitude"
                  value={parkingData.latitude}
                  onChange={handleInputChange}
                />
              </label>
              <label>경도
                <input
                  type="number"
                  name="longitude"
                  value={parkingData.longitude}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>
          <button className="admin-action-button" onClick={isRegistering ? handleRegister : handleEdit}>
            {isRegistering ? '등록' : '확인'}
          </button>
        </>
      )}

      {/* 커스텀 알림 메시지 */}
      {customAlert && (
        <div className="custom-alert">{customAlert}</div>
      )}
    </div>
  );
}

export default AdminPage;
