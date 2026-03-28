// 회원가입 요청 데이터
export interface SignupRequest {
  email:      string;
  password:   string;
  username:   string;
  role:       'student' | 'instructor' | 'admin';
  phone:      string;
  birthDate:  string; 
  gender:     'male' | 'female' | 'other';
}

// 로그인 요청 데이터
export interface SigninRequest {
  email:      string;
  password:   string;
}

// 백엔드에서 반환하는 User 객체 정보
export interface User {
  _id:        string;
  email:      string;
  username:   string;
  role:       'student' | 'instructor' | 'admin';
  phone:      string;
  birthDate:  string;
  gender:     'male' | 'female' | 'other';
}

export interface AuthResponse<T = undefined> {
  message: string;
  error?:  string;
  user?:   T;       // 회원가입 성공 시
  token?:  string;  // 로그인 성공 시
}
