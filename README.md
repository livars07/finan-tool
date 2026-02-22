# Finanto - Gestión Hipotecaria (BETA)

Finanto es un sistema especializado en financiamiento inmobiliario y gestión de prospectos, diseñado para asesores hipotecarios que buscan centralizar su flujo de trabajo en una herramienta ágil y moderna.

## 🚀 Funcionalidades Principales

### 1. Calculadora de Crédito Rápida
*   **Cálculo Automático**: Determina mensualidades y enganches basados en el precio del inmueble.
*   **Parámetros de Negocio**: Configurada con un factor de mensualidad de 0.6982% y un enganche del 3%.
*   **Perfil de Riesgo**: Calcula automáticamente el ingreso mensual recomendado (DTI del 35%).

### 2. Gestión de Citas e Historial
*   **Panel de Control**: Visualización de citas próximas y pasadas con filtros inteligentes.
*   **Buscador Avanzado**: Búsqueda insensible a acentos y flexible (nombres, teléfonos, meses, días).
*   **Estados de Cita**: Seguimiento detallado desde la primera consulta hasta el "Cierre" o "Reembolso".
*   **Confirmación Diaria**: Sistema de confirmación para citas del día de hoy con retroalimentación visual inmediata.

### 3. Asistente de Seguimiento con IA (Genkit)
*   **Generación de Mensajes**: Crea plantillas personalizadas y profesionales basadas en el estado de la cita.
*   **Contexto Inteligente**: Adapta el tono según si fue un "Cierre", "No asistencia", "Reagendó", etc.

### 4. Herramientas de Productividad
*   **Integración WhatsApp**: Botón para copiar datos del cliente en formato listo para enviar por mensaje.
*   **Formateo Automático**: Los números telefónicos se normalizan automáticamente (ej. 664 694 7418).
*   **Interfaz Minimalista**: Diseño optimizado en modo oscuro con scrollbars discretos y tooltips informativos.

## 🛠️ Aspectos Técnicos
*   **Framework**: Next.js 15 (App Router).
*   **Estilos**: Tailwind CSS + ShadCN UI.
*   **IA**: Google Genkit para la generación de contenidos.
*   **Iconos**: Lucide React.
*   **Manejo de Fechas**: Date-fns con soporte localizado para español.

## ⚠️ Alcances y Límites

*   **Persistencia Local (BETA)**: Actualmente, todos los datos se guardan exclusivamente en el **LocalStorage** de tu navegador. 
    *   *Riesgo*: Si limpias los datos del navegador o cambias de dispositivo, la información no se sincronizará automáticamente.
*   **Sin Base de Datos en la Nube**: Esta es una versión funcional para validación. Próximamente se integrará una base de datos real para persistencia multi-dispositivo.
*   **Entorno Seguro**: Aunque los datos están en tu navegador, evita compartir dispositivos con terceros para proteger la información de tus prospectos.

---
*Desarrollado para optimizar la eficiencia en la prospección y cierre de créditos hipotecarios.*