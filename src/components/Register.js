import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [emailLocal, setEmailLocal] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [isAdmin] = useState(false);
  // const [isAdmin, setIsAdmin] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleRegister = async () => {
    if (!name) return showAlert('이름을 입력해주세요.');
    if (!phone) return showAlert('전화번호를 입력해주세요.');
    if (!emailLocal) return showAlert('이메일 주소를 입력해주세요.');
    if (!password) return showAlert('비밀번호를 입력해주세요.');
    if (!confirmPassword) return showAlert('비밀번호 확인을 입력해주세요.');
    if (password !== confirmPassword) return showAlert('비밀번호가 일치하지 않습니다.');
    if (!termsChecked) return showAlert('이용약관에 동의해주세요.');
    if (!locationChecked) return showAlert('위치 기반 서비스 정보 제공에 동의해주세요.');

    try {
      await axios.post('http://localhost:5005/register', {
        email: `${emailLocal}@${emailDomain}`,
        password,
        name,
        phone,
        gender,
        isAdmin,
      });
      showAlert('회원가입이 성공적으로 완료되었습니다.');
      setTimeout(() => (window.location.href = '/'), 3000);
    } catch (error) {
      console.error('회원가입 오류:', error.response?.data || error.message);
      showAlert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 5000);
  };

  const handleDomainChange = (e) => setEmailDomain(e.target.value);

  return (
    <div className="register-container">
      <div className="register-logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <input
        type="text"
        placeholder="이름"
        value={name}
        className="register-input"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="전화번호"
        value={phone}
        className="register-input"
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className="email-input-group">
        <input
          type="text"
          placeholder="이메일 주소"
          value={emailLocal}
          onChange={(e) => setEmailLocal(e.target.value)}
        />
        <span> @ </span>
        <select onChange={handleDomainChange} value={emailDomain}>
          <option value="gmail.com">gmail.com</option>
          <option value="naver.com">naver.com</option>
          <option value="daum.net">daum.net</option>
        </select>
      </div>
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        className="register-input"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호 확인"
        value={confirmPassword}
        className="register-input"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className="register-checkbox-group">
        <div className="gender-select">
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === 'female'}
              onChange={(e) => setGender(e.target.value)}
            />
            여자
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === 'male'}
              onChange={(e) => setGender(e.target.value)}
            />
            남자
          </label>
        </div>
        <br></br>
        {/* <label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          관리자 계정으로 가입 (관리자만 선택)
        </label> */}
        <label>
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={(e) => setTermsChecked(e.target.checked)}
          />
          이용약관 동의 (필수)
        </label>
        <label>
          <input
            type="checkbox"
            checked={locationChecked}
            onChange={(e) => setLocationChecked(e.target.checked)}
          />
          위치 기반 서비스 정보 제공 동의 (필수)
        </label>
      </div>
      <button className="register-button" onClick={handleRegister}>
        회원가입
      </button>
      <p className="register-footer">
        이미 회원이신가요? <Link to="/" className="login-link">로그인</Link>
      </p>

      {/* 커스텀 알림 메시지 */}
      {alertMessage && (
        <div className="custom-alert">
          {alertMessage}
        </div>
      )}
    </div>
  );
}

export default Register;
