import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setIsLoggedIn, setIsAdmin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState(''); // 알림 메시지 상태
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email) {
      showAlert('이메일 주소를 입력해주세요.');
      return;
    }
    if (!password) {
      showAlert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5005/login', {
        email,
        password,
      });

      console.log(response.data); // 서버 응답 확인

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email);
      localStorage.setItem('isAdmin', response.data.isAdmin === 1 ? 'true' : 'false');

      setIsLoggedIn(true);
      setIsAdmin(response.data.isAdmin);
      navigate(response.data.isAdmin ? '/admin' : '/map');
    } catch (error) {
      console.error('로그인 오류:', error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        showAlert('아이디 또는 비밀번호가 잘못되었습니다.');
      } else {
        showAlert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message); // 알림 메시지 설정
    setTimeout(() => setAlertMessage(''), 5000);
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />
      <button onClick={handleLogin} className="login-button">
        로그인
      </button>
      <p className="login-footer">
        아직 회원 가입을 못 하셨나요?{' '}
        <Link to="/register" className="register-link">
          회원가입
        </Link>
      </p>

      {/* 커스텀 알림 창 */}
      {alertMessage && (
        <div className="custom-alert">
          {alertMessage}
        </div>
      )}
    </div>
  );
}

export default Login;
