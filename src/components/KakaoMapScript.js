// src/components/KakaoMapScript.js
import parkingData from '../상주시_주차장정보.json';
import { useEffect } from 'react';

export default function KakaoMapScript() {
  useEffect(() => {
    const createMap = () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 3
        };
        const map = new window.kakao.maps.Map(container, options);

        // 주차장 데이터를 이용해 지도에 마커를 표시합니다
        parkingData.forEach(parking => {
          const markerPosition = new window.kakao.maps.LatLng(parking.위도, parking.경도);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition
          });
          marker.setMap(map);
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

  return null;
}
