import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    emailLocal: '',
    emailDomain: '',
    gender: '',
  });
  const [customAlert, setCustomAlert] = useState(''); // 알림 메시지 상태

  // 사용자 정보를 가져오기 위한 GET 요청
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      axios.get('http://localhost:5005/mypage', {
        params: { email }
      })
      .then(response => {
        const { name, phone, email, gender } = response.data;
        const [emailLocal, emailDomain] = email.split('@');
        setUserData({ name, phone, emailLocal, emailDomain, gender });
      })
      .catch(error => {
        console.error('사용자 정보 가져오기 오류:', error);
        showAlert('사용자 정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
    } else {
      console.error('이메일 정보가 로컬 스토리지에 존재하지 않습니다.');
    }
  }, []);

  const showAlert = (message) => {
    setCustomAlert(message);
    setTimeout(() => setCustomAlert(''), 3000); // 3초 후 알림 메시지 숨기기
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // 수정이 끝날 때 서버에 업데이트 요청 보내기
      const email = `${userData.emailLocal}@${userData.emailDomain}`;
      axios.post('http://localhost:5005/mypage', {
        email,
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
      })
      .then(response => {
        showAlert('정보가 성공적으로 수정되었습니다.');
      })
      .catch(error => {
        console.error('사용자 정보 수정 오류:', error);
        showAlert('정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      });
    }
    setIsEditing((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/';
  };

  return (
    <div className="mypage-container">
      <h2 className="mypage-title">설정</h2>
      <div className="user-info-card">
        <div className="user-info-header">
          회원 정보
          <span className="edit-toggle" onClick={handleEditToggle}>
            {isEditing ? '취소' : '수정'}
          </span>
        </div>
        {!isEditing ? (
          <div className="user-info-display">
            <p><span className="label">이름</span><span className="value">{userData.name}</span></p>
            <p><span className="label">휴대폰 번호</span><span className="value">{userData.phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3')}</span></p>
            <p><span className="label">이메일</span><span className="value">{userData.emailLocal}@{userData.emailDomain}</span></p>
            <p><span className="label">성별</span><span className="value">{userData.gender === 'female' ? '여성' : '남성'}</span></p>
          </div>
        ) : (
          <div className="user-info-edit">
            <p className="edit-item">
              이름
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </p>
            <p className="edit-item">
              휴대폰 번호
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                className="input-field"
              />
            </p>
            <p className="edit-item">
              성별
              <div className="gender-container">
                <label className="gender-option">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={userData.gender === 'female'}
                    onChange={handleInputChange}
                  />
                  여성
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={userData.gender === 'male'}
                    onChange={handleInputChange}
                  />
                  남성
                </label>
              </div>
            </p>
          </div>
        )}
      </div>
      <button className="action-button" onClick={isEditing ? handleEditToggle : handleLogout}>
        {isEditing ? '확인' : '로그아웃'}
      </button>

      {/* 커스텀 알림 메시지 */}
      {customAlert && (
        <div className="custom-alert">{customAlert}</div>
      )}
    </div>
  );
}

export default MyPage;
