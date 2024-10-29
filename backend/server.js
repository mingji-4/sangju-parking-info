require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5005;

// MariaDB 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err);
  } else {
    console.log('MariaDB에 성공적으로 연결되었습니다.');
  }
});

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// 회원가입 API
app.post('/register', (req, res) => {
  const { email, password, name, phone, gender, isAdmin } = req.body;

  // 이메일 중복 체크
  const checkQuery = 'SELECT * FROM Users WHERE email = ?';
  db.query(checkQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('중복 체크 오류:', checkErr);
      res.status(500).send('서버 오류가 발생했습니다.');
      return;
    }

    if (checkResults.length > 0) {
      res.status(400).send('이미 존재하는 이메일입니다.');
      return;
    }

    // 회원가입 처리
    const query = `
      INSERT INTO Users (email, password, name, phone, gender, isAdmin)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [email, password, name, phone, gender, isAdmin || false], (err, results) => {
      if (err) {
        console.error('데이터 삽입 오류:', err);
        res.status(500).send('회원가입 중 오류가 발생했습니다.');
        return;
      }
      res.status(200).send('회원가입이 성공적으로 완료되었습니다.');
    });
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const secretKey = process.env.JWT_SECRET_KEY || 'default_secret_key';

  console.log('로그인 요청:', email, password);

  const query = 'SELECT * FROM Users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('데이터 조회 오류:', err);
      res.status(500).send('서버 오류가 발생했습니다.');
      return;
    }

    if (results.length > 0) {
      console.log('비밀번호 일치');
      const user = results[0];
      const token = jwt.sign({ email: email, isAdmin: user.isAdmin }, secretKey, { expiresIn: '1h' });
      res.status(200).json({ token, isAdmin: user.isAdmin });
    } else {
      console.log('아이디 또는 비밀번호가 올바르지 않습니다.');
      res.status(401).send('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  });
});

// 모든 주차장 정보 가져오기 API (일반 사용자)
app.get('/api/parkinglots', (req, res) => {
  db.query('SELECT * FROM ParkingLots', (err, results) => {
    if (err) {
      console.error('쿼리 실패:', err);
      res.status(500).send('데이터베이스 쿼리 오류');
    } else {
      res.json(results);
    }
  });
});

// 사용자 정보 가져오기 API (GET)
app.get('/mypage', (req, res) => {
  const email = req.query.email;

  if (!email) {
    res.status(400).send('이메일이 필요합니다.');
    return;
  }

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('사용자 정보 조회 오류:', err);
      res.status(500).send('사용자 정보 조회 중 오류가 발생했습니다.');
      return;
    }

    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).send('사용자 정보를 찾을 수 없습니다.');
    }
  });
});

// 사용자 정보 수정 API (POST)
app.post('/mypage', (req, res) => {
  const { email, name, phone, gender } = req.body;

  if (!email) {
    res.status(400).send('이메일이 필요합니다.');
    return;
  }

  const query = `
    UPDATE Users
    SET name = ?, phone = ?, gender = ?
    WHERE email = ?
  `;

  db.query(query, [name, phone, gender, email], (err, results) => {
    if (err) {
      console.error('사용자 정보 수정 오류:', err);
      res.status(500).send('사용자 정보 수정 중 오류가 발생했습니다.');
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).send('사용자 정보가 성공적으로 수정되었습니다.');
    } else {
      res.status(404).send('사용자 정보를 찾을 수 없습니다.');
    }
  });
});

// 등록한 주차장 정보 가져오기 API (관리자)
app.get('/api/parkinglots/user', (req, res) => {
  const createdBy = req.query.createdBy;

  if (!createdBy) {
    res.status(400).send('사용자 정보가 필요합니다.');
    return;
  }

  const query = 'SELECT * FROM ParkingLots WHERE created_by = ?';
  db.query(query, [createdBy], (err, results) => {
    if (err) {
      console.error('쿼리 실패:', err);
      res.status(500).send('데이터베이스 쿼리 오류');
    } else {
      res.json(results);
    }
  });
});

// 주차장 정보 등록 API (POST)
app.post('/api/parkinglots', (req, res) => {
  const { name, address, slots, type, fee, hours, latitude, longitude, createdBy } = req.body;

  const query = `
    INSERT INTO ParkingLots (name, address, slots, type, fee, hours, latitude, longitude, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, address, slots, type, fee, hours, latitude, longitude, createdBy], (err, results) => {
    if (err) {
      console.error('주차장 정보 등록 오류:', err);
      res.status(500).send('주차장 정보 등록 중 오류가 발생했습니다.');
    } else {
      res.status(201).send('주차장 정보가 성공적으로 등록되었습니다.');
    }
  });
});

// 주차장 정보 수정 API (PUT)
app.put('/api/parkinglots/:id', (req, res) => {
  const { id } = req.params; // URL에서 주차장 ID 가져오기
  const { name, address, latitude, longitude, slots, fee, type, hours } = req.body;

  const query = `
    UPDATE ParkingLots
    SET name = ?, address = ?, latitude = ?, longitude = ?, slots = ?, fee = ?, type = ?, hours = ?
    WHERE id = ?
  `;

  db.query(query, [name, address, latitude, longitude, slots, fee, type, hours, id], (err, results) => {
    if (err) {
      console.error('주차장 정보 수정 오류:', err);
      res.status(500).send('주차장 정보 수정 중 오류가 발생했습니다.');
    } else if (results.affectedRows === 0) {
      res.status(404).send('해당 주차장 정보를 찾을 수 없습니다.');
    } else {
      res.status(200).send('주차장 정보가 성공적으로 수정되었습니다.');
    }
  });
});

// 주차장 정보 삭제 API
app.delete('/api/parkinglots/:id', (req, res) => {
  const { id } = req.params; // URL에서 주차장 ID 가져오기

  const query = `
    DELETE FROM ParkingLots
    WHERE id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('주차장 정보 삭제 오류:', err);
      res.status(500).send('주차장 정보 삭제 중 오류가 발생했습니다.');
    } else if (results.affectedRows === 0) {
      res.status(404).send('해당 주차장 정보를 찾을 수 없습니다.');
    } else {
      res.status(200).send('주차장 정보가 성공적으로 삭제되었습니다.');
    }
  });
});

// 즐겨찾기 목록 가져오기 API
app.get('/api/favorites', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    res.status(400).send('사용자 정보가 필요합니다.');
    return;
  }

  const query = `
    SELECT ParkingLots.*
    FROM Favorites
    JOIN ParkingLots ON Favorites.parking_lot_id = ParkingLots.id
    WHERE Favorites.user_id = ?
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('즐겨찾기 조회 오류:', err);
      res.status(500).send('즐겨찾기 조회 중 오류가 발생했습니다.');
    } else {
      res.json(results);
    }
  });
});

// 즐겨찾기 추가 API
app.post('/api/favorites', (req, res) => {
  const { userId: email, parkingLotId } = req.body;

  // 중복 확인
  const checkQuery = 'SELECT * FROM Favorites WHERE user_id = ? AND parking_lot_id = ?';
  db.query(checkQuery, [email, parkingLotId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('즐겨찾기 중복 체크 오류:', checkErr);
      res.status(500).send('즐겨찾기 중복 체크 중 오류가 발생했습니다.');
      return;
    }

    if (checkResults.length > 0) {
      res.status(400).send('이미 즐겨찾기된 주차장입니다.');
      return;
    }

    // 즐겨찾기 추가
    const query = 'INSERT INTO Favorites (user_id, parking_lot_id) VALUES (?, ?)';
    db.query(query, [email, parkingLotId], (err, results) => {
      if (err) {
        console.error('즐겨찾기 추가 오류:', err);
        res.status(500).send('즐겨찾기 추가 중 오류가 발생했습니다.');
      } else {
        res.status(201).send('즐겨찾기에 성공적으로 추가되었습니다.');
      }
    });
  });
});

// 즐겨찾기 삭제 API
app.delete('/api/favorites', (req, res) => {
  const { userId: email, parkingLotId } = req.body;

  const query = 'DELETE FROM Favorites WHERE user_id = ? AND parking_lot_id = ?';
  db.query(query, [email, parkingLotId], (err, results) => {
    if (err) {
      console.error('즐겨찾기 삭제 오류:', err);
      res.status(500).send('즐겨찾기 삭제 중 오류가 발생했습니다.');
    } else if (results.affectedRows === 0) {
      res.status(404).send('즐겨찾기 항목을 찾을 수 없습니다.');
    } else {
      res.status(200).send('즐겨찾기에서 성공적으로 삭제되었습니다.');
    }
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
