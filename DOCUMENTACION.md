# RouteOps - Documentación del Sistema

## ¿Qué es RouteOps?

RouteOps es una aplicación web para la **gestión operativa de transporte de buses** entre Chile y Argentina. Diseñada para una empresa con ~32 buses y ~30 conductores, administra viajes diarios (~80 viajes/día) en una horizon de 7 días.

---

## Módulos Principales

### 1. Panel Principal (`/`)
**Archivo:** `app/(dashboard)/page.tsx`

Muestra una vista general de la operación:
- **KPIs**: Total conductores activos, buses disponibles, viajes de hoy, viajes asignados
- **Widget de Frontera**: Estado en tiempo real del Paso Los Libertadores (datos del MOP Chile)
- **Viajes de Hoy**: Listado de viajes programados para el día actual
- **Próximos Viajes**: Viajes de los próximos días
- **Gráficos**: 
  - Viajes por estado (programado, confirmado, en progreso, completado, cancelado)
  - Viajes por tipo (nacional vs internacional)
  - Conductores por estado (activo, inactivo, suspendido)
  - Buses por estado (disponible, en mantenimiento, retirado)

---

### 2. Conductores (`/drivers`)
**Archivos:** `components/drivers/driver-table.tsx`, `driver-columns.tsx`, `driver-filters.tsx`, `driver-status-badge.tsx`

Gestión completa de conductores:
- **Listado**: Tabla con nombre, licencia, teléfono, ubicación base, estado, habilitaciones
- **Búsqueda**: Por nombre o número de licencia
- **Filtros**: Por estado (activo/inactivo/suspendido)
- **Creación/Edición**: Formulario con campos:
  - Nombre, apellido, número de licencia
  - Email, teléfono
  - Ubicación base (ej: "Santiago")
  - Habilitaciones: Internacional/Nacional
  - Fecha de vencimiento de licencia
  - Máximo días por semana
  - Restricciones de ruta
- **Detalles**: Historial de vacaciones, días rojos, restricciones

---

### 3. Buses (`/buses`)
**Archivos:** `components/buses/bus-table.tsx`, `bus-columns.tsx`, `bus-filters.tsx`, `bus-status-badge.tsx`

Gestión de la flota de buses:
- **Listado**: Tabla con patente, marca, modelo, año, capacidad, tipo, estado
- **Búsqueda**: Por patente o marca
- **Filtros**: Por estado (disponible/mantenimiento/retirado/reservado)
- **Creación/Edición**: Formulario con:
  - Patente (única), marca, modelo
  - Año, capacidad (pasajeros)
  - Tipo: Nacional o Internacional
  - Estado: AVAILABLE, IN_MAINTENANCE, RETIRED, RESERVED
- **Mantenimiento**: Historial de mantenciones por bus

---

### 4. Rutas (`/routes`)
**Archivos:** `components/routes/route-table.tsx`, `route-columns.tsx`, `route-stops-editor.tsx`, `route-type-badge.tsx`

Configuración de rutas de viaje:
- **Listado**: Tabla con código, nombre, origen, destino, duración estimada, distancia, tipo
- **Tipos**: Nacional o Internacional
- **Paradas**: Editor de paradas intermedias con:
  - Nombre de la parada
  - Tiempo de desvío (minutos adicionales)

---

### 5. Viajes (`/trips`)
**Archivos:** `components/trips/trip-table.tsx`, `trip-columns.tsx`, `trip-status-badge.tsx`

Programación de viajes individuales:
- **Listado**: Tabla con N° viaje, ruta, fecha, hora salida/llegada, estado
- **Filtros**: Por fecha
- **Creación**: Formulario con:
  - Selección de ruta
  - Fecha y hora de salida
  - Tipo de viaje (hereda de la ruta)
  - Notas adicionales
- **Estados**: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED, CONTINGENCY_AFFECTED, PENDING_REPLACEMENT

---

### 6. Planificación Semanal (`/planning`)
**Archivos:** `components/planning/week-view.tsx`, `day-column.tsx`, `trip-card.tsx`, `assignment-panel.tsx`, `planning-toolbar.tsx`, `conflict-indicator.tsx`

Vista horizonte de 7 días con asignaciones:
- **Vista Semanal**: 7 columnas (lun-dom), cada una con sus viajes
- **Toolbar**: 
  - Navegación por semana (anterior/siguiente)
  - Selector de fecha
  - Filtros: Todos / Sin asignar / Conflictos
  - Estadísticas en tiempo real
- **TripCard**: Muestra viaje con:
  - Ruta (origen → destino)
  - Hora de salida
  - Badge "INTL" si es internacional
  - Avatar del conductor asignado (iniciales)
  - Patente del bus
  - Indicador de conflicto (⚠️)
- **AssignmentPanel** (panel lateral):
  - Se abre al hacer clic en un viaje
  - Muestra detalles del viaje
  - **Dropdown de conductores**: Solo muestra conductores **sin conflicto de horario** (viaje que se superponga)
  - **Dropdown de buses**: Solo muestra buses **sin conflicto de horario** y disponibles
  - Botón para remover asignación

---

### 7. Contingencias (`/contingencies`)
**Archivos:** `components/contingencies/` (7 componentes), `lib/contingency-engine.ts`, API routes

Sistema para manejar imprevistos:
- **Tipos de contingencia**:
  - `DRIVER_ABSENCE`: Ausencia de conductor (enfermedad, personal, etc.)
  - `BUS_BREAKDOWN`: Falla mecánica del bus
  - `ROUTE_DISRUPTION`: Disrupción en la ruta (accidente, cierre, etc.)
  - `DEMAND_SURGE`: Aumento inesperado de demanda
- **Severidad**: CRITICAL, HIGH, MEDIUM, LOW
- **Flujo**:
  1. **Reportar**: Formulario con tipo, severidad, viaje afectado, descripción
  2. **Buscar reemplazos**: El motor calcula conductores/buses disponibles con scoring
  3. **Resolver**: Reasignar, cancelar, retrasar, cubrir con extraboard
- **Métricas**: Total contingencias, activas, resueltas, tiempo promedio de resolución

---

### 8. Extraboard (`/extraboard`)
**Archivos:** `components/extraboard/extraboard-panel.tsx`, `lib/extraboard-manager.ts`, API route

Gestión de conductores de refuerzo:
- **Concepto**: Conductores disponibles para cubrir contingencias o viajes额外
- **Horarios**: 
  - Matutino (06:00 - 14:00)
  - Vespertino (14:00 - 22:00)
  - Nocturno (22:00 - 06:00)
  - Fulltime (06:00 - 22:00)
- **Estados**: AVAILABLE, ON_DUTY, EXHAUSTED, OFF_DUTY
- **Máximo horas**: Por defecto 8 horas por turno
- **Asignación**: Se puede asignar directamente a un viaje desde el panel

---

### 9. Importar (`/import`)
**Archivo:** `app/(dashboard)/import/page.tsx`, `app/api/import/confirm/route.ts`

Importación masiva desde Excel:
- **Tipos de importación**:
  - **Conductores**: firstName*, lastName*, licenseNumber*, email, phone, baseLocation
  - **Buses**: plateNumber*, brand*, model*, year, capacity, busType
  - **Viajes**: routeCode*, scheduledDate*, departureTime*, tripType, notes
- **Proceso**:
  1. Seleccionar tipo de importación
  2. Subir archivo Excel (.xlsx, .xls, .csv)
  3. Vista previa de los datos
  4. Confirmar importación
- **Validaciones**:
  - Campos requeridos (*)
  - Duplicados (licencia/patente ya existe)
  - Rutas inexistentes (para viajes)
- **Resultado**: Muestra éxitos y errores

---

### 10. Reportes (`/reports`)
**Archivo:** `app/(dashboard)/reports/page.tsx`, `lib/pdf-reports.ts`

Generación de reportes PDF:
- **Tipos de reporte**:
  - **Reporte de Viajes**: Listado completo en un período
  - **Listado de Conductores**: Todos los conductores registrados
  - **Inventario de Buses**: Todos los buses de la flota
  - **Plan Semanal**: Vista horizonte de la semana (formato apaisado)
- **Formato**: PDF con tabla, encabezado, fecha de generación

---

### 11. Auditoría (`/audit`)
**Archivos:** `components/audit/audit-table.tsx`, `audit-columns.tsx`, `audit-filters.tsx`

Historial de cambios en el sistema:
- **Registra**: Crear, actualizar, eliminar, asignar, desasignar, cambio de estado, importación
- **Filtros**: Por tipo de entidad (driver, bus, route, trip) y tipo de acción
- **Detalle**: Qué cambió, quién lo hizo, cuándo

---

## APIs Principales

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/drivers` | GET/POST | Listar/crear conductores |
| `/api/drivers/[id]` | GET/PUT/DELETE | Obtener/actualizar/eliminar conductor |
| `/api/buses` | GET/POST | Listar/crear buses |
| `/api/buses/[id]` | GET/PUT/DELETE | Obtener/actualizar/eliminar bus |
| `/api/routes` | GET/POST | Listar/crear rutas |
| `/api/routes/[id]` | GET/PUT/DELETE | Obtener/actualizar/eliminar ruta |
| `/api/trips` | GET/POST | Listar/crear viajes |
| `/api/trips/[id]` | GET/DELETE | Obtener/eliminar viaje |
| `/api/planning` | GET | Datos de planificación semanal |
| `/api/audit` | GET | Historial de auditoría |
| `/api/contingencies` | GET/POST | Listar/crear contingencias |
| `/api/contingencies/[id]` | GET/PUT/DELETE | Obtener/actualizar/eliminar contingencia |
| `/api/contingencies/resolve` | POST | Resolver contingencia |
| `/api/contingencies/stats` | GET | Métricas de contingencias |
| `/api/extraboard` | GET/POST | Listar/crear extraboard |
| `/api/available-resources` | GET | Recursos disponibles para un viaje (filtra conflictos) |
| `/api/border-status` | GET | Estado del Paso Los Libertadores (MOP Chile) |
| `/api/notifications` | GET/POST/PATCH/DELETE | CRUD de notificaciones |
| `/api/import` | POST | Parsear archivo Excel |
| `/api/import/confirm` | POST | Confirmar importación a base de datos |

---

## Motor de Asignación

**Archivo:** `lib/assignments.ts`

Valida si un conductor y bus pueden ser asignados a un viaje:

### Reglas de Error (impiden asignación):
1. Conductor no está activo
2. Bus no está disponible
3. Conductor no habilitado para tipo de viaje (internacional/nacional)
4. Conductor tiene vacaciones en esa fecha
5. Conductor tiene día rojo en esa fecha
6. Conductor tiene ruta restringida
7. **Conflicto de horario - conductor**: Ya tiene un viaje que se superpone
8. **Conflicto de horario - bus**: Ya tiene un viaje que se superpone
9. Período de descanso insuficiente (mínimo configurable por conductor)

### Advertencias (no impiden asignación):
- Conductor alcanza máximo de días por semana

---

## Modelos de Base de Datos

**Archivo:** `prisma/schema.prisma`

### Principales:
- **User**: Usuarios del sistema (admin, planner, operator, viewer)
- **Driver**: Conductores con licencia, habilitaciones, restricciones
- **Bus**: Buses con patente, marca, capacidad, tipo
- **Route**: Rutas con código, origen, destino, paradas, duración
- **Trip**: Viajes programados con fecha, hora, estado
- **TripAssignment**: Asignación conductor-bus-viaje
- **DriverRestriction**: Restricciones por conductor (rutas, descanso, etc.)
- **DriverVacation**: Vacaciones programadas
- **DriverRedDay**: Días rojos (no disponibles)
- **MaintenanceRecord**: Historial de mantención de buses
- **BusReservation**: Reservas de buses
- **AuditLog**: Registro de cambios
- **Contingency**: Incidencias/imprevistos
- **ContingencyAction**: Acciones tomadas para resolver
- **ExtraboardDriver**: Conductores de refuerzo
- **Notification**: Notificaciones in-app

---

## Infraestructura

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL (Prisma ORM)
- **Despliegue**: Docker en Coolify (VPS OVH)
- **Autenticación**: NextAuth.js + Authentik SSO + credenciales fallback
- **Gráficos**: Chart.js (react-chartjs-2)
- **PDFs**: jsPDF + jspdf-autotable
- **Excel**: xlsx (SheetJS)
- **API Externa**: MOP Chile (estado de frontera)

---

## Datos de Prueba

El seed (`prisma/seed.ts`) genera:
- **30 conductores** con licencias, habilitaciones, vacaciones
- **32 buses** con diferentes tipos y estados
- **5 rutas** (Santiago→Mendoza, Valparaíso→San Juan, etc.)
- **7 días de viajes** (~80 viajes/día) con prefijo VIAJE-
- **Usuario admin**: admin@routeops.com / admin123

---

## Notas Técnicas Importantes

### Conflicto de Horario
Un conductor o bus tiene conflicto si:
```
salida_nuevo_viaje < llegada_existente AND llegada_nuevo_viaje > salida_existente
```

### Cálculo de Llegada
Si un viaje no tiene `arrivalTime` calculado:
```
llegada = salida + duración_estimada_ruta (en minutos)
```

### Border Status Widget
- Consulta la API del MOP Chile cada 10 minutos
- Cache de 10 minutos en servidor
- Si el estado cambia a "restricted" o "closed", abre automáticamente el modal de reasignación

### Notificaciones
- Se crean automáticamente cuando hay contingencias
- Se actualizan cada 30 segundos en el frontend
- Badge con contador de no leídas en el topbar
