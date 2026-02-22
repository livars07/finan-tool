# **App Name**: CrediCitas Pro

## Core Features:

- Calculadora de Crédito Inmobiliario: Una interfaz interactiva para calcular el precio total del inmueble, enganche y mensualidad usando el sistema francés de amortización.
- Lógica de Recálculo Dinámico: Recalcula automáticamente las variables de precio total, enganche o mensualidad cuando una de ellas es modificada, considerando la tasa anual y el plazo. Incluye reglas para evitar bucles infinitos y definir un enganche por defecto.
- Formateo de Resultados y Limpiar: Muestra todos los resultados monetarios formateados en Pesos Mexicanos (MXN) e incluye un botón para limpiar todos los campos del formulario de la calculadora.
- Formulario de Agendamiento de Citas: Permite registrar citas con campos para Nombre, Número de contacto, Fecha (usando un date picker) y Hora (usando un time picker).
- Listado Dinámico de Próximas Citas: Una tabla que muestra las citas futuras, con el Nombre, Número y la Fecha formateada de manera contextual (Hoy, Mañana, día de la semana, o DD/MM/YYYY) y la Hora.
- Listado de Citas Pasadas con Gestión de Estado: Una tabla que lista las citas anteriores con Nombre, Fecha, Hora y un selector editable para el Estado (Reagendó, Canceló, Venta, Cita Exitosa, Cita Exitosa y Reagendó).
- Asistente AI para Seguimiento de Citas: Una herramienta que, basado en el estado de una cita pasada (p. ej., 'Reagendó', 'Canceló'), sugiere una plantilla de mensaje de seguimiento profesional y personalizado.

## Style Guidelines:

- Esquema oscuro. Color primario: Un azul profundo y confiable (#6CB3E6) que inspira profesionalismo y claridad. Background: Un gris azulado muy oscuro y sutil (#20282B) para un contraste suave y un ambiente concentrado. Accent: Un turquesa vibrante (#13E6E6) para elementos interactivos y llamadas a la acción, que resalte contra el fondo oscuro.
- Headline y cuerpo de texto: 'Inter', un sans-serif grotesco con un estilo moderno y neutro que asegura una excelente legibilidad en todo tipo de datos y contenido.
- Utilizar un conjunto de iconos minimalistas, de estilo outline y geométricos para reflejar el diseño limpio y profesional del dashboard.
- Diseño de dos columnas adaptable y responsivo tipo dashboard, con cada sección (Calculadora y Citas) presentada en tarjetas o paneles distintos para una clara separación. Asegurar amplios márgenes y padding para un aspecto espacioso y organizado, similar a un CRM compacto.
- Transiciones y animaciones sutiles y elegantes al cambiar entre campos, al añadir o actualizar datos en las tablas, y al hacer hover sobre botones o enlaces, manteniendo una experiencia de usuario fluida y refinada.