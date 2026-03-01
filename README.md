# Finanto - Tutorial de Inicio Rápido (v1.1)

Bienvenido a tu nueva herramienta de productividad. Finanto está diseñado para que te veas como un experto frente a tus clientes y no pierdas ni un solo prospecto.

## 🚀 Paso 1: Perfilamiento Profesional (Calculadora)
Cuando tengas un interesado, no adivines números. Usa la **Calculadora Rápida**:
*   **Ingresa el crédito**: El sistema te dará el enganche, la mensualidad y el ingreso mínimo al instante.
*   **Modo Pantalla Completa**: Usa el icono de expansión para mostrarle los números al cliente en una vista limpia y profesional.
*   **Copia y Envía**: Usa el botón "Copiar Resumen" para mandar una ficha técnica impecable por WhatsApp.

## 📅 Paso 2: Control de tu Agenda (Gestor)
No confíes en tu memoria o en papeles sueltos. Registra cada cita:
*   **Botón Registrar**: Anota nombre, teléfono y el motivo (1ra consulta, seguimiento, etc.).
*   **Confirma tu Asistencia**: Antes de salir a la financiera, usa el botón de confirmación en las citas de "Hoy" para asegurar que el cliente asistirá.
*   **Reporte Diario**: Haz clic en "Reporte Diario" para copiar tus estadísticas del día y pegarlas en tu grupo de equipo.

## ✨ Paso 3: El Sello del Cierre
Cuando logres una venta, haz que cuente:
*   **Finalizar Consulta**: Selecciona el estatus "Cierre".
*   **Registro Administrativo**: Al marcar cierre, el sistema te pedirá notas. Anota aquí el Monto Final, la Comisión y la Fecha de Firma.
*   **Historial**: Todas tus ventas y seguimientos quedan guardados en la pestaña "Historial" para que nunca pierdas el hilo de un cliente.

## 🎨 Tips de Personalización
*   **Temas**: Cambia el color del sistema en el icono de la esquina superior. Usa el tema **"Corporativo"** para mostrar la pantalla a tus clientes.
*   **Notas**: El área de notas tiene espacio extendido (300px) para que escribas todo lo que pactaste con el cliente.

---
**Nota de Seguridad**: Tus datos se guardan **solo en este navegador**. No borres el historial ni el caché del navegador para no perder tus registros.

---

# 🛠 Documentación Técnica para Ingenieros e IA

Esta sección describe la arquitectura y capacidades técnicas de **Finanto v1.1** para facilitar el mantenimiento o la integración con otros sistemas.

## 🏗 Stack Tecnológico
- **Framework**: Next.js 15 (App Router).
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS + Shadcn UI (Radix Primitives).
- **Iconografía**: Lucide React.
- **Persistencia**: LocalStorage API (`FINANTO_DATA_V1.1_50SEED`).
- **GenAI**: Google Genkit para generación de mensajes de seguimiento (Gemini 2.5 Flash).

## 📊 Capacidades del Sistema

### 1. Gestión de Datos y CRM
- **Persistencia Local**: Sistema diseñado para operar sin base de datos centralizada, utilizando almacenamiento local persistente.
- **Esquema de Datos**: Interfaz `Appointment` robusta que soporta:
    - Seguimiento de prospectadores externos.
    - Datos financieros de cierre (Montos de crédito, porcentajes de comisión).
    - Gestión de estados de vida del cliente (CRM).
- **Soft Delete**: Implementación de un campo `isArchived` para ocultar registros sin eliminarlos físicamente de la memoria del navegador.

### 2. Motor Financiero e Inteligencia de Negocio
- **Cálculo de Comisiones**: Lógica automatizada basada en el 0.7% del monto de crédito neto, restando el 9% de retención fiscal automáticamente.
- **Algoritmo de Ciclos de Pago**: Proyecta fechas de liquidación basadas en cortes administrativos:
    - Ventas de Domingo a Martes -> Liquidación el viernes de la siguiente semana.
    - Ventas de Miércoles a Sábado -> Liquidación el viernes de la subsiguiente semana.
- **Simulador de Crédito**: Implementación de factores financieros (`BASE_FACTOR: 0.006982`) para proyecciones de mensualidad, gastos notariales (5% est.) y perfilamiento de ingresos (ratio 35%).

### 3. Automatización y Monitoreo (Background Tasks)
- **Monitoreo de Comisiones**: Un motor que se activa a los 15s del inicio de sesión y corre cada 60s, comparando fechas de pago proyectadas contra la fecha actual para lanzar alertas de conciliación.
- **Recordatorios de Asistencia**: Notificaciones de advertencia proactivas para citas del día de hoy no confirmadas.
- **IA Generativa**: Flujos de Genkit para transformar el estado de una cita en un mensaje profesional de WhatsApp adaptado al contexto del cliente.

### 4. Lógica de UI Especializada
- **Regla de los 6 Días**: Lógica de formateo de fechas que evita el uso de descriptores como "Pasado" o "Este" si la fecha está dentro de un rango de 6 días, priorizando la claridad casual.
- **Encabezados Fijos (Sticky)**: Tablas con cabeceras persistentes mediante CSS `sticky` y control de `z-index` para navegación fluida en grandes volúmenes de datos.
- **Jerarquía de Capas**: Manejo estricto de `z-index` para asegurar que las confirmaciones de acción y diálogos de error siempre se superpongan correctamente a los expedientes.

## 📂 Estructura de Archivos Clave
- `src/services/appointment-service.ts`: Lógica central de negocio, cálculos financieros y persistencia.
- `src/hooks/use-appointments.ts`: Hook de estado global para la sincronización de citas y estadísticas.
- `src/ai/flows/`: Definición de procesos de IA para comunicación con el cliente.
- `src/components/calculator/`: Lógica del simulador de crédito hipotecario.
