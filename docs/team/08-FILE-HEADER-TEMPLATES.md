# 08 — File Header Templates

## 1. Quy tắc
Header là **tùy chọn**; chỉ thêm khi giúp làm rõ trách nhiệm/ràng buộc không hiển nhiên. Không thêm comment dài vào mọi file máy móc. Sửa tên và xóa mục không phù hợp. Không ghi secret/token/dữ liệu cá nhân. Header không thay thế API docs, test hoặc tài liệu nghiệp vụ.

## 2. Java Entity
```java
/*
 * Responsibility:
 * - Maps to the corresponding SQL Server table.
 * - Keep fields and relationships aligned with the agreed schema.
 * Notes:
 * - Coordinate schema changes before adding columns.
 */
```

## 3. Repository
```java
/*
 * Responsibility:
 * - Provides persistence queries for the related entity.
 * Boundaries:
 * - Business rules and ownership checks belong in the service layer.
 */
```

## 4. Service
```java
/*
 * Responsibility:
 * - Coordinates business rules and persistence operations.
 * - Checks ownership/state and uses transactions when required.
 * Important cases:
 * - Not found, invalid state, conflict, or forbidden action.
 */
```

## 5. Controller
```java
/*
 * Responsibility:
 * - Maps HTTP requests to service operations.
 * - Returns status/response according to the API contract.
 * Boundaries:
 * - No direct database queries or complex business logic.
 */
```

## 6. DTO
```java
/*
 * Responsibility:
 * - Defines data accepted from or returned to API clients.
 * Notes:
 * - Include necessary fields only; never expose password hashes/secrets.
 */
```

## 7. Mapper
```java
/*
 * Responsibility:
 * - Converts between the related entity and DTO types.
 * Boundaries:
 * - No database access, authorization, or business workflow.
 */
```

## 8. React Page
```tsx
/*
 * Responsibility:
 * - Displays the page and coordinates UI state.
 * - Uses agreed API services and shared types.
 * UI states:
 * - Loading, error, empty, and success where applicable.
 */
```

## 9. Frontend API module
```ts
/*
 * Responsibility:
 * - Calls endpoints defined by the agreed API contract.
 * - Uses shared API client and matching TypeScript types.
 * Boundaries:
 * - No presentation logic or fabricated success responses.
 */
```

## 10. Shared React component
```tsx
/*
 * Responsibility:
 * - Provides a reusable UI element.
 * Notes:
 * - Avoid unrelated domain-specific behavior.
 */
```

## 11. SQL schema change/migration
```sql
/*
 * Responsibility:
 * - Records one specific, reviewed schema change.
 * Checks:
 * - PK, FK, UNIQUE, NOT NULL, indexes, and Entity compatibility.
 */
```

## 12. Test
```java
/*
 * Responsibility:
 * - Verifies observable behavior of the unit or integration under test.
 * Coverage as applicable:
 * - Success, invalid input, not found, forbidden, and conflict.
 */
```
