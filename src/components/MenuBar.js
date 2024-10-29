import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faHouse, faUser } from '@fortawesome/free-solid-svg-icons'; // 아이콘 추가

function MenuBar() {
  const location = useLocation(); // 현재 경로 확인

  // 현재 경로가 선택된 메뉴와 일치하면 'active' 클래스 추가
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="menu-bar">
      <Link to="/favorites" className={isActive('/favorites')}>
        <FontAwesomeIcon icon={solidStar} style={{ fontSize: '35px' }} />
      </Link>
      <Link to="/map" className={isActive('/map')}>
        <FontAwesomeIcon icon={faHouse} style={{ fontSize: '35px' }} />
      </Link>
      <Link to="/mypage" className={isActive('/mypage')}>
        <FontAwesomeIcon icon={faUser} style={{ fontSize: '35px' }} />
      </Link>
    </nav>
  );
}

export default MenuBar;
