# 🗓️ Comagro Eventos — Plataforma de Gestión de Eventos

Plataforma web modular, escalable y profesional para gestión de eventos, capacitaciones y lanzamientos corporativos.

---

## 📁 Estructura del Proyecto

```
/WEB DE EVENTOS 2026 - MAYO/
├── login.html              ← Login administrativo (email + password)
├── dashboard.html          ← Dashboard con métricas globales
├── registro.html           ← Formulario público de inscripción (?slug=X)
├── registrados.html        ← Lista de registrados con filtros y export
├── checkin.html            ← Check-in de asistencia manual
├── eventos/
│   ├── index.html          ← Lista de eventos con cards
│   └── crear.html          ← Formulario de creación de eventos
├── assets/
│   ├── css/main.css        ← Design system global
│   └── js/
│       ├── supabase-client.js
│       ├── auth.js
│       └── utils.js
└── database.sql            ← Esquema PostgreSQL completo para Supabase
```

---

## 🚀 Setup Inicial

### 1. Configurar Supabase

1. Ir a [supabase.com](https://supabase.com) y abrir tu proyecto.
2. Ir a **SQL Editor** y ejecutar el archivo `database.sql` completo.
3. El esquema creará automáticamente:
   - Tabla `profiles` (vinculada a `auth.users`)
   - Tabla `events`
   - Tabla `registrations`
   - Vista `event_stats`
   - Todas las políticas RLS
   - Índices de performance

### 2. Crear primer usuario administrador

1. Ir a **Supabase > Authentication > Users > Add user**
2. Crear usuario con email y password.
3. Luego en **SQL Editor** ejecutar:

```sql
UPDATE profiles
SET role = 'admin', full_name = 'Tu Nombre'
WHERE email = 'tu-email@comagro.com.py';
```

### 3. Actualizar credenciales (si son distintas)

Las credenciales de Supabase ya están configuradas. Si cambian, buscar en todos los archivos HTML:

```
SUPABASE_URL = 'https://itylpvuzflqlmmqvdhbz.supabase.co'
SUPABASE_KEY = 'sb_publishable_...'
```

---

## 🌐 URLs del Sistema

| Página | URL | Acceso |
|--------|-----|--------|
| Login | `/login.html` | Público |
| Dashboard | `/dashboard.html` | Admin / Staff |
| Eventos | `/eventos/index.html` | Admin / Staff |
| Crear Evento | `/eventos/crear.html` | Admin / Staff |
| Registrados | `/registrados.html?event=ID` | Admin / Staff |
| Check-in | `/checkin.html?event=ID` | Admin / Staff / Scanner |
| **Formulario Público** | `/registro.html?slug=SLUG` | **Público** |

---

## ✨ Funcionalidades Implementadas

### ✅ Fase 1 — Fundación
- [x] Design System CSS completo (variables, componentes, responsive)
- [x] Login con email/password + Recuperación de contraseña
- [x] Auth guard en todas las páginas privadas
- [x] Dashboard con métricas, gráfico Chart.js, eventos recientes

### ✅ Fase 2 — Eventos
- [x] Lista de eventos con cards, búsqueda y filtros
- [x] Creación de evento con slug auto-generado
- [x] Preview de banner en tiempo real

### ✅ Fase 3 — Registro Público
- [x] Formulario público sin login requerido
- [x] Validación de cupo disponible
- [x] Validación de correo duplicado por evento
- [x] Rate limiting client-side (1 req / 45s)
- [x] Pantalla de confirmación elegante
- [x] Botón "Agregar al calendario" → descarga `.ics`
- [x] Estados: Evento no encontrado / Cerrado / Cupo lleno

### ✅ Fase 4 — Gestión de Registrados
- [x] Tabla con búsqueda, filtros por estado
- [x] Estadísticas en tiempo real
- [x] Modal de edición de registros
- [x] Cambio de estado
- [x] Exportar a **Excel** (SheetJS)

### ✅ Fase 5 — Check-in
- [x] Marcar presencia manual (botón PRESENTE)
- [x] Búsqueda y filtro en tiempo real
- [x] Estadísticas de asistencia
- [x] Estructura preparada para QR futuro

### ✅ Base de Datos
- [x] Esquema PostgreSQL completo
- [x] RLS por roles (admin / staff / scanner)
- [x] Trigger auto-create profile en signup
- [x] Vista `event_stats` con métricas
- [x] Índices de performance

---

## 🔮 Próximas Fases (Roadmap)

### Fase 6 — Panel Admin del Evento
- Panel individual por evento con todos sus datos
- Editar evento
- Copiar URL pública del formulario

### Fase 7 — Reportes Avanzados
- Gráficos interactivos (Chart.js)
- Exportar PDF corporativo (jsPDF)
- Reporte por empresa

### Fase 8 — Funcionalidades Futuras
- [ ] QR Scanner (lectura de cámara)
- [ ] Generación de QR individual por inscripto
- [ ] Envío de correos (Resend / SendGrid)
- [ ] WhatsApp notifications
- [ ] Certificados de participación (PDF)
- [ ] Landing pages por evento
- [ ] Galería de fotos post-evento
- [ ] Múltiples organizaciones (multi-tenant)

---

## 🛡️ Seguridad

| Medida | Estado |
|--------|--------|
| RLS en todas las tablas | ✅ |
| IDs no secuenciales (UUID) | ✅ |
| `short_id` de 6 chars aleatorio | ✅ |
| Sanitización de inputs | ✅ |
| Rate limiting formulario público | ✅ |
| Validación duplicados por evento | ✅ |
| Auth guard en páginas privadas | ✅ |
| XSS: `textContent` vs `innerHTML` | ✅ |

---

## 🎨 Design System

**Colores:**
- Primario: `#1f2f6b` (Azul Comagro)
- Hover: `#2d4299`
- Texto: `#1a1f36` / `#6f7b87`

**Tipografía:**
- Títulos: Montserrat 700/800
- Cuerpo: Inter 400/500/600

**Inspiración:** Notion · Linear · Stripe Dashboard · Vercel
