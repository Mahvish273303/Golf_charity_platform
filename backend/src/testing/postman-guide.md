# Postman Testing Guide

## Base URL

`http://localhost:4000`

## Authorization Header Format

Use this header for protected routes:

`Authorization: Bearer <JWT_TOKEN>`

---

## AUTH

### POST `/api/auth/signup`

```json
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### POST `/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## SCORE

### POST `/api/score`

```json
{
  "value": 21
}
```

### GET `/api/score`

No body.

---

## DRAW

### POST `/api/draw/generate`

No body.

### GET `/api/draw/latest`

No body.

### GET `/api/draw/result`

No body.

---

## CHARITY

### POST `/api/charity`

```json
{
  "name": "Green Fairway Foundation",
  "description": "Supports youth golf programs",
  "image": "https://example.com/charity.png"
}
```

### GET `/api/charity`

No body.

### POST `/api/charity/select`

```json
{
  "charityId": "REPLACE_WITH_CHARITY_ID"
}
```

### GET `/api/charity/me`

No body.

---

## SUBSCRIPTION

### POST `/api/subscription/subscribe`

```json
{
  "plan": "monthly"
}
```

Allowed values: `"monthly"` or `"yearly"`.

### GET `/api/subscription/status`

No body.

### POST `/api/subscription/cancel`

No body.

---

## DEBUG / HEALTH

### GET `/api/test`

No body.

### GET `/api/debug/user`

Protected route. Returns decoded and attached `req.user`.
