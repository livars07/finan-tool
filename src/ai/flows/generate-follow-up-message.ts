'use server';
/**
 * @fileOverview An AI assistant that generates professional and personalized follow-up message templates
 * based on the status of a past appointment.
 *
 * - generateFollowUpMessage - A function that handles the follow-up message generation process.
 * - GenerateFollowUpMessageInput - The input type for the generateFollowUpMessage function.
 * - GenerateFollowUpMessageOutput - The return type for the generateFollowUpMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpMessageInputSchema = z.object({
  status: z
    .string()
    .describe(
      "The status of the past appointment (e.g., 'Asistencia', 'No asistencia', 'Continuación en otra cita', 'Reagendó', 'Reembolso', 'Apartado')."
    ),
  clientName: z.string().describe('The name of the client for personalization.'),
  agentName: z
    .string()
    .describe('The name of the sales agent for personalization.'),
});
export type GenerateFollowUpMessageInput = z.infer<
  typeof GenerateFollowUpMessageInputSchema
>;

const GenerateFollowUpMessageOutputSchema = z.object({
  messageTemplate: z.string().describe('A professional and personalized follow-up message template.'),
});
export type GenerateFollowUpMessageOutput = z.infer<
  typeof GenerateFollowUpMessageOutputSchema
>;

export async function generateFollowUpMessage(
  input: GenerateFollowUpMessageInput
): Promise<GenerateFollowUpMessageOutput> {
  return generateFollowUpMessageFlow(input);
}

const generateFollowUpMessagePrompt = ai.definePrompt({
  name: 'generateFollowUpMessagePrompt',
  input: {schema: GenerateFollowUpMessageInputSchema},
  output: {schema: GenerateFollowUpMessageOutputSchema},
  prompt: `Eres un asistente de IA especializado en generar plantillas de mensajes de seguimiento profesionales y personalizados para agentes de ventas de Finanto (créditos hipotecarios).

Genera una plantilla de mensaje de seguimiento basada en el siguiente estado de una cita pasada y los detalles proporcionados. El mensaje debe ser cordial, profesional y adaptado al estado.

Detalles de la Cita:
Estado: {{{status}}}
Nombre del Cliente: {{{clientName}}}
Nombre del Agente: {{{agentName}}}

Considera los siguientes puntos al generar la plantilla:
- 'Apartado': El mensaje debe ser de felicitación por iniciar su patrimonio y agradecer la confianza.
- 'Asistencia': Agradecer el tiempo, resumir brevemente que fue un gusto atenderle y quedar a sus órdenes para el siguiente paso.
- 'No asistencia': Expresar que se le extrañó en la cita y preguntar si desea reprogramar o si hubo algún inconveniente.
- 'Continuación en otra cita': Reforzar los puntos clave vistos y mencionar que se espera con gusto la siguiente sesión para profundizar.
- 'Reagendó': Confirmar la nueva fecha y hora, expresando entusiasmo por la reunión.
- 'Reembolso': Mantener un tono muy profesional y empático, confirmando el trámite y dejando la puerta abierta para el futuro.
- Mantén un tono profesional y amigable.
- Asegúrate de incluir los nombres del cliente y del agente para personalizar el mensaje.

Genera la plantilla de mensaje de seguimiento en español.`,
});

const generateFollowUpMessageFlow = ai.defineFlow(
  {
    name: 'generateFollowUpMessageFlow',
    inputSchema: GenerateFollowUpMessageInputSchema,
    outputSchema: GenerateFollowUpMessageOutputSchema,
  },
  async (input) => {
    const {output} = await generateFollowUpMessagePrompt(input);
    return output!;
  }
);
