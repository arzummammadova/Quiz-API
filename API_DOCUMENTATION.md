# Quiz API Sənədləri (Frontend üçün Bələdçi)

Bu API həm istifadəçi autentifikasiyasını (qeydiyyat, giriş, profil redaktəsi), həm də Quiz (imtahan) məntiqini idarə edir.

**Baza URL (Base URL)**: `http://localhost:5000/api` (Zəhmət olmasa `.env` faylında PORT-u yoxlayın)

---

## 1. Autentifikasiya (Qeydiyyat və Giriş) - `/auth`

### İstifadəçi Qeydiyyatı
- **URL**: `/auth/register`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "username": "istifadeci_adi",
    "email": "test@mail.com",
    "password": "sifre"
  }
  ```

### Giriş
- **URL**: `/auth/login`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "email": "test@mail.com",
    "password": "sifre"
  }
  ```
  *Giriş uğurlu olduqda sizə bir `token` və `user` obyekti qaytarılır.*

### Profil Məlumatlarının Redaktəsi (Email istisna olmaqla)
- **URL**: `/auth/update`
- **Metod**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "yeni_ad",
    "password": "yeni_sifre"
  }
  ```
  *Qeyd: Email dəyişdirilə bilməz.*

---

## 2. Quiz (İmtahan) Bölməsi - `/quiz`

İmtahan məntiqi pilləli şəkildə işləyir:

### Addım 0: Bazanı Suallarla Doldurmaq (Yalnız bir dəfə)
- **URL**: `/quiz/seed`
- **Metod**: `GET`
- **Açıqlama**: Brauzerdə və ya Postman-da bu linki bir dəfə çağırın ki, backend tərəfdə nümunə suallar yaransın.

### Addım 1: Kateqoriya Seçimi (Frontend və ya Backend)
İstifadəçi sayta girəndə "Frontend" və ya "Backend" seçməlidir. Buna görə müvafiq kateqoriyaya aid mövzuları çəkirik:

- **URL**: `/quiz/topics/:category`
- **Metod**: `GET`
- **Parametr**: `category` yerinə `frontend` və ya `backend` yazılmalıdır.
- **Nümunə**: `GET /api/quiz/topics/frontend`
- **Response**:
  ```json
  {
    "topics": ["HTML", "CSS", "React"]
  }
  ```

### Addım 2: Mövzu Seçimi və Sualların Çəkilməsi
İstifadəçi mövzunu (məsələn, "React") seçdikdən sonra həmin mövzuya aid sualları çəkirik:

- **URL**: `/quiz/questions?category=frontend&topic=React`
- **Metod**: `GET`
- **Query Params**: `category` (frontend/backend) və `topic` (mövzu adı).
- **Açıqlama**: Bu endpoint sualları və variantları gətirir, lakin düzgün cavabları gizlədir.
- **Response**:
  ```json
  {
    "questions": [
      {
        "_id": "suallin_id_si",
        "question": "React nədir?",
        "options": ["A variantı", "B variantı", "C variantı", "D variantı"],
        "category": "frontend",
        "topic": "React"
      }
    ]
  }
  ```

### Addım 3: Cavabların Yoxlanılması
İstifadəçi bütün sualları cavablandırdıqdan sonra nəticəni hesablamaq üçün bütün seçimləri göndəririk:

- **URL**: `/quiz/check`
- **Metod**: `POST`
- **Body**:
  ```json
  {
    "answers": [
      { "questionId": "suallin_id_si_1", "selectedOption": 1 },
      { "questionId": "suallin_id_si_2", "selectedOption": 3 }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "score": 5,
    "total": 10,
    "results": [
      {
        "questionId": "...",
        "isCorrect": true,
        "correctOption": 1,
        "correctText": "Düzgün variantın mətni"
      }
    ]
  }
  ```

---

## Frontend Üçün Qeydlər:
1.  Girişdən sonra gələn `token`-i `localStorage`-da saxlayın.
2.  Profil redaktəsi kimi qorunan yollara istek göndərərkən `Authorization` header-ində `Bearer <token>` göndərməyi unutmayın.
3.  İstifadəçiyə əvvəlcə Frontend/Backend seçdirin, sonra həmin seçimə görə `topics` endpoint-indən gələn mövzuları düymə kimi göstərin.
