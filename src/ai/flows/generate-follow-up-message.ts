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
      "The status of the past appointment (e.g., 'Reagendó', 'Canceló', 'Venta', 'Cita Exitosa')."
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
  prompt: `Eres un asistente de IA especializado en generar plantillas de mensajes de seguimiento profesionales y personalizados para agentes de ventas.

Genera una plantilla de mensaje de seguimiento basada en el siguiente estado de una cita pasada y los detalles proporcionados. El mensaje debe ser cordial, profesional y adaptado al estado.

Detalles de la Cita:
Estado: {{{status}}}
Nombre del Cliente: {{{clientName}}}
Nombre del Agente: {{{agentName}}}

Considera los siguientes puntos al generar la plantilla:
- Si el estado es 'Venta' o 'Cita Exitosa', el mensaje debe ser de agradecimiento y quizás preguntar si tienen alguna otra necesidad.
- Si el estado es 'Reagendó', el mensaje debe confirmar la nueva cita y expresar entusiasmo por la próxima reunión.
- Si el estado es 'Canceló', el mensaje debe expresar comprensión, preguntar si hay algo en lo que se pueda ayudar, y dejar la puerta abierta para futuras oportunidades.
- Mantén un tono profesional y amigable.
- Asegúrate de incluir los nombres del cliente y del agente para personalizar el mensaje.

Aquí tienes un ejemplo de cómo podría ser la salida:
{
  "messageTemplate": "Estimado/a [Nombre del Cliente],\n\nEsperamos que esté muy bien. Queremos agradecerle sinceramente por su tiempo el día [Fecha de la cita]. Fue un placer poder conversar sobre [Tema de la conversación].\n\nEstamos a su disposición para cualquier consulta o información adicional que pueda necesitar. No dude en contactarnos.\n\nAtentamente,\n[Nombre del Agente]"
}

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
