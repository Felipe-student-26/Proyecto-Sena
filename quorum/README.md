# QUORUM — Control de asistencia SENA

Sistema de control de asistencia para el SENA (fichas, roles, 2FA, reportes Excel).

**Stack:** Next.js 14 (frontend) + Laravel 12 / PHP 8.2 (API) + MySQL.

## Contenido del paquete

| Carpeta | Contenido |
|---------|-----------|
| `quorum-codigo/quorum-backend` | API Laravel |
| `quorum-codigo/quorum-frontend` | SPA Next.js |
| `Base de datos/quorum.sql` | Dump MySQL con datos de demo |
| `quorum-manuales/` | Presentación y manuales (HTML) |
| `credenciales/credenciales_quorum.txt` | Usuarios de prueba |

## Requisitos

- XAMPP (o equivalente) con **PHP 8.2** y **MySQL 8**
- **Composer 2.x**
- **Node.js 20+** y npm
- Navegador actualizado (Chrome, Edge o Firefox)

No incluye `vendor/` ni `node_modules/`: se instalan con Composer y npm.

## Instalación — Camino A (oficial)

Usar el dump SQL. **No** ejecutar `php artisan migrate --seed` después de importarlo.

### 1. Base de datos

1. Inicia MySQL.
2. Crea una base vacía llamada `quorum`.
3. Importa `Base de datos/quorum.sql` (phpMyAdmin o línea de comandos).

### 2. Backend

```bash
cd quorum-codigo/quorum-backend
copy .env.example .env
composer install
php artisan key:generate
```

En `.env`, para demo local con el dump (usuarios con 2FA ya activado):

```env
TOTP_BYPASS_LOCAL=true
RECAPTCHA_BYPASS_LOCAL=true
```

Luego:

```bash
php artisan serve
```

API: **http://localhost:8000** — comprobar con `GET /api/ping` (debe responder `status: ok`).

La plantilla Excel CPIC ya está en `storage/app/plantilla_asistencia.xlsx`.

### 3. Frontend

```bash
cd quorum-codigo/quorum-frontend
copy .env.example .env.local
npm install
```

En `.env.local`:

```env
NEXT_PUBLIC_RECAPTCHA_BYPASS_LOCAL=true
```

Luego:

```bash
npm run dev
```

App: **http://localhost:3000** (si el puerto está ocupado, Next puede usar 3001).

### 4. Orden de arranque

1. MySQL  
2. `php artisan serve`  
3. `npm run dev`

## Instalación — Camino B (alternativa)

Si **no** usas el dump: crea la BD `quorum` vacía y, en el backend, tras copiar `.env` e instalar dependencias:

```bash
php artisan migrate --seed
php artisan serve
```

Obtienes catálogos SENA + 5 usuarios de prueba (sin las fichas/aprendices extra del dump).  
**No mezcles** dump + `migrate --seed`.

## Usuarios de prueba

Ver `credenciales/credenciales_quorum.txt`.

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | andresfelipeorozcopiedrahita@gmail.com | `Admin123!` |
| Coordinador | sbecerra@sena.edu.co | `Admin123!` |
| Instructor | documentosorozco25@gmail.com | `Admin123!` |
| Gestor | mgomez@sena.edu.co | `Admin123!` |
| Aprendiz | andres@aprendiz.sena.edu.co | `33333333` |

En desarrollo, en `/login` hay un panel «Acceso rápido de pruebas» al hacer scroll.

Con el **dump**, activa los bypass de TOTP y reCAPTCHA (arriba). Sin ellos el staff pedirá 2FA.

## Manuales

Abre `quorum-manuales/index.html` en el navegador (presentación, manual de usuario y técnico).

Más detalle: `quorum-manuales/manual-tecnico.html`.

## Notas

- No envíes `.env` ni `.env.local` con secretos; solo las plantillas `.env.example`.
- No incluyas `node_modules`, `vendor` ni `.next` en el ZIP.
- SMTP (`MAIL_*`) hace falta solo para recuperación de contraseña.
